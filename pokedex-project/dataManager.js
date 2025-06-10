const csvCache = new Map();
async function loadCsv(path, parser) {
    if (!csvCache.has(path)) {
        csvCache.set(path, d3.csv(path, parser));
    }
    return csvCache.get(path);
}

const locationsCacheByRegionName = new Map();
const locationAreasCache = new Map();
const regionIdCacheByName = new Map();
const locationIdCacheByName = new Map();
const pokemonsByAreaCache = new Map();
let allPokemonsPromise;

export const gameRegionVersions = {
    "Kanto": [1, 2, 3],
    "Johto": [4, 5, 6],
    "Hoenn": [7, 8, 9],
    "Sinnoh": [12, 13, 14],
    "Unova": [17, 18, 21, 22],
    "Kalos": [23, 24],
}

export async function getLocationsByRegionName(regionName) {
    if (locationsCacheByRegionName.has(regionName)) {
        return locationsCacheByRegionName.get(regionName);
    }

    const [regions, locationData, locationNamesData] = await Promise.all([
        loadCsv('../data/region_names.csv', d => ({
            region_id: +d.region_id,
            local_language_id: +d.local_language_id,
            name: d.name
        })),
        loadCsv('../data/locations.csv', d => ({
            id: +d.id,
            location_id: +d.id,
            location_ident: d.identifier,
            region_id: +d.region_id
        })),
        loadCsv('../data/location_names.csv', d => ({
            location_id: +d.location_id,
            local_language_id: +d.local_language_id,
            location_name: d.name
        }))
    ]);

    const regionEntry = regions.find(r => r.name.toLowerCase() === regionName.toLowerCase() && r.local_language_id === 9);
    if (!regionEntry) {
        throw new Error(`Região "${regionName}" não encontrada.`);
    }

    const regionId = regionEntry.region_id;

    const filteredLocations = locationData.filter(l => l.region_id === regionId);

    const namesMap = new Map(
        locationNamesData
            .filter(n => n.local_language_id === 9)
            .map(n => [n.location_id, n.location_name])
    );

    const result = filteredLocations.map(l => ({
        ...l,
        location_name: namesMap.get(l.location_id) || ''
    }));

    locationsCacheByRegionName.set(regionName, result);
    return result;
}

export async function getLocationAreaByLocation(locationId) {
    if (!locationId) {
        console.warn("ID de localização inválido fornecido");
        return [];
    }

    // Converter para número se for string
    const numericLocationId = +locationId;

    if (isNaN(numericLocationId)) {
        console.warn(`ID de localização inválido: ${locationId}`);
        return [];
    }

    if (locationAreasCache.has(numericLocationId)) {
        return locationAreasCache.get(numericLocationId);
    }

    try {
        const data = await loadCsv('../data/location_areas.csv', d => ({
            locationAreaId: +d.id,
            locationId: +d.location_id,
            gameIndex: +d.game_index,
            identifier: d.identifier
        }));

        const result = data.filter(l => l.locationId === numericLocationId);
        locationAreasCache.set(numericLocationId, result);
        return result;
    } catch (error) {
        console.error(`Erro ao carregar áreas de localização: ${error.message}`);
        return [];
    }
}

export async function getRegionIdByName(regionName) {
    if (regionIdCacheByName.has(regionName)) {
        return regionIdCacheByName.get(regionName);
    }

    const regions = await loadCsv('../data/region_names.csv', d => ({
        region_id: +d.region_id,
        local_language_id: +d.local_language_id,
        name: d.name
    }));

    const regionEntry = regions.find(
        r => r.name.toLowerCase() === regionName.toLowerCase() && r.local_language_id === 9
    );

    if (!regionEntry) {
        throw new Error(`Região "${regionName}" não encontrada.`);
    }

    const regionId = regionEntry.region_id;
    regionIdCacheByName.set(regionName, regionId);
    return regionId;
}

