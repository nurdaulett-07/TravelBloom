const searchInput = document.getElementById('searchInput');
const btnSearch = document.getElementById('btnSearch');
const btnClear = document.getElementById('btnClear');
const results = document.getElementById('results');

function showResults(items) {
  results.innerHTML = '';
  if (items.length === 0) {
    results.innerHTML = '<p>No results found.</p>';
    return;
  }
  items.forEach(item => {
    results.innerHTML += `
      <div class="card">
        <img src="${item.imageUrl}" alt="${item.name}">
        <h3>${item.name}</h3>
        <p>${item.description}</p>
      </div>`;
  });
}

function searchRecommendations() {
  const keyword = searchInput.value.trim().toLowerCase();
  if (!keyword) return;

  // На других страницах (About/Contact) результатов нет – переходим на главную
  if (!results) {
    window.location.href = `./index.html?search=${encodeURIComponent(keyword)}`;
    return;
  }

  fetch('travel_recommendation_api.json')
    .then(response => response.json())
    .then(data => {
      let found = [];
      if (keyword.includes('beach')) {            // beach, beaches, Beach...
        found = data.beaches;
      } else if (keyword.includes('temple')) {    // temple, temples...
        found = data.temples;
      } else if (keyword.includes('countr')) {    // country, countries...
        data.countries.forEach(c => found.push(...c.cities));
      } else {                                    // поиск по названию страны/города
        data.countries.forEach(c => {
          if (c.name.toLowerCase().includes(keyword)) {
            found.push(...c.cities);
          } else {
            c.cities.forEach(city => {
              if (city.name.toLowerCase().includes(keyword)) found.push(city);
            });
          }
        });
      }
      showResults(found);
    })
    .catch(error => {
      console.error('Error:', error);
      results.innerHTML = '<p>An error occurred while fetching data.</p>';
    });
}

function clearResults() {
  searchInput.value = '';
  if (results) results.innerHTML = '';
}

btnSearch.addEventListener('click', searchRecommendations);
btnClear.addEventListener('click', clearResults);
searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') searchRecommendations(); });

// Если пришли с другой страницы с параметром ?search=
const params = new URLSearchParams(window.location.search);
if (params.get('search') && results) {
  searchInput.value = params.get('search');
  searchRecommendations();
}