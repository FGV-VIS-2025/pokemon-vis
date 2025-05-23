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