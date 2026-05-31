window.SystemApps = window.SystemApps || {};

window.SystemApps['settings'] = {
    html: `
        <div id="settings-modal" class="settings-modal">
            <div class="settings-backdrop" id="settings-backdrop"></div>
            
            <div class="settings-container">
                <!-- Header -->
                <header class="settings-header">
                    <h1 class="settings-header-title">外观设置</h1>
                    <button class="settings-close-btn" id="settings-close-btn">✕</button>
                </header>

                <!-- Main Content -->
                <main class="settings-main" id="main-settings-body">
                    
                    <!-- Live Preview Area -->
                    <div class="live-preview-area">
                        <div class="live-preview-box" id="wallpaper-preview"></div>
                        <p class="live-preview-label">壁纸预览</p>
                    </div>

                    <!-- 主屏幕 Section -->
                    <div class="settings-section">
                        <h2 class="settings-section-title">主屏幕</h2>
                        <div class="settings-card">
                            <div class="settings-item" id="btn-change-wallpaper">
                                <div class="settings-item-icon">
                                    <i class="ph-bold ph-image"></i>
                                </div>
                                <div class="settings-item-content">
                                    <p class="settings-item-title">更换壁纸</p>
                                </div>
                                <div class="settings-item-right">
                                    <span class="settings-item-value">本地图库</span>
                                    <i class="ph-bold ph-caret-right settings-item-arrow"></i>
                                </div>
                            </div>
                            <div class="settings-item" id="btn-reset-wallpaper">
                                <div class="settings-item-icon">
                                    <i class="ph-bold ph-arrow-counter-clockwise"></i>
                                </div>
                                <div class="settings-item-content">
                                    <p class="settings-item-title" style="color: #ef4444;">重置默认壁纸</p>
                                </div>
                            </div>
                        </div>
                        
                        <h2 class="settings-section-title" style="margin-top: 24px;">大组件壁纸</h2>
                        <div class="settings-card">
                            <div class="settings-item" id="btn-change-widget-main-bg">
                                <div class="settings-item-icon">
                                    <i class="ph-bold ph-image"></i>
                                </div>
                                <div class="settings-item-content">
                                    <p class="settings-item-title">更换大组件壁纸</p>
                                </div>
                                <div class="settings-item-right">
                                    <span class="settings-item-value">本地图库</span>
                                    <i class="ph-bold ph-caret-right settings-item-arrow"></i>
                                </div>
                            </div>
                            <div class="settings-item" id="btn-reset-widget-main-bg">
                                <div class="settings-item-icon">
                                    <i class="ph-bold ph-arrow-counter-clockwise"></i>
                                </div>
                                <div class="settings-item-content">
                                    <p class="settings-item-title" style="color: #ef4444;">重置大组件壁纸</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 聊天界面 Section -->
                    <div class="settings-section">
                        <h2 class="settings-section-title">聊天界面</h2>
                        <!-- 聊天壁纸预览 -->
                        <div class="live-preview-area" style="margin-bottom: 16px;">
                            <div class="live-preview-box" id="global-chat-bg-preview"></div>
                            <p class="live-preview-label">全局聊天壁纸预览</p>
                        </div>
                        <div class="settings-card">
                            <div class="settings-item" id="btn-change-global-chat-bg">
                                <div class="settings-item-icon">
                                    <i class="ph-bold ph-image"></i>
                                </div>
                                <div class="settings-item-content">
                                    <p class="settings-item-title">更换全局壁纸</p>
                                </div>
                                <div class="settings-item-right">
                                    <span class="settings-item-value">本地图库</span>
                                    <i class="ph-bold ph-caret-right settings-item-arrow"></i>
                                </div>
                            </div>
                            <div class="settings-item" id="btn-reset-global-chat-bg">
                                <div class="settings-item-icon">
                                    <i class="ph-bold ph-arrow-counter-clockwise"></i>
                                </div>
                                <div class="settings-item-content">
                                    <p class="settings-item-title" style="color: #ef4444;">重置全局壁纸</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 弹窗界面 Section -->
                    <div class="settings-section">
                        <h2 class="settings-section-title">弹窗界面</h2>
                        <div class="live-preview-area" style="margin-bottom: 16px;">
                            <div class="live-preview-box" id="modal-bg-preview"></div>
                            <p class="live-preview-label">全局弹窗壁纸预览</p>
                        </div>
                        <div class="settings-card">
                            <div class="settings-item" id="btn-change-modal-bg">
                                <div class="settings-item-icon">
                                    <i class="ph-bold ph-image"></i>
                                </div>
                                <div class="settings-item-content">
                                    <p class="settings-item-title">更换弹窗壁纸</p>
                                </div>
                                <div class="settings-item-right">
                                    <span class="settings-item-value">本地图库</span>
                                    <i class="ph-bold ph-caret-right settings-item-arrow"></i>
                                </div>
                            </div>
                            <div class="settings-item" id="btn-reset-modal-bg">
                                <div class="settings-item-icon">
                                    <i class="ph-bold ph-arrow-counter-clockwise"></i>
                                </div>
                                <div class="settings-item-content">
                                    <p class="settings-item-title" style="color: #ef4444;">重置弹窗壁纸</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 应用图标 Section -->
                    <div class="settings-section">
                        <h2 class="settings-section-title">应用图标</h2>
                        <div class="settings-card">
                            <div class="settings-item" id="entry-icon-shape">
                                <div class="settings-item-icon">
                                    <i class="ph-bold ph-square-half"></i>
                                </div>
                                <div class="settings-item-content">
                                    <p class="settings-item-title">图标形状</p>
                                </div>
                                <div class="settings-item-right">
                                    <i class="ph-bold ph-caret-right settings-item-arrow"></i>
                                </div>
                            </div>
                            
                            <div class="settings-item" id="entry-custom-icons">
                                <div class="settings-item-icon">
                                    <i class="ph-bold ph-images"></i>
                                </div>
                                <div class="settings-item-content">
                                    <p class="settings-item-title">单独修改图标</p>
                                </div>
                                <div class="settings-item-right">
                                    <i class="ph-bold ph-caret-right settings-item-arrow"></i>
                                </div>
                            </div>
                            
                            <div class="settings-item" style="cursor: default;">
                                <div class="settings-item-icon">
                                    <i class="ph-bold ph-drop"></i>
                                </div>
                                <div class="settings-item-content">
                                    <p class="settings-item-title">图标透明度</p>
                                    <input type="range" id="icon-transparency-range" min="0" max="100" value="20" style="width: 100%; margin-top: 10px;">
                                </div>
                                <div class="settings-item-right" style="flex-direction: column; align-items: flex-end; gap: 4px;">
                                    <span id="transparency-val" class="settings-item-value">20%</span>
                                    <button id="btn-reset-transparency" style="padding: 2px 6px; font-size: 11px; background: #f4f4f5; border: 1px solid #e4e4e7; border-radius: 4px; color: #52525b; cursor: pointer;">重置</button>
                                </div>
                            </div>
                            
                            <div class="settings-item" style="cursor: default;">
                                <div class="settings-item-icon">
                                    <i class="ph-bold ph-rectangle"></i>
                                </div>
                                <div class="settings-item-content">
                                    <p class="settings-item-title">主页组件透明度</p>
                                    <input type="range" id="widget-main-transparency-range" min="0" max="100" value="20" style="width: 100%; margin-top: 10px;">
                                </div>
                                <div class="settings-item-right" style="flex-direction: column; align-items: flex-end; gap: 4px;">
                                    <span id="widget-main-transparency-val" class="settings-item-value">20%</span>
                                    <button id="btn-reset-widget-main-transparency" style="padding: 2px 6px; font-size: 11px; background: #f4f4f5; border: 1px solid #e4e4e7; border-radius: 4px; color: #52525b; cursor: pointer;">重置</button>
                                </div>
                            </div>

                            <div class="settings-item" style="cursor: default;">
                                <div class="settings-item-icon">
                                    <i class="ph-bold ph-squares-four"></i>
                                </div>
                                <div class="settings-item-content">
                                    <p class="settings-item-title">方形组件透明度</p>
                                    <input type="range" id="widget-square-transparency-range" min="0" max="100" value="20" style="width: 100%; margin-top: 10px;">
                                </div>
                                <div class="settings-item-right" style="flex-direction: column; align-items: flex-end; gap: 4px;">
                                    <span id="widget-square-transparency-val" class="settings-item-value">20%</span>
                                    <button id="btn-reset-widget-square-transparency" style="padding: 2px 6px; font-size: 11px; background: #f4f4f5; border: 1px solid #e4e4e7; border-radius: 4px; color: #52525b; cursor: pointer;">重置</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 界面交互 Section -->
                    <div class="settings-section">
                        <h2 class="settings-section-title">界面交互</h2>
                        <div class="settings-card">
                            <div class="settings-item">
                                <div class="settings-item-icon">
                                    <i class="ph-bold ph-text-t"></i>
                                </div>
                                <div class="settings-item-content">
                                    <p class="settings-item-title">显示底栏应用名称</p>
                                </div>
                                <div class="settings-item-right">
                                    <button type="button" class="settings-toggle" id="dock-name-toggle">
                                        <span class="settings-toggle-slider"></span>
                                    </button>
                                </div>
                            </div>

                            <div class="settings-item">
                                <div class="settings-item-icon">
                                    <i class="ph-bold ph-chat-circle"></i>
                                </div>
                                <div class="settings-item-content">
                                    <p class="settings-item-title">提示框白色主题</p>
                                    <p class="settings-item-desc" style="font-size: 11px; margin-top: 4px;">开启后顶部提示框将变为白底黑字。</p>
                                </div>
                                <div class="settings-item-right">
                                    <button type="button" class="settings-toggle" id="toast-theme-toggle">
                                        <span class="settings-toggle-slider"></span>
                                    </button>
                                </div>
                            </div>
                            
                        </div>
                    </div>

                </main>
                
                <!-- === Popups (Modern Minimalist Crisp Card) === -->

                <!-- 1. 图标形状 Popup -->
                <div class="chat-popup-overlay popup-container" id="shape-popup">
                    <div class="chat-popup-content popup-content" style="max-width: 380px;">
                        <div class="chat-popup-header popup-header">
                            <h3 class="chat-popup-title popup-title">自定义图标形状</h3>
                            <button class="chat-popup-close popup-close-btn btn-close-popup"><i class="ph ph-x"></i></button>
                        </div>
                        
                        <div class="chat-popup-body popup-body">
                            <p class="settings-item-desc" style="margin-bottom: 16px;">选择下方预设形状，或输入 CSS 代码自定义。</p>
                        
                        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; padding: 0 8px;">
                            <button class="shape-preset-btn minimal-btn" data-code="border-radius: 4px;">方形</button>
                            <button class="shape-preset-btn minimal-btn" data-code="border-radius: 18px;">圆角</button>
                            <button class="shape-preset-btn minimal-btn" data-code="border-radius: 50%;">圆形</button>
                            <button class="shape-preset-btn minimal-btn" data-code="border-radius: 50% 0 50% 50%;">泪滴形</button>
                            <button class="shape-preset-btn minimal-btn" data-code="border-radius: 0;\nclip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);">菱形</button>
                            <button class="shape-preset-btn minimal-btn" data-code="border-radius: 4px;\nclip-path: polygon(0% 0%, 35% 0%, 45% 15%, 100% 15%, 100% 100%, 0% 100%);">文件夹</button>
                        </div>

                        <div style="padding: 0 8px; margin-bottom: 16px;">
                            <textarea id="icon-shape-code" class="minimal-textarea" spellcheck="false" placeholder="输入 CSS 代码..."></textarea>
                        </div>
                        
                        </div>
                        <div class="chat-popup-footer popup-actions" style="padding: 16px 24px;">
                            <button class="chat-btn-text popup-btn-cancel" id="btn-reset-shape-code">重置</button>
                            <button class="chat-btn-primary popup-btn-primary" id="btn-apply-shape-code">应用</button>
                        </div>
                    </div>
                </div>

                <!-- 2. 高级独立图标 Popup -->
                <div class="chat-popup-overlay popup-container" id="icons-popup">
                    <div class="chat-popup-content popup-content" style="max-height: 85vh;">
                        <div class="chat-popup-header popup-header">
                            <h3 class="chat-popup-title popup-title">单独修改图标</h3>
                            <button class="chat-popup-close popup-close-btn btn-close-popup"><i class="ph ph-x"></i></button>
                        </div>
                        
                        <div class="chat-popup-body popup-body">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                                <p class="settings-item-desc" style="margin: 0; flex: 1;">点击下方图标覆盖默认字体图标。</p>
                                <button id="btn-reset-all-icons" class="chat-btn-text" style="color: #ef4444;">一键重置</button>
                            </div>
                        
                        <!-- 图标预设方案 -->
                        <div style="background: #f8f8f9; border: 1px solid rgba(0,0,0,0.04); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                <span style="font-size: 13px; font-weight: 600; color: #52525b;">预设方案</span>
                                <button id="btn-save-icon-preset" class="chat-btn-text" style="padding: 4px 8px; font-size: 12px;">+ 保存当前</button>
                            </div>
                            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                                <select id="icon-preset-select" class="persona-input" style="flex: 1; min-width: 140px; padding: 8px 12px;">
                                    <option value="">-- 选择方案 --</option>
                                </select>
                                <div style="display: flex; gap: 8px;">
                                    <button id="btn-apply-icon-preset" class="chat-btn-primary" style="padding: 8px 16px; min-width: 0;">应用</button>
                                    <button id="btn-delete-icon-preset" class="chat-btn-outline" style="padding: 8px 16px; min-width: 0; color: #ef4444; border-color: rgba(239,68,68,0.3);">删除</button>
                                </div>
                            </div>
                        </div>

                        <div class="icon-custom-grid" id="icon-custom-list">
                            <!-- 动态生成 -->
                        </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    `,

    init: function(closeCallback, container) {
        // 绑定关闭事件
        const closeBtn = container.querySelector('#settings-close-btn');
        const backdrop = container.querySelector('#settings-backdrop');
        
        if (closeBtn) closeBtn.addEventListener('click', closeCallback);
        if (backdrop) backdrop.addEventListener('click', closeCallback);

        // Popup 管理逻辑
        const popups = {
            shape: container.querySelector('#shape-popup'),
            icons: container.querySelector('#icons-popup')
        };
        
        const closeAllPopups = () => {
            Object.values(popups).forEach(p => {
                if(p) p.classList.remove('active');
            });
        };

        container.querySelectorAll('.btn-close-popup').forEach(btn => {
            btn.addEventListener('click', closeAllPopups);
        });

        Object.values(popups).forEach(popup => {
            if(popup) {
                popup.addEventListener('click', (e) => {
                    if (e.target === popup) closeAllPopups();
                });
            }
        });

        // 绑定入口打开 Popup
        const entryShape = container.querySelector('#entry-icon-shape');
        const entryIcons = container.querySelector('#entry-custom-icons');
        
        if(entryShape) entryShape.addEventListener('click', () => popups.shape.classList.add('active'));
        if(entryIcons) entryIcons.addEventListener('click', () => popups.icons.classList.add('active'));


        // 初始化设置状态
        const isDockNameVisible = localStorage.getItem('nrj-show-dock-name') === 'true';
        const dockToggle = container.querySelector('#dock-name-toggle');
        if(dockToggle) {
            if(isDockNameVisible) dockToggle.classList.add('active');
            
            dockToggle.addEventListener('click', () => {
                dockToggle.classList.toggle('active');
                const isActive = dockToggle.classList.contains('active');
                localStorage.setItem('nrj-show-dock-name', isActive);
                if (typeof updateDockNameVisibility === 'function') updateDockNameVisibility();
            });
        }

        const isToastLight = localStorage.getItem('nrj-toast-theme') === 'light';
        const toastToggle = container.querySelector('#toast-theme-toggle');
        if(toastToggle) {
            if(isToastLight) toastToggle.classList.add('active');
            
            toastToggle.addEventListener('click', () => {
                toastToggle.classList.toggle('active');
                const isActive = toastToggle.classList.contains('active');
                localStorage.setItem('nrj-toast-theme', isActive ? 'light' : 'dark');
            });
        }

        // 1. 图标形状设置 (混合版：预设按钮 + 代码自定义)
        const shapeBtns = container.querySelectorAll('.shape-btn');
        const shapePresetBtns = container.querySelectorAll('.shape-preset-btn');
        const shapeCodeTextarea = container.querySelector('#icon-shape-code');
        const btnApplyShapeCode = container.querySelector('#btn-apply-shape-code');
        const btnResetShapeCode = container.querySelector('#btn-reset-shape-code');
        const btnImportShapeCode = container.querySelector('#btn-import-shape-code');
        const btnExportShapeCode = container.querySelector('#btn-export-shape-code');
        
        const defaultShapeCode = `/* 默认圆角图标 */\nborder-radius: 18px;`;

        // 辅助函数：根据代码更新预设按钮的激活状态
        const updateShapeBtnsState = (code) => {
            if (!code) return;
            const trimmedCode = code.trim().replace(/\s+/g, '');
            shapeBtns.forEach(b => {
                b.style.background = '#fff';
                b.classList.remove('active');
            });
            if (trimmedCode === 'border-radius:4px;' || trimmedCode === 'border-radius:4px') {
                if (shapeBtns[0]) { shapeBtns[0].style.background = '#eee'; shapeBtns[0].classList.add('active'); }
            } else if (trimmedCode === 'border-radius:18px;' || trimmedCode === 'border-radius:18px') {
                if (shapeBtns[1]) { shapeBtns[1].style.background = '#eee'; shapeBtns[1].classList.add('active'); }
            } else if (trimmedCode === 'border-radius:50%;' || trimmedCode === 'border-radius:50%') {
                if (shapeBtns[2]) { shapeBtns[2].style.background = '#eee'; shapeBtns[2].classList.add('active'); }
            }
        };

        // 应用形状样式到全局
        const applyShapeCode = (code) => {
            localStorage.setItem('nrj-icon-shape-code', code);
            
            // 同步旧的兼容配置
            let borderRadiusMatch = code.match(/border-radius\s*:\s*([^;]+);?/);
            if(borderRadiusMatch && borderRadiusMatch[1]) {
                let radiusVal = borderRadiusMatch[1].trim();
                document.documentElement.style.setProperty('--app-icon-radius', radiusVal);
                localStorage.setItem('nrj-icon-shape', radiusVal);
            }

            // 更新自定义的 style 标签
            let styleTag = document.getElementById('nrj-custom-shape-style');
            if (!styleTag) {
                styleTag = document.createElement('style');
                styleTag.id = 'nrj-custom-shape-style';
                document.head.appendChild(styleTag);
            }
            
            // 针对各种出现图标的地方注入这个 CSS
            styleTag.innerHTML = `
                .app-icon, 
                .dock-icon > img,
                .dock-icon > div,
                .icon-custom-list .app-icon-preview {
                    ${code}
                }
            `;
            
            if (shapeCodeTextarea) {
                shapeCodeTextarea.value = code;
            }
            updateShapeBtnsState(code);
        };

        // 外层小预设按钮点击逻辑
        shapeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const shape = btn.getAttribute('data-shape');
                const newCode = `border-radius: ${shape};`;
                applyShapeCode(newCode);
            });
        });

        // 内层更多预设按钮点击逻辑
        shapePresetBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const code = btn.getAttribute('data-code').replace(/\\n/g, '\n');
                applyShapeCode(code);
            });
            btn.addEventListener('mouseenter', () => btn.style.background = '#f5f5f5');
            btn.addEventListener('mouseleave', () => btn.style.background = '#fff');
        });

        // 初始加载
        const savedShapeCode = localStorage.getItem('nrj-icon-shape-code') || defaultShapeCode;
        applyShapeCode(savedShapeCode);

        if (btnApplyShapeCode) {
            btnApplyShapeCode.addEventListener('mouseenter', () => btnApplyShapeCode.style.background = '#f5f5f5');
            btnApplyShapeCode.addEventListener('mouseleave', () => btnApplyShapeCode.style.background = '#fff');
            btnApplyShapeCode.addEventListener('click', () => {
                const code = shapeCodeTextarea.value.trim();
                applyShapeCode(code);
                if (typeof showCustomModal === 'function') {
                    showCustomModal('应用成功', '桌面和 Dock 栏图标的形状已更新！', false, '', () => {});
                }
            });
        }

        if (btnResetShapeCode) {
            btnResetShapeCode.addEventListener('click', () => {
                applyShapeCode(defaultShapeCode);
            });
        }

        if (btnImportShapeCode) {
            btnImportShapeCode.addEventListener('click', () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.txt,.css';
                input.onchange = (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const code = event.target.result;
                        shapeCodeTextarea.value = code;
                        applyShapeCode(code);
                    };
                    reader.readAsText(file);
                };
                input.click();
            });
        }

        if (btnExportShapeCode) {
            btnExportShapeCode.addEventListener('click', () => {
                const code = shapeCodeTextarea.value;
                const blob = new Blob([code], { type: 'text/css' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'icon-shape.css';
                a.click();
                URL.revokeObjectURL(url);
            });
        }

        // 2. 透明度设置 (图标 / 主页大组件 / 方形小组件)
        const setupTransparencyControl = (rangeId, valId, btnId, storageKey, cssVar, defaultVal = '20') => {
            const rangeInput = container.querySelector(`#${rangeId}`);
            const valDisplay = container.querySelector(`#${valId}`);
            const resetBtn = container.querySelector(`#${btnId}`);
            
            const applyVal = (val) => {
                if (!rangeInput || !valDisplay) return;
                rangeInput.value = val;
                valDisplay.textContent = val + '%';
                localStorage.setItem(storageKey, val);
                document.documentElement.style.setProperty(cssVar, `rgba(255, 255, 255, ${val / 100})`);
            };

            const savedVal = localStorage.getItem(storageKey) || defaultVal;
            applyVal(savedVal);
            
            if(rangeInput) {
                rangeInput.addEventListener('input', (e) => applyVal(e.target.value));
            }

            if(resetBtn) {
                resetBtn.addEventListener('click', () => applyVal(defaultVal));
            }
        };

        // 图标透明度
        setupTransparencyControl('icon-transparency-range', 'transparency-val', 'btn-reset-transparency', 'nrj-icon-transparency', '--glass-bg');
        // 主页大组件透明度
        setupTransparencyControl('widget-main-transparency-range', 'widget-main-transparency-val', 'btn-reset-widget-main-transparency', 'nrj-widget-main-transparency', '--widget-main-glass-bg');
        // 方形小组件透明度
        setupTransparencyControl('widget-square-transparency-range', 'widget-square-transparency-val', 'btn-reset-widget-square-transparency', 'nrj-widget-square-transparency', '--widget-square-glass-bg');



        // 3. 自定义图标列表渲染与绑定 (在图标画廊内)
        const customList = container.querySelector('#icon-custom-list');
        const btnResetAllIcons = container.querySelector('#btn-reset-all-icons');
        
        // 预设方案元素
        const presetSelect = container.querySelector('#icon-preset-select');
        const btnSavePreset = container.querySelector('#btn-save-icon-preset');
        const btnApplyPreset = container.querySelector('#btn-apply-icon-preset');
        const btnDeletePreset = container.querySelector('#btn-delete-icon-preset');
        
        if (customList && window.sysAppData && window.sysDockData) {
            const allApps = [...window.sysAppData, ...window.sysDockData];
            
            // --- 预设方案管理逻辑 ---
            const loadPresets = () => {
                const presets = JSON.parse(localStorage.getItem('nrj-icon-presets') || '[]');
                presetSelect.innerHTML = '<option value="">-- 选择预设方案 --</option>';
                presets.forEach(p => {
                    const opt = document.createElement('option');
                    opt.value = p.id;
                    opt.textContent = p.name;
                    presetSelect.appendChild(opt);
                });
            };
            
            loadPresets();

            if (btnSavePreset) {
                btnSavePreset.addEventListener('mouseenter', () => { btnSavePreset.style.background = '#f5f5f5'; });
                btnSavePreset.addEventListener('mouseleave', () => { btnSavePreset.style.background = '#fff'; });
                
                btnSavePreset.addEventListener('click', () => {
                    if (typeof showCustomModal === 'function') {
                        showCustomModal('保存预设', '给这个图标方案起个名字吧（例如：粉色风格）：', true, '', async (name) => {
                            if (name && name.trim() !== '') {
                                const presetId = 'preset_' + Date.now();
                                const presets = JSON.parse(localStorage.getItem('nrj-icon-presets') || '[]');
                                presets.push({ id: presetId, name: name.trim() });
                                localStorage.setItem('nrj-icon-presets', JSON.stringify(presets));
                                
                                // 复制当前的图标数据到预设命名空间
                                try {
                                    if (window.ImageStorageManager && window.ImageStorageManager.copyInIndexedDB) {
                                        for (let app of allApps) {
                                            const sourceKey = `app-icon-${app.name}`;
                                            const destKey = `${presetId}-app-icon-${app.name}`;
                                            await window.ImageStorageManager.copyInIndexedDB(sourceKey, destKey);
                                        }
                                        loadPresets();
                                        showCustomModal('保存成功', '预设方案已成功保存。', false, '', () => {});
                                    }
                                } catch (e) {
                                    console.error('保存预设失败', e);
                                    showCustomModal('保存失败', '请检查控制台了解详情。', false, '', () => {});
                                }
                            }
                        });
                    }
                });
            }

            if (btnApplyPreset) {
                btnApplyPreset.addEventListener('mouseenter', () => { btnApplyPreset.style.background = '#f5f5f5'; });
                btnApplyPreset.addEventListener('mouseleave', () => { btnApplyPreset.style.background = '#fff'; });
                
                btnApplyPreset.addEventListener('click', async () => {
                    const presetId = presetSelect.value;
                    if (!presetId) {
                        showCustomModal('提示', '请先在下拉框中选择一个预设方案！', false, '', () => {});
                        return;
                    }
                    if (typeof showCustomModal === 'function') {
                        showCustomModal('应用预设', '应用此方案将覆盖当前的图标设置，确定继续吗？<br><br><b>注意：此操作不可撤销，如有需要请先保存当前方案。</b>', false, '', async (confirm) => {
                            if(confirm !== null) { // 用户点击了确认
                                try {
                                    if (window.ImageStorageManager && window.ImageStorageManager.copyInIndexedDB) {
                                        // 1. 先清空现有的图标（避免预设中没有的图标残留）
                                        for (let app of allApps) {
                                            await window.ImageStorageManager.deleteFromIndexedDB(`app-icon-${app.name}`);
                                        }
                                        // 2. 把预设的图标复制到当前
                                        for (let app of allApps) {
                                            const sourceKey = `${presetId}-app-icon-${app.name}`;
                                            const destKey = `app-icon-${app.name}`;
                                            await window.ImageStorageManager.copyInIndexedDB(sourceKey, destKey);
                                        }
                                        
                                        if(window.renderDesktop) await window.renderDesktop();
                                        if(window.renderDock) await window.renderDock();
                                        renderIconList();
                                        
                                        // 不弹框打扰，直接刷新即可
                                    }
                                } catch (e) {
                                    console.error('应用预设失败', e);
                                    showCustomModal('应用失败', '请检查控制台了解详情。', false, '', () => {});
                                }
                            }
                        });
                    }
                });
            }

            if (btnDeletePreset) {
                btnDeletePreset.addEventListener('mouseenter', () => { btnDeletePreset.style.background = '#ffebee'; });
                btnDeletePreset.addEventListener('mouseleave', () => { btnDeletePreset.style.background = '#fff'; });
                
                btnDeletePreset.addEventListener('click', async () => {
                    const presetId = presetSelect.value;
                    if (!presetId) {
                        showCustomModal('提示', '请先在下拉框中选择一个预设方案！', false, '', () => {});
                        return;
                    }
                    if (typeof showCustomModal === 'function') {
                        showCustomModal('删除预设', '确定要彻底删除这个预设方案吗？<br><br><b>说明：删除预设不会影响您当前正在桌面上使用的图标。</b>', false, '', async (confirm) => {
                            if(confirm !== null) {
                                try {
                                    // 从 localStorage 删除记录
                                    let presets = JSON.parse(localStorage.getItem('nrj-icon-presets') || '[]');
                                    presets = presets.filter(p => p.id !== presetId);
                                    localStorage.setItem('nrj-icon-presets', JSON.stringify(presets));
                                    
                                    // 从 IndexedDB 删除图片数据
                                    if (window.ImageStorageManager) {
                                        for (let app of allApps) {
                                            await window.ImageStorageManager.deleteFromIndexedDB(`${presetId}-app-icon-${app.name}`);
                                        }
                                    }
                                    
                                    loadPresets();
                                } catch (e) {
                                    console.error('删除预设失败', e);
                                    showCustomModal('删除失败', '请检查控制台了解详情。', false, '', () => {});
                                }
                            }
                        });
                    }
                });
            }
            // -----------------------------
            
            const renderIconList = async () => {
                customList.innerHTML = '';
                for (let app of allApps) {
                    const key = `app-icon-${app.name}`;
                    let imgUrl = null;
                    try {
                        if (window.ImageStorageManager) {
                            imgUrl = await window.ImageStorageManager.loadFromIndexedDB(key);
                        }
                    } catch(e) {}
                    
                    const item = document.createElement('div');
                    item.style.cssText = 'display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; transition: transform 0.2s;';
                    item.addEventListener('mouseenter', () => item.style.transform = 'scale(1.05)');
                    item.addEventListener('mouseleave', () => item.style.transform = 'scale(1)');
                    
                    const iconBox = document.createElement('div');
                    iconBox.className = 'app-icon-preview';
                    iconBox.style.cssText = `width: 48px; height: 48px; border-radius: var(--app-icon-radius, 12px); background: #f4f4f5; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 1px solid #e4e4e7; box-shadow: 0 1px 2px rgba(0,0,0,0.05);`;
                    
                    if (imgUrl) {
                        iconBox.innerHTML = `<img src="${imgUrl}" style="width:100%; height:100%; object-fit:cover;">`;
                    } else {
                        iconBox.innerHTML = `<span style="font-size: 22px; color: #444; font-weight: bold;">${app.name.substring(0,1)}</span>`;
                    }
                    
                    const label = document.createElement('span');
                    label.style.cssText = 'font-size: 11px; color: #555; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; font-weight: 500;';
                    label.textContent = app.name;
                    
                    item.appendChild(iconBox);
                    item.appendChild(label);
                    
                    item.addEventListener('click', () => {
                        if (typeof showImageModal === 'function') {
                            showImageModal(key, async (result) => {
                                // 更换后刷新
                                if (result && result.type === 'reset') {
                                    if(window.renderDesktop) await window.renderDesktop();
                                    if(window.renderDock) await window.renderDock();
                                    renderIconList();
                                } else if (result && result.url) {
                                    if(window.renderDesktop) await window.renderDesktop();
                                    if(window.renderDock) await window.renderDock();
                                    renderIconList();
                                }
                            });
                        }
                    });
                    
                    customList.appendChild(item);
                }
            };
            
            renderIconList();
            
            if (btnResetAllIcons) {
                // 红色重置按钮的悬浮效果
                btnResetAllIcons.addEventListener('mouseenter', () => { btnResetAllIcons.style.background = '#ffebee'; });
                btnResetAllIcons.addEventListener('mouseleave', () => { btnResetAllIcons.style.background = '#fff'; });
                
                btnResetAllIcons.addEventListener('click', async () => {
                    if(confirm('确定要清除所有自定义图标图片，恢复默认的极简外观吗？')) {
                        try {
                            if (window.ImageStorageManager) {
                                for (let app of allApps) {
                                    await window.ImageStorageManager.deleteFromIndexedDB(`app-icon-${app.name}`);
                                }
                                if(window.renderDesktop) await window.renderDesktop();
                                if(window.renderDock) await window.renderDock();
                                renderIconList();
                            }
                        } catch (e) {
                            console.error('一键清除图标图片失败', e);
                        }
                    }
                });
            }
        }


        // 系统壁纸设置
        const btnChangeWallpaper = container.querySelector('#btn-change-wallpaper');
        const btnResetWallpaper = container.querySelector('#btn-reset-wallpaper');
        const previewBox = container.querySelector('#wallpaper-preview');
        
        // 初始同步预览图
        const appContainer = document.getElementById('app-container');
        if (previewBox && appContainer) {
            previewBox.style.backgroundImage = appContainer.style.backgroundImage;
        }

        if(btnChangeWallpaper) {
            btnChangeWallpaper.addEventListener('click', () => {
                if (typeof showImageModal === 'function') {
                    showImageModal('system-wallpaper', (result) => {
                        if (result && result.type === 'reset') {
                            window.applySystemWallpaper(null);
                        } else if (result && result.url) {
                            window.applySystemWallpaper(result.url);
                        }
                        // 同步到设置里的预览框
                        if (previewBox) {
                            previewBox.style.backgroundImage = result.url ? `url(${result.url})` : 'none';
                        }
                    });
                }
            });
        }

        if(btnResetWallpaper) {
            btnResetWallpaper.addEventListener('click', async () => {
                try {
                    if(window.ImageStorageManager) {
                        await window.ImageStorageManager.deleteFromIndexedDB('system-wallpaper');
                    }
                    window.applySystemWallpaper(null);
                    if (previewBox) previewBox.style.backgroundImage = 'none';
                } catch (error) {
                    console.error("重置壁纸失败:", error);
                }
            });
        }

        // 大组件壁纸设置
        const btnChangeWidgetMainBg = container.querySelector('#btn-change-widget-main-bg');
        const btnResetWidgetMainBg = container.querySelector('#btn-reset-widget-main-bg');

        if(btnChangeWidgetMainBg) {
            btnChangeWidgetMainBg.addEventListener('click', () => {
                if (typeof showImageModal === 'function') {
                    showImageModal('widget-main-bg', async (result) => {
                        const widgetEl = document.getElementById('new-ins-widget');
                        if (result && result.type === 'reset') {
                            if(window.ImageStorageManager) {
                                await window.ImageStorageManager.deleteFromIndexedDB('widget-main-bg');
                                if (widgetEl) widgetEl.style.backgroundImage = 'none';
                            }
                        } else if (result && result.url) {
                            if(window.ImageStorageManager) {
                                await window.ImageStorageManager.saveToIndexedDB('widget-main-bg', result.url);
                                if (widgetEl) {
                                    widgetEl.style.backgroundImage = `url(${result.url})`;
                                    widgetEl.style.backgroundSize = 'cover';
                                    widgetEl.style.backgroundPosition = 'center';
                                }
                            }
                        }
                    });
                }
            });
        }

        if(btnResetWidgetMainBg) {
            btnResetWidgetMainBg.addEventListener('click', async () => {
                try {
                    if(window.ImageStorageManager) {
                        await window.ImageStorageManager.deleteFromIndexedDB('widget-main-bg');
                        const widgetEl = document.getElementById('new-ins-widget');
                        if (widgetEl) widgetEl.style.backgroundImage = 'none';
                        if (typeof showCustomModal === 'function') {
                            showCustomModal('重置成功', '大组件壁纸已清除。', false, '', () => {});
                        }
                    }
                } catch (error) {
                    console.error("重置大组件壁纸失败:", error);
                }
            });
        }

        // 全局聊天壁纸设置
        const btnChangeGlobalChatBg = container.querySelector('#btn-change-global-chat-bg');
        const btnResetGlobalChatBg = container.querySelector('#btn-reset-global-chat-bg');
        const globalChatBgPreview = container.querySelector('#global-chat-bg-preview');

        // 初始化预览图
        const loadGlobalChatBgPreview = async () => {
            if (globalChatBgPreview && window.ImageStorageManager) {
                try {
                    const url = await window.ImageStorageManager.loadFromIndexedDB('global-chat-bg');
                    if (url) {
                        globalChatBgPreview.style.backgroundImage = `url(${url})`;
                    } else {
                        globalChatBgPreview.style.backgroundImage = 'none';
                    }
                } catch(e) {
                    console.error('加载全局聊天壁纸预览失败:', e);
                }
            }
        };
        loadGlobalChatBgPreview();

        if(btnChangeGlobalChatBg) {
            btnChangeGlobalChatBg.addEventListener('click', () => {
                if (typeof showImageModal === 'function') {
                    showImageModal('global-chat-bg', async (result) => {
                        if (result && result.type === 'reset') {
                            if(window.ImageStorageManager) {
                                await window.ImageStorageManager.deleteFromIndexedDB('global-chat-bg');
                                if (globalChatBgPreview) globalChatBgPreview.style.backgroundImage = 'none';
                            }
                        } else if (result && result.url) {
                            if(window.ImageStorageManager) {
                                await window.ImageStorageManager.saveToIndexedDB('global-chat-bg', result.url);
                                if (globalChatBgPreview) globalChatBgPreview.style.backgroundImage = `url(${result.url})`;
                            }
                        }
                    });
                }
            });
        }

        if(btnResetGlobalChatBg) {
            btnResetGlobalChatBg.addEventListener('click', async () => {
                try {
                    if(window.ImageStorageManager) {
                        await window.ImageStorageManager.deleteFromIndexedDB('global-chat-bg');
                        if (globalChatBgPreview) globalChatBgPreview.style.backgroundImage = 'none';
                        if (typeof showCustomModal === 'function') {
                            showCustomModal('重置成功', '全局聊天壁纸已清除。', false, '', () => {});
                        } else {
                            alert('全局聊天壁纸已清除。');
                        }
                    }
                } catch (error) {
                    console.error("重置全局聊天壁纸失败:", error);
                }
            });
        }

        // 弹窗壁纸设置
        const btnChangeModalBg = container.querySelector('#btn-change-modal-bg');
        const btnResetModalBg = container.querySelector('#btn-reset-modal-bg');
        const modalBgPreview = container.querySelector('#modal-bg-preview');

        // 初始化预览图
        const loadModalBgPreview = async () => {
            if (modalBgPreview && window.ImageStorageManager) {
                try {
                    const url = await window.ImageStorageManager.loadFromIndexedDB('modal-bg');
                    if (url) {
                        modalBgPreview.style.backgroundImage = `url(${url})`;
                    } else {
                        modalBgPreview.style.backgroundImage = 'none';
                    }
                } catch(e) {
                    console.error('加载弹窗壁纸预览失败:', e);
                }
            }
        };
        loadModalBgPreview();

        if(btnChangeModalBg) {
            btnChangeModalBg.addEventListener('click', () => {
                if (typeof showImageModal === 'function') {
                    showImageModal('modal-bg', async (result) => {
                        if (result && result.type === 'reset') {
                            if(window.ImageStorageManager) {
                                await window.ImageStorageManager.deleteFromIndexedDB('modal-bg');
                                if (modalBgPreview) modalBgPreview.style.backgroundImage = 'none';
                                if (window.applyModalWallpaper) window.applyModalWallpaper(null);
                            }
                        } else if (result && result.url) {
                            if(window.ImageStorageManager) {
                                await window.ImageStorageManager.saveToIndexedDB('modal-bg', result.url);
                                if (modalBgPreview) modalBgPreview.style.backgroundImage = `url(${result.url})`;
                                if (window.applyModalWallpaper) window.applyModalWallpaper(result.url);
                            }
                        }
                    });
                }
            });
        }

        if(btnResetModalBg) {
            btnResetModalBg.addEventListener('click', async () => {
                try {
                    if(window.ImageStorageManager) {
                        await window.ImageStorageManager.deleteFromIndexedDB('modal-bg');
                        if (modalBgPreview) modalBgPreview.style.backgroundImage = 'none';
                        if (window.applyModalWallpaper) window.applyModalWallpaper(null);
                        if (typeof showCustomModal === 'function') {
                            showCustomModal('重置成功', '弹窗壁纸已清除。', false, '', () => {});
                        }
                    }
                } catch (error) {
                    console.error("重置弹窗壁纸失败:", error);
                }
            });
        }

        // 主题颜色设置相关逻辑转移
        const colorSwatches = container.querySelectorAll('.color-swatch:not(.custom-color-wrapper)');
        const customColorInput = container.querySelector('#custom-color-input');
        const customColorWrapper = container.querySelector('#custom-color-btn');
        
        // 同步当前的活动颜色
        const savedTheme = localStorage.getItem('nrj-browser-theme-v2') || '#FFFFFF';
        const isPreset = Array.from(colorSwatches).some(s => s.getAttribute('data-color').toLowerCase() === savedTheme.toLowerCase());
        
        if (customColorInput) customColorInput.value = savedTheme;
        colorSwatches.forEach(s => s.classList.remove('active'));
        if (customColorWrapper) customColorWrapper.classList.remove('active');

        if (isPreset) {
            const activeSwatch = Array.from(colorSwatches).find(s => s.getAttribute('data-color').toLowerCase() === savedTheme.toLowerCase());
            if (activeSwatch) activeSwatch.classList.add('active');
        } else if (customColorWrapper) {
            customColorWrapper.classList.add('active');
            customColorWrapper.style.backgroundColor = savedTheme;
            const icon = customColorWrapper.querySelector('i');
            if(icon) icon.style.color = '#fff';
        }

        // 绑定事件 (实现 applyThemeColor 的闭包逻辑)
        const applyThemeColor = (color, isCustom = false) => {
            const root = document.documentElement;
            root.style.setProperty('--browser-theme-color', color);
            // 简单处理深浅色
            function getBrightness(hex) {
                let c = hex.replace('#', '');
                if (c.length === 3) c = c.split('').map(ch => ch + ch).join('');
                let r = parseInt(c.substring(0, 2), 16);
                let g = parseInt(c.substring(2, 4), 16);
                let b = parseInt(c.substring(4, 6), 16);
                return (r * 299 + g * 587 + b * 114) / 1000;
            }
            function hexToRgba(hex, alpha) {
                let c = hex.replace('#', '');
                if (c.length === 3) c = c.split('').map(ch => ch + ch).join('');
                let r = parseInt(c.substring(0, 2), 16);
                let g = parseInt(c.substring(2, 4), 16);
                let b = parseInt(c.substring(4, 6), 16);
                return `rgba(${r}, ${g}, ${b}, ${alpha})`;
            }
            function darkenHex(hex, amount = 0.3) {
                let c = hex.replace('#', '');
                if (c.length === 3) c = c.split('').map(ch => ch + ch).join('');
                let r = parseInt(c.substring(0, 2), 16);
                let g = parseInt(c.substring(2, 4), 16);
                let b = parseInt(c.substring(4, 6), 16);
                r = Math.floor(r * (1 - amount));
                g = Math.floor(g * (1 - amount));
                b = Math.floor(b * (1 - amount));
                return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
            }

            root.style.setProperty('--browser-theme-dark', darkenHex(color, 0.15));
            const textColor = getBrightness(color) > 180 ? '#333333' : '#ffffff';
            root.style.setProperty('--browser-text-color', textColor);
            
            if (color.toLowerCase() === '#ffffff') {
                 root.style.setProperty('--browser-bg-color', '#f0f0f5');
                 root.style.setProperty('--browser-sidebar-color', '#ebebeb');
            } else {
                 root.style.setProperty('--browser-bg-color', hexToRgba(color, 0.05));
                 root.style.setProperty('--browser-sidebar-color', hexToRgba(color, 0.15));
            }
            
            localStorage.setItem('nrj-browser-theme-v2', color);

            colorSwatches.forEach(s => s.classList.remove('active'));
            if (customColorWrapper) customColorWrapper.classList.remove('active');

            if (!isCustom) {
                const activeSwatch = Array.from(colorSwatches).find(s => s.getAttribute('data-color').toLowerCase() === color.toLowerCase());
                if (activeSwatch) activeSwatch.classList.add('active');
            } else {
                if (customColorWrapper) {
                    customColorWrapper.classList.add('active');
                    customColorWrapper.style.backgroundColor = color;
                    const icon = customColorWrapper.querySelector('i');
                    if(icon) icon.style.color = '#fff';
                }
            }
        };

        colorSwatches.forEach(swatch => {
            swatch.addEventListener('click', () => {
                const color = swatch.getAttribute('data-color');
                if (customColorWrapper) {
                    customColorWrapper.style.backgroundColor = '#eee';
                    const icon = customColorWrapper.querySelector('i');
                    if(icon) icon.style.color = '#555';
                }
                applyThemeColor(color, false);
            });
        });

        if (customColorInput) {
            customColorInput.addEventListener('input', (e) => {
                applyThemeColor(e.target.value, true);
            });
        }
    },

    destroy: function(container) {
        // 解绑事件、清理定时器（这里很多是在DOM内绑定的，随DOM销毁而销毁即可）
        console.log('Settings app destroyed');
    }
};
