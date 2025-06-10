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
    if (locationAreasCache.has(locationId)) return locationAreasCache.get(locationId);
    const data = await loadCsv('../data/location_areas.csv', d => ({ locationAreaId: +d.id, locationId: +d.location_id, gameIndex: +d.game_index, identifier: d.identifier }));
    const result = data.filter(l => l.locationId === +locationId);
    locationAreasCache.set(locationId, result);
    return result;
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
    const allLocationAreaIds = locationAreas.map(loc => loc.locationAreaId);
    const key = allLocationAreaIds.sort().join(',');

    if (pokemonsByAreaCache.has(key)) return pokemonsByAreaCache.get(key);

    const validVersionIds = gameRegionVersions[region];

    // Carregamento único dos CSVs
    const [encounter, pokemonsArray, typesArray, pokemonsTypeArray, pokemonsSpeciesArray, pokemonsArray2, finalStats] = await Promise.all([
        loadCsv('../data/encounters.csv', d => ({ id: +d.id, version_id: +d.version_id, location_area_id: +d.location_area_id, pokemon_id: +d.pokemon_id, min_level: +d.min_level, max_level: +d.max_level })),
        loadCsv('../data/pokemon_species_names.csv', d => ({ pokemon_id: +d.pokemon_species_id, language_id: +d.local_language_id, name: d.name, genus: d.genus })),
        loadCsv('../data/types.csv', d => ({ type_id: +d.id, name: d.identifier, generation_id: +d.generation_id, damage_class_id: +d.damage_class_id })),
        loadCsv('../data/pokemon_types.csv', d => ({ pokemon_id: +d.pokemon_id, type_id: +d.type_id, slot: +d.slot })),
        loadCsv('../data/pokemon_species.csv', d => ({
            pokemon_id: +d.id,
            identifier: d.identifier,
            generation_id: +d.generation_id,
            evolves_from_species_id: +d.evolves_from_species_id,
            evolution_chain_id: +d.evolution_chain_id,
            color_id: +d.color_id,
            shape_id: +d.shape_id,
            habitat_id: +d.habitat_id,
            gender_rate: +d.gender_rate,
            capture_rate: +d.capture_rate,
            base_happiness: +d.base_happiness,
            is_baby: +d.is_baby,
            hatch_counter: +d.hatch_counter,
            has_gender_differences: +d.has_gender_differences,
            growth_rate_id: +d.growth_rate_id,
            forms_switchable: +d.forms_switchable,
            is_legendary: +d.is_legendary,
            is_mythical: +d.is_mythical,
            order: +d.order,
            conquest_order: +d.conquest_order
        })),
        loadCsv('../data/pokemon.csv', d => ({
            pokemon_id: +d.id,
            identifier: d.identifier,
            height: +d.height,
            weight: +d.weight,
            base_experience: +d.base_experience,
            order: +d.order,
            is_default: +d.is_default,
        })),
        loadCsv('../data/pokemon_stats_clean.csv', d => ({
            Pokemon_Id: +d.Pokemon_Id,
            Hp_Stat: +d.Hp_Stat,
            Hp_Effort: +d.Hp_Effort,
            Attack_Stat: +d.Attack_Stat,
            Attack_Effort: +d.Attack_Effort,
            Defense_Stat: +d.Defense_Stat,
            Defense_Effort: +d.Defense_Effort,
            Special_Attack_Stat: +d.Special_Attack_Stat,
            Special_Attack_Effort: +d.Special_Attack_Effort,
            Special_Defense_Stat: +d.Special_Defense_Stat,
            Special_Defense_Effort: +d.Special_Defense_Effort,
            Speed_Stat: +d.Speed_Stat,
            Speed_Effort: +d.Speed_Effort
        }))
    ]);

    const filteredEncounters = encounter.filter(
        loc =>
            allLocationAreaIds.includes(loc.location_area_id) &&
            validVersionIds.includes(loc.version_id)
    );

    const filteredPokemons = pokemonsArray.filter(loc => loc.language_id === 9);

    const pokemonDetailsMap = new Map();
    filteredPokemons.forEach(pokemon => {
        pokemonDetailsMap.set(pokemon.pokemon_id, {
            name: pokemon.name,
            genus: pokemon.genus,
            language_id: pokemon.language_id
        });
    });

    const mergedData = filteredEncounters.map(enc => {
        const pokemonDetails = pokemonDetailsMap.get(enc.pokemon_id);
        return {
            ...enc,
            ...(pokemonDetails || {})
        };
    });

    const typeDetailsMap = new Map();
    typesArray.forEach(type => {
        typeDetailsMap.set(type.type_id, {
            type_name: type.name,
            generation_id: +type.generation_id,
            damage_class_id: +type.damage_class_id
        });
    });

    const mergedPokemonTypes = pokemonsTypeArray.map(pokemonType => {
        const typeDetails = typeDetailsMap.get(pokemonType.type_id);
        return {
            ...pokemonType,
            ...(typeDetails || {})
        };
    });

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

    // Agrupamento de Pokémon únicos
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

        const current = uniquePokemonsMap.get(pokemonId);
        current.encounters.push({
            id: data.id,
            version_id: data.version_id,
            location_area_id: data.location_area_id,
            min_level: data.min_level,
            max_level: data.max_level
        });

        current.overall_min_level = Math.min(current.overall_min_level, data.min_level);
        current.overall_max_level = Math.max(current.overall_max_level, data.max_level);
    });

    // Merge com outras informações
    const speciesMap = new Map(pokemonsSpeciesArray.map(species => [species.pokemon_id, species]));
    const pokemonsMap2 = new Map(pokemonsArray2.map(p => [p.pokemon_id, p]));
    const pokemonsMap3 = new Map(finalStats.map(p => [p.Pokemon_Id, p]));

    const final = Array.from(uniquePokemonsMap.values()).map(pokemon => ({
        ...pokemon,
        ...(speciesMap.get(pokemon.pokemon_id) || {}),
        ...(pokemonsMap2.get(pokemon.pokemon_id) || {}),
        ...(pokemonsMap3.get(pokemon.pokemon_id) || {})
    }));

    // Ordenação final
    final
        .sort((a, b) => a.name.localeCompare(b.name))
        .sort((a, b) => a.types[0].type_name.localeCompare(b.types[0].type_name));

    pokemonsByAreaCache.set(key, final);
    return final;
}

export async function getAllLocationsPokemonCount(regionName) {
    // Obter todas as localizações da região
    const locations = await getLocationsByRegionName(regionName);

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
        areaToLocationMap.set(area.locationAreaId, area.locationId);
    });

    // Filtrar encontros válidos para a região atual
    const validEncounters = encounters.filter(enc => {
        const locationId = areaToLocationMap.get(enc.location_area_id);
        const locationInRegion = locations.some(loc => loc.location_id === locationId);
        return locationInRegion && validVersionIds.includes(enc.version_id);
    });

    // Contar pokémons únicos por localização
    const pokemonsByLocation = new Map();

    validEncounters.forEach(enc => {
        const locationId = areaToLocationMap.get(enc.location_area_id);
        if (!locationId) return;

        if (!pokemonsByLocation.has(locationId)) {
            pokemonsByLocation.set(locationId, new Set());
        }

        pokemonsByLocation.get(locationId).add(enc.pokemon_id);
    });

    // Converter para array de resultados
    const result = Array.from(pokemonsByLocation.entries()).map(([locationId, pokemonSet]) => ({
        locationId,
        count: pokemonSet.size
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
