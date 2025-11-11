// Fichier : auth-header.js

// Clés de stockage local
const USER_STORAGE_KEY = 'animeUserLoggedIn';
const REGISTERED_USER_KEY = 'lastRegisteredUser';

// Données utilisateur SIMULÉES par défaut
const DEFAULT_USER = {
    username: "AnimeFan2025",
    email: "fan@anime.fr"
};

const authControls = document.getElementById('auth-controls');

/**
 * Lit l'état de connexion de l'utilisateur dans le stockage local.
 * @returns {object|null} Les données de l'utilisateur si connecté, sinon null.
 */
function getLoggedInUser() {
    const user = localStorage.getItem(USER_STORAGE_KEY);
    return user ? JSON.parse(user) : null;
}

/**
 * Simule la déconnexion de l'utilisateur.
 * **CETTE FONCTION EST CORRIGÉE POUR ASSURER LA REDIRECTION.**
 */
function logout() {
    // 1. Supprime la session de l'utilisateur
    localStorage.removeItem(USER_STORAGE_KEY);
    
    // 2. Redirection vers l'accueil (index.html)
    // Utilisation de la méthode replace pour garantir la redirection et éviter le cache de l'historique
    window.location.replace('index.html'); 
}

/**
 * Met à jour l'en-tête pour afficher les boutons corrects.
 */
function updateAuthHeader() {
    const user = getLoggedInUser();
    const themeToggle = document.getElementById('theme-toggle');
    
    // Nettoyer l'espace des contrôles
    authControls.innerHTML = '';
    
    if (user) {
        // --- VUE CONNECTÉE ---
        const profileButton = document.createElement('a');
        profileButton.href = 'profile.html';
        profileButton.classList.add('auth-button', 'profile-btn');
        profileButton.innerHTML = `<i class="fas fa-user"></i> ${user.username}`;
        
        const logoutButton = document.createElement('a');
        logoutButton.href = '#'; // Le '#' est correct, la navigation est gérée par JS
        logoutButton.classList.add('auth-button', 'logout-btn');
        logoutButton.innerHTML = `<i class="fas fa-sign-out-alt"></i> Déconnexion`;
        
        // Attacher l'événement de déconnexion
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault(); 
            logout();          // Appel de la fonction de déconnexion
        });
        
        authControls.appendChild(profileButton);
        authControls.appendChild(logoutButton);

        // Mise à jour des détails de profil si sur profile.html
        if (document.body.classList.contains('profile-page')) {
            const usernameDisplay = document.getElementById('username-display');
            const emailDisplay = document.getElementById('email-display');
            const profileTitle = document.getElementById('profile-title');
            const logoutButtonPage = document.getElementById('logout-button-page');

            if (usernameDisplay) usernameDisplay.textContent = user.username;
            if (emailDisplay) emailDisplay.textContent = user.email;
            if (profileTitle) profileTitle.innerHTML = `<i class="fas fa-user-circle"></i> Bienvenue, ${user.username}`;
            
            if (logoutButtonPage) {
                logoutButtonPage.addEventListener('click', logout);
            }
        }

    } else {
        // --- VUE DÉCONNECTÉE ---
        const loginButton = document.createElement('a');
        loginButton.href = 'login.html';
        loginButton.classList.add('auth-button', 'login-btn');
        loginButton.textContent = 'Connexion';

        const registerButton = document.createElement('a');
        registerButton.href = 'register.html';
        registerButton.classList.add('auth-button', 'register-btn');
        registerButton.textContent = 'Inscription';

        authControls.appendChild(loginButton);
        authControls.appendChild(registerButton);
    }
    
    // Remettre le bouton de thème à la fin (s'il existe)
    if (themeToggle) {
        authControls.appendChild(themeToggle);
    }
}

// ------------------------------------------------------------------
// Logique d'authentification (Simulation)
// ------------------------------------------------------------------

/**
 * Simule la connexion. Vérifie si l'utilisateur existe dans le stockage local
 * (priorité au compte inscrit) ou utilise l'utilisateur par défaut.
 */
window.simulateLogin = function(enteredUsername, enteredPassword) {
    const registeredUser = localStorage.getItem(REGISTERED_USER_KEY);
    let userToLog = null; 

    const entry = enteredUsername.toLowerCase();
    
    // 1. Priorité à l'utilisateur qui s'est inscrit
    if (registeredUser) {
        const parsedUser = JSON.parse(registeredUser);
        
        if (parsedUser.username.toLowerCase() === entry) {
             userToLog = parsedUser;
        } 
    }

    // 2. Si pas trouvé, vérifier si c'est l'utilisateur par défaut
    if (!userToLog && DEFAULT_USER.username.toLowerCase() === entry) {
        userToLog = DEFAULT_USER;
    }
    
    // 3. Échec si aucun utilisateur n'a été trouvé
    if (!userToLog) {
        return false;
    }

    // 4. Succès de la connexion (simulée)
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userToLog));
    return true;
}

// ------------------------------------------------------------------
// Exécution initiale
// ------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // Ajouter la classe pour identifier la page de profil
    if (window.location.pathname.includes('profile.html')) {
        document.body.classList.add('profile-page');
    }

    // Rediriger vers la connexion si la page de profil est accédée sans être connecté
    if (window.location.pathname.includes('profile.html') && !getLoggedInUser()) {
        window.location.href = 'login.html';
        return;
    }
    
    updateAuthHeader();
});