export async function getLocationIdByName(locationName) {
    if (locationIdCacheByName.has(locationName)) {
        return locationIdCacheByName.get(locationName);
    }

    const locationNamesData = await loadCsv('../data/location_names.csv', d => ({
        location_id: +d.location_id,
        local_language_id: +d.local_language_id,
        location_name: d.name
    }));

    const locationEntry = locationNamesData.find(
        l => l.location_name.toLowerCase() === locationName.toLowerCase() && l.local_language_id === 9
    );

    if (!locationEntry) {
        throw new Error(`Localização "${locationName}" não encontrada.`);
    }

    const locationId = locationEntry.location_id;
    locationIdCacheByName.set(locationName, locationId);
    return locationId;
}

export async function getPokemonsByMultipleLocationAreas(locationAreas, region) {
    // Verificar se o array de áreas de localização é válido
    if (!locationAreas || locationAreas.length === 0) {
        console.warn("Nenhuma área de localização fornecida para busca de pokémons.");
        return [];
    }

    // Obter localizações válidas da região
    const locationsInRegion = await getLocationsByRegionName(region);
    const validLocationIds = new Set(locationsInRegion.map(loc => loc.location_id));

    // Verificar se as áreas pertencem à região correta
    const validLocationAreas = locationAreas.filter(area => validLocationIds.has(area.locationId));

    if (validLocationAreas.length === 0) {
        console.warn(`Nenhuma área válida encontrada para a região ${region}`);
        return [];
    }

    const allLocationAreaIds = validLocationAreas.map(loc => loc.locationAreaId);
    const key = `${region}-${allLocationAreaIds.sort().join(',')}`;

    if (pokemonsByAreaCache.has(key)) return pokemonsByAreaCache.get(key);

    const validVersionIds = gameRegionVersions[region];

    // Verificar se a região é válida
    if (!validVersionIds) {
        console.warn(`Região inválida: ${region}`);
        return [];
    }

    // Carregamento único dos CSVs
    const [encounter, pokemonsArray, typesArray, pokemonsTypeArray, pokemonsSpeciesArray, pokemonsArray2, finalStats] = await Promise.all([
        loadCsv('../data/encounters.csv', d => ({
            id: +d.id,
            version_id: +d.version_id,
            location_area_id: +d.location_area_id,
            pokemon_id: +d.pokemon_id,
            min_level: +d.min_level,
            max_level: +d.max_level
        })),
        loadCsv('../data/pokemon_species_names.csv', d => ({
            pokemon_id: +d.pokemon_species_id,
            language_id: +d.local_language_id,
            name: d.name,
            genus: d.genus
        })),
        loadCsv('../data/types.csv', d => ({
            type_id: +d.id,
            name: d.identifier
        })),
        loadCsv('../data/pokemon_types.csv', d => ({
            pokemon_id: +d.pokemon_id,
            type_id: +d.type_id,
            slot: +d.slot
        })),
        loadCsv('../data/pokemon_species.csv', d => ({
            pokemon_id: +d.id,
            identifier: d.identifier,
            evolution_chain_id: +d.evolution_chain_id,
            capture_rate: +d.capture_rate,
            base_happiness: +d.base_happiness,
            is_baby: +d.is_baby,
            is_legendary: +d.is_legendary,
            is_mythical: +d.is_mythical
        })),
        loadCsv('../data/pokemon.csv', d => ({
            pokemon_id: +d.id,
            height: +d.height,
            weight: +d.weight,
            base_experience: +d.base_experience
        })),
        loadCsv('../data/pokemon_stats_clean.csv', d => ({
            Pokemon_Id: +d.Pokemon_Id,
            Hp_Stat: +d.Hp_Stat,
            Attack_Stat: +d.Attack_Stat,
            Defense_Stat: +d.Defense_Stat,
            Special_Attack_Stat: +d.Special_Attack_Stat,
            Special_Defense_Stat: +d.Special_Defense_Stat,
            Speed_Stat: +d.Speed_Stat
        }))
    ]);

    // Filtrar encontros válidos
    const filteredEncounters = encounter.filter(
        loc =>
            allLocationAreaIds.includes(loc.location_area_id) &&
            validVersionIds.includes(loc.version_id)
    );

    // Filtrar pokémons por idioma (inglês)
    const filteredPokemons = pokemonsArray.filter(loc => loc.language_id === 9);

    // Criar mapa de detalhes dos pokémons
    const pokemonDetailsMap = new Map();
    filteredPokemons.forEach(pokemon => {
        pokemonDetailsMap.set(pokemon.pokemon_id, {
            name: pokemon.name,
            genus: pokemon.genus
        });
    });

    // Criar mapa de tipos
    const typeDetailsMap = new Map();
    typesArray.forEach(type => {
        typeDetailsMap.set(type.type_id, {
            type_name: type.name
        });
    });

    // Organizar tipos dos pokémons
    const pokemonTypesMap = new Map();
    pokemonsTypeArray.forEach(pt => {
        if (!pokemonTypesMap.has(pt.pokemon_id)) {
            pokemonTypesMap.set(pt.pokemon_id, []);
        }
        const typeDetails = typeDetailsMap.get(pt.type_id);
        if (typeDetails) {
            pokemonTypesMap.get(pt.pokemon_id).push({
                slot: pt.slot,
                type_name: typeDetails.type_name
            });
        }
    });

    // Agrupar pokémons únicos com seus detalhes
    const uniquePokemonsMap = new Map();
    filteredEncounters.forEach(encounter => {
        if (!uniquePokemonsMap.has(encounter.pokemon_id)) {
            const pokemonDetails = pokemonDetailsMap.get(encounter.pokemon_id);
            const types = pokemonTypesMap.get(encounter.pokemon_id) || [];
            uniquePokemonsMap.set(encounter.pokemon_id, {
                pokemon_id: encounter.pokemon_id,
                name: pokemonDetails?.name || 'Unknown',
                genus: pokemonDetails?.genus || '',
                types: types.sort((a, b) => a.slot - b.slot),
                min_level: Math.min(encounter.min_level, uniquePokemonsMap.get(encounter.pokemon_id)?.min_level || Infinity),
                max_level: Math.max(encounter.max_level, uniquePokemonsMap.get(encounter.pokemon_id)?.max_level || -Infinity)
            });
        }
    });

    // Criar mapas auxiliares para outras informações
    const speciesMap = new Map(pokemonsSpeciesArray.map(species => [species.pokemon_id, species]));
    const pokemonsMap2 = new Map(pokemonsArray2.map(p => [p.pokemon_id, p]));
    const statsMap = new Map(finalStats.map(p => [p.Pokemon_Id, p]));

    // Combinar todas as informações
    const final = Array.from(uniquePokemonsMap.values())
        .map(pokemon => ({
            ...pokemon,
            ...(speciesMap.get(pokemon.pokemon_id) || {}),
            ...(pokemonsMap2.get(pokemon.pokemon_id) || {}),
            ...(statsMap.get(pokemon.pokemon_id) || {})
        }))
        .sort((a, b) => {
            // Ordenar primeiro por tipo principal, depois por nome
            const typeA = a.types[0]?.type_name || '';
            const typeB = b.types[0]?.type_name || '';
            if (typeA !== typeB) return typeA.localeCompare(typeB);
            return a.name.localeCompare(b.name);
        });

    pokemonsByAreaCache.set(key, final);
    return final;
}

