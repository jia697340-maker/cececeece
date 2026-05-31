// =========================================================
// Main Logic (状态更新与现代精美 APP 内容生成)
// =========================================================

// ==============================
// 0. 专属手机弹窗逻辑
// ==============================
let currentModalCallback = null;

function showCustomModal(title, message, showInput = false, defaultValue = '', callback = null, resetValue = null, showInput2 = false, defaultValue2 = '', input1Placeholder = '', input2Placeholder = '') {
    const modal = document.getElementById('custom-modal');
    const titleEl = document.getElementById('modal-title');
    const messageEl = document.getElementById('modal-message');
    const inputEl = document.getElementById('modal-input');
    const inputEl2 = document.getElementById('modal-input-2');
    const resetBtn = document.getElementById('modal-reset');
    
    if (!modal) return;

    titleEl.textContent = title;
    messageEl.innerHTML = message; // 允许包含 <br>

    // 充当全局变量临时保存reset值
    modal.dataset.resetValue1 = resetValue !== null ? resetValue : '';
    // 如果是双输入框，使用特殊分隔符保存两个重置值，或者用另一个 dataset 属性
    if (Array.isArray(resetValue) && resetValue.length === 2) {
        modal.dataset.resetValue1 = resetValue[0];
        modal.dataset.resetValue2 = resetValue[1];
    } else {
        modal.dataset.resetValue2 = '';
    }

    if (showInput) {
        inputEl.style.display = 'block';
        inputEl.value = defaultValue;
        inputEl.placeholder = input1Placeholder;
        inputEl.focus();
    } else {
        inputEl.style.display = 'none';
        inputEl.value = '';
    }
    
    if (showInput2) {
        inputEl2.style.display = 'block';
        inputEl2.value = defaultValue2;
        inputEl2.placeholder = input2Placeholder;
    } else {
        inputEl2.style.display = 'none';
        inputEl2.value = '';
    }

    if (resetValue !== null) {
        resetBtn.style.display = 'block';
    } else {
        resetBtn.style.display = 'none';
    }

    currentModalCallback = callback;
    modal.classList.add('active');
}

function hideCustomModal() {
    const modal = document.getElementById('custom-modal');
    if (modal) {
        modal.classList.remove('active');
    }
    currentModalCallback = null;
}

document.addEventListener('DOMContentLoaded', () => {
    const cancelBtn = document.getElementById('modal-cancel');
    const cancelIconBtn = document.getElementById('modal-cancel-icon'); // 右上角关闭按钮
    const confirmBtn = document.getElementById('modal-confirm');
    const resetBtn = document.getElementById('modal-reset');
    const inputEl = document.getElementById('modal-input');
    const inputEl2 = document.getElementById('modal-input-2');
    const modal = document.getElementById('custom-modal');

    if (cancelBtn) cancelBtn.addEventListener('click', hideCustomModal);
    if (cancelIconBtn) cancelIconBtn.addEventListener('click', hideCustomModal);
    
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (inputEl.style.display === 'block') {
                inputEl.value = modal.dataset.resetValue1 || '';
            }
            if (inputEl2.style.display === 'block') {
                inputEl2.value = modal.dataset.resetValue2 || '';
            }
        });
    }

    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            if (currentModalCallback) {
                if (inputEl2.style.display === 'block') {
                    currentModalCallback([inputEl.value, inputEl2.value]);
                } else {
                    currentModalCallback(inputEl.style.display === 'block' ? inputEl.value : null);
                }
            }
            hideCustomModal();
        });
    }
});

// ==============================
// 0.5 图片存储管理器 (支持几百MB大图, IndexedDB + 预留接口)
// ==============================
const DB_NAME = 'NRJ_ImageStore';
const DB_VERSION = 2; // 升级版本号以添加新表
const STORE_NAME = 'images';
const API_HISTORY_STORE = 'api-history';

// 初始化 IndexedDB
function initIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
            if (!db.objectStoreNames.contains(API_HISTORY_STORE)) {
                const store = db.createObjectStore(API_HISTORY_STORE, { keyPath: 'id' });
                store.createIndex('charId', 'charId', { unique: false });
                store.createIndex('timestamp', 'timestamp', { unique: false });
            }
        };
    });
}

