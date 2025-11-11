// Fichier : watch.js (Version FINALE pour une Robustesse Maximale)

// 🚨 LISTE DÉFINITIVE DES APIS DE LECTURE
const EXTERNAL_APIS = [
    { url: "https://gojo-api.deno.dev/api/v1/episode", type: "simple", name: "gojo-api" },      // API 1
    { url: "https://api.enime.moe/api/v1/episode", type: "simple", name: "enime-api" },         // API 2
    { url: "https://api-video-secours.vercel.app/api/v1/episode", type: "simple", name: "secours-api" }, // API 3
    // API 4 : Tentative avec une requête plus simple pour éviter l'erreur HTML
    { url: "https://api.consumet.org/anime/zoro/watch", type: "consumet", name: "consumet-zoro" } 
];

// Le Proxy CORS public
const CORS_PROXY = "https://corsproxy.io/?"; 

const videoIframe = document.getElementById('video-player-iframe');
const titleDisplay = document.getElementById('display-episode-title');
const episodeControls = document.getElementById('episode-controls');

/**
 * Tente de charger la vidéo en passant en revue toutes les APIs de la liste.
 */
async function loadEpisodePlayer() {
    const urlParams = new URLSearchParams(window.location.search);
    const animeId = urlParams.get('id');
    const episodeNumber = urlParams.get('episode');

    if (!animeId || !episodeNumber) {
        titleDisplay.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Paramètres ID et Épisode manquants dans l\'URL.';
        return;
    }

    let videoFound = false;
    let lastError = null;

    // 🚨 BOUCLE DE REPLI (Tente chaque API dans l'ordre)
    for (let i = 0; i < EXTERNAL_APIS.length; i++) {
        const api = EXTERNAL_APIS[i];
        const apiName = api.name;
        titleDisplay.textContent = `Tentative de connexion à l'API ${i + 1} (${apiName})...`;
        
        let targetUrl;
        
        // Construction de l'URL spécifique à l'API
        if (api.type === "simple") {
            targetUrl = `${api.url}/${animeId}/${episodeNumber}`;
        } else if (api.type === "consumet") {
            // 🚨 MODIFICATION CLÉ : Simplification de la requête Consumet (basé sur le MAL ID)
            // L'API Consumet n'est pas optimisée pour le MAL ID, mais nous tentons le format le plus simple.
            targetUrl = `https://api.consumet.org/anime/zoro/watch?episodeId=${animeId}-${episodeNumber}`; 
        }

        try {
            const finalUrl = `${CORS_PROXY}${encodeURIComponent(targetUrl)}`;
            const response = await fetch(finalUrl);
            
            if (!response.ok) {
                // Stocke l'erreur et passe à l'API suivante.
                throw new Error(`Échec (Statut: ${response.status})`);
            }
            
            // Correction pour l'erreur JSON/HTML
            let data;
            try {
                data = await response.json();
            } catch (e) {
                // Si la réponse n'est pas du JSON (c'est probablement du HTML), on la rejette
                throw new Error("Réponse non valide (format HTML/Texte)");
            }

            // Vérification de la source vidéo
            if (data.sources && data.sources.length > 0) {
                // SUCCÈS : Vidéo trouvée.
                const streamUrl = data.sources[0].url; 
                
                videoIframe.src = streamUrl;
                titleDisplay.innerHTML = `<i class="fas fa-play-circle"></i> Lecture - Épisode ${episodeNumber} (Source ${apiName})`;
                renderEpisodeControls(animeId, parseInt(episodeNumber), data.totalEpisodes || 0); 
                videoFound = true;
                break; // Sort de la boucle après succès
            } else {
                throw new Error(`Aucune source vidéo retournée.`);
            }

        } catch (error) {
            console.error(`Erreur sur ${apiName}:`, error);
            lastError = error;
            // Continue la boucle
        }
    }

    // GESTION DE L'ÉCHEC FINAL
    if (!videoFound) {
        let finalMessage = "Échec total de la lecture. Aucune des APIs n'a pu fournir la source.";
        if (lastError && lastError.message) {
             // Message d'erreur plus convivial pour le 404
             if (lastError.message.includes("Statut: 404")) {
                 finalMessage = `Échec 404 sur toutes les sources. L'anime (ID:${animeId}) n'est pas supporté.`;
             } else {
                 finalMessage += ` Dernière erreur: ${lastError.message}`;
             }
        }
        titleDisplay.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${finalMessage}`;
        videoIframe.src = ''; 
    }
}

/**
 * Affiche les boutons pour naviguer aux épisodes. (Inchangée)
 */
function renderEpisodeControls(animeId, currentEpisode, totalEpisodes) {
    episodeControls.innerHTML = ''; 
    
    // Bouton Précédent
    if (currentEpisode > 1) {
        const prevEpisode = currentEpisode - 1;
        episodeControls.insertAdjacentHTML('beforeend', `
            <a href="watch.html?id=${animeId}&episode=${prevEpisode}" class="submit-button" style="margin-right: 15px;">
                <i class="fas fa-chevron-left"></i> Épisode ${prevEpisode}
            </a>
        `);
    }

    // Bouton Suivant
    if (currentEpisode < totalEpisodes) {
        const nextEpisode = currentEpisode + 1;
        episodeControls.insertAdjacentHTML('beforeend', `
            <a href="watch.html?id=${animeId}&episode=${nextEpisode}" class="submit-button">
                Épisode ${nextEpisode} <i class="fas fa-chevron-right"></i>
            </a>
        `);
    }
}

document.addEventListener('DOMContentLoaded', loadEpisodePlayer);
