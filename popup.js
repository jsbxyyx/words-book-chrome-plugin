class WordBook {
    constructor() {
        this.words = [];
        this.filteredWords = [];
        this.studyWords = [];
        this.currentStudyIndex = 0;
        this.init();
    }

    async init() {
        await this.loadWords();
        this.setupEventListeners();
        this.renderWordList();
        this.updateStats();
    }

    async loadWords() {
        try {
            const result = await chrome.storage.local.get(['words']);
            this.words = result.words || [];
            this.filteredWords = [...this.words];
            
            console.log('加载的单词数据:', this.words);
        } catch (error) {
            console.error('加载单词失败:', error);
        }
    }

    async saveWords() {
        try {
            await chrome.storage.local.set({ words: this.words });
            console.log('保存单词成功');
        } catch (error) {
            console.error('保存单词失败:', error);
        }
    }

    async loadTranslateSettings() {
        try {
            const settings = await chrome.storage.local.get(['settings']);
            this.translate = {
                url: settings.translateUrl,
                token: settings.translateToken,
            };
            console.log('加载的翻译配置:', this.translate);
        } catch (err) {
            console.log('加载的翻译配置失败:', err);
        }
    }

    setupEventListeners() {
        // 搜索
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.filterWords(e.target.value);
        });

        // 排序
        document.getElementById('sortSelect').addEventListener('change', (e) => {
            this.sortWords(e.target.value);
        });

        // 学习模式
        document.getElementById('studyBtn').addEventListener('click', () => {
            this.startStudyMode();
        });

        // 设置页面
        document.getElementById('optionsBtn').addEventListener('click', () => {
            chrome.runtime.openOptionsPage();
        });

        // 学习模式事件
        this.setupStudyModeEvents();
        
        // 删除确认弹窗事件
        this.setupDeleteConfirmEvents();
    }

    setupStudyModeEvents() {
        const modal = document.getElementById('studyModal');
        const closeBtn = document.getElementById('closeStudyModal');
        const showMeaningBtn = document.getElementById('showMeaningBtn');
        const unfamiliarBtn = document.getElementById('unfamiliarBtn');
        const familiarBtn = document.getElementById('familiarBtn');

        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });

        showMeaningBtn.addEventListener('click', () => {
            this.showMeaning();
        });

        unfamiliarBtn.addEventListener('click', () => {
            this.markFamiliarity(1);
        });

        familiarBtn.addEventListener('click', () => {
            this.markFamiliarity(2);
        });
    }

    setupDeleteConfirmEvents() {
        const modal = document.getElementById('deleteConfirmModal');
        const cancelBtn = document.getElementById('cancelDeleteBtn');
        const confirmBtn = document.getElementById('confirmDeleteBtn');

        cancelBtn.addEventListener('click', () => {
            this.hideDeleteConfirm();
        });

        confirmBtn.addEventListener('click', () => {
            this.confirmDelete();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideDeleteConfirm();
            }
        });
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // DeepL翻译接口
    async translateWithDeepL(word) {
        try {
            console.log('开始翻译单词:', word);

            const translate = {
                url: 'https://deeplx.mingming.dev/translate',
                token: '',
            };

            const settings = await chrome.storage.local.get(['settings']);
            translate.url = settings.translateUrl || translate.url;
            translate.token = settings.translateToken || '';

            const headers = {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            if (translate.token != null && translate.token.trim() != '') {
                headers['authorization'] = translate.token;
            }
            const response = await fetch(translate.url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    text: word,
                    source_lang: "auto",
                    target_lang: "ZH"
                })
            });

            console.log('翻译响应状态:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('DeepL翻译响应数据:', data);
                
                if (data && data.code === 200 && data.data) {
                    const translation = data.data.trim();
                    console.log('翻译结果:', translation);
                    return translation;
                } else {
                    console.warn('翻译响应格式不正确:', data);
                    return null;
                }
            } else {
                console.warn('DeepL翻译请求失败:', response.status, response.statusText);
                const errorText = await response.text();
                console.warn('错误响应内容:', errorText);
            }
        } catch (error) {
            console.warn('DeepL翻译失败:', error);
        }
        return null;
    }

    // 本地词典翻译（备用方案）
    translateWithLocalDict(word) {
        const localDict = {
            'instead': '代替，而不是',
            'changes': '变化，改变',
            'hello': '你好',
            'world': '世界',
            'good': '好的',
            'bad': '坏的',
            'thank': '谢谢',
            'thanks': '谢谢',
            'please': '请',
            'sorry': '对不起',
            'water': '水',
            'food': '食物',
            'book': '书',
            'computer': '电脑',
            'phone': '电话',
            'car': '汽车',
            'house': '房子',
            'home': '家',
            'school': '学校',
            'work': '工作',
            'study': '学习',
            'learn': '学习',
            'read': '读',
            'write': '写',
            'listen': '听',
            'speak': '说',
            'love': '爱',
            'like': '喜欢',
            'help': '帮助',
            'friend': '朋友',
            'family': '家庭',
            'time': '时间',
            'important': '重要的',
            'different': '不同的',
            'beautiful': '美丽的',
            'happy': '快乐的',
            'sad': '悲伤的',
            'money': '钱',
            'people': '人们'
        };

        const translation = localDict[word.toLowerCase()];
        console.log(`本地词典翻译 ${word}:`, translation);
        return translation || null;
    }

    // 翻译单个单词
    async translateWord(wordId) {
        const word = this.words.find(w => w.id === wordId);
        if (!word) return;

        const translateBtn = document.querySelector(`[data-translate-id="${wordId}"]`);
        if (translateBtn) {
            translateBtn.textContent = '翻译中...';
            translateBtn.disabled = true;
        }

        try {
            console.log('开始翻译单词:', word.word);
            let translation = await this.translateWithDeepL(word.word);
            
            if (!translation) {
                console.log('DeepL翻译失败，尝试本地词典');
                translation = this.translateWithLocalDict(word.word);
            }
            
            if (translation && translation.trim()) {
                console.log('翻译成功:', translation);
                word.meaning = translation.trim();
                word.translation = translation.trim();
                word.autoTranslation = translation.trim();
                word.translatedAt = new Date().toISOString();
                
                await this.saveWords();
                this.renderWordList();
                this.updateStats();
                this.showMessage('翻译成功！', 'success');
            } else {
                console.warn('翻译结果为空');
                this.showMessage('翻译失败，请稍后重试', 'error');
                if (translateBtn) {
                    translateBtn.textContent = '🔄 翻译';
                    translateBtn.disabled = false;
                }
            }
        } catch (error) {
            console.error('翻译过程出错:', error);
            this.showMessage('翻译失败，请稍后重试', 'error');
            if (translateBtn) {
                translateBtn.textContent = '🔄 翻译';
                translateBtn.disabled = false;
            }
        }
    }

    // 显示删除确认弹窗
    showDeleteConfirm(wordId) {
        const word = this.words.find(w => w.id === wordId);
        if (!word) return;

        this.pendingDeleteId = wordId;
        
        // 更新弹窗内容
        document.getElementById('deleteWordText').textContent = word.word;
        document.getElementById('deleteWordTranslation').textContent = 
            word.meaning || word.translation || word.autoTranslation || '暂无翻译';
        
        // 显示弹窗
        document.getElementById('deleteConfirmModal').style.display = 'block';
    }

    // 隐藏删除确认弹窗
    hideDeleteConfirm() {
        document.getElementById('deleteConfirmModal').style.display = 'none';
        this.pendingDeleteId = null;
    }

    // 确认删除
    async confirmDelete() {
        if (this.pendingDeleteId) {
            this.words = this.words.filter(word => word.id !== this.pendingDeleteId);
            await this.saveWords();
            this.filterWords(document.getElementById('searchInput').value);
            this.updateStats();
            this.showMessage('单词已删除', 'success');
        }
        this.hideDeleteConfirm();
    }

    // 删除单词（显示确认弹窗）
    async deleteWord(id) {
        this.showDeleteConfirm(id);
    }

    async toggleFamiliarity(id) {
        const word = this.words.find(w => w.id === id);
        if (word) {
            word.familiarity = (word.familiarity + 1) % 3;
            word.lastReviewDate = new Date().toISOString().split('T')[0];
            word.reviewCount++;
            await this.saveWords();
            this.renderWordList();
            this.updateStats();
        }
    }

    filterWords(searchTerm) {
        if (!searchTerm) {
            this.filteredWords = [...this.words];
        } else {
            const term = searchTerm.toLowerCase();
            this.filteredWords = this.words.filter(word => 
                word.word.toLowerCase().includes(term) || 
                (word.meaning && word.meaning.toLowerCase().includes(term)) ||
                (word.translation && word.translation.toLowerCase().includes(term))
            );
        }
        this.renderWordList();
    }

    sortWords(sortType) {
        switch (sortType) {
            case 'alpha':
                this.filteredWords.sort((a, b) => a.word.localeCompare(b.word));
                break;
            case 'date':
                this.filteredWords.sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate));
                break;
            case 'familiarity':
                this.filteredWords.sort((a, b) => a.familiarity - b.familiarity);
                break;
        }
        this.renderWordList();
    }

    // 检查单词是否有翻译
    hasTranslation(word) {
        const translation = word.meaning || word.translation || word.autoTranslation;
        return !!(translation && translation.trim() !== '');
    }

    renderWordList() {
        const wordList = document.getElementById('wordList');
        
        if (this.filteredWords.length === 0) {
            wordList.innerHTML = `
                <div class="empty-state">
                    <p>还没有添加任何单词</p>
                    <p>在网页上选择文字并右键"添加到单词本"</p>
                </div>
            `;
            return;
        }

        console.log('渲染单词列表:', this.filteredWords);

        wordList.innerHTML = this.filteredWords.map(word => {
            const hasTranslation = this.hasTranslation(word);
            const translation = word.meaning || word.translation || word.autoTranslation || '';

            return `
                <div class="word-item">
                    <div class="word-header">
                        <div class="word-main">
                            <div class="word-text">${this.escapeHtml(word.word)}</div>
                            ${hasTranslation ? 
                                `<div class="word-translation">${this.escapeHtml(translation)}</div>` :
                                `<div class="word-no-translation">
                                    <button class="btn-translate" data-translate-id="${word.id}">🔄 翻译</button>
                                </div>`
                            }
                        </div>
                        <div class="word-actions">
                            <button class="btn-small familiarity-btn" data-id="${word.id}" title="标记熟悉度">
                                ${this.getFamiliarityIcon(word.familiarity)}
                            </button>
                            <button class="btn-small delete-btn" data-id="${word.id}" title="删除">🗑️</button>
                        </div>
                    </div>
                    <div class="word-meta">
                        <span>添加于: ${word.addedDate || '未知'}</span>
                        <span class="familiarity-badge familiarity-${word.familiarity}">
                            ${this.getFamiliarityText(word.familiarity)}
                        </span>
                    </div>
                </div>
            `;
        }).join('');

        // 添加事件监听器
        this.setupWordListEvents();
    }

    setupWordListEvents() {
        const wordList = document.getElementById('wordList');
        
        // 移除旧的事件监听器
        if (this.handleWordListClick) {
            wordList.removeEventListener('click', this.handleWordListClick);
        }
        
        // 添加新的事件监听器
        this.handleWordListClick = (e) => {
            const target = e.target;
            
            if (target.classList.contains('delete-btn')) {
                const wordId = target.getAttribute('data-id');
                this.deleteWord(wordId);
            } else if (target.classList.contains('familiarity-btn')) {
                const wordId = target.getAttribute('data-id');
                this.toggleFamiliarity(wordId);
            } else if (target.classList.contains('btn-translate')) {
                const wordId = target.getAttribute('data-translate-id');
                this.translateWord(wordId);
            }
        };
        
        wordList.addEventListener('click', this.handleWordListClick);
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getFamiliarityIcon(familiarity) {
        switch (familiarity) {
            case 0: return '⭕';
            case 1: return '🟡';
            case 2: return '🟢';
            default: return '⭕';
        }
    }

    getFamiliarityText(familiarity) {
        switch (familiarity) {
            case 0: return '未复习';
            case 1: return '不熟悉';
            case 2: return '熟悉';
            default: return '未复习';
        }
    }

    updateStats() {
        const total = this.words.length;
        const familiar = this.words.filter(w => w.familiarity === 2).length;
        const needReview = this.words.filter(w => w.familiarity === 0 || w.familiarity === 1).length;

        document.getElementById('totalWords').textContent = total;
        document.getElementById('familiarWords').textContent = familiar;
        document.getElementById('reviewWords').textContent = needReview;
    }

    startStudyMode() {
        // 优先学习不熟悉的单词
        this.studyWords = this.words
            .filter(w => w.familiarity !== 2)
            .sort(() => Math.random() - 0.5);

        if (this.studyWords.length === 0) {
            this.showMessage('所有单词都已熟悉！', 'success');
            return;
        }

        this.currentStudyIndex = 0;
        this.showStudyModal();
        this.showCurrentStudyWord();
    }

    showStudyModal() {
        document.getElementById('studyModal').style.display = 'block';
    }

    showCurrentStudyWord() {
        if (this.currentStudyIndex >= this.studyWords.length) {
            this.endStudyMode();
            return;
        }

        const word = this.studyWords[this.currentStudyIndex];
        
        // 获取翻译内容
        let translation = word.meaning || word.translation || word.autoTranslation || '暂无翻译';
        
        document.getElementById('studyWord').textContent = word.word;
        document.getElementById('studyPronunciation').textContent = translation;
        document.getElementById('studyMeaning').textContent = translation;
        document.getElementById('studyExample').textContent = word.example || '';
        
        document.getElementById('meaningDisplay').style.display = 'none';
        document.getElementById('showMeaningBtn').style.display = 'block';
        document.getElementById('familiarityButtons').style.display = 'none';
        
        document.getElementById('studyProgress').textContent = 
            `${this.currentStudyIndex + 1} / ${this.studyWords.length}`;
    }

    showMeaning() {
        document.getElementById('meaningDisplay').style.display = 'block';
        document.getElementById('showMeaningBtn').style.display = 'none';
        document.getElementById('familiarityButtons').style.display = 'flex';
    }

    async markFamiliarity(familiarity) {
        const word = this.studyWords[this.currentStudyIndex];
        const originalWord = this.words.find(w => w.id === word.id);
        
        if (originalWord) {
            originalWord.familiarity = familiarity;
            originalWord.lastReviewDate = new Date().toISOString().split('T')[0];
            originalWord.reviewCount++;
            await this.saveWords();
        }

        this.currentStudyIndex++;
        this.showCurrentStudyWord();
        this.updateStats();
    }

    endStudyMode() {
        document.getElementById('studyModal').style.display = 'none';
        this.showMessage('学习完成！', 'success');
        this.renderWordList();
    }

    showMessage(text, type = 'info') {
        // 创建消息提示
        const message = document.createElement('div');
        message.className = `message message-${type}`;
        message.textContent = text;
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 16px;
            border-radius: 6px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            transition: opacity 0.3s;
            ${type === 'success' ? 'background: #28a745;' : ''}
            ${type === 'error' ? 'background: #dc3545;' : ''}
            ${type === 'info' ? 'background: #17a2b8;' : ''}
        `;

        document.body.appendChild(message);

        setTimeout(() => {
            message.style.opacity = '0';
            setTimeout(() => {
                if (document.body.contains(message)) {
                    document.body.removeChild(message);
                }
            }, 300);
        }, 3000);
    }
}

// 初始化应用
const wordBook = new WordBook();

// 监听来自content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'addSelectedWord') {
        // 由于移除了手动添加功能，这里可以显示提示或者直接忽略
        console.log('收到添加单词请求，但手动添加功能已移除');
    }
});