const ImageStorageManager = {
    // 【预留接口】用于以后 APP/APK 化，如调用 JSBridge
    async uploadImageToNative(file) {
        console.log("预留接口: 上传图片到 Native APP...", file);
        // return await window.JSBridge.uploadImage(file);
        throw new Error("Native 接口尚未实现");
    },

    // 【预留接口】用于以后上传到云服务器 (如阿里云 OSS, AWS)
    async uploadImageToServer(file) {
        console.log("预留接口: 上传图片到 云端服务器...", file);
        // const formData = new FormData();
        // formData.append("image", file);
        // const res = await fetch("https://api.yourserver.com/upload", { method: 'POST', body: formData });
        // return await res.json();
        throw new Error("云端服务器接口尚未实现");
    },

    // 【当前实现】保存到浏览器本地的大容量 IndexedDB (支持几百MB，不转Base64)
    async saveToIndexedDB(key, fileOrUrlObj) {
        const db = await initIndexedDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const request = store.put(fileOrUrlObj, key);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },

    // 从 IndexedDB 读取大文件并转换为可用于 img.src 的 Object URL，或返回网络 URL
    async loadFromIndexedDB(key) {
        const db = await initIndexedDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const request = store.get(key);
            request.onsuccess = () => {
                if (request.result) {
                    if (typeof request.result === 'string') {
                        resolve(request.result);
                    } else if (request.result.isUrl) {
                        resolve(request.result.url);
                    } else {
                        try {
                            // result 是 Blob/File 对象，生成本地内存 URL
                            resolve(URL.createObjectURL(request.result));
                        } catch (err) {
                            console.warn("createObjectURL 失败:", err);
                            resolve(null);
                        }
                    }
                } else {
                    resolve(null);
                }
            };
            request.onerror = () => reject(request.error);
        });
    },

    // 从 IndexedDB 中彻底删除大文件
    async deleteFromIndexedDB(key) {
        const db = await initIndexedDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const request = store.delete(key);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },

    // 在 IndexedDB 内部直接复制数据
    async copyInIndexedDB(sourceKey, destKey) {
        const db = await initIndexedDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const request = store.get(sourceKey);
            request.onsuccess = () => {
                if (request.result) {
                    store.put(request.result, destKey);
                } else {
                    // 如果源不存在，确保目标也被删除，以保持一致
                    store.delete(destKey);
                }
            };
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    },

    // ==============================
    // API 历史记录存储 (针对大段文本)
    // ==============================
    
    async saveApiHistory(record) {
        const db = await initIndexedDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(API_HISTORY_STORE, 'readwrite');
            const store = tx.objectStore(API_HISTORY_STORE);
            const request = store.put(record);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },

    async loadApiHistory(charId) {
        const db = await initIndexedDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(API_HISTORY_STORE, 'readonly');
            const store = tx.objectStore(API_HISTORY_STORE);
            const index = store.index('charId');
            const request = index.getAll(IDBKeyRange.only(charId));
            
            request.onsuccess = () => {
                // 按时间降序排序 (最新的在前)
                const results = request.result || [];
                results.sort((a, b) => b.timestamp - a.timestamp);
                resolve(results);
            };
            request.onerror = () => reject(request.error);
        });
    },

    async deleteApiHistory(ids) {
        const db = await initIndexedDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(API_HISTORY_STORE, 'readwrite');
            const store = tx.objectStore(API_HISTORY_STORE);
            
            if (!Array.isArray(ids)) ids = [ids];
            
            let completed = 0;
            let hasError = false;
            
            if (ids.length === 0) return resolve();

            ids.forEach(id => {
                const request = store.delete(id);
                request.onsuccess = () => {
                    completed++;
                    if (completed === ids.length && !hasError) resolve();
                };
                request.onerror = () => {
                    hasError = true;
                    reject(request.error);
                };
            });
        });
    },

    async clearApiHistory(charId) {
        const db = await initIndexedDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(API_HISTORY_STORE, 'readwrite');
            const store = tx.objectStore(API_HISTORY_STORE);
            const index = store.index('charId');
            const request = index.openCursor(IDBKeyRange.only(charId));
            
            request.onsuccess = (e) => {
                const cursor = e.target.result;
                if (cursor) {
                    cursor.delete();
                    cursor.continue();
                } else {
                    resolve();
                }
            };
            request.onerror = () => reject(request.error);
        });
    },

    async enforceApiHistoryLimit(charId, maxCount) {
        if (maxCount <= 0) return;
        const records = await this.loadApiHistory(charId);
        if (records.length > maxCount) {
            // records 是降序的，截取后面的就是要删除的
            const toDelete = records.slice(maxCount).map(r => r.id);
            await this.deleteApiHistory(toDelete);
        }
    }
};

