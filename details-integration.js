// Fichier : details-integration.js (Ajouter ces fonctions en haut ou à la fin)

const FAVORITES_STORAGE_KEY = 'userFavorites';

/**
 * Récupère la liste de favoris de l'utilisateur actuel dans le localStorage.
 * @returns {Array} La liste des ID d'anime/manga favoris.
 */
function getFavorites() {
    // Récupère la chaîne de caractères et la transforme en tableau, ou retourne un tableau vide
    const favorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return favorites ? JSON.parse(favorites) : [];
}

/**
 * Ajoute ou retire un item (anime/manga) des favoris.
 * @param {string} id - L'ID de l'item.
 * @param {object} itemData - Les données de l'item (pour le stockage des détails).
 * @returns {Array} La nouvelle liste de favoris.
 */
function toggleFavorite(id, itemData) {
    let favorites = getFavorites();
    const index = favorites.findIndex(item => item.id === id);

    if (index === -1) {
        // Ajouter aux favoris
        // On stocke l'ID et les infos minimales pour l'affichage dans le profil
        favorites.push({
            id: id,
            title: itemData.title_english || itemData.title,
            image: itemData.images.jpg.image_url,
            type: itemData.type,
            score: itemData.score
        });
        console.log(`Ajouté ${id} aux favoris.`);
    } else {
        // Retirer des favoris
        favorites.splice(index, 1);
        console.log(`Retiré ${id} des favoris.`);
    }

    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    return favorites;
}
