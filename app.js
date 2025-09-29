/**
 * Phan Dashboard - Modern JavaScript Implementation
 * A modern, refactored version with ES6+ features, classes, and better organization
 */

class PhanDashboard {
    constructor() {
        // Storage keys
        this.STORAGE_KEYS = {
            STATE: 'phan-dashboard-state-v2',
            UI: 'phan-dashboard-ui-v1',
            THEME: 'phan-dashboard-theme',
            DATA: 'phan-dashboard-data-v1',
            LANGUAGE: 'phan-dashboard-language'
        };

        // Language support
        this.currentLanguage = this.loadLanguage();
        this.translations = {
            en: {
                // Header
                'search_placeholder': 'Search...',
                'toggle_theme': 'Toggle theme',
                'import_button': 'Import...',
                'github_button': 'GitHub',
                'demo_button': 'Demo',

                // Sidebar
                'files_title': 'Files',
                'summary_title': 'Summary',
                'reset_button': 'Reset',
                'critical': 'Critical',
                'high': 'High',
                'normal': 'Normal',
                'low': 'Low',
                'info': 'Info',
                
                // Dropzone
                'dropzone_title': 'Drop your Phan report',
                'dropzone_subtitle': 'or click to browse files',
                'dropzone_formats': 'JSON • XML • Checkstyle',
                
                // Table
                'severity': 'Severity',
                'type': 'Type',
                'file': 'File',
                'line': 'Line',
                'message': 'Message',
                'todo_only': 'Todo only',
                'reset': 'Reset',
                'filtered_on': 'Filtered on:',
                
                // Severity levels
                'critical_severity': 'Critical',
                'high_severity': 'High',
                'normal_severity': 'Normal',
                'low_severity': 'Low',
                'info_severity': 'Info',
                
                // Messages
                'data_reset': 'Data reset',
                'reset_confirm': 'Reset all checked items and clear data?',
                'copy_success': 'Copied to clipboard',
                'copy_error': 'Failed to copy',
                'demo_loaded': 'Demo report loaded',
                'demo_error': 'Unable to load demo',

                // Progress
                'completed': 'completed',
                'files_count': 'files',
                'issues_count': 'issues'
            },
            fr: {
                // Header
                'search_placeholder': 'Rechercher...',
                'toggle_theme': 'Basculer le thème',
                'import_button': 'Importer…',
                'github_button': 'GitHub',
                'demo_button': 'Démo',

                // Sidebar
                'files_title': 'Fichiers',
                'summary_title': 'Résumé',
                'reset_button': 'Réinitialiser',
                'critical': 'Critique',
                'high': 'Élevée',
                'normal': 'Normal',
                'low': 'Faible',
                'info': 'Info',
                
                // Dropzone
                'dropzone_title': 'Déposez votre rapport Phan',
                'dropzone_subtitle': 'ou cliquez pour parcourir les fichiers',
                'dropzone_formats': 'JSON • XML • Checkstyle',
                
                // Table
                'severity': 'Sévérité',
                'type': 'Type',
                'file': 'Fichier',
                'line': 'Ligne',
                'message': 'Message',
                'todo_only': 'À faire',
                'reset': 'Reset',
                'filtered_on': 'Filtré sur:',
                
                // Severity levels
                'critical_severity': 'Critique',
                'high_severity': 'Élevée',
                'normal_severity': 'Normal',
                'low_severity': 'Faible',
                'info_severity': 'Info',
                
                // Messages
                'data_reset': 'Données réinitialisées',
                'reset_confirm': 'Réinitialiser toutes les cases cochées et vider les données ?',
                'copy_success': 'Copié dans le presse-papiers',
                'copy_error': 'Échec de la copie',
                'demo_loaded': 'Rapport démo chargé',
                'demo_error': 'Impossible de charger la démo',

                // Progress
                'completed': 'complété',
                'files_count': 'fichiers',
                'issues_count': 'issues'
            }
        };

        // State management
        this.state = this.loadState();
        this.raw = [];
        this.filtered = [];
        this.byFile = new Map();
        this.activeFile = null;
        this.sortKey = 'severity';
        this.sortDir = 'asc';
        this.toastTimer = null;
        this.toastHideTimer = null;
        this.demoReportPath = 'demo-report.json';

        // DOM elements
        this.elements = this.initializeElements();
        
        // Severity configuration
        this.severityOrder = { critical: 0, high: 1, normal: 2, low: 3, info: 4 };
        this.severityClasses = {
            critical: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/60 dark:text-red-200',
            high: 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950/60 dark:text-orange-200',
            normal: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-200',
            low: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-200',
            info: 'border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-900 dark:bg-teal-950/60 dark:text-teal-200'
        };

        this.init();
    }

    // ===== Language Methods =====
    loadLanguage() {
        try {
            return localStorage.getItem(this.STORAGE_KEYS.LANGUAGE) || 'fr';
        } catch (error) {
            return 'fr';
        }
    }