// 将 ImageStorageManager 挂载到全局 window 对象，供各个 App 调用
window.ImageStorageManager = ImageStorageManager;

// ==============================
// 0.6 图片更换专属弹窗
// ==============================
let currentImageCallback = null;
let currentImageKey = null;

function showImageModal(imageKey, callback) {
    const modal = document.getElementById('image-modal');
    if (!modal) return;
    
    currentImageKey = imageKey;
    currentImageCallback = callback;
    modal.classList.add('active');
}

function hideImageModal() {
    const modal = document.getElementById('image-modal');
    if (modal) modal.classList.remove('active');
    currentImageCallback = null;
    currentImageKey = null;
}

document.addEventListener('DOMContentLoaded', () => {
    const cancelBtn = document.getElementById('img-modal-cancel');
    const btnLocal = document.getElementById('btn-img-local');
    const btnUrl = document.getElementById('btn-img-url');
    const btnReset = document.getElementById('btn-img-reset');
    const fileInput = document.getElementById('global-file-input');

    if (cancelBtn) cancelBtn.addEventListener('click', hideImageModal);

    if (btnLocal && fileInput) {
        btnLocal.addEventListener('click', () => {
            fileInput.click();
        });
    }

    if (btnReset) {
        btnReset.addEventListener('click', async () => {
            if (currentImageKey && currentImageCallback) {
                try {
                    await ImageStorageManager.deleteFromIndexedDB(currentImageKey);
                    currentImageCallback({ type: 'reset', url: null });
                } catch (error) {
                    console.error("清除图片失败:", error);
                }
            }
            hideImageModal();
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', async (e) => {
            if (e.target.files && e.target.files.length > 0) {
                const file = e.target.files[0];
                if (currentImageKey && currentImageCallback) {
                    try {
                        // 保存大文件 Blob 到 IndexedDB
                        await ImageStorageManager.saveToIndexedDB(currentImageKey, file);
                        const objectUrl = URL.createObjectURL(file);
                        currentImageCallback({ type: 'local', url: objectUrl });
                    } catch (error) {
                        console.error("保存图片失败:", error);
                        alert("保存图片失败，请重试！");
                    }
                }
                hideImageModal();
            }
            fileInput.value = ''; // 清空选择，支持重复选同文件
        });
    }

    if (btnUrl) {
        btnUrl.addEventListener('click', () => {
            hideImageModal();
            setTimeout(() => {
                showCustomModal('使用网络 URL', '请输入图片的完整 URL 地址：', true, '', async (url) => {
                    if (url && url.trim() !== '') {
                        if (currentImageCallback && currentImageKey) {
                            try {
                                await ImageStorageManager.saveToIndexedDB(currentImageKey, { isUrl: true, url: url.trim() });
                                currentImageCallback({ type: 'url', url: url.trim() });
                            } catch (error) {
                                console.error("保存URL失败:", error);
                            }
                        }
                    }
                });
            }, 300);
        });
    }
});

// ==============================
// 5. 桌面与 Dock 图标点击分发中心 (接入 WindowManager)
// ==============================
function initDesktopClicks() {
    // 提取统一的打开应用逻辑
    const openAppByName = (appName) => {
        console.log(`点击了图标: ${appName}`);
        if (!window.WindowManager) {
            alert('WindowManager 核心引擎未能加载！请刷新页面。');
            return;
        }

        try {
            if (appName === '外观设置') {
                window.WindowManager.openApp('settings', 'src/apps/settings/index.js');
            } else if (appName === '高级设置') {
                window.WindowManager.openApp('advanced', 'src/apps/advanced/index.js');
            } else if (appName === 'API') {
                window.WindowManager.openApp('api', 'src/apps/api/index.js');
            } else if (appName === '世界书') {
                window.WindowManager.openApp('worldbook', 'src/apps/worldbook/index.js');
            } else if (appName === '聊天') {
                window.WindowManager.openApp('chat', 'src/apps/chat/index.js');
            }
        } catch (err) {
            console.error('打开 App 报错:', err);
            alert('打开 App 报错，请检查控制台。');
        }
    };

    // 监听 Dock 栏点击
    const dockContainer = document.querySelector('.dock-container');
    if (dockContainer) {
        dockContainer.addEventListener('click', (e) => {
            const item = e.target.closest('.dock-item');
            if (item) {
                const labelEl = item.querySelector('.app-label');
                if (labelEl) {
                    openAppByName(labelEl.textContent.trim());
                }
            }
        });
    }

    // 监听主屏幕/桌面应用点击
    const homeScreen = document.getElementById('home-screen');
    if (homeScreen) {
        homeScreen.addEventListener('click', (e) => {
            const item = e.target.closest('.app-item');
            if (item) {
                const labelEl = item.querySelector('.app-label');
                if (labelEl) {
                    openAppByName(labelEl.textContent.trim());
                }
            }
        });
    }
}

