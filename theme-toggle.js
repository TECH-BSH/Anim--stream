// Fichier : theme-toggle.js

document.addEventListener('DOMContentLoaded', () => {
    // 1. Récupération des éléments
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // 2. Détection de la préférence utilisateur stockée
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // 3. Application du thème initial au chargement
    if (storedTheme) {
        // Applique le thème stocké
        body.setAttribute('data-theme', storedTheme);
    } else if (prefersDark) {
        // Applique le thème sombre par défaut si le système le préfère
        body.setAttribute('data-theme', 'dark');
    } else {
        // Applique le thème clair par défaut
        body.setAttribute('data-theme', 'light');
    }

    // 4. Mise à jour de l'icône du bouton au chargement
    updateToggleIcon(body.getAttribute('data-theme'));

    // 5. Gestion de l'événement de clic
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            let currentTheme = body.getAttribute('data-theme');
            let newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            // Met à jour l'attribut sur le body
            body.setAttribute('data-theme', newTheme);
            
            // Stocke le nouveau thème dans le localStorage
            localStorage.setItem('theme', newTheme);
            
            // Met à jour l'icône
            updateToggleIcon(newTheme);
        });
    }
});

/**
 * Met à jour l'icône du bouton (Soleil/Lune) en fonction du thème actif.
 */
function updateToggleIcon(theme) {
    const iconElement = document.getElementById('theme-toggle-icon');
    if (iconElement) {
        if (theme === 'dark') {
            // Thème sombre : afficher l'icône Soleil
            iconElement.classList.remove('fa-moon');
            iconElement.classList.add('fa-sun');
        } else {
            // Thème clair : afficher l'icône Lune
            iconElement.classList.remove('fa-sun');
            iconElement.classList.add('fa-moon');
        }
    }
}