    saveLanguage(lang) {
        try {
            localStorage.setItem(this.STORAGE_KEYS.LANGUAGE, lang);
            this.currentLanguage = lang;
        } catch (error) {
            console.warn('Failed to save language:', error);
        }
    }

    t(key) {
        return this.translations[this.currentLanguage]?.[key] || key;
    }

    setLanguage(lang) {
        if (this.translations[lang]) {
            this.saveLanguage(lang);
            this.updateUI();
        }
    }

    updateUI() {
        // Update header elements
        if (this.elements.search) {
            this.elements.search.placeholder = this.t('search_placeholder');
        }
        if (this.elements.themeToggle) {
            this.elements.themeToggle.title = this.t('toggle_theme');
        }
        if (this.elements.filesTitle) {
            this.elements.filesTitle.textContent = this.t('files_title');
        }
        if (this.elements.resetButtonText) {
            this.elements.resetButtonText.textContent = this.t('reset_button');
        }
        if (this.elements.demoButtonLabel) {
            this.elements.demoButtonLabel.textContent = this.t('demo_button');
        }

        // Update sidebar
        this.renderSidebar();
        
        // Update dropzone
        this.updateDropzone();
        
        // Update table headers
        this.updateTableHeaders();
        
        // Update filter chips
        this.updateFilterChips();
    }

    updateDropzone() {
        if (this.elements.dropzone) {
            const title = this.elements.dropzone.querySelector('h3');
            const subtitle = this.elements.dropzone.querySelector('p');
            const formats = this.elements.dropzone.querySelector('.flex.items-center.justify-center.gap-2');
            
            if (title) title.textContent = this.t('dropzone_title');
            if (subtitle) subtitle.textContent = this.t('dropzone_subtitle');
            if (formats) {
                formats.innerHTML = `
                    <span class="text-sm text-indigo-500 dark:text-indigo-400 font-medium">JSON • XML</span>
                    <span class="w-1 h-1 bg-indigo-300 dark:bg-indigo-600 rounded-full"></span>
                    <span class="text-sm text-indigo-500 dark:text-indigo-400 font-medium">Checkstyle</span>
                `;
            }
        }
    }

    updateTableHeaders() {
        const headers = {
            'severity': this.t('severity'),
            'type': this.t('type'),
            'file': this.t('file'),
            'line': this.t('line'),
            'message': this.t('message')
        };
        
        Object.entries(headers).forEach(([key, text]) => {
            const header = document.querySelector(`th[data-k="${key}"] span`);
            if (header) {
                header.textContent = text;
            }
        });
    }

    updateFilterChips() {
        const chipTexts = {
            'critical': this.t('critical'),
            'high': this.t('high'),
            'normal': this.t('normal'),
            'low': this.t('low'),
            'info': this.t('info')
        };
        
        Object.entries(chipTexts).forEach(([severity, text]) => {
            const chip = document.querySelector(`label:has(input[value="${severity}"]) span:last-child`);
            if (chip) {
                chip.textContent = text;
            }
        });
        
        // Update "Todo only" chip
        const todoChip = document.querySelector('label:has(input[id="onlyOpen"]) span:last-child');
        if (todoChip) {
            todoChip.textContent = this.t('todo_only');
        }
        
        // Update reset button
        const resetBtn = document.querySelector('#resetState span:last-child');
        if (resetBtn) {
            resetBtn.textContent = this.t('reset');
        }
    }

    initializeElements() {
        const $ = (selector) => document.querySelector(selector);
        
        return {
            tbody: $('#tbody'),
            fileList: $('#fileList'),
            search: $('#search'),
            summary: $('#summary'),
            activeFileHint: $('#activeFileHint'),
            dropzone: $('#dropzone'),
            fileInput: $('#fileInput'),
            toast: $('#toast'),
            themeToggle: $('#themeToggle'),
            languageToggle: $('#languageToggle'),
            languageFlag: $('#languageFlag'),
            filesTitle: $('#filesTitle'),
            resetButtonText: $('#resetButtonText'),
            demoButton: $('#demoButton'),
            demoButtonLabel: $('#demoButtonLabel'),
            onlyOpen: $('#onlyOpen'),
            resetStateBtn: $('#resetState'),
            clearFilter: $('#clearFilter'),
            githubStars: $('#github-stars')
        };
    }

    // ===== Utility Methods =====
    getSeverityClass(severity) {
        const normalized = String(severity || 'info').toLowerCase();
        return ['critical', 'high', 'normal', 'low', 'info'].includes(normalized) ? normalized : 'info';
    }

    formatSeverity(severity) {
        const labels = {
            critical: this.t('critical_severity'),
            high: this.t('high_severity'), 
            normal: this.t('normal_severity'),
            low: this.t('low_severity'),
            info: this.t('info_severity')
        };
        return labels[this.getSeverityClass(severity)] || this.t('info_severity');
    }

