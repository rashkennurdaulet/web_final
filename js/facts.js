/* Wildlife Field Notes, based on Ramazan Mukhan's random animal facts. */
(function () {
  'use strict';

  const species = [
    {id: 'lion', title: 'Lion', name: 'African Lion', group: 'mammal', fact: 'Lions live in social groups called prides.'},
    {id: 'giraffe', title: 'Giraffe', name: 'Savannah Giraffe', group: 'mammal', fact: 'A giraffe has seven neck vertebrae, just like humans.'},
    {id: 'elephant', title: 'African elephant', name: 'African Elephant', group: 'mammal', fact: 'An elephant uses its trunk to pick up food, drink water and greet other elephants.'},
    {id: 'capuchin', title: 'White-faced capuchin', name: 'White-faced Capuchin', group: 'mammal', fact: 'Some capuchins use stones to crack open hard foods.'},
    {id: 'flamingo', title: 'Greater flamingo', name: 'Greater Flamingo', group: 'bird', fact: 'Greater flamingos get their pink colour from pigments in their diet.'},
    {id: 'macaw', title: 'Scarlet macaw', name: 'Scarlet Macaw', group: 'bird', fact: 'A scarlet macaw uses its curved beak to crack open nuts and seeds.'},
    {id: 'penguin', title: 'Emperor penguin', name: 'Emperor Penguin', group: 'bird', fact: 'Male emperor penguins balance their eggs on their feet to keep them off the ice.'},
    {id: 'dolphin', title: 'Indo-Pacific bottlenose dolphin', name: 'Indo-Pacific Bottlenose Dolphin', group: 'aquatic', fact: 'Bottlenose dolphins use distinct whistles to identify themselves.'},
    {id: 'sea-lion', title: 'California sea lion', name: 'California Sea Lion', group: 'aquatic', fact: 'A California sea lion can rotate its hind flippers underneath its body to walk on land.'}
  ];
  const groupNames = {mammal: 'Mammal', bird: 'Bird', aquatic: 'Aquatic animal'};
  const journalKey = 'cityzoo-wildlife-journal';
  const button = document.getElementById('fact-button');
  const group = document.getElementById('fact-group');
  const result = document.getElementById('fact-result');
  const photo = document.getElementById('fact-image');
  const category = document.getElementById('fact-category');
  const animal = document.getElementById('fact-animal');
  const note = document.getElementById('fact-text');
  const source = document.getElementById('fact-source');
  const status = document.getElementById('fact-status');
  const progress = document.getElementById('fact-progress');
  const meter = document.getElementById('fact-meter');
  const cache = new Map();
  let lastId;
  let proxyAvailable = true;
  let currentRequest;

  function readJournal() {
    try {
      const ids = JSON.parse(localStorage.getItem(journalKey) || '[]');
      return new Set(species.filter(item => ids.includes(item.id)).map(item => item.id));
    } catch (error) {
      return new Set();
    }
  }

  let discovered = readJournal();

  function updateProgress() {
    progress.textContent = discovered.size === species.length
      ? 'Field journal complete · ' + species.length + ' species'
      : discovered.size + ' of ' + species.length + ' species discovered';
    meter.value = discovered.size;
  }

  function nextAnimal() {
    const pool = species.filter(item => group.value === 'all' || item.group === group.value);
    const unseen = pool.filter(item => !discovered.has(item.id));
    const choices = unseen.length ? unseen : pool.filter(item => item.id !== lastId);
    return choices.length ? choices[Math.floor(Math.random() * choices.length)] : pool[0];
  }

  async function readJson(url, request, timeout) {
    const controller = new AbortController();
    const cancel = () => controller.abort();
    request.signal.addEventListener('abort', cancel, {once: true});
    const timer = window.setTimeout(cancel, timeout);
    try {
      if (request.signal.aborted) cancel();
      const response = await fetch(url, {signal: controller.signal});
      return {response, json: response.ok && response.status !== 204 ? await response.json() : null};
    } finally {
      window.clearTimeout(timer);
      request.signal.removeEventListener('abort', cancel);
    }
  }

  async function apiNote(item, request) {
    if (proxyAvailable) {
      try {
        const url = new URL('api/animal-fact', document.baseURI);
        url.searchParams.set('animal', item.id);
        const {response, json} = await readJson(url, request, 4000);
        if (response.status === 404 || response.status === 501) proxyAvailable = false;
        if (typeof json?.fact === 'string' && json.fact.trim()) {
          return {text: json.fact, source: 'API Ninjas Animals API', url: 'https://api-ninjas.com/api/animals'};
        }
      } catch (error) {
        if (request.signal.aborted) throw error;
        // A static host or unavailable proxy can still use the public species API.
      }
    }

    const url = new URL('https://en.wikipedia.org/w/api.php');
    url.search = new URLSearchParams({
      action: 'query', prop: 'extracts', exintro: '1', explaintext: '1', exsentences: '1',
      titles: item.title, redirects: '1', format: 'json', formatversion: '2', origin: '*'
    });
    const {json} = await readJson(url, request, 5500);
    const page = json?.query?.pages?.[0];
    if (!page?.extract?.trim() || !Number.isInteger(page.pageid)) throw new Error('Species note unavailable');
    return {text: page.extract.trim(), source: 'Wikipedia', url: 'https://en.wikipedia.org/?curid=' + page.pageid};
  }

  function displayNote(fieldNote) {
    note.textContent = fieldNote.text;
    source.hidden = !fieldNote.source;
    if (fieldNote.source) {
      source.href = fieldNote.url;
      source.textContent = 'Source: ' + fieldNote.source;
    }
  }

  async function revealAnimal() {
    currentRequest?.abort();
    const request = new AbortController();
    currentRequest = request;
    discovered = new Set([...discovered, ...readJournal()]);
    const item = nextAnimal();
    const isNew = !discovered.has(item.id);
    const announcement = item.name + (isNew ? ' added to your journal.' : ' is already in your journal.');
    lastId = item.id;

    photo.alt = item.name;
    photo.src = 'images/' + item.id + '.jpg';
    category.textContent = groupNames[item.group];
    animal.textContent = item.name;

    const savedNote = cache.get(item.id);
    displayNote(savedNote || {text: item.fact});
    status.textContent = savedNote ? announcement : announcement + ' Loading the live note…';

    discovered.add(item.id);
    try { localStorage.setItem(journalKey, JSON.stringify([...discovered])); } catch (error) { /* Keep the session journal usable. */ }
    updateProgress();
    result.classList.remove('fact-animate');
    void result.offsetWidth;
    result.classList.add('fact-animate');
    button.textContent = 'Discover another animal';

    if (savedNote) return;
    try {
      const fieldNote = await apiNote(item, request);
      if (request.signal.aborted) return;
      cache.set(item.id, fieldNote);
      displayNote(fieldNote);
      status.textContent = announcement;
    } catch (error) {
      if (!request.signal.aborted) status.textContent = 'Live data is unavailable. Showing a saved zoo fact about ' + item.name + '.';
    }
  }

  button.addEventListener('click', revealAnimal);
  group.addEventListener('change', revealAnimal);
  updateProgress();
})();
