

// Fichier : api-integration.js

// --- URLS DE BASE Jikan API ---
const JIKAN_TOP_URL = "https://api.jikan.moe/v4/top/anime";
const JIKAN_SEARCH_URL = "https://api.jikan.moe/v4/anime";

const catalogueContainer = document.querySelector('.anime-catalogue');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');

// ----------------------------------------------------
// 1. Fonction pour créer un élément de carte d'anime
// ----------------------------------------------------
function createAnimeCard(anime) {
    const card = document.createElement('div');
    card.classList.add('anime-card');
    
    // Le lien vers la page de détails passe l'ID Jikan (mal_id) dans l'URL
    card.setAttribute('onclick', `window.location.href='details.html?id=${anime.mal_id}'`);

    const imageUrl = anime.images.jpg.large_image_url;
    
    // Traduire le statut
    const status = anime.status === 'Finished Airing' ? 'Terminé' 
                 : anime.status === 'Currently Airing' ? 'En cours' 
                 : anime.status || "Inconnu";
    
    const episodesCount = anime.episodes || "?";

    card.innerHTML = `
        <img src="${imageUrl}" alt="Affiche de l'anime : ${anime.title}">
        <div class="card-content">
            <h3>${anime.title}</h3>
            <p class="status">${status} - ${episodesCount} épisodes</p>
            <p class="score"><i class="fas fa-star"></i> ${anime.score || 'N/A'}</p>
        </div>
    `;

    catalogueContainer.appendChild(card);
}

// ----------------------------------------------------
// 2. Fonction de Chargement et de Recherche des Données (API Jikan)
// ----------------------------------------------------
async function loadAnimeData(searchTerm = '') {
    // Choisir l'URL : Recherche ou Top Animes
    const url = searchTerm 
        ? `${JIKAN_SEARCH_URL}?q=${encodeURIComponent(searchTerm)}&limit=25`
        : JIKAN_TOP_URL;

    try {
        catalogueContainer.innerHTML = `
            <h2 style="grid-column: 1 / -1; text-align: center; padding: 50px;">
                <i class="fas fa-sync fa-spin"></i> ${searchTerm ? 'Recherche...' : 'Chargement du catalogue...'}
            </h2>
        `;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();
        const animes = data.data; 

        catalogueContainer.innerHTML = ''; // Nettoyer l'affichage

        if (animes && animes.length > 0) {
            // Ajouter un titre de section
            catalogueContainer.insertAdjacentHTML('afterbegin', `
                <h2 style="grid-column: 1 / -1;">
                    ${searchTerm ? `Résultats pour "${searchTerm}"` : 'Top Animes Actuels'}
                </h2>
            `);
            animes.forEach(anime => {
                createAnimeCard(anime);
            });
        } else {
            catalogueContainer.innerHTML = `
                <h2 style="grid-column: 1 / -1; text-align: center; color: var(--text-secondary); padding: 50px;">
                    Aucun résultat trouvé ${searchTerm ? `pour "${searchTerm}"` : ''}.
                </h2>
            `;
        }

    } catch (error) {
        console.error("Erreur de chargement des données Jikan :", error);
        catalogueContainer.innerHTML = `
            <h2 style="grid-column: 1 / -1; text-align: center; color: #e74c3c; padding: 50px;">
                ❌ Échec de la connexion à l'API Jikan : ${error.message}
            </h2>
        `;
    }
}

// ----------------------------------------------------
// 3. Gestionnaire d'Événements de Recherche
// ----------------------------------------------------

function handleSearch() {
    const term = searchInput.value.trim();
    loadAnimeData(term);
}

// Écouter le bouton de recherche
searchButton.addEventListener('click', handleSearch);

// Écouter la touche Entrée dans le champ de saisie
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});


// ----------------------------------------------------
// 4. Exécution initiale
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', loadAnimeData);