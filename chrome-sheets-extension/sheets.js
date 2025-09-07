// sheets.js - Connexion Google Sheets et conversion en CSV

/**
 * Classe SheetsManager pour gérer la connexion Google Sheets
 */
class SheetsManager {
    constructor() {
        // ID du Google Sheet en dur
        // L'ID se trouve dans l'URL: https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit
        // ID configuré : 1kJo3UeMN_Nr05PW4Zpo2XpxbXTwsE-Dxec0qsP77Nf4
        this.spreadsheetId = '1kJo3UeMN_Nr05PW4Zpo2XpxbXTwsE-Dxec0qsP77Nf4';
        
        // Plage de données à récupérer
        this.range = 'Sheet1!A1:Z100';
        
        // URL de l'API Google Sheets
        this.apiBaseUrl = 'https://sheets.googleapis.com/v4/spreadsheets';
    }

    /**
     * Récupère les données depuis Google Sheets
     * @returns {Object} - Les données de la feuille
     */
    async fetchSheetData() {
        console.log('Récupération des données Google Sheets...');
        console.log('Spreadsheet ID:', this.spreadsheetId);
        
        try {
            console.log('Tentative de connexion au Sheet ID:', this.spreadsheetId);
            
            // Obtenir le token d'authentification
            const token = await this.getAuthToken();
            
            if (!token) {
                console.warn('Pas de token d\'authentification - Utilisation de données de test');
                return this.getMockData();
            }
            
            // Construire l'URL de l'API
            const url = `${this.apiBaseUrl}/${this.spreadsheetId}/values/${this.range}`;
            
            // Faire la requête à l'API
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('Données récupérées avec succès:', data.values?.length, 'lignes');
            
            return data;
        } catch (error) {
            console.error('Erreur de récupération des données:', error);
            // En cas d'erreur, retourner des données de test
            return this.getMockData();
        }
    }

    /**
     * Obtient le token d'authentification OAuth2
     * @returns {string} - Le token d'accès
     */
    async getAuthToken() {
        return new Promise((resolve) => {
            // Utiliser l'API Chrome Identity pour l'authentification
            if (chrome.identity && chrome.identity.getAuthToken) {
                chrome.identity.getAuthToken({ interactive: true }, (token) => {
                    if (chrome.runtime.lastError) {
                        console.error('Erreur d\'authentification:', chrome.runtime.lastError);
                        resolve(null);
                    } else {
                        console.log('Token obtenu avec succès');
                        resolve(token);
                    }
                });
            } else {
                // Si l'API Identity n'est pas disponible
                console.warn('API Chrome Identity non disponible');
                resolve(null);
            }
        });
    }

    /**
     * Convertit les données Google Sheets en format CSV
     * @param {Object} sheetData - Les données de l'API Google Sheets
     * @returns {string} - Les données au format CSV
     */
    convertToCSV(sheetData) {
        console.log('Conversion des données en CSV...');
        
        try {
            // Vérifier si les données sont valides
            if (!sheetData || !sheetData.values || sheetData.values.length === 0) {
                console.warn('Aucune donnée à convertir');
                return '';
            }
            
            const rows = sheetData.values;
            
            // Convertir chaque ligne en CSV
            const csvLines = rows.map(row => {
                // Échapper les valeurs contenant des virgules ou des guillemets
                return row.map(cell => {
                    // Convertir en string si nécessaire
                    const value = String(cell || '');
                    
                    // Si la valeur contient une virgule, un guillemet ou une nouvelle ligne
                    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                        // Échapper les guillemets en les doublant
                        const escaped = value.replace(/"/g, '""');
                        // Entourer de guillemets
                        return `"${escaped}"`;
                    }
                    
                    return value;
                }).join(',');
            });
            
            // Joindre toutes les lignes
            const csv = csvLines.join('\n');
            
            console.log('Conversion terminée:', csvLines.length, 'lignes');
            return csv;
        } catch (error) {
            console.error('Erreur de conversion CSV:', error);
            return '';
        }
    }

    /**
     * Retourne des données de test pour le développement
     * @returns {Object} - Données simulées au format Google Sheets API
     */
    getMockData() {
        console.log('Utilisation de données de test...');
        
        return {
            range: 'Sheet1!A1:C10',
            majorDimension: 'ROWS',
            values: [
                ['Nom', 'Prix', 'Quantité'],
                ['Produit A', '100', '5'],
                ['Produit B', '50', '10'],
                ['Produit C', '75', '3'],
                ['Produit D', '120', '8'],
                ['Produit E', '45', '15'],
                ['Produit F', '200', '2'],
                ['Produit G', '30', '20'],
                ['Produit H', '90', '7'],
                ['Produit I', '60', '12']
            ]
        };
    }

    /**
     * Valide l'ID du Google Sheet
     * @param {string} id - L'ID à valider
     * @returns {boolean} - True si l'ID est valide
     */
    validateSpreadsheetId(id) {
        // Un ID Google Sheets est généralement une chaîne alphanumérique
        // d'environ 44 caractères
        const idPattern = /^[a-zA-Z0-9-_]{20,60}$/;
        return idPattern.test(id);
    }

    /**
     * Met à jour l'ID du spreadsheet
     * @param {string} newId - Le nouvel ID
     */
    setSpreadsheetId(newId) {
        if (this.validateSpreadsheetId(newId)) {
            this.spreadsheetId = newId;
            console.log('ID du spreadsheet mis à jour:', newId);
            return true;
        } else {
            console.error('ID de spreadsheet invalide:', newId);
            return false;
        }
    }

    /**
     * Récupère les métadonnées du spreadsheet
     */
    async getSpreadsheetMetadata() {
        try {
            const token = await this.getAuthToken();
            
            if (!token) {
                return null;
            }
            
            const url = `${this.apiBaseUrl}/${this.spreadsheetId}?fields=properties.title,sheets.properties`;
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`Erreur: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erreur de récupération des métadonnées:', error);
            return null;
        }
    }
}

// Rendre la classe disponible globalement pour l'extension
if (typeof window !== 'undefined') {
    window.SheetsManager = SheetsManager;
}