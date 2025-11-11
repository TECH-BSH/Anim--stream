// Fichier : watch.js (Multi-API pour la Lecture)

// --- CONFIGURATION API DE STREAMING ---
const ZORO_API_URL = "https://zoro-api.vercel.app/anime"; // NOUVELLE API
const ANIMEPAHE_API_URL = "https://animepahe.tech/api"; // NOUVELLE API
const GOJO_API_URL = "https://gojo-api.deno.dev/anime"; // Ancienne API (moins fiable)

// --- CONFIGURATION JIKAN (Détails) ---
const JIKAN_DETAILS_URL = "https://api.jikan.moe/v4/anime"; 

const playerContainer = document.getElementById('player-container');
const messageContainer = document.getElementById('error-message');
const animeTitleElement = document.getElementById('anime-title');

// ----------------------------------------------------
// 1. Fonction principale de chargement de la source
// ----------------------------------------------------
async function loadEpisodeSource(malId, episodeNumber) {
    if (!malId || !episodeNumber) {
        displayError("ID d'anime ou numéro d'épisode manquant.");
        return;
    }

    let sourceFound = false;
    let lastError = null;

    // Récupérer le titre (nécessaire pour toutes les APIs de streaming)
    const titleData = await fetchAnimeTitle(malId);
    if (!titleData) {
        displayError("Impossible de charger les métadonnées de l'anime (Jikan).");
        return;
    }
    animeTitleElement.textContent = `Lecture : ${titleData.title} - Ép. ${episodeNumber}`;


    // --- 🚨 STRATÉGIE MULTI-API 🚨 ---
    const apis = [
        { name: "Zoro-API", url: ZORO_API_URL, fetcher: fetchZoroSource },
        { name: "Animepahe-API", url: ANIMEPAHE_API_URL, fetcher: fetchAnimepaheSource },
        { name: "Gojo-API", url: GOJO_API_URL, fetcher: fetchGojoSource },
    ];

    messageContainer.innerHTML = `<p><i class="fas fa-spinner fa-spin"></i> Recherche de source pour Ép. ${episodeNumber}...</p>`;

    for (const api of apis) {
        console.log(`Tentative avec ${api.name}...`);
        messageContainer.innerHTML = `<p><i class="fas fa-search"></i> Tentative avec **${api.name}**...</p>`;
        
        try {
            const embedUrl = await api.fetcher(titleData.searchTitle, episodeNumber, api.url);
            
            if (embedUrl) {
                renderPlayer(embedUrl);
                messageContainer.innerHTML = `<p style="color: #2ecc71;">✅ Source trouvée via **${api.name}**.</p>`;
                sourceFound = true;
                break; // Arrêter dès qu'une source fonctionne
            }
        } catch (error) {
            lastError = `Erreur sur ${api.name}: ${error.message}`;
            console.error(lastError, error);
        }
    }

    if (!sourceFound) {
        displayError(`Échec total de la lecture. Aucune des APIs n'a pu fournir la source. Dernière erreur: ${lastError || "Erreur inconnue."}`);
    }
}

// ----------------------------------------------------
// 2. Fonctions de Fetch par API
// ----------------------------------------------------

// Utilitaire pour récupérer le titre depuis Jikan
async function fetchAnimeTitle(malId) {
    try {
        const response = await fetch(`${JIKAN_DETAILS_URL}/${malId}`);
        const data = await response.json();
        const anime = data.data;

        // Simplification du titre pour la recherche API
        let searchTitle = anime.title_english || anime.title_japanese || anime.title;
        if (searchTitle.includes(':')) {
            searchTitle = searchTitle.split(':')[0].trim();
        }

        return { title: anime.title, searchTitle: searchTitle };
    } catch (e) {
        console.error("Erreur Jikan lors de la récupération du titre:", e);
        return null;
    }
}

