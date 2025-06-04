const csvCache = new Map();
async function loadCsv(path, parser) {
    if (!csvCache.has(path)) {
        csvCache.set(path, d3.csv(path, parser));
    }
    return csvCache.get(path);
}

const locationsCacheByRegionName = new Map();

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
