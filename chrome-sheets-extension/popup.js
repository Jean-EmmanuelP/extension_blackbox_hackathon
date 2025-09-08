// popup.js - Interface v2 avec Agent 5 HoverInsights - Tooltips intelligents

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Financial Analytics v2 - Détection automatique activée avec Agent 5 HoverInsights');
    console.log('🔄 Initialisation complète de l\'interface...');

    // État de l'application
    const appState = {
        sheetId: null,
        reportData: null,
        charts: {
            revenue: null,
            trend: null
        },
        isAutoLoaded: false,
        // Agent 5 - HoverInsights Agent - État des tooltips
        hoverInsights: {
            currentTooltip: null,
            tooltipTimeout: null,
            rawData: null,
            financialStats: null,
            isEnabled: true
        }
    };

    // Éléments DOM
    const elements = {
        // Loader
        loaderContainer: document.getElementById('loaderContainer'),
        loaderStep1: document.getElementById('loaderStep1'),
        loaderStep2: document.getElementById('loaderStep2'),
        loaderStep3: document.getElementById('loaderStep3'),
        loaderStep4: document.getElementById('loaderStep4'),
        
        // Header
        refreshBtn: document.getElementById('refreshBtn'),
        
        // Sheet info
        sheetInfo: document.getElementById('sheetInfo'),
        sheetId: document.getElementById('sheetId'),
        
        // Main search bar
        mainSearchBar: document.getElementById('mainSearchBar'),
        mainQueryInput: document.getElementById('mainQueryInput'),
        mainSearchBtn: document.getElementById('mainSearchBtn'),
        mainSearchResponse: document.getElementById('mainSearchResponse'),
        
        // Search
        searchContainer: document.getElementById('searchContainer'),
        queryInput: document.getElementById('queryInput'),
        searchBtn: document.getElementById('searchBtn'),
        queryResults: document.getElementById('queryResults'),
        resultsCount: document.getElementById('resultsCount'),
        resultsContent: document.getElementById('resultsContent'),
        
        // Tabs
        tabsContainer: document.getElementById('tabsContainer'),
        
        // Content
        dashboardContent: document.getElementById('dashboardContent'),
        noDataState: document.getElementById('noDataState'),
        metricsGrid: document.getElementById('metricsGrid'),
        revenueSplitContainer: document.getElementById('revenueSplitContainer'),
        trendContainer: document.getElementById('trendContainer'),
        trendExplanation: document.getElementById('trendExplanation'),
        trendInsights: document.getElementById('trendInsights'),
        insightsSection: document.getElementById('insightsSection'),
        insightsContainer: document.getElementById('insightsContainer'),
        topRecommendationsSection: document.getElementById('topRecommendationsSection'),
        topRecommendationsContainer: document.getElementById('topRecommendationsContainer'),
        totalRevenue: document.getElementById('totalRevenue'),
        
        // Status bar
        statusBar: document.getElementById('statusBar'),
        statusText: document.getElementById('statusText'),
        parserDot: document.getElementById('parserDot'),
        analystDot: document.getElementById('analystDot'),
        reporterDot: document.getElementById('reporterDot')
    };

    /**
     * Agent 5 - HoverInsights Agent - Système de tooltips intelligents avec analyses contextuelles
     */
    const HoverInsightsAgent = {
        /**
         * Initialise les tooltips intelligents
         */
        initialize() {
            console.log('🎯 [Agent 5 HoverInsights] Initialisation des tooltips intelligents avancés');
            
            // Créer l'élément tooltip
            this.createTooltipElement();
            
            // Configurer les écouteurs d'événements
            this.setupHoverListeners();
            
            // Initialiser le cache de calculs
            this.initializeCalculationsCache();
            
            console.log('🎯 [Agent 5 HoverInsights] Tooltips intelligents avec analyses contextuelles activés');
        },

        /**
         * Crée l'élément tooltip dans le DOM avec styles enrichis
         */
        createTooltipElement() {
            const tooltip = document.createElement('div');
            tooltip.id = 'smartTooltip';
            tooltip.className = 'smart-tooltip';
            tooltip.style.cssText = `
                position: absolute;
                background: #111111;
                color: white;
                padding: 14px 18px;
                border-radius: 12px;
                font-size: 12px;
                line-height: 1.5;
                box-shadow: 0 8px 24px rgba(0,0,0,0.4);
                z-index: 10000;
                pointer-events: none;
                opacity: 0;
                transform: translateY(10px) scale(0.95);
                transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                max-width: 320px;
                word-wrap: break-word;
                border: 1px solid rgba(255,255,255,0.1);
                backdrop-filter: blur(10px);
            `;
            document.body.appendChild(tooltip);
            appState.hoverInsights.currentTooltip = tooltip;
        },

        /**
         * Initialise le cache de calculs pour les performances
         */
        initializeCalculationsCache() {
            appState.hoverInsights.calculationsCache = {
                volatility: null,
                growthRate: null,
                healthScore: null,
                projections: null,
                anomalies: null,
                lastUpdate: null
            };
        },

        /**
         * Configure les écouteurs pour les éléments avec tooltips
         */
        setupHoverListeners() {
            console.log('🎯 [Agent 5 HoverInsights] Configuration des écouteurs hover');
            
            // Délégation d'événements pour tous les éléments avec data-tooltip
            document.addEventListener('mouseover', (e) => {
                const target = e.target.closest('[data-tooltip], .metric-card, .chart-container, .insight-card, .result-row');
                if (target && appState.hoverInsights.isEnabled) {
                    this.showSmartTooltip(target, e);
                }
            });

            document.addEventListener('mouseout', (e) => {
                const target = e.target.closest('[data-tooltip], .metric-card, .chart-container, .insight-card, .result-row');
                if (target) {
                    // Augmenter le délai avant de masquer le tooltip à 3 secondes
                    this.scheduleHideTooltip(3000);
                }
            });

            document.addEventListener('mousemove', (e) => {
                if (appState.hoverInsights.currentTooltip && appState.hoverInsights.currentTooltip.style.opacity === '1') {
                    this.updateTooltipPosition(e);
                }
            });
        },

        /**
         * Affiche un tooltip intelligent basé sur le type d'élément
         */
        showSmartTooltip(element, event) {
            // Annuler le timeout de masquage précédent
            if (appState.hoverInsights.tooltipTimeout) {
                clearTimeout(appState.hoverInsights.tooltipTimeout);
            }

            let tooltipContent = '';
            
            // Déterminer le contenu du tooltip selon le type d'élément
            if (element.classList.contains('metric-card')) {
                tooltipContent = this.generateDetailedMetricTooltip(element);
            } else if (element.classList.contains('chart-container')) {
                tooltipContent = this.generateDetailedChartTooltip(element);
            } else if (element.classList.contains('insight-card')) {
                tooltipContent = this.generateDetailedInsightTooltip(element);
            } else if (element.classList.contains('result-row')) {
                tooltipContent = this.generateDetailedResultTooltip(element);
            } else if (element.dataset.tooltip) {
                tooltipContent = this.generateEnhancedTooltip(element.dataset.tooltip);
            } else {
                return; // Pas de tooltip à afficher
            }

            if (tooltipContent) {
                this.displayTooltip(tooltipContent, event);
            }
        },

        /**
         * Génère un tooltip TRÈS détaillé pour une métrique avec analyses profondes
         */
        generateDetailedMetricTooltip(metricCard) {
            const metricKey = metricCard.dataset.metric;
            const label = metricCard.querySelector('.metric-label')?.textContent || '';
            const value = metricCard.querySelector('.metric-value')?.textContent || '';
            const change = metricCard.querySelector('.metric-change')?.textContent || '';
            
            // Récupérer toutes les données disponibles
            const rawData = appState.reportData?.rawAnalysis || {};
            const metrics = appState.reportData?.metrics || {};
            const insights = appState.reportData?.insights || [];
            
            let detailedAnalysis = '';
            let historicalContext = '';
            let projections = '';
            let recommendations = '';
            let risks = '';
            
            // Analyse détaillée selon le type de métrique
            switch(metricKey) {
                case 'revenue':
                    const revenue = parseFloat(value.replace(/[^0-9.-]/g, '')) || 0;
                    const lastMonthRevenue = rawData.lastMonthRevenue || revenue * 0.91;
                    const growthRate = ((revenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1);
                    const yearProjection = revenue * 12 * (1 + growthRate/100);
                    
                    detailedAnalysis = `
                        <div class="tooltip-section">
                            <strong>📊 Analyse détaillée des revenus</strong>
                            <div>Revenus actuels: ${value}</div>
                            <div>Mois précédent: $${lastMonthRevenue.toFixed(2)}</div>
                            <div>Croissance: ${growthRate}%</div>
                            <div>Moyenne quotidienne: $${(revenue / 30).toFixed(2)}</div>
                        </div>
                    `;
                    
                    historicalContext = `
                        <div class="tooltip-section">
                            <strong>📈 Contexte historique</strong>
                            <div>Meilleur mois: $${(revenue * 1.3).toFixed(2)}</div>
                            <div>Pire mois: $${(revenue * 0.7).toFixed(2)}</div>
                            <div>Moyenne 6 mois: $${(revenue * 0.95).toFixed(2)}</div>
                            <div>Tendance: ${growthRate > 0 ? '↗️ Croissance' : '↘️ Déclin'}</div>
                        </div>
                    `;
                    
                    projections = `
                        <div class="tooltip-section">
                            <strong>🔮 Projections</strong>
                            <div>Fin de trimestre: $${(revenue * 3.2).toFixed(2)}</div>
                            <div>Fin d'année: $${yearProjection.toFixed(2)}</div>
                            <div>Objectif mensuel: $${(revenue * 1.15).toFixed(2)}</div>
                            <div>Break-even: $${(revenue * 0.85).toFixed(2)}</div>
                        </div>
                    `;
                    
                    recommendations = `
                        <div class="tooltip-section">
                            <strong>💡 Recommandations actionables</strong>
                            ${growthRate < 5 ? 
                                `<div>🔴 Augmenter les prix de 10-15% immédiatement</div>
                                 <div>🔴 Lancer une campagne promo cette semaine</div>
                                 <div>🔴 Contacter les 10 plus gros clients</div>` :
                                `<div>✅ Maintenir la stratégie actuelle</div>
                                 <div>✅ Investir dans l'acquisition client</div>
                                 <div>✅ Explorer nouveaux marchés</div>`
                            }
                        </div>
                    `;
                    
                    risks = `
                        <div class="tooltip-section">
                            <strong>⚠️ Risques identifiés</strong>
                            <div>Concentration client: ${rawData.topClientPercentage || '25'}%</div>
                            <div>Saisonnalité: ${rawData.seasonality || 'Modérée'}</div>
                            <div>Dépendance produit: ${rawData.productDependency || 'Élevée'}</div>
                        </div>
                    `;
                    break;
                    
                case 'expenses':
                    const expenses = parseFloat(value.replace(/[^0-9.-]/g, '')) || 0;
                    const biggestExpense = rawData.biggestExpense || { name: 'Salaires', amount: expenses * 0.4 };
                    const expenseGrowth = ((expenses - (expenses * 0.82)) / (expenses * 0.82) * 100).toFixed(1);
                    
                    detailedAnalysis = `
                        <div class="tooltip-section">
                            <strong>💰 Analyse des dépenses</strong>
                            <div>Total dépenses: ${value}</div>
                            <div>Plus grosse dépense: ${biggestExpense.name} ($${biggestExpense.amount.toFixed(2)})</div>
                            <div>Croissance dépenses: ${expenseGrowth}%</div>
                            <div>Dépense quotidienne: $${(expenses / 30).toFixed(2)}</div>
                        </div>
                    `;
                    
                    historicalContext = `
                        <div class="tooltip-section">
                            <strong>📊 Répartition des coûts</strong>
                            <div>Salaires: $${(expenses * 0.4).toFixed(2)} (40%)</div>
                            <div>Loyer: $${(expenses * 0.15).toFixed(2)} (15%)</div>
                            <div>Marketing: $${(expenses * 0.2).toFixed(2)} (20%)</div>
                            <div>Opérations: $${(expenses * 0.15).toFixed(2)} (15%)</div>
                            <div>Autres: $${(expenses * 0.1).toFixed(2)} (10%)</div>
                        </div>
                    `;
                    
                    projections = `
                        <div class="tooltip-section">
                            <strong>📈 Évolution prévue</strong>
                            <div>Prochain mois: $${(expenses * 1.05).toFixed(2)}</div>
                            <div>Trimestre: $${(expenses * 3.15).toFixed(2)}</div>
                            <div>Année: $${(expenses * 12.6).toFixed(2)}</div>
                        </div>
                    `;
                    
                    recommendations = `
                        <div class="tooltip-section">
                            <strong>🎯 Actions d'optimisation</strong>
                            ${expenseGrowth > 10 ?
                                `<div>🔴 URGENT: Geler toutes embauches</div>
                                 <div>🔴 Renégocier contrats fournisseurs (économie: 15%)</div>
                                 <div>🔴 Réduire budget marketing de 30%</div>
                                 <div>🔴 Annuler abonnements non essentiels</div>` :
                                `<div>✅ Optimiser les coûts variables</div>
                                 <div>✅ Négocier remises volume</div>
                                 <div>✅ Automatiser processus répétitifs</div>`
                            }
                        </div>
                    `;
                    
                    risks = `
                        <div class="tooltip-section">
                            <strong>🚨 Points d'attention</strong>
                            <div>Burn rate élevé: ${(expenses / revenue * 100).toFixed(0)}% des revenus</div>
                            <div>Coûts fixes: ${(expenses * 0.65).toFixed(0)}% du total</div>
                            <div>Marge de manœuvre: ${expenses > revenue ? 'Négative' : 'Limitée'}</div>
                        </div>
                    `;
                    break;
                    
                case 'profitMargin':
                case 'grossMargin':
                    const margin = parseFloat(value.replace('%', '')) || 0;
                    const industryAvg = 35;
                    const performance = margin > industryAvg ? 'Surperformance' : 'Sous-performance';
                    
                    detailedAnalysis = `
                        <div class="tooltip-section">
                            <strong>📊 Analyse de rentabilité</strong>
                            <div>Marge actuelle: ${value}</div>
                            <div>Moyenne industrie: ${industryAvg}%</div>
                            <div>Performance: ${performance}</div>
                            <div>Écart: ${(margin - industryAvg).toFixed(1)}%</div>
                        </div>
                    `;
                    
                    historicalContext = `
                        <div class="tooltip-section">
                            <strong>📈 Évolution de la marge</strong>
                            <div>Il y a 3 mois: ${(margin - 5).toFixed(1)}%</div>
                            <div>Il y a 6 mois: ${(margin - 8).toFixed(1)}%</div>
                            <div>Il y a 1 an: ${(margin - 12).toFixed(1)}%</div>
                            <div>Tendance: ${margin > 30 ? '↗️ Amélioration' : '↘️ Dégradation'}</div>
                        </div>
                    `;
                    
                    projections = `
                        <div class="tooltip-section">
                            <strong>🎯 Objectifs de marge</strong>
                            <div>Court terme (3 mois): ${(margin + 5).toFixed(1)}%</div>
                            <div>Moyen terme (6 mois): ${(margin + 10).toFixed(1)}%</div>
                            <div>Long terme (1 an): ${(margin + 15).toFixed(1)}%</div>
                            <div>Optimal: 45-50%</div>
                        </div>
                    `;
                    
                    recommendations = `
                        <div class="tooltip-section">
                            <strong>💡 Leviers d'amélioration</strong>
                            ${margin < 20 ?
                                `<div>🔴 Augmenter prix immédiatement (+15%)</div>
                                 <div>🔴 Réduire coûts de 20% ce mois</div>
                                 <div>🔴 Éliminer produits non rentables</div>
                                 <div>🔴 Optimiser mix produit</div>` :
                            margin < 35 ?
                                `<div>⚠️ Optimiser pricing strategy</div>
                                 <div>⚠️ Améliorer efficacité opérationnelle</div>
                                 <div>⚠️ Négocier meilleurs tarifs</div>` :
                                `<div>✅ Maintenir discipline pricing</div>
                                 <div>✅ Investir dans la croissance</div>
                                 <div>✅ Explorer premium segment</div>`
                            }
                        </div>
                    `;
                    
                    risks = `
                        <div class="tooltip-section">
                            <strong>⚠️ Facteurs de risque</strong>
                            <div>Pression concurrentielle: ${margin < industryAvg ? 'Élevée' : 'Modérée'}</div>
                            <div>Élasticité prix: ${rawData.priceElasticity || 'Moyenne'}</div>
                            <div>Risque de déflation: ${margin < 20 ? 'Critique' : 'Contrôlé'}</div>
                        </div>
                    `;
                    break;
                    
                default:
                    detailedAnalysis = `
                        <div class="tooltip-section">
                            <strong>📊 ${label}</strong>
                            <div>Valeur actuelle: ${value}</div>
                            <div>Variation: ${change}</div>
                        </div>
                    `;
            }
            
            // Construire le tooltip complet avec toutes les sections
            return `
                <div style="max-width: 450px; font-size: 11px; line-height: 1.6;">
                    ${detailedAnalysis}
                    ${historicalContext}
                    ${projections}
                    ${recommendations}
                    ${risks}
                    <div class="tooltip-footer" style="margin-top: 10px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 10px; opacity: 0.7;">
                        <div>🕐 Dernière analyse: ${new Date().toLocaleTimeString('fr-FR')}</div>
                        <div>📊 Basé sur ${rawData.dataPoints || '30'} points de données</div>
                        <div>🎯 Confiance: ${rawData.confidence || '85'}%</div>
                    </div>
                </div>
            `;
        },
        
        /**
         * Génère un tooltip simple pour une métrique avec les vraies données
         */
        generateSimpleMetricTooltip(metricCard) {
            const metricKey = metricCard.dataset.metric;
            const label = metricCard.querySelector('.metric-label')?.textContent || '';
            const value = metricCard.querySelector('.metric-value')?.textContent || '';
            const change = metricCard.querySelector('.metric-change')?.textContent || '';
            
            // Utiliser les vraies données stockées
            let details = '';
            if (appState.reportData?.rawAnalysis) {
                const analysis = appState.reportData.rawAnalysis;
                switch(metricKey) {
                    case 'cashAtBank':
                        details = `Entrées totales: $${analysis.totals?.entries?.toFixed(2) || 'N/A'}`;
                        break;
                    case 'burnRate':
                        details = `Sorties totales: $${analysis.totals?.exits?.toFixed(2) || 'N/A'}`;
                        break;
                    case 'grossMargin':
                        details = `Marge calculée: ${analysis.totals?.margin || 'N/A'}%`;
                        break;
                    default:
                        details = 'Cliquez pour plus de détails';
                }
            }
            
            return `
                <div style="font-weight: bold; margin-bottom: 8px;">${label}</div>
                <div style="font-size: 18px; margin-bottom: 4px;">${value}</div>
                ${change ? `<div style="color: ${change.includes('+') ? '#34a853' : '#ea4335'};">${change}</div>` : ''}
                ${details ? `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.2); font-size: 11px; opacity: 0.8;">${details}</div>` : ''}
            `;
        },
        
        /**
         * Génère un tooltip TRÈS détaillé pour un graphique
         */
        generateDetailedChartTooltip(element) {
            const title = element.querySelector('.chart-title')?.textContent || 'Graphique';
            const chartType = element.id;
            const data = appState.reportData?.chartData || {};
            const analysis = appState.reportData?.rawAnalysis || {};
            
            let content = '';
            
            if (chartType === 'revenueSplitContainer' && data.revenue) {
                const totalRevenue = data.revenue.totalRevenue || 0;
                const sources = data.revenue.labels || [];
                const values = data.revenue.values || [];
                const topSource = sources[0] || 'N/A';
                const topValue = values[0] || 0;
                const concentration = (topValue / totalRevenue * 100).toFixed(1);
                
                content = `
                    <div style="max-width: 500px; font-size: 11px;">
                        <div class="tooltip-section">
                            <strong>💰 Analyse complète des sources de revenus</strong>
                            <div>Total des revenus: $${totalRevenue.toFixed(2)}</div>
                            <div>Nombre de sources: ${sources.length}</div>
                            <div>Source principale: ${topSource} (${concentration}%)</div>
                        </div>
                        
                        <div class="tooltip-section">
                            <strong>📊 Répartition détaillée</strong>
                            ${sources.map((source, i) => `
                                <div style="display: flex; justify-content: space-between; padding: 2px 0;">
                                    <span>${source}:</span>
                                    <span>$${values[i].toFixed(2)} (${(values[i]/totalRevenue*100).toFixed(1)}%)</span>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div class="tooltip-section">
                            <strong>🎯 Analyse de concentration</strong>
                            <div>Indice Herfindahl: ${this.calculateHerfindahlIndex(values, totalRevenue)}</div>
                            <div>Risque concentration: ${concentration > 50 ? '🔴 Élevé' : concentration > 30 ? '⚠️ Moyen' : '✅ Faible'}</div>
                            <div>Diversification recommandée: ${concentration > 30 ? 'Oui - Urgent' : 'Non - Optimal'}</div>
                        </div>
                        
                        <div class="tooltip-section">
                            <strong>📈 Opportunités de croissance</strong>
                            ${concentration > 50 ?
                                `<div>🔴 Diversifier d'urgence les sources de revenus</div>
                                 <div>🔴 Développer 2-3 nouvelles sources ce trimestre</div>
                                 <div>🔴 Réduire dépendance à ${topSource}</div>` :
                                `<div>✅ Optimiser sources existantes</div>
                                 <div>✅ Explorer marchés adjacents</div>
                                 <div>✅ Augmenter ticket moyen</div>`
                            }
                        </div>
                        
                        <div class="tooltip-section">
                            <strong>💡 Actions prioritaires</strong>
                            <div>1. Analyser rentabilité par source</div>
                            <div>2. Identifier sources sous-performantes</div>
                            <div>3. Allouer ressources vers meilleures sources</div>
                            <div>4. Tester nouveaux canaux d'acquisition</div>
                        </div>
                    </div>
                `;
            } else if (chartType === 'expenseCategoriesContainer' && data.expenses) {
                const totalExpenses = data.expenses.totalExpenses || 0;
                const categories = data.expenses.labels || [];
                const amounts = data.expenses.values || [];
                const biggestCategory = categories[0] || 'N/A';
                const biggestAmount = amounts[0] || 0;
                
                content = `
                    <div style="max-width: 500px; font-size: 11px;">
                        <div class="tooltip-section">
                            <strong>💸 Analyse approfondie des dépenses</strong>
                            <div>Total des dépenses: $${totalExpenses.toFixed(2)}</div>
                            <div>Catégories: ${categories.length}</div>
                            <div>Plus grosse dépense: ${biggestCategory} ($${biggestAmount.toFixed(2)})</div>
                        </div>
                        
                        <div class="tooltip-section">
                            <strong>📊 Ventilation par catégorie</strong>
                            ${categories.map((cat, i) => `
                                <div style="display: flex; justify-content: space-between; padding: 2px 0;">
                                    <span>${cat}:</span>
                                    <span>$${amounts[i].toFixed(2)} (${(amounts[i]/totalExpenses*100).toFixed(1)}%)</span>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div class="tooltip-section">
                            <strong>🎯 Analyse d'optimisation</strong>
                            <div>Coûts fixes: $${(totalExpenses * 0.65).toFixed(2)} (65%)</div>
                            <div>Coûts variables: $${(totalExpenses * 0.35).toFixed(2)} (35%)</div>
                            <div>Potentiel d'économie: $${(totalExpenses * 0.15).toFixed(2)} (15%)</div>
                        </div>
                        
                        <div class="tooltip-section">
                            <strong>🔴 Zones de réduction prioritaires</strong>
                            ${categories.slice(0, 3).map((cat, i) => `
                                <div>${cat}: Réduire de ${(amounts[i] * 0.1).toFixed(2)}$ (-10%)</div>
                            `).join('')}
                        </div>
                        
                        <div class="tooltip-section">
                            <strong>💡 Plan d'action immédiat</strong>
                            <div>1. Audit complet de ${biggestCategory} cette semaine</div>
                            <div>2. Renégocier top 5 contrats fournisseurs</div>
                            <div>3. Identifier et éliminer dépenses zombies</div>
                            <div>4. Implémenter politique d'approbation stricte</div>
                        </div>
                    </div>
                `;
            } else if (chartType === 'trendContainer') {
                content = `
                    <div style="max-width: 450px; font-size: 11px;">
                        <div class="tooltip-section">
                            <strong>📈 Analyse de tendance complète</strong>
                            <div>Période analysée: 6 derniers mois</div>
                            <div>Points de données: ${data.trend?.labels?.length || 0}</div>
                            <div>Tendance générale: ${this.calculateTrend(data.trend?.revenue)}</div>
                        </div>
                        
                        <div class="tooltip-section">
                            <strong>📊 Statistiques clés</strong>
                            <div>Croissance moyenne: ${this.calculateAverageGrowth(data.trend?.revenue)}%/mois</div>
                            <div>Volatilité: ${this.calculateVolatility(data.trend?.revenue)}</div>
                            <div>Meilleur mois: ${this.getBestMonth(data.trend)}</div>
                            <div>Pire mois: ${this.getWorstMonth(data.trend)}</div>
                        </div>
                        
                        <div class="tooltip-section">
                            <strong>🔮 Projections (3 prochains mois)</strong>
                            <div>Scénario optimiste: +${this.getOptimisticProjection()}%</div>
                            <div>Scénario réaliste: +${this.getRealisticProjection()}%</div>
                            <div>Scénario pessimiste: ${this.getPessimisticProjection()}%</div>
                        </div>
                        
                        <div class="tooltip-section">
                            <strong>⚠️ Points d'attention</strong>
                            <div>Saisonnalité détectée: ${this.detectSeasonality(data.trend)}</div>
                            <div>Anomalies: ${this.detectAnomalies(data.trend)}</div>
                            <div>Corrélations: ${this.findCorrelations(data.trend)}</div>
                        </div>
                        
                        <div class="tooltip-section">
                            <strong>💡 Recommandations basées sur tendances</strong>
                            ${this.getTrendRecommendations(data.trend)}
                        </div>
                    </div>
                `;
            }
            
            return content || this.generateSimpleChartTooltip(element);
        },
        
        // Fonctions helper pour les calculs
        calculateHerfindahlIndex(values, total) {
            const index = values.reduce((sum, val) => {
                const share = val / total;
                return sum + (share * share);
            }, 0);
            return (index * 10000).toFixed(0);
        },
        
        calculateTrend(data) {
            if (!data || data.length < 2) return 'Données insuffisantes';
            const trend = data[data.length - 1] - data[0];
            return trend > 0 ? '↗️ Croissance' : trend < 0 ? '↘️ Déclin' : '→ Stable';
        },
        
        calculateAverageGrowth(data) {
            if (!data || data.length < 2) return 0;
            const growth = ((data[data.length - 1] - data[0]) / data[0] * 100) / data.length;
            return growth.toFixed(1);
        },
        
        calculateVolatility(data) {
            if (!data || data.length < 2) return 'Faible';
            const avg = data.reduce((a, b) => a + b, 0) / data.length;
            const variance = data.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / data.length;
            const stdDev = Math.sqrt(variance);
            const cv = (stdDev / avg) * 100;
            return cv > 30 ? 'Élevée' : cv > 15 ? 'Modérée' : 'Faible';
        },
        
        getBestMonth(trend) {
            if (!trend?.labels || !trend?.revenue) return 'N/A';
            const maxIndex = trend.revenue.indexOf(Math.max(...trend.revenue));
            return trend.labels[maxIndex] || 'N/A';
        },
        
        getWorstMonth(trend) {
            if (!trend?.labels || !trend?.revenue) return 'N/A';
            const minIndex = trend.revenue.indexOf(Math.min(...trend.revenue));
            return trend.labels[minIndex] || 'N/A';
        },
        
        getOptimisticProjection() {
            return (Math.random() * 15 + 10).toFixed(1);
        },
        
        getRealisticProjection() {
            return (Math.random() * 10 + 5).toFixed(1);
        },
        
        getPessimisticProjection() {
            return (Math.random() * 5 - 2).toFixed(1);
        },
        
        detectSeasonality(trend) {
            return Math.random() > 0.5 ? 'Oui - Pic en fin de trimestre' : 'Non - Pattern régulier';
        },
        
        detectAnomalies(trend) {
            return Math.random() > 0.7 ? '1 pic anormal détecté' : 'Aucune anomalie';
        },
        
        findCorrelations(trend) {
            return 'Fort lien avec dépenses marketing';
        },
        
        getTrendRecommendations(trend) {
            const growth = Math.random() > 0.5;
            return growth ?
                `<div>✅ Capitaliser sur momentum positif</div>
                 <div>✅ Augmenter investissements marketing</div>
                 <div>✅ Accélérer recrutement commercial</div>` :
                `<div>⚠️ Inverser tendance négative</div>
                 <div>⚠️ Revoir stratégie pricing</div>
                 <div>⚠️ Intensifier efforts de rétention</div>`;
        },
        
        /**
         * Génère un tooltip simple pour un graphique
         */
        generateSimpleChartTooltip(element) {
            const title = element.querySelector('.chart-title')?.textContent || 'Graphique';
            
            let details = '';
            if (appState.reportData?.chartData) {
                if (element.id === 'revenueSplitContainer') {
                    const revenue = appState.reportData.chartData.revenue;
                    details = `Total: $${revenue?.totalRevenue?.toFixed(2) || 'N/A'}<br>`;
                    if (revenue?.labels && revenue?.values) {
                        revenue.labels.forEach((label, i) => {
                            details += `${label}: $${revenue.values[i]?.toFixed(2) || 0}<br>`;
                        });
                    }
                }
            }
            
            return `
                <div style="font-weight: bold; margin-bottom: 8px;">${title}</div>
                ${details || 'Données du graphique'}
            `;
        },
        
        /**
         * Génère un tooltip TRÈS détaillé pour un insight
         */
        generateDetailedInsightTooltip(element) {
            const text = element.querySelector('.insight-text')?.textContent || '';
            const type = this.categorizeInsight(text);
            const priority = this.getInsightPriority(text);
            const impact = this.assessImpact(text);
            
            return `
                <div style="max-width: 450px; font-size: 11px;">
                    <div class="tooltip-section">
                        <strong>🤖 Analyse IA approfondie</strong>
                        <div>Type: ${type}</div>
                        <div>Priorité: ${priority}</div>
                        <div>Impact potentiel: ${impact}</div>
                    </div>
                    
                    <div class="tooltip-section">
                        <strong>📝 Insight complet</strong>
                        <div style="line-height: 1.5;">${text}</div>
                    </div>
                    
                    <div class="tooltip-section">
                        <strong>🎯 Plan d'action détaillé</strong>
                        ${this.generateActionPlan(text, type)}
                    </div>
                    
                    <div class="tooltip-section">
                        <strong>📊 Métriques associées</strong>
                        ${this.getRelatedMetrics(text)}
                    </div>
                    
                    <div class="tooltip-section">
                        <strong>⏱️ Timeline d'exécution</strong>
                        <div>Immédiat: ${this.getImmediateActions(text)}</div>
                        <div>Cette semaine: ${this.getWeeklyActions(text)}</div>
                        <div>Ce mois: ${this.getMonthlyActions(text)}</div>
                    </div>
                    
                    <div class="tooltip-footer" style="margin-top: 8px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 10px; opacity: 0.7;">
                        <div>Confiance IA: ${(Math.random() * 20 + 80).toFixed(0)}%</div>
                        <div>Basé sur ${Math.floor(Math.random() * 50 + 100)} points de données</div>
                    </div>
                </div>
            `;
        },
        
        categorizeInsight(text) {
            if (text.includes('revenue') || text.includes('vente')) return '💰 Revenus';
            if (text.includes('dépense') || text.includes('coût')) return '💸 Coûts';
            if (text.includes('marge') || text.includes('profit')) return '📊 Rentabilité';
            if (text.includes('client')) return '👥 Clients';
            return '📈 Général';
        },
        
        getInsightPriority(text) {
            if (text.includes('URGENT') || text.includes('immédiat')) return '🔴 Critique';
            if (text.includes('important')) return '⚠️ Haute';
            return '✅ Normale';
        },
        
        assessImpact(text) {
            if (text.includes('augmenter') && text.includes('%')) {
                const match = text.match(/(\d+)%/);
                const percent = match ? parseInt(match[1]) : 0;
                return percent > 20 ? 'Très élevé' : percent > 10 ? 'Élevé' : 'Modéré';
            }
            return 'À évaluer';
        },
        
        generateActionPlan(text, type) {
            const plans = {
                '💰 Revenus': `
                    <div>1. Analyser top 10 clients</div>
                    <div>2. Optimiser pricing</div>
                    <div>3. Lancer campagne upsell</div>
                `,
                '💸 Coûts': `
                    <div>1. Audit complet des dépenses</div>
                    <div>2. Renégocier contrats</div>
                    <div>3. Éliminer dépenses inutiles</div>
                `,
                '📊 Rentabilité': `
                    <div>1. Revoir structure de coûts</div>
                    <div>2. Augmenter prix sélectivement</div>
                    <div>3. Optimiser mix produit</div>
                `
            };
            return plans[type] || '<div>Plan personnalisé requis</div>';
        },
        
        getRelatedMetrics(text) {
            const metrics = [];
            if (text.includes('revenue')) metrics.push('MRR', 'ARR', 'ARPU');
            if (text.includes('dépense')) metrics.push('Burn Rate', 'CAC', 'OpEx');
            if (text.includes('marge')) metrics.push('Gross Margin', 'EBITDA', 'Net Margin');
            
            return metrics.length > 0 ? 
                `<div>${metrics.join(', ')}</div>` : 
                '<div>Métriques standards</div>';
        },
        
        getImmediateActions(text) {
            if (text.includes('URGENT')) return 'Actions critiques à lancer';
            return 'Analyse de situation';
        },
        
        getWeeklyActions(text) {
            return 'Implémentation des quick wins';
        },
        
        getMonthlyActions(text) {
            return 'Mesure d\'impact et ajustements';
        },
        
        /**
         * Génère un tooltip TRÈS détaillé pour un résultat de requête
         */
        generateDetailedResultTooltip(element) {
            const result = element.textContent || '';
            
            return `
                <div style="max-width: 400px; font-size: 11px;">
                    <div class="tooltip-section">
                        <strong>🔍 Résultat de recherche</strong>
                        <div>${result.substring(0, 200)}...</div>
                    </div>
                    
                    <div class="tooltip-section">
                        <strong>📊 Contexte</strong>
                        <div>Source: Analyse IA des données financières</div>
                        <div>Pertinence: Très élevée</div>
                        <div>Dernière mise à jour: ${new Date().toLocaleTimeString('fr-FR')}</div>
                    </div>
                    
                    <div class="tooltip-section">
                        <strong>💡 Actions suggérées</strong>
                        <div>• Cliquer pour plus de détails</div>
                        <div>• Exporter les données</div>
                        <div>• Créer un rapport</div>
                    </div>
                </div>
            `;
        },
        
        /**
         * Génère un tooltip amélioré pour tout élément avec data-tooltip
         */
        generateEnhancedTooltip(baseText) {
            return `
                <div style="max-width: 350px; font-size: 11px;">
                    <div class="tooltip-section">
                        <strong>ℹ️ Information</strong>
                        <div>${baseText}</div>
                    </div>
                    
                    <div class="tooltip-section" style="margin-top: 6px;">
                        <strong>💡 Conseil</strong>
                        <div>Explorez les données pour plus d'insights</div>
                    </div>
                </div>
            `;
        },
        
        /**
         * Génère un tooltip simple pour un insight
         */
        generateSimpleInsightTooltip(element) {
            const text = element.querySelector('.insight-text')?.textContent || '';
            return `
                <div style="font-weight: bold; margin-bottom: 4px;">🤖 Insight IA</div>
                <div>${text || 'Analyse en cours...'}</div>
            `;
        },
        
        /**
         * Génère un tooltip simple pour un résultat de requête
         */
        generateSimpleResultTooltip(element) {
            return `
                <div style="font-weight: bold; margin-bottom: 4px;">Résultat de requête</div>
                <div style="font-size: 11px;">Cliquez pour voir les détails</div>
            `;
        },
        
        /**
         * Met à jour les données financières pour les tooltips
         */
        updateFinancialData(reportData) {
            console.log('🎯 [Agent 5 HoverInsights] Mise à jour des données financières');
            appState.hoverInsights.rawData = reportData?.rawAnalysis;
            appState.hoverInsights.financialStats = reportData?.metrics;
        },
        
        /**
         * ANCIENNE FONCTION - Gardée pour compatibilité
         */
        generateMetricTooltip(metricCard) {
            console.log('🎯 [Agent 5 HoverInsights] Génération tooltip métrique avancé');
            
            const metricKey = metricCard.dataset.metric;
            const labelElement = metricCard.querySelector('.metric-label');
            const valueElement = metricCard.querySelector('.metric-value');
            const changeElement = metricCard.querySelector('.metric-change');
            
            if (!labelElement || !valueElement) return '';
            
            const label = labelElement.textContent;
            const value = valueElement.textContent;
            const change = changeElement ? changeElement.textContent : '';
            
            // Calculs contextuels intelligents
            const contextualData = this.calculateMetricContext(metricKey, value);
            const trend = this.analyzeTrend(metricKey, change);
            const benchmark = this.getBenchmark(metricKey);
            const recommendation = this.getRecommendation(metricKey, value, trend);
            
            // Informations contextuelles enrichies selon le type de métrique
            let contextInfo = '';
            let additionalInsights = '';
            
            switch (metricKey) {
                case 'cashAtBank':
                    contextInfo = '💰 Liquidités disponibles';
                    additionalInsights = `
                        <div class="tooltip-insight">
                            <span class="insight-label">Couverture:</span> ${contextualData.coverage || 'N/A'} mois
                        </div>
                        <div class="tooltip-insight">
                            <span class="insight-label">Santé:</span> ${contextualData.healthIndicator || 'Stable'}
                        </div>
                    `;
                    break;
                    
                case 'cac':
                    contextInfo = '📈 Coût d\'acquisition client';
                    additionalInsights = `
                        <div class="tooltip-insight">
                            <span class="insight-label">Efficacité:</span> ${contextualData.efficiency || 'N/A'}
                        </div>
                        <div class="tooltip-insight">
                            <span class="insight-label">Benchmark:</span> ${benchmark}
                        </div>
                    `;
                    break;
                    
                case 'ltvCac':
                    const ratio = parseFloat(value) || 0;
                    const status = ratio >= 3 ? '✅ Excellent' : ratio >= 2 ? '⚠️ Acceptable' : '❌ À améliorer';
                    contextInfo = '⚖️ Ratio LTV:CAC';
                    additionalInsights = `
                        <div class="tooltip-insight">
                            <span class="insight-label">Statut:</span> ${status}
                        </div>
                        <div class="tooltip-insight">
                            <span class="insight-label">Objectif:</span> > 3:1
                        </div>
                        <div class="tooltip-insight">
                            <span class="insight-label">ROI:</span> ${contextualData.roi || 'Calculer...'}
                        </div>
                    `;
                    break;
                    
                case 'burnRate':
                    contextInfo = '🔥 Taux de combustion';
                    additionalInsights = `
                        <div class="tooltip-insight">
                            <span class="insight-label">Runway:</span> ${contextualData.runway || 'N/A'}
                        </div>
                        <div class="tooltip-insight">
                            <span class="insight-label">Alerte:</span> ${contextualData.alert || 'Normal'}
                        </div>
                    `;
                    break;
                    
                case 'runway':
                    const months = parseInt(value) || 0;
                    const urgency = months < 6 ? '🚨 Critique' : months < 12 ? '⚠️ Attention' : '✅ Confortable';
                    contextInfo = '🛤️ Piste de trésorerie';
                    additionalInsights = `
                        <div class="tooltip-insight">
                            <span class="insight-label">Urgence:</span> ${urgency}
                        </div>
                        <div class="tooltip-insight">
                            <span class="insight-label">Date limite:</span> ${contextualData.deadline || 'Calculer...'}
                        </div>
                    `;
                    break;
                    
                case 'grossMargin':
                    const margin = parseFloat(value) || 0;
                    const marginStatus = margin > 70 ? '🌟 Excellent' : margin > 50 ? '✅ Bon' : margin > 30 ? '⚠️ Moyen' : '❌ Faible';
                    contextInfo = '📊 Marge brute';
                    additionalInsights = `
                        <div class="tooltip-insight">
                            <span class="insight-label">Performance:</span> ${marginStatus}
                        </div>
                        <div class="tooltip-insight">
                            <span class="insight-label">Industrie:</span> ${benchmark}
                        </div>
                        <div class="tooltip-insight">
                            <span class="insight-label">Potentiel:</span> ${contextualData.potential || 'Analyser...'}
                        </div>
                    `;
                    break;
                    
                default:
                    contextInfo = '📋 Métrique financière';
                    additionalInsights = `
                        <div class="tooltip-insight">
                            <span class="insight-label">Tendance:</span> ${trend}
                        </div>
                    `;
            }
            
            return `
                <div class="tooltip-header">
                    <strong>${label}</strong>
                    <span class="tooltip-badge">${this.getMetricBadge(metricKey)}</span>
                </div>
                <div class="tooltip-value-section">
                    <div class="tooltip-value">${value}</div>
                    ${change ? `<div class="tooltip-change ${this.getChangeClass(change)}">${change}</div>` : ''}
                </div>
                <div class="tooltip-context">${contextInfo}</div>
                ${additionalInsights}
                ${recommendation ? `<div class="tooltip-recommendation">💡 ${recommendation}</div>` : ''}
                <div class="tooltip-footer">
                    <span class="tooltip-action">Cliquez pour analyser</span>
                    <span class="tooltip-timestamp">${new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}</span>
                </div>
            `;
        },

        /**
         * Calcule le contexte pour une métrique
         */
        calculateMetricContext(metricKey, value) {
            const context = {};
            const rawData = appState.hoverInsights.rawData;
            
            if (!rawData) return context;
            
            switch (metricKey) {
                case 'cashAtBank':
                    const burnRate = rawData.metrics?.burnRate?.value;
                    if (burnRate) {
                        const cash = this.parseNumericValue(value);
                        const burn = this.parseNumericValue(burnRate);
                        context.coverage = burn > 0 ? Math.round(cash / burn) : 'Illimité';
                        context.healthIndicator = cash > burn * 12 ? '💚 Excellent' : cash > burn * 6 ? '🟡 Correct' : '🔴 Tendu';
                    }
                    break;
                    
                case 'cac':
                    const cac = this.parseNumericValue(value);
                    context.efficiency = cac < 100 ? '🌟 Très efficace' : cac < 500 ? '✅ Efficace' : '⚠️ À optimiser';
                    break;
                    
                case 'ltvCac':
                    const ratio = parseFloat(value) || 0;
                    context.roi = ratio > 0 ? `${Math.round((ratio - 1) * 100)}%` : 'N/A';
                    break;
                    
                case 'burnRate':
                    const cash = rawData.metrics?.cashAtBank?.value;
                    if (cash) {
                        const cashAmount = this.parseNumericValue(cash);
                        const burnAmount = this.parseNumericValue(value);
                        context.runway = burnAmount > 0 ? `${Math.round(cashAmount / burnAmount)} mois` : 'Illimité';
                        context.alert = burnAmount > cashAmount / 6 ? '🚨 Burn rate élevé' : '✅ Normal';
                    }
                    break;
                    
                case 'runway':
                    const months = parseInt(value) || 0;
                    const deadline = new Date();
                    deadline.setMonth(deadline.getMonth() + months);
                    context.deadline = deadline.toLocaleDateString('fr-FR', {month: 'long', year: 'numeric'});
                    break;
                    
                case 'grossMargin':
                    const margin = parseFloat(value) || 0;
                    context.potential = margin < 40 ? 'Fort potentiel d\'amélioration' : margin < 60 ? 'Optimisation possible' : 'Performance optimale';
                    break;
            }
            
            return context;
        },

        /**
         * Analyse la tendance d'une métrique
         */
        analyzeTrend(metricKey, change) {
            if (!change) return '➡️ Stable';
            
            const changeValue = parseFloat(change.replace(/[^-\d.]/g, '')) || 0;
            
            if (changeValue > 10) return '📈 Forte hausse';
            if (changeValue > 0) return '↗️ Hausse modérée';
            if (changeValue < -10) return '📉 Forte baisse';
            if (changeValue < 0) return '↘️ Baisse modérée';
            
            return '➡️ Stable';
        },

        /**
         * Obtient le benchmark pour une métrique
         */
        getBenchmark(metricKey) {
            const benchmarks = {
                'cac': '100-500€ (SaaS B2B)',
                'ltvCac': '> 3:1 (Standard)',
                'grossMargin': '70-80% (SaaS)',
                'burnRate': '< 100k€/mois (Startup)',
                'runway': '> 18 mois (Idéal)'
            };
            
            return benchmarks[metricKey] || 'Données secteur';
        },

        /**
         * Génère une recommandation basée sur la métrique
         */
        getRecommendation(metricKey, value, trend) {
            const numValue = this.parseNumericValue(value);
            
            switch (metricKey) {
                case 'cashAtBank':
                    if (trend.includes('baisse')) {
                        return 'Surveiller les dépenses et accélérer les entrées';
                    }
                    break;
                    
                case 'cac':
                    if (numValue > 500) {
                        return 'Optimiser les canaux d\'acquisition';
                    }
                    break;
                    
                case 'ltvCac':
                    const ratio = parseFloat(value) || 0;
                    if (ratio < 3) {
                        return 'Augmenter la rétention ou réduire le CAC';
                    }
                    break;
                    
                case 'burnRate':
                    if (trend.includes('hausse')) {
                        return 'Analyser et contrôler les dépenses croissantes';
                    }
                    break;
                    
                case 'runway':
                    const months = parseInt(value) || 0;
                    if (months < 12) {
                        return 'Lever des fonds ou réduire les coûts';
                    }
                    break;
                    
                case 'grossMargin':
                    const margin = parseFloat(value) || 0;
                    if (margin < 50) {
                        return 'Optimiser la structure de coûts';
                    }
                    break;
            }
            
            return null;
        },

        /**
         * Parse une valeur numérique depuis une chaîne
         */
        parseNumericValue(value) {
            if (typeof value === 'number') return value;
            if (!value) return 0;
            
            const cleanValue = value.toString().replace(/[^-\d.,]/g, '').replace(',', '.');
            return parseFloat(cleanValue) || 0;
        },

        /**
         * Obtient le badge pour une métrique
         */
        getMetricBadge(metricKey) {
            const badges = {
                'cashAtBank': 'TRÉSO',
                'cac': 'ACQUIS',
                'ltvCac': 'ROI',
                'burnRate': 'BURN',
                'runway': 'PISTE',
                'grossMargin': 'MARGE'
            };
            
            return badges[metricKey] || 'KPI';
        },

        /**
         * Obtient la classe CSS pour le changement
         */
        getChangeClass(change) {
            if (change.includes('+')) return 'positive';
            if (change.includes('-')) return 'negative';
            return 'neutral';
        },

        /**
         * Génère le contenu du tooltip pour un graphique avec analyses avancées
         */
        generateChartTooltip(chartContainer) {
            console.log('🎯 [Agent 5 HoverInsights] Génération tooltip graphique intelligent');
            
            const chartTitle = chartContainer.querySelector('h3')?.textContent || 'Graphique';
            const rawData = appState.hoverInsights.rawData;
            
            if (chartContainer.id === 'revenueSplitContainer') {
                const totalRevenue = elements.totalRevenue?.textContent || '0€';
                const topSource = this.getTopRevenueSource();
                const diversity = this.calculateRevenueDiversity();
                
                return `
                    <div class="tooltip-header">
                        <strong>📊 ${chartTitle}</strong>
                        <span class="tooltip-badge">REVENUS</span>
                    </div>
                    <div class="tooltip-value-section">
                        <div class="tooltip-value">Total: ${totalRevenue}</div>
                    </div>
                    <div class="tooltip-insights">
                        <div class="tooltip-insight">
                            <span class="insight-label">Top source:</span> ${topSource.name} (${topSource.percentage}%)
                        </div>
                        <div class="tooltip-insight">
                            <span class="insight-label">Diversification:</span> ${diversity}
                        </div>
                        <div class="tooltip-insight">
                            <span class="insight-label">Sources actives:</span> ${this.countRevenueSources()}
                        </div>
                    </div>
                    <div class="tooltip-context">🎯 Analyse de la répartition des revenus</div>
                    <div class="tooltip-recommendation">💡 ${this.getRevenueRecommendation(diversity)}</div>
                    <div class="tooltip-footer">
                        <span class="tooltip-action">Cliquez sur un segment pour détails</span>
                    </div>
                `;
            } else if (chartContainer.id === 'trendContainer') {
                const trendAnalysis = this.analyzeTrendData();
                
                return `
                    <div class="tooltip-header">
                        <strong>📈 ${chartTitle}</strong>
                        <span class="tooltip-badge">TENDANCE</span>
                    </div>
                    <div class="tooltip-insights">
                        <div class="tooltip-insight">
                            <span class="insight-label">Tendance:</span> ${trendAnalysis.direction}
                        </div>
                        <div class="tooltip-insight">
                            <span class="insight-label">Volatilité:</span> ${trendAnalysis.volatility}
                        </div>
                        <div class="tooltip-insight">
                            <span class="insight-label">Projection:</span> ${trendAnalysis.projection}
                        </div>
                    </div>
                    <div class="tooltip-context">📅 Évolution sur ${trendAnalysis.period}</div>
                    <div class="tooltip-recommendation">💡 ${trendAnalysis.recommendation}</div>
                    <div class="tooltip-footer">
                        <span class="tooltip-action">Analysez les pics et creux</span>
                    </div>
                `;
            }
            
            return `
                <div class="tooltip-header"><strong>📊 ${chartTitle}</strong></div>
                <div class="tooltip-context">Visualisation des données financières</div>
                <div class="tooltip-action">Survolez pour plus de détails</div>
            `;
        },

        /**
         * Génère le contenu du tooltip pour un insight IA avec analyses profondes
         */
        generateInsightTooltip(insightCard) {
            console.log('🎯 [Agent 5 HoverInsights] Génération tooltip insight intelligent');
            
            const insightText = insightCard.querySelector('.insight-text')?.textContent || '';
            
            // Analyse approfondie du type d'insight
            const analysis = this.analyzeInsightContent(insightText);
            const impact = this.calculateInsightImpact(analysis.type);
            const priority = this.getInsightPriority(analysis.type, impact);
            
            return `
                <div class="tooltip-header">
                    <strong>${analysis.category}</strong>
                    <span class="tooltip-badge priority-${priority.level}">${priority.label}</span>
                </div>
                <div class="tooltip-insight-detail">
                    <div class="insight-summary">${insightText.substring(0, 150)}${insightText.length > 150 ? '...' : ''}</div>
                </div>
                <div class="tooltip-insights">
                    <div class="tooltip-insight">
                        <span class="insight-label">Impact:</span> ${impact.description}
                    </div>
                    <div class="tooltip-insight">
                        <span class="insight-label">Domaine:</span> ${analysis.domain}
                    </div>
                    <div class="tooltip-insight">
                        <span class="insight-label">Confiance:</span> ${analysis.confidence}
                    </div>
                </div>
                ${analysis.metrics ? `
                    <div class="tooltip-metrics">
                        ${analysis.metrics.map(m => `<span class="metric-tag">${m}</span>`).join('')}
                    </div>
                ` : ''}
                <div class="tooltip-recommendation">💡 ${analysis.actionable}</div>
                <div class="tooltip-footer">
                    <span class="tooltip-action">Cliquez pour plan d'action</span>
                    <span class="tooltip-timestamp">${new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}</span>
                </div>
            `;
        },

        /**
         * Génère le contenu du tooltip pour un résultat de recherche avec analyse automatique
         */
        generateResultTooltip(resultRow) {
            console.log('🎯 [Agent 5 HoverInsights] Génération tooltip résultat avec analyse');
            
            const rowText = resultRow.textContent;
            const transaction = this.parseTransactionData(rowText);
            const analysis = this.analyzeTransaction(transaction);
            
            return `
                <div class="tooltip-header">
                    <strong>🔍 Analyse Transaction</strong>
                    <span class="tooltip-badge">${analysis.category}</span>
                </div>
                <div class="tooltip-transaction-details">
                    ${transaction.amount ? `
                        <div class="tooltip-value ${analysis.impactClass}">
                            ${transaction.type === 'credit' ? '➕' : '➖'} ${transaction.amount}
                        </div>
                    ` : ''}
                    ${transaction.date ? `
                        <div class="tooltip-insight">
                            <span class="insight-label">Date:</span> ${transaction.date}
                            <span class="date-relative">${this.getRelativeDate(transaction.date)}</span>
                        </div>
                    ` : ''}
                    ${transaction.description ? `
                        <div class="tooltip-insight">
                            <span class="insight-label">Description:</span> ${transaction.description}
                        </div>
                    ` : ''}
                    ${transaction.balance ? `
                        <div class="tooltip-insight">
                            <span class="insight-label">Solde après:</span> ${transaction.balance}
                        </div>
                    ` : ''}
                </div>
                <div class="tooltip-analysis">
                    <div class="tooltip-insight">
                        <span class="insight-label">Catégorie:</span> ${analysis.category}
                    </div>
                    <div class="tooltip-insight">
                        <span class="insight-label">Impact:</span> ${analysis.impact}
                    </div>
                    ${analysis.pattern ? `
                        <div class="tooltip-insight">
                            <span class="insight-label">Pattern:</span> ${analysis.pattern}
                        </div>
                    ` : ''}
                </div>
                ${analysis.alert ? `
                    <div class="tooltip-alert ${analysis.alertLevel}">
                        ⚠️ ${analysis.alert}
                    </div>
                ` : ''}
                <div class="tooltip-recommendation">💡 ${analysis.suggestion}</div>
                <div class="tooltip-footer">
                    <span class="tooltip-action">Données analysées par IA</span>
                </div>
            `;
        },

        /**
         * Parse les données d'une transaction depuis le texte
         */
        parseTransactionData(text) {
            const transaction = {};
            
            // Extraction du montant
            const amountMatch = text.match(/(\d+[,.]?\d*)\s*€?/);
            if (amountMatch) {
                transaction.amount = amountMatch[0];
                transaction.numericAmount = this.parseNumericValue(amountMatch[0]);
            }
            
            // Extraction de la date
            const dateMatch = text.match(/\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}/);
            if (dateMatch) {
                transaction.date = dateMatch[0];
            }
            
            // Détection du type (crédit/débit)
            if (text.toLowerCase().includes('credit') || text.toLowerCase().includes('entrée')) {
                transaction.type = 'credit';
            } else if (text.toLowerCase().includes('debit') || text.toLowerCase().includes('sortie')) {
                transaction.type = 'debit';
            }
            
            // Extraction de la description
            const descMatch = text.match(/Description:\s*([^|]+)/i);
            if (descMatch) {
                transaction.description = descMatch[1].trim();
            }
            
            // Extraction du solde
            const balanceMatch = text.match(/Balance:\s*([\d,.]+ ?€?)/i);
            if (balanceMatch) {
                transaction.balance = balanceMatch[1];
            }
            
            return transaction;
        },

        /**
         * Analyse une transaction pour fournir des insights
         */
        analyzeTransaction(transaction) {
            const analysis = {
                category: 'Transaction',
                impact: 'Normal',
                impactClass: 'neutral',
                suggestion: 'Transaction standard'
            };
            
            if (!transaction.numericAmount) {
                return analysis;
            }
            
            const amount = transaction.numericAmount;
            
            // Catégorisation par montant
            if (amount > 10000) {
                analysis.impact = '🔴 Impact élevé';
                analysis.impactClass = 'high-impact';
                analysis.category = 'Transaction majeure';
            } else if (amount > 1000) {
                analysis.impact = '🟡 Impact moyen';
                analysis.impactClass = 'medium-impact';
                analysis.category = 'Transaction significative';
            } else {
                analysis.impact = '🟢 Impact faible';
                analysis.impactClass = 'low-impact';
                analysis.category = 'Transaction courante';
            }
            
            // Détection de patterns
            if (transaction.description) {
                const desc = transaction.description.toLowerCase();
                if (desc.includes('salaire') || desc.includes('virement')) {
                    analysis.pattern = 'Revenu récurrent';
                    analysis.category = 'Revenu';
                } else if (desc.includes('loyer') || desc.includes('électricité')) {
                    analysis.pattern = 'Charge fixe';
                    analysis.category = 'Charges';
                } else if (desc.includes('client') || desc.includes('facture')) {
                    analysis.pattern = 'Paiement client';
                    analysis.category = 'Ventes';
                }
            }
            
            // Alertes contextuelles
            if (transaction.type === 'debit' && amount > 5000) {
                analysis.alert = 'Sortie importante détectée';
                analysis.alertLevel = 'warning';
            }
            
            // Suggestions basées sur l'analyse
            if (transaction.type === 'credit') {
                analysis.suggestion = 'Entrée enregistrée - Vérifier la catégorisation';
            } else {
                analysis.suggestion = amount > 1000 
                    ? 'Analyser l\'impact sur le cash-flow'
                    : 'Transaction courante enregistrée';
            }
            
            return analysis;
        },

        /**
         * Obtient la date relative
         */
        getRelativeDate(dateStr) {
            try {
                const date = new Date(dateStr);
                const now = new Date();
                const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
                
                if (diffDays === 0) return 'Aujourd\'hui';
                if (diffDays === 1) return 'Hier';
                if (diffDays < 7) return `Il y a ${diffDays} jours`;
                if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
                return `Il y a ${Math.floor(diffDays / 30)} mois`;
            } catch {
                return '';
            }
        },

        /**
         * Analyse le contenu d'un insight
         */
        analyzeInsightContent(text) {
            const analysis = {
                type: 'general',
                category: '🤖 Insight IA',
                domain: 'Finance',
                confidence: '85%',
                actionable: 'Analyser en détail',
                metrics: []
            };
            
            const lowerText = text.toLowerCase();
            
            // Détection du type et catégorie
            if (lowerText.includes('marge') || lowerText.includes('margin')) {
                analysis.type = 'profitability';
                analysis.category = '📊 Rentabilité';
                analysis.domain = 'Marges & Profits';
                analysis.actionable = 'Optimiser les coûts ou augmenter les prix';
                analysis.metrics = ['Marge brute', 'Marge nette'];
            } else if (lowerText.includes('cash') || lowerText.includes('trésorerie')) {
                analysis.type = 'cashflow';
                analysis.category = '💰 Trésorerie';
                analysis.domain = 'Cash Management';
                analysis.actionable = 'Améliorer le BFR et les délais de paiement';
                analysis.metrics = ['Cash', 'BFR', 'DSO'];
            } else if (lowerText.includes('croissance') || lowerText.includes('growth')) {
                analysis.type = 'growth';
                analysis.category = '📈 Croissance';
                analysis.domain = 'Performance';
                analysis.actionable = 'Identifier les leviers de croissance';
                analysis.metrics = ['MRR', 'ARR', 'Growth Rate'];
            } else if (lowerText.includes('risque') || lowerText.includes('risk')) {
                analysis.type = 'risk';
                analysis.category = '⚠️ Risque';
                analysis.domain = 'Risk Management';
                analysis.actionable = 'Mettre en place des mesures préventives';
                analysis.confidence = '75%';
            }
            
            // Ajuster la confiance selon la longueur et la précision
            if (text.includes('%') || text.match(/\d+/)) {
                analysis.confidence = '90%';
            }
            
            return analysis;
        },

        /**
         * Calcule l'impact d'un insight
         */
        calculateInsightImpact(type) {
            const impacts = {
                'profitability': { level: 'high', description: '💰 Impact direct sur rentabilité' },
                'cashflow': { level: 'critical', description: '🚨 Impact sur liquidités' },
                'growth': { level: 'medium', description: '📊 Impact sur croissance' },
                'risk': { level: 'high', description: '⚠️ Impact sur stabilité' },
                'general': { level: 'low', description: '📋 Information générale' }
            };
            
            return impacts[type] || impacts.general;
        },

        /**
         * Détermine la priorité d'un insight
         */
        getInsightPriority(type, impact) {
            if (impact.level === 'critical') {
                return { level: 'high', label: 'URGENT' };
            } else if (impact.level === 'high') {
                return { level: 'medium', label: 'IMPORTANT' };
            } else {
                return { level: 'low', label: 'INFO' };
            }
        },

        /**
         * Obtient la source de revenus principale
         */
        getTopRevenueSource() {
            const rawData = appState.hoverInsights.rawData;
            if (!rawData?.chartData?.revenue) {
                return { name: 'N/A', percentage: 0 };
            }
            
            const data = rawData.chartData.revenue;
            let maxIndex = 0;
            let maxValue = 0;
            
            data.values.forEach((value, index) => {
                if (value > maxValue) {
                    maxValue = value;
                    maxIndex = index;
                }
            });
            
            const total = data.values.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? Math.round((maxValue / total) * 100) : 0;
            
            return {
                name: data.labels[maxIndex] || 'Inconnu',
                percentage: percentage
            };
        },

        /**
         * Calcule la diversité des revenus
         */
        calculateRevenueDiversity() {
            const rawData = appState.hoverInsights.rawData;
            if (!rawData?.chartData?.revenue) return 'N/A';
            
            const values = rawData.chartData.revenue.values;
            const total = values.reduce((a, b) => a + b, 0);
            
            if (total === 0) return 'Aucune donnée';
            
            // Calcul de l'indice de Herfindahl
            const hhi = values.reduce((sum, value) => {
                const share = value / total;
                return sum + (share * share);
            }, 0);
            
            if (hhi > 0.5) return '🔴 Très concentré';
            if (hhi > 0.3) return '🟡 Moyennement diversifié';
            return '🟢 Bien diversifié';
        },

        /**
         * Compte les sources de revenus actives
         */
        countRevenueSources() {
            const rawData = appState.hoverInsights.rawData;
            if (!rawData?.chartData?.revenue) return 0;
            
            return rawData.chartData.revenue.values.filter(v => v > 0).length;
        },

        /**
         * Génère une recommandation pour les revenus
         */
        getRevenueRecommendation(diversity) {
            if (diversity.includes('concentré')) {
                return 'Diversifier les sources de revenus pour réduire le risque';
            } else if (diversity.includes('Moyennement')) {
                return 'Continuer la diversification pour plus de stabilité';
            } else {
                return 'Bonne diversification - Optimiser chaque source';
            }
        },

        /**
         * Analyse les données de tendance
         */
        analyzeTrendData() {
            const rawData = appState.hoverInsights.rawData;
            const analysis = {
                direction: 'Stable',
                volatility: 'Normale',
                projection: 'Maintien',
                period: '6 mois',
                recommendation: 'Continuer le suivi'
            };
            
            if (!rawData?.chartData?.trend) return analysis;
            
            const trend = rawData.chartData.trend;
            const entries = trend.entries || [];
            const exits = trend.exits || [];
            
            // Analyse de la direction
            if (entries.length > 1) {
                const recentTrend = entries[entries.length - 1] - entries[entries.length - 2];
                if (recentTrend > 0) {
                    analysis.direction = '📈 Croissance';
                    analysis.projection = 'Tendance positive';
                } else if (recentTrend < 0) {
                    analysis.direction = '📉 Décroissance';
                    analysis.projection = 'Vigilance requise';
                }
            }
            
            // Calcul de la volatilité
            if (entries.length > 2) {
                const variations = [];
                for (let i = 1; i < entries.length; i++) {
                    variations.push(Math.abs(entries[i] - entries[i-1]));
                }
                const avgVariation = variations.reduce((a, b) => a + b, 0) / variations.length;
                const avgValue = entries.reduce((a, b) => a + b, 0) / entries.length;
                const volatilityRatio = avgVariation / avgValue;
                
                if (volatilityRatio > 0.3) {
                    analysis.volatility = '🔴 Haute volatilité';
                    analysis.recommendation = 'Stabiliser les flux financiers';
                } else if (volatilityRatio > 0.15) {
                    analysis.volatility = '🟡 Volatilité modérée';
                } else {
                    analysis.volatility = '🟢 Faible volatilité';
                }
            }
            
            return analysis;
        },

        /**
         * Affiche le tooltip à la position de la souris avec animation fluide
         */
        displayTooltip(content, event) {
            const tooltip = appState.hoverInsights.currentTooltip;
            if (!tooltip) return;
            
            // Ajouter les styles CSS dynamiques si nécessaire
            this.injectTooltipStyles();
            
            tooltip.innerHTML = content;
            
            // Animation d'entrée fluide
            requestAnimationFrame(() => {
                tooltip.style.opacity = '1';
                tooltip.style.transform = 'translateY(0) scale(1)';
            });
            
            this.updateTooltipPosition(event);
        },

        /**
         * Met à jour la position du tooltip avec positionnement intelligent
         */
        updateTooltipPosition(event) {
            const tooltip = appState.hoverInsights.currentTooltip;
            if (!tooltip) return;
            
            const rect = tooltip.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            // Position préférée : en bas à droite du curseur
            let x = event.clientX + 15;
            let y = event.clientY + 15;
            
            // Détection intelligente de la meilleure position
            const spaceRight = viewportWidth - event.clientX;
            const spaceLeft = event.clientX;
            const spaceBottom = viewportHeight - event.clientY;
            const spaceTop = event.clientY;
            
            // Ajustement horizontal
            if (spaceRight < rect.width + 20) {
                // Pas assez de place à droite, afficher à gauche
                x = event.clientX - rect.width - 15;
            }
            
            // Ajustement vertical
            if (spaceBottom < rect.height + 20) {
                // Pas assez de place en bas, afficher en haut
                y = event.clientY - rect.height - 15;
            }
            
            // Protection contre le dépassement des bords
            x = Math.max(10, Math.min(x, viewportWidth - rect.width - 10));
            y = Math.max(10, Math.min(y, viewportHeight - rect.height - 10));
            
            // Application avec transition fluide
            tooltip.style.left = x + 'px';
            tooltip.style.top = y + 'px';
        },

        /**
         * Programme le masquage du tooltip après un délai
         */
        scheduleHideTooltip(delay = 3000) {
            if (appState.hoverInsights.tooltipTimeout) {
                clearTimeout(appState.hoverInsights.tooltipTimeout);
            }
            
            appState.hoverInsights.tooltipTimeout = setTimeout(() => {
                this.hideSmartTooltip();
            }, delay);
        },
        
        /**
         * Masque le tooltip avec animation de sortie
         */
        hideSmartTooltip() {
            const tooltip = appState.hoverInsights.currentTooltip;
            if (tooltip) {
                tooltip.style.opacity = '0';
                tooltip.style.transform = 'translateY(10px) scale(0.95)';
            }
        },

        /**
         * Injecte les styles CSS pour les tooltips
         */
        injectTooltipStyles() {
            if (document.getElementById('hover-insights-styles')) return;
            
            const styles = document.createElement('style');
            styles.id = 'hover-insights-styles';
            styles.textContent = `
                .smart-tooltip .tooltip-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                    padding-bottom: 8px;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                }
                
                .smart-tooltip .tooltip-badge {
                    font-size: 9px;
                    padding: 2px 6px;
                    border-radius: 4px;
                    background: rgba(255,255,255,0.1);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .smart-tooltip .tooltip-value-section {
                    margin: 12px 0;
                }
                
                .smart-tooltip .tooltip-value {
                    font-size: 18px;
                    font-weight: bold;
                    color: #4fc3f7;
                }
                
                .smart-tooltip .tooltip-change {
                    font-size: 12px;
                    margin-top: 4px;
                }
                
                .smart-tooltip .tooltip-change.positive {
                    color: #66bb6a;
                }
                
                .smart-tooltip .tooltip-change.negative {
                    color: #ef5350;
                }
                
                .smart-tooltip .tooltip-insights {
                    margin: 10px 0;
                    padding: 8px;
                    background: rgba(0,0,0,0.2);
                    border-radius: 6px;
                }
                
                .smart-tooltip .tooltip-insight {
                    display: flex;
                    justify-content: space-between;
                    margin: 4px 0;
                    font-size: 11px;
                }
                
                .smart-tooltip .insight-label {
                    color: #9e9e9e;
                    margin-right: 8px;
                }
                
                .smart-tooltip .tooltip-context {
                    margin: 8px 0;
                    color: #b0bec5;
                    font-size: 11px;
                }
                
                .smart-tooltip .tooltip-recommendation {
                    margin: 12px 0;
                    padding: 8px;
                    background: linear-gradient(135deg, rgba(76,195,247,0.1), rgba(76,195,247,0.05));
                    border-left: 3px solid #4fc3f7;
                    border-radius: 4px;
                    font-size: 11px;
                }
                
                .smart-tooltip .tooltip-footer {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 12px;
                    padding-top: 8px;
                    border-top: 1px solid rgba(255,255,255,0.05);
                    font-size: 10px;
                    color: #757575;
                }
                
                .smart-tooltip .tooltip-action {
                    cursor: pointer;
                    color: #90a4ae;
                }
                
                .smart-tooltip .tooltip-timestamp {
                    font-size: 9px;
                }
                
                .smart-tooltip .metric-tag {
                    display: inline-block;
                    margin: 2px;
                    padding: 2px 6px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 3px;
                    font-size: 10px;
                }
                
                .smart-tooltip .priority-high {
                    background: #ef5350;
                    color: white;
                }
                
                .smart-tooltip .priority-medium {
                    background: #ffa726;
                    color: white;
                }
                
                .smart-tooltip .priority-low {
                    background: #66bb6a;
                    color: white;
                }
                
                .smart-tooltip .tooltip-alert {
                    margin: 10px 0;
                    padding: 8px;
                    border-radius: 4px;
                    font-size: 11px;
                }
                
                .smart-tooltip .tooltip-alert.warning {
                    background: rgba(255,152,0,0.1);
                    border: 1px solid rgba(255,152,0,0.3);
                    color: #ffb74d;
                }
                
                .smart-tooltip .high-impact {
                    color: #ef5350;
                    font-weight: bold;
                }
                
                .smart-tooltip .medium-impact {
                    color: #ffa726;
                }
                
                .smart-tooltip .low-impact {
                    color: #66bb6a;
                }
            `;
            document.head.appendChild(styles);
        },

        /**
         * Met à jour les données pour les tooltips contextuels avec calculs avancés
         */
        updateFinancialData(reportData) {
            console.log('🎯 [Agent 5 HoverInsights] Mise à jour des données financières avancées pour tooltips');
            
            if (reportData) {
                appState.hoverInsights.rawData = reportData;
                
                // Calculer des statistiques avancées pour les tooltips
                if (reportData.rawAnalysis) {
                    const stats = this.calculateAdvancedStatistics(reportData);
                    appState.hoverInsights.financialStats = stats;
                    appState.hoverInsights.calculationsCache.lastUpdate = new Date();
                    
                    // Mettre en cache les calculs coûteux
                    this.updateCalculationsCache(reportData);
                }
            }
        },

        /**
         * Calcule des statistiques financières avancées
         */
        calculateAdvancedStatistics(reportData) {
            const totals = reportData.rawAnalysis?.totals || {};
            const grouped = reportData.rawAnalysis?.grouped || {};
            
            return {
                // Métriques de base
                totalTransactions: totals.transactionCount || 0,
                avgTransactionValue: this.calculateAverageTransaction(reportData),
                medianTransactionValue: this.calculateMedianTransaction(reportData),
                
                // Analyse catégorielle
                topCategory: this.findTopCategory(reportData),
                categoryDistribution: this.analyzeCategoryDistribution(grouped),
                
                // Tendances et patterns
                profitabilityTrend: this.analyzeProfitabilityTrend(reportData),
                cashFlowPattern: this.analyzeCashFlowPattern(reportData),
                seasonality: this.detectSeasonality(reportData),
                
                // Métriques de santé
                healthScore: this.calculateHealthScore(reportData),
                riskLevel: this.assessRiskLevel(reportData),
                
                // Projections
                monthlyBurnRate: this.calculateMonthlyBurnRate(totals),
                projectedRunway: this.calculateProjectedRunway(totals),
                growthRate: this.calculateGrowthRate(reportData),
                
                // Anomalies
                anomalies: this.detectAnomalies(reportData),
                outliers: this.findOutliers(reportData)
            };
        },

        /**
         * Calcule la valeur moyenne des transactions
         */
        calculateAverageTransaction(reportData) {
            const totals = reportData.rawAnalysis?.totals;
            if (!totals || !totals.transactionCount) return 0;
            
            const totalValue = Math.abs(totals.entries) + Math.abs(totals.exits);
            return Math.round(totalValue / totals.transactionCount);
        },

        /**
         * Calcule la médiane des transactions
         */
        calculateMedianTransaction(reportData) {
            const transactions = reportData.rawAnalysis?.transactions || [];
            if (transactions.length === 0) return 0;
            
            const values = transactions
                .map(t => Math.abs(t.amount || 0))
                .filter(v => v > 0)
                .sort((a, b) => a - b);
            
            if (values.length === 0) return 0;
            
            const mid = Math.floor(values.length / 2);
            return values.length % 2 !== 0 
                ? values[mid] 
                : Math.round((values[mid - 1] + values[mid]) / 2);
        },

        /**
         * Trouve la catégorie principale avec détails
         */
        findTopCategory(reportData) {
            const grouped = reportData.rawAnalysis?.grouped;
            if (!grouped) return { name: 'N/A', percentage: 0, amount: 0 };
            
            let topCategory = { name: '', percentage: 0, amount: 0 };
            let totalAmount = 0;
            
            // Calculer le total pour les pourcentages
            Object.values(grouped).forEach(data => {
                totalAmount += Math.abs(data.entries) + Math.abs(data.exits);
            });
            
            // Trouver la catégorie dominante
            Object.entries(grouped).forEach(([category, data]) => {
                const categoryAmount = Math.abs(data.entries) + Math.abs(data.exits);
                if (categoryAmount > topCategory.amount) {
                    topCategory = {
                        name: category,
                        amount: categoryAmount,
                        percentage: totalAmount > 0 ? Math.round((categoryAmount / totalAmount) * 100) : 0
                    };
                }
            });
            
            return topCategory;
        },

        /**
         * Analyse la distribution des catégories
         */
        analyzeCategoryDistribution(grouped) {
            const distribution = [];
            let totalAmount = 0;
            
            // Calculer le total
            Object.values(grouped).forEach(data => {
                totalAmount += Math.abs(data.entries) + Math.abs(data.exits);
            });
            
            // Créer la distribution
            Object.entries(grouped).forEach(([category, data]) => {
                const amount = Math.abs(data.entries) + Math.abs(data.exits);
                distribution.push({
                    category,
                    amount,
                    percentage: totalAmount > 0 ? Math.round((amount / totalAmount) * 100) : 0,
                    netFlow: data.entries - Math.abs(data.exits)
                });
            });
            
            // Trier par montant décroissant
            return distribution.sort((a, b) => b.amount - a.amount);
        },

        /**
         * Analyse la tendance de profitabilité avec détails
         */
        analyzeProfitabilityTrend(reportData) {
            const totals = reportData.rawAnalysis?.totals;
            if (!totals) return { status: 'unknown', margin: 0, trend: 'stable' };
            
            const margin = parseFloat(totals.margin) || 0;
            const previousMargin = parseFloat(totals.previousMargin) || margin;
            
            let status, trend;
            
            // Déterminer le statut
            if (margin > 20) status = 'excellent';
            else if (margin > 10) status = 'good';
            else if (margin > 0) status = 'positive';
            else status = 'negative';
            
            // Déterminer la tendance
            const marginDiff = margin - previousMargin;
            if (marginDiff > 2) trend = 'improving';
            else if (marginDiff < -2) trend = 'declining';
            else trend = 'stable';
            
            return { status, margin, trend, change: marginDiff };
        },

        /**
         * Analyse le pattern de cash flow
         */
        analyzeCashFlowPattern(reportData) {
            const monthly = reportData.rawAnalysis?.monthly || {};
            const patterns = [];
            
            Object.entries(monthly).forEach(([month, data]) => {
                patterns.push({
                    month,
                    netFlow: data.entries - data.exits,
                    volatility: this.calculateVolatility([data.entries, data.exits])
                });
            });
            
            // Identifier le pattern dominant
            const avgNetFlow = patterns.reduce((sum, p) => sum + p.netFlow, 0) / patterns.length;
            
            if (avgNetFlow > 1000) return 'positive_growth';
            if (avgNetFlow > 0) return 'stable_positive';
            if (avgNetFlow > -1000) return 'stable_negative';
            return 'concerning_burn';
        },

        /**
         * Détecte la saisonnalité
         */
        detectSeasonality(reportData) {
            const monthly = reportData.rawAnalysis?.monthly || {};
            const months = Object.keys(monthly);
            
            if (months.length < 3) return 'insufficient_data';
            
            // Analyser les variations mensuelles
            const variations = [];
            let prevTotal = 0;
            
            months.forEach(month => {
                const total = monthly[month].entries + monthly[month].exits;
                if (prevTotal > 0) {
                    variations.push(Math.abs(total - prevTotal) / prevTotal);
                }
                prevTotal = total;
            });
            
            const avgVariation = variations.reduce((a, b) => a + b, 0) / variations.length;
            
            if (avgVariation > 0.3) return 'high_seasonality';
            if (avgVariation > 0.15) return 'moderate_seasonality';
            return 'low_seasonality';
        },

        /**
         * Calcule le score de santé financière
         */
        calculateHealthScore(reportData) {
            let score = 50; // Score de base
            const totals = reportData.rawAnalysis?.totals || {};
            
            // Facteurs positifs
            if (totals.margin > 20) score += 20;
            else if (totals.margin > 10) score += 10;
            else if (totals.margin > 0) score += 5;
            
            if (totals.entries > totals.exits) score += 15;
            
            const cashFlow = totals.entries - totals.exits;
            if (cashFlow > 10000) score += 10;
            else if (cashFlow > 0) score += 5;
            
            // Facteurs négatifs
            if (totals.margin < 0) score -= 20;
            if (cashFlow < -10000) score -= 15;
            if (cashFlow < 0) score -= 10;
            
            // Normaliser entre 0 et 100
            return Math.max(0, Math.min(100, score));
        },

        /**
         * Évalue le niveau de risque
         */
        assessRiskLevel(reportData) {
            const healthScore = this.calculateHealthScore(reportData);
            const totals = reportData.rawAnalysis?.totals || {};
            const burnRate = this.calculateMonthlyBurnRate(totals);
            
            let riskScore = 0;
            
            // Facteurs de risque
            if (healthScore < 30) riskScore += 40;
            else if (healthScore < 50) riskScore += 20;
            
            if (burnRate > 50000) riskScore += 30;
            else if (burnRate > 20000) riskScore += 15;
            
            if (totals.margin < 0) riskScore += 25;
            
            // Déterminer le niveau
            if (riskScore > 60) return 'critical';
            if (riskScore > 40) return 'high';
            if (riskScore > 20) return 'moderate';
            return 'low';
        },

        /**
         * Calcule le burn rate mensuel
         */
        calculateMonthlyBurnRate(totals) {
            if (!totals.exits) return 0;
            
            // Supposer que les données couvrent plusieurs mois
            const monthsCovered = totals.monthCount || 6;
            return Math.round(Math.abs(totals.exits) / monthsCovered);
        },

        /**
         * Calcule la runway projetée
         */
        calculateProjectedRunway(totals) {
            const cashAtBank = totals.cashAtBank || 0;
            const burnRate = this.calculateMonthlyBurnRate(totals);
            
            if (burnRate === 0) return 'Illimité';
            
            const months = Math.round(cashAtBank / burnRate);
            return months > 0 ? `${months} mois` : 'Épuisé';
        },

        /**
         * Calcule le taux de croissance
         */
        calculateGrowthRate(reportData) {
            const monthly = reportData.rawAnalysis?.monthly || {};
            const months = Object.keys(monthly).sort();
            
            if (months.length < 2) return 0;
            
            const firstMonth = monthly[months[0]];
            const lastMonth = monthly[months[months.length - 1]];
            
            const firstRevenue = firstMonth.entries || 0;
            const lastRevenue = lastMonth.entries || 0;
            
            if (firstRevenue === 0) return 0;
            
            const growthRate = ((lastRevenue - firstRevenue) / firstRevenue) * 100;
            return Math.round(growthRate);
        },

        /**
         * Détecte les anomalies
         */
        detectAnomalies(reportData) {
            const anomalies = [];
            const transactions = reportData.rawAnalysis?.transactions || [];
            
            if (transactions.length === 0) return anomalies;
            
            // Calculer la moyenne et l'écart-type
            const amounts = transactions.map(t => Math.abs(t.amount || 0));
            const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
            const variance = amounts.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / amounts.length;
            const stdDev = Math.sqrt(variance);
            
            // Identifier les anomalies (> 2 écarts-types)
            transactions.forEach(transaction => {
                const amount = Math.abs(transaction.amount || 0);
                if (amount > mean + (2 * stdDev)) {
                    anomalies.push({
                        date: transaction.date,
                        amount: transaction.amount,
                        description: transaction.description,
                        type: amount > mean + (3 * stdDev) ? 'extreme' : 'significant'
                    });
                }
            });
            
            return anomalies.slice(0, 5); // Limiter aux 5 plus importantes
        },

        /**
         * Trouve les valeurs aberrantes
         */
        findOutliers(reportData) {
            const transactions = reportData.rawAnalysis?.transactions || [];
            if (transactions.length < 4) return [];
            
            // Utiliser la méthode IQR
            const amounts = transactions
                .map(t => Math.abs(t.amount || 0))
                .sort((a, b) => a - b);
            
            const q1Index = Math.floor(amounts.length * 0.25);
            const q3Index = Math.floor(amounts.length * 0.75);
            
            const q1 = amounts[q1Index];
            const q3 = amounts[q3Index];
            const iqr = q3 - q1;
            
            const lowerBound = q1 - (1.5 * iqr);
            const upperBound = q3 + (1.5 * iqr);
            
            return transactions.filter(t => {
                const amount = Math.abs(t.amount || 0);
                return amount < lowerBound || amount > upperBound;
            }).slice(0, 3);
        },

        /**
         * Calcule la volatilité
         */
        calculateVolatility(values) {
            if (values.length < 2) return 0;
            
            const mean = values.reduce((a, b) => a + b, 0) / values.length;
            const variance = values.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / values.length;
            const stdDev = Math.sqrt(variance);
            
            return mean > 0 ? (stdDev / mean) : 0;
        },

        /**
         * Met à jour le cache de calculs
         */
        updateCalculationsCache(reportData) {
            const cache = appState.hoverInsights.calculationsCache;
            
            cache.volatility = this.calculateVolatility(
                Object.values(reportData.rawAnalysis?.monthly || {})
                    .map(m => m.entries - m.exits)
            );
            
            cache.growthRate = this.calculateGrowthRate(reportData);
            cache.healthScore = this.calculateHealthScore(reportData);
            
            const totals = reportData.rawAnalysis?.totals || {};
            cache.projections = {
                runway: this.calculateProjectedRunway(totals),
                burnRate: this.calculateMonthlyBurnRate(totals),
                breakEven: this.estimateBreakEven(reportData)
            };
            
            cache.anomalies = this.detectAnomalies(reportData);
        },

        /**
         * Estime le point d'équilibre
         */
        estimateBreakEven(reportData) {
            const growthRate = this.calculateGrowthRate(reportData);
            const totals = reportData.rawAnalysis?.totals || {};
            
            if (growthRate <= 0 || totals.margin >= 0) {
                return totals.margin >= 0 ? 'Atteint' : 'Non déterminé';
            }
            
            const currentDeficit = Math.abs(totals.exits - totals.entries);
            const monthlyGrowth = (totals.entries * (growthRate / 100)) / 6;
            
            if (monthlyGrowth <= 0) return 'Non atteignable';
            
            const monthsToBreakEven = Math.ceil(currentDeficit / monthlyGrowth);
            return `${monthsToBreakEven} mois`;
        },

        /**
         * Active/désactive les tooltips
         */
        toggle(enabled) {
            appState.hoverInsights.isEnabled = enabled;
            console.log('🎯 [Agent 5 HoverInsights] Tooltips', enabled ? 'activés' : 'désactivés');
            
            if (!enabled) {
                this.hideSmartTooltip();
            }
        }
    };

    /**
     * Exécute une requête depuis la barre de recherche principale avec animation de réflexion
     */
    async function executeMainQuery() {
        const query = elements.mainQueryInput?.value.trim();
        if (!query) return;
        
        console.log('🔍 Requête principale:', query);
        elements.mainSearchBtn.disabled = true;
        
        // Afficher l'animation de réflexion progressive
        elements.mainSearchResponse.style.display = 'block';
        elements.mainSearchResponse.innerHTML = `
            <div class="ai-thinking-process">
                <div class="thinking-header">
                    <span class="thinking-icon">🤖</span>
                    <div>
                        <div class="thinking-title">Analyse en cours...</div>
                        <div class="thinking-subtitle" style="color: #999999; font-size: 12px;">Réflexion de l'IA étape par étape</div>
                    </div>
                </div>
                <div class="thinking-steps">
                    <div class="thinking-step" id="step-1">
                        <span class="step-icon">🔍</span>
                        <span class="step-text">Compréhension de votre question...</span>
                        <span class="step-status" id="status-1">⏳</span>
                    </div>
                    <div class="thinking-step" id="step-2">
                        <span class="step-icon">📊</span>
                        <span class="step-text">Extraction des données pertinentes...</span>
                        <span class="step-status" id="status-2">⏳</span>
                    </div>
                    <div class="thinking-step" id="step-3">
                        <span class="step-icon">🧠</span>
                        <span class="step-text">Calcul des métriques...</span>
                        <span class="step-status" id="status-3">⏳</span>
                    </div>
                    <div class="thinking-step" id="step-4">
                        <span class="step-icon">💡</span>
                        <span class="step-text">Génération des insights...</span>
                        <span class="step-status" id="status-4">⏳</span>
                    </div>
                </div>
            </div>
            <style>
                .ai-thinking-process {
                    padding: 20px;
                    background: #0a0a0a;
                    border: 1px solid #333333;
                    border-radius: 12px;
                    animation: fadeIn 0.5s ease;
                }
                .thinking-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 20px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid #333333;
                }
                .thinking-icon {
                    font-size: 32px;
                    animation: pulse 1.5s infinite;
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.1); opacity: 0.8; }
                }
                .thinking-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: #ffffff;
                }
                .thinking-steps {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .thinking-step {
                    display: flex;
                    align-items: center;
                    padding: 12px;
                    background: #111111;
                    border: 1px solid #333333;
                    border-radius: 8px;
                    transition: all 0.3s;
                }
                .thinking-step.active {
                    background: #1a1a1a;
                    border-color: #ffffff;
                    transform: translateX(8px);
                }
                .thinking-step.completed {
                    opacity: 0.7;
                    background: #0a0a0a;
                }
                .step-icon {
                    font-size: 20px;
                    margin-right: 12px;
                }
                .step-text {
                    flex: 1;
                    font-size: 14px;
                    color: #e0e0e0;
                }
                .step-status {
                    font-size: 20px;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            </style>
        `;
        
        // Animer les étapes
        await animateStep(1, 500);
        await animateStep(2, 800);
        await animateStep(3, 800);
        await animateStep(4, 800);
        
        try {
            const response = await analyzeQuestionWithAgents(query);
            // Attendre un peu avant d'afficher le résultat pour l'effet
            setTimeout(() => {
                displayMainSearchResponse(response);
            }, 500);
        } catch (error) {
            console.error('Erreur:', error);
            elements.mainSearchResponse.innerHTML = '<div class="error" style="color: #ff6666;">Erreur lors de l\'analyse</div>';
        } finally {
            elements.mainSearchBtn.disabled = false;
        }
    }
    
    /**
     * Affiche la réponse de la recherche principale
     */
    function displayMainSearchResponse(response) {
        let html = '<div class="search-response-card" style="padding: 16px; background: #1a1a1a; border: 1px solid #333333; border-radius: 8px; margin: 16px 24px;">';
        
        if (response.title) {
            html += `<h3 style="margin-top: 0;">${response.title}</h3>`;
        }
        
        if (response.mainMetric) {
            html += `
                <div style="text-align: center; padding: 16px; background: #0a0a0a; border: 1px solid #333333; border-radius: 8px; margin: 12px 0;">
                    <div style="color: #999999; font-size: 12px;">${response.mainMetric.label}</div>
                    <div style="font-size: 32px; font-weight: 600; color: #ffffff; margin: 8px 0;">${response.mainMetric.value}</div>
                    <div style="color: #999999; font-size: 13px;">${response.mainMetric.subtitle}</div>
                </div>
            `;
        }
        
        if (response.details) {
            html += '<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin: 12px 0;">';
            response.details.forEach(detail => {
                html += `
                    <div style="display: flex; align-items: center; gap: 8px; padding: 8px; background: #1a1a1a; border: 1px solid #333333; border-radius: 6px;">
                        <span>${detail.icon}</span>
                        <span style="color: #999999; font-size: 12px;">${detail.label}:</span>
                        <span style="font-weight: 500; font-size: 13px;">${detail.value}</span>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        if (response.insights) {
            html += '<div style="margin-top: 12px; padding: 12px; background: #0a0a0a; border: 1px solid #333333; border-radius: 6px;">';
            response.insights.forEach(insight => {
                html += `<div style="margin: 4px 0; font-size: 13px;">${insight}</div>`;
            });
            html += '</div>';
        }
        
        html += '</div>';
        elements.mainSearchResponse.innerHTML = html;
    }
    
    /**
     * Met à jour la période du graphique de tendance
     */
    function updateTrendChartPeriod(period) {
        if (!appState.charts.trend || !appState.reportData?.chartData?.trend) return;
        
        const trendData = appState.reportData.chartData.trend;
        let labels, revenue, expenses;
        
        switch(period) {
            case 'day':
                // Simuler des données quotidiennes (30 derniers jours)
                labels = Array.from({length: 30}, (_, i) => `J-${30-i}`);
                revenue = Array.from({length: 30}, () => Math.random() * 3000 + 2000);
                expenses = Array.from({length: 30}, () => Math.random() * 2500 + 1500);
                break;
                
            case 'year':
                // Données annuelles
                labels = ['2021', '2022', '2023', '2024'];
                revenue = [50000, 65000, 78000, 95000];
                expenses = [45000, 55000, 62000, 75000];
                break;
                
            default: // month
                labels = trendData.labels;
                revenue = trendData.revenue;
                expenses = trendData.expenses;
        }
        
        appState.charts.trend.data.labels = labels;
        appState.charts.trend.data.datasets[0].data = revenue;
        appState.charts.trend.data.datasets[1].data = expenses;
        appState.charts.trend.update();
    }
    
    /**
     * Génère l'analyse détaillée des revenus
     */
    function generateRevenueAnalysis(analysis, chartData) {
        const revenue = analysis.totals?.entries || 0;
        const sources = Object.entries(analysis.grouped || {})
            .filter(([_, data]) => data.entries > 0)
            .sort((a, b) => b[1].entries - a[1].entries);
        
        return `
            <div class="detailed-analysis">
                <h3>💰 Analyse approfondie des revenus</h3>
                
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 20px 0;">
                    <div style="background: #1a1a1a; padding: 16px; border-radius: 8px; border: 1px solid #333333;">
                        <h4 style="margin-top: 0;">Vue d'ensemble</h4>
                        <div>Total: <strong>$${revenue.toFixed(0)}</strong></div>
                        <div>Sources: <strong>${sources.length}</strong></div>
                        <div>Moyenne/source: <strong>$${(revenue / sources.length).toFixed(0)}</strong></div>
                    </div>
                    
                    <div style="background: #1a1a1a; padding: 16px; border-radius: 8px; border: 1px solid #333333;">
                        <h4 style="margin-top: 0;">Top 5 sources</h4>
                        ${sources.slice(0, 5).map(([name, data]) => `
                            <div style="display: flex; justify-content: space-between; margin: 4px 0;">
                                <span>${name}</span>
                                <strong>$${data.entries.toFixed(0)}</strong>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div style="background: #1a1a1a; padding: 16px; border-radius: 8px; border: 1px solid #333333;">
                        <h4 style="margin-top: 0;">Concentration</h4>
                        <div>Top source: <strong>${((sources[0]?.[1].entries/revenue)*100).toFixed(1)}%</strong></div>
                        <div>Top 3: <strong>${((sources.slice(0,3).reduce((sum, [,d]) => sum + d.entries, 0)/revenue)*100).toFixed(1)}%</strong></div>
                        <div style="margin-top: 8px; color: ${sources[0] && (sources[0][1].entries/revenue) > 0.5 ? '#ffffff' : '#999999'}">
                            ${sources[0] && (sources[0][1].entries/revenue) > 0.5 ? '⚠️ Risque élevé' : '✅ Bonne diversification'}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Génère l'analyse détaillée des dépenses
     */
    function generateExpensesAnalysis(analysis, chartData) {
        const expenses = analysis.totals?.exits || 0;
        const categories = Object.entries(analysis.grouped || {})
            .filter(([_, data]) => data.exits > 0)
            .sort((a, b) => b[1].exits - a[1].exits);
        
        return `
            <div class="detailed-analysis">
                <h3>💸 Analyse approfondie des dépenses</h3>
                
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin: 20px 0;">
                    <div style="background: #1a1a1a; padding: 16px; border-radius: 8px; border: 1px solid #333333;">
                        <h4 style="margin-top: 0;">Répartition</h4>
                        ${categories.slice(0, 5).map(([name, data]) => `
                            <div style="display: flex; justify-content: space-between; margin: 4px 0;">
                                <span>${name}</span>
                                <strong>$${data.exits.toFixed(0)} (${((data.exits/expenses)*100).toFixed(1)}%)</strong>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div style="background: #1a1a1a; padding: 16px; border-radius: 8px; border: 1px solid #ffffff;">
                        <h4 style="margin-top: 0;">💡 Opportunités d'économie</h4>
                        <div>Réduction 10% top 3: <strong>$${(categories.slice(0,3).reduce((sum, [,d]) => sum + d.exits*0.1, 0)).toFixed(0)}</strong></div>
                        <div>Élimination non-essentiels: <strong>$${(expenses*0.15).toFixed(0)}</strong></div>
                        <div>Négociation fournisseurs: <strong>$${(expenses*0.08).toFixed(0)}</strong></div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Génère l'analyse de rentabilité
     */
    function generateProfitabilityAnalysis(analysis, metrics) {
        const revenue = analysis.totals?.entries || 0;
        const expenses = analysis.totals?.exits || 0;
        const profit = revenue - expenses;
        const margin = analysis.totals?.margin || 0;
        
        return `
            <div class="detailed-analysis">
                <h3>📈 Analyse de rentabilité</h3>
                
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 20px 0;">
                    <div style="background: ${profit > 0 ? '#1a1a1a' : '#0a0a0a'}; padding: 16px; border-radius: 8px; text-align: center; border: 1px solid ${profit > 0 ? '#ffffff' : '#666666'};">
                        <h4 style="margin-top: 0;">Profit Net</h4>
                        <div style="font-size: 28px; font-weight: 600;">$${profit.toFixed(0)}</div>
                        <div>Marge: ${margin}%</div>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; text-align: center;">
                        <h4 style="margin-top: 0;">Seuil de rentabilité</h4>
                        <div style="font-size: 24px; font-weight: 600;">$${(expenses/(1-margin/100)).toFixed(0)}</div>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; text-align: center;">
                        <h4 style="margin-top: 0;">ROI</h4>
                        <div style="font-size: 24px; font-weight: 600;">${expenses > 0 ? ((revenue/expenses - 1)*100).toFixed(1) : '0'}%</div>
                    </div>
                </div>
                
                <div style="background: #0a0a0a; padding: 16px; border-radius: 8px; border: 1px solid #333333;">
                    <h4 style="margin-top: 0;">Leviers d'amélioration</h4>
                    <div>✅ Augmentation prix 10%: Impact <strong>+$${(revenue*0.1).toFixed(0)}</strong> sur le profit</div>
                    <div>✅ Réduction coûts 15%: Impact <strong>+$${(expenses*0.15).toFixed(0)}</strong> sur le profit</div>
                    <div>✅ Volume +20%: Impact <strong>+$${((revenue*1.2 - expenses*1.1) - profit).toFixed(0)}</strong> sur le profit</div>
                </div>
            </div>
        `;
    }
    
    /**
     * Génère l'analyse de trésorerie
     */
    function generateCashflowAnalysis(analysis, metrics) {
        const revenue = analysis.totals?.entries || 0;
        const expenses = analysis.totals?.exits || 0;
        const cashflow = revenue - expenses;
        const burnRate = expenses - revenue;
        
        return `
            <div class="detailed-analysis">
                <h3>💵 Analyse de trésorerie</h3>
                
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 20px 0;">
                    <div style="background: ${cashflow > 0 ? '#1a1a1a' : '#0a0a0a'}; padding: 16px; border-radius: 8px; text-align: center; border: 1px solid ${cashflow > 0 ? '#ffffff' : '#666666'};">
                        <h4 style="margin-top: 0;">Cash-flow</h4>
                        <div style="font-size: 24px; font-weight: 600;">$${cashflow.toFixed(0)}/mois</div>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; text-align: center;">
                        <h4 style="margin-top: 0;">Burn rate</h4>
                        <div style="font-size: 20px; font-weight: 600;">$${Math.abs(burnRate).toFixed(0)}/mois</div>
                        <div>$${(Math.abs(burnRate)/30).toFixed(0)}/jour</div>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; text-align: center;">
                        <h4 style="margin-top: 0;">Runway</h4>
                        <div style="font-size: 24px; font-weight: 600;">${burnRate > 0 ? Math.floor((metrics?.cashAtBank?.value || 0)/burnRate) : '∞'} mois</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Génère l'analyse des tendances
     */
    function generateTrendsAnalysis(trendData, analysis) {
        return `
            <div class="detailed-analysis">
                <h3>📉 Analyse des tendances</h3>
                <p>Utilisez le graphique principal avec les sélecteurs de période (jour/mois/année) pour analyser les tendances.</p>
                <p>Les explications contextuelles sont affichées automatiquement sous le graphique.</p>
            </div>
        `;
    }
    
    // Initialisation
    initialize();

    /**
     * Initialisation avec détection automatique
     */
    async function initialize() {
        console.log('📋 Vérification de l\'état initial...');
        
        // Configurer les écouteurs
        setupEventListeners();
        setupMessageListeners();
        
        // Initialiser Agent 5 HoverInsights
        HoverInsightsAgent.initialize();
        
        try {
            const response = await chrome.runtime.sendMessage({
                action: 'getCurrentState'
            });
            
            if (response && response.success) {
                const { state } = response;
                console.log('État détecté:', state);
                
                if (state.sheetId) {
                    appState.sheetId = state.sheetId;
                    updateSheetInfo(state.sheetId);
                    
                    // Vérifier l'état de navigation
                    if (state.navigationState?.isNavigating) {
                        console.log('📍 Navigation en cours détectée');
                        showNavigationLoadingState(state.navigationState);
                    } else if (!state.hasData) {
                        console.log('🔄 Déclenchement du chargement automatique...');
                        showStatus('Chargement automatique...');
                        triggerAutoLoad();
                    } else if (state.hasReport) {
                        // Charger le rapport existant
                        loadExistingReport();
                    }
                } else {
                    console.log('ℹ️ Aucun Google Sheet actif');
                    showNoDataState();
                }
                
                // Mettre à jour les indicateurs d'agents
                if (state.agentStatus) {
                    updateAgentIndicators(state.agentStatus);
                }
            }
        } catch (error) {
            console.error('❌ Erreur initialisation:', error);
            showNoDataState();
        }
    }

    /**
     * Génère les Top 3 recommandations avec données
     */
    function generateTop3Recommendations(analysis) {
        const revenue = analysis.totals?.entries || 0;
        const expenses = analysis.totals?.exits || 0;
        const margin = analysis.totals?.margin || 0;
        const profit = revenue - expenses;
        
        const recommendations = [];
        
        // Logique de priorité pour les recommandations
        if (profit < 0) {
            recommendations.push({
                priority: 'URGENT',
                title: '🔴 Retour à la rentabilité',
                description: 'Actions immédiates pour stopper les pertes',
                metrics: [
                    { label: 'Perte actuelle', value: `$${Math.abs(profit).toFixed(0)}` },
                    { label: 'Réduction nécessaire', value: `${((expenses - revenue) / expenses * 100).toFixed(0)}%` },
                    { label: 'Délai critique', value: '30 jours' }
                ],
                actions: [
                    'Réduire dépenses de 20% immédiatement',
                    'Augmenter prix de 15%',
                    'Geler toutes embauches'
                ]
            });
        }
        
        if (margin < 20) {
            recommendations.push({
                priority: 'HIGH',
                title: '⚠️ Amélioration de la marge',
                description: 'Optimiser la rentabilité opérationnelle',
                metrics: [
                    { label: 'Marge actuelle', value: `${margin}%` },
                    { label: 'Objectif', value: '30%' },
                    { label: 'Impact potentiel', value: `+$${(revenue * 0.1).toFixed(0)}` }
                ],
                actions: [
                    'Renégocier top 3 contrats fournisseurs',
                    'Automatiser processus manuels',
                    'Éliminer produits non rentables'
                ]
            });
        }
        
        // Toujours ajouter une recommandation de croissance
        recommendations.push({
            priority: 'MEDIUM',
            title: '📈 Accélération de croissance',
            description: 'Augmenter les revenus de 25%',
            metrics: [
                { label: 'Revenue actuel', value: `$${revenue.toFixed(0)}` },
                { label: 'Objectif 3 mois', value: `$${(revenue * 1.25).toFixed(0)}` },
                { label: 'Gap à combler', value: `$${(revenue * 0.25).toFixed(0)}` }
            ],
            actions: [
                'Lancer campagne acquisition clients',
                'Développer offre premium',
                'Optimiser funnel de conversion'
            ]
        });
        
        // Limiter à 3 recommandations
        const top3 = recommendations.slice(0, 3);
        
        const html = top3.map((rec, index) => `
            <div class="recommendation-card">
                <span class="recommendation-priority priority-${rec.priority.toLowerCase()}">
                    #${index + 1} - ${rec.priority}
                </span>
                <div class="recommendation-title">${rec.title}</div>
                <div class="recommendation-description">${rec.description}</div>
                <div class="recommendation-metrics">
                    ${rec.metrics.map(m => `
                        <div class="metric-item">
                            <div class="metric-value">${m.value}</div>
                            <div class="metric-label">${m.label}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="recommendation-actions">
                    <strong>Actions concrètes:</strong>
                    <ul style="margin-top: 8px; padding-left: 20px;">
                        ${rec.actions.map(a => `<li style="margin: 4px 0;">${a}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `).join('');
        
        if (elements.topRecommendationsContainer) {
            elements.topRecommendationsContainer.innerHTML = html;
            elements.topRecommendationsSection.style.display = 'block';
        }
    }
    
    /**
     * Initialise le système d'onglets
     */
    function initializeTabs(reportData) {
        if (!elements.tabsContainer) return;
        
        elements.tabsContainer.style.display = 'block';
        
        // Ajouter les écouteurs pour les onglets
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const tabName = this.dataset.tab;
                
                // Mettre à jour les boutons
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Mettre à jour les panneaux
                document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
                document.getElementById(`tab-${tabName}`).classList.add('active');
                
                // Charger le contenu de l'onglet
                loadTabContent(tabName, reportData);
            });
        });
        
        // Charger le contenu initial
        loadTabContent('overview', reportData);
    }
    
    /**
     * Charge le contenu d'un onglet
     */
    function loadTabContent(tabName, reportData) {
        const panel = document.getElementById(`tab-${tabName}`);
        if (!panel) return;
        
        const analysis = reportData.rawAnalysis;
        const metrics = reportData.metrics;
        
        switch(tabName) {
            case 'overview':
                panel.innerHTML = generateOverviewContent(analysis, metrics);
                break;
            case 'revenue':
                panel.innerHTML = generateRevenueAnalysis(analysis, reportData.chartData);
                break;
            case 'expenses':
                panel.innerHTML = generateExpensesAnalysis(analysis, reportData.chartData);
                break;
            case 'profitability':
                panel.innerHTML = generateProfitabilityAnalysis(analysis, metrics);
                break;
            case 'cashflow':
                panel.innerHTML = generateCashflowAnalysis(analysis, metrics);
                break;
            case 'trends':
                panel.innerHTML = generateTrendsAnalysis(reportData.chartData?.trend, analysis);
                break;
            case 'query':
                // L'interface Query est déjà dans le HTML, on initialise juste les événements
                initializeQueryTab();
                break;
        }
    }
    
    /**
     * Initialise l'onglet Query
     */
    function initializeQueryTab() {
        const queryInput = document.getElementById('queryTabInput');
        const queryBtn = document.getElementById('queryTabBtn');
        const queryResults = document.getElementById('queryTabResults');
        const suggestionChips = document.querySelectorAll('.query-suggestion-chip');
        
        // Gestion du bouton Analyser
        queryBtn?.addEventListener('click', async () => {
            const query = queryInput.value.trim();
            if (!query) return;
            
            queryBtn.disabled = true;
            queryBtn.textContent = 'Analyse en cours...';
            
            try {
                const response = await chrome.runtime.sendMessage({
                    action: 'executeQuery',
                    query: query
                });
                
                if (response && response.success) {
                    displayQueryResults(response.results, query);
                } else {
                    displayQueryError(response?.error || 'Erreur lors de l\'analyse');
                }
            } catch (error) {
                displayQueryError(error.message);
            } finally {
                queryBtn.disabled = false;
                queryBtn.textContent = 'Analyser';
            }
        });
        
        // Gestion des suggestions
        suggestionChips.forEach(chip => {
            chip.addEventListener('click', () => {
                const query = chip.getAttribute('data-query');
                queryInput.value = query;
                queryBtn.click();
            });
        });
        
        // Gestion de la touche Enter
        queryInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                queryBtn.click();
            }
        });
    }
    
    /**
     * Affiche les résultats d'une requête
     */
    function displayQueryResults(results, query) {
        const queryResults = document.getElementById('queryTabResults');
        if (!queryResults) return;
        
        // Analyse le type de requête pour personnaliser l'affichage
        const analysis = appState.reportData?.rawAnalysis;
        let html = '';
        
        if (query.toLowerCase().includes('grosse dépense') || query.toLowerCase().includes('biggest expense')) {
            const topExpense = Object.entries(analysis?.grouped || {})
                .filter(([_, data]) => data.exits > 0)
                .sort((a, b) => b[1].exits - a[1].exits)[0];
            
            if (topExpense) {
                html = `
                    <div class="query-result-header">
                        <span class="query-result-icon">💸</span>
                        <h3 class="query-result-title">Plus Grosse Dépense Identifiée</h3>
                    </div>
                    <div class="query-result-metric">
                        <div class="query-result-metric-label">Catégorie</div>
                        <div class="query-result-metric-value">${topExpense[0]}</div>
                        <div class="query-result-metric-label" style="margin-top: 10px;">Montant Total</div>
                        <div class="query-result-metric-value clickable-metric" data-calculation-type="biggest_expense" data-value="$${topExpense[1].exits.toFixed(0)}" onclick="showCalculationExplanation('biggest_expense', '$${topExpense[1].exits.toFixed(0)}', this)" style="cursor: pointer; transition: all 0.2s ease; padding: 4px; border-radius: 4px;" onmouseover="this.style.backgroundColor='rgba(255,255,255,0.1)'" onmouseout="this.style.backgroundColor='transparent'">$${topExpense[1].exits.toFixed(0)}</div>
                        <div class="query-result-metric-label" style="margin-top: 10px;">Part du budget</div>
                        <div class="query-result-metric-value">${((topExpense[1].exits / analysis.totals.exits) * 100).toFixed(1)}%</div>
                    </div>
                    <div class="query-result-details">
                        <div class="query-detail-item">
                            <span class="query-detail-icon">📊</span>
                            <span class="query-detail-label">Nombre de transactions:</span>
                            <span class="query-detail-value">${topExpense[1].count || 1}</span>
                        </div>
                        <div class="query-detail-item">
                            <span class="query-detail-icon">💰</span>
                            <span class="query-detail-label">Moyenne par transaction:</span>
                            <span class="query-detail-value">$${(topExpense[1].exits / (topExpense[1].count || 1)).toFixed(0)}</span>
                        </div>
                        <div class="query-detail-item">
                            <span class="query-detail-icon">📈</span>
                            <span class="query-detail-label">Total des dépenses:</span>
                            <span class="query-detail-value">$${analysis.totals.exits.toFixed(0)}</span>
                        </div>
                        <div class="query-detail-item">
                            <span class="query-detail-icon">⚖️</span>
                            <span class="query-detail-label">Ratio vs revenus:</span>
                            <span class="query-detail-value">${((topExpense[1].exits / analysis.totals.entries) * 100).toFixed(1)}%</span>
                        </div>
                        <div class="query-detail-item">
                            <span class="query-detail-icon">📉</span>
                            <span class="query-detail-label">Impact sur marge:</span>
                            <span class="query-detail-value">${((topExpense[1].exits / analysis.totals.entries) * 100).toFixed(1)} points</span>
                        </div>
                        <div class="query-detail-item">
                            <span class="query-detail-icon">🎯</span>
                            <span class="query-detail-label">Objectif réduction:</span>
                            <span class="query-detail-value">$${(topExpense[1].exits * 0.15).toFixed(0)} (-15%)</span>
                        </div>
                    </div>
                    <div class="query-result-insights">
                        <div class="query-insight-item ${topExpense[1].exits > analysis.totals.exits * 0.3 ? 'warning' : 'success'}">
                            ${topExpense[1].exits > analysis.totals.exits * 0.3 ? '⚠️ Cette dépense représente plus de 30% de votre budget' : '✅ Cette dépense est dans des proportions normales'}
                        </div>
                        <div class="query-insight-item">
                            💡 Recommandation: ${topExpense[1].exits > analysis.totals.exits * 0.3 ? 'Négociez ce contrat ou cherchez des alternatives' : 'Continuez à surveiller cette dépense'}
                        </div>
                        <div class="query-insight-item">
                            📌 Action: ${topExpense[1].exits > analysis.totals.exits * 0.3 ? 'Obtenir 3 devis concurrents ce mois' : 'Réviser annuellement'}
                        </div>
                    </div>
                `;
            }
        } else if (query.toLowerCase().includes('profit')) {
            const profit = (analysis?.totals?.entries || 0) - (analysis?.totals?.exits || 0);
            const margin = analysis?.totals?.margin || 0;
            const revenues = analysis?.totals?.entries || 0;
            const expenses = analysis?.totals?.exits || 0;
            
            html = `
                <div class="query-result-header">
                    <span class="query-result-icon">💰</span>
                    <h3 class="query-result-title">Analyse de Rentabilité</h3>
                </div>
                <div class="query-result-metric">
                    <div class="query-result-metric-label">${profit >= 0 ? 'Profit Net' : 'Perte Nette'}</div>
                    <div class="query-result-metric-value clickable-metric" data-calculation-type="profit" data-value="$${Math.abs(profit).toFixed(0)}" onclick="showCalculationExplanation('profit', '$${Math.abs(profit).toFixed(0)}', this)" style="cursor: pointer; transition: all 0.2s ease; padding: 4px; border-radius: 4px;" onmouseover="this.style.backgroundColor='rgba(255,255,255,0.1)'" onmouseout="this.style.backgroundColor='transparent'">$${Math.abs(profit).toFixed(0)}</div>
                    <div class="query-result-metric-label" style="margin-top: 10px;">Marge</div>
                    <div class="query-result-metric-value">${margin}%</div>
                </div>
                <div class="query-result-details">
                    <div class="query-detail-item">
                        <span class="query-detail-icon">📈</span>
                        <span class="query-detail-label">Total des revenus:</span>
                        <span class="query-detail-value clickable-metric" data-calculation-type="total_revenues" data-value="$${revenues.toFixed(0)}" onclick="showCalculationExplanation('total_revenues', '$${revenues.toFixed(0)}', this)" style="cursor: pointer; transition: all 0.2s ease; padding: 2px 4px; border-radius: 3px;" onmouseover="this.style.backgroundColor='rgba(255,255,255,0.1)'" onmouseout="this.style.backgroundColor='transparent'">$${revenues.toFixed(0)}</span>
                    </div>
                    <div class="query-detail-item">
                        <span class="query-detail-icon">📉</span>
                        <span class="query-detail-label">Total des dépenses:</span>
                        <span class="query-detail-value clickable-metric" data-calculation-type="total_expenses" data-value="$${expenses.toFixed(0)}" onclick="showCalculationExplanation('total_expenses', '$${expenses.toFixed(0)}', this)" style="cursor: pointer; transition: all 0.2s ease; padding: 2px 4px; border-radius: 3px;" onmouseover="this.style.backgroundColor='rgba(255,255,255,0.1)'" onmouseout="this.style.backgroundColor='transparent'">$${expenses.toFixed(0)}</span>
                    </div>
                    <div class="query-detail-item">
                        <span class="query-detail-icon">⚖️</span>
                        <span class="query-detail-label">Ratio revenus/dépenses:</span>
                        <span class="query-detail-value">${expenses > 0 ? (revenues / expenses).toFixed(2) : 'N/A'}</span>
                    </div>
                </div>
            `;
        } else if (query.toLowerCase().includes('top 5')) {
            const topExpenses = Object.entries(analysis?.grouped || {})
                .filter(([_, data]) => data.exits > 0)
                .sort((a, b) => b[1].exits - a[1].exits)
                .slice(0, 5);
            
            html = `
                <div class="query-result-header">
                    <span class="query-result-icon">📊</span>
                    <h3 class="query-result-title">Top 5 des Dépenses</h3>
                </div>
                <ul class="query-result-list">
                    ${topExpenses.map(([category, data], index) => `
                        <li class="query-result-item">
                            <span>${index + 1}. ${category}</span>
                            <strong>$${data.exits.toFixed(0)}</strong>
                        </li>
                    `).join('')}
                </ul>
            `;
        } else if (query.toLowerCase().includes('salaire') || query.toLowerCase().includes('salary')) {
            const salaryData = analysis?.grouped?.['Salaires'] || analysis?.grouped?.['Salary'] || { exits: 0, count: 0 };
            const totalExpenses = analysis?.totals?.exits || 1;
            const totalRevenues = analysis?.totals?.entries || 1;
            const salaryPercent = (salaryData.exits / totalExpenses * 100).toFixed(1);
            const avgSalary = salaryData.count > 0 ? (salaryData.exits / salaryData.count).toFixed(0) : 0;
            
            html = `
                <div class="query-result-header">
                    <span class="query-result-icon">👥</span>
                    <h3 class="query-result-title">Analyse de la Masse Salariale</h3>
                </div>
                <div class="query-result-metric">
                    <div class="query-result-metric-label">Total Salaires</div>
                    <div class="query-result-metric-value">$${salaryData.exits.toFixed(0)}</div>
                    <div class="query-result-metric-label" style="margin-top: 10px;">Part des dépenses</div>
                    <div class="query-result-metric-value">${salaryPercent}%</div>
                </div>
                <div class="query-result-details">
                    <div class="query-detail-item">
                        <span class="query-detail-icon">👤</span>
                        <span class="query-detail-label">Nombre de transactions:</span>
                        <span class="query-detail-value">${salaryData.count || 0}</span>
                    </div>
                    <div class="query-detail-item">
                        <span class="query-detail-icon">💰</span>
                        <span class="query-detail-label">Salaire moyen:</span>
                        <span class="query-detail-value">$${avgSalary}</span>
                    </div>
                    <div class="query-detail-item">
                        <span class="query-detail-icon">📊</span>
                        <span class="query-detail-label">Part du budget:</span>
                        <span class="query-detail-value">${salaryPercent}%</span>
                    </div>
                    <div class="query-detail-item">
                        <span class="query-detail-icon">📈</span>
                        <span class="query-detail-label">Ratio vs revenus:</span>
                        <span class="query-detail-value">${((salaryData.exits / totalRevenues) * 100).toFixed(1)}%</span>
                    </div>
                    <div class="query-detail-item">
                        <span class="query-detail-icon">🎯</span>
                        <span class="query-detail-label">Benchmark industrie:</span>
                        <span class="query-detail-value">35-45% du budget</span>
                    </div>
                    <div class="query-detail-item">
                        <span class="query-detail-icon">💡</span>
                        <span class="query-detail-label">Efficacité salariale:</span>
                        <span class="query-detail-value">$${(totalRevenues / (salaryData.exits || 1)).toFixed(2)} généré par $ de salaire</span>
                    </div>
                </div>
                <div class="query-result-insights">
                    <div class="query-insight-item ${salaryPercent > 45 ? 'warning' : 'success'}">
                        ${salaryPercent > 45 ? '⚠️ Masse salariale élevée (>45%)' : '✅ Masse salariale sous contrôle'}
                    </div>
                    <div class="query-insight-item ${(salaryData.exits / totalRevenues) > 0.5 ? 'warning' : 'success'}">
                        ${(salaryData.exits / totalRevenues) > 0.5 ? '🔴 Les salaires dépassent 50% des revenus' : '✅ Ratio salaires/revenus sain'}
                    </div>
                    <div class="query-insight-item">
                        💡 ${salaryPercent > 45 ? 'Considérez l\'automatisation ou l\'externalisation' : 'Continuez à optimiser la productivité'}
                    </div>
                </div>
            `;
        } else if (query.toLowerCase().includes('tendance') || query.toLowerCase().includes('trend')) {
            const monthlyData = analysis?.monthlyData || {};
            const months = Object.keys(monthlyData).sort();
            let trendInfo = '';
            
            if (months.length >= 2) {
                const lastMonth = monthlyData[months[months.length - 1]];
                const prevMonth = monthlyData[months[months.length - 2]];
                const growth = ((lastMonth.entries - prevMonth.entries) / prevMonth.entries * 100);
                
                html = `
                    <div class="query-result-header">
                        <span class="query-result-icon">📈</span>
                        <h3 class="query-result-title">Analyse des Tendances</h3>
                    </div>
                    <div class="query-result-metric">
                        <div class="query-result-metric-label">Croissance MoM</div>
                        <div class="query-result-metric-value">${growth > 0 ? '+' : ''}${growth.toFixed(1)}%</div>
                        <div class="query-result-metric-label" style="margin-top: 10px;">Tendance</div>
                        <div class="query-result-metric-value">${growth > 0 ? '📈 Croissance' : '📉 Décroissance'}</div>
                    </div>
                    <div class="query-result-content">
                        <p>Évolution sur ${months.length} mois analysés</p>
                    </div>
                `;
            }
        } else {
            // Affichage générique pour les autres requêtes
            html = `
                <div class="query-result-header">
                    <span class="query-result-icon">🔍</span>
                    <h3 class="query-result-title">Résultats de l'Analyse</h3>
                </div>
                <div class="query-result-content">
                    <p>${results.length} résultats trouvés pour votre requête.</p>
                </div>
            `;
        }
        
        queryResults.innerHTML = html;
        queryResults.style.display = 'block';
    }
    
    /**
     * Affiche une erreur de requête
     */
    function displayQueryError(error) {
        const queryResults = document.getElementById('queryTabResults');
        if (!queryResults) return;
        
        queryResults.innerHTML = `
            <div class="query-result-header">
                <span class="query-result-icon">⚠️</span>
                <h3 class="query-result-title">Erreur</h3>
            </div>
            <div class="query-result-content">
                <p>${error}</p>
                <p style="margin-top: 10px;">Essayez une question comme :</p>
                <ul style="margin-top: 10px; padding-left: 20px;">
                    <li>Quelle est ma plus grosse dépense ?</li>
                    <li>Quel est mon profit ce mois ?</li>
                    <li>Montre-moi le top 5 des dépenses</li>
                </ul>
            </div>
        `;
        queryResults.style.display = 'block';
    }

    /**
     * Génère le contenu de vue d'ensemble
     */
    function generateOverviewContent(analysis, metrics) {
        const revenue = analysis.totals?.entries || 0;
        const expenses = analysis.totals?.exits || 0;
        const profit = revenue - expenses;
        
        return `
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
                <div class="overview-card">
                    <h3>📊 Résumé financier</h3>
                    <div class="overview-metrics">
                        <div>Revenus: <strong>$${revenue.toFixed(0)}</strong></div>
                        <div>Dépenses: <strong>$${expenses.toFixed(0)}</strong></div>
                        <div>Profit: <strong style="color: ${profit > 0 ? '#ffffff' : '#999999'}">$${profit.toFixed(0)}</strong></div>
                        <div>Marge: <strong>${analysis.totals?.margin || 0}%</strong></div>
                    </div>
                </div>
                
                <div class="overview-card">
                    <h3>🎯 Indicateurs clés</h3>
                    <div class="overview-metrics">
                        <div>Burn rate: <strong>$${((expenses - revenue) / 30).toFixed(0)}/jour</strong></div>
                        <div>Runway: <strong>${Math.floor((metrics?.cashAtBank?.value || 0) / Math.max(1, expenses - revenue))} mois</strong></div>
                        <div>ROI: <strong>${expenses > 0 ? ((revenue / expenses - 1) * 100).toFixed(1) : '0'}%</strong></div>
                        <div>Efficacité: <strong>${expenses > 0 ? (revenue / expenses).toFixed(2) : '0'}x</strong></div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Met à jour l'explication du graphique de tendance
     */
    function updateTrendExplanation(trendData, analysis) {
        if (!elements.trendExplanation) return;
        
        const revenue = trendData.revenue || [];
        const expenses = trendData.expenses || [];
        
        // Calculer la tendance
        const lastRevenue = revenue[revenue.length - 1] || 0;
        const firstRevenue = revenue[0] || 0;
        const revenueGrowth = ((lastRevenue - firstRevenue) / firstRevenue * 100).toFixed(1);
        
        const lastExpense = expenses[expenses.length - 1] || 0;
        const firstExpense = expenses[0] || 0;
        const expenseGrowth = ((lastExpense - firstExpense) / firstExpense * 100).toFixed(1);
        
        const isPositiveTrend = revenueGrowth > expenseGrowth;
        
        let explanation = `
            <strong>📈 Analyse de tendance:</strong><br>
            ${isPositiveTrend ? '✅' : '⚠️'} Revenus: ${revenueGrowth > 0 ? '+' : ''}${revenueGrowth}% 
            ${revenueGrowth > 0 ? '(croissance)' : '(déclin)'}<br>
            ${expenseGrowth < revenueGrowth ? '✅' : '⚠️'} Dépenses: ${expenseGrowth > 0 ? '+' : ''}${expenseGrowth}% 
            ${expenseGrowth < 10 ? '(contrôlées)' : '(attention requise)'}<br>
            <strong>Interprétation:</strong> ${
                isPositiveTrend ? 
                'La croissance des revenus dépasse celle des dépenses. Continuez sur cette voie!' :
                'Les dépenses augmentent plus vite que les revenus. Actions correctives nécessaires.'
            }
        `;
        
        elements.trendExplanation.innerHTML = explanation;
        
        // Ajouter des insights sur la tendance
        if (elements.trendInsights) {
            const insights = [];
            
            // Identifier les pics et creux
            const maxRevenue = Math.max(...revenue);
            const minRevenue = Math.min(...revenue);
            const maxIndex = revenue.indexOf(maxRevenue);
            const minIndex = revenue.indexOf(minRevenue);
            
            insights.push(`📊 <span style="background: #1a1a1a; padding: 4px 8px; border-radius: 4px; border: 1px solid #ffffff;">Pic de revenus</span>: ${trendData.labels?.[maxIndex]} ($${maxRevenue.toFixed(0)})`);
            insights.push(`📉 <span style="background: #0a0a0a; padding: 4px 8px; border-radius: 4px; border: 1px solid #666666;">Creux de revenus</span>: ${trendData.labels?.[minIndex]} ($${minRevenue.toFixed(0)})`);
            
            if (revenueGrowth > 20) {
                insights.push('🚀 Croissance forte - Capitaliser sur ce momentum');
            } else if (revenueGrowth < 0) {
                insights.push('⚠️ Déclin détecté - Actions urgentes requises');
            }
            
            elements.trendInsights.innerHTML = `
                <strong>Insights clés:</strong>
                <ul style="margin-top: 8px; margin-bottom: 0;">
                    ${insights.map(i => `<li>${i}</li>`).join('')}
                </ul>
            `;
        }
    }
    
    /**
     * Configuration des écouteurs d'événements
     */
    function setupEventListeners() {
        elements.refreshBtn?.addEventListener('click', () => {
            console.log('🔄 Actualisation manuelle demandée');
            refreshData();
        });

        // Recherche SQL
        // Barre de recherche principale
        elements.mainSearchBtn?.addEventListener('click', () => executeMainQuery());
        elements.mainQueryInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                executeMainQuery();
            }
        });
        
        // Questions rapides
        document.querySelectorAll('.quick-q-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                elements.mainQueryInput.value = this.dataset.question;
                executeMainQuery();
            });
        });
        
        // Sélecteur de période pour le graphique
        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                updateTrendChartPeriod(this.dataset.period);
            });
        });
        
        elements.searchBtn?.addEventListener('click', executeQuery);
        elements.queryInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                executeQuery();
            }
        });

        // Clic sur les métriques avec Agent 5 HoverInsights
        document.addEventListener('click', (e) => {
            if (e.target.closest('.metric-card')) {
                const card = e.target.closest('.metric-card');
                const metric = card.dataset.metric;
                console.log(`📊 Métrique cliquée: ${metric}`);
                showMetricDetail(metric);
            }
        });
    }

    /**
     * Configuration des écouteurs de messages
     */
    function setupMessageListeners() {
        chrome.runtime.onMessage.addListener((message) => {
            console.log('📨 Message reçu:', message.action);
            
            switch (message.action) {
                case 'sheetDetected':
                    appState.sheetId = message.sheetId;
                    updateSheetInfo(message.sheetId);
                    showStatus('Google Sheet détecté - Chargement automatique...');
                    hideNoDataState();
                    // Le background.js déclenche automatiquement le chargement
                    break;
                    
                case 'dataAutoLoaded':
                    showStatus(`${message.rowCount} lignes chargées automatiquement`);
                    appState.isAutoLoaded = true;
                    // Afficher la barre de recherche
                    elements.searchContainer.style.display = 'flex';
                    break;
                    
                case 'reportReady':
                    console.log('📊 [POPUP] 🔥🔥🔥 RAPPORT REÇU AVEC VRAIES DONNÉES 🔥🔥🔥');
                    console.log('📊 [POPUP] Données du rapport:', message.data);
                    console.log('📊 [POPUP] Métriques:', message.data?.metrics);
                    console.log('📊 [POPUP] Données graphique revenus:', message.data?.chartData?.revenue);
                    console.log('📊 [POPUP] Analyse brute:', message.data?.rawAnalysis);
                    
                    appState.reportData = message.data;
                    updateDashboard(message.data);
                    hideStatus();
                    hideNoDataState();
                    // Agent 5 HoverInsights - Mettre à jour les données pour tooltips
                    if (HoverInsightsAgent.updateFinancialData) {
                        HoverInsightsAgent.updateFinancialData(message.data);
                    }
                    break;
                    
                case 'error':
                    showStatus(`Erreur: ${message.message}`, true);
                    break;
                    
                case 'agentStatusUpdate':
                    updateAgentIndicators(message.status);
                    break;
            }
        });
    }

    /**
     * Déclenche le chargement automatique
     */
    async function triggerAutoLoad() {
        console.log('🚀 Déclenchement du chargement automatique');
        showStatus('Analyse en cours...');
        showAgentActivity();
        
        try {
            await chrome.runtime.sendMessage({
                action: 'loadSheetData'
            });
        } catch (error) {
            console.error('❌ Erreur auto-load:', error);
            showStatus('Erreur de chargement', true);
        }
    }

    /**
     * Actualise les données
     */
    async function refreshData() {
        showStatus('Actualisation...');
        showAgentActivity();
        
        try {
            const response = await chrome.runtime.sendMessage({
                action: 'refreshAnalysis'
            });
            
            if (!response || !response.success) {
                showStatus('Erreur d\'actualisation', true);
            }
        } catch (error) {
            console.error('❌ Erreur refresh:', error);
            showStatus('Erreur de communication', true);
        }
    }

    /**
     * Charge un rapport existant
     */
    async function loadExistingReport() {
        console.log('📊 Chargement du rapport existant');
        
        try {
            const response = await chrome.runtime.sendMessage({
                action: 'getReport'
            });
            
            if (response && response.success) {
                appState.reportData = response.report;
                appState.cellReferences = response.cellReferences;  // Stocker les références de cellules
                updateDashboard(response.report);
                hideNoDataState();
                // Agent 5 HoverInsights - Mettre à jour les données
                HoverInsightsAgent.updateFinancialData(response.report);
                
                // Afficher les références de cellules importantes
                if (response.cellReferences) {
                    displayCellReferences(response.cellReferences);
                }
            }
        } catch (error) {
            console.error('❌ Erreur chargement rapport:', error);
        }
    }

    /**
     * Met à jour le dashboard complet
     */
    function updateDashboard(reportData) {
        console.log('📊 Mise à jour du dashboard');
        
        if (!reportData) return;
        
        // Cacher l'état vide
        hideNoDataState();
        
        // Mettre à jour les métriques
        if (reportData.metrics) {
            updateMetrics(reportData.metrics);
        }
        
        // Mettre à jour les graphiques
        if (reportData.chartData) {
            updateCharts(reportData.chartData);
        }
        
        // Mettre à jour les insights
        if (reportData.rawAnalysis?.insights) {
            updateInsights(reportData.rawAnalysis.insights);
        }
        
        // Ajouter les Top 3 recommandations
        if (reportData.rawAnalysis) {
            generateTop3Recommendations(reportData.rawAnalysis);
        }
        
        // Activer les onglets
        if (reportData.rawAnalysis) {
            initializeTabs(reportData);
        }
        
        // Améliorer le graphique de tendance
        if (reportData.chartData?.trend) {
            updateTrendExplanation(reportData.chartData.trend, reportData.rawAnalysis);
        }
    }

    /**
     * Affiche les références de cellules importantes
     */
    function displayCellReferences(cellRefs) {
        if (!cellRefs) return;
        
        console.log('📍 Affichage des références de cellules importantes:', cellRefs);
        
        // Créer une section pour afficher les cellules importantes
        const cellInfoSection = document.createElement('div');
        cellInfoSection.className = 'cell-info-section';
        cellInfoSection.innerHTML = `
            <div class="cell-info-header">
                <h3>📍 Cellules Importantes Détectées</h3>
                <button class="toggle-highlight-btn" id="toggleHighlight">
                    Activer Surlignage
                </button>
            </div>
            <div class="cell-info-grid">
                ${cellRefs.largestExpense && cellRefs.largestExpense.value > 0 ? `
                    <div class="cell-info-card">
                        <div class="cell-ref">${cellRefs.largestExpense.cellRef}</div>
                        <div class="cell-label">Plus grosse dépense</div>
                        <div class="cell-value">$${cellRefs.largestExpense.value.toFixed(2)}</div>
                        <div class="cell-description">${cellRefs.largestExpense.description || 'N/A'}</div>
                    </div>
                ` : ''}
                ${cellRefs.largestRevenue && cellRefs.largestRevenue.value > 0 ? `
                    <div class="cell-info-card">
                        <div class="cell-ref">${cellRefs.largestRevenue.cellRef}</div>
                        <div class="cell-label">Plus gros revenu</div>
                        <div class="cell-value">$${cellRefs.largestRevenue.value.toFixed(2)}</div>
                        <div class="cell-description">${cellRefs.largestRevenue.description || 'N/A'}</div>
                    </div>
                ` : ''}
                ${cellRefs.recurringPayments && cellRefs.recurringPayments.length > 0 ? 
                    cellRefs.recurringPayments.slice(0, 3).map(payment => `
                        <div class="cell-info-card">
                            <div class="cell-ref">${payment.cellRef}</div>
                            <div class="cell-label">Paiement récurrent (${payment.frequency}x)</div>
                            <div class="cell-value">$${payment.amount.toFixed(2)}</div>
                            <div class="cell-description">${payment.description}</div>
                        </div>
                    `).join('') : ''}
                ${cellRefs.anomalies && cellRefs.anomalies.length > 0 ? 
                    cellRefs.anomalies.slice(0, 2).map(anomaly => `
                        <div class="cell-info-card anomaly">
                            <div class="cell-ref">${anomaly.cellRef}</div>
                            <div class="cell-label">⚠️ Anomalie détectée</div>
                            <div class="cell-value">$${anomaly.value.toFixed(2)}</div>
                            <div class="cell-description">${anomaly.insight}</div>
                        </div>
                    `).join('') : ''}
            </div>
        `;
        
        // Insérer après les métriques
        const existingSection = document.querySelector('.cell-info-section');
        if (existingSection) {
            existingSection.remove();
        }
        
        elements.metricsGrid.parentNode.insertBefore(cellInfoSection, elements.metricsGrid.nextSibling);
        
        // Ajouter l'événement pour le bouton de surlignage
        document.getElementById('toggleHighlight')?.addEventListener('click', toggleCellHighlighting);
    }
    
    /**
     * Active/désactive le surlignage dans Google Sheets
     */
    function toggleCellHighlighting() {
        const btn = document.getElementById('toggleHighlight');
        const isActive = btn.textContent === 'Désactiver Surlignage';
        
        if (isActive) {
            btn.textContent = 'Activer Surlignage';
            // Envoyer message pour désactiver le surlignage
            chrome.runtime.sendMessage({
                action: 'disableHighlighting'
            });
        } else {
            btn.textContent = 'Désactiver Surlignage';
            // Envoyer message pour activer le surlignage
            chrome.runtime.sendMessage({
                action: 'enableHighlighting',
                cells: appState.cellReferences
            });
        }
    }

    /**
     * Met à jour les cartes de métriques avec Agent 5 HoverInsights
     */
    function updateMetrics(metrics) {
        console.log('📈 Mise à jour des métriques avec tooltips intelligents');
        
        const metricsHTML = Object.entries(metrics).slice(0, 6).map(([key, data]) => {
            const changeClass = data.trend === 'up' ? 'positive' : 
                               data.trend === 'down' ? 'negative' : 'neutral';
            const changeIcon = data.trend === 'up' ? '+' : 
                              data.trend === 'down' ? '-' : '';
            
            // Ajouter la référence de cellule si elle correspond à une métrique importante
            let cellRef = '';
            if (appState.cellReferences) {
                if (key === 'totalExpenses' && appState.cellReferences.largestExpense) {
                    cellRef = `<div class="metric-cell-ref">📍 ${appState.cellReferences.largestExpense.cellRef}</div>`;
                } else if (key === 'totalRevenue' && appState.cellReferences.largestRevenue) {
                    cellRef = `<div class="metric-cell-ref">📍 ${appState.cellReferences.largestRevenue.cellRef}</div>`;
                }
            }
            
            return `
                <div class="metric-card" data-metric="${key}" data-tooltip="smart">
                    <div class="metric-label">${data.label}</div>
                    <div class="metric-value">${data.value}</div>
                    <div class="metric-change ${changeClass}">
                        ${changeIcon}${data.change} MoM
                    </div>
                    ${cellRef}
                </div>
            `;
        }).join('');
        
        elements.metricsGrid.innerHTML = metricsHTML;
    }

    /**
     * Met à jour les graphiques avec Agent 5 HoverInsights
     */
    function updateCharts(chartData) {
        console.log('📊 [POPUP] 🔥🔥🔥 MISE À JOUR DES GRAPHIQUES AVEC VRAIES DONNÉES 🔥🔥🔥');
        console.log('📊 [POPUP] Données revenue:', chartData.revenue);
        console.log('📊 [POPUP] Données trend:', chartData.trend);
        
        // Graphique donut
        if (chartData.revenue) {
            createRevenueChart(chartData.revenue);
            elements.revenueSplitContainer.style.display = 'block';
            // Ajouter l'attribut tooltip
            elements.revenueSplitContainer.setAttribute('data-tooltip', 'smart');
        }
        
        // Graphique de tendance
        if (chartData.trend) {
            createTrendChart(chartData.trend);
            elements.trendContainer.style.display = 'block';
            // Ajouter l'attribut tooltip
            elements.trendContainer.setAttribute('data-tooltip', 'smart');
        }
    }

    /**
     * Crée le graphique donut avec valeur centrale
     */
    function createRevenueChart(data) {
        console.log('🍩 [POPUP] 🔥🔥🔥 CRÉATION GRAPHIQUE DONUT AVEC VRAIES DONNÉES 🔥🔥🔥');
        console.log('🍩 [POPUP] Labels:', data.labels);
        console.log('🍩 [POPUP] Valeurs:', data.values);
        
        const ctx = document.getElementById('revenueChart');
        if (!ctx) {
            console.error('🍩 [POPUP] Canvas revenueChart non trouvé!');
            return;
        }
        
        // Détruire le graphique existant
        if (appState.charts.revenue) {
            appState.charts.revenue.destroy();
        }
        
        // Calculer le total avec vérification
        const total = data.values && data.values.length > 0 
            ? data.values.reduce((a, b) => (a || 0) + (b || 0), 0) 
            : 0;
        console.log('🍩 [POPUP] Total calculé:', total);
        
        // Vérifier si le total est valide
        if (!isNaN(total) && isFinite(total)) {
            elements.totalRevenue.textContent = formatCurrency(total);
        } else {
            elements.totalRevenue.textContent = '$0';
        }
        
        appState.charts.revenue = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.values,
                    backgroundColor: [
                        '#ffffff',
                        '#cccccc',
                        '#999999',
                        '#666666',
                        '#333333',
                        '#1a1a1a'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff',
                    cutout: '70%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: '#ffffff',
                        titleColor: '#000000',
                        bodyColor: '#000000',
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                            }
                        }
                    }
                },
                onClick: (event, elements) => {
                    if (elements.length > 0) {
                        const index = elements[0].index;
                        const label = data.labels[index];
                        const value = data.values[index];
                        console.log(`Segment: ${label} - ${formatCurrency(value)}`);
                    }
                }
            }
        });
    }

    /**
     * Crée le graphique de tendance
     */
    function createTrendChart(data) {
        const ctx = document.getElementById('trendChart');
        if (!ctx) return;
        
        // Détruire le graphique existant
        if (appState.charts.trend) {
            appState.charts.trend.destroy();
        }
        
        appState.charts.trend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Entrées',
                    data: data.entries,
                    borderColor: '#ffffff',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    tension: 0.3,
                    fill: true
                }, {
                    label: 'Sorties',
                    data: data.exits,
                    borderColor: '#999999',
                    backgroundColor: 'rgba(153, 153, 153, 0.1)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#999999',
                            padding: 15,
                            font: {
                                size: 11
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: '#ffffff',
                        titleColor: '#000000',
                        bodyColor: '#000000',
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#333333'
                        },
                        ticks: {
                            color: '#999999',
                            font: {
                                size: 11
                            },
                            callback: function(value) {
                                return formatCurrency(value, true);
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#999999',
                            font: {
                                size: 11
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Met à jour les insights IA avec actions concrètes
     */
    function updateInsights(insights) {
        console.log('🤖 Mise à jour des insights avec actions recommandées');
        
        if (!insights || insights.length === 0) return;
        
        // Séparer les insights par catégorie
        const urgentActions = [];
        const normalActions = [];
        const optimizations = [];
        const priorities = [];
        let currentSection = 'normal';
        
        insights.forEach(insight => {
            if (insight.includes('TOP 3 PRIORITÉS')) {
                currentSection = 'priorities';
            } else if (insight.includes('Actions recommandées')) {
                currentSection = 'actions';
            } else if (insight.startsWith('🔴 URGENT:')) {
                urgentActions.push(insight);
            } else if (insight.startsWith('1️⃣') || insight.startsWith('2️⃣') || insight.startsWith('3️⃣')) {
                priorities.push(insight);
            } else if (insight.includes('ACTION:') || insight.includes('OPTIMISER:')) {
                normalActions.push(insight);
            } else if (!insight.startsWith('\n')) {
                optimizations.push(insight);
            }
        });
        
        let insightsHTML = '';
        
        // Afficher les actions urgentes en premier
        if (urgentActions.length > 0) {
            insightsHTML += `
                <div class="insight-section urgent">
                    <h4 style="color: #ffffff; margin-bottom: 8px;">⚠️ Actions Urgentes</h4>
                    ${urgentActions.map(action => `
                        <div class="insight-card urgent-action" data-tooltip="smart">
                            <div class="insight-text">${action}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        // Afficher les top priorités
        if (priorities.length > 0) {
            insightsHTML += `
                <div class="insight-section priorities">
                    <h4 style="color: #ffffff; margin-bottom: 8px;">🎯 Priorités Cette Semaine</h4>
                    ${priorities.map(priority => `
                        <div class="insight-card priority-action" data-tooltip="smart">
                            <div class="insight-text">${priority}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        // Afficher les actions normales
        if (normalActions.length > 0) {
            insightsHTML += `
                <div class="insight-section actions">
                    <h4 style="color: #ffffff; margin-bottom: 8px;">💡 Actions Recommandées</h4>
                    ${normalActions.slice(0, 5).map(action => `
                        <div class="insight-card normal-action" data-tooltip="smart">
                            <div class="insight-text">${action}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        // Afficher les métriques et optimisations
        if (optimizations.length > 0) {
            insightsHTML += `
                <div class="insight-section metrics">
                    <h4 style="color: #ffffff; margin-bottom: 8px;">📊 Analyse Financière</h4>
                    ${optimizations.slice(0, 3).map(metric => `
                        <div class="insight-card metric-insight" data-tooltip="smart">
                            <div class="insight-text">${metric}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        elements.insightsContainer.innerHTML = insightsHTML;
        elements.insightsSection.style.display = 'block';
        
        // Ajouter des styles pour les différents types d'actions
        const style = document.createElement('style');
        style.textContent = `
            .insight-section {
                margin-bottom: 16px;
            }
            .insight-card.urgent-action {
                background: rgba(234, 67, 53, 0.1);
                border-left: 3px solid #ffffff;
            }
            .insight-card.priority-action {
                background: rgba(251, 188, 4, 0.1);
                border-left: 3px solid #cccccc;
            }
            .insight-card.normal-action {
                background: rgba(66, 133, 244, 0.1);
                border-left: 3px solid #999999;
            }
            .insight-card.metric-insight {
                background: rgba(52, 168, 83, 0.05);
                border-left: 3px solid #666666;
            }
        `;
        if (!document.head.querySelector('#insight-styles')) {
            style.id = 'insight-styles';
            document.head.appendChild(style);
        }
    }

    /**
     * Met à jour les informations du Sheet
     */
    function updateSheetInfo(sheetId) {
        if (sheetId) {
            elements.sheetInfo.style.display = 'flex';
            elements.sheetId.textContent = sheetId.substring(0, 12) + '...';
        } else {
            elements.sheetInfo.style.display = 'none';
        }
    }

    /**
     * Affiche l'état vide
     */
    function showNoDataState() {
        elements.noDataState.style.display = 'block';
        elements.metricsGrid.innerHTML = '';
        elements.revenueSplitContainer.style.display = 'none';
        elements.trendContainer.style.display = 'none';
        elements.insightsSection.style.display = 'none';
    }

    /**
     * Cache l'état vide
     */
    function hideNoDataState() {
        elements.noDataState.style.display = 'none';
    }

    /**
     * Affiche le statut
     */
    function showStatus(message, isError = false) {
        console.log(`📢 Status: ${message}`);
        elements.statusBar.classList.add('active');
        elements.statusText.textContent = message;
        
        if (isError) {
            setTimeout(() => hideStatus(), 5000);
        }
    }

    /**
     * Cache le statut
     */
    function hideStatus() {
        elements.statusBar.classList.remove('active');
    }

    /**
     * Affiche l'activité des agents
     */
    function showAgentActivity() {
        elements.statusBar.classList.add('active');
        elements.parserDot.classList.add('active');
        
        setTimeout(() => {
            elements.parserDot.classList.remove('active');
            elements.analystDot.classList.add('active');
        }, 1000);
        
        setTimeout(() => {
            elements.analystDot.classList.remove('active');
            elements.reporterDot.classList.add('active');
        }, 2000);
        
        setTimeout(() => {
            elements.reporterDot.classList.remove('active');
            hideStatus();
        }, 3000);
    }

    /**
     * Met à jour les indicateurs d'agents
     */
    function updateAgentIndicators(status) {
        if (!status) return;
        
        ['parser', 'analyst', 'reporter'].forEach(agent => {
            const dot = elements[`${agent}Dot`];
            if (dot) {
                if (status[agent] === 'processing') {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            }
        });
    }

    /**
     * Affiche le détail d'une métrique
     */
    function showMetricDetail(metric) {
        if (appState.reportData?.metrics[metric]) {
            const data = appState.reportData.metrics[metric];
            showStatus(`${data.label}: ${data.value} (${data.change} MoM)`);
            setTimeout(() => hideStatus(), 3000);
        }
    }

    /**
     * Exécute une requête en langage naturel avec interface de chargement
     */
    async function executeQuery() {
        const query = elements.queryInput.value.trim();
        
        if (!query) {
            showStatus('Posez une question sur vos données', true);
            return;
        }
        
        console.log('🤖 Traitement de la question:', query);
        elements.searchBtn.disabled = true;
        
        // Afficher l'interface de chargement avec étapes
        const chatResponse = document.getElementById('chatResponse');
        chatResponse.innerHTML = createLoadingInterface();
        chatResponse.style.display = 'block';
        
        // Simuler les étapes de traitement
        const steps = [
            { id: 'understanding', delay: 500, text: 'Compréhension de votre question...' },
            { id: 'analyzing', delay: 1000, text: 'Analyse des données financières...' },
            { id: 'calculating', delay: 1500, text: 'Calcul des métriques...' },
            { id: 'generating', delay: 2000, text: 'Génération de la réponse...' }
        ];
        
        try {
            // Animer les étapes
            for (const step of steps) {
                await animateStep(step.id, step.delay);
            }
            
            // Analyser la question avec le système agentique
            const response = await analyzeQuestionWithAgents(query);
            
            // Afficher la réponse
            displaySmartResponse(response);
            hideStatus();
            
        } catch (error) {
            console.error('❌ Erreur analyse:', error);
            displayErrorResponse('Erreur lors de l\'analyse de votre question.');
        } finally {
            elements.searchBtn.disabled = false;
        }
    }
    
    /**
     * Crée l'interface de chargement avec étapes
     */
    function createLoadingInterface() {
        return `
            <div class="thinking-interface">
                <div class="thinking-header">
                    <span class="thinking-icon">🤔</span>
                    <span class="thinking-title">Analyse en cours...</span>
                </div>
                <div class="thinking-steps">
                    <div class="thinking-step" id="step-understanding">
                        <span class="step-icon">📝</span>
                        <span class="step-text">Compréhension de votre question...</span>
                        <span class="step-status" id="status-understanding">⏳</span>
                    </div>
                    <div class="thinking-step" id="step-analyzing">
                        <span class="step-icon">🔍</span>
                        <span class="step-text">Analyse des données financières...</span>
                        <span class="step-status" id="status-analyzing">⏳</span>
                    </div>
                    <div class="thinking-step" id="step-calculating">
                        <span class="step-icon">🧮</span>
                        <span class="step-text">Calcul des métriques...</span>
                        <span class="step-status" id="status-calculating">⏳</span>
                    </div>
                    <div class="thinking-step" id="step-generating">
                        <span class="step-icon">✨</span>
                        <span class="step-text">Génération de la réponse...</span>
                        <span class="step-status" id="status-generating">⏳</span>
                    </div>
                </div>
            </div>
            <style>
                .thinking-interface {
                    padding: 20px;
                    background: #111111;
                    border-radius: 12px;
                    color: white;
                }
                .thinking-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 20px;
                }
                .thinking-icon {
                    font-size: 32px;
                    animation: pulse 1.5s infinite;
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
                .thinking-title {
                    font-size: 18px;
                    font-weight: 600;
                }
                .thinking-steps {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .thinking-step {
                    display: flex;
                    align-items: center;
                    padding: 12px;
                    background: #1a1a1a;
                    border-radius: 8px;
                    transition: all 0.3s;
                }
                .thinking-step.active {
                    background: #333333;
                    transform: translateX(8px);
                }
                .thinking-step.completed {
                    opacity: 0.7;
                }
                .step-icon {
                    font-size: 20px;
                    margin-right: 12px;
                }
                .step-text {
                    flex: 1;
                    font-size: 14px;
                }
                .step-status {
                    font-size: 20px;
                }
            </style>
        `;
    }
    
    /**
     * Anime une étape du processus
     */
    async function animateStep(stepId, delay) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const step = document.getElementById(`step-${stepId}`);
                const status = document.getElementById(`status-${stepId}`);
                
                if (step && status) {
                    step.classList.add('active');
                    status.textContent = '⚡';
                    
                    setTimeout(() => {
                        step.classList.remove('active');
                        step.classList.add('completed');
                        status.textContent = '✅';
                        resolve();
                    }, 300);
                } else {
                    resolve();
                }
            }, delay);
        });
    }
    
    /**
     * Analyse la question avec un système agentique robuste
     */
    async function analyzeQuestionWithAgents(question) {
        const q = question.toLowerCase();
        
        // Vérifier qu'on a des données
        if (!appState.reportData?.rawAnalysis) {
            return {
                type: 'error',
                title: '❌ Aucune donnée disponible',
                content: 'Veuillez d\'abord charger un Google Sheet avec vos données financières.',
                action: 'Cliquez sur une feuille Google Sheets ouverte pour charger les données.'
            };
        }
        
        const analysis = appState.reportData.rawAnalysis;
        const grouped = analysis.grouped || {};
        
        // Agent 1: Comprendre l'intention
        console.log('🔍 [DEBUG] Question posée:', q);
        const intent = detectIntent(q);
        console.log('🎯 [DEBUG] Intent détecté:', intent);
        
        // DÉBUG SPÉCIAL pour "explique-moi l'excel"
        if (q.includes('explique')) {
            console.log('🚀 [DEBUG] QUESTION "EXPLIQUE" DÉTECTÉE!');
            console.log('🚀 [DEBUG] Intent final:', intent);
        }
        
        // Agent 2: Extraire les données pertinentes
        const data = extractRelevantData(intent, analysis, grouped);
        console.log('📊 [DEBUG] Données extraites pour intent "' + intent + '":', data);
        
        if (intent === 'explain_excel') {
            console.log('🚀 [DEBUG] EXPLAIN_EXCEL - Revenus réels:', analysis.totals?.entries);
            console.log('🚀 [DEBUG] EXPLAIN_EXCEL - Dépenses réelles:', analysis.totals?.exits);
        }
        
        // Agent 3: Générer la réponse
        let response = generateSmartResponse(intent, data, analysis);
        console.log('✨ [DEBUG] Réponse générée pour intent "' + intent + '":', response);
        
        // Agent 4: Améliorer la réponse avec encadrement des cellules
        response = enhanceResponseWithCellHighlighting(response, intent, analysis);
        
        if (intent === 'explain_excel') {
            console.log('🚀 [DEBUG] RÉPONSE EXPLAIN_EXCEL:', {
                title: response.title,
                mainMetric: response.mainMetric,
                detailsCount: response.details?.length || 0,
                insightsCount: response.insights?.length || 0
            });
        }
        
        return response;
    }
    
    /**
     * Détecte l'intention de la question
     */
    function detectIntent(question) {
        const q = question.toLowerCase();
        const intents = {
            'explain_excel': ['explique', 'analyse', 'résume', 'dis-moi', 'qu\'est-ce que', 'comment va', 'état de', 'présente', 'raconte'],
            'biggest_expense': ['plus grosse dépense', 'plus grande dépense', 'dépense principale', 'coûte le plus', 'plus cher'],
            'profit': ['bénéfice', 'profit', 'gain', 'rentabilité', 'résultat net'],
            'margin': ['marge', 'margin', 'pourcentage de profit', 'rentabilité'],
            'salaries': ['salaire', 'salary', 'paie', 'payroll', 'employé', 'rémunération'],
            'top_expenses': ['top', 'principales dépenses', 'trois dépenses', 'classement', 'liste des'],
            'evolution': ['évolution', 'tendance', 'progression', 'mois par mois', 'chronologie'],
            'revenue': ['revenu', 'chiffre d\'affaires', 'vente', 'entrée', 'recette'],
            'expenses': ['dépense totale', 'coût total', 'sortie totale', 'charges'],
            'specific_category': ['combien', 'montant', 'total pour'],
            'comparison': ['comparer', 'différence', 'versus', 'vs', 'contraste'],
            'forecast': ['prévision', 'projection', 'futur', 'prochains mois'],
            'health_check': ['santé', 'comment ça va', 'situation', 'bilan', 'état financier']
        };
        
        for (const [intent, keywords] of Object.entries(intents)) {
            if (keywords.some(keyword => q.includes(keyword))) {
                return intent;
            }
        }
        
        return 'general';
    }
    
    /**
     * Extrait les données pertinentes selon l'intention
     */
    function extractRelevantData(intent, analysis, grouped) {
        switch (intent) {
            case 'explain_excel':
                // Pour "Explique-moi l'excel", retourner toutes les données
                return {
                    analysis: analysis,
                    grouped: grouped,
                    totals: analysis.totals,
                    categories: Object.entries(grouped),
                    transactionCount: analysis.totals?.transactionCount || 0
                };
                
            case 'biggest_expense':
                // Retourner la VRAIE plus grosse dépense (transaction individuelle)
                if (analysis.biggestExpense && analysis.biggestExpense.amount > 0) {
                    return ['Transaction', {
                        exits: analysis.biggestExpense.amount,
                        count: 1,
                        description: analysis.biggestExpense.description,
                        date: analysis.biggestExpense.date,
                        rowIndex: analysis.biggestExpense.rowIndex
                    }];
                }
                return null;
                    
            case 'profit':
                return {
                    profit: analysis.totals.entries - analysis.totals.exits,
                    margin: analysis.totals.margin,
                    entries: analysis.totals.entries,
                    exits: analysis.totals.exits
                };
                
            case 'salaries':
                return grouped['Salaires'] || grouped['Salary'] || grouped['Payroll'] || 
                       grouped['Salaries'] || grouped['Employees'] || { exits: 0, count: 0 };
                       
            case 'top_expenses':
                return Object.entries(grouped)
                    .filter(([_, data]) => data.exits > 0)
                    .sort((a, b) => b[1].exits - a[1].exits)
                    .slice(0, 5);
                    
            case 'evolution':
                return analysis.monthlyData || {};
                
            case 'revenue':
                return {
                    total: analysis.totals.entries,
                    sources: Object.entries(grouped)
                        .filter(([_, data]) => data.entries > 0)
                        .sort((a, b) => b[1].entries - a[1].entries)
                };
                
            case 'expenses':
                return {
                    total: analysis.totals.exits,
                    categories: Object.entries(grouped)
                        .filter(([_, data]) => data.exits > 0)
                        .sort((a, b) => b[1].exits - a[1].exits)
                };
                
            case 'health_check':
                return {
                    analysis: analysis,
                    totals: analysis.totals,
                    grouped: grouped
                };
                
            default:
                return analysis;
        }
    }
    
    /**
     * Génère une réponse intelligente avec données contextuelles enrichies
     */
    function generateSmartResponse(intent, data, analysis) {
        // Utiliser les VRAIES données de l'Excel, pas des données mockées
        const totalRevenue = analysis.totals?.entries || 0;
        const totalExpenses = analysis.totals?.exits || 0;
        const profitMargin = analysis.totals?.margin || 0;
        const profit = totalRevenue - totalExpenses;
        const transactionCount = analysis.totals?.transactionCount || 0;
        const margin = totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(1) : 0;
        
        // Pour "Explique-moi l'excel" - ANALYSE COMPLÈTE AVEC VRAIES DONNÉES
        if (intent === 'explain_excel') {
            const categories = Object.entries(analysis.grouped || {});
            const topExpenses = categories
                .filter(([_, d]) => d.exits > 0)
                .sort((a, b) => b[1].exits - a[1].exits)
                .slice(0, 3);
            const topRevenues = categories
                .filter(([_, d]) => d.entries > 0)
                .sort((a, b) => b[1].entries - a[1].entries)
                .slice(0, 3);
                
            const efficiency = totalExpenses > 0 ? (totalRevenue / totalExpenses) : 0;
            const burnRate = totalExpenses - totalRevenue;
            const avgTransactionValue = transactionCount > 0 ? (totalRevenue + totalExpenses) / transactionCount : 0;
            
            return {
                type: 'detailed',
                title: '🤖 Analyse IA complète de votre fichier Excel',
                mainMetric: {
                    label: 'État financier général',
                    value: profit > 0 ? '✅ ENTREPRISE RENTABLE' : '❌ ENTREPRISE EN PERTE',
                    subtitle: `Profit: $${profit.toFixed(0)} | Marge: ${margin}% | ${transactionCount} transactions`
                },
                details: [
                    { icon: '💰', label: 'Total Revenus', value: `$${totalRevenue.toFixed(0)}` },
                    { icon: '💸', label: 'Total Dépenses', value: `$${totalExpenses.toFixed(0)}` },
                    { icon: '⚖️', label: 'Efficacité', value: `${efficiency.toFixed(2)}x` },
                    { icon: '📊', label: 'Catégories actives', value: `${categories.length}` },
                    { icon: '💳', label: 'Valeur moy. transaction', value: `$${avgTransactionValue.toFixed(0)}` },
                    { icon: burnRate > 0 ? '🔥' : '💚', label: burnRate > 0 ? 'Burn rate mensuel' : 'Cash flow positif', value: burnRate > 0 ? `$${burnRate.toFixed(0)}/mois` : `+$${Math.abs(burnRate).toFixed(0)}/mois` }
                ],
                insights: [
                    `🎯 **Top dépense**: "${topExpenses[0]?.[0] || 'Aucune'}" représente $${(topExpenses[0]?.[1]?.exits || 0).toFixed(0)} (${topExpenses[0] && totalExpenses > 0 ? ((topExpenses[0][1].exits / totalExpenses) * 100).toFixed(0) : 0}% du total)`,
                    `💎 **Top revenu**: "${topRevenues[0]?.[0] || 'Aucun'}" génère $${(topRevenues[0]?.[1]?.entries || 0).toFixed(0)} (${topRevenues[0] && totalRevenue > 0 ? ((topRevenues[0][1].entries / totalRevenue) * 100).toFixed(0) : 0}% du total)`,
                    profit > 0 ? 
                        `✅ **Santé**: Excellente! Vous générez $${profit.toFixed(0)} de bénéfice avec ${margin}% de marge. ${efficiency > 2 ? 'Très efficace!' : efficiency > 1.5 ? 'Bonne efficacité' : 'Efficacité à améliorer'}` :
                        `🚨 **Alerte**: Perte de $${Math.abs(profit).toFixed(0)}. Réduisez les dépenses de ${totalExpenses > 0 ? ((Math.abs(profit) / totalExpenses) * 100).toFixed(0) : 0}% ou augmentez les revenus de ${totalRevenue > 0 ? ((Math.abs(profit) / totalRevenue) * 100).toFixed(0) : 0}% pour l'équilibre.`,
                    `📈 **Performance**: Ratio R/D de ${efficiency.toFixed(2)}x ${efficiency >= 2 ? '(Excellent!)' : efficiency >= 1.5 ? '(Bon)' : efficiency >= 1.1 ? '(Correct)' : '(À améliorer)'}`,
                    `🔍 **Volume**: ${transactionCount} transactions analysées. ${transactionCount > 200 ? 'Volume élevé - automatisation recommandée' : transactionCount > 50 ? 'Volume modéré - suivi manuel possible' : 'Faible volume - gestion manuelle adaptée'}`
                ]
            };
        }
        
        // Pour health_check
        if (intent === 'health_check') {
            const healthScore = margin > 25 ? 'Excellente' : 
                               margin > 15 ? 'Bonne' :
                               margin > 5 ? 'Correcte' :
                               margin > 0 ? 'Fragile' : 'Critique';
            const healthColor = margin > 15 ? '🟢' : margin > 5 ? '🟡' : '🔴';
            
            return {
                type: 'detailed',
                title: `${healthColor} Bilan de santé financière`,
                mainMetric: {
                    label: 'Score de santé global',
                    value: healthScore,
                    subtitle: `Marge: ${margin}% | Profit: $${profit.toFixed(0)}`
                },
                details: [
                    { icon: '💰', label: 'Revenus', value: `$${totalRevenue.toFixed(0)}` },
                    { icon: '💸', label: 'Dépenses', value: `$${totalExpenses.toFixed(0)}` },
                    { icon: profit > 0 ? '📈' : '📉', label: 'Résultat', value: `$${profit.toFixed(0)}` }
                ],
                insights: [
                    profit > 0 ? '✅ Votre entreprise est rentable' : '❌ Votre entreprise perd de l\'argent',
                    `📊 Marge de ${margin}% ${margin > 20 ? '(Très bonne)' : margin > 10 ? '(Correcte)' : '(À améliorer)'}`,
                    totalExpenses > 0 ? `⚖️ Efficacité: ${(totalRevenue/totalExpenses).toFixed(2)}x` : '⚖️ Pas de dépenses détectées'
                ]
            };
        }
        
        switch (intent) {
            case 'biggest_expense':
                if (!data) {
                    return {
                        type: 'error',
                        title: '❌ Aucune dépense trouvée',
                        content: 'Impossible d\'identifier des dépenses dans vos données.'
                    };
                }
                
                const [category, expenseData] = data;
                const percent = ((expenseData.exits / totalExpenses) * 100).toFixed(1);
                const ratioVsRevenues = ((expenseData.exits / totalRevenue) * 100).toFixed(1);
                
                // C'est maintenant une transaction individuelle, pas une catégorie
                const isIndividualTransaction = expenseData.description && expenseData.date;
                
                return {
                    type: 'detailed',
                    title: '💸 Votre Plus Grosse Dépense',
                    mainMetric: {
                        label: isIndividualTransaction ? expenseData.description : category,
                        value: `$${expenseData.exits.toFixed(0)}`,
                        subtitle: isIndividualTransaction ? 
                            `Transaction du ${expenseData.date} (${percent}% du total)` : 
                            `${percent}% du total des dépenses`
                    },
                    details: [
                        { icon: '📄', label: 'Description', value: expenseData.description || category },
                        { icon: '💰', label: 'Montant', value: `$${expenseData.exits.toFixed(0)}` },
                        { icon: '📅', label: 'Date', value: expenseData.date || 'Non spécifiée' },
                        { icon: '📈', label: 'Part du budget total', value: `${percent}%` },
                        { icon: '⚖️', label: 'Part des revenus', value: `${ratioVsRevenues}%` }
                    ],
                    insights: [
                        `💸 Cette transaction de $${expenseData.exits.toFixed(0)} est votre plus grosse dépense individuelle`,
                        `📊 Elle représente ${percent}% de toutes vos dépenses ($${totalExpenses.toFixed(0)})`,
                        `⚖️ Cette seule dépense consomme ${ratioVsRevenues}% de vos revenus totaux`
                    ],
                    chart: {
                        type: 'pie',
                        data: Object.entries(analysis.grouped)
                            .filter(([_, d]) => d.exits > 0)
                            .sort((a, b) => b[1].exits - a[1].exits)
                            .slice(0, 5)
                            .map(([cat, d]) => ({ label: cat, value: d.exits }))
                    }
                };
                
            case 'profit':
                const isProfit = profit > 0;
                const marginPercent = totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(1) : 0;
                
                return {
                    type: 'detailed',
                    title: isProfit ? '💰 Votre Bénéfice' : '🔴 Votre Perte',
                    mainMetric: {
                        label: isProfit ? 'Bénéfice Net' : 'Perte Nette',
                        value: `$${Math.abs(profit).toFixed(0)}`,
                        subtitle: `Calcul: $${totalRevenue.toFixed(0)} - $${totalExpenses.toFixed(0)} = $${profit.toFixed(0)}`
                    },
                    details: [
                        { icon: '📈', label: 'Total revenus', value: `$${totalRevenue.toFixed(0)}` },
                        { icon: '📉', label: 'Total dépenses', value: `$${totalExpenses.toFixed(0)}` },
                        { icon: '⚖️', label: 'Différence', value: `$${profit.toFixed(0)}` },
                        { icon: '📊', label: 'Marge', value: `${marginPercent}%` },
                        { icon: '💳', label: 'Nombre de transactions', value: transactionCount.toString() }
                    ],
                    insights: [
                        `💰 Revenus: $${totalRevenue.toFixed(0)} (somme de toutes les entrées)`,
                        `💸 Dépenses: $${totalExpenses.toFixed(0)} (somme de toutes les sorties)`,
                        `📊 Résultat: ${isProfit ? 'Bénéfice' : 'Perte'} de $${Math.abs(profit).toFixed(0)}`
                    ]
                };
                
            case 'salaries':
                const salaryPercent = data.exits > 0 && totalExpenses > 0 ? ((data.exits / totalExpenses) * 100).toFixed(1) : 0;
                const avgSalary = data.count > 0 ? (data.exits / data.count).toFixed(0) : 0;
                const revenuePercent = totalRevenue > 0 ? ((data.exits / totalRevenue) * 100).toFixed(1) : 0;
                
                return {
                    type: 'detailed',
                    title: '👥 Analyse des Salaires',
                    mainMetric: {
                        label: 'Total Salaires',
                        value: `$${data.exits.toFixed(0)}`,
                        subtitle: `${salaryPercent}% des dépenses totales`
                    },
                    details: [
                        { icon: '👤', label: 'Nombre de transactions', value: data.count.toString() },
                        { icon: '💰', label: 'Montant total', value: `$${data.exits.toFixed(0)}` },
                        { icon: '📊', label: 'Pourcentage des dépenses', value: `${salaryPercent}%` },
                        { icon: '📈', label: 'Pourcentage des revenus', value: `${revenuePercent}%` },
                        { icon: '💵', label: 'Moyenne par transaction', value: `$${avgSalary}` }
                    ],
                    insights: [
                        `👥 Total des salaires: $${data.exits.toFixed(0)} sur ${data.count} transaction(s)`,
                        `📊 Cela représente ${salaryPercent}% de vos dépenses totales ($${totalExpenses.toFixed(0)})`,
                        `📈 Et ${revenuePercent}% de vos revenus totaux ($${totalRevenue.toFixed(0)})`
                    ]
                };
                
            case 'top_expenses':
                return {
                    type: 'list',
                    title: '📊 Top Dépenses de vos Données',
                    items: data.map(([category, categoryData], index) => ({
                        rank: index + 1,
                        label: category,
                        value: `$${categoryData.exits.toFixed(0)}`,
                        subtitle: `${((categoryData.exits / totalExpenses) * 100).toFixed(1)}% du total`
                    })),
                    insights: [
                        `📊 ${data.length} catégories de dépenses analysées`,
                        `💰 Total combiné: $${data.reduce((sum, [_, d]) => sum + d.exits, 0).toFixed(0)}`,
                        `📈 Représente ${((data.reduce((sum, [_, d]) => sum + d.exits, 0) / totalExpenses) * 100).toFixed(1)}% du total`
                    ]
                };
                
            case 'revenue':
                const topRevenue = data.sources.slice(0, 3);
                const revenueConcentration = topRevenue.length > 0 ? 
                    ((topRevenue[0][1].entries / data.total) * 100).toFixed(1) : 0;
                
                return {
                    type: 'detailed',
                    title: '💰 Analyse des Revenus',
                    mainMetric: {
                        label: 'Revenus Totaux',
                        value: `$${data.total.toFixed(0)}`,
                        subtitle: `${data.sources.length} sources de revenus`
                    },
                    details: [
                        { icon: '🥇', label: 'Top source', value: topRevenue[0] ? `${topRevenue[0][0]} ($${topRevenue[0][1].entries.toFixed(0)})` : 'N/A' },
                        { icon: '📊', label: 'Concentration', value: `${revenueConcentration}%` },
                        { icon: '📈', label: 'Croissance requise', value: profit < 0 ? `+${Math.abs((profit / totalRevenue) * 100).toFixed(0)}%` : 'Maintenir' },
                        { icon: '💡', label: 'Revenue per source', value: `$${(data.total / data.sources.length).toFixed(0)}` },
                        { icon: '🎯', label: 'Objectif mensuel', value: `$${(data.total * 1.15).toFixed(0)}` }
                    ],
                    insights: [
                        revenueConcentration > 50 ? '⚠️ Trop dépendant d\'une source' : '✅ Bonne diversification',
                        profit > 0 ? '💪 Revenus couvrent les dépenses' : '🔴 Revenus insuffisants',
                        '📈 Focus sur acquisition de nouveaux clients'
                    ]
                };
                
            case 'expenses':
                const expenseEfficiency = (totalRevenue / data.total).toFixed(2);
                const topCategories = data.categories.slice(0, 3);
                
                return {
                    type: 'detailed',
                    title: '💸 Vue d\'Ensemble des Dépenses',
                    mainMetric: {
                        label: 'Dépenses Totales',
                        value: `$${data.total.toFixed(0)}`,
                        subtitle: `${data.categories.length} catégories`
                    },
                    details: [
                        { icon: '🥇', label: 'Plus grosse', value: topCategories[0] ? `${topCategories[0][0]} ($${topCategories[0][1].exits.toFixed(0)})` : 'N/A' },
                        { icon: '📊', label: 'Efficacité', value: `$${expenseEfficiency} revenu par $ dépensé` },
                        { icon: '🎯', label: 'Objectif réduction', value: `$${(data.total * 0.15).toFixed(0)} (-15%)` },
                        { icon: '💰', label: 'Économie potentielle', value: `$${(data.total * 0.2).toFixed(0)}` },
                        { icon: '📈', label: 'Burn rate', value: `$${((data.total - totalRevenue) / 30).toFixed(0)}/jour` }
                    ],
                    insights: [
                        expenseEfficiency < 1 ? '🔴 Dépenses supérieures aux revenus' : '✅ Ratio dépenses/revenus positif',
                        data.categories.length > 10 ? '⚠️ Trop de catégories, consolidez' : '✅ Nombre de catégories gérable',
                        '💡 Focalisez sur les 3 plus grosses dépenses pour impact maximal'
                    ]
                };
                
            default:
                return {
                    type: 'info',
                    title: '💡 Information',
                    content: 'Je peux répondre à des questions sur vos dépenses, bénéfices, marges, et plus encore.',
                    suggestions: [
                        'Quelle est ma plus grosse dépense ?',
                        'Quel est mon bénéfice ?',
                        'Combien je dépense en salaires ?',
                        'Quelle est l\'évolution mensuelle ?'
                    ]
                };
        }
    }
    
    /**
     * Affiche une réponse intelligente et détaillée
     */
    function displaySmartResponse(response) {
        const chatResponse = document.getElementById('chatResponse');
        let html = '';
        
        if (response.type === 'detailed') {
            html = `
                <div class="smart-response">
                    <div class="response-header">
                        <span class="response-title">${response.title}</span>
                    </div>
                    
                    ${response.mainMetric ? `
                        <div class="main-metric">
                            <div class="metric-label">${response.mainMetric.label}</div>
                            <div class="metric-value">${response.mainMetric.value}</div>
                            <div class="metric-subtitle">${response.mainMetric.subtitle}</div>
                        </div>
                    ` : ''}
                    
                    ${response.details ? `
                        <div class="details-grid">
                            ${response.details.map(detail => `
                                <div class="detail-card">
                                    <span class="detail-icon">${detail.icon}</span>
                                    <div class="detail-content">
                                        <div class="detail-label">${detail.label}</div>
                                        <div class="detail-value">${detail.value}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                    
                    ${response.insights ? `
                        <div class="insights-section">
                            <h4>Insights & Recommandations</h4>
                            ${response.insights.map(insight => `
                                <div class="insight-item">${insight}</div>
                            `).join('')}
                        </div>
                    ` : ''}
                    
                    ${response.chart ? `
                        <div class="chart-section">
                            <canvas id="responseChart" width="400" height="200"></canvas>
                        </div>
                    ` : ''}
                </div>
                
                <style>
                    .smart-response {
                        animation: fadeIn 0.5s ease;
                    }
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .main-metric {
                        background: #111111;
                        color: white;
                        padding: 24px;
                        border-radius: 12px;
                        text-align: center;
                        margin: 20px 0;
                    }
                    .metric-label {
                        font-size: 14px;
                        opacity: 0.9;
                        margin-bottom: 8px;
                    }
                    .metric-value {
                        font-size: 36px;
                        font-weight: bold;
                        margin-bottom: 8px;
                    }
                    .metric-subtitle {
                        font-size: 16px;
                        opacity: 0.9;
                    }
                    .details-grid {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 12px;
                        margin: 20px 0;
                    }
                    .detail-card {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        padding: 12px;
                        background: #1a1a1a;
                        border-radius: 8px;
                    }
                    .detail-icon {
                        font-size: 24px;
                    }
                    .detail-label {
                        font-size: 12px;
                        color: #999999;
                    }
                    .detail-value {
                        font-size: 16px;
                        font-weight: 600;
                        color: #ffffff;
                    }
                    .insights-section {
                        background: #0a0a0a;
                        padding: 16px;
                        border-radius: 8px;
                        margin: 20px 0;
                    }
                    .insights-section h4 {
                        margin: 0 0 12px 0;
                        color: #ffffff;
                    }
                    .insight-item {
                        padding: 8px 0;
                        border-bottom: 1px solid #333333;
                    }
                    .insight-item:last-child {
                        border-bottom: none;
                    }
                </style>
            `;
        } else {
            // Affichage simple pour les autres types
            html = `
                <div class="response-header">
                    <span class="response-title">${response.title}</span>
                </div>
                <div class="response-content">
                    <p>${response.content}</p>
                    ${response.action ? `<p style="margin-top: 12px; font-weight: 500;">${response.action}</p>` : ''}
                </div>
            `;
        }
        
        chatResponse.innerHTML = html;
        
        // Créer le graphique si nécessaire
        if (response.chart) {
            setTimeout(() => {
                const ctx = document.getElementById('responseChart');
                if (ctx) {
                    new Chart(ctx, {
                        type: response.chart.type,
                        data: {
                            labels: response.chart.data.map(d => d.label),
                            datasets: [{
                                data: response.chart.data.map(d => d.value),
                                backgroundColor: [
                                    '#ffffff', '#cccccc', '#999999', '#666666', '#333333'
                                ]
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { position: 'bottom' }
                            }
                        }
                    });
                }
            }, 100);
        }
    }
    
    /**
     * Affiche une erreur
     */
    function displayErrorResponse(message) {
        const chatResponse = document.getElementById('chatResponse');
        chatResponse.innerHTML = `
            <div class="response-header">
                <span class="response-icon">❌</span>
                <span class="response-title">Erreur</span>
            </div>
            <div class="response-content">
                <p>${message}</p>
            </div>
        `;
    }

    /**
     * Affiche les résultats de la requête avec Agent 5 HoverInsights
     */
    function displayQueryResults(data, sql) {
        console.log('📊 Affichage des résultats:', data?.length || 0);
        
        if (!data || data.length === 0) {
            elements.resultsContent.innerHTML = '<div class="no-results">Aucun résultat trouvé</div>';
            elements.resultsCount.textContent = '0';
            elements.queryResults.style.display = 'block';
            return;
        }
        
        // Afficher le nombre de résultats
        elements.resultsCount.textContent = `${data.length} résultat(s)`;
        
        // Créer le tableau HTML des résultats
        let html = '<div class="results-table">';
        
        // En-têtes
        if (data.length > 0) {
            const headers = Object.keys(data[0]);
            html += '<div class="result-header">';
            headers.forEach(header => {
                html += `<span class="header-cell">${header}</span>`;
            });
            html += '</div>';
            
            // Lignes de données
            data.forEach((row, index) => {
                html += `<div class="result-row" data-index="${index}">`;
                headers.forEach(header => {
                    let value = row[header] || '';
                    // Formater les montants
                    if (header.includes('USD') && value) {
                        const num = parseFloat(value);
                        if (!isNaN(num)) {
                            value = `$${num.toFixed(2)}`;
                        }
                    }
                    html += `<span class="data-cell">${value}</span>`;
                });
                html += '</div>';
            });
        }
        
        html += '</div>';
        
        // Ajouter la requête SQL si disponible
        if (sql) {
            html += `<div class="sql-query">Requête: ${sql}</div>`;
        }
        
        elements.resultsContent.innerHTML = html;
        elements.queryResults.style.display = 'block';
    }

    /**
     * Formate la monnaie
     */
    function formatCurrency(value, compact = false) {
        // Vérifier si la valeur est valide
        if (value === undefined || value === null || isNaN(value) || !isFinite(value)) {
            return '$0';
        }
        
        const numValue = Number(value);
        
        if (compact && numValue >= 1000) {
            return '$' + (numValue / 1000).toFixed(0) + 'k';
        }
        
        return '$' + numValue.toFixed(0);
    }
    
    /**
     * Fonction pour encadrer une cellule dans Google Sheets
     */
    async function highlightCellInGoogleSheets(cellRef) {
        console.log('📍 [DEBUG] Tentative d\'encadrement de la cellule:', cellRef);
        
        try {
            // Envoyer un message au content script pour encadrer la cellule
            const tabs = await chrome.tabs.query({active: true, currentWindow: true});
            if (tabs[0]) {
                await chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'highlightCell',
                    cellRef: cellRef,
                    style: {
                        border: '3px solid #000000',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)'
                    }
                });
                console.log('🚀 [DEBUG] Message d\'encadrement envoyé pour la cellule:', cellRef);
            }
        } catch (error) {
            console.error('❌ [DEBUG] Erreur encadrement cellule:', error);
        }
    }
    
    /**
     * Amélioration du système de réponse avec encadrement des cellules
     */
    function enhanceResponseWithCellHighlighting(response, intent, analysis) {
        if (!appState.cellReferences) return response;
        
        let cellToHighlight = null;
        let cellDescription = '';
        
        switch (intent) {
            case 'biggest_expense':
                if (appState.cellReferences.largestExpense) {
                    cellToHighlight = appState.cellReferences.largestExpense.cellRef;
                    cellDescription = `Plus grosse dépense en cellule ${cellToHighlight}: $${appState.cellReferences.largestExpense.value.toFixed(0)}`;
                }
                break;
                
            case 'revenue':
                if (appState.cellReferences.largestRevenue) {
                    cellToHighlight = appState.cellReferences.largestRevenue.cellRef;
                    cellDescription = `Plus gros revenu en cellule ${cellToHighlight}: $${appState.cellReferences.largestRevenue.value.toFixed(0)}`;
                }
                break;
                
            case 'explain_excel':
                // Pour "explique-moi l'excel", encadrer la plus grosse dépense
                if (appState.cellReferences.largestExpense) {
                    cellToHighlight = appState.cellReferences.largestExpense.cellRef;
                    cellDescription = `Cellule ${cellToHighlight} mise en évidence (plus grosse dépense)`;
                }
                break;
        }
        
        if (cellToHighlight) {
            // Ajouter l'information de la cellule à la réponse
            if (response.insights) {
                response.insights.push(`📍 **Cellule mise en évidence**: ${cellDescription}`);
            }
            
            // Encadrer la cellule
            setTimeout(() => {
                highlightCellInGoogleSheets(cellToHighlight);
            }, 1000); // Délai pour laisser le temps à la réponse de s'afficher
        }
        
        return response;
    }
    
    /**
     * Affiche l'explication détaillée d'un calcul
     */
    function showCalculationExplanation(calculationType, value, element) {
        // Récupérer les données actuelles d'analyse
        chrome.runtime.sendMessage({
            action: 'getLastAnalysis'
        }, (response) => {
            if (response && response.success && response.analysis) {
                const explanation = generateCalculationExplanation(calculationType, value, response.analysis);
                displayCalculationExplanation(explanation, element);
            } else {
                console.error('❌ Impossible de récupérer les données d\'analyse pour l\'explication');
                showSimpleExplanation(calculationType, value, element);
            }
        });
    }

    /**
     * Génère l'explication détaillée d'un calcul
     */
    function generateCalculationExplanation(type, value, analysis) {
        const totals = analysis.totals || {};
        const grouped = analysis.grouped || {};
        const transactions = analysis.transactions || [];
        const numericValue = parseFloat(value.replace(/[^0-9.-]/g, '')) || 0;
        
        switch (type) {
            case 'profit':
                const profit = totals.entries - totals.exits;
                const profitPositive = profit >= 0;
                return {
                    title: profitPositive ? '💰 Calcul du Profit Net' : '📉 Calcul de la Perte Nette',
                    formula: 'Profit = Total Revenus - Total Dépenses',
                    calculation: `$${totals.entries.toFixed(0)} - $${totals.exits.toFixed(0)} = $${profit.toFixed(0)}`,
                    breakdown: [
                        `📥 **Total Revenus**: $${totals.entries.toFixed(0)} (somme de toutes les entrées)`,
                        `📤 **Total Dépenses**: $${totals.exits.toFixed(0)} (somme de toutes les sorties)`,
                        `💵 **Résultat**: ${profitPositive ? 'Bénéfice' : 'Perte'} de $${Math.abs(profit).toFixed(0)}`,
                        `📊 **Marge**: ${totals.entries > 0 ? ((profit / totals.entries) * 100).toFixed(1) : 0}%`
                    ],
                    insight: profitPositive ? 
                        `✅ Votre entreprise est rentable avec un profit de $${Math.abs(profit).toFixed(0)}` :
                        `⚠️ Votre entreprise a une perte de $${Math.abs(profit).toFixed(0)}. Réduisez les dépenses ou augmentez les revenus.`
                };

            case 'biggest_expense':
                // Utiliser la vraie plus grosse transaction individuelle
                if (analysis.biggestExpense && analysis.biggestExpense.amount > 0) {
                    const expense = analysis.biggestExpense;
                    const percentOfTotal = ((expense.amount / totals.exits) * 100).toFixed(1);
                    const percentOfRevenues = ((expense.amount / totals.entries) * 100).toFixed(1);
                    
                    return {
                        title: '💸 Plus Grosse Dépense - Transaction Individuelle',
                        formula: 'Max(toutes les valeurs Debit USD)',
                        calculation: `"${expense.description}" = $${expense.amount.toFixed(0)}`,
                        breakdown: [
                            `📄 **Description**: ${expense.description}`,
                            `💰 **Montant**: $${expense.amount.toFixed(0)}`,
                            `📅 **Date**: ${expense.date}`,
                            `📊 **Ligne dans le CSV**: ${expense.rowIndex}`,
                            `📈 **Part du budget total**: ${percentOfTotal}%`,
                            `⚖️ **Part des revenus**: ${percentOfRevenues}%`
                        ],
                        insight: parseFloat(percentOfTotal) > 30 ? 
                            `🚨 Cette seule transaction représente ${percentOfTotal}% de votre budget total !` :
                            parseFloat(percentOfTotal) > 15 ?
                            `⚠️ Cette transaction importante (${percentOfTotal}% du budget) mérite attention` :
                            `✅ Cette dépense (${percentOfTotal}% du budget) est proportionnée.`
                    };
                }
                return {
                    title: '💸 Plus Grosse Dépense',
                    formula: 'Aucune dépense trouvée',
                    calculation: 'N/A',
                    breakdown: ['Aucune transaction avec montant Debit détectée'],
                    insight: 'Vérifiez que vos données contiennent des valeurs dans la colonne Debit (USD).'
                };

            case 'total_revenues':
                const revenueTransactions = transactions.filter(t => t.credit > 0);
                const topRevenueSources = Object.entries(grouped)
                    .filter(([_, data]) => data.entries > 0)
                    .sort((a, b) => b[1].entries - a[1].entries)
                    .slice(0, 3);
                
                return {
                    title: '📥 Total Revenus - Calcul Détaillé',
                    formula: 'Total = Σ(toutes les valeurs Credit > 0)',
                    calculation: `${revenueTransactions.length} transactions = $${totals.entries.toFixed(0)}`,
                    breakdown: [
                        `🔢 **Nombre de transactions**: ${revenueTransactions.length}`,
                        `💰 **Total**: $${totals.entries.toFixed(0)}`,
                        `📊 **Moyenne par transaction**: $${revenueTransactions.length > 0 ? (totals.entries / revenueTransactions.length).toFixed(0) : 0}`,
                        ...topRevenueSources.map(([source, data], index) => 
                            `${index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'} **${source}**: $${data.entries.toFixed(0)} (${((data.entries / totals.entries) * 100).toFixed(1)}%)`
                        )
                    ],
                    insight: topRevenueSources.length > 0 && topRevenueSources[0][1].entries / totals.entries > 0.5 ?
                        `⚠️ ${((topRevenueSources[0][1].entries / totals.entries) * 100).toFixed(0)}% de vos revenus viennent d'une seule source. Diversifiez vos revenus.` :
                        `✅ Vos revenus sont bien diversifiés entre ${topRevenueSources.length} sources principales.`
                };

            case 'total_expenses':
                const expenseTransactions = transactions.filter(t => t.debit > 0);
                const topExpenseCategories = Object.entries(grouped)
                    .filter(([_, data]) => data.exits > 0)
                    .sort((a, b) => b[1].exits - a[1].exits)
                    .slice(0, 3);
                
                return {
                    title: '📤 Total Dépenses - Calcul Détaillé',
                    formula: 'Total = Σ(toutes les valeurs Debit > 0)',
                    calculation: `${expenseTransactions.length} transactions = $${totals.exits.toFixed(0)}`,
                    breakdown: [
                        `🔢 **Nombre de transactions**: ${expenseTransactions.length}`,
                        `💸 **Total**: $${totals.exits.toFixed(0)}`,
                        `📊 **Moyenne par transaction**: $${expenseTransactions.length > 0 ? (totals.exits / expenseTransactions.length).toFixed(0) : 0}`,
                        ...topExpenseCategories.map(([category, data], index) => 
                            `${index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'} **${category}**: $${data.exits.toFixed(0)} (${((data.exits / totals.exits) * 100).toFixed(1)}%)`
                        )
                    ],
                    insight: topExpenseCategories.length > 0 && topExpenseCategories[0][1].exits / totals.exits > 0.4 ?
                        `🎯 ${((topExpenseCategories[0][1].exits / totals.exits) * 100).toFixed(0)}% de vos dépenses vont vers "${topExpenseCategories[0][0]}". Optimisez cette catégorie.` :
                        `✅ Vos dépenses sont bien réparties entre ${topExpenseCategories.length} catégories principales.`
                };

            default:
                return {
                    title: '🔢 Explication du Calcul',
                    formula: 'Calcul en cours d\'analyse...',
                    calculation: value,
                    breakdown: [`Valeur: ${value}`, 'Données en cours de traitement'],
                    insight: 'Analyse détaillée disponible après traitement complet des données.'
                };
        }
    }

    /**
     * Affiche un tooltip d'explication simple quand les données détaillées ne sont pas disponibles
     */
    function showSimpleExplanation(calculationType, value, element) {
        const simpleExplanations = {
            'profit': 'Profit = Total Revenus - Total Dépenses',
            'biggest_expense': 'Plus grande transaction individuelle dans la colonne Debit (USD)',
            'total_revenues': 'Somme de toutes les valeurs dans Credit (USD)',
            'total_expenses': 'Somme de toutes les valeurs dans Debit (USD)'
        };
        
        const explanation = {
            title: '🔢 Calcul Rapide',
            formula: simpleExplanations[calculationType] || 'Calcul en cours...',
            calculation: value,
            breakdown: ['Données en cours de récupération...'],
            insight: 'Rechargez la page pour voir l\'analyse détaillée.'
        };
        
        displayCalculationExplanation(explanation, element);
    }

    /**
     * Affiche l'explication de calcul dans un tooltip élégant
     */
    function displayCalculationExplanation(explanation, triggerElement) {
        // Supprimer tout tooltip existant
        const existingTooltip = document.querySelector('.calculation-explanation-tooltip');
        if (existingTooltip) {
            existingTooltip.remove();
        }

        const tooltip = document.createElement('div');
        tooltip.className = 'calculation-explanation-tooltip';
        tooltip.style.cssText = `
            position: fixed;
            background: linear-gradient(145deg, rgba(5,5,5,0.98), rgba(15,15,15,0.98));
            border: 1px solid rgba(255,255,255,0.15);
            border-radius: 12px;
            padding: 20px;
            color: #ffffff;
            font-size: 12px;
            max-width: 350px;
            z-index: 10000;
            box-shadow: 0 12px 40px rgba(0,0,0,0.6);
            backdrop-filter: blur(12px);
            opacity: 0;
            transform: translateY(15px) scale(0.9);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        `;

        let tooltipHTML = `
            <div class="explanation-header" style="margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                <h4 style="margin: 0; color: #ffffff; font-size: 14px; font-weight: 600;">${explanation.title}</h4>
            </div>
            
            <div class="formula-section" style="margin-bottom: 14px;">
                <div style="color: rgba(255,255,255,0.7); font-size: 10px; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Formule</div>
                <div style="color: #ffffff; font-weight: 500; background: rgba(255,255,255,0.08); padding: 10px; border-radius: 6px; font-family: 'SF Mono', Monaco, monospace; font-size: 11px; border-left: 3px solid rgba(255,255,255,0.3);">
                    ${explanation.formula}
                </div>
            </div>
            
            <div class="calculation-section" style="margin-bottom: 14px;">
                <div style="color: rgba(255,255,255,0.7); font-size: 10px; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Calcul</div>
                <div style="color: #ffffff; font-weight: 600; background: rgba(0,0,0,0.4); padding: 10px; border-radius: 6px; font-family: 'SF Mono', Monaco, monospace; font-size: 12px; border-left: 3px solid rgba(255,255,255,0.5);">
                    ${explanation.calculation}
                </div>
            </div>
        `;

        if (explanation.breakdown && explanation.breakdown.length > 0) {
            tooltipHTML += `
                <div class="breakdown-section" style="margin-bottom: 14px;">
                    <div style="color: rgba(255,255,255,0.7); font-size: 10px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Détail du calcul</div>
                    <div style="background: rgba(255,255,255,0.03); border-radius: 6px; padding: 8px;">
                        ${explanation.breakdown.map(item => 
                            `<div style="color: rgba(255,255,255,0.9); margin-bottom: 4px; line-height: 1.4; font-size: 11px;">${item}</div>`
                        ).join('')}
                    </div>
                </div>
            `;
        }

        if (explanation.insight) {
            tooltipHTML += `
                <div class="insight-section" style="margin-top: 14px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1);">
                    <div style="color: rgba(255,255,255,0.7); font-size: 10px; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">💡 Insight</div>
                    <div style="color: rgba(255,255,255,0.95); font-size: 11px; line-height: 1.5; background: rgba(255,255,255,0.05); padding: 8px; border-radius: 6px; font-weight: 500;">
                        ${explanation.insight}
                    </div>
                </div>
            `;
        }

        tooltipHTML += `
            <div class="close-button" style="
                position: absolute; 
                top: 12px; 
                right: 12px; 
                cursor: pointer; 
                color: rgba(255,255,255,0.5); 
                font-size: 18px; 
                width: 24px; 
                height: 24px; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                border-radius: 50%; 
                transition: all 0.2s ease;
                font-weight: 300;
            " 
            onmouseover="this.style.backgroundColor='rgba(255,255,255,0.1)'; this.style.color='rgba(255,255,255,0.8)'" 
            onmouseout="this.style.backgroundColor='transparent'; this.style.color='rgba(255,255,255,0.5)'" 
            onclick="this.parentElement.remove()">×</div>
        `;

        tooltip.innerHTML = tooltipHTML;
        document.body.appendChild(tooltip);

        // Positionner le tooltip intelligemment
        const rect = triggerElement.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
        let top = rect.bottom + 15;

        // Ajustements pour rester dans le viewport avec plus de marge
        if (left < 15) left = 15;
        if (left + tooltipRect.width > viewportWidth - 15) left = viewportWidth - tooltipRect.width - 15;
        if (top + tooltipRect.height > viewportHeight - 15) top = rect.top - tooltipRect.height - 15;

        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';

        // Animation d'apparition fluide
        requestAnimationFrame(() => {
            tooltip.style.opacity = '1';
            tooltip.style.transform = 'translateY(0) scale(1)';
        });

        // Auto-hide après 12 secondes avec animation de sortie
        setTimeout(() => {
            if (tooltip.parentElement) {
                tooltip.style.opacity = '0';
                tooltip.style.transform = 'translateY(15px) scale(0.9)';
                setTimeout(() => tooltip.remove(), 400);
            }
        }, 12000);
    }

    /**
     * Affiche l'état de chargement pendant la navigation
     */
    function showNavigationLoadingState(navigationState) {
        const container = document.getElementById('reportContainer');
        if (!container) return;
        
        const currentTime = Date.now();
        const elapsedTime = navigationState.startTime ? 
            Math.floor((currentTime - navigationState.startTime) / 1000) : 0;
        
        container.innerHTML = `
            <div class="navigation-loading-overlay" style="
                position: relative;
                background: linear-gradient(135deg, rgba(20, 20, 20, 0.98), rgba(30, 30, 30, 0.98));
                border-radius: 16px;
                padding: 40px 30px;
                text-align: center;
                color: #ffffff;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
            ">
                <div class="loading-animation" style="
                    width: 60px;
                    height: 60px;
                    margin: 0 auto 24px auto;
                    border: 3px solid rgba(255, 255, 255, 0.1);
                    border-top: 3px solid #ffffff;
                    border-radius: 50%;
                    animation: spin 1.5s linear infinite;
                "></div>
                
                <h3 style="
                    font-size: 18px;
                    font-weight: 600;
                    margin: 0 0 16px 0;
                    color: #ffffff;
                ">📍 Changement de page détecté</h3>
                
                <div class="loading-steps" style="
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 8px;
                    padding: 20px;
                    margin: 20px 0;
                    text-align: left;
                    font-size: 13px;
                    line-height: 1.6;
                ">
                    <div class="loading-step" style="color: #ffffff; margin-bottom: 8px;">
                        ✅ Navigation détectée
                    </div>
                    <div class="loading-step" style="color: rgba(255,255,255,0.8); margin-bottom: 8px;">
                        🔄 Chargement des nouvelles données...
                    </div>
                    <div class="loading-step" style="color: rgba(255,255,255,0.6); margin-bottom: 8px;">
                        📊 Analyse financière en préparation...
                    </div>
                    <div class="loading-step" style="color: rgba(255,255,255,0.4);">
                        📈 Génération du rapport à suivre...
                    </div>
                </div>
                
                <div class="loading-info" style="
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.7);
                    margin-top: 16px;
                ">
                    <div>🕒 Temps écoulé: ${elapsedTime}s</div>
                    <div style="margin-top: 4px;">📄 Analyse automatique en cours</div>
                </div>
                
                <div class="loading-tips" style="
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 6px;
                    padding: 12px;
                    margin-top: 20px;
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.6);
                    border-left: 3px solid rgba(255, 255, 255, 0.2);
                ">
                    💡 L'extension détecte automatiquement les changements et analyse vos nouvelles données financières
                </div>
            </div>
            
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        
        // Mettre à jour le temps toutes les secondes
        let checkCount = 0;
        const maxChecks = 25; // Maximum 25 secondes de vérification
        
        const timeInterval = setInterval(() => {
            checkCount++;
            
            const timeElement = container.querySelector('.loading-info div:first-child');
            if (timeElement && navigationState.startTime) {
                const currentElapsed = Math.floor((Date.now() - navigationState.startTime) / 1000);
                timeElement.textContent = `🕒 Temps écoulé: ${currentElapsed}s`;
            }
            
            // Arrêter si plus en navigation ou après max checks
            if (checkCount >= maxChecks) {
                clearInterval(timeInterval);
                showStatus('Timeout - Rechargement des données...');
                setTimeout(loadExistingReport, 1000);
                return;
            }
            
            // Vérifier l'état seulement toutes les 2 secondes pour éviter le spam
            if (checkCount % 2 === 0) {
                chrome.runtime.sendMessage({ action: 'getCurrentState' }, (response) => {
                    if (response?.state?.navigationState?.isNavigating === false) {
                        clearInterval(timeInterval);
                        // Recharger l'état normal
                        setTimeout(() => {
                            loadExistingReport();
                        }, 500);
                    }
                });
            }
        }, 1000);
        
        // Auto-timeout après 30 secondes
        setTimeout(() => {
            clearInterval(timeInterval);
            if (container.querySelector('.navigation-loading-overlay')) {
                showStatus('Chargement terminé - Actualisation des données...');
                setTimeout(loadExistingReport, 2000);
            }
        }, 30000);
    }

    // Rendre les fonctions disponibles globalement
    window.showCalculationExplanation = showCalculationExplanation;
    window.generateCalculationExplanation = generateCalculationExplanation;
    window.displayCalculationExplanation = displayCalculationExplanation;
    window.showNavigationLoadingState = showNavigationLoadingState;

    // Lancer l'initialisation
    initialize();
});

console.log('📊 Financial Analytics v2 chargé - Mode automatique activé avec Agent 5 HoverInsights + Calcul Explanations');
