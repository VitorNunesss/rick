const characterGrid = document.getElementById('characterGrid');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const speciesFilter = document.getElementById('speciesFilter');
const favoriteFilterButton = document.getElementById('favoriteFilter');

let currentPage = 1;   
let isLoading = false;  
let favorites = JSON.parse(localStorage.getItem('favorites')) || []; 

const translations = {
    status: { "Alive": "Vivo", "Dead": "Morto", "unknown": "Desconhecido" },
    species: { "Human": "Humano", "Alien": "Alienígena", "Robot": "Robô" }
};

function saveFavorites() {
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

function toggleFavorite(id) {
    const index = favorites.indexOf(id); 
    if (index > -1) {
        favorites.splice(index, 1); 
    } else {
        favorites.push(id); 
    }
    saveFavorites(); 
    renderCharacters(); 
}

function createCharacterCard(character) {
    const characterCard = document.createElement('div'); 
    characterCard.classList.add('character-card'); 

    const favoriteClass = favorites.includes(character.id) ? 'favorited' : '';
    const translatedStatus = translations.status[character.status] || character.status; 
    const translatedSpecies = translations.species[character.species] || character.species; 

    characterCard.innerHTML = `
        <img src="${character.image}" alt="${character.name}">
        <h3>${character.name}</h3>
        <span class="favorite ${favoriteClass}" data-id="${character.id}">★</span>
        <div class="character-details">
            <p>Status: ${translatedStatus}</p>
            <p>Espécie: ${translatedSpecies}</p>
        </div>
    `;

    characterCard.querySelector('.favorite').onclick = () => toggleFavorite(character.id);
    
    characterGrid.appendChild(characterCard); 
}

function fetchCharacters(page) {
    if (isLoading) return; 
    isLoading = true; 

    fetch(`https://rickandmortyapi.com/api/character/?page=${page}`)
        .then(response => response.json())
        .then(data => {
            data.results.forEach(createCharacterCard); 
            isLoading = false;  
        })
        .catch(error => {
            console.log(error); 
            isLoading = false; 
        });
}

function fetchSearchedCharacters(query) {
    fetch(`https://rickandmortyapi.com/api/character/?name=${query}`)
        .then(response => response.json())
        .then(data => {
            characterGrid.innerHTML = ''; 
            data.results.forEach(createCharacterCard); 
        })
        .catch(error => {
            console.log('Nenhum personagem encontrado', error); 
            characterGrid.innerHTML = '<p>Nenhum personagem encontrado</p>';
        });
}

function renderFilteredCharacters() {
    characterGrid.innerHTML = ''; 
    const status = statusFilter.value;
    const species = speciesFilter.value;

    const filteredFavorites = favorites.map(id => {
        return fetch(`https://rickandmortyapi.com/api/character/${id}`)
            .then(response => response.json())
            .then(character => {
                if ((!status || character.status === status) && (!species || character.species === species)) {
                    createCharacterCard(character);
                }
            });
    });

    Promise.all(filteredFavorites).then(() => {
        // Renderização completa após todos os personagens serem filtrados
    });
}

searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim(); 
    characterGrid.innerHTML = ''; 
    query.length ? fetchSearchedCharacters(query) : fetchCharacters(currentPage); 
});

window.addEventListener('scroll', () => {
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 100 && !isLoading) {
        currentPage++; 
        fetchCharacters(currentPage); 
    }
});

favoriteFilterButton.addEventListener('click', () => {
    characterGrid.innerHTML = ''; 
    renderFilteredCharacters();
});

function renderCharacters() {
    characterGrid.innerHTML = ''; 
    fetchCharacters(currentPage); 
}

fetchCharacters(currentPage);
