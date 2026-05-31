window.SystemApps = window.SystemApps || {};

window.SystemApps['worldbook'] = {
    html: `
        <div id="worldbook-modal" class="settings-modal">
            <div class="settings-backdrop" id="worldbook-backdrop"></div>
            
            <div class="settings-container">
                <!-- 真正的极简标题栏 -->
                <header class="settings-header">
                    <div style="position: absolute; left: 24px; top: 24px; display: none;" id="wb-back-btn">
                        <button class="settings-close-btn" style="position: static;"><i class="ph-bold ph-arrow-left"></i></button>
                    </div>
                    <h1 class="settings-header-title">世界书</h1>
                    <button class="settings-close-btn" id="worldbook-close-btn">✕</button>
                </header>

                <!-- 隐藏的文件选择器 -->
                <input type="file" id="wb-import-file" accept=".txt,.docx,.json,.zip" style="display: none;">

                <!-- Main Content -->
                <main class="settings-main">
                    
                    <!-- === 页面 1: 世界书列表页 === -->
                    <div id="wb-page-list" style="display: flex; flex-direction: column;">
                        
                        <!-- 页面级操作栏 (右上角) -->
                        <div class="settings-section" style="margin-top: 10px; margin-bottom: 20px;">
                            <div style="display: flex; justify-content: flex-end; align-items: center; gap: 8px; position: relative;">
                                <button id="btn-create-wb" class="minimal-btn minimal-btn-primary" style="padding: 8px 16px; font-size: 13px; border-radius: 12px; background-color: #27272a;">+ 新建</button>
                                <button id="wb-menu-btn" class="minimal-btn" style="padding: 8px 12px;"><i class="ph-bold ph-dots-three-vertical"></i></button>
                                
                                <!-- 下拉菜单 -->
                                <div id="wb-dropdown-menu" style="display: none; position: absolute; right: 0; top: 100%; margin-top: 8px; background: #ffffff; border: 1px solid rgba(228, 228, 231, 0.6); border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); width: 150px; z-index: 101; overflow: hidden;">
                                    <div id="wb-menu-create-group" style="padding: 14px 16px; cursor: pointer; color: #18181b; font-size: 14px; border-bottom: 1px solid rgba(244, 244, 245, 0.8); transition: background-color 0.2s;">新建分组</div>
                                    <div id="wb-menu-manage-groups" style="padding: 14px 16px; cursor: pointer; color: #18181b; font-size: 14px; border-bottom: 1px solid rgba(244, 244, 245, 0.8); transition: background-color 0.2s;">分组管理</div>
                                    <div id="wb-menu-import" style="padding: 14px 16px; cursor: pointer; color: #18181b; font-size: 14px; border-bottom: 1px solid rgba(244, 244, 245, 0.8); transition: background-color 0.2s;">导入世界书</div>
                                    <div id="wb-menu-batch-export" style="padding: 14px 16px; cursor: pointer; color: #18181b; font-size: 14px; border-bottom: 1px solid rgba(244, 244, 245, 0.8); transition: background-color 0.2s;">批量导出</div>
                                    <div id="wb-menu-batch-move" style="padding: 14px 16px; cursor: pointer; color: #18181b; font-size: 14px; border-bottom: 1px solid rgba(244, 244, 245, 0.8); transition: background-color 0.2s;">批量移动</div>
                                    <div id="wb-menu-batch-delete" style="padding: 14px 16px; cursor: pointer; color: #ef4444; font-size: 14px; transition: background-color 0.2s;">批量删除</div>
                                </div>
                            </div>
                        </div>

                        <!-- 居中弹窗式的分组管理面板 -->
                        <div id="group-manage-panel" class="custom-modal">
                            <div class="modal-backdrop modern-backdrop" id="group-manage-backdrop"></div>
                            <div class="modern-modal-content" style="padding: 24px; text-align: left; background: #ffffff; border-radius: 24px; position: relative; z-index: 10; width: 85%; max-width: 400px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); max-height: 80vh; display: flex; flex-direction: column;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                                    <h3 style="margin: 0; font-size: 16px; color: #18181b; font-weight: 600;">分组管理</h3>
                                    <button id="group-manage-close" class="minimal-btn" style="padding: 4px 8px; margin-right: -8px; font-size: 16px;">✕</button>
                                </div>
                                
                                <div id="group-manage-list" style="display: flex; flex-direction: column; gap: 8px; flex: 1; overflow-y: auto; margin-bottom: 16px; padding-right: 4px;">
                                    <!-- JS 渲染 -->
                                </div>

                                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(228, 228, 231, 0.6); padding-top: 16px;">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <button id="group-manage-select-all" class="minimal-btn" style="font-size: 13px;">全选</button>
                                        <span id="group-manage-count" style="font-size: 12px; color: #a1a1aa;">已选 0 项</span>
                                    </div>
                                    <button id="group-manage-delete-btn" class="minimal-btn minimal-btn-danger" style="padding: 8px 16px; font-size: 13px; border-radius: 12px;" disabled>删除选中</button>
                                </div>
                            </div>
                        </div>

                        <!-- 居中弹窗式的分组新建/编辑面板 -->
                        <div id="group-create-panel" class="custom-modal">
                            <div class="modal-backdrop modern-backdrop" id="group-new-backdrop"></div>
                            <div class="modern-modal-content" style="padding: 24px; text-align: left; background: #ffffff; border-radius: 24px; position: relative; z-index: 10; width: 85%; max-width: 320px; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
                                <h3 id="group-modal-title" style="margin: 0 0 16px 0; font-size: 16px; color: #18181b; font-weight: 600;">新建分组</h3>
                                <input type="text" id="group-new-name" class="modern-input" placeholder="请输入分组名称..." style="background: #f4f4f5; border: none; padding: 16px; font-size: 15px; border-radius: 12px; outline: none; width: 100%; box-sizing: border-box;" />
                                <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
                                    <button id="group-new-cancel" class="modern-btn-cancel" style="border: none; background: #f4f4f5; color: #18181b; padding: 10px 20px; border-radius: 12px; font-size: 14px; font-weight: 500; cursor: pointer;">取消</button>
                                    <button id="group-new-save" class="modern-btn-confirm" style="background: #18181b; color: #ffffff; border: none; padding: 10px 20px; border-radius: 12px; font-size: 14px; font-weight: 500; cursor: pointer;">保存</button>
                                </div>
                            </div>
                        </div>

                        <!-- 居中弹窗式的世界书新建面板 -->
                        <div id="wb-create-panel" class="custom-modal">
                            <div class="modal-backdrop modern-backdrop" id="wb-new-backdrop"></div>
                            <div class="modern-modal-content" style="padding: 24px; text-align: left; background: #ffffff; border-radius: 24px; position: relative; z-index: 10; width: 85%; max-width: 320px; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
                                <h3 style="margin: 0 0 16px 0; font-size: 16px; color: #18181b; font-weight: 600;">新建世界书</h3>
                                <input type="text" id="wb-new-name" class="modern-input" placeholder="请输入世界书名称..." style="background: #f4f4f5; border: none; padding: 16px; font-size: 15px; border-radius: 12px; outline: none; width: 100%; box-sizing: border-box; margin-bottom: 12px;" />
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <span style="font-size: 13px; color: #52525b; white-space: nowrap;">分组:</span>
                                    <select id="wb-new-group-select" class="modern-input" style="background: #f4f4f5; border: none; padding: 10px 16px; font-size: 14px; border-radius: 12px; outline: none; width: 100%; box-sizing: border-box;">
                                    </select>
                                </div>
                                <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
                                    <button id="wb-new-cancel" class="modern-btn-cancel" style="border: none; background: #f4f4f5; color: #18181b; padding: 10px 20px; border-radius: 12px; font-size: 14px; font-weight: 500; cursor: pointer;">取消</button>
                                    <button id="wb-new-save" class="modern-btn-confirm" style="background: #18181b; color: #ffffff; border: none; padding: 10px 20px; border-radius: 12px; font-size: 14px; font-weight: 500; cursor: pointer;">保存</button>
                                </div>
                            </div>
                        </div>

                        <!-- 居中弹窗式的批量移动面板 -->
                        <div id="wb-move-panel" class="custom-modal">
                            <div class="modal-backdrop modern-backdrop" id="wb-move-backdrop"></div>
                            <div class="modern-modal-content" style="padding: 24px; text-align: left; background: #ffffff; border-radius: 24px; position: relative; z-index: 10; width: 85%; max-width: 320px; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
                                <h3 style="margin: 0 0 16px 0; font-size: 16px; color: #18181b; font-weight: 600;">移动到分组</h3>
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <span style="font-size: 13px; color: #52525b; white-space: nowrap;">选择目标:</span>
                                    <select id="wb-move-group-select" class="modern-input" style="background: #f4f4f5; border: none; padding: 10px 16px; font-size: 14px; border-radius: 12px; outline: none; width: 100%; box-sizing: border-box;">
                                    </select>
                                </div>
                                <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
                                    <button id="wb-move-cancel" class="modern-btn-cancel" style="border: none; background: #f4f4f5; color: #18181b; padding: 10px 20px; border-radius: 12px; font-size: 14px; font-weight: 500; cursor: pointer;">取消</button>
                                    <button id="wb-move-save" class="modern-btn-confirm" style="background: #18181b; color: #ffffff; border: none; padding: 10px 20px; border-radius: 12px; font-size: 14px; font-weight: 500; cursor: pointer;">确定</button>
                                </div>
                            </div>
                        </div>

                        <!-- 世界书列表容器 (动态呈现白底卡片或透明空状态) -->
                        <div id="wb-list-container" style="display: flex; flex-direction: column; overflow: hidden; gap: 16px;">
                            <!-- JS 动态渲染 -->
                        </div>
                        
                        <!-- 底部批量操作浮窗 -->
                        <div id="wb-batch-bar" style="display: none; position: fixed; bottom: 0; left: 0; right: 0; background: rgba(249, 249, 251, 0.95); border-top: 1px solid rgba(228, 228, 231, 0.6); padding: 16px 24px; justify-content: space-between; align-items: center; z-index: 50;">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <button id="wb-batch-select-all" class="minimal-btn">全选</button>
                                <span id="wb-batch-count" style="font-size: 13px; color: #52525b;">已选 0 项</span>
                            </div>
                            <div style="display: flex; gap: 12px;">
                                <button id="wb-batch-cancel" class="minimal-btn">取消</button>
                                <button id="wb-batch-action-btn" class="minimal-btn minimal-btn-danger">操作</button>
                            </div>
                        </div>
                    </div>

                    <!-- === 页面 2: 单个世界书详情页 (条目列表) === -->
                    <div id="wb-page-detail" style="display: none; flex-direction: column;">
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; margin-top: 10px;">
                            <div style="display: flex; flex-direction: column; gap: 4px;">
                                <h2 id="current-wb-title" style="margin: 0; font-size: 18px; color: #18181b; font-weight: 600; letter-spacing: 0.025em;">世界书名称</h2>
                                <span id="current-wb-count" style="font-size: 13px; color: #a1a1aa;">0 个条目</span>
                            </div>
                            <div style="display: flex; gap: 10px;">
                                <button id="btn-create-entry" class="minimal-btn minimal-btn-primary" style="padding: 8px 16px; font-size: 13px; border-radius: 12px; background-color: #27272a;">+ 新增条目</button>
                            </div>
                        </div>

                        <!-- 居中弹窗式条目新建面板 -->
                        <div id="entry-create-panel" class="custom-modal">
                            <div class="modal-backdrop modern-backdrop" id="entry-new-backdrop"></div>
                            <div class="modern-modal-content" style="padding: 24px; text-align: left; background: #ffffff; border-radius: 24px; position: relative; z-index: 10; width: 85%; max-width: 320px; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
                                <h3 style="margin: 0 0 16px 0; font-size: 16px; color: #18181b; font-weight: 600;">新增条目</h3>
                                <div style="display: flex; flex-direction: column; gap: 12px;">
                                    <input type="text" id="entry-new-keyword" class="modern-input" placeholder="关键字 (逗号分隔)" style="background: #f4f4f5; border: none; padding: 16px; font-size: 15px; border-radius: 12px; outline: none; width: 100%; box-sizing: border-box;" />
                                    <div style="display: flex; align-items: center; gap: 12px;">
                                        <span style="font-size: 13px; color: #52525b; white-space: nowrap;">权重:</span>
                                        <input type="number" id="entry-new-weight" class="modern-input" value="100" placeholder="权重 (默认100)" style="background: #f4f4f5; border: none; padding: 10px 16px; font-size: 14px; border-radius: 12px; outline: none; width: 100%; box-sizing: border-box;" />
                                    </div>
                                    <textarea id="entry-new-content" class="modern-input" placeholder="请输入内容设定..." style="background: #f4f4f5; border: none; padding: 16px; font-size: 15px; min-height: 100px; resize: none; border-radius: 12px; outline: none; width: 100%; box-sizing: border-box;"></textarea>
                                </div>
                                <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
                                    <button id="entry-new-cancel" class="modern-btn-cancel" style="border: none; background: #f4f4f5; color: #18181b; padding: 10px 20px; border-radius: 12px; font-size: 14px; font-weight: 500; cursor: pointer;">取消</button>
                                    <button id="entry-new-save" class="modern-btn-confirm" style="background: #18181b; color: #ffffff; border: none; padding: 10px 20px; border-radius: 12px; font-size: 14px; font-weight: 500; cursor: pointer;">保存</button>
                                </div>
                            </div>
                        </div>

                        <!-- 居中弹窗式条目编辑面板 -->
                        <div id="entry-edit-panel" class="custom-modal">
                            <div class="modal-backdrop modern-backdrop" id="entry-edit-backdrop"></div>
                            <div class="modern-modal-content" style="padding: 24px; text-align: left; background: #ffffff; border-radius: 24px; position: relative; z-index: 10; width: 85%; max-width: 360px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); max-height: 80vh; display: flex; flex-direction: column;">
                                <h3 style="margin: 0 0 16px 0; font-size: 16px; color: #18181b; font-weight: 600;">编辑条目</h3>
                                <div style="display: flex; flex-direction: column; gap: 12px; flex: 1; overflow-y: auto; padding-right: 4px;">
                                    <input type="text" id="entry-edit-keyword" class="modern-input" placeholder="关键字 (逗号分隔)" style="background: #f4f4f5; border: none; padding: 16px; font-size: 15px; border-radius: 12px; outline: none; width: 100%; box-sizing: border-box;" />
                                    <div style="display: flex; align-items: center; gap: 12px;">
                                        <span style="font-size: 13px; color: #52525b; white-space: nowrap;">权重:</span>
                                        <input type="number" id="entry-edit-weight" class="modern-input" placeholder="权重" style="background: #f4f4f5; border: none; padding: 10px 16px; font-size: 14px; border-radius: 12px; outline: none; width: 100%; box-sizing: border-box;" />
                                    </div>
                                    <textarea id="entry-edit-content" class="modern-input" placeholder="请输入内容设定..." style="background: #f4f4f5; border: none; padding: 16px; font-size: 15px; min-height: 150px; resize: none; border-radius: 12px; outline: none; width: 100%; box-sizing: border-box; flex: 1;"></textarea>
                                </div>
                                <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
                                    <button id="entry-edit-cancel" class="modern-btn-cancel" style="border: none; background: #f4f4f5; color: #18181b; padding: 10px 20px; border-radius: 12px; font-size: 14px; font-weight: 500; cursor: pointer;">取消</button>
                                    <button id="entry-edit-save" class="modern-btn-confirm" style="background: #18181b; color: #ffffff; border: none; padding: 10px 20px; border-radius: 12px; font-size: 14px; font-weight: 500; cursor: pointer;">保存</button>
                                </div>
                            </div>
                        </div>

                        <!-- 条目列表容器 -->
                        <div id="wb-entries-container" style="display: flex; flex-direction: column; border-radius: 24px; overflow: hidden;">
                            <!-- JS 动态渲染 -->
                        </div>
                    </div>

                </main>
            </div>
        </div>

        <style>
            .wb-group {
                background: #ffffff;
                border-radius: 24px;
                box-shadow: 0 4px 20px -10px rgba(0, 0, 0, 0.03);
                overflow: hidden;
            }
            .wb-group-header {
                padding: 16px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                background-color: #fafafa;
                border-bottom: 1px solid rgba(244, 244, 245, 0.8);
                cursor: pointer;
                transition: background-color 0.2s;
            }
            .wb-group-header:hover {
                background-color: #f4f4f5;
            }
            .wb-group-title {
                font-size: 14px;
                font-weight: 600;
                color: #27272a;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .wb-group-content {
                display: flex;
                flex-direction: column;
            }

            /* 复用极简列表项样式 */
            .wb-card, .entry-card {
                background-color: #ffffff;
                padding: 16px 20px;
                display: flex;
                transition: background-color 0.2s;
                border-bottom: 1px solid rgba(244, 244, 245, 0.8);
            }
            .wb-card {
                align-items: center;
                cursor: pointer;
            }
            .wb-card:hover, .entry-card:hover {
                background-color: rgba(250, 250, 250, 0.8);
            }
            .entry-card {
                flex-direction: column;
                gap: 0;
            }
            .wb-card:last-child, .entry-card:last-child {
                border-bottom: none;
            }

            .wb-card-title {
                font-size: 15px;
                font-weight: 500;
                color: #27272a;
                letter-spacing: 0.025em;
                margin-bottom: 4px;
            }
            .wb-card-desc {
                font-size: 12px;
                color: #a1a1aa;
            }

            .view-mode-container {
                display: flex;
                width: 100%;
                justify-content: space-between;
                align-items: center;
            }
            .edit-mode-container {
                display: none;
                flex-direction: column;
                gap: 16px;
                width: 100%;
            }
            .entry-card .view-mode-container {
                flex-direction: column;
                align-items: stretch;
                gap: 16px;
            }

            .entry-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .entry-keyword {
                font-weight: 500;
                font-size: 15px;
                color: #27272a;
                letter-spacing: 0.025em;
            }
            .entry-meta {
                font-size: 12px;
                color: #71717a;
                margin-top: 4px;
                display: flex;
                gap: 12px;
                flex-wrap: wrap;
            }
            .entry-card .view-mode-container {
                cursor: pointer;
            }
            .entry-content {
                font-size: 13px;
                color: #52525b;
                line-height: 1.6;
                white-space: pre-wrap;
                word-break: break-word;
                display: -webkit-box;
                -webkit-line-clamp: 3;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }
            .entry-actions {
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-top: 1px solid rgba(244, 244, 245, 0.8);
                padding-top: 16px;
            }
            
            .wb-checkbox, .group-checkbox {
                width: 20px;
                height: 20px;
                cursor: pointer;
                accent-color: #18181b;
                margin-right: 16px;
                display: none;
            }
            .batch-mode .wb-checkbox, .batch-mode .group-checkbox {
                display: block;
            }
            .batch-mode .wb-card-actions {
                display: none !important;
            }

            /* Custom Scrollbar for entry content */
            .entry-content::-webkit-scrollbar {
                width: 4px;
            }
            .entry-content::-webkit-scrollbar-thumb {
                background-color: #e4e4e7;
                border-radius: 2px;
            }
        </style>
    `,

    init: function(closeCallback, container) {
        // --- 基础窗口事件绑定 ---
        const closeBtn = container.querySelector('#worldbook-close-btn');
        const backdrop = container.querySelector('#worldbook-backdrop');
        
        if (closeBtn) closeBtn.addEventListener('click', closeCallback);
        if (backdrop) backdrop.addEventListener('click', closeCallback);

        // --- 数据存储逻辑 ---
        const WB_STORAGE_KEY = 'nrj-worldbooks';
        const WB_GROUPS_KEY = 'nrj-wb-groups';
        let worldbooks = [];
        let wbGroups = [];
        try {
            worldbooks = JSON.parse(localStorage.getItem(WB_STORAGE_KEY)) || [];
            wbGroups = JSON.parse(localStorage.getItem(WB_GROUPS_KEY)) || [];
        } catch(e) {
            console.error("加载世界书数据失败", e);
        }

        if (wbGroups.length === 0) {
            wbGroups.push({ id: 'default', name: '默认分组' });
        }

        // 确保旧数据有 groupId
        let needSave = false;
        worldbooks.forEach(wb => {
            if (!wb.groupId) {
                wb.groupId = 'default';
                needSave = true;
            }
        });

        const saveWorldbooks = () => {
            localStorage.setItem(WB_STORAGE_KEY, JSON.stringify(worldbooks));
        };
        const saveGroups = () => {
            localStorage.setItem(WB_GROUPS_KEY, JSON.stringify(wbGroups));
        };

        if(needSave) saveWorldbooks();
        saveGroups();

        // --- 工具：统一替换原生的 Alert 和 Confirm ---
        const applyModalTheme = (modal, type) => {
            modal.classList.remove('theme-success', 'theme-danger', 'theme-info');
            const iconEl = document.getElementById('modal-icon');
            if (iconEl) {
                if (type === 'danger' || type === 'error') {
                    modal.classList.add('theme-danger');
                    iconEl.className = 'ph-fill ph-warning-circle';
                } else if (type === 'info') {
                    modal.classList.add('theme-info');
                    iconEl.className = 'ph-fill ph-info';
                } else {
                    modal.classList.add('theme-success');
                    iconEl.className = 'ph-fill ph-check-circle';
                }
            }
        };

        const showAlert = (message, title = "提示", type = "success") => {
            const modal = document.getElementById('custom-modal');
            if(!modal) { window.alert(message); return; }
            applyModalTheme(modal, type);
            document.getElementById('modal-title').textContent = title;
            document.getElementById('modal-message').textContent = message;
            document.getElementById('modal-input').style.display = 'none';
            document.getElementById('modal-input-2').style.display = 'none';
            
            const btnCancel = document.getElementById('modal-cancel');
            const btnConfirm = document.getElementById('modal-confirm');
            const btnReset = document.getElementById('modal-reset');
            
            btnCancel.style.display = 'none';
            btnReset.style.display = 'none';
            btnConfirm.style.display = 'block';
            btnConfirm.className = type === 'danger' ? 'modern-btn-danger' : 'modern-btn-confirm';
            btnConfirm.textContent = '确定';
            
            modal.classList.add('active');
            
            return new Promise(resolve => {
                const onConfirm = () => {
                    btnConfirm.removeEventListener('click', onConfirm);
                    modal.classList.remove('active');
                    resolve(true);
                };
                btnConfirm.addEventListener('click', onConfirm);
            });
        };

        const showConfirm = (message, title = "请确认", type = "info") => {
            const modal = document.getElementById('custom-modal');
            if(!modal) { return Promise.resolve(window.confirm(message)); }
            applyModalTheme(modal, type);
            document.getElementById('modal-title').textContent = title;
            document.getElementById('modal-message').textContent = message;
            document.getElementById('modal-input').style.display = 'none';
            document.getElementById('modal-input-2').style.display = 'none';
            
            const btnCancel = document.getElementById('modal-cancel');
            const btnConfirm = document.getElementById('modal-confirm');
            const btnReset = document.getElementById('modal-reset');
            
            btnCancel.style.display = 'block';
            btnCancel.textContent = '取消';
            btnReset.style.display = 'none';
            btnConfirm.style.display = 'block';
            btnConfirm.className = type === 'danger' ? 'modern-btn-danger' : 'modern-btn-confirm';
            btnConfirm.textContent = type === 'danger' ? '确认删除' : '确定';
            
            modal.classList.add('active');
            
            return new Promise(resolve => {
                const onConfirm = () => { cleanup(); resolve(true); };
                const onCancel = () => { cleanup(); resolve(false); };
                
                const cleanup = () => {
                    btnConfirm.removeEventListener('click', onConfirm);
                    btnCancel.removeEventListener('click', onCancel);
                    modal.classList.remove('active');
                };
                
                btnConfirm.addEventListener('click', onConfirm);
                btnCancel.addEventListener('click', onCancel);
            });
        };

        // --- 批量操作状态 ---
        let isBatchMode = false;
        let batchModeType = ''; // 'delete', 'export', 'move'
        let selectedWbIds = new Set();
        
        const batchBar = container.querySelector('#wb-batch-bar');
        const batchCountLabel = container.querySelector('#wb-batch-count');
        const batchSelectAllBtn = container.querySelector('#wb-batch-select-all');
        const batchCancelBtn = container.querySelector('#wb-batch-cancel');
        const batchActionBtn = container.querySelector('#wb-batch-action-btn');
        
        // 菜单与下拉
        const menuBtn = container.querySelector('#wb-menu-btn');
        const dropdownMenu = container.querySelector('#wb-dropdown-menu');
        const menuCreateGroup = container.querySelector('#wb-menu-create-group');
        const menuManageGroups = container.querySelector('#wb-menu-manage-groups');
        const menuImport = container.querySelector('#wb-menu-import');
        const menuBatchExport = container.querySelector('#wb-menu-batch-export');
        const menuBatchMove = container.querySelector('#wb-menu-batch-move');
        const menuBatchDelete = container.querySelector('#wb-menu-batch-delete');

        if (menuBtn && dropdownMenu) {
            menuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdownMenu.style.display = dropdownMenu.style.display === 'none' ? 'block' : 'none';
            });
            document.addEventListener('click', () => {
                dropdownMenu.style.display = 'none';
            });
            
            const menuItems = dropdownMenu.querySelectorAll('div');
            menuItems.forEach(item => {
                item.addEventListener('mouseenter', () => {
                    item.style.backgroundColor = 'rgba(244, 244, 245, 0.8)';
                });
                item.addEventListener('mouseleave', () => {
                    item.style.backgroundColor = 'transparent';
                });
            });
        }

        const enterBatchMode = (type) => {
            if (worldbooks.length === 0) {
                showAlert(type === 'delete' ? '暂无世界书可删除' : (type === 'move' ? '暂无世界书可移动' : '暂无世界书可导出'), "此页面显示", "info");
                return;
            }
            
            isBatchMode = true;
            batchModeType = type;
            selectedWbIds.clear();
            batchBar.style.display = 'flex';
            
            if (type === 'delete') {
                batchActionBtn.textContent = '删除';
                batchActionBtn.className = 'minimal-btn minimal-btn-danger';
            } else if (type === 'export') {
                batchActionBtn.textContent = '导出';
                batchActionBtn.className = 'minimal-btn minimal-btn-primary';
            } else if (type === 'move') {
                batchActionBtn.textContent = '移动';
                batchActionBtn.className = 'minimal-btn minimal-btn-primary';
            }
            
            updateBatchCount();
            renderWbList();
        };

        if (menuBatchDelete) {
            menuBatchDelete.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdownMenu.style.display = 'none';
                enterBatchMode('delete');
            });
        }
        if (menuBatchExport) {
            menuBatchExport.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdownMenu.style.display = 'none';
                enterBatchMode('export');
            });
        }
        if (menuBatchMove) {
            menuBatchMove.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdownMenu.style.display = 'none';
                enterBatchMode('move');
            });
        }

        const handleBatchExport = () => {
            if (selectedWbIds.size === 0) return;
            const selectedWbs = worldbooks.filter(w => selectedWbIds.has(w.id));
            const exportData = {
                type: "nrj_worldbook_export",
                version: "1.0",
                data: selectedWbs
            };
            const jsonStr = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `世界书备份_${selectedWbIds.size}项_${new Date().getTime()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            exitBatchMode();
        };

        const handleBatchDelete = async () => {
            if (selectedWbIds.size === 0) return;
            const confirmed = await showConfirm(`确定要删除选中的 ${selectedWbIds.size} 本世界书吗？这将会彻底删除内部所有条目。`, "操作确认", "danger");
            if (confirmed) {
                worldbooks = worldbooks.filter(w => !selectedWbIds.has(w.id));
                saveWorldbooks();
                exitBatchMode();
            }
        };

        const wbMovePanel = container.querySelector('#wb-move-panel');
        const wbMoveGroupSelect = container.querySelector('#wb-move-group-select');
        
        const handleBatchMove = () => {
            if (selectedWbIds.size === 0) return;
            // 渲染下拉选项
            wbMoveGroupSelect.innerHTML = wbGroups.map(g => `<option value="${g.id}">${g.name}</option>`).join('');
            wbMovePanel.classList.add('active');
        };

        const hideWbMovePanel = () => {
            wbMovePanel.classList.remove('active');
        };

        container.querySelector('#wb-move-cancel').addEventListener('click', hideWbMovePanel);
        container.querySelector('#wb-move-backdrop').addEventListener('click', hideWbMovePanel);
        container.querySelector('#wb-move-save').addEventListener('click', () => {
            const targetGroupId = wbMoveGroupSelect.value;
            worldbooks.forEach(wb => {
                if(selectedWbIds.has(wb.id)) {
                    wb.groupId = targetGroupId;
                }
            });
            saveWorldbooks();
            hideWbMovePanel();
            exitBatchMode();
        });


        const exitBatchMode = () => {
            isBatchMode = false;
            batchModeType = '';
            selectedWbIds.clear();
            batchBar.style.display = 'none';
            renderWbList();
        };

        const updateBatchCount = () => {
            if(batchCountLabel) {
                batchCountLabel.textContent = `已选 ${selectedWbIds.size} 项`;
            }
            if(batchActionBtn) {
                batchActionBtn.disabled = selectedWbIds.size === 0;
                batchActionBtn.style.opacity = selectedWbIds.size === 0 ? '0.5' : '1';
                batchActionBtn.style.cursor = selectedWbIds.size === 0 ? 'not-allowed' : 'pointer';
            }
        };

        if (batchCancelBtn) {
            batchCancelBtn.addEventListener('click', exitBatchMode);
        }

        if (batchSelectAllBtn) {
            batchSelectAllBtn.addEventListener('click', () => {
                if (selectedWbIds.size === worldbooks.length) {
                    selectedWbIds.clear();
                    batchSelectAllBtn.textContent = '全选';
                } else {
                    worldbooks.forEach(wb => selectedWbIds.add(wb.id));
                    batchSelectAllBtn.textContent = '取消全选';
                }
                updateBatchCount();
                const checkboxes = listContainer.querySelectorAll('.wb-checkbox');
                checkboxes.forEach(cb => {
                    cb.checked = selectedWbIds.has(cb.dataset.id);
                });
                const groupCbs = listContainer.querySelectorAll('.group-checkbox');
                groupCbs.forEach(cb => cb.checked = (selectedWbIds.size === worldbooks.length));
            });
        }

        if (batchActionBtn) {
            batchActionBtn.addEventListener('click', () => {
                if (batchModeType === 'delete') {
                    handleBatchDelete();
                } else if (batchModeType === 'export') {
                    handleBatchExport();
                } else if (batchModeType === 'move') {
                    handleBatchMove();
                }
            });
        }

        // --- 路由与视图控制 ---
        const pageList = container.querySelector('#wb-page-list');
        const pageDetail = container.querySelector('#wb-page-detail');
        const backBtn = container.querySelector('#wb-back-btn');
        const wbCreatePanel = container.querySelector('#wb-create-panel');
        const groupCreatePanel = container.querySelector('#group-create-panel');
        const entryCreatePanel = container.querySelector('#entry-create-panel');
        const entryEditPanel = container.querySelector('#entry-edit-panel');
        
        let currentWbId = null;
        let currentEditingEntryId = null;
        let editingGroupId = null;

        // --- 分组管理 ---
        const groupManagePanel = container.querySelector('#group-manage-panel');
        const groupManageList = container.querySelector('#group-manage-list');
        const groupManageClose = container.querySelector('#group-manage-close');
        const groupManageBackdrop = container.querySelector('#group-manage-backdrop');
        const groupManageSelectAll = container.querySelector('#group-manage-select-all');
        const groupManageDeleteBtn = container.querySelector('#group-manage-delete-btn');
        const groupManageCount = container.querySelector('#group-manage-count');
        
        let selectedGroupIds = new Set();
        
        const renderGroupManageList = () => {
            groupManageList.innerHTML = '';
            const customGroups = wbGroups.filter(g => g.id !== 'default');
            if (customGroups.length === 0) {
                groupManageList.innerHTML = `<div style="text-align: center; color: #a1a1aa; font-size: 13px; padding: 20px 0;">暂无自定义分组</div>`;
                return;
            }

            customGroups.forEach(group => {
                const item = document.createElement('div');
                item.style.cssText = 'display: flex; align-items: center; padding: 12px; background: #f4f4f5; border-radius: 12px; cursor: pointer;';
                item.innerHTML = `
                    <input type="checkbox" class="group-manage-cb" data-id="${group.id}" ${selectedGroupIds.has(group.id) ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: #18181b; margin-right: 12px; cursor: pointer;">
                    <span style="font-size: 14px; color: #27272a; flex: 1;">${group.name}</span>
                `;
                
                item.addEventListener('click', (e) => {
                    if (e.target.tagName !== 'INPUT') {
                        const cb = item.querySelector('input');
                        cb.checked = !cb.checked;
                        cb.dispatchEvent(new Event('change'));
                    }
                });

                item.querySelector('input').addEventListener('change', (e) => {
                    if (e.target.checked) selectedGroupIds.add(group.id);
                    else selectedGroupIds.delete(group.id);
                    updateGroupManageUI(customGroups.length);
                });

                groupManageList.appendChild(item);
            });
            updateGroupManageUI(customGroups.length);
        };

        const updateGroupManageUI = (totalCount) => {
            if (groupManageCount) groupManageCount.textContent = `已选 ${selectedGroupIds.size} 项`;
            if (groupManageSelectAll) {
                groupManageSelectAll.textContent = (selectedGroupIds.size === totalCount && totalCount > 0) ? '取消全选' : '全选';
            }
            if (groupManageDeleteBtn) {
                groupManageDeleteBtn.disabled = selectedGroupIds.size === 0;
                groupManageDeleteBtn.style.opacity = selectedGroupIds.size === 0 ? '0.5' : '1';
                groupManageDeleteBtn.style.cursor = selectedGroupIds.size === 0 ? 'not-allowed' : 'pointer';
            }
        };

        if (menuManageGroups) {
            menuManageGroups.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdownMenu.style.display = 'none';
                selectedGroupIds.clear();
                renderGroupManageList();
                groupManagePanel.classList.add('active');
            });
        }

        const hideGroupManagePanel = () => {
            groupManagePanel.classList.remove('active');
            selectedGroupIds.clear();
        };

        if (groupManageClose) groupManageClose.addEventListener('click', hideGroupManagePanel);
        if (groupManageBackdrop) groupManageBackdrop.addEventListener('click', hideGroupManagePanel);

        if (groupManageSelectAll) {
            groupManageSelectAll.addEventListener('click', () => {
                const customGroups = wbGroups.filter(g => g.id !== 'default');
                if (selectedGroupIds.size === customGroups.length && customGroups.length > 0) {
                    selectedGroupIds.clear();
                } else {
                    customGroups.forEach(g => selectedGroupIds.add(g.id));
                }
                const cbs = groupManageList.querySelectorAll('.group-manage-cb');
                cbs.forEach(cb => cb.checked = selectedGroupIds.has(cb.dataset.id));
                updateGroupManageUI(customGroups.length);
            });
        }

        if (groupManageDeleteBtn) {
            groupManageDeleteBtn.addEventListener('click', async () => {
                if (selectedGroupIds.size === 0) return;
                
                let affectedWbCount = 0;
                worldbooks.forEach(w => {
                    if (selectedGroupIds.has(w.groupId)) affectedWbCount++;
                });

                let msg = `确定要删除选中的 ${selectedGroupIds.size} 个分组吗？`;
                if (affectedWbCount > 0) {
                    msg += `\n注意：这 ${affectedWbCount} 本所属的世界书将被安全移动到“默认分组”。`;
                }

                const confirmed = await showConfirm(msg, "批量删除分组", "danger");
                if (confirmed) {
                    wbGroups = wbGroups.filter(g => g.id === 'default' || !selectedGroupIds.has(g.id));
                    worldbooks.forEach(w => {
                        if (selectedGroupIds.has(w.groupId)) w.groupId = 'default';
                    });
                    saveGroups();
                    saveWorldbooks();
                    renderWbList();
                    hideGroupManagePanel();
                }
            });
        }

        const hideGroupCreatePanel = () => {
            groupCreatePanel.classList.remove('active');
            container.querySelector('#group-new-name').value = '';
            editingGroupId = null;
        };
        
        if (menuCreateGroup) {
            menuCreateGroup.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdownMenu.style.display = 'none';
                container.querySelector('#group-modal-title').textContent = "新建分组";
                groupCreatePanel.classList.add('active');
                container.querySelector('#group-new-name').focus();
            });
        }

        container.querySelector('#group-new-cancel').addEventListener('click', hideGroupCreatePanel);
        container.querySelector('#group-new-backdrop').addEventListener('click', hideGroupCreatePanel);
        container.querySelector('#group-new-save').addEventListener('click', () => {
            const name = container.querySelector('#group-new-name').value.trim();
            if (name) {
                if (editingGroupId) {
                    const group = wbGroups.find(g => g.id === editingGroupId);
                    if(group) group.name = name;
                } else {
                    wbGroups.push({
                        id: 'g_' + Date.now(),
                        name: name
                    });
                }
                saveGroups();
                renderWbList();
                hideGroupCreatePanel();
            } else {
                showAlert("请输入分组名称", "无法保存", "danger");
            }
        });

        // --- 编辑面板的事件绑定 ---
        const hideEntryEditPanel = () => {
            if(entryEditPanel) entryEditPanel.classList.remove('active');
            currentEditingEntryId = null;
        };
        const entryEditCancelBtn = container.querySelector('#entry-edit-cancel');
        const entryEditBackdrop = container.querySelector('#entry-edit-backdrop');
        if(entryEditCancelBtn) entryEditCancelBtn.addEventListener('click', hideEntryEditPanel);
        if(entryEditBackdrop) entryEditBackdrop.addEventListener('click', hideEntryEditPanel);

        const entryEditSaveBtn = container.querySelector('#entry-edit-save');
        if(entryEditSaveBtn) {
            entryEditSaveBtn.addEventListener('click', () => {
                const keyword = container.querySelector('#entry-edit-keyword').value.trim();
                const weightVal = parseInt(container.querySelector('#entry-edit-weight').value, 10);
                const content = container.querySelector('#entry-edit-content').value.trim();

                if (keyword && content) {
                    const wb = worldbooks.find(w => w.id === currentWbId);
                    if (wb && wb.entries) {
                        const entry = wb.entries.find(e => e.id === currentEditingEntryId);
                        if (entry) {
                            entry.keyword = keyword;
                            entry.weight = isNaN(weightVal) ? 100 : weightVal;
                            entry.content = content;
                            saveWorldbooks();
                            renderEntryList();
                            hideEntryEditPanel();
                        }
                    }
                } else {
                    showAlert("关键字和内容不能为空", "无法保存", "danger");
                }
            });
        }

        const showPage = (page) => {
            if (page === 'list') {
                pageList.style.display = 'flex';
                pageDetail.style.display = 'none';
                if (backBtn) backBtn.style.display = 'none';
                currentWbId = null;
                wbCreatePanel.classList.remove('active');
                renderWbList();
            } else if (page === 'detail') {
                pageList.style.display = 'none';
                pageDetail.style.display = 'flex';
                if (backBtn) backBtn.style.display = 'block';
                entryCreatePanel.classList.remove('active');
                if (entryEditPanel) entryEditPanel.classList.remove('active');
                renderEntryList();
            }
        };

        if (backBtn) {
            const realBtn = backBtn.querySelector('button');
            if (realBtn) {
                realBtn.addEventListener('click', () => showPage('list'));
            } else {
                backBtn.addEventListener('click', () => showPage('list'));
            }
        }

        // --- 渲染逻辑 ---
        const listContainer = container.querySelector('#wb-list-container');
        const entriesContainer = container.querySelector('#wb-entries-container');

        const renderWbList = () => {
            listContainer.innerHTML = '';

            if(isBatchMode) {
                listContainer.classList.add('batch-mode');
            } else {
                listContainer.classList.remove('batch-mode');
            }

            if (wbGroups.length === 0 && worldbooks.length === 0) {
                listContainer.innerHTML = `
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 120px 20px; text-align: center; width: 100%;">
                        <p style="font-size: 15px; color: #a1a1aa; font-weight: 500; margin: 0 0 8px 0; letter-spacing: 0.025em;">暂无世界书</p>
                        <p style="font-size: 13px; color: #d4d4d8; margin: 0;">请点击右上角新建或导入。</p>
                    </div>
                `;
                return;
            }

            // 按分组整理数据
            wbGroups.forEach(group => {
                const groupWbs = worldbooks.filter(w => w.groupId === group.id);
                // 即使分组为空也显示，方便管理
                
                const groupEl = document.createElement('div');
                groupEl.className = 'wb-group';
                
                // 检查该组内所有wb是否被选中
                const allSelected = groupWbs.length > 0 && groupWbs.every(w => selectedWbIds.has(w.id));

                let headerActions = '';
                if (group.id !== 'default' && !isBatchMode) {
                    headerActions = `
                        <div class="wb-group-actions" style="display: flex; gap: 8px;">
                            <button class="minimal-btn btn-edit-group" style="padding: 4px 8px; font-size: 12px;" data-id="${group.id}">编辑</button>
                            <button class="minimal-btn minimal-btn-danger btn-delete-group" style="padding: 4px 8px; font-size: 12px;" data-id="${group.id}">删除</button>
                        </div>
                    `;
                }

                groupEl.innerHTML = `
                    <div class="wb-group-header">
                        <div class="wb-group-title">
                            <input type="checkbox" class="group-checkbox" data-id="${group.id}" ${allSelected ? 'checked' : ''}>
                            <i class="ph-bold ph-caret-down" style="color: #a1a1aa; font-size: 12px;"></i>
                            ${group.name} <span style="color: #a1a1aa; font-size: 12px; font-weight: 400;">(${groupWbs.length})</span>
                        </div>
                        ${headerActions}
                    </div>
                    <div class="wb-group-content"></div>
                `;

                const contentEl = groupEl.querySelector('.wb-group-content');
                const headerEl = groupEl.querySelector('.wb-group-header');

                // 折叠/展开
                headerEl.addEventListener('click', (e) => {
                    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;
                    const isHidden = contentEl.style.display === 'none';
                    contentEl.style.display = isHidden ? 'flex' : 'none';
                    const icon = headerEl.querySelector('.ph-caret-down');
                    if (icon) {
                        icon.style.transform = isHidden ? 'rotate(0deg)' : 'rotate(-90deg)';
                    }
                });

                // 分组全选/取消全选
                const groupCb = groupEl.querySelector('.group-checkbox');
                if (groupCb) {
                    groupCb.addEventListener('change', (e) => {
                        const isChecked = e.target.checked;
                        groupWbs.forEach(w => {
                            if(isChecked) selectedWbIds.add(w.id);
                            else selectedWbIds.delete(w.id);
                        });
                        updateBatchCount();
                        // 重新渲染本组的 checkbox
                        const wbsCbs = contentEl.querySelectorAll('.wb-checkbox');
                        wbsCbs.forEach(cb => cb.checked = isChecked);
                        
                        if (selectedWbIds.size === worldbooks.length) {
                            if(batchSelectAllBtn) batchSelectAllBtn.textContent = '取消全选';
                        } else {
                            if(batchSelectAllBtn) batchSelectAllBtn.textContent = '全选';
                        }
                    });
                }

                // 分组编辑
                const btnEditGroup = groupEl.querySelector('.btn-edit-group');
                if (btnEditGroup) {
                    btnEditGroup.addEventListener('click', (e) => {
                        e.stopPropagation();
                        editingGroupId = group.id;
                        container.querySelector('#group-modal-title').textContent = "编辑分组";
                        container.querySelector('#group-new-name').value = group.name;
                        groupCreatePanel.classList.add('active');
                    });
                }

                // 分组删除
                const btnDeleteGroup = groupEl.querySelector('.btn-delete-group');
                if (btnDeleteGroup) {
                    btnDeleteGroup.addEventListener('click', async (e) => {
                        e.stopPropagation();
                        const count = groupWbs.length;
                        let confirmMsg = `确定要删除分组 "${group.name}" 吗？`;
                        if (count > 0) {
                            confirmMsg += `\n该分组下有 ${count} 本世界书，它们将被移动到默认分组。`;
                        }
                        const confirmed = await showConfirm(confirmMsg, "删除分组", "danger");
                        if (confirmed) {
                            wbGroups = wbGroups.filter(g => g.id !== group.id);
                            worldbooks.forEach(w => {
                                if(w.groupId === group.id) w.groupId = 'default';
                            });
                            saveGroups();
                            saveWorldbooks();
                            renderWbList();
                        }
                    });
                }

                if (groupWbs.length === 0) {
                    contentEl.innerHTML = `<div style="padding: 16px 20px; font-size: 13px; color: #a1a1aa; text-align: center;">该分组下暂无世界书</div>`;
                } else {
                    groupWbs.forEach(wb => {
                        const card = document.createElement('div');
                        card.className = 'wb-card';
                        card.innerHTML = `
                            <input type="checkbox" class="wb-checkbox" data-id="${wb.id}" ${selectedWbIds.has(wb.id) ? 'checked' : ''}>
                            
                            <div class="view-mode-container">
                                <div style="flex: 1;">
                                    <div class="wb-card-title">${wb.name}</div>
                                    <div class="wb-card-desc">包含 ${wb.entries ? wb.entries.length : 0} 个条目</div>
                                </div>
                                <div class="wb-card-actions" style="display: flex; gap: 8px;">
                                    <button class="minimal-btn btn-edit-wb" style="padding: 4px 8px; font-size: 12px;">重命名</button>
                                    <button class="minimal-btn minimal-btn-danger btn-delete-wb" style="padding: 4px 8px; font-size: 12px;">删除</button>
                                </div>
                            </div>

                            <div class="edit-mode-container">
                                <input type="text" class="minimal-input edit-wb-input" value="${wb.name}" placeholder="请输入世界书名称...">
                                <div style="display: flex; justify-content: flex-end; gap: 12px;">
                                    <button class="minimal-btn btn-cancel-edit-wb">取消</button>
                                    <button class="minimal-btn minimal-btn-primary btn-save-edit-wb">保存</button>
                                </div>
                            </div>
                        `;

                        const viewContainer = card.querySelector('.view-mode-container');
                        const editContainer = card.querySelector('.edit-mode-container');
                        
                        viewContainer.addEventListener('click', (e) => {
                            if(isBatchMode) {
                                if(e.target.tagName !== 'INPUT') {
                                    const cb = card.querySelector('.wb-checkbox');
                                    cb.checked = !cb.checked;
                                    cb.dispatchEvent(new Event('change'));
                                }
                                return;
                            }
                            if(e.target.tagName === 'BUTTON') return; 
                            currentWbId = wb.id;
                            showPage('detail');
                        });

                        const cb = card.querySelector('.wb-checkbox');
                        cb.addEventListener('change', (e) => {
                            if(e.target.checked) {
                                selectedWbIds.add(wb.id);
                            } else {
                                selectedWbIds.delete(wb.id);
                            }
                            // 更新全选状态
                            if (selectedWbIds.size === worldbooks.length) {
                                if(batchSelectAllBtn) batchSelectAllBtn.textContent = '取消全选';
                            } else {
                                if(batchSelectAllBtn) batchSelectAllBtn.textContent = '全选';
                            }
                            
                            // 更新该组的全选框状态
                            const allGroupSelected = groupWbs.every(w => selectedWbIds.has(w.id));
                            if(groupCb) groupCb.checked = allGroupSelected;

                            updateBatchCount();
                        });

                        const btnEdit = card.querySelector('.btn-edit-wb');
                        const btnCancelEdit = card.querySelector('.btn-cancel-edit-wb');
                        const btnSaveEdit = card.querySelector('.btn-save-edit-wb');
                        const inputEdit = card.querySelector('.edit-wb-input');

                        btnEdit.addEventListener('click', (e) => {
                            e.stopPropagation();
                            viewContainer.style.display = 'none';
                            editContainer.style.display = 'flex';
                            inputEdit.focus();
                        });

                        btnCancelEdit.addEventListener('click', (e) => {
                            e.stopPropagation();
                            viewContainer.style.display = 'flex';
                            editContainer.style.display = 'none';
                            inputEdit.value = wb.name; 
                        });

                        btnSaveEdit.addEventListener('click', (e) => {
                            e.stopPropagation();
                            const newName = inputEdit.value.trim();
                            if (newName) {
                                wb.name = newName;
                                saveWorldbooks();
                                renderWbList();
                            } else {
                                alert("世界书名称不能为空");
                            }
                        });

                        const btnDelete = card.querySelector('.btn-delete-wb');
                        btnDelete.addEventListener('click', async (e) => {
                            e.stopPropagation();
                            const confirmed = await showConfirm(`确定要删除世界书 "${wb.name}" 吗？这将会删除内部所有条目。`, "操作确认", "danger");
                            if (confirmed) {
                                worldbooks = worldbooks.filter(w => w.id !== wb.id);
                                saveWorldbooks();
                                renderWbList();
                            }
                        });

                        contentEl.appendChild(card);
                    });
                }
                listContainer.appendChild(groupEl);
            });
        };

        const renderEntryList = () => {
            const wb = worldbooks.find(w => w.id === currentWbId);
            if (!wb) return showPage('list');

            const titleEl = container.querySelector('#current-wb-title');
            const countEl = container.querySelector('#current-wb-count');
            titleEl.textContent = wb.name;
            countEl.textContent = `${wb.entries ? wb.entries.length : 0} 个条目`;

            entriesContainer.innerHTML = '';
            
            entriesContainer.style.background = 'transparent';
            entriesContainer.style.boxShadow = 'none';

            if (!wb.entries || wb.entries.length === 0) {
                entriesContainer.innerHTML = `
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 120px 20px; text-align: center; width: 100%;">
                        <p style="font-size: 15px; color: #a1a1aa; font-weight: 500; margin: 0 0 8px 0; letter-spacing: 0.025em;">该世界书暂无条目</p>
                        <p style="font-size: 13px; color: #d4d4d8; margin: 0;">请点击右上角新增。</p>
                    </div>
                `;
                return;
            }
            
            entriesContainer.style.background = '#ffffff';
            entriesContainer.style.boxShadow = '0 4px 20px -10px rgba(0, 0, 0, 0.03)';

            wb.entries.forEach((entry, index) => {
                const card = document.createElement('div');
                card.className = 'entry-card';
                
                const safeKeyword = (entry.keyword || '').replace(/"/g, '"').replace(/</g, '<').replace(/>/g, '>');
                const safeWeight = entry.weight !== undefined ? entry.weight : 100;
                const safeContent = (entry.content || '').replace(/</g, '<').replace(/>/g, '>');
                
                let metaHtml = `<span>权重: ${safeWeight}</span>`;

                card.innerHTML = `
                    <div class="view-mode-container">
                        <div class="entry-header" style="align-items: flex-start;">
                            <div style="display: flex; flex-direction: column;">
                                <span class="entry-keyword">${safeKeyword || '未命名关键字'}</span>
                                <div class="entry-meta">${metaHtml}</div>
                            </div>
                            <div class="wb-card-actions" style="display: flex; gap: 8px; margin-top: 2px;">
                                <button class="minimal-btn btn-edit-entry" style="padding: 4px 8px; font-size: 12px;">编辑</button>
                                <button class="minimal-btn minimal-btn-danger btn-delete-entry" style="padding: 4px 8px; font-size: 12px;">删除</button>
                            </div>
                        </div>
                        <div class="entry-content">${safeContent}</div>
                        <div class="entry-actions">
                            <span style="font-size: 13px; color: #a1a1aa; font-weight: 400;">状态</span>
                            <button type="button" class="settings-toggle entry-toggle ${entry.enabled ? 'active' : ''}">
                                <span class="settings-toggle-slider"></span>
                            </button>
                        </div>
                    </div>
                `;

                const viewContainer = card.querySelector('.view-mode-container');

                const openEditPanel = () => {
                    if (entryEditPanel) {
                        currentEditingEntryId = entry.id;
                        container.querySelector('#entry-edit-keyword').value = entry.keyword || '';
                        container.querySelector('#entry-edit-weight').value = entry.weight !== undefined ? entry.weight : 100;
                        container.querySelector('#entry-edit-content').value = entry.content || '';
                        entryEditPanel.classList.add('active');
                    }
                };

                viewContainer.addEventListener('click', (e) => {
                    if(e.target.closest('button')) return;
                    openEditPanel();
                });

                const toggle = card.querySelector('.entry-toggle');
                toggle.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggle.classList.toggle('active');
                    entry.enabled = toggle.classList.contains('active');
                    saveWorldbooks();
                });

                const btnEdit = card.querySelector('.btn-edit-entry');
                btnEdit.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openEditPanel();
                });

                const btnDelete = card.querySelector('.btn-delete-entry');
                btnDelete.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const confirmed = await showConfirm(`确定要删除条目 "${entry.keyword}" 吗？`, "操作确认", "danger");
                    if (confirmed) {
                        wb.entries.splice(index, 1);
                        saveWorldbooks();
                        renderEntryList();
                    }
                });

                entriesContainer.appendChild(card);
            });
        };

        // --- 创建动作 (弹窗面板逻辑) ---
        const btnCreateWb = container.querySelector('#btn-create-wb');
        const inputWbNewName = container.querySelector('#wb-new-name');
        const selectWbNewGroup = container.querySelector('#wb-new-group-select');
        const wbNewBackdrop = container.querySelector('#wb-new-backdrop');
        
        const hideWbCreatePanel = () => {
            wbCreatePanel.classList.remove('active');
            inputWbNewName.value = '';
        };

        if (btnCreateWb) {
            btnCreateWb.addEventListener('click', () => {
                // 更新分组下拉
                selectWbNewGroup.innerHTML = wbGroups.map(g => `<option value="${g.id}">${g.name}</option>`).join('');
                wbCreatePanel.classList.add('active');
                inputWbNewName.focus();
            });
        }
        
        const wbNewCancel = container.querySelector('#wb-new-cancel');
        if(wbNewCancel) wbNewCancel.addEventListener('click', hideWbCreatePanel);
        if(wbNewBackdrop) wbNewBackdrop.addEventListener('click', hideWbCreatePanel);

        const wbNewSave = container.querySelector('#wb-new-save');
        if(wbNewSave) {
            wbNewSave.addEventListener('click', () => {
                const name = inputWbNewName.value.trim();
                const groupId = selectWbNewGroup.value;
                if (name) {
                    const newWb = {
                        id: 'wb_' + Date.now(),
                        name: name,
                        groupId: groupId || 'default',
                        entries: []
                    };
                    worldbooks.unshift(newWb);
                    saveWorldbooks();
                    renderWbList();
                    hideWbCreatePanel();
                } else {
                    showAlert("请输入世界书名称", "创建失败", "danger");
                }
            });
        }

        const btnCreateEntry = container.querySelector('#btn-create-entry');
        const inputEntryNewKeyword = container.querySelector('#entry-new-keyword');
        const inputEntryNewWeight = container.querySelector('#entry-new-weight');
        const inputEntryNewContent = container.querySelector('#entry-new-content');
        const entryNewBackdrop = container.querySelector('#entry-new-backdrop');

        const hideEntryCreatePanel = () => {
            entryCreatePanel.classList.remove('active');
            inputEntryNewKeyword.value = '';
            if (inputEntryNewWeight) inputEntryNewWeight.value = '100';
            inputEntryNewContent.value = '';
        };

        if (btnCreateEntry) {
            btnCreateEntry.addEventListener('click', () => {
                entryCreatePanel.classList.add('active');
                inputEntryNewKeyword.focus();
            });
        }

        const entryNewCancel = container.querySelector('#entry-new-cancel');
        if(entryNewCancel) entryNewCancel.addEventListener('click', hideEntryCreatePanel);
        if(entryNewBackdrop) entryNewBackdrop.addEventListener('click', hideEntryCreatePanel);

        const entryNewSave = container.querySelector('#entry-new-save');
        if(entryNewSave) {
            entryNewSave.addEventListener('click', () => {
                const keyword = inputEntryNewKeyword.value.trim();
                const weightVal = inputEntryNewWeight ? parseInt(inputEntryNewWeight.value, 10) : 100;
                const content = inputEntryNewContent.value.trim();
                
                if (keyword && content) {
                    const wb = worldbooks.find(w => w.id === currentWbId);
                    if (!wb) return;

                    if(!wb.entries) wb.entries = [];
                    wb.entries.unshift({
                        id: 'e_' + Date.now(),
                        keyword: keyword,
                        weight: isNaN(weightVal) ? 100 : weightVal,
                        content: content,
                        enabled: true
                    });
                    saveWorldbooks();
                    renderEntryList();
                    
                    hideEntryCreatePanel();
                } else {
                    showAlert("关键字和内容不能为空", "无法保存", "danger");
                }
            });
        }

        // --- 导入功能 (JSON/TXT/DOCX) ---
        const fileInput = container.querySelector('#wb-import-file');
        
        if (menuImport && fileInput) {
            menuImport.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdownMenu.style.display = 'none';
                fileInput.click();
            });

            fileInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                // 处理 ZIP 批量导入
                if (file.name.toLowerCase().endsWith('.zip') && window.zipManager) {
                    try {
                        const files = await window.zipManager.processZipFile(file);
                        if (files && files.length > 0) {
                            let totalAddedCount = 0;
                            if (window._currentChatOSAlert) window._currentChatOSAlert('正在解析', '正在读取ZIP内的世界书文件...');

                            for (const f of files) {
                                const fExtension = f.name.split('.').pop().toLowerCase();
                                let textContent = '';
                                
                                if (fExtension === 'json') {
                                    textContent = await f.text();
                                    try {
                                        const parsedData = JSON.parse(textContent);
                                        if (parsedData && parsedData.type === "nrj_worldbook_export" && Array.isArray(parsedData.data)) {
                                            parsedData.data.forEach(wb => {
                                                const newWbId = 'wb_import_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
                                                const newWb = {
                                                    id: newWbId,
                                                    name: wb.name || '未命名世界书',
                                                    groupId: 'default',
                                                    entries: []
                                                };
                                                if (Array.isArray(wb.entries)) {
                                                    wb.entries.forEach(entry => {
                                                        newWb.entries.push({
                                                            id: 'e_import_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                                                            keyword: entry.keyword || '',
                                                            weight: entry.weight !== undefined ? entry.weight : 100,
                                                            content: entry.content || '',
                                                            enabled: entry.enabled !== false
                                                        });
                                                    });
                                                }
                                                worldbooks.unshift(newWb);
                                                totalAddedCount++;
                                            });
                                        }
                                    } catch(e) {}
                                } else {
                                    if (fExtension === 'txt') {
                                        textContent = await f.text();
                                    } else if (fExtension === 'docx') {
                                        if (typeof mammoth !== 'undefined') {
                                            const arrayBuffer = await f.arrayBuffer();
                                            const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
                                            textContent = result.value;
                                        }
                                    }
                                    
                                    if (textContent && textContent.trim()) {
                                        const rawBlocks = textContent.split(/\n\s*\n/);
                                        const entries = [];
                                        rawBlocks.forEach((block, idx) => {
                                            const tBlock = block.trim();
                                            if (!tBlock) return;
                                            let keyword = `导入片段 ${idx + 1}`;
                                            let content = tBlock;
                                            const match = tBlock.match(/^(.{1,20})[：:]([\s\S]*)$/);
                                            if (match) {
                                                keyword = match[1].trim();
                                                content = match[2].trim() || tBlock;
                                            } else {
                                                keyword = tBlock.substring(0, 10).replace(/\n/g, ' ') + '...';
                                            }
                                            entries.push({
                                                id: 'e_' + Date.now() + '_' + idx,
                                                keyword: keyword,
                                                content: content,
                                                enabled: true
                                            });
                                        });

                                        const newWb = {
                                            id: 'wb_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                                            name: f.name.replace(/\.[^/.]+$/, "") + ' (导入)',
                                            groupId: 'default',
                                            entries: entries
                                        };
                                        worldbooks.unshift(newWb);
                                        totalAddedCount++;
                                    }
                                }
                            }

                            if (totalAddedCount > 0) {
                                saveWorldbooks();
                                renderWbList();
                                showAlert(`成功从ZIP中导入 ${totalAddedCount} 本世界书！`, "导入成功", "success");
                            } else {
                                showAlert("未从ZIP中解析到有效世界书内容", "导入失败", "info");
                            }
                        }
                    } catch (err) {
                        console.log('ZIP 处理被取消或失败:', err);
                    } finally {
                        e.target.value = '';
                    }
                    return;
                }

                const fileName = file.name;
                const extension = fileName.split('.').pop().toLowerCase();

                let textContent = '';

                try {
                    if (extension === 'json') {
                        textContent = await file.text();
                        const parsedData = JSON.parse(textContent);
                        
                        if (parsedData && parsedData.type === "nrj_worldbook_export" && Array.isArray(parsedData.data)) {
                            let importCount = 0;
                            parsedData.data.forEach(wb => {
                                const newWbId = 'wb_import_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
                                const newWb = {
                                    id: newWbId,
                                    name: wb.name || '未命名世界书',
                                    groupId: 'default', // 导入的默认放入默认分组
                                    entries: []
                                };
                                
                                if (Array.isArray(wb.entries)) {
                                    wb.entries.forEach(entry => {
                                        newWb.entries.push({
                                            id: 'e_import_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                                            keyword: entry.keyword || '',
                                            weight: entry.weight !== undefined ? entry.weight : 100,
                                            content: entry.content || '',
                                            enabled: entry.enabled !== false
                                        });
                                    });
                                }
                                worldbooks.unshift(newWb);
                                importCount++;
                            });
                            
                            saveWorldbooks();
                            renderWbList();
                            showAlert(`成功恢复导入 ${importCount} 本世界书！`, "导入成功", "success");
                        } else {
                            showAlert("JSON 文件格式不正确，不是有效的世界书备份文件。", "导入失败", "danger");
                        }
                        
                    } else {
                        if (extension === 'txt') {
                            textContent = await file.text();
                        } else if (extension === 'docx') {
                            if (typeof mammoth === 'undefined') {
                                showAlert('mammoth.js 尚未加载完成，请稍后再试或检查网络连接。', "插件加载中", "info");
                                return;
                            }
                            const arrayBuffer = await file.arrayBuffer();
                            const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
                            textContent = result.value;
                        } else {
                            showAlert('仅支持 .txt / .docx / .json 格式文件', "格式不支持", "danger");
                            return;
                        }

                        if (!textContent || !textContent.trim()) {
                            showAlert('文件内容为空！', "导入失败", "danger");
                            return;
                        }

                        const rawBlocks = textContent.split(/\n\s*\n/);
                        const entries = [];
                        
                        rawBlocks.forEach((block, idx) => {
                            const tBlock = block.trim();
                            if (!tBlock) return;
                            
                            let keyword = `导入片段 ${idx + 1}`;
                            let content = tBlock;
                            
                            const match = tBlock.match(/^(.{1,20})[：:]([\s\S]*)$/);
                            if (match) {
                                keyword = match[1].trim();
                                content = match[2].trim() || tBlock;
                            } else {
                                keyword = tBlock.substring(0, 10).replace(/\n/g, ' ') + '...';
                            }

                            entries.push({
                                id: 'e_' + Date.now() + '_' + idx,
                                keyword: keyword,
                                content: content,
                                enabled: true
                            });
                        });

                        const wbName = fileName.replace(/\.[^/.]+$/, "");
                        
                        const newWb = {
                            id: 'wb_' + Date.now(),
                            name: wbName + ' (导入)',
                            groupId: 'default',
                            entries: entries
                        };

                        worldbooks.unshift(newWb);
                        saveWorldbooks();
                        renderWbList();
                        
                        showAlert(`成功导入世界书 "${newWb.name}"，共包含 ${entries.length} 个条目！`, "导入成功", "success");
                    }

                } catch (err) {
                    console.error("导入文件失败:", err);
                    showAlert("读取文件失败: " + err.message, "出现异常", "danger");
                } finally {
                    fileInput.value = '';
                }
            });
        }

        // 初始化显示列表页
        showPage('list');
    },

    destroy: function(container) {
        console.log('Worldbook app destroyed');
    }
};