// 暴露全局应用壁纸方法
window.applySystemWallpaper = async function(url) {
    const appContainer = document.getElementById('app-container');
    if (!appContainer) return;
    
    if (url) {
        appContainer.style.backgroundImage = `url(${url})`;
        appContainer.style.backgroundSize = 'cover';
        appContainer.style.backgroundPosition = 'center';
        appContainer.style.backgroundRepeat = 'no-repeat';
    } else {
        appContainer.style.backgroundImage = 'none';
    }
};

async function initWallpaper() {
    try {
        const url = await ImageStorageManager.loadFromIndexedDB('system-wallpaper');
        if (url) {
            window.applySystemWallpaper(url);
        }
    } catch (e) {
        console.error("加载系统壁纸失败:", e);
    }
}

// 暴露全局弹窗壁纸方法
window.applyModalWallpaper = function(url) {
    let styleTag = document.getElementById('nrj-modal-bg-style');
    if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'nrj-modal-bg-style';
        document.head.appendChild(styleTag);
    }
    
    if (url) {
        styleTag.innerHTML = `
            .modal-content-wrapper,
            .popup-content,
            .chat-popup-content,
            .settings-container {
                background-image: url('${url}') !important;
                background-size: cover !important;
                background-position: center !important;
                background-repeat: no-repeat !important;
                background-color: transparent !important;
            }
        `;
    } else {
        styleTag.innerHTML = '';
    }
};

async function initModalWallpaper() {
    try {
        const url = await ImageStorageManager.loadFromIndexedDB('modal-bg');
        if (url) {
            window.applyModalWallpaper(url);
        }
    } catch (e) {
        console.error("加载弹窗壁纸失败:", e);
    }
}

// ==============================
// 1. 时钟逻辑
// ==============================
function updateClock() {
    const clockElement = document.getElementById('clock');
    if (!clockElement) return;

    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();

    // 补零
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;

    clockElement.textContent = `${hours}:${minutes}`;
}

// 立即调用一次，并每分钟更新一次
updateClock();
setInterval(updateClock, 1000); 

// ==============================
// 2. 模拟 App 数据 (单字版极简高级图标)
//    - 彻底放弃丑陋SVG，全部采用统一的单字排版与半磨砂背景
// ==============================
window.sysAppData = [
    { name: "聊天" },
    { name: "情侣" },
    { name: "钱包" },
    { name: "音乐" },
    { name: "投递" },
    { name: "论坛" },
    { name: "抖音" },
    { name: "书城" }
];

// Dock 栏常用 App 数据
window.sysDockData = [
    { name: "API" },
    { name: "世界书" },
    { name: "外观设置" },
    { name: "高级设置" }
];

