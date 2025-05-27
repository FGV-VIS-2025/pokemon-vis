export async function getRegions(){
    const data = await d3.csv('../data/region_names.csv', d => ({
        region_id: +d.region_id,
        local_lan_id: +d.local_language_id,
        name: d.name
    }));

    return data;
}

export async function getLocationsByRegionId(regionId) {
    const location_data = await d3.csv('../data/locations.csv', d => ({
        location_id: +d.id,
        location_ident: d.identifier,
        region_id: +d.region_id
    }));

    const location_names_data = await d3.csv('../data/location_names.csv', d => ({
        location_id: +d.location_id,
        local_language_id: +d.local_language_id,
        location_name: d.name
    }));

    const filteredLocations = location_data.filter(loc => loc.region_id === +regionId);
    const filteredLocationNames = location_names_data.filter(name => name.local_language_id === 9);

    const nameMap = new Map(
        filteredLocationNames.map(name => [name.location_id, name.location_name])
    );

    const joinedLocations = filteredLocations.map(loc => ({
        ...loc,
        location_name: nameMap.get(loc.location_id) || ""
    }));

    return joinedLocations;
}

export async function getLocationAreaByLocation(locationId) {
    const locationAreaData = await d3.csv('../data/location_areas.csv', d => ({
        locationAreaId: +d.id,
        locationId: +d.location_id,
        gameIndex: +d.game_index,
        identifier: d.identifier
    }));

    const filteredLocationAreas = locationAreaData.filter(loc => loc.locationId === +locationId);

    return filteredLocationAreas;
}

export async function getPokemonsIdByLocationAreaId(locationAreaId){
    const encounter = await d3.csv('../data/encounters.csv', d => ({
        id: +d.id,
        version_id: +d.version_id,
        location_area_id: +d.location_area_id,
        pokemon_id: +d.pokemon_id,
        min_level: +d.min_level,
        max_level: +d.max_level
    }));

    const filteredEncounters = encounter.filter(loc => loc.location_area_id === +locationAreaId);

    const pokemonsArray = await d3.csv('../data/pokemon_species_names.csv', d => ({
        pokemon_id: +d.pokemon_species_id,
        language_id: +d.local_language_id,
        name: d.name,
        genus: d.genus,
    }));

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

    const typesArray = await d3.csv('../data/types.csv', d => ({
        type_id: +d.id,
        name: d.identifier,
        generation_id: +d.generation_id,
        damage_class_id: +d.damage_class_id,
    }));

    const pokemonsTypeArray = await d3.csv('../data/pokemon_types.csv', d => ({
        pokemon_id: +d.pokemon_id,
        type_id: +d.type_id,
        slot: +d.slot,
    }));

    const typeDetailsMap = new Map();
    typesArray.forEach(type => {
        typeDetailsMap.set(type.type_id, {
            type_name: type.name, // Renamed 'name' to 'type_name' to avoid conflict
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

    // --- Lógica para agrupar e calcular min/max levels ---
    const uniquePokemonsMap = new Map();

    mergedData.forEach(data => {
        const pokemonId = data.pokemon_id;

        if (!uniquePokemonsMap.has(pokemonId)) {
            // Se for a primeira vez que vemos este Pokémon, inicialize
            const typesForPokemon = pokemonTypesGrouped.get(pokemonId) || [];
            uniquePokemonsMap.set(pokemonId, {
                pokemon_id: pokemonId,
                name: data.name,
                genus: data.genus,
                language_id: data.language_id,
                types: typesForPokemon,
                encounters: [], // Array para armazenar todos os detalhes de encontro
                overall_min_level: Infinity, // Inicializa com valores extremos
                overall_max_level: -Infinity
            });
        }

        const currentPokemon = uniquePokemonsMap.get(pokemonId);

        // Adicionar os detalhes específicos deste encontro ao array de encontros
        currentPokemon.encounters.push({
            id: data.id,
            version_id: data.version_id,
            location_area_id: data.location_area_id,
            min_level: data.min_level,
            max_level: data.max_level
        });

        // Atualizar o overall_min_level e overall_max_level
        currentPokemon.overall_min_level = Math.min(currentPokemon.overall_min_level, data.min_level);
        currentPokemon.overall_max_level = Math.max(currentPokemon.overall_max_level, data.max_level);
    });

    const uniquePokemons = Array.from(uniquePokemonsMap.values());

    uniquePokemons.sort((a, b) => a.name.localeCompare(b.name));
    uniquePokemons.sort((a, b) => a.types[0].type_name.localeCompare(b.types[0].type_name));

    return uniquePokemons;
}