export async function getAllLocationsPokemonCount(regionName) {
    // Obter todas as localizações da região
    const locations = await getLocationsByRegionName(regionName);

    // Criar um Set com os IDs das localizações válidas para esta região
    const validLocationIds = new Set(locations.map(loc => loc.location_id));

    // Carregar dados de encontros e versões
    const validVersionIds = gameRegionVersions[regionName];
    const [encounters, locationAreas] = await Promise.all([
        loadCsv('../data/encounters.csv', d => ({
            id: +d.id,
            version_id: +d.version_id,
            location_area_id: +d.location_area_id,
            pokemon_id: +d.pokemon_id
        })),
        loadCsv('../data/location_areas.csv', d => ({
            locationAreaId: +d.id,
            locationId: +d.location_id
        }))
    ]);

    // Criar mapeamento de área para localização
    const areaToLocationMap = new Map();
    locationAreas.forEach(area => {
        // Só mapear áreas que pertencem a localizações desta região
        if (validLocationIds.has(area.locationId)) {
            areaToLocationMap.set(area.locationAreaId, area.locationId);
        }
    });

    // Filtrar encontros válidos para a região atual
    const validEncounters = encounters.filter(enc => {
        const locationId = areaToLocationMap.get(enc.location_area_id);
        // Verificar se a localização pertence à região atual E se a versão do jogo é válida
        return validLocationIds.has(locationId) && validVersionIds.includes(enc.version_id);
    });

    // Contar pokémons únicos por localização
    const pokemonsByLocation = new Map();

    validEncounters.forEach(enc => {
        const locationId = areaToLocationMap.get(enc.location_area_id);
        if (!pokemonsByLocation.has(locationId)) {
            pokemonsByLocation.set(locationId, new Set());
        }
        pokemonsByLocation.get(locationId).add(enc.pokemon_id);
    });

    // Converter para array de resultados
    const result = locations.map(location => ({
        locationId: location.location_id,
        count: (pokemonsByLocation.get(location.location_id)?.size || 0)
    }));

    return result;
}