// ==============================
// 3. 渲染逻辑 (CSS Grid 混合排版 + 多页滑动)
// ==============================
async function renderDesktop() {
    const page1Grid = document.getElementById('page-1-grid');
    const page2Grid = document.getElementById('page-2-grid');
    if (!page1Grid || !page2Grid) return;

    page1Grid.innerHTML = '';
    page2Grid.innerHTML = '';

    // 区域一：完整版灰白极简个人主页 (占 4 列)
    const newInsWidgetHTML = `
        <div class="widget-card new-ins-widget" id="new-ins-widget">
            <div class="new-ins-header">
                <div class="new-ins-avatar-section">
                    <div class="new-ins-avatar-wrapper" id="new-ins-avatar-box">
                        <img id="new-ins-avatar" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="Avatar">
                        <div class="new-ins-avatar-ring"></div>
                        <div class="new-ins-plus-icon"><i class="ph-bold ph-plus"></i></div>
                        <div class="new-ins-heart-bubble"><i class="ph-fill ph-heart" style="color:#555;"></i><i class="ph-fill ph-heart" style="color:#ddd;"></i></div>
                        <input type="file" id="new-ins-avatar-upload" accept="image/*" style="display: none;">
                    </div>
                </div>
                <div class="new-ins-stats">
                    <div class="new-ins-stat" id="new-ins-stat-1">
                        <div class="stat-num">0</div>
                        <div class="stat-label">Posts</div>
                    </div>
                    <div class="new-ins-stat" id="new-ins-stat-2">
                        <div class="stat-num">0</div>
                        <div class="stat-label">Followers</div>
                    </div>
                    <div class="new-ins-stat" id="new-ins-stat-3">
                        <div class="stat-num">0</div>
                        <div class="stat-label">Following</div>
                    </div>
                </div>
            </div>
            
            <div class="new-ins-nickname" id="new-ins-nickname">个人昵称</div>
            <div class="new-ins-bio" id="new-ins-bio">记录生活点滴</div>
            
            <div class="new-ins-edit-btn" id="new-ins-edit-btn">Edit Profile</div>
        </div>
    `;

    // 区域二：右侧照片组件 (占 2 列)
    const photoWidgetHTML = `
        <div class="widget-card square-widget photo-widget" id="photo-widget">
            <img id="photo-img" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="Photo">
            <input type="file" id="photo-upload" accept="image/*" style="display: none;">
        </div>
    `;

    // 生成单个 App HTML 的辅助函数
    const createAppHTML = async (app) => {
        let innerContent = `<div class="app-icon text-icon">${app.name.substring(0, 1)}</div>`;
        
        try {
            if (window.ImageStorageManager) {
                const imgUrl = await window.ImageStorageManager.loadFromIndexedDB(`app-icon-${app.name}`);
                if (imgUrl) {
                    innerContent = `
                        <div class="app-icon" style="background-image: url('${imgUrl}'); background-size: cover; background-position: center; border: none; box-shadow: none;"></div>
                    `;
                }
            }
        } catch(e) {}

        return `
        <div class="app-item">
            ${innerContent}
            <span class="app-label">${app.name}</span>
        </div>
        `;
    };

    // ========== 第一页排版 ==========
    // Row 1: 完整版灰白极简主页
    // Row 2 & 3: 左侧 4 个 APP (每行2个) + 右侧 照片组件 (占2列x2行)
    let page1HTML = newInsWidgetHTML;
    
    // 注意：CSS Grid 是按顺序流入的，要控制位置，排列顺序如下：
    page1HTML += await createAppHTML(window.sysAppData[0]);
    page1HTML += await createAppHTML(window.sysAppData[1]);
    page1HTML += photoWidgetHTML;
    page1HTML += await createAppHTML(window.sysAppData[2]);
    page1HTML += await createAppHTML(window.sysAppData[3]);

    page1Grid.innerHTML = page1HTML;

    // ========== 第二页排版 ==========
    let page2HTML = '';
    for (let i = 4; i < window.sysAppData.length; i++) {
        page2HTML += await createAppHTML(window.sysAppData[i]);
    }
    
    page2Grid.innerHTML = page2HTML;
}

async function renderDock() {
    const dockContainer = document.querySelector('.dock-container');
    if (!dockContainer) return;

    dockContainer.innerHTML = '';

    for (let app of window.sysDockData) {
        const item = document.createElement('div');
        item.className = 'dock-item';
        
        let innerContent = `<div class="app-icon text-icon">${app.name.substring(0, 1)}</div>`;
        
        try {
            if (window.ImageStorageManager) {
                const imgUrl = await window.ImageStorageManager.loadFromIndexedDB(`app-icon-${app.name}`);
                if (imgUrl) {
                    innerContent = `
                        <div class="app-icon" style="background-image: url('${imgUrl}'); background-size: cover; background-position: center; border: none; box-shadow: none;"></div>
                    `;
                }
            }
        } catch(e) {}

        item.innerHTML = `
            ${innerContent}
            <span class="app-label">${app.name}</span>
        `;
        dockContainer.appendChild(item);
    }
}

