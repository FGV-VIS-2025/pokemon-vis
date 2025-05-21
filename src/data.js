export async function getRegions(){
    const data = await d3.csv('../data/csv/region_names.csv', d => ({
        region_id: +d.region_id,
        local_lan_id: +d.local_language_id,
        name: d.name
    }));

    return data;
}

export async function getRoutesByRegionId(regionId) {
    const data = await d3.csv('../data/csv/locations.csv', d => ({
        route_id: +d.id,
        route_name: d.identifier,
        region_id: +d.region_id
    }));
    const filteredRoutes = data.filter(route => route.region_id === +regionId);

    return filteredRoutes;
}
