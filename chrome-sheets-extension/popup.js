// popup.js - Gère l'interaction utilisateur et envoie les requêtes au script d'arrière-plan

document.addEventListener('DOMContentLoaded', function() {
    // Récupération des éléments DOM
    const queryInput = document.getElementById('queryInput');
    const executeBtn = document.getElementById('executeBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    const resultsDiv = document.getElementById('results');
    const statusDiv = document.getElementById('status');

    // Initialisation au chargement
    initialize();

    // Gestionnaire du bouton Exécuter
    executeBtn.addEventListener('click', executeQuery);
    
    // Gestionnaire du bouton Rafraîchir
    refreshBtn.addEventListener('click', refreshData);

    // Permettre l'exécution avec la touche Entrée
    queryInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            executeQuery();
        }
    });

    /**
     * Initialise l'extension en vérifiant si les données sont chargées
     */
    async function initialize() {
        // Initialisation silencieuse
        
        try {
            // Envoyer un message au background script pour initialiser
            const response = await chrome.runtime.sendMessage({
                action: 'initialize'
            });
            
            if (response && response.success) {
                // Ne pas afficher de message au démarrage pour rester minimaliste
                console.log('Extension initialisée');
            } else {
                showStatus(response?.error || 'Erreur d\'initialisation', 'error');
            }
        } catch (error) {
            console.error('Erreur d\'initialisation:', error);
            showStatus('Erreur de connexion au service', 'error');
        }
    }

    /**
     * Exécute la requête en langage naturel
     */
    async function executeQuery() {
        const query = queryInput.value.trim();
        
        // Validation de la requête
        if (!query) {
            showStatus('Veuillez entrer une requête', 'error');
            return;
        }

        // Désactiver le bouton pendant l'exécution
        executeBtn.disabled = true;
        resultsDiv.innerHTML = '';
        showStatus('Exécution de la requête...', 'loading');

        try {
            // Envoyer la requête au background script
            const response = await chrome.runtime.sendMessage({
                action: 'executeQuery',
                query: query
            });

            if (response && response.success) {
                // Afficher les résultats
                displayResults(response.data);
                
                // Afficher la requête SQL générée (pour debug)
                if (response.sql) {
                    console.log('SQL généré:', response.sql);
                }
                
                showStatus(`${response.data.length} résultat(s)`, 'success');
            } else {
                // Afficher l'erreur
                showStatus(response?.error || 'Erreur lors de l\'exécution', 'error');
                resultsDiv.innerHTML = `<span style="color: red;">Erreur: ${response?.error || 'Inconnue'}</span>`;
            }
        } catch (error) {
            console.error('Erreur d\'exécution:', error);
            showStatus('Erreur de communication', 'error');
            resultsDiv.innerHTML = `<span style="color: red;">Erreur: ${error.message}</span>`;
        } finally {
            // Réactiver le bouton
            executeBtn.disabled = false;
        }
    }

    /**
     * Affiche les résultats formatés
     * @param {Array} data - Les données à afficher
     */
    function displayResults(data) {
        if (!data || data.length === 0) {
            resultsDiv.innerHTML = '<em>Aucun résultat trouvé</em>';
            return;
        }

        // Formater les résultats en JSON indenté
        try {
            const formatted = JSON.stringify(data, null, 2);
            resultsDiv.innerHTML = formatted;
            
            // Ajouter un style pour une meilleure lisibilité
            resultsDiv.style.color = '#333';
        } catch (error) {
            console.error('Erreur de formatage:', error);
            resultsDiv.innerHTML = '<em>Erreur lors du formatage des résultats</em>';
        }
    }

    /**
     * Rafraîchit les données depuis Google Sheets
     */
    async function refreshData() {
        showStatus('Rafraîchissement des données...', 'loading');
        refreshBtn.disabled = true;
        
        try {
            const response = await chrome.runtime.sendMessage({
                action: 'refreshData'
            });
            
            if (response && response.success) {
                showStatus('Données actualisées', 'success');
                
                // Log pour debug
                console.log('Données rafraîchies avec succès');
            } else {
                showStatus('Erreur lors du rafraîchissement', 'error');
            }
        } catch (error) {
            console.error('Erreur:', error);
            showStatus('Erreur de communication', 'error');
        } finally {
            refreshBtn.disabled = false;
        }
    }
    
    /**
     * Affiche un message de statut
     * @param {string} message - Le message à afficher
     * @param {string} type - Le type de message (loading, error, success)
     */
    function showStatus(message, type) {
        statusDiv.className = `status ${type} show`;
        
        if (type === 'loading') {
            statusDiv.innerHTML = `${message} <span class="loader"></span>`;
        } else {
            statusDiv.innerHTML = message;
        }

        // Masquer automatiquement les messages de succès après 3 secondes
        if (type === 'success') {
            setTimeout(() => {
                statusDiv.classList.remove('show');
                setTimeout(() => {
                    statusDiv.innerHTML = '';
                    statusDiv.className = '';
                }, 300);
            }, 3000);
        }
    }

    /**
     * Charge les exemples de requêtes (optionnel)
     */
    function loadExamples() {
        const examples = [
            "prix > 50",
            "quantité < 10",
            "nom contient 'Produit'",
            "prix entre 20 et 100"
        ];
        
        // Afficher un exemple aléatoire dans le placeholder
        const randomExample = examples[Math.floor(Math.random() * examples.length)];
        queryInput.placeholder = `Ex: ${randomExample}`;
    }

    // Charger un exemple au démarrage
    loadExamples();
});