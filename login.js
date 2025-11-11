// Fichier : login.js

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const messageArea = document.getElementById('message-area');
    const googleButton = document.getElementById('google-login-button');

    // --- 🚨 SIMULATION DE LA BASE DE DONNÉES ---
    // En front-end, nous ne pouvons pas vérifier une vraie base de données.
    // Nous simulerons un seul utilisateur existant pour le test.
    const TEST_USER = {
        email: 'utilisateur@test.com',
        password: 'password123' 
    };
    // ------------------------------------------

    /**
     * Affiche un message de statut (erreur ou succès)
     * @param {string} message - Le texte du message
     * @param {string} type - 'success' ou 'error'
     */
    function showMessage(message, type) {
        messageArea.textContent = message;
        messageArea.className = `message-area ${type}`;
        messageArea.style.display = 'block';
        
        // Cache le message après 5 secondes
        setTimeout(() => {
            messageArea.style.display = 'none';
        }, 5000);
    }

    // GESTION DE LA SOUMISSION DU FORMULAIRE
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Empêche le rechargement de la page

        const enteredUsername = usernameInput.value.trim();
        const enteredPassword = passwordInput.value.trim();

        // 1. Vérification simple si le compte existe (SIMULÉE)
        if (enteredUsername === TEST_USER.email && enteredPassword === TEST_USER.password) {
            
            // 2. Connexion réussie
            showMessage('✅ Connexion réussie ! Redirection...', 'success');
            
            // Simuler une redirection après un délai
            setTimeout(() => {
                window.location.href = 'index.html'; 
            }, 1500);

        } else if (enteredUsername === TEST_USER.email && enteredPassword !== TEST_USER.password) {
            
            // 3. Compte trouvé, mais mot de passe incorrect
            showMessage('❌ Mot de passe incorrect pour cet utilisateur.', 'error');
            
        } else {
            
            // 4. Compte non trouvé
            showMessage('❌ Utilisateur non trouvé. Veuillez créer un compte.', 'error');
        }
    });

    // GESTION DU BOUTON GOOGLE (SIMULÉE)
    googleButton.addEventListener('click', () => {
        showMessage('🌐 Connexion avec Google simulée... (L\'intégration réelle nécessite une API Google).', 'success');
        
        // Dans une application réelle, cela ouvrirait une fenêtre pop-up de Google
        // et attendrait la réponse du serveur.
    });
});
