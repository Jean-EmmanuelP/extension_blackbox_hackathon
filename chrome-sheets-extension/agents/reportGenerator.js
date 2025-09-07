/**
 * Report Generator Agent (Agent 3)
 * Handles data formatting, chart generation, CSV export, and HTML report creation
 * Integrates with Chart.js for interactive visualizations
 */

class ReportGenerator {
    constructor() {
        this.chartInstance = null;
        this.chartColors = {
            primary: '#4285f4',
            secondary: '#34a853',
            warning: '#fbbc04',
            danger: '#ea4335',
            info: '#00acc1',
            success: '#0f9d58',
            purple: '#9c27b0',
            orange: '#ff9800'
        };
        
        this.metricsConfig = {
            cashAtBank: { label: 'Cash at Bank', format: 'currency', suffix: '' },
            cac: { label: 'CAC', format: 'currency', suffix: '' },
            ltvCac: { label: 'LTV:CAC', format: 'ratio', suffix: 'x' },
            burnRate: { label: 'Burn Rate', format: 'currency', suffix: '/month' },
            runway: { label: 'Runway', format: 'number', suffix: ' months' },
            grossMargin: { label: 'Gross Margin', format: 'percentage', suffix: '%' }
        };

        console.log('🎯 Report Generator Agent initialized with Chart.js integration');
    }

    /**
     * Format data for interactive donut charts
     * @param {Array} data - Raw data from Agent 2
     * @param {Object} config - Chart configuration
     * @returns {Object} Chart.js formatted data
     */
    formatChartData(data, config = {}) {
        console.log('📊 Formatting chart data for visualization');
        console.log('📥 Input data:', JSON.stringify(data, null, 2));
        console.log('⚙️ Chart config:', config);

        const chartType = config.type || 'doughnut';
        let formattedData = null;

        try {
            switch (chartType) {
                case 'doughnut':
                case 'pie':
                    formattedData = this._formatDonutData(data, config);
                    break;
                case 'bar':
                case 'horizontalBar':
                    formattedData = this._formatBarData(data, config);
                    break;
                case 'line':
                    formattedData = this._formatLineData(data, config);
                    break;
                case 'radar':
                    formattedData = this._formatRadarData(data, config);
                    break;
                default:
                    console.warn('⚠️ Unknown chart type, defaulting to doughnut');
                    formattedData = this._formatDonutData(data, config);
            }

            console.log('✅ Chart data formatted successfully');
            console.log('📤 Output data:', formattedData);
            return formattedData;

        } catch (error) {
            console.error('❌ Error formatting chart data:', error);
            return this._getErrorChartData();
        }
    }

