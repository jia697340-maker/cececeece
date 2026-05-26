window.SystemApps = window.SystemApps || {};

const WindowManager = {
    openApps: new Map(), // 记录当前打开的应用 { appId: { container } }

    // 打开一个 APP
    openApp: function(appId, scriptPath) {
        if (this.openApps.has(appId)) {
            console.log(`App ${appId} is already open.`);
            return;
        }

        // 如果这个 APP 的模块已经加载过，直接渲染
        if (window.SystemApps[appId]) {
            this._renderApp(appId);
            return;
        }

        // 动态加载 JS 模块（支持双击本地运行 file://）
        const script = document.createElement('script');
        script.src = scriptPath;
        script.onload = () => {
            this._renderApp(appId);
        };
        script.onerror = () => {
            console.error(`Failed to load app: ${appId} from ${scriptPath}`);
        };
        document.body.appendChild(script);
    },

    // 渲染并初始化 APP
    _renderApp: function(appId) {
        const appModule = window.SystemApps[appId];
        if (!appModule) return;

        // 创建容器
        const container = document.createElement('div');
        container.className = `app-window-container app-${appId}`;
        container.innerHTML = appModule.html;
        
        // 插入到应用主容器内
        const appContainer = document.getElementById('app-container');
        if(appContainer) {
            appContainer.appendChild(container);
        } else {
            document.body.appendChild(container);
        }

        // 记录状态
        this.openApps.set(appId, { container });

        // 立即执行内部初始化，避免 setTimeout 导致的点击迟钝感和白屏
        if (typeof appModule.init === 'function') {
            appModule.init(() => this.closeApp(appId), container);
        }

        // 确保 DOM 渲染后再触发动画类，使用 requestAnimationFrame 替代 setTimeout 提升移动端性能
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const modal = container.querySelector('.settings-modal');
                if (modal) modal.classList.add('active');
            });
        });
    },

    // 关闭并销毁 APP
    closeApp: function(appId) {
        const opened = this.openApps.get(appId);
        if (!opened) return;

        const appModule = window.SystemApps[appId];
        const container = opened.container;

        // 先移除 active 类，触发关闭动画
        const modal = container.querySelector('.settings-modal');
        if (modal) {
            modal.classList.remove('active');
        }

        // 等待动画结束（0.3s）后彻底销毁
        setTimeout(() => {
            if (typeof appModule.destroy === 'function') {
                appModule.destroy(container);
            }
            container.remove();
            this.openApps.delete(appId);
        }, 300); // 必须和 CSS 中 modal 的 transition 匹配
    }
};

window.WindowManager = WindowManager;
