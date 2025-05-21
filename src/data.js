export async function getRegions(){
    const data = await d3.csv('../data/csv/region_names.csv', d => ({
        region_id: +d.region_id,
        local_lan_id: +d.local_language_id,
        name: d.name
    }));

    return data;
}