    /**
     * Format data for donut/pie charts (revenue split, market share, etc.)
     */
    _formatDonutData(data, config) {
        console.log('🍩 Formatting donut chart data');
        
        const labels = [];
        const values = [];
        const colors = [];
        
        // Handle different data structures
        if (Array.isArray(data)) {
            data.forEach((item, index) => {
                const label = item[config.labelField || 'label'] || `Item ${index + 1}`;
                const value = parseFloat(item[config.valueField || 'value']) || 0;
                
                labels.push(label);
                values.push(value);
                colors.push(this._getColorByIndex(index));
            });
        } else if (typeof data === 'object') {
            Object.entries(data).forEach(([key, value], index) => {
                labels.push(key);
                values.push(parseFloat(value) || 0);
                colors.push(this._getColorByIndex(index));
            });
        }

        return {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#ffffff',
                    hoverBorderWidth: 3,
                    hoverBackgroundColor: colors.map(color => this._lightenColor(color, 0.1))
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value.toLocaleString()} (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    duration: 1000
                }
            }
        };
    }

    /**
     * Format data for bar charts (comparisons, trends)
     */
    _formatBarData(data, config) {
        console.log('📊 Formatting bar chart data');
        
        const labels = [];
        const datasets = [];
        
        if (Array.isArray(data)) {
            // Multi-series data
            if (config.multiSeries) {
                const series = {};
                data.forEach(item => {
                    const category = item[config.categoryField || 'category'];
                    const series_name = item[config.seriesField || 'series'];
                    const value = parseFloat(item[config.valueField || 'value']) || 0;
                    
                    if (!series[series_name]) {
                        series[series_name] = { data: [], backgroundColor: this._getColorByIndex(Object.keys(series).length) };
                    }
                    
                    if (!labels.includes(category)) {
                        labels.push(category);
                    }
                    
                    series[series_name].data[labels.indexOf(category)] = value;
                });
                
                Object.entries(series).forEach(([name, seriesData]) => {
                    datasets.push({
                        label: name,
                        data: seriesData.data,
                        backgroundColor: seriesData.backgroundColor,
                        borderColor: seriesData.backgroundColor,
                        borderWidth: 1
                    });
                });
            } else {
                // Single series
                data.forEach((item, index) => {
                    labels.push(item[config.labelField || 'label'] || `Item ${index + 1}`);
                });
                
                datasets.push({
                    label: config.datasetLabel || 'Values',
                    data: data.map(item => parseFloat(item[config.valueField || 'value']) || 0),
                    backgroundColor: this.chartColors.primary,
                    borderColor: this.chartColors.primary,
                    borderWidth: 1
                });
            }
        }

        return {
            type: config.horizontal ? 'horizontalBar' : 'bar',
            data: { labels, datasets },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: datasets.length > 1
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        };
    }

    /**
     * Format data for line charts (time series, trends)
     */
    _formatLineData(data, config) {
        console.log('📈 Formatting line chart data');
        
        const labels = [];
        const datasets = [];
        
        if (Array.isArray(data)) {
            // Time series data
            const sortedData = data.sort((a, b) => {
                const dateA = new Date(a[config.dateField || 'date']);
                const dateB = new Date(b[config.dateField || 'date']);
                return dateA - dateB;
            });
            
            sortedData.forEach(item => {
                const date = new Date(item[config.dateField || 'date']);
                const label = config.dateFormat === 'month' ? 
                    date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) :
                    date.toLocaleDateString();
                labels.push(label);
            });
            
            if (config.multiSeries) {
                const series = {};
                sortedData.forEach(item => {
                    Object.entries(item).forEach(([key, value]) => {
                        if (key !== (config.dateField || 'date') && typeof value === 'number') {
                            if (!series[key]) {
                                series[key] = {
                                    data: [],
                                    borderColor: this._getColorByIndex(Object.keys(series).length),
                                    backgroundColor: this._getColorByIndex(Object.keys(series).length, 0.1)
                                };
                            }
                            series[key].data.push(value);
                        }
                    });
                });
                
                Object.entries(series).forEach(([name, seriesData]) => {
                    datasets.push({
                        label: name,
                        data: seriesData.data,
                        borderColor: seriesData.borderColor,
                        backgroundColor: seriesData.backgroundColor,
                        tension: 0.4,
                        fill: false
                    });
                });
            } else {
                datasets.push({
                    label: config.datasetLabel || 'Value',
                    data: sortedData.map(item => parseFloat(item[config.valueField || 'value']) || 0),
                    borderColor: this.chartColors.primary,
                    backgroundColor: this._getColorWithAlpha(this.chartColors.primary, 0.1),
                    tension: 0.4,
                    fill: true
                });
            }
        }

        return {
            type: 'line',
            data: { labels, datasets },
            options: {
                responsive: true,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        display: datasets.length > 1
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: config.xAxisLabel || 'Time'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: config.yAxisLabel || 'Value'
                        }
                    }
                }
            }
        };
    }

    /**
     * Format data for radar charts (multi-dimensional comparisons)
     */
    _formatRadarData(data, config) {
        console.log('🎯 Formatting radar chart data');
        
        const labels = config.dimensions || [];
        const datasets = [];
        
        if (Array.isArray(data)) {
            data.forEach((item, index) => {
                const dataPoints = labels.map(label => parseFloat(item[label]) || 0);
                datasets.push({
                    label: item[config.labelField || 'label'] || `Dataset ${index + 1}`,
                    data: dataPoints,
                    borderColor: this._getColorByIndex(index),
                    backgroundColor: this._getColorWithAlpha(this._getColorByIndex(index), 0.2),
                    pointBackgroundColor: this._getColorByIndex(index),
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: this._getColorByIndex(index)
                });
            });
        }

        return {
            type: 'radar',
            data: { labels, datasets },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: config.maxValue || 100
                    }
                }
            }
        };
    }

    /**
     * Generate metric cards data (Cash at bank, CAC, LTV:CAC, etc.)
     * @param {Array} data - Raw financial data
     * @param {Object} previousData - Previous period data for comparison
     * @returns {Object} Formatted metrics with MoM changes
     */
    generateMetrics(data, previousData = null) {
        console.log('📋 Generating business metrics');
        console.log('📊 Current period data:', data);
        console.log('📈 Previous period data:', previousData);

        const metrics = {};

        try {
            // Calculate current metrics
            const current = this._calculateMetrics(data);
            console.log('💰 Current metrics calculated:', current);

            // Calculate previous metrics if available
            const previous = previousData ? this._calculateMetrics(previousData) : null;
            console.log('📊 Previous metrics:', previous);

            // Format metrics with MoM changes
            Object.entries(this.metricsConfig).forEach(([key, config]) => {
                const currentValue = current[key];
                const previousValue = previous ? previous[key] : null;
                
                metrics[key] = {
                    label: config.label,
                    value: currentValue,
                    formattedValue: this._formatValue(currentValue, config.format, config.suffix),
                    change: previousValue ? this._calculateChange(currentValue, previousValue) : null,
                    changeFormatted: previousValue ? this._formatChange(currentValue, previousValue) : null,
                    trend: previousValue ? (currentValue > previousValue ? 'up' : currentValue < previousValue ? 'down' : 'stable') : 'neutral'
                };

                console.log(`📊 ${config.label}: ${metrics[key].formattedValue} (${metrics[key].changeFormatted || 'N/A'})`);
            });

            console.log('✅ Metrics generated successfully');
            return metrics;

        } catch (error) {
            console.error('❌ Error generating metrics:', error);
            return this._getErrorMetrics();
        }
    }

    /**
     * Calculate raw metrics from data
     */
    _calculateMetrics(data) {
        console.log('🧮 Calculating raw metrics from data');
        
        if (!Array.isArray(data) || data.length === 0) {
            console.warn('⚠️ No data available for metrics calculation');
            return {};
        }

        // Aggregate data for calculations
        const totals = data.reduce((acc, row) => {
            Object.entries(row).forEach(([key, value]) => {
                const numValue = parseFloat(value);
                if (!isNaN(numValue)) {
                    acc[key] = (acc[key] || 0) + numValue;
                }
            });
            return acc;
        }, {});

        console.log('📊 Aggregated totals:', totals);

        return {
            cashAtBank: totals.cash || totals.cash_at_bank || totals.bank_balance || 0,
            cac: totals.cac || totals.customer_acquisition_cost || this._calculateCAC(totals),
            ltvCac: this._calculateLTVCAC(totals),
            burnRate: totals.burn_rate || totals.monthly_burn || this._calculateBurnRate(totals),
            runway: this._calculateRunway(totals),
            grossMargin: this._calculateGrossMargin(totals)
        };
    }

    /**
     * Calculate Customer Acquisition Cost
     */
    _calculateCAC(totals) {
        const marketingSpend = totals.marketing_spend || totals.advertising_cost || 0;
        const newCustomers = totals.new_customers || totals.customer_count || 1;
        return newCustomers > 0 ? marketingSpend / newCustomers : 0;
    }

    /**
     * Calculate LTV:CAC Ratio
     */
    _calculateLTVCAC(totals) {
        const ltv = totals.ltv || totals.lifetime_value || totals.customer_lifetime_value || 0;
        const cac = totals.cac || this._calculateCAC(totals);
        return cac > 0 ? ltv / cac : 0;
    }

    /**
     * Calculate monthly burn rate
     */
    _calculateBurnRate(totals) {
        const expenses = totals.expenses || totals.monthly_expenses || 0;
        const revenue = totals.revenue || totals.monthly_revenue || 0;
        return expenses - revenue;
    }

    /**
     * Calculate runway in months
     */
    _calculateRunway(totals) {
        const cash = totals.cash || totals.cash_at_bank || 0;
        const burnRate = totals.burn_rate || this._calculateBurnRate(totals);
        return burnRate > 0 ? cash / burnRate : Infinity;
    }

    /**
     * Calculate gross margin percentage
     */
    _calculateGrossMargin(totals) {
        const revenue = totals.revenue || totals.total_revenue || 0;
        const cogs = totals.cogs || totals.cost_of_goods_sold || 0;
        return revenue > 0 ? ((revenue - cogs) / revenue) * 100 : 0;
    }

    /**
     * Export data to CSV format
     * @param {Array} data - Data to export
     * @param {Object} options - Export options
     * @returns {string} CSV string
     */
    exportToCSV(data, options = {}) {
        console.log('📁 Exporting data to CSV format');
        console.log('📊 Data to export:', data);
        console.log('⚙️ Export options:', options);

        try {
            if (!Array.isArray(data) || data.length === 0) {
                console.warn('⚠️ No data to export');
                return '';
            }

            // Get all unique columns
            const columns = this._getAllColumns(data);
            console.log('📋 CSV columns:', columns);

            // Create header row
            const headers = options.customHeaders || columns;
            let csvContent = headers.map(header => this._escapeCSVField(header)).join(',') + '\n';

            // Add data rows
            data.forEach((row, index) => {
                const csvRow = headers.map(header => {
                    const value = row[header];
                    return this._escapeCSVField(this._formatCSVValue(value, options));
                }).join(',');
                
                csvContent += csvRow + '\n';
                console.log(`📄 CSV row ${index + 1}: ${csvRow.substring(0, 100)}...`);
            });

            // Add metadata if requested
            if (options.includeMetadata) {
                csvContent += '\n\n// Metadata\n';
                csvContent += `// Generated: ${new Date().toISOString()}\n`;
                csvContent += `// Total rows: ${data.length}\n`;
                csvContent += `// Total columns: ${headers.length}\n`;
            }

            console.log('✅ CSV export completed successfully');
            console.log(`📊 CSV size: ${csvContent.length} characters`);
            
            return csvContent;

        } catch (error) {
            console.error('❌ Error exporting to CSV:', error);
            return `Error,Message\n"Export failed","${error.message}"`;
        }
    }

    /**
     * Create HTML report structure
     * @param {Object} reportData - Complete report data
     * @param {Object} options - HTML options
     * @returns {string} HTML string
     */
    createHTMLReport(reportData, options = {}) {
        console.log('🌐 Creating HTML report structure');
        console.log('📊 Report data:', reportData);
        console.log('⚙️ HTML options:', options);

        try {
            const title = options.title || 'Business Intelligence Report';
            const theme = options.theme || 'light';
            
            let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        ${this._getReportCSS(theme)}
    </style>
</head>
<body class="${theme}-theme">
    <div class="report-container">
        <header class="report-header">
            <h1>${title}</h1>
            <p class="report-date">Generated on ${new Date().toLocaleString()}</p>
        </header>

        <main class="report-content">`;

            // Add metrics section
            if (reportData.metrics) {
                html += this._generateMetricsHTML(reportData.metrics);
            }

            // Add charts section
            if (reportData.charts) {
                html += this._generateChartsHTML(reportData.charts);
            }

            // Add data table section
            if (reportData.data) {
                html += this._generateTableHTML(reportData.data, options);
            }

            html += `
        </main>

        <footer class="report-footer">
            <p>Report generated by Chrome Extension Business Intelligence Tool</p>
        </footer>
    </div>

    <script>
        ${this._getReportJS(reportData)}
    </script>
</body>
</html>`;

            console.log('✅ HTML report created successfully');
            console.log(`📊 HTML size: ${html.length} characters`);
            
            return html;

        } catch (error) {
            console.error('❌ Error creating HTML report:', error);
            return this._getErrorHTML(error.message);
        }
    }

    // Helper methods for color management
    _getColorByIndex(index) {
        const colors = Object.values(this.chartColors);
        return colors[index % colors.length];
    }

    _lightenColor(color, amount) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * amount);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    _getColorWithAlpha(color, alpha) {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    // Helper methods for value formatting
    _formatValue(value, format, suffix) {
        if (value === null || value === undefined || isNaN(value)) {
            return 'N/A';
        }

        let formatted = '';
        switch (format) {
            case 'currency':
                formatted = new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                }).format(value);
                break;
            case 'percentage':
                formatted = `${value.toFixed(1)}%`;
                break;
            case 'ratio':
                formatted = value.toFixed(2);
                break;
            case 'number':
                formatted = value.toLocaleString();
                break;
            default:
                formatted = value.toString();
        }

        return formatted + suffix;
    }

    _calculateChange(current, previous) {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / Math.abs(previous)) * 100;
    }

    _formatChange(current, previous) {
        const change = this._calculateChange(current, previous);
        const sign = change > 0 ? '+' : '';
        return `${sign}${change.toFixed(1)}%`;
    }

    // CSV helper methods
    _getAllColumns(data) {
        const columnSet = new Set();
        data.forEach(row => {
            Object.keys(row).forEach(key => columnSet.add(key));
        });
        return Array.from(columnSet).sort();
    }

    _escapeCSVField(field) {
        const str = String(field || '');
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    }

    _formatCSVValue(value, options) {
        if (value === null || value === undefined) {
            return '';
        }

        if (typeof value === 'number') {
            return options.numberFormat === 'fixed' ? value.toFixed(2) : value.toString();
        }

        if (value instanceof Date) {
            return options.dateFormat === 'iso' ? value.toISOString() : value.toLocaleDateString();
        }

        return String(value);
    }

    // HTML generation helper methods
    _generateMetricsHTML(metrics) {
        let html = '<section class="metrics-section"><h2>Key Metrics</h2><div class="metrics-grid">';
        
        Object.entries(metrics).forEach(([key, metric]) => {
            const trendClass = metric.trend === 'up' ? 'trend-up' : 
                              metric.trend === 'down' ? 'trend-down' : 'trend-neutral';
            
            html += `
                <div class="metric-card ${trendClass}">
                    <h3>${metric.label}</h3>
                    <div class="metric-value">${metric.formattedValue}</div>
                    ${metric.changeFormatted ? `<div class="metric-change">${metric.changeFormatted}</div>` : ''}
                </div>`;
        });
        
        html += '</div></section>';
        return html;
    }

    _generateChartsHTML(charts) {
        let html = '<section class="charts-section"><h2>Charts & Visualizations</h2>';
        
        charts.forEach((chart, index) => {
            html += `
                <div class="chart-container">
                    <h3>${chart.title || `Chart ${index + 1}`}</h3>
                    <canvas id="chart-${index}" width="400" height="200"></canvas>
                </div>`;
        });
        
        html += '</section>';
        return html;
    }

    _generateTableHTML(data, options) {
        if (!Array.isArray(data) || data.length === 0) return '';
        
        const columns = this._getAllColumns(data);
        const maxRows = options.maxTableRows || 100;
        
        let html = `<section class="table-section">
            <h2>Data Table</h2>
            <div class="table-container">
                <table class="data-table">
                    <thead><tr>`;
        
        columns.forEach(col => {
            html += `<th>${col}</th>`;
        });
        
        html += '</tr></thead><tbody>';
        
        data.slice(0, maxRows).forEach(row => {
            html += '<tr>';
            columns.forEach(col => {
                html += `<td>${this._escapeHTML(row[col] || '')}</td>`;
            });
            html += '</tr>';
        });
        
        html += '</tbody></table></div>';
        
        if (data.length > maxRows) {
            html += `<p class="table-note">Showing first ${maxRows} of ${data.length} rows</p>`;
        }
        
        html += '</section>';
        return html;
    }

    _escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    _getReportCSS(theme) {
        return `
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            .light-theme { background: #f8f9fa; color: #333; }
            .dark-theme { background: #1a1a1a; color: #fff; }
            .report-container { max-width: 1200px; margin: 0 auto; padding: 20px; }
            .report-header { text-align: center; margin-bottom: 30px; }
            .report-header h1 { font-size: 2.5em; margin-bottom: 10px; }
            .report-date { color: #666; }
            .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
            .metric-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .metric-value { font-size: 2em; font-weight: bold; margin: 10px 0; }
            .trend-up .metric-value { color: #0f9d58; }
            .trend-down .metric-value { color: #ea4335; }
            .trend-neutral .metric-value { color: #5f6368; }
            .chart-container { margin: 30px 0; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .table-container { overflow-x: auto; }
            .data-table { width: 100%; border-collapse: collapse; }
            .data-table th, .data-table td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
            .data-table th { background: #f8f9fa; font-weight: 600; }
            .report-footer { text-align: center; margin-top: 50px; color: #666; }
        `;
    }

    _getReportJS(reportData) {
        let js = '';
        
        if (reportData.charts) {
            reportData.charts.forEach((chartConfig, index) => {
                js += `
                    const ctx${index} = document.getElementById('chart-${index}').getContext('2d');
                    new Chart(ctx${index}, ${JSON.stringify(chartConfig)});
                `;
            });
        }
        
        return js;
    }

    // Error handling methods
    _getErrorChartData() {
        return {
            type: 'doughnut',
            data: {
                labels: ['Error'],
                datasets: [{
                    data: [1],
                    backgroundColor: ['#ea4335'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: () => 'Error loading data'
                        }
                    }
                }
            }
        };
    }

    _getErrorMetrics() {
        const errorMetrics = {};
        Object.entries(this.metricsConfig).forEach(([key, config]) => {
            errorMetrics[key] = {
                label: config.label,
                value: 0,
                formattedValue: 'Error',
                change: null,
                changeFormatted: null,
                trend: 'neutral'
            };
        });
        return errorMetrics;
    }

    _getErrorHTML(message) {
        return `
            <!DOCTYPE html>
            <html><head><title>Error</title></head>
            <body>
                <h1>Report Generation Error</h1>
                <p>Error: ${message}</p>
            </body></html>
        `;
    }
}

// Export for Chrome extension usage
if (typeof chrome !== 'undefined' && chrome.runtime) {
    // Chrome extension environment
    console.log('📊 Report Generator Agent loaded in Chrome extension context');
} else if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = ReportGenerator;
} else {
    // Browser global
    window.ReportGenerator = ReportGenerator;
}

console.log('🎯 Report Generator Agent module loaded successfully');