// ==============================
// 4. 小组件交互与数据存储 (多区域混合网格版)
// ==============================
function initWidgets() {
    /* -----------------------------------
       区域一：完整版灰白极简主页
       ----------------------------------- */
    const newInsState = {
        widgetEl: document.getElementById('new-ins-widget'),
        avatarBox: document.getElementById('new-ins-avatar-box'),
        avatarImg: document.getElementById('new-ins-avatar'),
        avatarInput: document.getElementById('new-ins-avatar-upload'),
        
        nicknameEl: document.getElementById('new-ins-nickname'),
        bioEl: document.getElementById('new-ins-bio'),
        btnEl: document.getElementById('new-ins-edit-btn'),
        
        stat1El: document.getElementById('new-ins-stat-1'),
        stat2El: document.getElementById('new-ins-stat-2'),
        stat3El: document.getElementById('new-ins-stat-3'),

        data: JSON.parse(localStorage.getItem('nrj-new-ins-data-v5')) || {
            nickname: '个人昵称',
            bio: '记录生活点滴',
            btnText: 'Edit Profile',
            stats: [
                { num: '0', label: 'Posts' },
                { num: '0', label: 'Followers' },
                { num: '0', label: 'Following' }
            ]
        },

        save() {
            localStorage.setItem('nrj-new-ins-data-v5', JSON.stringify(this.data));
            this.render();
        },

        async render() {
            if (!this.avatarBox) return;
            
            // 加载大组件背景
            if (this.widgetEl) {
                const bgUrl = await ImageStorageManager.loadFromIndexedDB('widget-main-bg');
                if (bgUrl) {
                    this.widgetEl.style.backgroundImage = `url(${bgUrl})`;
                    this.widgetEl.style.backgroundSize = 'cover';
                    this.widgetEl.style.backgroundPosition = 'center';
                } else {
                    this.widgetEl.style.backgroundImage = 'none';
                }
            }

            // 从 IndexedDB 加载头像大图，如果没有则使用纯白透明占位图
            const avatarUrl = await ImageStorageManager.loadFromIndexedDB('ins-avatar');
            this.avatarImg.src = avatarUrl || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

            this.nicknameEl.textContent = this.data.nickname;
            this.bioEl.innerHTML = this.data.bio.replace(/\n/g, '<br>');
            this.btnEl.textContent = this.data.btnText;

            this.stat1El.querySelector('.stat-num').textContent = this.data.stats[0].num;
            this.stat1El.querySelector('.stat-label').textContent = this.data.stats[0].label;

            this.stat2El.querySelector('.stat-num').textContent = this.data.stats[1].num;
            this.stat2El.querySelector('.stat-label').textContent = this.data.stats[1].label;

            this.stat3El.querySelector('.stat-num').textContent = this.data.stats[2].num;
            this.stat3El.querySelector('.stat-label').textContent = this.data.stats[2].label;
        }
    };

    if(newInsState.avatarBox) {
        newInsState.render();

        // 头像点击：调出专属大图上传弹窗
        newInsState.avatarBox.addEventListener('click', () => {
            showImageModal('ins-avatar', (result) => {
                // 回调里自动更新 img 的 src，或者恢复默认
                if (result && result.type === 'reset') {
                    newInsState.avatarImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                } else if (result && result.url) {
                    newInsState.avatarImg.src = result.url;
                }
            });
        });

        // 昵称修改弹窗
        newInsState.nicknameEl.addEventListener('click', () => {
            showCustomModal('修改昵称', '请输入新的昵称：', true, newInsState.data.nickname, (newNickname) => {
                if (newNickname !== null && newNickname.trim() !== '') {
                    newInsState.data.nickname = newNickname.trim();
                    newInsState.save();
                }
            }, '个人昵称'); // 传入重置值
        });

        // 简介修改替换为专属弹窗 (现在使用 textarea, 回车直接换行)
        newInsState.bioEl.addEventListener('click', () => {
            showCustomModal('修改简介', '请输入简介内容：', true, newInsState.data.bio, (newBio) => {
                if (newBio !== null && newBio.trim() !== '') {
                    newInsState.data.bio = newBio.trim();
                    newInsState.save();
                }
            }, '记录生活点滴'); // 传入重置值
        });

        // 按钮文案修改弹窗
        newInsState.btnEl.addEventListener('click', () => {
            showCustomModal('修改按钮文案', '请输入新的按钮文案：', true, newInsState.data.btnText, (newBtnText) => {
                if (newBtnText !== null && newBtnText.trim() !== '') {
                    newInsState.data.btnText = newBtnText.trim();
                    newInsState.save();
                }
            }, 'Edit Profile'); // 传入重置值
        });

        // 数据修改合并为：一次弹窗，双输入框
        const setupStatClick = (statElement, index) => {
            statElement.addEventListener('click', () => {
                const currentData = newInsState.data.stats[index];
                const defaultLabel = index === 0 ? 'Posts' : (index === 1 ? 'Followers' : 'Following');
                
                showCustomModal('修改统计数据', '请修改上方的数字和下方的标签：', 
                    true, currentData.num, // Input 1 (数字)
                    (values) => {
                        if (values && values.length === 2) {
                            const newNum = values[0].trim();
                            const newLabel = values[1].trim();
                            if (newNum !== '' || newLabel !== '') {
                                newInsState.data.stats[index] = {
                                    num: newNum || currentData.num,
                                    label: newLabel || currentData.label
                                };
                                newInsState.save();
                            }
                        }
                    }, 
                    ['0', defaultLabel], // 传入两个重置值数组
                    true, currentData.label, // Input 2 (标签)
                    '输入数字', '输入标签文案'
                );
            });
        };

        setupStatClick(newInsState.stat1El, 0);
        setupStatClick(newInsState.stat2El, 1);
        setupStatClick(newInsState.stat3El, 2);
    }

    /* -----------------------------------
       区域二：右侧照片画廊组件 (纯净版，无文字)
       ----------------------------------- */
    const photoState = {
        widget: document.getElementById('photo-widget'),
        imgEl: document.getElementById('photo-img'),

        async render() {
            if(!this.imgEl) return;
            
            // 从 IndexedDB 加载相册大图，如果没有则使用纯白透明占位图
            const photoUrl = await ImageStorageManager.loadFromIndexedDB('photo-widget-img');
            this.imgEl.src = photoUrl || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        }
    };

    if(photoState.widget) {
        photoState.render();

        // 点击图片：调出专属大图上传弹窗
        photoState.imgEl.addEventListener('click', (e) => {
            e.stopPropagation(); // 阻止冒泡
            showImageModal('photo-widget-img', (result) => {
                if (result && result.type === 'reset') {
                    photoState.imgEl.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                } else if (result && result.url) {
                    photoState.imgEl.src = result.url;
                }
            });
        });
    }

}

