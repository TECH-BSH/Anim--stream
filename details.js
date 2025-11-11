// Fichier : details.js (Version OPTIMISÉE SANS PROXY pour la publication sur Render)

// --- CONFIGURATION API ---
const JIKAN_DETAILS_URL = "https://api.jikan.moe/v4/anime"; 
const GOJO_API_URL = "https://gojo-api.deno.dev/anime"; 

const detailContent = document.getElementById('detail-content');

// ----------------------------------------------------
// Fonction de requête directe (PAS DE PROXY)
// ----------------------------------------------------
async function directFetch(url) {
    // Appel direct
    const response = await fetch(url);
    return response;
}


// ----------------------------------------------------
// 1. Fonction principale de chargement
// ----------------------------------------------------
async function loadAnimeDetails(malId) {
    // ... (Logique de chargement Jikan - inchangée) ...

    try {
        detailContent.innerHTML = `
            <p style="text-align: center; color: var(--text-secondary); padding: 50px;">
                <i class="fas fa-spinner fa-spin"></i> Chargement des détails (Jikan) et épisodes (Gojo)...
            </p>
        `;
        
        // 1. Récupération des détails (Jikan - DIRECT)
        const jikanResponse = await directFetch(`${JIKAN_DETAILS_URL}/${malId}/full`);
        if (!jikanResponse.ok) throw new Error(`Erreur Jikan (Statut: ${jikanResponse.status})`);
        
        const jikanData = await jikanResponse.json();
        const anime = jikanData.data;

        if (!anime) throw new Error("Anime non trouvé sur Jikan.");
        
        // 2. Récupération des épisodes (Gojo - DIRECT)
        const animeTitle = anime.title || anime.title_english || anime.title_japanese;
        let gojoEpisodes = [];
        
        try {
            // 🚨 Appel DIRECT à l'API Gojo (doit fonctionner une fois publié sur Render)
            const gojoTargetUrl = `${GOJO_API_URL}/${encodeURIComponent(animeTitle)}`;
            const gojoResponse = await directFetch(gojoTargetUrl); 
            
            if (gojoResponse.ok) {
                const gojoData = await gojoResponse.json();
                gojoEpisodes = gojoData.episodes || [];
            } else {
                console.warn(`Avertissement Gojo : ${gojoResponse.status}. Utilisation des détails seuls.`);
            }
        } catch (gojoError) {
             // Si ça échoue, c'est probablement un problème Gojo, pas CORS si on est sur Render.
             console.warn(`Avertissement Gojo : Échec de la connexion.`, gojoError);
        }

        // 3. Rendu combiné
        renderAnimeDetails(anime, gojoEpisodes);

    } catch (error) {
        console.error(`Erreur de chargement des détails pour MAL ID ${malId} :`, error);
        detailContent.innerHTML = `
            <div class="error-message" style="text-align: center; color: #e74c3c; padding: 50px;">
                <i class="fas fa-exclamation-circle"></i> Impossible de charger les détails de l'anime : ${error.message}
            </div>
        `;
    }
}

// ----------------------------------------------------
// 2. Fonction pour rendre (afficher) les détails de l'anime
// ----------------------------------------------------
function renderAnimeDetails(anime, episodes) {
    // ... (le reste de la fonction renderAnimeDetails est inchangé) ...
    
    // Détails Jikan
    const displayTitle = anime.title;
    const synopsisDetail = anime.synopsis || "Pas de synopsis disponible.";
    const rating = anime.score ? anime.score.toFixed(2) : "N/A";
    
    // Traduction des statuts
    const status = anime.status === 'Finished Airing' ? 'Terminé' 
                 : anime.status === 'Currently Airing' ? 'En cours' 
                 : anime.status || "Inconnu";
    
    const studioName = anime.studios && anime.studios.length > 0 ? anime.studios[0].name : "Inconnu";
    const totalEpisodes = anime.episodes || "?";

    const imageUrl = anime.images.jpg.large_image_url;
    
    // Utilisation du trailer Jikan, sinon fallback (avec autoplay=1)
    const videoEmbedUrl = anime.trailer && anime.trailer.embed_url 
                          ? anime.trailer.embed_url.replace("autoplay=0", "autoplay=1") 
                          : "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&controls=1&rel=0"; 

    // Préparation des genres (Jikan)
    const genreTagsHTML = anime.genres && anime.genres.length > 0
        ? anime.genres.map(genre => `<span class="genre-tag">${genre.name}</span>`).join('')
        : '<span class="genre-tag">Non spécifié</span>';
    
    // Préparation de la liste des ÉPISODES (Gojo)
    const episodesHTML = episodes && episodes.length > 0
        ? episodes.map(ep => {
            const episodeNumber = ep.number;
            // On utilise l'ID Jikan (malId) pour la page de lecture
            const watchLink = `watch.html?id=${anime.mal_id}&episode=${episodeNumber}`; 

            return `
                <li class="episode-item">
                    <a href="${watchLink}">
                        <span class="ep-number">Épisode ${episodeNumber}</span> - ${ep.title || `(Lecture directe)`}
                    </a>
                </li>
            `;
        }).join('')
        : '<li>Aucun lien de lecture trouvé pour cet anime via Gojo.</li>';

    // Construction du HTML final
    detailContent.innerHTML = `
        <div class="video-player-container">
            <iframe 
                src="${videoEmbedUrl}" 
                title="Lecteur Vidéo pour ${displayTitle}" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
            </iframe>
        </div>

        <section class="detail-hero">
            <div class="hero-poster">
                <img src="${imageUrl}" alt="Affiche de l'anime : ${displayTitle}">
            </div>
            
            <div class="hero-info">
                <h2 class="anime-title">${displayTitle}</h2>
                
                <div class="metadata">
                    <span class="rating"><i class="fas fa-star" style="color: gold;"></i> ${rating}/10</span>
                    <span class="status">Statut : ${status}</span>
                    <span class="studio">Studio : ${studioName}</span>
                    <span class="episodes-count">Total : ${totalEpisodes} épisodes</span>
                </div>

                <p class="synopsis">
                    ${synopsisDetail}
                </p>

                <div class="actions">
                    <a href="#episode-list-anchor" class="watch-button"><i class="fas fa-list"></i> Liste des épisodes</a>
                    ${genreTagsHTML}
                </div>
            </div>
        </section>

        <section class="episode-list" id="episode-list-anchor">
            <h3>Liste des Épisodes</h3>
            
            <ul class="episodes-container">
                ${episodesHTML}
            </ul>
        </section>
    `;

    document.title = `${displayTitle} - Détails de l'Anime`;
}

// ----------------------------------------------------
// 3. Exécution au chargement de la page
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const animeId = urlParams.get('id'); // ID Jikan (mal_id)

    loadAnimeDetails(animeId);
});
