const animals = {
  lion: ['lion', 'Panthera leo'],
  giraffe: ['giraffe', 'Giraffa camelopardalis'],
  elephant: ['african elephant', 'Loxodonta africana'],
  capuchin: ['white-faced capuchin', 'Cebus capucinus'],
  flamingo: ['greater flamingo', 'Phoenicopterus roseus'],
  macaw: ['scarlet macaw', 'Ara macao'],
  penguin: ['emperor penguin', 'Aptenodytes forsteri'],
  dolphin: ['indo-pacific bottlenose dolphin', 'Tursiops aduncus'],
  'sea-lion': ['california sea lion', 'Zalophus californianus']
};

export const config = { path: '/api/animal-fact' };

export default async function animalFact(request) {
  if (request.method !== 'GET') return new Response(null, {status: 405, headers: {Allow: 'GET'}});

  const id = new URL(request.url).searchParams.get('animal');
  if (!Object.hasOwn(animals, id)) return new Response(null, {status: 400});

  const apiKey = process.env.API_NINJAS_KEY;
  if (!apiKey) return new Response(null, {status: 501});

  const [query, scientificName] = animals[id];
  const url = new URL('https://api.api-ninjas.com/v1/animals');
  url.searchParams.set('name', query);

  try {
    const response = await fetch(url, {
      headers: {'X-Api-Key': apiKey},
      signal: AbortSignal.timeout(3000)
    });
    if (!response.ok) return new Response(null, {status: 502});

    const entries = await response.json();
    const record = entries.find(animal => animal.taxonomy?.scientific_name?.toLowerCase() === scientificName.toLowerCase())
      || entries.find(animal => animal.name?.toLowerCase() === query);
    if (!record) return new Response(null, {status: 204});

    const {habitat, diet, most_distinctive_feature: feature} = record.characteristics || {};
    const data = [['Habitat', habitat], ['Diet', diet], ['Distinctive feature', feature]];
    const facts = data.filter(([, value]) => typeof value === 'string' && value.trim() && value.length <= 160);
    if (!facts.length) return new Response(null, {status: 204});
    const fact = facts.map(([label, value]) => label + ': ' + value.trim().replace(/[.!?]+$/, '') + '.').join(' ');
    return Response.json({fact}, {headers: {'Cache-Control': 'public, max-age=3600'}});
  } catch (error) {
    return new Response(null, {status: 502});
  }
}
