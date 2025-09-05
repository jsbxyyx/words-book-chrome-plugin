class OptionsManager {
    constructor() {
        this.init();
    }

    async init() {
        await this.loadStats();
        await this.loadSettings();
    }

    async loadStats() {
        try {
            const result = await chrome.storage.local.get(['words']);
            const words = result.words || [];

            const today = new Date().toISOString().split('T')[0];

            const stats = {
                total: words.length,
                familiar: words.filter(w => w.familiarity === 2).length,
                needReview: words.filter(w => w.familiarity !== 2).length,
                todayAdded: words.filter(w => w.addedDate === today).length
            };

            document.getElementById('totalWordsCount').textContent = stats.total;
            document.getElementById('familiarWordsCount').textContent = stats.familiar;
            document.getElementById('reviewWordsCount').textContent = stats.needReview;
            document.getElementById('todayAddedCount').textContent = stats.todayAdded;
        } catch (error) {
            console.error('加载统计数据失败:', error);
        }
    }

    async loadSettings() {
        try {
            const result = await chrome.storage.local.get(['settings']);
            const settings = result.settings || {
                studyMode: 'unfamiliar',
                wordsPerSession: 10,
                autoShowMeaning: 0,
                translateUrl: 'https://deeplx.mingming.dev/translate',
                translateToken: ''
            };

            document.getElementById('studyMode').value = settings.studyMode;
            document.getElementById('wordsPerSession').value = settings.wordsPerSession;
            document.getElementById('autoShowMeaning').value = settings.autoShowMeaning;
            document.getElementById('translateUrl').value = settings.translateUrl;
            document.getElementById('translateToken').value = settings.translateToken;
        } catch (error) {
            console.error('加载设置失败:', error);
        }
    }

    showMessage(text, type = 'success') {
        const container = document.getElementById('messageContainer');
        const message = document.createElement('div');
        message.className = `message message-${type}`;
        message.textContent = text;

        container.appendChild(message);

        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 5000);
    }
}

// 初始化选项管理器
const optionsManager = new OptionsManager();

// 保存设置
async function saveSettings() {
    try {
        const settings = {
            studyMode: document.getElementById('studyMode').value,
            wordsPerSession: parseInt(document.getElementById('wordsPerSession').value),
            autoShowMeaning: parseInt(document.getElementById('autoShowMeaning').value),
            translateUrl: document.getElementById('translateUrl').value,
            translateToken: document.getElementById('translateToken').value,
            translateSource: document.getElementById('translateSource').value,
            translateTarget: document.getElementById('translateTarget').value,
        };

        await chrome.storage.local.set({ settings });
        optionsManager.showMessage('设置已保存');
    } catch (error) {
        console.error('保存设置失败:', error);
        optionsManager.showMessage('保存设置失败', 'error');
    }
}

// 导出数据
async function exportData() {
    try {
        const result = await chrome.storage.local.get(['words', 'settings']);
        const data = {
            words: result.words || [],
            settings: result.settings || {},
            exportDate: new Date().toISOString(),
            version: '1.0.0'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `wordbook-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        optionsManager.showMessage('数据导出成功');
    } catch (error) {
        console.error('导出数据失败:', error);
        optionsManager.showMessage('导出数据失败', 'error');
    }
}

// 导入数据
async function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const progressBar = document.getElementById('importProgress');
    const progressFill = progressBar.querySelector('.progress-fill');

    try {
        progressBar.classList.remove('hidden');
        progressFill.style.width = '20%';

        const text = await file.text();
        const data = JSON.parse(text);

        progressFill.style.width = '50%';

        // 验证数据格式
        if (!data.words || !Array.isArray(data.words)) {
            throw new Error('无效的数据格式');
        }

        progressFill.style.width = '80%';

        // 确认导入
        if (!confirm(`确定要导入 ${data.words.length} 个单词吗？这将覆盖现有数据。`)) {
            progressBar.classList.add('hidden');
            return;
        }

        // 保存数据
        await chrome.storage.local.set({
            words: data.words,
            settings: data.settings || {}
        });

        progressFill.style.width = '100%';

        setTimeout(() => {
            progressBar.classList.add('hidden');
            progressFill.style.width = '0%';
            optionsManager.showMessage('数据导入成功');
            optionsManager.loadStats();
            optionsManager.loadSettings();
        }, 500);

    } catch (error) {
        console.error('导入数据失败:', error);
        progressBar.classList.add('hidden');
        progressFill.style.width = '0%';
        optionsManager.showMessage('导入数据失败: ' + error.message, 'error');
    }

    // 清空文件输入
    event.target.value = '';
}

// 清空所有数据
async function clearAllData() {
    if (!confirm('确定要清空所有数据吗？此操作无法撤销。')) {
        return;
    }

    if (!confirm('请再次确认：这将永久删除所有单词和设置数据。')) {
        return;
    }

    try {
        await chrome.storage.local.clear();
        optionsManager.showMessage('所有数据已清空');
        optionsManager.loadStats();
        optionsManager.loadSettings();
    } catch (error) {
        console.error('清空数据失败:', error);
        optionsManager.showMessage('清空数据失败', 'error');
    }
}

document.addEventListener('DOMContentLoaded', function () {
    console.log('DOMContentLoaded options');
    const btn_save_settings = document.getElementById('btn-save-settings');
    if (btn_save_settings) {
        btn_save_settings.addEventListener('click', saveSettings);
    }
    const btn_export_data = document.getElementById('btn-export-data');
    if (btn_export_data) {
        btn_export_data.addEventListener('click', exportData);
    }
    const btn_clearall_data = document.getElementById('btn-clearall-data');
    if (btn_clearall_data) {
        btn_clearall_data.addEventListener('click', clearAllData);
    }
});