// ==============================
// 4.5 滑动分页逻辑 (Swiper)
// ==============================
function initSwiper() {
    const wrapper = document.getElementById('swiper-wrapper');
    const dots = document.querySelectorAll('.dot');
    if (!wrapper) return;

    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    let currentIndex = 0;
    const maxIndex = 1; // 共2页 (0 和 1)
    const threshold = 50; // 滑动超过 50px 则翻页

    function updateTransform(offset = 0) {
        // 计算基础偏移量 (currentIndex * 100%)，加上手势临时 offset
        wrapper.style.transform = `translateX(calc(-${currentIndex * 100}% + ${offset}px))`;
    }

    function updateDots() {
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }

    // 触摸事件
    wrapper.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        currentX = startX; // 初始化 currentX 防止误触计算上一次滑动的旧坐标
        isDragging = true;
        // 移除动画，跟随手势
        wrapper.style.transition = 'none';
    });

    wrapper.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        currentX = e.touches[0].clientX;
        const diffX = currentX - startX;
        
        // 边缘阻力 (越界时变难滑)
        let offset = diffX;
        if ((currentIndex === 0 && diffX > 0) || (currentIndex === maxIndex && diffX < 0)) {
            offset = diffX * 0.3; 
        }
        updateTransform(offset);
    });

    wrapper.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        isDragging = false;
        // 恢复动画
        wrapper.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        
        const diffX = currentX - startX;
        
        if (diffX < -threshold && currentIndex < maxIndex) {
            currentIndex++; // 向左滑，下一页
        } else if (diffX > threshold && currentIndex > 0) {
            currentIndex--; // 向右滑，上一页
        }
        
        updateTransform(0);
        updateDots();
    });

    // 鼠标事件 (适配电脑测试)
    wrapper.addEventListener('mousedown', (e) => {
        startX = e.clientX;
        currentX = startX; // 初始化 currentX 防止误触计算上一次滑动的旧坐标
        isDragging = true;
        wrapper.style.transition = 'none';
    });

    wrapper.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        currentX = e.clientX;
        const diffX = currentX - startX;
        
        let offset = diffX;
        if ((currentIndex === 0 && diffX > 0) || (currentIndex === maxIndex && diffX < 0)) {
            offset = diffX * 0.3; 
        }
        updateTransform(offset);
    });

    window.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        isDragging = false;
        wrapper.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        
        const diffX = currentX - startX;
        if (Math.abs(diffX) > 10) { // 稍微有滑动就判断，防止误触点击
            if (diffX < -threshold && currentIndex < maxIndex) {
                currentIndex++;
            } else if (diffX > threshold && currentIndex > 0) {
                currentIndex--;
            }
        }
        
        updateTransform(0);
        updateDots();
    });
}


// 控制 Dock 名称的实际显示逻辑
function updateDockNameVisibility() {
    const isDockNameVisible = localStorage.getItem('nrj-show-dock-name') === 'true';
    const dockContainer = document.querySelector('.dock-container');
    if (dockContainer) {
        if (isDockNameVisible) {
            dockContainer.classList.add('show-names');
        } else {
            dockContainer.classList.remove('show-names');
        }
    }
}