export async function getAllPokemons() {
    if (allPokemonsPromise) return allPokemonsPromise;
    allPokemonsPromise = (async () => {
        const [encounters, pokemonsArray, typesArray, pokemonsTypeArray, speciesArray, pokemonsCsv, stats] = await Promise.all([
            loadCsv('../data/encounters.csv', d => ({ id: +d.id, version_id: +d.version_id, location_area_id: +d.location_area_id, pokemon_id: +d.pokemon_id, min_level: +d.min_level, max_level: +d.max_level })),
            loadCsv('../data/pokemon_species_names.csv', d => ({ pokemon_id: +d.pokemon_species_id, language_id: +d.local_language_id, name: d.name, genus: d.genus })),
            loadCsv('../data/types.csv', d => ({ type_id: +d.id, name: d.identifier, generation_id: +d.generation_id, damage_class_id: +d.damage_class_id })),
            loadCsv('../data/pokemon_types.csv', d => ({ pokemon_id: +d.pokemon_id, type_id: +d.type_id, slot: +d.slot })),
            loadCsv('../data/pokemon_species.csv', d => ({ pokemon_id: +d.id, identifier: d.identifier, generation_id: +d.generation_id, evolves_from_species_id: +d.evolves_from_species_id, evolution_chain_id: +d.evolution_chain_id, color_id: +d.color_id, shape_id: +d.shape_id, habitat_id: +d.habitat_id, gender_rate: +d.gender_rate, capture_rate: +d.capture_rate, base_happiness: +d.base_happiness, is_baby: +d.is_baby, hatch_counter: +d.hatch_counter, has_gender_differences: +d.has_gender_differences, growth_rate_id: +d.growth_rate_id, forms_switchable: +d.forms_switchable, is_legendary: +d.is_legendary, is_mythical: +d.is_mythical, order: +d.order, conquest_order: +d.conquest_order })),
            loadCsv('../data/pokemon.csv', d => ({ pokemon_id: +d.id, identifier: d.identifier, height: +d.height, weight: +d.weight, base_experience: +d.base_experience, order: +d.order, is_default: +d.is_default })),
            loadCsv('../data/pokemon_stats_clean.csv', d => ({ Pokemon_Id: +d.Pokemon_Id, Hp_Stat: +d.Hp_Stat, Hp_Effort: +d.Hp_Effort, Attack_Stat: +d.Attack_Stat, Attack_Effort: +d.Attack_Effort, Defense_Stat: +d.Defense_Stat, Defense_Effort: +d.Defense_Effort, Special_Attack_Stat: +d.Special_Attack_Stat, Special_Attack_Effort: +d.Special_Attack_Effort, Special_Defense_Stat: +d.Special_Defense_Stat, Special_Defense_Effort: +d.Special_Defense_Effort, Speed_Stat: +d.Speed_Stat, Speed_Effort: +d.Speed_Effort }))
        ]);

        const filteredPokemons = pokemonsArray.filter(p => p.language_id === 9);
        const pokemonDetailsMap = new Map();
        filteredPokemons.forEach(pokemon => {
            pokemonDetailsMap.set(pokemon.pokemon_id, {
                name: pokemon.name,
                genus: pokemon.genus,
                language_id: pokemon.language_id
            });
        });

        const mergedData = encounters.map(enc => ({
            ...enc,
            ...(pokemonDetailsMap.get(enc.pokemon_id) || {})
        }));

        const typeDetailsMap = new Map();
        typesArray.forEach(type => {
            typeDetailsMap.set(type.type_id, {
                type_name: type.name,
                generation_id: type.generation_id,
                damage_class_id: type.damage_class_id
            });
        });
        const mergedPokemonTypes = pokemonsTypeArray.map(pokemonType => ({
            ...pokemonType,
            ...(typeDetailsMap.get(pokemonType.type_id) || {})
        }));
        const pokemonTypesGrouped = new Map();
        mergedPokemonTypes.forEach(pt => {
            if (!pokemonTypesGrouped.has(pt.pokemon_id)) {
                pokemonTypesGrouped.set(pt.pokemon_id, []);
            }
            const existingSlot = pokemonTypesGrouped.get(pt.pokemon_id).find(t => t.slot === pt.slot);
            if (!existingSlot) {
                pokemonTypesGrouped.get(pt.pokemon_id).push({
                    type_id: pt.type_id,
                    slot: pt.slot,
                    type_name: pt.type_name,
                    generation_id: pt.generation_id,
                    damage_class_id: pt.damage_class_id
                });
            }
        });

        const uniquePokemonsMap = new Map();
        mergedData.forEach(data => {
            const pokemonId = data.pokemon_id;
            if (!uniquePokemonsMap.has(pokemonId)) {
                const typesForPokemon = pokemonTypesGrouped.get(pokemonId) || [];
                uniquePokemonsMap.set(pokemonId, {
                    pokemon_id: pokemonId,
                    name: data.name,
                    genus: data.genus,
                    language_id: data.language_id,
                    types: typesForPokemon,
                    encounters: [],
                    overall_min_level: Infinity,
                    overall_max_level: -Infinity
                });
            }
            const currentPokemon = uniquePokemonsMap.get(pokemonId);
            currentPokemon.encounters.push({
                id: data.id,
                version_id: data.version_id,
                location_area_id: data.location_area_id,
                min_level: data.min_level,
                max_level: data.max_level
            });
            currentPokemon.overall_min_level = Math.min(currentPokemon.overall_min_level, data.min_level);
            currentPokemon.overall_max_level = Math.max(currentPokemon.overall_max_level, data.max_level);
        });

        const uniquePokemons = Array.from(uniquePokemonsMap.values());

        const speciesMap = new Map(
            speciesArray.map(species => [species.pokemon_id, species])
        );

        const mergedPokemons = uniquePokemons.map(pokemon => ({
            ...pokemon,
            ...(speciesMap.get(pokemon.pokemon_id) || {})
        }));

        const pokemonsMap2 = new Map(
            pokemonsCsv.map(pokemons => [pokemons.pokemon_id, pokemons])
        );

        const mergedPokemons2 = mergedPokemons.map(pokemon => ({
            ...pokemon,
            ...(pokemonsMap2.get(pokemon.pokemon_id) || {})
        }));

        const pokemonsMap3 = new Map(
            stats.map(pokemons => [pokemons.Pokemon_Id, pokemons])
        );

        let mergedPokemons3 = mergedPokemons2.map(p => ({
            ...p,
            ...(pokemonsMap3.get(p.pokemon_id) || {})
        }));

        // Ordena por nome e tipo
        mergedPokemons3 = mergedPokemons3
            .filter(p => p.name && p.name.trim() !== '')
            .sort((a, b) => a.name.localeCompare(b.name))
            .sort((a, b) => (a.types[0]?.type_name || '').localeCompare(b.types[0]?.type_name || ''));


        return mergedPokemons3;
    })();
    return allPokemonsPromise;
}
