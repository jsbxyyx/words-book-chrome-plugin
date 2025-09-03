// 内容脚本：处理网页文本选择和右键菜单
class WordSelector {
    constructor() {
        this.selectedText = '';
        this.setupEventListeners();
    }

    setupEventListeners() {
        // 监听文本选择
        document.addEventListener('mouseup', () => {
            this.handleTextSelection();
        });

        // 监听键盘选择
        document.addEventListener('keyup', () => {
            this.handleTextSelection();
        });
    }

    handleTextSelection() {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();

        if (selectedText && this.isValidWord(selectedText)) {
            this.selectedText = selectedText;
            // 可以在这里添加浮动按钮等UI元素
            this.showQuickAddButton(selection);
        } else {
            this.hideQuickAddButton();
        }
    }

    isValidWord(text) {
        // 检查是否为有效的英文单词
        const wordRegex = /^[a-zA-Z\s-']+$/;
        return wordRegex.test(text) && text.length <= 50 && text.split(' ').length <= 3;
    }

    showQuickAddButton(selection) {
        // 移除已存在的按钮
        this.hideQuickAddButton();

        // 获取选择区域的位置
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        // 创建快速添加按钮
        const button = document.createElement('div');
        button.id = 'wordbook-quick-add';
        button.innerHTML = '📚 添加到单词本';
        button.style.cssText = `
            position: fixed;
            top: ${rect.bottom + window.scrollY + 5}px;
            left: ${rect.left + window.scrollX}px;
            background: #667eea;
            color: white;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 12px;
            cursor: pointer;
            z-index: 10000;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            user-select: none;
            transition: background 0.2s;
        `;

        button.addEventListener('click', (e) => {
            e.stopPropagation();
            this.addWordToBook();
        });

        button.addEventListener('mouseenter', () => {
            button.style.background = '#5a6fd8';
        });

        button.addEventListener('mouseleave', () => {
            button.style.background = '#667eea';
        });

        document.body.appendChild(button);

        // 5秒后自动隐藏
        setTimeout(() => {
            this.hideQuickAddButton();
        }, 5000);
    }

    hideQuickAddButton() {
        const existingButton = document.getElementById('wordbook-quick-add');
        if (existingButton) {
            existingButton.remove();
        }
    }

    addWordToBook() {
        // 发送消息给popup
        chrome.runtime.sendMessage({
            action: 'addSelectedWord',
            word: this.selectedText,
            url: window.location.href,
            title: document.title
        });

        this.hideQuickAddButton();
        
        // 显示添加成功提示
        this.showNotification('单词已添加到单词本！');
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 12px 16px;
            border-radius: 6px;
            font-size: 14px;
            z-index: 10001;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transition: opacity 0.3s;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// 初始化文本选择器
new WordSelector();

// 监听来自background的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getSelectedText') {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();
        sendResponse({ selectedText });
    }
});