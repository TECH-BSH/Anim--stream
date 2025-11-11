// Fichier : register.js

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const emailInput = document.getElementById('email');
    const usernameInput = document.getElementById('reg-username');
    const passwordInput = document.getElementById('reg-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const messageArea = document.getElementById('message-area');
    const googleButton = document.getElementById('google-register-button');

    // Utilisateur de test EXISTANT (pour simuler une erreur "déjà pris")
    const EXISTING_USER_EMAIL = 'alice@test.com'; 

    /**
     * Affiche un message de statut (erreur ou succès)
     */
    function showMessage(message, type) {
        messageArea.textContent = message;
        messageArea.className = `message-area ${type}`;
        messageArea.style.display = 'block';
        
        setTimeout(() => {
            messageArea.style.display = 'none';
        }, 5000);
    }

    // GESTION DE LA SOUMISSION DU FORMULAIRE D'INSCRIPTION
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault(); 

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();

        // 1. Vérification du mot de passe
        if (password !== confirmPassword) {
            showMessage('❌ Les deux mots de passe ne correspondent pas.', 'error');
            return;
        }

        // 2. Vérification de la longueur minimale du mot de passe (sécurité)
        if (password.length < 6) {
            showMessage('❌ Le mot de passe doit contenir au moins 6 caractères.', 'error');
            return;
        }
        
        // 3. Simulation de l'utilisateur déjà existant
        if (email === EXISTING_USER_EMAIL) {
            showMessage('❌ Cet email est déjà utilisé. Veuillez vous connecter.', 'error');
            return;
        }

        // 4. Succès de l'inscription
        // Dans une application réelle, les données seraient envoyées à une base de données ici.
        showMessage(`✅ Compte créé pour ${usernameInput.value} ! Redirection vers la connexion...`, 'success');
        
        // Simuler une redirection après un délai
        setTimeout(() => {
            // Après l'inscription, l'utilisateur est généralement redirigé vers la page de connexion
            window.location.href = 'login.html'; 
        }, 2000);

    });

    // GESTION DU BOUTON GOOGLE (SIMULÉE)
    googleButton.addEventListener('click', () => {
        showMessage('🌐 Inscription avec Google simulée... (L\'intégration réelle nécessite une API Google).', 'success');
    });
});