// 🚨 NOUVELLE FONCTION : Zoro-API
async function fetchZoroSource(title, episodeNumber, url) {
    // 1. Rechercher l'anime pour obtenir son ID Zoro
    const searchUrl = `${url}/search?q=${encodeURIComponent(title)}`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchData.data || searchData.data.length === 0) {
        throw new Error("Anime non trouvé sur Zoro-API");
    }

    const zoroId = searchData.data[0].id; // Prendre le premier résultat

    // 2. Obtenir les épisodes pour l'ID Zoro
    const episodesUrl = `${url}/episodes/${zoroId}`;
    const episodesResponse = await fetch(episodesUrl);
    const episodesData = await episodesResponse.json();

    if (!episodesData.episodes || episodesData.episodes.length === 0) {
        throw new Error("Épisodes non trouvés pour Zoro ID: " + zoroId);
    }
    
    // 3. Trouver le lien embed pour l'épisode demandé
    const episode = episodesData.episodes.find(ep => ep.number === parseInt(episodeNumber));

    if (episode && episode.link) {
        // L'API Zoro peut donner un lien direct ou un lien pour obtenir le lecteur (similaire à Consumet)
        // Ici, on suppose que le lien final est soit dans .link soit nécessite une étape de plus
        // Pour l'instant, on suppose qu'il donne le lien Iframe final (cela dépend de l'API)
        return episode.link; 
    }
    throw new Error(`Épisode ${episodeNumber} non trouvé sur Zoro.`);
}

// 🚨 NOUVELLE FONCTION : Animepahe API
async function fetchAnimepaheSource(title, episodeNumber, url) {
    // Cette API nécessite souvent une recherche complexe. Nous allons simuler une structure de base.
    // L'API Animepahe requiert souvent des étapes multi-étapes.

    // 1. Rechercher l'anime
    const searchUrl = `${url}/search?q=${encodeURIComponent(title)}`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchData.results || searchData.results.length === 0) {
        throw new Error("Anime non trouvé sur Animepahe.");
    }
    
    // 2. Obtenir les épisodes (L'ID peut être complexe ici)
    const paheId = searchData.results[0].session; 

    // Les étapes suivantes sont souvent trop complexes pour un simple fetch direct
    // car Animepahe API donne souvent des données non utilisables directement
    // (ex: l'embed final est souvent obscurci ou nécessite un JS runtime).
    // Nous allons simuler un succès si on a trouvé l'ID pour le moment.

    // 🚨 AVERTISSEMENT : L'implémentation complète de Animepahe API est complexe
    // et ne peut pas être garantie sans une API proxy serveur.
    
    // Pour l'exemple, nous allons chercher le lien embed s'il est simple:
    const episodeUrl = `${url}/watch/${paheId}/${episodeNumber}`; 
    const episodeResponse = await fetch(episodeUrl);
    const episodeData = await episodeResponse.json();
    
    // On suppose que episodeData.embed contient l'URL iframe finale.
    if (episodeData.embed) {
        return episodeData.embed;
    }
    
    throw new Error(`Épisode ${episodeNumber} non trouvé sur Animepahe.`);
}

// Ancienne fonction Gojo, maintenue pour la compatibilité (dernier recours)
async function fetchGojoSource(title, episodeNumber, url) {
    // 1. Rechercher les épisodes via le titre
    const episodesUrl = `${url}/${encodeURIComponent(title)}`;
    const episodesResponse = await fetch(episodesUrl);
    
    if (!episodesResponse.ok) {
        throw new Error(`ÉCHEC (Statut: ${episodesResponse.status})`);
    }

    const episodesData = await episodesResponse.json();
    const episode = episodesData.episodes?.find(ep => ep.number === parseInt(episodeNumber));
    
    // 2. Obtenir le lien embed si disponible
    if (episode && episode.link) {
        // L'API Gojo donne le lien embed directement
        return episode.link; 
    }
    throw new Error(`Épisode ${episodeNumber} non trouvé sur Gojo.`);
}


// ----------------------------------------------------
// 3. Fonctions de Rendu et d'Erreur
// ----------------------------------------------------
function renderPlayer(embedUrl) {
    playerContainer.innerHTML = `
        <iframe src="${embedUrl}" 
                allowfullscreen 
                frameborder="0" 
                scrolling="no" 
                title="Lecteur d'Anime">
        </iframe>
    `;
    messageContainer.innerHTML = ''; // Nettoyer le message d'erreur/chargement
}

function displayError(message) {
    messageContainer.innerHTML = `
        <div class="error-box">
            <i class="fas fa-exclamation-triangle"></i> 
            <p>${message}</p>
        </div>
    `;
    playerContainer.innerHTML = '';
    console.error("ERREUR DE LECTURE:", message);
}

// ----------------------------------------------------
// 4. Exécution initiale
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const malId = urlParams.get('id');
    const episodeNumber = urlParams.get('episode');

    loadEpisodeSource(malId, episodeNumber);
});