// ==============================
// 6. 初始化
// ==============================

window.deferredPrompt = null;

// PWA Service Worker 注册及安装逻辑
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}

// 监听 PWA 安装事件
window.addEventListener('beforeinstallprompt', (e) => {
    // 阻止默认的小提示条
    e.preventDefault();
    // 保存事件对象以便稍后调用
    window.deferredPrompt = e;

    // 检查高级设置中的开关状态，默认开启
    const isPwaPromptEnabled = localStorage.getItem('nrj-pwa-prompt-enabled') !== 'false';
    
    // 检查是否已经在独立模式下运行 (已安装)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

    if (isPwaPromptEnabled && !isStandalone) {
        // 延迟一点显示，确保 UI 已初始化
        setTimeout(() => {
            showCustomModal(
                '安装粘人精', 
                '将粘人精添加到桌面，获得原生 App 般的全屏体验！<br><span style="font-size: 0.85em; color: #888;">(您可以在高级设置中关闭此提示)</span>', 
                false, '', 
                async (result) => {
                    if (window.deferredPrompt) {
                        window.deferredPrompt.prompt();
                        const { outcome } = await window.deferredPrompt.userChoice;
                        console.log(`User response to the install prompt: ${outcome}`);
                        window.deferredPrompt = null;
                    }
                }
            );
        }, 1500);
    }
});

// 监听安装成功事件
window.addEventListener('appinstalled', (evt) => {
    console.log('粘人精已成功安装 PWA');
    window.deferredPrompt = null;
});

// 直接执行或监听DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
} else {
    initAll();
}

window.renderDesktop = renderDesktop;
window.renderDock = renderDock;

async function initAll() {
    // 恢复图标透明度和自定义形状代码设置
    const savedShapeCode = localStorage.getItem('nrj-icon-shape-code');
    if (savedShapeCode) {
        let borderRadiusMatch = savedShapeCode.match(/border-radius\s*:\s*([^;]+);/);
        if(borderRadiusMatch && borderRadiusMatch[1]) {
            document.documentElement.style.setProperty('--app-icon-radius', borderRadiusMatch[1].trim());
        }
        
        let styleTag = document.getElementById('nrj-custom-shape-style');
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = 'nrj-custom-shape-style';
            document.head.appendChild(styleTag);
        }
        styleTag.innerHTML = `
            .app-icon, 
            .dock-icon > img,
            .dock-icon > div,
            .icon-custom-list .app-icon-preview {
                ${savedShapeCode}
            }
        `;
    } else {
        // 如果没有代码版本，兼容一下旧版形状配置
        const savedShape = localStorage.getItem('nrj-icon-shape');
        if (savedShape) {
            document.documentElement.style.setProperty('--app-icon-radius', savedShape);
        }
    }
    
    const savedTrans = localStorage.getItem('nrj-icon-transparency');
    if (savedTrans) {
        document.documentElement.style.setProperty('--glass-bg', `rgba(255, 255, 255, ${savedTrans / 100})`);
    }

    // 初始化壁纸
    initWallpaper();
    initModalWallpaper();

    // 使用新的全局混合渲染逻辑
    await renderDesktop();
    await renderDock();
    // 初始化所有动态生成小组件的事件
    initWidgets();
    // 初始化滑动翻页逻辑
    initSwiper();
    
    // 初始化桌面点击分发引擎 (替代旧的 initSettings / initAdvancedApp)
    initDesktopClicks();
    
    updateDockNameVisibility(); // 初始加载时应用 Dock 名称显隐状态

    // 在初始化阶段同步一次主题颜色
    const savedTheme = localStorage.getItem('nrj-browser-theme-v2');
    if (savedTheme) {
        const root = document.documentElement;
        root.style.setProperty('--browser-theme-color', savedTheme);
        function darkenHex(hex, amount = 0.3) {
            let c = hex.replace('#', '');
            if (c.length === 3) c = c.split('').map(ch => ch + ch).join('');
            let r = parseInt(c.substring(0, 2), 16), g = parseInt(c.substring(2, 4), 16), b = parseInt(c.substring(4, 6), 16);
            r = Math.floor(r * (1 - amount)); g = Math.floor(g * (1 - amount)); b = Math.floor(b * (1 - amount));
            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        }
        root.style.setProperty('--browser-theme-dark', darkenHex(savedTheme, 0.15));
    }
}
