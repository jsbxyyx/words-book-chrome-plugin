// 后台脚本：处理右键菜单和消息传递
class WordBookBackground {
    constructor() {
        this.setupContextMenu();
        this.setupMessageListeners();
    }

    setupContextMenu() {
        // 创建右键菜单
        chrome.runtime.onInstalled.addListener(() => {
            chrome.contextMenus.create({
                id: 'addToWordBook',
                title: '添加到单词本',
                contexts: ['selection']
            });
        });

        // 处理右键菜单点击
        chrome.contextMenus.onClicked.addListener(async (info, tab) => {
            if (info.menuItemId === 'addToWordBook' && info.selectionText) {
                const selectedText = info.selectionText.trim();

                if (this.isValidWord(selectedText)) {
                    // 获取当前单词列表
                    const result = await chrome.storage.local.get(['words']);
                    const words = result.words || [];

                    // 检查是否已存在
                    const existingWord = words.find(w =>
                        w.word.toLowerCase() === selectedText.toLowerCase()
                    );

                    if (existingWord) {
                        this.showNotification('该单词已存在于单词本中');
                        return;
                    }

                    // 添加新单词（暂不翻译，等用户手动点击翻译按钮）
                    const newWord = {
                        id: this.generateId(),
                        word: selectedText.toLowerCase(),
                        meaning: '', // 暂时为空，等待用户点击翻译
                        translation: '',
                        autoTranslation: '',
                        partOfSpeech: '',
                        example: '',
                        addedDate: new Date().toISOString().split('T')[0],
                        addedTime: new Date().toISOString(),
                        reviewCount: 0,
                        familiarity: 0,
                        lastReviewDate: null,
                        createdBy: 'jsbxyyx', // 当前用户
                        source: {
                            url: tab.url,
                            title: tab.title
                        }
                    };

                    words.unshift(newWord);
                    await chrome.storage.local.set({ words });

                    this.showNotification(`单词"${selectedText}"已添加到单词本`);
                } else {
                    this.showNotification('请选择有效的英文单词');
                }
            }
        });
    }

    setupMessageListeners() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'addSelectedWord') {
                // 转发消息给popup（如果打开的话）
                chrome.runtime.sendMessage(request);
            }
        });
    }

    isValidWord(text) {
        // 检查是否为有效的英文单词（允许单个单词或短语）
        const wordRegex = /^[a-zA-Z\s\-']+$/;
        return wordRegex.test(text) && text.length <= 50 && text.split(' ').length <= 5;
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    showNotification(message) {
        // 使用chrome notifications API显示通知
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: '单词本',
            message: message
        }, (notificationId) => {
            // 3秒后自动清除通知
            setTimeout(() => {
                chrome.notifications.clear(notificationId);
            }, 3000);
        });
    }
}

// 初始化后台服务
new WordBookBackground();