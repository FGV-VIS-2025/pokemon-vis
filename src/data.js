export async function getRegions() {
    const data = await d3.csv('/data/region_names.csv', d => ({
        region_id: +d.region_id,
        local_lan_id: +d.local_language_id,
        name: d.name
    }));

    return data;
}

export async function getLocationsByRegionId(regionId) {
    const location_data = await d3.csv('/data/locations.csv', d => ({
        location_id: +d.id,
        location_ident: d.identifier,
        region_id: +d.region_id
    }));

    const location_names_data = await d3.csv('/data/location_names.csv', d => ({
        location_id: +d.local_language_id,
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
    const locationAreaData = await d3.csv('/data/location_areas.csv', d => ({
        locationAreaId: +d.id,
        locationId: +d.location_id,
        gameIndex: +d.game_index,
        identifier: d.identifier
    }));

    const filteredLocationAreas = locationAreaData.filter(loc => loc.locationId === +locationId);

    return filteredLocationAreas;
}

export async function getPokemonsIdByLocationAreaId(locationAreaId) {
    const encounter = await d3.csv('/data/encounters.csv', d => ({
        id: +d.id,
        version_id: +d.version_id,
        location_area_id: +d.location_area_id,
        pokemon_id: +d.pokemon_id,
        min_level: +d.min_level,
        max_level: +d.max_level
    }));

    const filteredEncounters = encounter.filter(loc => loc.location_area_id === +locationAreaId);

    const pokemonsArray = await d3.csv('/data/pokemon_species_names.csv', d => ({
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

    const typesArray = await d3.csv('/data/types.csv', d => ({
        type_id: +d.id,
        name: d.identifier,
        generation_id: +d.generation_id,
        damage_class_id: +d.damage_class_id,
    }));

    const pokemonsTypeArray = await d3.csv('/data/pokemon_types.csv', d => ({
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

    const pokemonsSpeciesArray = await d3.csv('/data/pokemon_species.csv', d => ({
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
    }));

    const speciesMap = new Map(
        pokemonsSpeciesArray.map(species => [species.pokemon_id, species])
    );

    const mergedPokemons = uniquePokemons.map(pokemon => ({
        ...pokemon,
        ...(speciesMap.get(pokemon.pokemon_id) || {})
    }));

    const pokemonsArray2 = await d3.csv('/data/pokemon.csv', d => ({
        pokemon_id: +d.id,
        identifier: d.identifier,
        height: +d.height,
        weight: +d.weight,
        base_experience: +d.base_experience,
        order: +d.order,
        is_default: +d.is_default,
    }));

    const pokemonsMap2 = new Map(
        pokemonsArray2.map(pokemons => [pokemons.pokemon_id, pokemons])
    );

    const mergedPokemons2 = mergedPokemons.map(pokemon => ({
        ...pokemon,
        ...(pokemonsMap2.get(pokemon.pokemon_id) || {})
    }));

    const finalStats = await d3.csv('/data/pokemon_stats_clean.csv', d => ({
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
    }));

    const pokemonsMap3 = new Map(
        finalStats.map(pokemons => [pokemons.Pokemon_Id, pokemons])
    );

    const mergedPokemons3 = mergedPokemons2.map(pokemon => ({
        ...pokemon,
        ...(pokemonsMap3.get(pokemon.pokemon_id) || {})
    }));

    mergedPokemons3
        .sort((a, b) => a.name.localeCompare(b.name))
        .sort((a, b) => a.types[0].type_name.localeCompare(b.types[0].type_name));

    return mergedPokemons3;
}

export async function getAllPokemons() {
    // Carrega todos os encontros
    const encounters = await d3.csv('/data/encounters.csv', d => ({
        id: +d.id,
        version_id: +d.version_id,
        location_area_id: +d.location_area_id,
        pokemon_id: +d.pokemon_id,
        min_level: +d.min_level,
        max_level: +d.max_level
    }));

    // Carrega nomes e gêneros dos pokémons na linguagem (9 = inglês)
    const pokemonsArray = await d3.csv('/data/pokemon_species_names.csv', d => ({
        pokemon_id: +d.pokemon_species_id,
        language_id: +d.local_language_id,
        name: d.name,
        genus: d.genus,
    }));
    const filteredPokemons = pokemonsArray.filter(p => p.language_id === 9);
    const pokemonDetailsMap = new Map();
    filteredPokemons.forEach(pokemon => {
        pokemonDetailsMap.set(pokemon.pokemon_id, {
            name: pokemon.name,
            genus: pokemon.genus,
            language_id: pokemon.language_id
        });
    });

    // Junta nomes aos encontros
    const mergedData = encounters.map(enc => ({
        ...enc,
        ...(pokemonDetailsMap.get(enc.pokemon_id) || {})
    }));

    // Tipos dos pokémons
    const typesArray = await d3.csv('/data/types.csv', d => ({
        type_id: +d.id,
        name: d.identifier,
        generation_id: +d.generation_id,
        damage_class_id: +d.damage_class_id,
    }));
    const pokemonsTypeArray = await d3.csv('/data/pokemon_types.csv', d => ({
        pokemon_id: +d.pokemon_id,
        type_id: +d.type_id,
        slot: +d.slot,
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

    // Agrupa os pokémons, calcula min/max level para cada
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

    // Carrega espécies
    const pokemonsSpeciesArray = await d3.csv('/data/pokemon_species.csv', d => ({
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
    }));
    const speciesMap = new Map(pokemonsSpeciesArray.map(s => [s.pokemon_id, s]));
    const mergedPokemons = uniquePokemons.map(p => ({
        ...p,
        ...(speciesMap.get(p.pokemon_id) || {})
    }));

    // Carrega dados gerais
    const pokemonsArray2 = await d3.csv('/data/pokemon.csv', d => ({
        pokemon_id: +d.id,
        identifier: d.identifier,
        height: +d.height,
        weight: +d.weight,
        base_experience: +d.base_experience,
        order: +d.order,
        is_default: +d.is_default,
    }));
    const pokemonsMap2 = new Map(pokemonsArray2.map(p => [p.pokemon_id, p]));
    const mergedPokemons2 = mergedPokemons.map(p => ({
        ...p,
        ...(pokemonsMap2.get(p.pokemon_id) || {})
    }));

    // Carrega stats
    const finalStats = await d3.csv('/data/pokemon_stats_clean.csv', d => ({
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
    }));
    const pokemonsMap3 = new Map(finalStats.map(p => [p.Pokemon_Id, p]));
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
}