    escapeHtml(text) {
        return String(text || '').replace(/[&<>"']/g, char => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[char]));
    }

    cleanAnsi(text) {
        return String(text || '').replace(/\u001b\[[0-9;]*m/gi, '');
    }

    mapSeverity(value) {
        if (typeof value === 'number' && !Number.isNaN(value)) {
            if (value >= 10) return 'critical';
            if (value >= 7) return 'high';
            if (value >= 4) return 'normal';
            if (value >= 2) return 'low';
            return 'info';
        }

        const normalized = String(value || 'info').toLowerCase();

        if (['critical', 'blocker', 'fatal', 'error', '10'].includes(normalized)) {
            return 'critical';
        }

        if (['high', 'major', 'severe', 'warning', '9', '8', '7'].includes(normalized)) {
            return 'high';
        }

        if (['normal', 'medium', 'moderate', 'default', '5', '6'].includes(normalized)) {
            return 'normal';
        }

        if (['low', 'minor', 'notice', '3', '4'].includes(normalized)) {
            return 'low';
        }

        return 'info';
    }

    shortPath(path) {
        const maxLength = 56;
        const pathStr = String(path || '');
        
        if (pathStr.length <= maxLength) return pathStr;
        
        const parts = pathStr.split(/[/\\]/);
        const filename = parts.pop();
        const directory = parts.join('/');
        const keepLength = Math.max(8, Math.floor((maxLength - filename.length - 3) / 2));
        
        const head = directory.slice(0, keepLength);
        const tail = directory.slice(-keepLength);
        
        return `${head}…/${filename}`.replace(/\/{2,}/g, '/');
    }

    generateIssueId(issue) {
        const data = [issue.file, issue.line, issue.type, issue.message].join('|');
        return btoa(unescape(encodeURIComponent(data)));
    }

    calculateProgress(items) {
        const total = items.length;
        let done = 0;
        
        for (const item of items) {
            if (this.state[this.generateIssueId(item)] === true) {
                done++;
            }
        }
        
        return [done, total];
    }


    // ===== Storage Methods =====
    saveState() {
        try {
            localStorage.setItem(this.STORAGE_KEYS.STATE, JSON.stringify(this.state));
        } catch (error) {
            console.warn('Failed to save state:', error);
        }
    }

    loadState() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.STATE) || '{}') || {};
        } catch (error) {
            console.warn('Failed to load state:', error);
            return {};
        }
    }

    saveData() {
        try {
            const data = {
                raw: this.raw,
                byFile: Array.from(this.byFile.entries())
            };
            localStorage.setItem(this.STORAGE_KEYS.DATA, JSON.stringify(data));
        } catch (error) {
            console.warn('Failed to save data:', error);
        }
    }

    async loadData() {
        try {
            const data = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.DATA) || 'null');
            if (data?.raw && data?.byFile) {
                this.raw = data.raw;
                this.byFile = new Map(data.byFile);
                return true;
            }
        } catch (error) {
            console.warn('Failed to load data:', error);
        }
        return false;
    }

    clearData() {
        try {
            localStorage.removeItem(this.STORAGE_KEYS.DATA);
        } catch (error) {
            console.warn('Failed to clear data:', error);
        }
    }

    saveUi() {
        try {
            const severityFilters = Array.from(document.querySelectorAll('.sevFilter'))
                .map(checkbox => ({ value: checkbox.value, checked: checkbox.checked }));
            
            const ui = {
                severityFilters,
                search: this.elements.search.value || '',
                onlyOpen: this.elements.onlyOpen.checked,
                sortKey: this.sortKey,
                sortDir: this.sortDir,
                activeFile: this.activeFile
            };
            
            localStorage.setItem(this.STORAGE_KEYS.UI, JSON.stringify(ui));
        } catch (error) {
            console.warn('Failed to save UI state:', error);
        }
    }

    loadUi() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.UI) || 'null');
        } catch (error) {
            console.warn('Failed to load UI state:', error);
            return null;
        }
    }

    // ===== UI Methods =====
    showToast(message) {
        if (!this.elements.toast) {
            return;
        }

        this.elements.toast.textContent = message;
        this.elements.toast.classList.remove('hidden', 'opacity-0');

        // Force a paint to ensure the transition runs when toggling opacity
        void this.elements.toast.offsetWidth;
        this.elements.toast.classList.add('opacity-100');

        clearTimeout(this.toastTimer);
        clearTimeout(this.toastHideTimer);

        this.toastTimer = setTimeout(() => {
            this.elements.toast.classList.remove('opacity-100');
            this.elements.toast.classList.add('opacity-0');

            this.toastHideTimer = setTimeout(() => {
                this.elements.toast.classList.add('hidden');
            }, 200);
        }, 2200);
    }

    // ===== GitHub Integration =====
    async fetchGitHubStars() {
        try {
            const response = await fetch('https://api.github.com/repos/dylanbourdere/phan-dashboard');
            if (response.ok) {
                const data = await response.json();
                if (this.elements.githubStars) {
                    this.elements.githubStars.textContent = data.stargazers_count || '0';
                }
            }
        } catch (error) {
            console.warn('Failed to fetch GitHub stars:', error);
            if (this.elements.githubStars) {
                this.elements.githubStars.textContent = '?';
            }
        }
    }

    // ===== Theme Management =====
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.classList.toggle('dark', theme === 'dark');
        
        try {
            localStorage.setItem(this.STORAGE_KEYS.THEME, theme);
        } catch (error) {
            console.warn('Failed to save theme:', error);
        }
        
        const isDark = theme === 'dark';
        if (this.elements.themeToggle) {
            this.elements.themeToggle.setAttribute('aria-pressed', String(isDark));
            this.elements.themeToggle.textContent = isDark ? '☀️' : '🌙';
        }
    }

    initTheme() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEYS.THEME);
            if (saved) {
                this.setTheme(saved);
                return;
            }
        } catch (error) {
            console.warn('Failed to load theme:', error);
        }
        
        const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
        this.setTheme(prefersDark ? 'dark' : 'light');
    }

    // ===== Data Processing =====
    async processText(text) {
        const content = String(text || '').trim();
        if (!content) {
            this.updateFooter('Fichier vide');
            return;
        }

        try {
            if (content.startsWith('<')) {
                await this.ingest(this.parseCheckstyle(content));
            } else {
                await this.ingest(JSON.parse(content));
            }
        } catch (error) {
            this.updateFooter(`Erreur parsing: ${error.message}`);
        }
    }

    parseCheckstyle(xml) {
        const dom = new DOMParser().parseFromString(xml, 'application/xml');
        if (dom.querySelector('parsererror')) {
            throw new Error('XML invalide');
        }

        const issues = [];
        dom.querySelectorAll('file').forEach(file => {
            const fileName = file.getAttribute('name') || 'unknown';
            file.querySelectorAll('error').forEach(error => {
                issues.push({
                    file: fileName,
                    line: Number(error.getAttribute('line') || 0),
                    severity: error.getAttribute('severity') || 'info',
                    type: error.getAttribute('source') || 'Issue',
                    message: error.getAttribute('message') || ''
                });
            });
        });

        return issues;
    }

    async ingest(data) {
        const issues = Array.isArray(data) ? data : (data?.issues || []);

        this.raw = issues.map(issue => ({
            severity: this.mapSeverity(issue.severity ?? issue.level ?? 'info'),
            type: issue.type || issue.check_name || issue.rule || 'Issue',
            file: issue.file || issue?.location?.path || issue.path || 'unknown',
            line: Number(issue.line ?? issue?.location?.lines?.begin ?? issue.begin ?? 0),
            message: this.cleanAnsi(issue.message || issue.description || issue.text || '')
        }));

        this.byFile = new Map();
        for (const issue of this.raw) {
            if (!this.byFile.has(issue.file)) {
                this.byFile.set(issue.file, []);
            }
            this.byFile.get(issue.file).push(issue);
        }

        this.activeFile = null;
        await this.renderSidebar();
        this.applyFilters();
        this.saveUi();
        this.saveData();
        // Report loaded successfully
        
        // Hide dropzone when report is loaded
        if (this.elements.dropzone) {
            this.elements.dropzone.style.display = 'none';
        }
    }

    // ===== File Loading =====
    async loadDemoReport() {
        try {
            const response = await fetch(this.demoReportPath, { cache: 'no-store' });
            if (!response.ok) {
                const statusText = response.statusText || '';
                const errorLabel = statusText ? `${response.status} ${statusText}` : String(response.status);
                throw new Error(errorLabel);
            }

            const data = await response.json();

            if (this.elements.search) {
                this.elements.search.value = '';
            }
            if (this.elements.onlyOpen) {
                this.elements.onlyOpen.checked = false;
            }

            this.state = {};
            this.saveState();

            await this.ingest(data);
            this.showToast(this.t('demo_loaded'));
        } catch (error) {
            console.warn('Failed to load demo report:', error);
            this.showToast(`${this.t('demo_error')}: ${error.message}`);
        }
    }

    async loadFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async () => {
                try {
                    await this.processText(reader.result);
                    resolve();
                } catch (error) {
                    this.showToast(`Erreur: ${error.message}`);
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    // ===== Sidebar Rendering =====
    async renderSidebar() {
        const entries = [...this.byFile.entries()].sort((a, b) => b[1].length - a[1].length);
        this.elements.fileList.innerHTML = '';

        // Add severity summary at the top
        if (this.byFile.size > 0) {
            const severityCounts = { critical: 0, high: 0, normal: 0, low: 0, info: 0 };
            for (const issue of this.raw) {
                severityCounts[this.getSeverityClass(issue.severity)]++;
            }

            const summaryDiv = document.createElement('div');
            summaryDiv.className = 'mb-4 space-y-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300';
            summaryDiv.innerHTML = `
                <div class="flex items-center justify-between font-medium">
                    <span>${this.t('summary_title')}</span>
                    <span>${this.raw.length} ${this.t('issues_count')}</span>
                </div>
                <div class="flex flex-wrap gap-2">
                    <span class="inline-flex items-center gap-1 rounded-full border border-red-200 px-2 py-1 text-red-600 dark:border-red-900 dark:text-red-300"><span class="h-1.5 w-1.5 rounded-full bg-red-500"></span>${severityCounts.critical}</span>
                    <span class="inline-flex items-center gap-1 rounded-full border border-orange-200 px-2 py-1 text-orange-600 dark:border-orange-900 dark:text-orange-300"><span class="h-1.5 w-1.5 rounded-full bg-orange-500"></span>${severityCounts.high}</span>
                    <span class="inline-flex items-center gap-1 rounded-full border border-amber-200 px-2 py-1 text-amber-600 dark:border-amber-900 dark:text-amber-300"><span class="h-1.5 w-1.5 rounded-full bg-amber-500"></span>${severityCounts.normal}</span>
                    <span class="inline-flex items-center gap-1 rounded-full border border-blue-200 px-2 py-1 text-blue-600 dark:border-blue-900 dark:text-blue-300"><span class="h-1.5 w-1.5 rounded-full bg-blue-500"></span>${severityCounts.low}</span>
                    <span class="inline-flex items-center gap-1 rounded-full border border-teal-200 px-2 py-1 text-teal-600 dark:border-teal-900 dark:text-teal-300"><span class="h-1.5 w-1.5 rounded-full bg-teal-500"></span>${severityCounts.info}</span>
                </div>
            `;
            this.elements.fileList.appendChild(summaryDiv);
        }

        for (const [file, items] of entries) {
            const [done, total] = this.calculateProgress(items);
            const div = document.createElement('div');
            const isActive = this.activeFile === file;

            div.className = `file cursor-pointer rounded-lg border px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:border-indigo-400 hover:text-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 dark:text-slate-200 dark:hover:border-indigo-500 dark:hover:text-indigo-300 dark:focus-visible:ring-indigo-500 ${
                isActive
                    ? 'border-transparent bg-indigo-50 ring-2 ring-indigo-400 dark:border-transparent dark:bg-indigo-950/40 dark:ring-indigo-500'
                    : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'
            }`;
            div.title = file;
            div.setAttribute('data-file', file);
            div.setAttribute('tabindex', '0');

            const progressPercent = total > 0 ? Math.round((done / total) * 100) : 0;

            // Count severity for this file
            const fileSeverityCounts = { critical: 0, high: 0, normal: 0, low: 0, info: 0 };
            for (const item of items) {
                fileSeverityCounts[this.getSeverityClass(item.severity)]++;
            }

            div.innerHTML = `
                <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                        <div class="truncate font-medium" title="${this.escapeHtml(file)}">${this.escapeHtml(this.shortPath(file))}</div>
                        <div class="mt-1 text-xs text-slate-500 dark:text-slate-400">${items.length} ${this.t('issues_count')}</div>
                    </div>
                    <span class="progress-text text-xs text-slate-500 dark:text-slate-400">${done}/${total}</span>
                </div>
                <div class="mt-2 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                    <div class="progress-bar h-1.5 rounded-full bg-indigo-500 transition-all dark:bg-indigo-400" style="width: ${progressPercent}%"></div>
                </div>
                <div class="mt-2 flex flex-wrap gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <span class="severity-badge inline-flex items-center gap-1 rounded-full border border-red-200 px-2 py-0.5" data-severity="critical" style="display: ${fileSeverityCounts.critical > 0 ? 'inline-flex' : 'none'}"><span class="h-1.5 w-1.5 rounded-full bg-red-500"></span><span class="count">${fileSeverityCounts.critical}</span></span>
                    <span class="severity-badge inline-flex items-center gap-1 rounded-full border border-orange-200 px-2 py-0.5" data-severity="high" style="display: ${fileSeverityCounts.high > 0 ? 'inline-flex' : 'none'}"><span class="h-1.5 w-1.5 rounded-full bg-orange-500"></span><span class="count">${fileSeverityCounts.high}</span></span>
                    <span class="severity-badge inline-flex items-center gap-1 rounded-full border border-amber-200 px-2 py-0.5" data-severity="normal" style="display: ${fileSeverityCounts.normal > 0 ? 'inline-flex' : 'none'}"><span class="h-1.5 w-1.5 rounded-full bg-amber-500"></span><span class="count">${fileSeverityCounts.normal}</span></span>
                    <span class="severity-badge inline-flex items-center gap-1 rounded-full border border-blue-200 px-2 py-0.5" data-severity="low" style="display: ${fileSeverityCounts.low > 0 ? 'inline-flex' : 'none'}"><span class="h-1.5 w-1.5 rounded-full bg-blue-500"></span><span class="count">${fileSeverityCounts.low}</span></span>
                    <span class="severity-badge inline-flex items-center gap-1 rounded-full border border-teal-200 px-2 py-0.5" data-severity="info" style="display: ${fileSeverityCounts.info > 0 ? 'inline-flex' : 'none'}"><span class="h-1.5 w-1.5 rounded-full bg-teal-500"></span><span class="count">${fileSeverityCounts.info}</span></span>
                </div>
            `;

            div.onclick = () => {
                this.activeFile = this.activeFile === file ? null : file;
                this.applyFilters();
                this.updateSidebarActiveState();
            };

            div.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    div.click();
                }
            });

            this.elements.fileList.appendChild(div);
        }

        this.elements.summary.textContent = `${this.byFile.size} ${this.t('files_count')} • ${this.raw.length} ${this.t('issues_count')}`;
        this.updateSeverityChipCounts();
    }

    updateSidebarActiveState() {
        this.elements.fileList.querySelectorAll('.file').forEach(fileDiv => {
            const file = fileDiv.getAttribute('data-file');
            const isActive = this.activeFile === file;

            if (isActive) {
                fileDiv.classList.add('border-transparent', 'bg-indigo-50', 'ring-2', 'ring-indigo-400', 'dark:border-transparent', 'dark:bg-indigo-950/40', 'dark:ring-indigo-500');
                fileDiv.classList.remove('border-slate-200', 'bg-white', 'dark:border-slate-700', 'dark:bg-slate-900');
            } else {
                fileDiv.classList.remove('border-transparent', 'bg-indigo-50', 'ring-2', 'ring-indigo-400', 'dark:border-transparent', 'dark:bg-indigo-950/40', 'dark:ring-indigo-500');
                fileDiv.classList.add('border-slate-200', 'bg-white', 'dark:border-slate-700', 'dark:bg-slate-900');
            }
        });

        // Mettre à jour les compteurs de sévérité
        this.updateSeverityChipCounts();
        this.updateSidebarSeverityCounts();
    }

    updateSidebarSeverityCounts() {
        // Mettre à jour les compteurs de sévérité dans la sidebar
        this.elements.fileList.querySelectorAll('.file').forEach(fileDiv => {
            const file = fileDiv.getAttribute('data-file');
            const items = this.byFile.get(file) || [];
            
            // Calculer la progression (done/total)
            const [done, total] = this.calculateProgress(items);
            const progressPercent = total > 0 ? Math.round((done / total) * 100) : 0;
            
            // Mettre à jour le compteur de progression
            const progressText = fileDiv.querySelector('.progress-text');
            if (progressText) {
                progressText.textContent = `${done}/${total}`;
            }
            
            // Mettre à jour la barre de progression
            const progressBar = fileDiv.querySelector('.progress-bar');
            if (progressBar) {
                progressBar.style.width = `${progressPercent}%`;
            }
            
            // Compter les issues par sévérité pour ce fichier
            const fileSeverityCounts = { critical: 0, high: 0, normal: 0, low: 0, info: 0 };
            for (const item of items) {
                fileSeverityCounts[this.getSeverityClass(item.severity)]++;
            }
            
            // Mettre à jour les badges de sévérité
            const severityBadges = fileDiv.querySelectorAll('.severity-badge');
            severityBadges.forEach(badge => {
                const severity = badge.getAttribute('data-severity');
                const count = fileSeverityCounts[severity] || 0;
                const countNode = badge.querySelector('.count');
                if (countNode) {
                    countNode.textContent = count;
                }
                badge.style.display = count > 0 ? 'inline-flex' : 'none';
            });
        });
    }

    // ===== Filtering and Sorting =====
    applyFilters() {
        const allowedSeverities = new Set(
            Array.from(document.querySelectorAll('.sevFilter'))
                .filter(checkbox => checkbox.checked)
                .map(checkbox => checkbox.value)
        );
        
        const searchQuery = (this.elements.search.value || '').toLowerCase();
        const onlyOpenChecked = this.elements.onlyOpen.checked;
        
        this.filtered = this.raw.filter(issue => {
            const severityMatch = allowedSeverities.has(this.getSeverityClass(issue.severity));
            const fileMatch = !this.activeFile || issue.file === this.activeFile;
            const searchMatch = searchQuery === '' || 
                (issue.message + issue.type + issue.file).toLowerCase().includes(searchQuery);
            const openMatch = !onlyOpenChecked || this.state[this.generateIssueId(issue)] !== true;
            
            return severityMatch && fileMatch && searchMatch && openMatch;
        });
        
        this.sortAndRender();
        this.updateSeverityChipCounts();
        this.saveUi();
    }

    sortAndRender() {
        const key = this.sortKey;
        const direction = this.sortDir === 'asc' ? 1 : -1;
        
        this.filtered.sort((a, b) => {
            let valueA = a[key];
            let valueB = b[key];
            
            if (key === 'severity') {
                valueA = this.severityOrder[this.getSeverityClass(valueA)] ?? 99;
                valueB = this.severityOrder[this.getSeverityClass(valueB)] ?? 99;
            }
            
            if (key === 'line') {
                valueA = Number(valueA) || 0;
                valueB = Number(valueB) || 0;
            }
            
            if (valueA < valueB) return -1 * direction;
            if (valueA > valueB) return 1 * direction;
            return 0;
        });
        
        this.renderTable();
    }

    renderTable() {
        this.elements.tbody.innerHTML = this.filtered.map(issue => {
            const id = this.generateIssueId(issue);
            const checked = this.state[id] === true;
            const rowClass = checked
                ? 'bg-slate-100/80 dark:bg-slate-800/60'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800/40';
            const copyValue = `${issue.file}:${issue.line || 1}`;
            const severity = this.getSeverityClass(issue.severity);
            const severityClasses = this.severityClasses[severity] || 'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200';

            const fileCell = `
                <div class="group flex min-w-0 items-center justify-between">
                    <span class="max-w-xs truncate font-mono text-sm text-slate-700 dark:text-slate-300" title="${this.escapeHtml(issue.file)}">${this.escapeHtml(this.shortPath(issue.file))}</span>
                    <div class="path-tools ml-2 flex-shrink-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                        <button class="inline-flex items-center rounded border border-slate-300 px-2 py-1 text-xs text-slate-500 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-600 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:text-indigo-300" data-copy="${this.escapeHtml(copyValue)}">📋</button>
                    </div>
                </div>
            `;

            return `
                <tr class="${rowClass} transition-colors duration-150" data-id="${id}">
                    <td class="px-4 py-3 w-12">
                        <input type="checkbox" data-id="${id}" ${checked ? 'checked' : ''} class="custom-checkbox">
                    </td>
                    <td class="px-4 py-3 w-32">
                        <span class="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${severityClasses}">${this.formatSeverity(issue.severity)}</span>
                    </td>
                    <td class="px-4 py-3 w-40 font-mono text-sm text-slate-700 dark:text-slate-300 truncate" title="${this.escapeHtml(issue.type)}">${this.escapeHtml(issue.type)}</td>
                    <td class="px-4 py-3 min-w-0 max-w-xs">${fileCell}</td>
                    <td class="px-4 py-3 w-20 font-mono text-sm text-slate-600 dark:text-slate-400 text-center">${issue.line || ''}</td>
                    <td class="px-4 py-3 min-w-0 max-w-md">
                        <div class="text-sm text-slate-700 dark:text-slate-300 break-words" title="${this.escapeHtml(issue.message)}">${this.escapeHtml(issue.message)}</div>
                    </td>
                </tr>
            `;
        }).join('');

        this.wireTableEvents();
    }

    wireTableEvents() {
        // Wire checkboxes
        this.elements.tbody.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.state[checkbox.dataset.id] = checkbox.checked;
                this.saveState();
                this.applyFilters();
                this.updateSidebarActiveState();
            });
        });

        // Wire copy buttons
        this.elements.tbody.querySelectorAll('button[data-copy]').forEach(button => {
            button.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(button.getAttribute('data-copy'));
                    this.showToast(`${this.t('copy_success')}: ${button.getAttribute('data-copy')}`);
                } catch (error) {
                    console.warn('Failed to copy to clipboard:', error);
                }
            });
        });

        // Wire row click toggles
        this.elements.tbody.querySelectorAll('tr').forEach(row => {
            row.addEventListener('click', (event) => {
                // Ne pas déclencher si on sélectionne du texte
                if (window.getSelection().toString().length > 0) {
                    return;
                }
                
                if (event.target.closest('.path-tools') || 
                    event.target.tagName === 'INPUT' || 
                    event.target.tagName === 'BUTTON') {
                    return;
                }
                
                const id = row.getAttribute('data-id');
                const checkbox = row.querySelector('input[type="checkbox"]');
                if (!id || !checkbox) return;
                
                checkbox.checked = !checkbox.checked;
                this.state[id] = checkbox.checked;
                this.saveState();
                this.applyFilters();
                this.updateSidebarActiveState();
            });
        });
    }

    updateSortIndicators() {
        document.querySelectorAll('thead th').forEach(header => {
            const key = header.dataset.k;
            if (!key) {
                header.removeAttribute('aria-sort');
                return;
            }
            
            const sort = key === this.sortKey ? this.sortDir : 'none';
            header.setAttribute('aria-sort', sort === 'none' ? 'none' : sort);
        });
    }

    updateSeverityChipCounts() {
        const counts = { critical: 0, high: 0, normal: 0, low: 0, info: 0 };
        for (const issue of this.filtered) {
            counts[this.getSeverityClass(issue.severity)]++;
        }
        
        document.querySelectorAll('.sevFilter').forEach(checkbox => {
            const label = checkbox.closest('label');
            if (!label) return;
            
            let badge = label.querySelector('.count');
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'count inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 ml-2';
                label.appendChild(badge);
            }
            badge.textContent = String(counts[checkbox.value] || 0);
        });
    }

    // ===== Event Handlers =====
    setupEventListeners() {
        // File input
        this.elements.fileInput.addEventListener('change', async (event) => {
            const file = event.target.files?.[0];
            if (file) {
                try {
                    await this.loadFromFile(file);
                } catch (error) {
                    this.showToast(`Erreur lors du chargement: ${error.message}`);
                }
            }
        });

        if (this.elements.demoButton) {
            this.elements.demoButton.addEventListener('click', async () => {
                await this.loadDemoReport();
            });
        }

        // Search
        this.elements.search.addEventListener('input', () => this.applyFilters());

        // Severity filters
        document.querySelectorAll('.sevFilter').forEach(checkbox => {
            checkbox.addEventListener('change', () => this.applyFilters());
        });

        // Only open filter
        this.elements.onlyOpen.addEventListener('change', () => this.applyFilters());

        // Table headers (sorting)
        document.querySelectorAll('thead th').forEach(header => {
            const key = header.dataset.k;
            if (key) {
                header.setAttribute('role', 'button');
                header.setAttribute('tabindex', '0');
            }
            
            header.addEventListener('click', () => {
                const sortKey = header.dataset.k;
                if (!sortKey) return;
                
                if (this.sortKey === sortKey) {
                    this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
                } else {
                    this.sortKey = sortKey;
                    this.sortDir = 'asc';
                }
                
                this.updateSortIndicators();
                this.sortAndRender();
                this.saveUi();
            });
            
            header.addEventListener('keydown', (event) => {
                if ((event.key === 'Enter' || event.key === ' ') && header.dataset.k) {
                    event.preventDefault();
                    header.click();
                }
            });
        });

        // Dropzone
        this.elements.dropzone.addEventListener('click', () => this.elements.fileInput.click());
        this.elements.dropzone.setAttribute('role', 'button');
        this.elements.dropzone.setAttribute('tabindex', '0');
        this.elements.dropzone.setAttribute('aria-label', 'Importer un rapport Phan');
        
        ['dragover', 'dragleave'].forEach(eventType => {
            this.elements.dropzone.addEventListener(eventType, (event) => {
                event.preventDefault();
                this.elements.dropzone.classList.toggle('dragover', eventType === 'dragover');
            });
        });
        
        this.elements.dropzone.addEventListener('drop', async (event) => {
            event.preventDefault();
            this.elements.dropzone.classList.remove('dragover');
            const file = event.dataTransfer.files?.[0];
            if (file) {
                try {
                    await this.loadFromFile(file);
                } catch (error) {
                    this.showToast(`Erreur lors du chargement: ${error.message}`);
                }
            }
        });
        
        this.elements.dropzone.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                this.elements.fileInput.click();
            }
        });

        // Clear filter
        this.elements.clearFilter.addEventListener('click', () => {
            this.activeFile = null;
            this.applyFilters();
            this.updateSidebarActiveState();
        });

        // Reset state
        this.elements.resetStateBtn.addEventListener('click', () => {
            if (confirm('Réinitialiser toutes les cases cochées et vider les données ?')) {
                this.state = {};
                this.raw = [];
                this.byFile = new Map();
                this.activeFile = null;
                this.saveState();
                this.clearData();
                this.applyFilters();
                this.renderSidebar();
                this.showToast(this.t('data_reset'));
                
                // Show dropzone when data is cleared
                if (this.elements.dropzone) {
                    this.elements.dropzone.style.display = 'block';
                }
            }
        });

        // Theme toggle
        if (this.elements.themeToggle) {
            this.elements.themeToggle.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
                this.setTheme(nextTheme);
            });
        }

        // Language toggle
        if (this.elements.languageToggle) {
            this.elements.languageToggle.addEventListener('click', () => {
                const newLang = this.currentLanguage === 'fr' ? 'en' : 'fr';
                this.setLanguage(newLang);
                this.elements.languageFlag.textContent = newLang === 'fr' ? '🇫🇷' : '🇬🇧';
            });
        }
    }

    // ===== Initialization =====
    async applySavedUi() {
        const ui = this.loadUi();
        if (!ui) return;

        if (Array.isArray(ui.severityFilters)) {
            for (const filter of ui.severityFilters) {
                const checkbox = document.querySelector(`.sevFilter[value="${filter.value}"]`);
                if (checkbox) {
                    checkbox.checked = !!filter.checked;
                }
            }
        }

        this.elements.search.value = ui.search || '';
        this.elements.onlyOpen.checked = !!ui.onlyOpen;
        this.sortKey = ui.sortKey || this.sortKey;
        this.sortDir = ui.sortDir || this.sortDir;
        this.activeFile = ui.activeFile || null;
    }

    showDropzoneIfEmpty() {
        if (this.raw.length === 0 && this.elements.dropzone) {
            this.elements.dropzone.style.display = 'block';
        }
    }

    async init() {
        this.initTheme();
        await this.applySavedUi();
        this.updateSortIndicators();
        
        // Fetch GitHub stars
        this.fetchGitHubStars();
        
        // Initialize language
        this.elements.languageFlag.textContent = this.currentLanguage === 'fr' ? '🇫🇷' : '🇬🇧';
        this.updateUI();
        
        // Try to restore saved data
        if (await this.loadData() && this.raw.length > 0) {
            await this.renderSidebar();
            this.applyFilters();
            // Report restored successfully
            
            // Hide dropzone when data is restored
            if (this.elements.dropzone) {
                this.elements.dropzone.style.display = 'none';
            }
        } else {
            this.applyFilters();
            await this.renderSidebar();
        }
        
        this.setupEventListeners();
        this.showDropzoneIfEmpty();
    }
}

// Initialize the dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new PhanDashboard();
});
