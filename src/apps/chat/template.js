window.ChatAppTemplate = `
        <style id="chat-custom-style-tag"></style>
        <style>
            .toggle-switch-ios input:checked + .ios-slider { background-color: #34C759; }
            .toggle-switch-ios input:focus + .ios-slider { box-shadow: 0 0 1px #34C759; }
            .toggle-switch-ios input:checked + .ios-slider:before { transform: translateX(16px); }
            .ios-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #e5e5ea; transition: .4s; border-radius: 20px; border: 1px solid #d1d1d6; }
            .ios-slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 1px; bottom: 1px; background-color: white; transition: .4s; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
            @keyframes voice-wave-anim {
                0% { transform: scaleY(0.8); }
                50% { transform: scaleY(1.5); }
                100% { transform: scaleY(0.8); }
            }
            .voice-wave-active > div:nth-child(1) { animation: voice-wave-anim 0.8s infinite ease-in-out; }
            .voice-wave-active > div:nth-child(2) { animation: voice-wave-anim 0.8s infinite ease-in-out 0.2s; }
            .voice-wave-active > div:nth-child(3) { animation: voice-wave-anim 0.8s infinite ease-in-out 0.4s; }
            .voice-wave-active > div:nth-child(4) { animation: voice-wave-anim 0.8s infinite ease-in-out 0.1s; }
            .voice-wave-active > div:nth-child(5) { animation: voice-wave-anim 0.8s infinite ease-in-out 0.3s; }
            .msg-menu-item:hover { background-color: var(--hover-bg, rgba(120, 120, 128, 0.08)); }
            
            /* 多选模式样式 */
            .chat-conv-messages.select-mode .chat-bubble-row {
                padding-left: 48px;
                position: relative;
            }
            .chat-conv-messages.select-mode .chat-bubble-row .chat-bubble,
            .chat-conv-messages.select-mode .chat-bubble-row .chat-bubble-avatar {
                pointer-events: none;
            }
            .chat-bubble-row .msg-checkbox {
                display: none;
                position: absolute;
                left: 16px;
                top: 50%;
                transform: translateY(-50%);
                width: 20px;
                height: 20px;
                border-radius: 50%;
                border: 1px solid #d1d1d6;
                background-color: transparent;
                align-items: center;
                justify-content: center;
                color: transparent;
                transition: all 0.2s;
                z-index: 10;
            }
            .chat-conv-messages.select-mode .chat-bubble-row .msg-checkbox {
                display: flex;
            }
            .chat-bubble-row.selected .msg-checkbox {
                background-color: #18181b;
                border-color: #18181b;
                color: #ffffff;
            }

            /* 会话多选模式样式 */
            .chat-scroll-area.select-mode .chat-list-item {
                padding-left: 48px;
                position: relative;
                pointer-events: auto; /* Allow click to toggle selection */
            }
            .chat-scroll-area.select-mode .chat-list-item .chat-item-avatar,
            .chat-scroll-area.select-mode .chat-list-item .chat-item-content {
                pointer-events: none;
            }
            .chat-list-item .session-checkbox {
                display: none;
                position: absolute;
                left: 16px;
                top: 50%;
                transform: translateY(-50%);
                width: 20px;
                height: 20px;
                border-radius: 50%;
                border: 1px solid #d1d1d6;
                background-color: transparent;
                align-items: center;
                justify-content: center;
                color: transparent;
                transition: all 0.2s;
                z-index: 10;
            }
            .chat-scroll-area.select-mode .chat-list-item .session-checkbox {
                display: flex;
            }
            .chat-list-item.selected .session-checkbox {
                background-color: #18181b;
                border-color: #18181b;
                color: #ffffff;
            }
            /* 顶栏美化：电波风格 */
            .chat-header-wave-style {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 12px;
            }
            .wave-avatar-box {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                overflow: hidden;
                border: 2px solid #fff;
                box-shadow: 0 2px 6px rgba(0,0,0,0.1);
            }
            .wave-avatar-box img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            .wave-line-container {
                display: flex;
                align-items: center;
                gap: 4px;
                height: 20px;
            }
            .wave-line {
                width: 3px;
                background-color: var(--accent-color, #111);
                border-radius: 2px;
                animation: wave-anim 1s infinite ease-in-out;
            }
            .wave-line:nth-child(1) { animation-delay: 0s; height: 8px; }
            .wave-line:nth-child(2) { animation-delay: 0.2s; height: 16px; }
            .wave-line:nth-child(3) { animation-delay: 0.4s; height: 8px; }

            @keyframes wave-anim {
                0%, 100% { transform: scaleY(1); }
                50% { transform: scaleY(1.5); }
            }

            /* 顶栏美化：心电波风格 */
            .chat-header-ecg-style {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }
            .ecg-avatar-box {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                overflow: hidden;
                border: 2px solid #fff;
                box-shadow: 0 2px 6px rgba(0,0,0,0.1);
            }
            .ecg-avatar-box img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            .ecg-line-container {
                width: 60px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .ecg-line {
                width: 60px;
                height: 24px;
                background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='24' viewBox='0 0 60 24'><path d='M0,12 L15,12 L20,8 L25,20 L30,4 L35,16 L40,12 L60,12' stroke='%23ff3b30' stroke-width='1.5' fill='none' stroke-linejoin='round' /></svg>");
                background-repeat: no-repeat;
                background-position: center;
                transform-origin: center;
                animation: ecg-pulse-anim 1.2s infinite;
            }

            @keyframes ecg-pulse-anim {
                0%, 100% { transform: scale(1, 1); opacity: 0.8; }
                10% { transform: scale(1.05, 1.3); opacity: 1; }
                20% { transform: scale(0.95, 0.8); opacity: 0.9; }
                30% { transform: scale(1.02, 1.1); opacity: 1; }
                40% { transform: scale(1, 1); opacity: 0.8; }
            }

            /* 顶栏美化：拍立得风格 */
            .chat-header-polaroid-style {
                display: flex;
                flex-direction: column;
                align-items: center;
                position: absolute;
                top: -50px;
                left: 50%;
                transform: translateX(-50%);
                pointer-events: none;
                z-index: 100;
            }
            .polaroid-string {
                width: 2px;
                height: 1000px;
                margin-top: -944px;
                background: #d1d1d6;
                box-shadow: -1px 0 2px rgba(0,0,0,0.1);
            }
            .polaroid-frame {
                pointer-events: auto;
                background: #fff;
                padding: 5px 5px 16px 5px;
                box-shadow: 0 6px 16px rgba(0,0,0,0.12);
                border-radius: 2px;
                cursor: pointer;
                transform: rotate(-4deg);
                transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                width: 48px;
                height: 56px;
                display: flex;
                justify-content: center;
                align-items: flex-start;
            }
            .polaroid-frame:hover {
                transform: rotate(0deg) scale(1.05);
                box-shadow: 0 8px 24px rgba(0,0,0,0.15);
            }
            .polaroid-frame img {
                width: 100%;
                height: 36px;
                object-fit: cover;
                background-color: #f4f4f5;
                border: 1px solid rgba(0,0,0,0.05);
            }

            /* 会话置顶样式 */
            .chat-list-item-wrapper.pinned .chat-list-item {
                background-color: rgba(0,0,0,0.03);
            }
            .chat-list-item-wrapper.pinned .chat-item-name::after {
                content: "📌";
                font-size: 10px;
                margin-left: 4px;
                opacity: 0.5;
            }
            
            .chat-message-select-bar {
                display: none;
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                border-top: 1px solid rgba(0, 0, 0, 0.1);
                padding: 12px 16px;
                padding-bottom: calc(12px + env(safe-area-inset-bottom));
                justify-content: space-between;
                align-items: center;
                z-index: 100;
            }
            .chat-message-select-bar.active {
                display: flex;
            }
            .chat-select-bar-btn {
                background: transparent;
                border: none;
                font-size: 14px;
                color: #333;
                cursor: pointer;
                padding: 8px;
                border-radius: 8px;
                transition: background 0.2s;
            }
            .chat-select-bar-btn:active {
                background: rgba(0,0,0,0.05);
            }
            .chat-select-bar-btn.danger {
                color: #FF3B30;
            }
            .chat-select-bar-btn:disabled {
                opacity: 0.5;
                pointer-events: none;
            }
        </style>
        <div id="chat-app-window" class="chat-app-window settings-modal">
            <div class="chat-app-container">
                
                <!-- Editorial Header -->
                <header class="chat-editorial-header">
                    <button class="chat-header-btn" id="chat-header-left-btn">
                        <i class="ph ph-caret-left"></i>
                    </button>
                    <div class="chat-header-title-box">
                        <span class="chat-header-subtitle" id="chat-header-subtitle">INBOX</span>
                        <h1 class="chat-header-title" id="chat-header-title">消息</h1>
                    </div>
                    <button class="chat-header-btn" id="chat-header-right-btn">
                        <i class="ph ph-pencil-simple"></i>
                    </button>
                </header>

                <!-- 视图区 (包含 聊天列表、动态、设置) -->
                <div class="chat-views">
                    
                    <!-- 1. 聊天列表页 -->
                    <div class="chat-view active" id="chat-view-messages">
                        <div class="chat-search-container">
                            <input type="text" class="chat-search-input" placeholder="搜索联系人或消息...">
                        </div>
                        
                        <div id="chat-list-group-tabs" style="display: flex; gap: 8px; padding: 0 16px 12px; overflow-x: auto; scrollbar-width: none;">
                            <!-- 动态生成分组标签 -->
                        </div>
       
                        <div class="chat-scroll-area" id="chat-list-container">
                            <!-- 动态生成聊天列表 -->
                        </div>
                    </div>

                    <!-- 新增：联系人页 -->
                    <div class="chat-view" id="chat-view-contacts">
                        <div class="chat-search-container">
                            <input type="text" class="chat-search-input" id="chat-contacts-search" placeholder="搜索联系人...">
                        </div>
                        <div class="chat-scroll-area">
                            <!-- 功能入口 -->
                            <div class="chat-contacts-features" style="padding: 0 16px 8px;">
                                <div class="contacts-feature-item" id="btn-contacts-new-friend" style="display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid rgba(0,0,0,0.05); cursor: pointer;">
                                    <div style="width: 36px; height: 36px; border-radius: 8px; background: rgba(120, 120, 128, 0.08); color: var(--text-color); display: flex; align-items: center; justify-content: center; font-size: 20px;">
                                        <i class="ph ph-user-plus"></i>
                                    </div>
                                    <span style="font-size: 15px; font-weight: 500; color: var(--text-color);">新的朋友</span>
                                </div>
                                <div class="contacts-feature-item" id="btn-contacts-group" style="display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid rgba(0,0,0,0.05); cursor: pointer;">
                                    <div style="width: 36px; height: 36px; border-radius: 8px; background: rgba(120, 120, 128, 0.08); color: var(--text-color); display: flex; align-items: center; justify-content: center; font-size: 20px;">
                                        <i class="ph ph-users-three"></i>
                                    </div>
                                    <span style="font-size: 15px; font-weight: 500; color: var(--text-color);">群聊</span>
                                </div>
                            </div>
                            
                            <!-- 联系人列表容器 -->
                            <div id="chat-contacts-container" style="padding-bottom: 20px;">
                                <!-- 动态生成分组及联系人 -->
                            </div>
                        </div>
                    </div>

                    <!-- 2. 动态页 -->
                    <div class="chat-view" id="chat-view-dynamic">
                        <div class="chat-scroll-area">
                            <div class="chat-feed-list" id="chat-dynamic-container">
                                <!-- 动态内容 -->
                            </div>
                        </div>
                    </div>

                    <!-- 3. 设置页 -->
                    <div class="chat-view" id="chat-view-settings">
                        <div class="chat-scroll-area">
                            <div class="chat-settings-area">
                                <div class="chat-profile-section">
                                    <div class="chat-profile-avatar-box">
                                        <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" class="chat-profile-avatar">
                                    </div>
                                    <h2 class="chat-profile-name">Alex Chen</h2>
                                    <p class="chat-profile-email" style="display: none;">alex.chen@example.com</p>
                                    
                                    <div class="chat-global-signature-box" id="chat-global-signature-box">
                                        <i class="ph ph-pen-nib"></i>
                                        <span id="chat-global-signature-text" class="chat-global-signature-text">点击添加个性签名...</span>
                                    </div>
                                    <div class="chat-global-signature-edit" id="chat-global-signature-edit" style="display: none;">
                                        <input type="text" id="chat-global-signature-input" placeholder="输入你的个性签名..." maxlength="50">
                                        <button id="chat-global-signature-save"><i class="ph ph-check"></i></button>
                                    </div>
                                </div>
                                
                                <div style="display: flex; gap: 8px; margin-bottom: 24px;">
                                    <button class="chat-btn-create-persona" id="btn-create-persona" style="flex: 1;">
                                        <span>新建人设</span>
                                    </button>
                                    <button class="chat-btn-create-persona" id="btn-persona-library" style="flex: 1; border-style: solid; background: #fff;">
                                        <i class="ph ph-users"></i>
                                        <span>人设库</span>
                                    </button>
                                </div>
                                
                                <div class="chat-settings-group">
                                    <div class="chat-settings-group-title">通用设置</div>
                                    <div class="chat-settings-item">
                                        <div class="chat-settings-item-left">
                                            <div class="chat-settings-icon-wrapper"><i class="ph ph-user"></i></div>
                                            <span class="chat-settings-label">账号与安全</span>
                                        </div>
                                        <i class="ph ph-caret-right chat-settings-arrow"></i>
                                    </div>
                                    <div class="chat-settings-item">
                                        <div class="chat-settings-item-left">
                                            <div class="chat-settings-icon-wrapper"><i class="ph ph-bell"></i></div>
                                            <span class="chat-settings-label">消息通知</span>
                                        </div>
                                        <i class="ph ph-caret-right chat-settings-arrow"></i>
                                    </div>
                                    <div class="chat-settings-item">
                                        <div class="chat-settings-item-left">
                                            <div class="chat-settings-icon-wrapper"><i class="ph ph-lock"></i></div>
                                            <span class="chat-settings-label">隐私设置</span>
                                        </div>
                                        <i class="ph ph-caret-right chat-settings-arrow"></i>
                                    </div>
                                    <div class="chat-settings-item">
                                        <div class="chat-settings-item-left">
                                            <div class="chat-settings-icon-wrapper"><i class="ph ph-question"></i></div>
                                            <span class="chat-settings-label">帮助与反馈</span>
                                        </div>
                                        <i class="ph ph-caret-right chat-settings-arrow"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <!-- Floating Pill Navigation -->
                <div class="chat-floating-nav-wrapper">
                    <nav class="chat-floating-nav">
                        <button class="chat-nav-pill active" data-target="chat-view-messages">
                            聊天
                            <span class="chat-nav-badge">7</span>
                        </button>
                        <button class="chat-nav-pill" data-target="chat-view-contacts">
                            联系人
                        </button>
                        <button class="chat-nav-pill" data-target="chat-view-dynamic">
                            动态
                        </button>
                        <button class="chat-nav-pill" data-target="chat-view-settings">
                            设置
                        </button>
                    </nav>
                </div>

                <!-- 弹窗遮罩与弹窗容器 -->
                
                <!-- 1. 人设库弹窗 -->
                <div class="chat-popup-overlay" id="persona-library-popup">
                    <div class="chat-popup-content">
                        <div class="chat-popup-header">
                            <h3 class="chat-popup-title">人设库</h3>
                            <div class="chat-popup-actions">
                                <button class="chat-btn-text" id="btn-manage-personas">管理</button>
                                <button class="chat-popup-close btn-close-popup">✕</button>
                            </div>
                        </div>
                        <div class="chat-popup-body chat-scroll-area">
                            <div id="persona-list-container" class="persona-list">
                                <!-- 动态生成列表 -->
                            </div>
                        </div>
                        <div class="chat-popup-footer" id="persona-manage-footer" style="display: none; gap: 8px;">
                            <button class="chat-btn-outline" id="btn-select-all-personas" style="flex: 1;">全选</button>
                            <button class="chat-btn-danger" id="btn-delete-selected-personas" style="flex: 2;" disabled>删除所选 (0)</button>
                        </div>
                    </div>
                </div>

                <!-- 2. 新建/编辑人设弹窗 -->
                <div class="chat-popup-overlay" id="persona-edit-popup">
                    <div class="chat-popup-content">
                        <div class="chat-popup-header">
                            <h3 class="chat-popup-title" id="persona-edit-title">新建人设</h3>
                            <button class="chat-popup-close btn-close-popup">✕</button>
                        </div>
                        <div class="chat-popup-body chat-scroll-area">
                            <div class="persona-form">
                                <div class="persona-avatar-upload-box">
                                    <div class="persona-avatar-upload" id="btn-upload-persona-avatar">
                                        <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" id="persona-edit-avatar-preview">
                                        <div class="persona-avatar-overlay"><i class="ph ph-camera"></i></div>
                                    </div>
                                    <p class="persona-avatar-hint">点击更换头像</p>
                                </div>
                                
                                <div class="persona-form-group">
                                    <label>真名</label>
                                    <input type="text" id="persona-edit-realname" class="persona-input" placeholder="输入真实姓名">
                                </div>
                                <div class="persona-form-group">
                                    <label>昵称</label>
                                    <input type="text" id="persona-edit-nickname" class="persona-input" placeholder="输入显示的昵称">
                                </div>
                                <div class="persona-form-group">
                                    <label>个人简介</label>
                                    <textarea id="persona-edit-bio" class="persona-textarea" placeholder="写一段简短的个人介绍..." rows="3"></textarea>
                                </div>
                            </div>
                        </div>
                        <div class="chat-popup-footer">
                            <button class="chat-btn-primary" id="btn-save-persona" style="width: 100%;">保存</button>
                        </div>
                    </div>
                </div>

                <!-- 3. 人设详情弹窗 -->
                <div class="chat-popup-overlay" id="persona-view-popup">
                    <div class="chat-popup-content">
                        <div class="chat-popup-header">
                            <h3 class="chat-popup-title">人设详情</h3>
                            <button class="chat-popup-close btn-close-popup">✕</button>
                        </div>
                        <div class="chat-popup-body chat-scroll-area">
                            <div class="persona-view-header">
                                <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" id="persona-view-avatar" class="persona-view-avatar">
                                <h2 id="persona-view-nickname" class="persona-view-nickname"></h2>
                                <p id="persona-view-realname" class="persona-view-realname"></p>
                            </div>
                            <div class="persona-view-bio-box">
                                <p class="persona-view-bio-label">个人简介</p>
                                <p id="persona-view-bio" class="persona-view-bio-text"></p>
                            </div>
                        </div>
                        <div class="chat-popup-footer" style="display: flex; gap: 8px;">
                            <button class="chat-btn-outline" id="btn-edit-current-persona" style="flex: 1;">编辑</button>
                            <button class="chat-btn-primary" id="btn-set-active-persona" style="flex: 2;">设为当前人设</button>
                        </div>
                    </div>
                </div>

                <!-- 4. 创建选项弹窗 (居中弹出菜单) -->
                <div class="chat-popup-overlay" id="chat-create-popup" style="z-index: 300;">
                    <div class="chat-popup-content" style="max-width: 320px;">
                        <div class="chat-popup-header">
                            <h3 class="chat-popup-title">创建</h3>
                            <button class="chat-popup-close btn-close-popup">✕</button>
                        </div>
                        <div class="chat-popup-body" style="padding: 16px;">
                            <div class="chat-create-menu">
                                <div class="chat-create-menu-item"><div class="chat-create-menu-icon"><i class="ph ph-users-three"></i></div><span>创建群聊</span></div>
                                <div class="chat-create-menu-item" id="btn-menu-create-character"><div class="chat-create-menu-icon"><i class="ph ph-user-plus"></i></div><span>创建角色</span></div>
                                <div class="chat-create-menu-item" id="btn-import-character"><div class="chat-create-menu-icon"><i class="ph ph-file-arrow-down"></i></div><span>导入角色卡</span></div>
                                <div class="chat-create-menu-item"><div class="chat-create-menu-icon"><i class="ph ph-address-book"></i></div><span>添加好友</span></div>
                            </div>
                            <input type="file" id="char-import-upload" accept=".png,.json,.zip" style="display: none;">
                        </div>
                    </div>
                </div>

                <!-- 4.5. 创建角色方式选择弹窗 -->
                <div class="chat-popup-overlay" id="chat-create-character-type-popup" style="z-index: 305;">
                    <div class="chat-popup-content" style="max-width: 320px;">
                        <div class="chat-popup-header">
                            <h3 class="chat-popup-title">创建角色</h3>
                            <button class="chat-popup-close btn-close-popup">✕</button>
                        </div>
                        <div class="chat-popup-body" style="padding: 16px;">
                            <div class="chat-create-menu">
                                <div class="chat-create-menu-item" id="btn-create-char-manual">
                                    <div class="chat-create-menu-icon"><i class="ph ph-pencil-simple"></i></div>
                                    <span>手动创建</span>
                                </div>
                                <div class="chat-create-menu-item" id="btn-create-char-document">
                                    <div class="chat-create-menu-icon"><i class="ph ph-file-text"></i></div>
                                    <span>导入文档创建 (.txt, .docx)</span>
                                </div>
                            </div>
                            <input type="file" id="char-document-upload" accept=".txt,.doc,.docx,.zip" style="display: none;">
                        </div>
                    </div>
                </div>

                <!-- 5. 时区填写教程弹窗 (内嵌) -->
                <div class="chat-popup-overlay" id="timezone-help-popup" style="z-index: 320;">
                    <div class="chat-popup-content" style="max-width: 340px;">
                        <div class="chat-popup-header">
                            <h3 class="chat-popup-title">如何填写时区？</h3>
                            <button class="chat-popup-close btn-close-help">✕</button>
                        </div>
                        <div class="chat-popup-body chat-scroll-area" style="padding: 16px; font-size: 14px; line-height: 1.6; color: var(--text-color);">
                            <p style="margin-bottom: 12px;">为了让系统能准确计算角色当地的时间，这里必须填写标准的<strong>时区代码</strong>（一串英文）。<br>如果不填，默认就是你手机当前的时间。</p>
                            
                            <h4 style="margin: 16px 0 8px; font-size: 15px; color: var(--accent-color);">举个例子：我想填【四川】怎么办？</h4>
                            <p style="margin-bottom: 12px; background: var(--hover-bg); padding: 10px; border-radius: 8px;">中国统一使用的是北京时间（东八区）。所以不论是四川、广东还是东北，你只需要直接点开下拉列表，选择或输入 <strong>Asia/Shanghai</strong> 就可以了！</p>

                            <h4 style="margin: 16px 0 8px; font-size: 15px; color: var(--accent-color);">如果是国外的冷门城市呢？</h4>
                            <p style="margin-bottom: 12px;">如果列表里找不到，你可以去百度或必应搜索：<br><strong>"XX城市 IANA 时区代码"</strong><br>比如搜"悉尼 时区代码"，你会查到 <code style="background: var(--hover-bg); padding: 2px 4px; border-radius: 4px;">Australia/Sydney</code>，把这串英文填进去就行啦。</p>
                        </div>
                        <div class="chat-popup-footer">
                            <button class="chat-btn-primary btn-close-help" style="width: 100%;">我知道了</button>
                        </div>
                    </div>
                </div>

                <!-- 7. 自定义 Alert 弹窗 (Linear风格极简) -->
                <div class="chat-popup-overlay" id="chat-alert-popup" style="z-index: 2000; background-color: rgba(0, 0, 0, 0.4);">
                    <div class="chat-popup-content" style="max-width: 340px; width: 90%; border-radius: 12px; overflow: hidden; background: #ffffff; padding: 24px; box-shadow: 0 24px 48px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06); border: 1px solid rgba(0,0,0,0.08); box-sizing: border-box; text-align: left;">
                        <h3 id="chat-alert-title" style="font-size: 16px; font-weight: 600; color: #18181b; margin: 0 0 12px 0; display: none; letter-spacing: -0.01em;">提示</h3>
                        <p id="chat-alert-message" style="font-size: 14px; color: #52525b; margin: 0 0 24px 0; line-height: 1.6; word-break: break-word;"></p>
                        <p id="chat-alert-details" style="font-size: 12px; color: #71717a; line-height: 1.5; word-break: break-word; display: none; margin-bottom: 24px; text-align: left; background: #f8f8f9; padding: 12px; border-radius: 8px; border: 1px solid #e4e4e7; max-height: 150px; overflow-y: auto; white-space: pre-wrap; font-family: monospace;"></p>
                        <div class="chat-popup-footer" style="display: flex; justify-content: flex-end; gap: 8px; border: none; padding: 0; background: transparent; width: 100%;">
                            <button class="chat-btn-text btn-close-alert" style="padding: 8px 16px; font-size: 13px; font-weight: 500; color: #18181b; background: #f4f4f5; border-radius: 6px; border: 1px solid rgba(0,0,0,0.04); cursor: pointer; transition: all 0.2s ease;">确认</button>
                        </div>
                    </div>
                </div>

                <!-- 6. 创建/编辑角色弹窗 -->
                <div class="chat-popup-overlay" id="character-edit-popup" style="z-index: 310;">
                    <div class="chat-popup-content">
                        <div class="chat-popup-header">
                            <h3 class="chat-popup-title" id="character-edit-title">创建角色</h3>
                            <button class="chat-popup-close btn-close-popup">✕</button>
                        </div>
                        <div class="chat-popup-body chat-scroll-area">
                            <div class="persona-form">
                                <div class="persona-avatar-upload-box">
                                    <div class="persona-avatar-upload" id="btn-upload-character-avatar">
                                        <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" id="character-edit-avatar-preview">
                                        <div class="persona-avatar-overlay"><i class="ph ph-camera"></i></div>
                                    </div>
                                    <p class="persona-avatar-hint">点击设置角色头像</p>
                                </div>
                                
                                <div class="persona-form-group">
                                    <label>真名</label>
                                    <input type="text" id="character-edit-realname" class="persona-input" placeholder="输入角色真实姓名">
                                </div>
                                <div class="persona-form-group">
                                    <label>备注</label>
                                    <input type="text" id="character-edit-nickname" class="persona-input" placeholder="输入列表展示备注名">
                                </div>
                                <div class="persona-form-group">
                                    <label>所属分组</label>
                                    <select id="character-edit-group" class="persona-input" style="appearance: auto; cursor: pointer;"></select>
                                </div>
                                <div class="persona-form-group">
                                    <label>
                                        <span>人设</span>
                                    </label>
                                    <textarea id="character-edit-persona" class="persona-textarea" placeholder="输入角色的人设、性格、背景等..." rows="4"></textarea>
                                </div>
                                <div class="persona-form-group">
                                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                                        <span style="font-size: 13px; color: var(--text-secondary);">时区 (选填，留空默认本地)</span>
                                        <button id="btn-timezone-help" style="background: none; border: none; color: var(--accent-color); font-size: 16px; cursor: pointer; padding: 0;"><i class="ph ph-question"></i></button>
                                    </div>
                                    <label class="toggle-switch-ios" style="display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: normal; color: var(--text-color); cursor: pointer; margin-bottom: 12px; width: fit-content;">
                                        <span style="user-select: none; white-space: nowrap;">自动从人设提取时区</span>
                                        <div style="position: relative; width: 36px; height: 20px; flex-shrink: 0;">
                                            <input type="checkbox" id="ai-timezone-toggle" style="opacity: 0; width: 0; height: 0; position: absolute;">
                                            <span class="ios-slider"></span>
                                        </div>
                                    </label>
                                    <div class="persona-form-group" style="margin-bottom: 0; position: relative;">
                                        <div id="character-edit-timezone-trigger" style="background-color: var(--card-bg); padding: 12px; border-radius: 12px; border: 1px solid var(--border-color); color: var(--text-color); font-size: 14px; width: 100%; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.2s;">
                                            <span id="character-edit-timezone-text" style="color: var(--text-secondary);">跟随本地时间 (默认)</span>
                                            <i class="ph ph-caret-right" style="color: var(--text-secondary);"></i>
                                        </div>
                                        <input type="hidden" id="character-edit-timezone" value="">
                                    </div>
                                </div>
                                <div class="persona-form-group" id="import-greeting-container" style="display: none; margin-bottom: 12px;">
                                    <label class="toggle-switch-ios" style="display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: normal; color: var(--text-color); cursor: pointer; width: fit-content;">
                                        <span style="user-select: none; white-space: nowrap;">导入开场白</span>
                                        <div style="position: relative; width: 36px; height: 20px; flex-shrink: 0;">
                                            <input type="checkbox" id="import-greeting-toggle" checked style="opacity: 0; width: 0; height: 0; position: absolute;">
                                            <span class="ios-slider"></span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div class="chat-popup-footer">
                            <button class="chat-btn-primary" id="btn-save-character" style="width: 100%;">保存</button>
                        </div>
                    </div>
                </div>

                <!-- 8. 聊天/角色设置弹窗 -->
                <div class="chat-popup-overlay" id="character-settings-popup" style="z-index: 330;">
                    <div class="chat-popup-content" style="height: 85%; max-height: 600px; display: flex; flex-direction: column;">
                        <div class="chat-popup-header">
                            <h3 class="chat-popup-title">角色设置</h3>
                            <button class="chat-popup-close btn-close-popup">✕</button>
                        </div>

                        <div class="chat-popup-tabs" style="overflow-x: auto; flex-wrap: nowrap;">
                            <div class="chat-popup-tab active" data-tab="cs-tab-role" style="flex-shrink: 0;">角色</div>
                            <div class="chat-popup-tab" data-tab="cs-tab-user" style="flex-shrink: 0;">我的身份</div>
                            <div class="chat-popup-tab" data-tab="cs-tab-memory" style="flex-shrink: 0;">记忆与设定</div>
                            <div class="chat-popup-tab" data-tab="cs-tab-appearance" style="flex-shrink: 0;">美化</div>
                            <div class="chat-popup-tab" data-tab="cs-tab-api-history" style="flex-shrink: 0;">API 历史</div>
                        </div>

                        <div class="chat-popup-body chat-scroll-area" style="flex: 1; padding: 16px; background-color: var(--app-bg);">
                            
                            <!-- 角色信息卡片 -->
                            <div id="cs-tab-role" class="chat-popup-tab-content active">
                                <div style="background: var(--card-bg); border-radius: 16px; padding: 16px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
                                    <h4 style="font-size: 14px; font-weight: 600; color: var(--text-color); margin-bottom: 12px; margin-top: 0;">角色信息</h4>
                                <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px;">
                                    <div style="position: relative; cursor: pointer; border-radius: 50%; width: 48px; height: 48px; flex-shrink: 0; margin-top: 4px;" id="cs-char-avatar-container" title="点击更换头像">
                                        <img id="cs-char-avatar" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 1px solid var(--border-color); background-color: #f0f0f0;">
                                    </div>
                                    <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 8px;">
                                        <div style="display: flex; align-items: center; border: 1px solid var(--border-color); border-radius: 8px; background: rgba(120, 120, 128, 0.08); box-shadow: inset 0 1px 3px rgba(0,0,0,0.05); padding: 0 12px; overflow: hidden;">
                                            <span style="font-size: 13px; color: var(--text-secondary); width: 36px; flex-shrink: 0; font-weight: 500;">备注</span>
                                            <input type="text" id="cs-char-name" placeholder="角色列表显示的名称" style="width: 100%; border: none; font-weight: 600; font-size: 14px; padding: 10px 0; margin: 0; background: transparent; color: var(--text-color); outline: none;">
                                        </div>
                                        <div style="display: flex; align-items: center; border: 1px solid var(--border-color); border-radius: 8px; background: rgba(120, 120, 128, 0.08); box-shadow: inset 0 1px 3px rgba(0,0,0,0.05); padding: 0 12px; overflow: hidden;">
                                            <span style="font-size: 13px; color: var(--text-secondary); width: 36px; flex-shrink: 0; font-weight: 500;">真名</span>
                                            <input type="text" id="cs-char-realname" placeholder="角色的真实姓名" style="width: 100%; border: none; font-size: 14px; padding: 10px 0; margin: 0; background: transparent; color: var(--text-color); outline: none;">
                                        </div>
                                    </div>
                                </div>
                                <div style="font-size: 13px; font-weight: 500; color: var(--text-secondary); margin-bottom: 8px;">人物描述</div>
                                <textarea id="cs-char-persona" placeholder="输入角色的人设、性格、背景等..." rows="4" style="width: 100%; border: 1px solid var(--border-color); border-radius: 8px; font-size: 13px; padding: 12px; background: rgba(120, 120, 128, 0.08); box-shadow: inset 0 1px 3px rgba(0,0,0,0.05); color: var(--text-color); margin: 0; resize: vertical; min-height: 80px; outline: none;"></textarea>
                                
                                <div class="persona-form-group" style="margin-top: 16px; margin-bottom: 0;">
                                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                                        <label class="toggle-switch-ios" style="display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: normal; color: var(--text-color); cursor: pointer;">
                                            <span style="user-select: none; white-space: nowrap;">启用角色独立时区</span>
                                            <div style="position: relative; width: 36px; height: 20px; flex-shrink: 0;">
                                                <input type="checkbox" id="cs-char-timezone-toggle" style="opacity: 0; width: 0; height: 0; position: absolute;">
                                                <span class="ios-slider"></span>
                                            </div>
                                        </label>
                                    </div>
                                    <div id="cs-char-timezone-container" style="display: none; margin-bottom: 16px;">
                                        <div id="cs-char-timezone-trigger" style="background-color: rgba(120, 120, 128, 0.08); padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border-color); color: var(--text-color); font-size: 13px; width: 100%; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.2s;">
                                            <span id="cs-char-timezone-text" style="color: var(--text-secondary);">跟随本地时间 (默认)</span>
                                            <i class="ph ph-caret-right" style="color: var(--text-secondary);"></i>
                                        </div>
                                        <input type="hidden" id="cs-char-timezone" value="">
                                        <div id="cs-char-timezone-preview" style="font-size: 12px; color: var(--text-secondary); margin-top: 6px; padding-left: 4px;"></div>
                                    </div>

                                    <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 16px; flex-wrap: wrap;">
                                        <span style="font-size: 13px; color: var(--text-color);">连发消息间隔 (秒)</span>
                                        <input type="number" id="cs-char-multi-msg-delay" class="persona-input" value="2" min="0" max="10" step="0.5" style="width: 60px; padding: 6px; min-height: unset; margin: 0; text-align: center;">
                                        <button class="chat-btn-text" id="btn-reset-multi-msg-delay" style="font-size: 13px; padding: 2px 4px; color: #007AFF;">重置</button>
                                        <span style="font-size: 12px; color: var(--text-secondary); margin-left: 4px;">多条消息发出时的等待时间</span>
                                    </div>

                                    <label class="toggle-switch-ios" style="display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: normal; color: var(--text-color); cursor: pointer; margin-bottom: 12px; width: fit-content;">
                                        <span style="user-select: none; white-space: nowrap;">启用双语翻译</span>
                                        <div style="position: relative; width: 36px; height: 20px; flex-shrink: 0;">
                                            <input type="checkbox" id="cs-char-bilingual-toggle" style="opacity: 0; width: 0; height: 0; position: absolute;">
                                            <span class="ios-slider"></span>
                                        </div>
                                    </label>
                                    <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 16px; margin-top: -6px;">开启后，AI回复外语时将自动生成隐藏翻译，点击气泡可查看。</div>

                                    <label class="toggle-switch-ios" style="display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: normal; color: var(--text-color); cursor: pointer; margin-bottom: 12px; width: fit-content;">
                                        <span style="user-select: none; white-space: nowrap;">控制角色回复条数</span>
                                        <div style="position: relative; width: 36px; height: 20px; flex-shrink: 0;">
                                            <input type="checkbox" id="cs-char-multi-msg-toggle" style="opacity: 0; width: 0; height: 0; position: absolute;">
                                            <span class="ios-slider"></span>
                                        </div>
                                    </label>
                                    
                                    <div id="cs-char-multi-msg-options" style="display: none; align-items: center; gap: 12px; margin-bottom: 8px;">
                                        <div style="display: flex; align-items: center; gap: 6px;">
                                            <span style="font-size: 13px; color: var(--text-secondary);">最少</span>
                                            <input type="number" id="cs-char-multi-msg-min" class="persona-input" value="1" min="1" max="5" style="width: 60px; padding: 6px; min-height: unset; margin: 0; text-align: center;">
                                            <span style="font-size: 13px; color: var(--text-secondary);">条</span>
                                        </div>
                                        <div style="display: flex; align-items: center; gap: 6px;">
                                            <span style="font-size: 13px; color: var(--text-secondary);">最多</span>
                                            <input type="number" id="cs-char-multi-msg-max" class="persona-input" value="3" min="1" max="10" style="width: 60px; padding: 6px; min-height: unset; margin: 0; text-align: center;">
                                            <span style="font-size: 13px; color: var(--text-secondary);">条</span>
                                        </div>
                                    </div>
                                    <div style="font-size: 12px; color: var(--text-secondary);">开启后强制要求AI每次回复特定条数的消息。未开启则由AI自由决定（也可能会根据语境分段连发）。</div>
                                </div>

                                <div class="persona-form-group" style="margin-top: 16px; margin-bottom: 0; background: rgba(120, 120, 128, 0.08); padding: 12px; border-radius: 12px;">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                        <span style="font-size: 13px; font-weight: 500; color: var(--text-color);">角色表情包系统</span>
                                    </div>
                                    <div style="display: flex; flex-direction: column; gap: 12px;">
                                        <label class="toggle-switch-ios" style="display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: normal; color: var(--text-color); cursor: pointer;">
                                            <div style="position: relative; width: 36px; height: 20px; flex-shrink: 0;">
                                                <input type="checkbox" id="cs-char-emoji-fallback-toggle" checked style="opacity: 0; width: 0; height: 0; position: absolute;">
                                                <span class="ios-slider"></span>
                                            </div>
                                            <span style="user-select: none;">允许使用用户表情包 (找不到专属时)</span>
                                        </label>
                                        
                                        <div id="cs-char-emoji-fallback-groups-container" style="display: flex; flex-direction: column; gap: 8px; padding-left: 42px;">
                                            <div style="font-size: 12px; color: var(--text-secondary);">选择允许使用的用户表情分组：</div>
                                            <div id="cs-char-emoji-fallback-groups-list" style="display: flex; flex-wrap: wrap; gap: 8px;">
                                            </div>
                                        </div>

                                        <button class="chat-btn-outline" id="btn-manage-char-emojis" style="width: 100%; padding: 8px 0; font-size: 13px; margin-top: 4px; background: var(--app-bg);">
                                            <i class="ph ph-mask-happy"></i> 管理角色专属表情包
                                        </button>
                                    </div>
                                </div>

                                </div>
                            </div>

                            <!-- 用户信息卡片 -->
                            <div id="cs-tab-user" class="chat-popup-tab-content">
                                <div style="background: var(--card-bg); border-radius: 16px; padding: 16px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
                                    <h4 style="font-size: 14px; font-weight: 600; color: var(--text-color); margin-bottom: 12px; margin-top: 0;">当前使用身份</h4>
                                
                                <div class="persona-form-group" style="margin-bottom: 16px; position: relative; z-index: 10;">
                                    <div id="cs-user-persona-dropdown-trigger" style="background-color: var(--app-bg); padding: 10px 12px; border-radius: 10px; border: 1px solid var(--border-color); color: var(--text-color); font-size: 13px; width: 100%; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.2s;">
                                        <span id="cs-user-persona-selected-text">默认全局身份</span>
                                        <i class="ph ph-caret-down" style="color: var(--text-secondary); transition: transform 0.3s;" id="cs-user-persona-caret"></i>
                                    </div>
                                    <div id="cs-user-persona-options-panel" style="display: none; position: absolute; left: 0; right: 0; top: 42px; background-color: #ffffff; border-radius: 12px; border: 1px solid var(--border-color); box-shadow: 0 10px 30px rgba(0,0,0,0.15); z-index: 999; max-height: 200px; overflow-y: auto; padding: 4px; font-size: 14px;">
                                    </div>
                                    <input type="hidden" id="cs-user-persona-select" value="">
                                </div>

                                <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px;">
                                    <div style="position: relative; cursor: pointer; border-radius: 50%; width: 48px; height: 48px; flex-shrink: 0; margin-top: 4px;" id="cs-user-avatar-container" title="点击更换头像">
                                        <img id="cs-user-avatar" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 1px solid var(--border-color); background-color: #f0f0f0;">
                                    </div>
                                    <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 8px;">
                                        <div style="display: flex; align-items: center; border: 1px solid var(--border-color); border-radius: 8px; background: rgba(120, 120, 128, 0.08); box-shadow: inset 0 1px 3px rgba(0,0,0,0.05); padding: 0 12px; overflow: hidden;">
                                            <span style="font-size: 13px; color: var(--text-secondary); width: 36px; flex-shrink: 0; font-weight: 500;">昵称</span>
                                            <input type="text" id="cs-user-name" placeholder="我的昵称 (选填)" style="width: 100%; border: none; font-weight: 600; font-size: 14px; padding: 10px 0; margin: 0; background: transparent; color: var(--text-color); outline: none;">
                                        </div>
                                        <div style="display: flex; align-items: center; border: 1px solid var(--border-color); border-radius: 8px; background: rgba(120, 120, 128, 0.08); box-shadow: inset 0 1px 3px rgba(0,0,0,0.05); padding: 0 12px; overflow: hidden;">
                                            <span style="font-size: 13px; color: var(--text-secondary); width: 36px; flex-shrink: 0; font-weight: 500;">真名</span>
                                            <input type="text" id="cs-user-realname" placeholder="我的真名" style="width: 100%; border: none; font-size: 14px; padding: 10px 0; margin: 0; background: transparent; color: var(--text-color); outline: none;">
                                        </div>
                                    </div>
                                </div>
                                <div style="font-size: 13px; font-weight: 500; color: var(--text-secondary); margin-bottom: 8px;">人物描述</div>
                                <textarea id="cs-user-bio" placeholder="写一段简短的个人介绍..." rows="3" style="width: 100%; border: 1px solid var(--border-color); border-radius: 8px; font-size: 13px; padding: 12px; background: rgba(120, 120, 128, 0.08); box-shadow: inset 0 1px 3px rgba(0,0,0,0.05); color: var(--text-color); margin: 0; resize: vertical; min-height: 60px; outline: none;"></textarea>
                                
                                <div class="persona-form-group" style="margin-top: 16px; margin-bottom: 0;">
                                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                                        <label class="toggle-switch-ios" style="display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: normal; color: var(--text-color); cursor: pointer;">
                                            <span style="user-select: none; white-space: nowrap;">启用我的独立时区</span>
                                            <div style="position: relative; width: 36px; height: 20px; flex-shrink: 0;">
                                                <input type="checkbox" id="cs-user-timezone-toggle" style="opacity: 0; width: 0; height: 0; position: absolute;">
                                                <span class="ios-slider"></span>
                                            </div>
                                        </label>
                                    </div>
                                    <div id="cs-user-timezone-container" style="display: none; margin-bottom: 8px;">
                                        <div id="cs-user-timezone-trigger" style="background-color: rgba(120, 120, 128, 0.08); padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border-color); color: var(--text-color); font-size: 13px; width: 100%; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.2s;">
                                            <span id="cs-user-timezone-text" style="color: var(--text-secondary);">跟随本地时间 (默认)</span>
                                            <i class="ph ph-caret-right" style="color: var(--text-secondary);"></i>
                                        </div>
                                        <input type="hidden" id="cs-user-timezone" value="">
                                        <div id="cs-user-timezone-preview" style="font-size: 12px; color: var(--text-secondary); margin-top: 6px; padding-left: 4px;"></div>
                                    </div>
                                </div>
                                
                                </div>
                            </div>

                            <!-- 记忆与设定 -->
                            <div id="cs-tab-memory" class="chat-popup-tab-content">
                                <div style="background: var(--card-bg); border-radius: 16px; padding: 16px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
                                    <h4 style="font-size: 14px; font-weight: 600; color: var(--text-color); margin-bottom: 16px; margin-top: 0;">记忆与上下文</h4>
                                
                                <div class="persona-form-group" style="margin-bottom: 16px; position: relative;">
                                    <label style="display: flex; align-items: center; gap: 6px; justify-content: space-between;">
                                        <span><i class="ph ph-book-open"></i> 绑定的世界书 (Worldbook)</span>
                                    </label>
                                    
                                    <!-- 自定义美化下拉框触发器 -->
                                    <div id="cs-worldbook-dropdown-trigger" style="background-color: var(--app-bg); padding: 12px 16px; border-radius: 12px; border: 1px solid var(--border-color); color: var(--text-color); font-size: 14px; width: 100%; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.2s;">
                                        <span id="cs-worldbook-selected-text">不绑定世界书</span>
                                        <i class="ph ph-caret-down" style="color: var(--text-secondary); transition: transform 0.3s;" id="cs-worldbook-caret"></i>
                                    </div>
                                    
                                    <!-- 自定义下拉选项面板 -->
                                        <div id="cs-worldbook-options-panel" style="display: none; position: absolute; left: 0; right: 0; top: 76px; background-color: #ffffff; border-radius: 12px; border: 1px solid var(--border-color); box-shadow: 0 10px 30px rgba(0,0,0,0.15); z-index: 999; max-height: 200px; overflow-y: auto; padding: 4px; font-size: 14px;">
                                        <!-- 动态选项 -->
                                    </div>
                                    
                                    <!-- 隐藏的真实数据存储 -->
                                    <input type="hidden" id="cs-worldbook-select" value="">

                                    <div style="font-size: 12px; color: var(--text-secondary); margin-top: 6px;">绑定后，角色的回复会自动参考世界书中的设定条目。</div>
                                </div>

                                <div class="persona-form-group" style="margin-bottom: 16px;">
                                    <label style="display: flex; align-items: center; gap: 6px; justify-content: space-between;">
                                        <span><i class="ph ph-clock-counter-clockwise"></i> 短期记忆上下文轮数</span>
                                    </label>
                                    <input type="number" id="cs-short-term-memory" class="persona-input" placeholder="例如: 20" value="20" min="1" max="100">
                                    <div style="font-size: 12px; color: var(--text-secondary); margin-top: 6px;">设置模型每次回复时参考的最近历史消息条数。</div>
                                </div>

                                <div class="persona-form-group" style="margin-bottom: 0;">
                                    <label style="display: flex; align-items: center; gap: 6px; justify-content: space-between;">
                                        <span><i class="ph ph-brain"></i> 长期记忆 / 总结</span>
                                    </label>
                                    
                                    <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 8px;">
                                        <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(120, 120, 128, 0.08); border-radius: 8px; padding: 10px 12px;">
                                            <span style="font-size: 13px; color: var(--text-color);">自动总结 (消息条数)</span>
                                            <div style="display: flex; align-items: center; gap: 8px;">
                                                <input type="number" id="cs-auto-summary-threshold" class="persona-input" placeholder="0为关闭" value="0" min="0" max="500" style="width: 70px; padding: 6px 10px; min-height: unset; margin: 0; font-size: 13px;">
                                            </div>
                                        </div>
                                        
                                        <div style="display: flex; gap: 8px;">
                                            <button class="chat-btn-outline" id="btn-manual-summary" style="flex: 1; padding: 8px 0; font-size: 13px;">
                                                <i class="ph ph-sparkle"></i> 手动总结
                                            </button>
                                            <button class="chat-btn-primary" id="btn-memory-library" style="flex: 1; padding: 8px 0; font-size: 13px;">
                                                <i class="ph ph-books"></i> 记忆库
                                            </button>
                                        </div>
                                        <div style="font-size: 12px; color: var(--text-secondary);">设置大于0的数字将在对话达到该条数时自动总结对话并存入记忆库。</div>
                                    </div>
                                </div>
                                </div>

                                <!-- TOKEN 统计卡片 -->
                                <div style="background: var(--card-bg); border-radius: 16px; padding: 16px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
                                    <div id="cs-token-stats-trigger" style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
                                        <h4 style="font-size: 14px; font-weight: 600; color: var(--text-color); margin: 0;">TOKEN 预估</h4>
                                        <i class="ph ph-caret-down" id="cs-token-stats-caret" style="color: var(--text-secondary); transition: transform 0.3s; transform: rotate(-90deg);"></i>
                                    </div>
                                    
                                    <div id="cs-token-stats-panel" style="display: none; margin-top: 16px;">
                                        <div style="display: flex; flex-direction: column; gap: 12px;">
                                        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed var(--border-color); padding-bottom: 8px;">
                                            <span style="font-size: 13px; color: var(--text-color);">单次回复预估 (上下文)</span>
                                            <span id="cs-token-single" style="font-size: 14px; font-weight: 600; color: var(--accent-color); font-variant-numeric: tabular-nums;">0</span>
                                        </div>
                                        <div style="padding-left: 8px; border-left: 2px solid var(--border-color); display: flex; flex-direction: column; gap: 6px; margin-top: -4px;">
                                            <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--text-secondary);">
                                                <span>基础设定</span><span id="cs-token-base">0</span>
                                            </div>
                                            <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--text-secondary);">
                                                <span>世界书 (生效中)</span><span id="cs-token-worldbook">0</span>
                                            </div>
                                            <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--text-secondary);">
                                                <span>长期记忆</span><span id="cs-token-longterm">0</span>
                                            </div>
                                            <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--text-secondary);">
                                                <span>短期记忆 (最近历史)</span><span id="cs-token-shortterm">0</span>
                                            </div>
                                        </div>
                                        
                                            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                                                <span style="font-size: 13px; color: var(--text-color);">全部历史总量 (未截断)</span>
                                                <span id="cs-token-total" style="font-size: 14px; font-weight: 600; color: var(--text-color); font-variant-numeric: tabular-nums;">0</span>
                                            </div>
                                        </div>
                                        <div style="font-size: 11px; color: var(--text-secondary); margin-top: 12px; text-align: right;">* 此为基于字符的粗略估算，仅供参考</div>
                                    </div>
                                </div>

                                <div style="background: var(--card-bg); border-radius: 16px; padding: 16px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
                                    <button class="chat-btn-outline" id="btn-clear-chat-history" style="width: 100%; padding: 12px 0; font-size: 14px; border-radius: 12px; display: flex; align-items: center; justify-content: center; gap: 6px; color: #FF3B30; border-color: rgba(255, 59, 48, 0.3);">
                                        <i class="ph ph-trash"></i> 清空所有聊天记录
                                    </button>
                                </div>
                            </div>
                            
                            <!-- API 历史 -->
                            <div id="cs-tab-api-history" class="chat-popup-tab-content">
                                <div style="background: var(--card-bg); border-radius: 16px; padding: 16px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                                        <h4 style="font-size: 14px; font-weight: 600; color: var(--text-color); margin: 0;">API 调用记录</h4>
                                        <label class="toggle-switch-ios" style="display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: normal; color: var(--text-color); cursor: pointer;">
                                            <span style="user-select: none; white-space: nowrap; font-size: 12px; color: var(--text-secondary);">记录 API 历史</span>
                                            <div style="position: relative; width: 36px; height: 20px; flex-shrink: 0;">
                                                <input type="checkbox" id="cs-api-history-toggle" style="opacity: 0; width: 0; height: 0; position: absolute;">
                                                <span class="ios-slider"></span>
                                            </div>
                                        </label>
                                    </div>
                                    
                                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; background: rgba(120, 120, 128, 0.08); border-radius: 8px; padding: 10px 12px;">
                                        <span style="font-size: 13px; color: var(--text-color);">保留最近记录条数</span>
                                        <div style="display: flex; align-items: center; gap: 8px;">
                                            <input type="number" id="cs-api-history-limit" class="persona-input" placeholder="例如: 50" value="50" min="10" max="500" style="width: 70px; padding: 6px 10px; min-height: unset; margin: 0; font-size: 13px;">
                                        </div>
                                    </div>
                                    
                                    <div style="display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;">
                                        <button class="chat-btn-outline" id="btn-api-history-select-all" style="flex: 1; padding: 6px 0; font-size: 12px; min-width: 60px;">全选</button>
                                        <button class="chat-btn-outline" id="btn-api-history-export-selected" style="flex: 1; padding: 6px 0; font-size: 12px; min-width: 70px;" disabled>导出所选</button>
                                        <button class="chat-btn-outline" id="btn-api-history-delete-selected" style="flex: 1; padding: 6px 0; font-size: 12px; color: #FF3B30; border-color: rgba(255, 59, 48, 0.3); min-width: 70px;" disabled>删除所选</button>
                                        <button class="chat-btn-outline" id="btn-api-history-clear-all" style="flex: 1; padding: 6px 0; font-size: 12px; color: #FF3B30; border-color: rgba(255, 59, 48, 0.3); min-width: 70px;">全部清空</button>
                                    </div>

                                    <div id="cs-api-history-list" style="display: flex; flex-direction: column; gap: 8px; max-height: 300px; overflow-y: auto; padding-right: 4px; border: 1px solid var(--border-color); border-radius: 8px; padding: 8px; background: #fafafa;">
                                        <!-- 动态生成 API 历史列表 -->
                                        <div style="text-align: center; color: var(--text-secondary); font-size: 12px; padding: 20px 0;">暂无记录</div>
                                    </div>
                                </div>
                            </div>

                            <!-- 美化 -->
                            <div id="cs-tab-appearance" class="chat-popup-tab-content">
                                <div style="background: var(--card-bg); border-radius: 16px; padding: 16px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
                                    <h4 style="font-size: 14px; font-weight: 600; color: var(--text-color); margin-bottom: 16px; margin-top: 0;">外观与美化</h4>
                                    
                                    <div class="persona-form-group" style="margin-bottom: 16px;">
                                        <label style="display: flex; align-items: center; gap: 6px; justify-content: space-between;">
                                            <span><i class="ph ph-drop"></i> 顶栏透明度</span>
                                            <div style="display: flex; align-items: center; gap: 8px;">
                                                <button class="chat-btn-text" id="btn-reset-topbar-transparency" style="font-size: 12px; padding: 2px; color: #007AFF;">重置</button>
                                                <span id="cs-topbar-transparency-val" style="font-size: 13px; color: var(--text-secondary); width: 32px; text-align: right;">90%</span>
                                            </div>
                                        </label>
                                        <input type="range" id="cs-topbar-transparency" min="0" max="100" value="90" style="width: 100%; margin-top: 8px;">
                                        
                                        <label style="display: flex; align-items: center; gap: 6px; justify-content: space-between; margin-top: 12px;">
                                            <span><i class="ph ph-drop"></i> 底栏透明度</span>
                                            <div style="display: flex; align-items: center; gap: 8px;">
                                                <button class="chat-btn-text" id="btn-reset-bottombar-transparency" style="font-size: 12px; padding: 2px; color: #007AFF;">重置</button>
                                                <span id="cs-bottombar-transparency-val" style="font-size: 13px; color: var(--text-secondary); width: 32px; text-align: right;">90%</span>
                                            </div>
                                        </label>
                                        <input type="range" id="cs-bottombar-transparency" min="0" max="100" value="90" style="width: 100%; margin-top: 8px;">
                                        
                                        <div style="font-size: 12px; color: var(--text-secondary); margin-top: 6px;">分别调节聊天界面顶部和底部背景的透明度（不影响文字和图标）。</div>
                                    </div>

                                    <div class="persona-form-group" style="margin-bottom: 16px;">
                                        <label style="display: flex; align-items: center; gap: 6px; justify-content: space-between;">
                                            <span><i class="ph ph-image"></i> 聊天壁纸</span>
                                            <button class="chat-btn-text" id="btn-clear-chat-bg" style="font-size: 12px; padding: 2px; color: #FF3B30;">重置</button>
                                        </label>
                                        
                                        <div style="display: flex; gap: 12px; align-items: flex-start; margin-top: 8px;">
                                            <div id="btn-upload-chat-bg" style="width: 80px; height: 120px; border-radius: 8px; background: rgba(120, 120, 128, 0.08); border: 1px dashed var(--border-color); display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; position: relative; overflow: hidden; flex-shrink: 0; transition: border-color 0.2s;">
                                                <img id="chat-bg-preview" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" style="position: absolute; width: 100%; height: 100%; object-fit: cover; opacity: 0; transition: opacity 0.2s; z-index: 2;">
                                                <i class="ph ph-upload-simple" style="font-size: 20px; color: var(--text-secondary); margin-bottom: 4px; position: relative; z-index: 1;"></i>
                                                <span style="font-size: 10px; color: var(--text-secondary); position: relative; z-index: 1;">点击上传</span>
                                            </div>
                                            
                                            <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
                                                <input type="text" id="chat-bg-url-input" class="persona-input" placeholder="或输入网络图片URL..." style="font-size: 12px; padding: 10px 12px; margin: 0; min-height: 0;">
                                                <div style="font-size: 11px; color: var(--text-secondary); line-height: 1.4;">支持本地上传图片，或直接粘贴图片网络链接。建议选择背景干净的图片以确保聊天清晰。</div>
                                            </div>
                                        </div>
                                        <input type="file" id="input-upload-chat-bg" accept="image/*" style="display: none;">
                                    </div>

                                    <div class="persona-form-group" style="margin-bottom: 16px; position: relative;">
                                        <label style="display: flex; align-items: center; gap: 6px; justify-content: space-between;">
                                            <span><i class="ph ph-user-circle"></i> 头像显示策略</span>
                                        </label>
                                        
                                        <div id="cs-avatar-display-dropdown-trigger" style="background-color: var(--app-bg); padding: 12px 16px; border-radius: 12px; border: 1px solid var(--border-color); color: var(--text-color); font-size: 14px; width: 100%; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.2s;">
                                            <span id="cs-avatar-display-selected-text">隐藏用户头像 (默认)</span>
                                            <i class="ph ph-caret-down" style="color: var(--text-secondary); transition: transform 0.3s;" id="cs-avatar-display-caret"></i>
                                        </div>
                                        
                                        <div id="cs-avatar-display-options-panel" style="display: none; position: absolute; left: 0; right: 0; top: 76px; background-color: #ffffff; border-radius: 12px; border: 1px solid var(--border-color); box-shadow: 0 10px 30px rgba(0,0,0,0.15); z-index: 999; max-height: 200px; overflow-y: auto; padding: 4px; font-size: 14px;">
                                        </div>
                                        
                                        <input type="hidden" id="cs-avatar-display-select" value="hide_me">
                                    </div>

                                    <div class="persona-form-group" style="margin-bottom: 16px; position: relative;">
                                        <label style="display: flex; align-items: center; gap: 6px; justify-content: space-between;">
                                            <span><i class="ph ph-square-half"></i> 角色头像形状</span>
                                        </label>
                                        <div id="cs-char-avatar-shape-trigger" style="background-color: var(--app-bg); padding: 12px 16px; border-radius: 12px; border: 1px solid var(--border-color); color: var(--text-color); font-size: 14px; width: 100%; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.2s;">
                                            <span id="cs-char-avatar-shape-text">圆形 (默认)</span>
                                            <i class="ph ph-caret-right" style="color: var(--text-secondary);"></i>
                                        </div>
                                        <input type="hidden" id="cs-char-avatar-shape-val" value="">

                                        <label style="display: flex; align-items: center; gap: 6px; justify-content: space-between; margin-top: 12px;">
                                            <span><i class="ph ph-square-half"></i> 用户头像形状</span>
                                        </label>
                                        <div id="cs-user-avatar-shape-trigger" style="background-color: var(--app-bg); padding: 12px 16px; border-radius: 12px; border: 1px solid var(--border-color); color: var(--text-color); font-size: 14px; width: 100%; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.2s;">
                                            <span id="cs-user-avatar-shape-text">圆形 (默认)</span>
                                            <i class="ph ph-caret-right" style="color: var(--text-secondary);"></i>
                                        </div>
                                        <input type="hidden" id="cs-user-avatar-shape-val" value="">
                                        <div style="font-size: 12px; color: var(--text-secondary); margin-top: 6px;">分别设置角色和用户的头像形状，支持预设及自定义CSS。</div>
                                    </div>

                                    <div class="persona-form-group" style="margin-bottom: 16px; position: relative;">
                                        <label style="display: flex; align-items: center; gap: 6px; justify-content: space-between;">
                                            <span><i class="ph ph-minus"></i> 顶栏样式</span>
                                        </label>
                                        
                                        <div id="cs-topbar-style-dropdown-trigger" style="background-color: var(--app-bg); padding: 12px 16px; border-radius: 12px; border: 1px solid var(--border-color); color: var(--text-color); font-size: 14px; width: 100%; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.2s;">
                                            <span id="cs-topbar-style-selected-text">默认极简</span>
                                            <i class="ph ph-caret-down" style="color: var(--text-secondary); transition: transform 0.3s;" id="cs-topbar-style-caret"></i>
                                        </div>
                                        
                                        <div id="cs-topbar-style-options-panel" style="display: none; position: absolute; left: 0; right: 0; top: 76px; background-color: #ffffff; border-radius: 12px; border: 1px solid var(--border-color); box-shadow: 0 10px 30px rgba(0,0,0,0.15); z-index: 999; max-height: 200px; overflow-y: auto; padding: 4px; font-size: 14px;">
                                        </div>
                                        
                                        <input type="hidden" id="cs-topbar-style-select" value="default">
                                    </div>

                                    <!-- 极简模式：拍立得设置项 (默认隐藏) -->
                                    <div id="cs-polaroid-settings-container" style="display: none; margin-bottom: 16px; padding: 12px; background: rgba(120, 120, 128, 0.08); border-radius: 12px;">
                                        <label style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                                            <span style="font-size: 13px; font-weight: 500; color: var(--text-color);">附挂拍立得位置</span>
                                        </label>
                                        <select id="cs-polaroid-position" class="persona-input" style="appearance: auto; cursor: pointer; margin-bottom: 12px; font-size: 13px;">
                                            <option value="none">不显示</option>
                                            <option value="left">靠左挂载</option>
                                            <option value="right">靠右挂载</option>
                                        </select>

                                        <label style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                                            <span style="font-size: 13px; font-weight: 500; color: var(--text-color);">附挂拍立得缩放大小</span>
                                            <span id="cs-polaroid-size-val" style="font-size: 12px; color: var(--text-secondary);">100%</span>
                                        </label>
                                        <input type="range" id="cs-polaroid-size-range" min="0" max="2000" value="100" style="width: 100%; margin-bottom: 8px;">
                                        <div style="display: flex; gap: 8px;">
                                            <input type="number" id="cs-polaroid-size-input" class="persona-input" value="100" style="flex: 1; padding: 6px; min-height: unset; margin: 0; text-align: center; font-size: 13px;">
                                            <button class="chat-btn-text" id="btn-reset-polaroid-size" style="font-size: 12px; padding: 0 8px; color: #007AFF;">重置</button>
                                        </div>

                                        <label style="display: flex; align-items: center; justify-content: space-between; margin-top: 12px; margin-bottom: 8px;">
                                            <span style="font-size: 13px; font-weight: 500; color: var(--text-color);">水平偏移 (X轴)</span>
                                            <span id="cs-polaroid-x-val" style="font-size: 12px; color: var(--text-secondary);">0px</span>
                                        </label>
                                        <input type="range" id="cs-polaroid-x-range" min="-5000" max="5000" value="0" style="width: 100%; margin-bottom: 8px;">
                                        <div style="display: flex; gap: 8px;">
                                            <input type="number" id="cs-polaroid-x-input" class="persona-input" value="0" style="flex: 1; padding: 6px; min-height: unset; margin: 0; text-align: center; font-size: 13px;">
                                            <button class="chat-btn-text" id="btn-reset-polaroid-x" style="font-size: 12px; padding: 0 8px; color: #007AFF;">重置</button>
                                        </div>

                                        <label style="display: flex; align-items: center; justify-content: space-between; margin-top: 12px; margin-bottom: 8px;">
                                            <span style="font-size: 13px; font-weight: 500; color: var(--text-color);">垂直偏移 (Y轴)</span>
                                            <span id="cs-polaroid-y-val" style="font-size: 12px; color: var(--text-secondary);">0px</span>
                                        </label>
                                        <input type="range" id="cs-polaroid-y-range" min="-5000" max="5000" value="0" style="width: 100%; margin-bottom: 8px;">
                                        <div style="display: flex; gap: 8px;">
                                            <input type="number" id="cs-polaroid-y-input" class="persona-input" value="0" style="flex: 1; padding: 6px; min-height: unset; margin: 0; text-align: center; font-size: 13px;">
                                            <button class="chat-btn-text" id="btn-reset-polaroid-y" style="font-size: 12px; padding: 0 8px; color: #007AFF;">重置</button>
                                        </div>
                                    </div>

                                    <div class="persona-form-group" style="margin-bottom: 16px; position: relative;">
                                        <label style="display: flex; align-items: center; gap: 6px; justify-content: space-between;">
                                            <span><i class="ph ph-chat-circle"></i> 气泡样式</span>
                                        </label>
                                        
                                        <div id="cs-bubble-style-dropdown-trigger" style="background-color: var(--app-bg); padding: 12px 16px; border-radius: 12px; border: 1px solid var(--border-color); color: var(--text-color); font-size: 14px; width: 100%; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.2s;">
                                            <span id="cs-bubble-style-selected-text">默认极简</span>
                                            <i class="ph ph-caret-down" style="color: var(--text-secondary); transition: transform 0.3s;" id="cs-bubble-style-caret"></i>
                                        </div>
                                        
                                        <div id="cs-bubble-style-options-panel" style="display: none; position: absolute; left: 0; right: 0; top: 76px; background-color: #ffffff; border-radius: 12px; border: 1px solid var(--border-color); box-shadow: 0 10px 30px rgba(0,0,0,0.15); z-index: 999; max-height: 200px; overflow-y: auto; padding: 4px; font-size: 14px;">
                                        </div>
                                        
                                        <input type="hidden" id="cs-bubble-style-select" value="default">
                                    </div>

                                    <div class="persona-form-group" style="margin-bottom: 16px; position: relative;">
                                        <label style="display: flex; align-items: center; gap: 6px; justify-content: space-between;">
                                            <span><i class="ph ph-translate"></i> 翻译显示位置</span>
                                        </label>
                                        
                                        <div id="cs-translation-pos-dropdown-trigger" style="background-color: var(--app-bg); padding: 12px 16px; border-radius: 12px; border: 1px solid var(--border-color); color: var(--text-color); font-size: 14px; width: 100%; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.2s;">
                                            <span id="cs-translation-pos-selected-text">在气泡内</span>
                                            <i class="ph ph-caret-down" style="color: var(--text-secondary); transition: transform 0.3s;" id="cs-translation-pos-caret"></i>
                                        </div>
                                        
                                        <div id="cs-translation-pos-options-panel" style="display: none; position: absolute; left: 0; right: 0; top: 76px; background-color: #ffffff; border-radius: 12px; border: 1px solid var(--border-color); box-shadow: 0 10px 30px rgba(0,0,0,0.15); z-index: 999; max-height: 200px; overflow-y: auto; padding: 4px; font-size: 14px;">
                                        </div>
                                        
                                        <input type="hidden" id="cs-translation-pos-select" value="inside">
                                    </div>

                                    <div class="persona-form-group" style="margin-bottom: 16px; position: relative;">
                                        <label style="display: flex; align-items: center; gap: 6px; justify-content: space-between;">
                                            <span><i class="ph ph-quotes"></i> 引用显示位置</span>
                                        </label>
                                        
                                        <div id="cs-quote-style-dropdown-trigger" style="background-color: var(--app-bg); padding: 12px 16px; border-radius: 12px; border: 1px solid var(--border-color); color: var(--text-color); font-size: 14px; width: 100%; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.2s;">
                                            <span id="cs-quote-style-selected-text">在气泡内 (微信风格)</span>
                                            <i class="ph ph-caret-down" style="color: var(--text-secondary); transition: transform 0.3s;" id="cs-quote-style-caret"></i>
                                        </div>
                                        
                                        <div id="cs-quote-style-options-panel" style="display: none; position: absolute; left: 0; right: 0; top: 76px; background-color: #ffffff; border-radius: 12px; border: 1px solid var(--border-color); box-shadow: 0 10px 30px rgba(0,0,0,0.15); z-index: 999; max-height: 200px; overflow-y: auto; padding: 4px; font-size: 14px;">
                                        </div>
                                        
                                        <input type="hidden" id="cs-quote-style-select" value="inside">
                                    </div>

                                    <div class="persona-form-group" style="margin-bottom: 16px;">
                                        <label style="display: flex; align-items: center; gap: 6px; justify-content: space-between;">
                                            <span><i class="ph ph-palette"></i> 气泡颜色 (对方)</span>
                                        </label>
                                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                                            <input type="color" id="cs-bubble-them-bg" value="#EFEFEF" style="width: 40px; height: 32px; border: none; border-radius: 8px; cursor: pointer; padding: 0; background: transparent;">
                                            <span style="font-size: 13px; color: var(--text-secondary);">背景色</span>
                                            
                                            <input type="color" id="cs-bubble-them-text" value="#111111" style="width: 40px; height: 32px; border: none; border-radius: 8px; cursor: pointer; padding: 0; background: transparent; margin-left: 12px;">
                                            <span style="font-size: 13px; color: var(--text-secondary);">文字色</span>
                                        </div>
                                        
                                        <label style="display: flex; align-items: center; gap: 6px; justify-content: space-between; margin-top: 12px;">
                                            <span><i class="ph ph-palette"></i> 气泡颜色 (我方)</span>
                                        </label>
                                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                                            <input type="color" id="cs-bubble-me-bg" value="#111111" style="width: 40px; height: 32px; border: none; border-radius: 8px; cursor: pointer; padding: 0; background: transparent;">
                                            <span style="font-size: 13px; color: var(--text-secondary);">背景色</span>
                                            
                                            <input type="color" id="cs-bubble-me-text" value="#ffffff" style="width: 40px; height: 32px; border: none; border-radius: 8px; cursor: pointer; padding: 0; background: transparent; margin-left: 12px;">
                                            <span style="font-size: 13px; color: var(--text-secondary);">文字色</span>
                                        </div>

                                        <div style="font-size: 12px; font-weight: 500; color: var(--text-secondary); margin-bottom: 8px;">预设主题</div>
                                        <div style="display: flex; flex-wrap: wrap; gap: 10px;" id="cs-bubble-presets">
                                            <!-- JS 动态生成预设圆点 -->
                                        </div>
                                    </div>

                                    <div class="persona-form-group" style="margin-bottom: 16px;">
                                        <label style="display: flex; align-items: center; gap: 6px; justify-content: space-between;">
                                            <span><i class="ph ph-code"></i> 自定义气泡 CSS</span>
                                            <div style="display: flex; gap: 8px;">
                                                <button class="chat-btn-text" id="btn-save-css-preset" style="font-size: 12px; padding: 2px; color: #007AFF;">存为预设</button>
                                                <button class="chat-btn-text" id="btn-import-bubble-css" style="font-size: 12px; padding: 2px;">导入</button>
                                                <button class="chat-btn-text" id="btn-export-bubble-css" style="font-size: 12px; padding: 2px;">导出</button>
                                                <button class="chat-btn-text" id="btn-reset-bubble-css" style="font-size: 12px; padding: 2px; color: #FF3B30;">重置</button>
                                            </div>
                                        </label>
                                        <textarea id="cs-bubble-custom-css" class="persona-textarea" placeholder="输入自定义 CSS 代码，将作用于聊天气泡...&#10;例如：.chat-bubble-row.me .chat-bubble { border-radius: 0; }" rows="4" style="font-family: monospace; font-size: 12px;"></textarea>
                                        <input type="file" id="input-import-bubble-css" accept=".css,.txt" style="display: none;">
                                    </div>

                                    <div class="persona-form-group" style="margin-bottom: 16px; position: relative;">
                                        <label style="display: flex; align-items: center; gap: 6px; justify-content: space-between;">
                                            <span><i class="ph ph-clock-user"></i> 消息时间戳位置</span>
                                        </label>
                                        
                                        <div id="cs-msg-time-pos-dropdown-trigger" style="background-color: var(--app-bg); padding: 12px 16px; border-radius: 12px; border: 1px solid var(--border-color); color: var(--text-color); font-size: 14px; width: 100%; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.2s;">
                                            <span id="cs-msg-time-pos-selected-text">不显示</span>
                                            <i class="ph ph-caret-down" style="color: var(--text-secondary); transition: transform 0.3s;" id="cs-msg-time-pos-caret"></i>
                                        </div>
                                        
                                        <div id="cs-msg-time-pos-options-panel" style="display: none; position: absolute; left: 0; right: 0; top: 76px; background-color: #ffffff; border-radius: 12px; border: 1px solid var(--border-color); box-shadow: 0 10px 30px rgba(0,0,0,0.15); z-index: 999; max-height: 200px; overflow-y: auto; padding: 4px; font-size: 14px;">
                                        </div>
                                        
                                        <input type="hidden" id="cs-msg-time-pos-select" value="none">
                                    </div>

                                    <div class="persona-form-group" style="margin-bottom: 16px; position: relative;">
                                        <label style="display: flex; align-items: center; gap: 6px; justify-content: space-between;">
                                            <span><i class="ph ph-clock-user"></i> 消息时间戳格式</span>
                                        </label>
                                        
                                        <div id="cs-msg-time-format-dropdown-trigger" style="background-color: var(--app-bg); padding: 12px 16px; border-radius: 12px; border: 1px solid var(--border-color); color: var(--text-color); font-size: 14px; width: 100%; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.2s;">
                                            <span id="cs-msg-time-format-selected-text">时:分 (HH:mm)</span>
                                            <i class="ph ph-caret-down" style="color: var(--text-secondary); transition: transform 0.3s;" id="cs-msg-time-format-caret"></i>
                                        </div>
                                        
                                        <div id="cs-msg-time-format-options-panel" style="display: none; position: absolute; left: 0; right: 0; top: 76px; background-color: #ffffff; border-radius: 12px; border: 1px solid var(--border-color); box-shadow: 0 10px 30px rgba(0,0,0,0.15); z-index: 999; max-height: 200px; overflow-y: auto; padding: 4px; font-size: 14px;">
                                        </div>
                                        
                                        <input type="hidden" id="cs-msg-time-format-select" value="hm">
                                    </div>

                                    <div class="persona-form-group" id="cs-msg-time-custom-container" style="display: none; margin-bottom: 16px; padding: 12px; background: rgba(120, 120, 128, 0.08); border-radius: 12px;">
                                        <label style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                                            <span style="font-size: 13px; font-weight: 500; color: var(--text-color);">自定义格式输入</span>
                                        </label>
                                        <input type="text" id="cs-msg-time-custom-input" class="persona-input" placeholder="例如: OVO {HH}:{mm}:{ss} OVO" value="{HH}:{mm}:{ss}" style="background: var(--app-bg); margin-bottom: 0;">
                                        <div style="font-size: 12px; color: var(--text-secondary); margin-top: 6px; line-height: 1.4;">
                                            支持占位符: <code style="background: rgba(0,0,0,0.05); padding: 2px 4px; border-radius: 4px;">{HH}</code>小时, <code style="background: rgba(0,0,0,0.05); padding: 2px 4px; border-radius: 4px;">{mm}</code>分钟, <code style="background: rgba(0,0,0,0.05); padding: 2px 4px; border-radius: 4px;">{ss}</code>秒<br>其他文字/表情原样显示
                                        </div>
                                    </div>

                                    <div class="persona-form-group" style="margin-bottom: 16px; position: relative;">
                                        <label style="display: flex; align-items: center; justify-content: space-between;">
                                            <span><i class="ph ph-clock"></i> 输入框上方显示当地时间</span>
                                            <label class="toggle-switch-ios" style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                                                <div style="position: relative; width: 36px; height: 20px; flex-shrink: 0;">
                                                    <input type="checkbox" id="cs-show-local-time-toggle" style="opacity: 0; width: 0; height: 0; position: absolute;">
                                                    <span class="ios-slider"></span>
                                                </div>
                                            </label>
                                        </label>
                                        <div style="font-size: 12px; color: var(--text-secondary); margin-top: 6px;">开启后，将在聊天界面的输入框上方实时显示各方所在时区的当地时间。</div>
                                    </div>

                                    <div class="persona-form-group" style="margin-bottom: 16px; position: relative;">
                                        <label style="display: flex; align-items: center; justify-content: space-between;">
                                            <span><i class="ph ph-eye-slash"></i> 隐藏居中提示消息</span>
                                            <label class="toggle-switch-ios" style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                                                <div style="position: relative; width: 36px; height: 20px; flex-shrink: 0;">
                                                    <input type="checkbox" id="cs-hide-system-msg-toggle" style="opacity: 0; width: 0; height: 0; position: absolute;">
                                                    <span class="ios-slider"></span>
                                                </div>
                                            </label>
                                        </label>
                                        <div style="font-size: 12px; color: var(--text-secondary); margin-top: 6px;">开启后，聊天界面将不显示转账等居中提示消息。AI仍能“看到”这些行为。</div>
                                    </div>

                                    <div class="persona-form-group" style="margin-bottom: 16px; position: relative;">
                                        <label style="display: flex; align-items: center; justify-content: space-between;">
                                            <span><i class="ph ph-waveform"></i> 语音条波动效果</span>
                                            <label class="toggle-switch-ios" style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                                                <div style="position: relative; width: 36px; height: 20px; flex-shrink: 0;">
                                                    <input type="checkbox" id="cs-voice-wave-toggle" style="opacity: 0; width: 0; height: 0; position: absolute;">
                                                    <span class="ios-slider"></span>
                                                </div>
                                            </label>
                                        </label>
                                        <div style="font-size: 12px; color: var(--text-secondary); margin-top: 6px;">开启后，聊天界面的语音条波形将处于动态波动状态。</div>
                                    </div>

                                    <div class="persona-form-group" style="margin-bottom: 16px; position: relative;">
                                        <label style="display: flex; align-items: center; gap: 6px; justify-content: space-between;">
                                            <span><i class="ph ph-chat-centered-dots"></i> 等待回复动画</span>
                                        </label>
                                        
                                        <div id="cs-typing-style-dropdown-trigger" style="background-color: var(--app-bg); padding: 12px 16px; border-radius: 12px; border: 1px solid var(--border-color); color: var(--text-color); font-size: 14px; width: 100%; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.2s;">
                                            <span id="cs-typing-style-selected-text">全部显示</span>
                                            <i class="ph ph-caret-down" style="color: var(--text-secondary); transition: transform 0.3s;" id="cs-typing-style-caret"></i>
                                        </div>
                                        
                                        <div id="cs-typing-style-options-panel" style="display: none; position: absolute; left: 0; right: 0; top: 76px; background-color: #ffffff; border-radius: 12px; border: 1px solid var(--border-color); box-shadow: 0 10px 30px rgba(0,0,0,0.15); z-index: 999; max-height: 200px; overflow-y: auto; padding: 4px; font-size: 14px;">
                                        </div>
                                        
                                        <input type="hidden" id="cs-typing-style-select" value="both">
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                <!-- 10. 记忆库弹窗 -->
                <div class="chat-popup-overlay" id="memory-library-popup" style="z-index: 340;">
                    <div class="chat-popup-content" style="height: 85%; max-height: 600px; display: flex; flex-direction: column;">
                        <div class="chat-popup-header">
                            <h3 class="chat-popup-title">记忆库</h3>
                            <button class="chat-popup-close btn-close-memory-sub">✕</button>
                        </div>
                        <div class="chat-popup-body chat-scroll-area" style="flex: 1; padding: 16px; background-color: var(--app-bg);">
                            <div id="memory-list-container" style="display: flex; flex-direction: column; gap: 12px;">
                                <!-- 动态生成记忆列表 -->
                            </div>
                        </div>
                        <div class="chat-popup-footer" style="display: flex; gap: 8px; flex-direction: column;">
                            <button class="chat-btn-outline" id="btn-compress-memory" style="width: 100%;">
                                <i class="ph ph-arrows-in"></i> 再次总结 (压缩记忆)
                            </button>
                        </div>
                    </div>
                </div>

                <!-- 11. 编辑单条记忆弹窗 -->
                <div class="chat-popup-overlay" id="memory-edit-popup" style="z-index: 350;">
                    <div class="chat-popup-content">
                        <div class="chat-popup-header">
                            <h3 class="chat-popup-title">编辑记忆</h3>
                            <button class="chat-popup-close btn-close-memory-sub">✕</button>
                        </div>
                        <div class="chat-popup-body chat-scroll-area">
                            <div class="persona-form">
                                <div class="persona-form-group">
                                    <label>记忆内容</label>
                                    <textarea id="memory-edit-content" class="persona-textarea" placeholder="记忆细节..." rows="6"></textarea>
                                </div>
                            </div>
                        </div>
                        <div class="chat-popup-footer" style="display: flex; gap: 8px;">
                            <button class="chat-btn-outline" id="btn-delete-memory" style="flex: 1; color: #FF3B30; border-color: #FF3B30;">删除</button>
                            <button class="chat-btn-primary" id="btn-save-memory" style="flex: 2;">保存</button>
                        </div>
                    </div>
                </div>

                <!-- 12. 自定义 Prompt 弹窗 (Linear风格极简) -->
                <div class="chat-popup-overlay" id="chat-prompt-popup" style="z-index: 2005; background-color: rgba(0, 0, 0, 0.4); transition: opacity 0.2s ease;">
                    <div class="chat-popup-content" style="max-width: 340px; width: 90%; text-align: left; border-radius: 12px; background: #ffffff; padding: 24px; box-shadow: 0 24px 48px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06); border: 1px solid rgba(0,0,0,0.08); box-sizing: border-box; transition: all 0.3s ease; display: flex; flex-direction: column;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin: 0 0 16px 0;">
                            <h3 id="chat-prompt-title" style="font-size: 16px; font-weight: 600; color: #18181b; margin: 0; letter-spacing: -0.01em;">输入</h3>
                            <button id="chat-prompt-expand-btn" style="background: none; border: none; padding: 4px; cursor: pointer; color: #52525b; border-radius: 4px; transition: background 0.2s ease; display: flex; align-items: center; justify-content: center;" onmouseover="this.style.background='rgba(0,0,0,0.04)'" onmouseout="this.style.background='transparent'">
                                <i class="ph ph-arrows-out-simple" style="font-size: 16px;"></i>
                            </button>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; width: 100%; flex: 1; min-height: 0;">
                            <textarea id="chat-prompt-input" rows="4" style="width: 100%; flex: 1; background: #ffffff; border: 1px solid rgba(0,0,0,0.1); border-radius: 6px; padding: 10px 12px; font-size: 14px; color: #18181b; outline: none; box-sizing: border-box; transition: border-color 0.2s ease, box-shadow 0.2s ease; font-family: inherit; resize: vertical; min-height: 80px; line-height: 1.5;" onfocus="this.style.borderColor='#18181b'; this.style.boxShadow='0 0 0 1px #18181b';" onblur="this.style.borderColor='rgba(0,0,0,0.1)'; this.style.boxShadow='none';"></textarea>
                            <input type="text" id="chat-prompt-input-secondary" placeholder="添加备注（选填）" style="width: 100%; background: #ffffff; border: 1px solid rgba(0,0,0,0.1); border-radius: 6px; padding: 10px 12px; font-size: 14px; color: #18181b; outline: none; box-sizing: border-box; transition: border-color 0.2s ease, box-shadow 0.2s ease; font-family: inherit; display: none;" onfocus="this.style.borderColor='#18181b'; this.style.boxShadow='0 0 0 1px #18181b';" onblur="this.style.borderColor='rgba(0,0,0,0.1)'; this.style.boxShadow='none';">
                        </div>
                        <div class="chat-popup-footer" style="display: flex; justify-content: flex-end; gap: 8px; border: none; padding: 0; background: transparent; width: 100%; flex-shrink: 0;">
                            <button class="chat-btn-text btn-prompt-cancel" style="padding: 8px 16px; font-size: 13px; font-weight: 500; color: #52525b; background: transparent; border-radius: 6px; border: none; cursor: pointer; transition: background 0.2s ease;" onmouseover="this.style.background='rgba(0,0,0,0.04)'" onmouseout="this.style.background='transparent'">取消</button>
                            <button class="chat-btn-text btn-prompt-ok" style="padding: 8px 16px; font-size: 13px; font-weight: 500; color: #ffffff; background: #18181b; border-radius: 6px; border: none; cursor: pointer; transition: opacity 0.2s ease;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">确认</button>
                        </div>
                    </div>
                </div>

                <!-- 9. 自定义 Confirm 弹窗 (Linear风格极简) -->
                <div class="chat-popup-overlay" id="chat-confirm-popup" style="z-index: 2001; background-color: rgba(0, 0, 0, 0.4); transition: opacity 0.2s ease;">
                    <div class="chat-popup-content" style="max-width: 340px; width: 90%; text-align: left; border-radius: 12px; background: #ffffff; padding: 24px; box-shadow: 0 24px 48px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06); border: 1px solid rgba(0,0,0,0.08); box-sizing: border-box;">
                        <h3 id="chat-confirm-title" style="font-size: 16px; font-weight: 600; color: #18181b; margin: 0 0 8px 0; letter-spacing: -0.01em;">提示</h3>
                        <p id="chat-confirm-message" style="font-size: 14px; color: #52525b; margin: 0 0 24px 0; line-height: 1.6; word-break: break-word;"></p>
                        <div class="chat-popup-footer" style="display: flex; justify-content: flex-end; gap: 8px; border: none; padding: 0; background: transparent; width: 100%;">
                            <button class="chat-btn-text btn-confirm-cancel" style="padding: 8px 16px; font-size: 13px; font-weight: 500; color: #52525b; background: transparent; border-radius: 6px; border: none; cursor: pointer; transition: background 0.2s ease;" onmouseover="this.style.background='rgba(0,0,0,0.04)'" onmouseout="this.style.background='transparent'">取消</button>
                            <button class="chat-btn-text btn-confirm-ok" style="padding: 8px 16px; font-size: 13px; font-weight: 500; color: #ffffff; background: #ef4444; border-radius: 6px; border: none; cursor: pointer; transition: opacity 0.2s ease;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">确认</button>
                        </div>
                    </div>
                </div>

                <!-- 13. 转账操作弹窗 -->
                <div class="chat-popup-overlay" id="chat-transfer-action-popup" style="z-index: 1010; background-color: rgba(0, 0, 0, 0.4); transition: opacity 0.2s ease;">
                    <div class="chat-popup-content" style="max-width: 300px; text-align: center; border-radius: 12px; overflow: hidden; background: #fff; box-shadow: 0 0 0 0.5px rgba(0,0,0,0.05), 0 20px 40px rgba(0, 0, 0, 0.2);">
                        <div style="padding: 16px; position: relative;">
                            <button class="btn-close-transfer" style="position: absolute; top: 12px; right: 12px; background: none; border: none; font-size: 18px; color: #999; cursor: pointer;"><i class="ph ph-x"></i></button>
                            <div style="width: 48px; height: 48px; background: #FF9800; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 16px auto 12px; color: white;">
                                <i class="ph ph-currency-cny" style="font-size: 28px;"></i>
                            </div>
                            <div style="font-size: 16px; color: #333; margin-bottom: 8px;">对方发起了转账</div>
                            <div id="transfer-action-amount" style="font-size: 32px; font-weight: 600; color: #000; margin-bottom: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">¥ 0.00</div>
                            <div id="transfer-action-remark" style="font-size: 14px; color: #999; margin-bottom: 24px;">转账</div>
                            
                            <button id="btn-transfer-receive" style="width: 100%; background: #07C160; color: white; border: none; border-radius: 8px; padding: 12px 0; font-size: 16px; font-weight: 500; cursor: pointer; margin-bottom: 12px;">确认收款</button>
                            <button id="btn-transfer-return" style="width: 100%; background: transparent; color: #576B95; border: none; font-size: 14px; cursor: pointer;">立即退还</button>
                        </div>
                    </div>
                </div>

                <!-- 对话界面浮层 (初始隐藏) -->
                <div class="chat-conversation-view" id="chat-conversation-view">
                    <div class="chat-conv-header-wrapper">
                        <header class="chat-conv-header">
                            <button class="chat-conv-back-btn" id="chat-conv-back">
                                <i class="ph ph-caret-left"></i>
                            </button>
                            <div class="chat-conv-title-box" style="position: relative; flex: 1; display: flex; justify-content: center;">
                                <!-- 默认样式 -->
                                <div id="chat-conv-title-default" style="display: flex; flex-direction: column; align-items: center;">
                                    <div class="chat-conv-title-top">
                                        <span class="chat-conv-name" id="chat-conv-name">角色名称</span>
                                        <div class="chat-conv-status-dot" id="chat-conv-status-dot"></div>
                                    </div>
                                    <span class="chat-conv-status-text" id="chat-conv-status-text">ACTIVE NOW</span>
                                </div>

                                <!-- 电波连线风格 -->
                                <div id="chat-conv-title-wave" class="chat-header-wave-style" style="display: none;">
                                    <div class="wave-avatar-box">
                                        <img id="chat-wave-user-avatar" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7">
                                    </div>
                                    <div class="wave-line-container">
                                        <div class="wave-line"></div>
                                        <div class="wave-line"></div>
                                        <div class="wave-line"></div>
                                    </div>
                                    <div class="wave-avatar-box">
                                        <img id="chat-wave-char-avatar" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7">
                                    </div>
                                </div>

                                <!-- 心电波连线风格 -->
                                <div id="chat-conv-title-ecg" class="chat-header-ecg-style" style="display: none;">
                                    <div class="ecg-avatar-box">
                                        <img id="chat-ecg-user-avatar" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7">
                                    </div>
                                    <div class="ecg-line-container">
                                        <div class="ecg-line"></div>
                                    </div>
                                    <div class="ecg-avatar-box">
                                        <img id="chat-ecg-char-avatar" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7">
                                    </div>
                                </div>

                                <!-- 拍立得吊坠风格 -->
                                <div id="chat-conv-title-polaroid" class="chat-header-polaroid-style" style="display: none;">
                                    <div class="polaroid-string"></div>
                                    <div class="polaroid-frame" id="chat-polaroid-frame" title="点击更换照片">
                                        <img id="chat-polaroid-img" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7">
                                    </div>
                                </div>
                            </div>
                            <button class="chat-conv-more-btn">
                                <i class="ph ph-dots-three"></i>
                            </button>
                        </header>
                    </div>
                    
                    <div class="chat-conv-messages" id="chat-conv-messages">
                        <!-- 聊天气泡动态插入 -->
                    </div>
                    
                    <div class="chat-composer-area">
                        <div id="chat-local-time-display" style="display: none; font-size: 12px; color: #9ca3af; text-align: center; margin-bottom: 8px; font-variant-numeric: tabular-nums;"></div>
                        
                        <!-- 引用预览区 -->
                        <div class="chat-quote-preview" id="chat-quote-preview" style="display: none; padding: 8px 12px; background: rgba(0,0,0,0.03); border-left: 3px solid #999; margin: 0 12px 8px; border-radius: 4px; font-size: 12px; color: #666; position: relative;">
                            <div style="font-weight: 600; margin-bottom: 2px;" id="chat-quote-name"></div>
                            <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 85%;" id="chat-quote-text"></div>
                            <button id="chat-quote-close" style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: none; border: none; color: #999; cursor: pointer; padding: 4px;"><i class="ph ph-x" style="font-size: 16px;"></i></button>
                        </div>

                        <div class="chat-composer-box">
                            <div class="chat-composer-input-wrap">
                                <textarea class="chat-composer-textarea" id="chat-conv-input" placeholder="输入消息..." rows="1"></textarea>
                            </div>
                            <div class="chat-composer-actions">
                                <div class="chat-composer-actions-left">
                                    <button class="chat-composer-btn-icon plus" id="chat-conv-plus-btn"><i class="ph ph-plus"></i></button>
                                    <button class="chat-composer-btn-icon emoji" id="chat-conv-emoji-btn" title="表情"><i class="ph ph-bone"></i></button>
                                    <button class="chat-composer-btn-icon ai"><i class="ph ph-paw-print"></i></button>
                                </div>
                                <button class="chat-composer-send-btn disabled" id="chat-conv-send">发送</button>
                            </div>
                            <!-- 扩展面板 -->
                            <div class="chat-composer-ext-panel" id="chat-conv-ext-panel" style="display: none;">
                                <div class="ext-item" id="btn-ext-transfer"><div class="ext-icon"><i class="ph ph-currency-cny"></i></div><span class="ext-text">转账</span></div>
                                <div class="ext-item" id="btn-ext-reroll"><div class="ext-icon"><i class="ph ph-arrows-clockwise"></i></div><span class="ext-text">重ROLL</span></div>
                                <div class="ext-item" id="btn-ext-pause"><div class="ext-icon"><i class="ph ph-pause"></i></div><span class="ext-text">暂停调用</span></div>
                                <div class="ext-item" id="btn-ext-voice"><div class="ext-icon"><i class="ph ph-microphone"></i></div><span class="ext-text">语音</span></div>
                                <div class="ext-item" id="btn-ext-image"><div class="ext-icon"><i class="ph ph-image"></i></div><span class="ext-text">图片</span></div>
                                <div class="ext-item" id="btn-ext-location"><div class="ext-icon"><i class="ph ph-map-pin"></i></div><span class="ext-text">位置</span></div>
                            </div>
                            <!-- 表情面板 -->
                            <div class="chat-composer-ext-panel" id="chat-conv-emoji-panel" style="display: none; padding: 12px; background: var(--app-bg); border-top: 1px solid var(--border-color); flex-direction: column; gap: 8px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                                    <span style="font-size: 12px; color: var(--text-secondary); font-weight: 500;">自定义表情</span>
                                    <button id="btn-manage-emojis" class="chat-btn-text" style="font-size: 12px; padding: 2px 4px;"><i class="ph ph-gear"></i> 管理</button>
                                </div>
                                <div id="emoji-picker-groups" style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; margin-bottom: 4px; scrollbar-width: none;">
                                    <!-- 表情分组动态生成 -->
                                </div>
                                <div id="emoji-list-container" style="display: flex; flex-wrap: wrap; gap: 12px; max-height: 180px; overflow-y: auto; justify-content: flex-start; align-content: flex-start;">
                                    <!-- 表情项动态生成 -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 15. 消息操作菜单 (全局居中 Grid Panel 风格) -->
                <!-- 会话多选操作底栏 -->
                <div class="chat-message-select-bar" id="chat-session-select-bar">
                    <button class="chat-select-bar-btn" id="btn-session-select-cancel">取消</button>
                    <div style="display: flex; gap: 4px;">
                        <button class="chat-select-bar-btn" id="btn-session-select-group" disabled>分组(0)</button>
                        <button class="chat-select-bar-btn" id="btn-session-select-pin" disabled>置顶(0)</button>
                        <button class="chat-select-bar-btn" id="btn-session-select-unpin" disabled style="display:none;">取消置顶(0)</button>
                        <button class="chat-select-bar-btn" id="btn-session-select-read" disabled style="display:none;">标为已读(0)</button>
                        <button class="chat-select-bar-btn" id="btn-session-select-unread" disabled style="display:none;">标为未读(0)</button>
                        <button class="chat-select-bar-btn danger" id="btn-session-select-delete" disabled>删除(0)</button>
                    </div>
                    <button class="chat-select-bar-btn" id="btn-session-select-all">全选</button>
                </div>

                <!-- 会话长按菜单 -->
                <div class="chat-message-menu-overlay" id="chat-session-menu-overlay" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 1020; align-items: center; justify-content: center; background-color: rgba(0, 0, 0, 0.2); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); transition: all 0.2s ease;">
                    <div class="chat-message-menu" id="chat-session-menu" style="background: #ffffff; border-radius: 12px; box-shadow: 0 24px 48px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06); border: 1px solid rgba(0,0,0,0.08); padding: 12px; width: 280px; max-width: 90%; z-index: 1000; box-sizing: border-box; display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
                        
                        <div class="msg-menu-item" id="btn-session-pin" style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 12px 4px; border-radius: 8px; cursor: pointer; transition: all 0.15s ease; color: #3f3f46;" onmouseover="this.style.background='rgba(0,0,0,0.04)'; this.style.color='#18181b';" onmouseout="this.style.background='transparent'; this.style.color='#3f3f46';">
                            <i class="ph ph-push-pin" style="font-size: 20px;"></i>
                            <span style="font-size: 11px; font-weight: 600;">置顶</span>
                        </div>
                        
                        <div class="msg-menu-item" id="btn-session-unpin" style="display: none; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 12px 4px; border-radius: 8px; cursor: pointer; transition: all 0.15s ease; color: #3f3f46;" onmouseover="this.style.background='rgba(0,0,0,0.04)'; this.style.color='#18181b';" onmouseout="this.style.background='transparent'; this.style.color='#3f3f46';">
                            <i class="ph ph-push-pin-slash" style="font-size: 20px;"></i>
                            <span style="font-size: 11px; font-weight: 600;">取消置顶</span>
                        </div>
                        
                        <div class="msg-menu-item" id="btn-session-group" style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 12px 4px; border-radius: 8px; cursor: pointer; transition: all 0.15s ease; color: #3f3f46;" onmouseover="this.style.background='rgba(0,0,0,0.04)'; this.style.color='#18181b';" onmouseout="this.style.background='transparent'; this.style.color='#3f3f46';">
                            <i class="ph ph-folder" style="font-size: 20px;"></i>
                            <span style="font-size: 11px; font-weight: 600;">分组</span>
                        </div>

                        <div class="msg-menu-item" id="btn-session-select" style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 12px 4px; border-radius: 8px; cursor: pointer; transition: all 0.15s ease; color: #3f3f46;" onmouseover="this.style.background='rgba(0,0,0,0.04)'; this.style.color='#18181b';" onmouseout="this.style.background='transparent'; this.style.color='#3f3f46';">
                            <i class="ph ph-list-checks" style="font-size: 20px;"></i>
                            <span style="font-size: 11px; font-weight: 600;">多选</span>
                        </div>
                        
                        <div class="msg-menu-item" id="btn-session-read" style="display: none; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 12px 4px; border-radius: 8px; cursor: pointer; transition: all 0.15s ease; color: #3f3f46;" onmouseover="this.style.background='rgba(0,0,0,0.04)'; this.style.color='#18181b';" onmouseout="this.style.background='transparent'; this.style.color='#3f3f46';">
                            <i class="ph ph-envelope-open" style="font-size: 20px;"></i>
                            <span style="font-size: 11px; font-weight: 600;">标为已读</span>
                        </div>
                        
                        <div class="msg-menu-item" id="btn-session-unread" style="display: none; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 12px 4px; border-radius: 8px; cursor: pointer; transition: all 0.15s ease; color: #3f3f46;" onmouseover="this.style.background='rgba(0,0,0,0.04)'; this.style.color='#18181b';" onmouseout="this.style.background='transparent'; this.style.color='#3f3f46';">
                            <i class="ph ph-envelope-simple" style="font-size: 20px;"></i>
                            <span style="font-size: 11px; font-weight: 600;">标为未读</span>
                        </div>

                        <div class="msg-menu-item" id="btn-session-delete" style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 12px 4px; border-radius: 8px; cursor: pointer; transition: all 0.15s ease; color: #ef4444;" onmouseover="this.style.background='rgba(239, 68, 68, 0.1)';" onmouseout="this.style.background='transparent';">
                            <i class="ph ph-trash" style="font-size: 20px;"></i>
                            <span style="font-size: 11px; font-weight: 600;">删除</span>
                        </div>

                    </div>
                </div>

                <!-- 消息多选操作底栏 -->
                <div class="chat-message-select-bar" id="chat-message-select-bar">
                    <button class="chat-select-bar-btn" id="btn-select-bar-cancel">取消</button>
                    <button class="chat-select-bar-btn danger" id="btn-select-bar-delete" disabled>删除(0)</button>
                    <button class="chat-select-bar-btn" id="btn-select-bar-all">全选</button>
                </div>

                <div class="chat-message-menu-overlay" id="chat-message-menu-overlay" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 1020; align-items: center; justify-content: center; background-color: rgba(0, 0, 0, 0.2); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); transition: all 0.2s ease;">
                    <div class="chat-message-menu" id="chat-message-menu" style="background: #ffffff; border-radius: 12px; box-shadow: 0 24px 48px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06); border: 1px solid rgba(0,0,0,0.08); padding: 12px; width: 280px; max-width: 90%; z-index: 1000; box-sizing: border-box; display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
                        
                        <div class="msg-menu-item" id="btn-msg-copy" style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 12px 4px; border-radius: 8px; cursor: pointer; transition: all 0.15s ease; color: #3f3f46;" onmouseover="this.style.background='rgba(0,0,0,0.04)'; this.style.color='#18181b';" onmouseout="this.style.background='transparent'; this.style.color='#3f3f46';">
                            <i class="ph ph-copy" style="font-size: 20px;"></i>
                            <span style="font-size: 11px; font-weight: 600;">复制</span>
                        </div>
                        
                        <div class="msg-menu-item" id="btn-msg-reply" style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 12px 4px; border-radius: 8px; cursor: pointer; transition: all 0.15s ease; color: #3f3f46;" onmouseover="this.style.background='rgba(0,0,0,0.04)'; this.style.color='#18181b';" onmouseout="this.style.background='transparent'; this.style.color='#3f3f46';">
                            <i class="ph ph-arrow-u-up-left" style="font-size: 20px;"></i>
                            <span style="font-size: 11px; font-weight: 600;">引用</span>
                        </div>
                        
                        <div class="msg-menu-item" id="btn-msg-edit" style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 12px 4px; border-radius: 8px; cursor: pointer; transition: all 0.15s ease; color: #3f3f46;" onmouseover="this.style.background='rgba(0,0,0,0.04)'; this.style.color='#18181b';" onmouseout="this.style.background='transparent'; this.style.color='#3f3f46';">
                            <i class="ph ph-pencil-simple" style="font-size: 20px;"></i>
                            <span style="font-size: 11px; font-weight: 600;">编辑</span>
                        </div>
                        
                        <div class="msg-menu-item" id="btn-msg-recall" style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 12px 4px; border-radius: 8px; cursor: pointer; transition: all 0.15s ease; color: #3f3f46;" onmouseover="this.style.background='rgba(0,0,0,0.04)'; this.style.color='#18181b';" onmouseout="this.style.background='transparent'; this.style.color='#3f3f46';">
                            <i class="ph ph-arrow-counter-clockwise" style="font-size: 20px;"></i>
                            <span style="font-size: 11px; font-weight: 600;">撤回</span>
                        </div>
                        
                        <div class="msg-menu-item" id="btn-msg-select" style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 12px 4px; border-radius: 8px; cursor: pointer; transition: all 0.15s ease; color: #3f3f46;" onmouseover="this.style.background='rgba(0,0,0,0.04)'; this.style.color='#18181b';" onmouseout="this.style.background='transparent'; this.style.color='#3f3f46';">
                            <i class="ph ph-list-checks" style="font-size: 20px;"></i>
                            <span style="font-size: 11px; font-weight: 600;">多选</span>
                        </div>
                        
                        <div class="msg-menu-item" id="btn-msg-delete" style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 12px 4px; border-radius: 8px; cursor: pointer; transition: all 0.15s ease; color: #ef4444;" onmouseover="this.style.background='rgba(239, 68, 68, 0.1)';" onmouseout="this.style.background='transparent';">
                            <i class="ph ph-trash" style="font-size: 20px;"></i>
                            <span style="font-size: 11px; font-weight: 600;">删除</span>
                        </div>

                    </div>
                </div>

                <!-- 16. 时区选择弹窗 -->
                <div class="chat-popup-overlay" id="chat-timezone-popup" style="z-index: 1050; background-color: rgba(0, 0, 0, 0.4); transition: opacity 0.2s ease;">
                    <div class="chat-popup-content" style="max-width: 360px; width: 90%; height: 80%; max-height: 600px; display: flex; flex-direction: column; border-radius: 16px; overflow: hidden; background: #ffffff; box-shadow: 0 24px 48px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06); border: 1px solid rgba(0,0,0,0.08);">
                        <div style="padding: 16px; border-bottom: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 12px; background: #f9f9f9; flex-shrink: 0;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <h3 style="font-size: 16px; font-weight: 600; color: #18181b; margin: 0;">选择时区</h3>
                                <button class="btn-close-timezone" style="background: none; border: none; font-size: 18px; color: #999; cursor: pointer; padding: 4px;"><i class="ph ph-x"></i></button>
                            </div>
                            <div style="position: relative;">
                                <i class="ph ph-magnifying-glass" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9ca3af; font-size: 16px;"></i>
                                <input type="text" id="chat-timezone-search" placeholder="搜索城市、国家、时区 (如: 东京, GMT+9)" style="width: 100%; background: #ffffff; border: 1px solid var(--border-color); border-radius: 8px; padding: 10px 12px 10px 36px; font-size: 14px; color: #18181b; outline: none; box-sizing: border-box; transition: all 0.2s;">
                            </div>
                        </div>
                        <div class="chat-scroll-area" style="flex: 1; padding: 8px; background: #ffffff;">
                            <div id="chat-timezone-list-container" style="display: flex; flex-direction: column; gap: 4px;">
                                <!-- 时区列表动态生成 -->
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 14. 发送位置弹窗 -->
                <div class="chat-popup-overlay" id="chat-location-popup" style="z-index: 1010; background-color: rgba(0, 0, 0, 0.4); transition: opacity 0.2s ease;">
                    <div class="chat-popup-content" style="max-width: 320px; width: 90%; text-align: center; border-radius: 24px; background: #ffffff; padding: 32px 24px 24px 24px; box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.15), 0 10px 20px -5px rgba(0, 0, 0, 0.05); box-sizing: border-box;">
                        <h3 style="font-size: 18px; font-weight: 600; color: #18181b; margin: 0 0 16px 0;">发送位置</h3>
                        <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; width: 100%;">
                            <button class="chat-btn-outline" id="btn-get-current-location" style="width: 100%; padding: 12px; font-size: 14px; border-radius: 12px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                                <i class="ph ph-crosshair"></i> 获取当前定位
                            </button>
                            <div style="font-size: 12px; color: #9ca3af; margin: 4px 0;">或手动输入地址：</div>
                            <input type="text" id="chat-location-input" placeholder="例如：北京市朝阳区..." style="width: 100%; background: #f4f4f5; border: 1px solid transparent; border-radius: 14px; padding: 14px 16px; font-size: 14px; color: #27272a; outline: none; box-sizing: border-box; transition: all 0.2s ease; font-family: inherit;">
                        </div>
                        <div class="chat-popup-footer" style="display: flex; flex-direction: column; gap: 12px; border: none; padding: 0; background: transparent; width: 100%;">
                            <button class="chat-btn-text btn-location-ok" style="width: 100%; padding: 14px; font-size: 15px; font-weight: 600; color: #ffffff; background: #18181b; border-radius: 14px; border: none; cursor: pointer; transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);">发送</button>
                            <button class="chat-btn-text btn-location-cancel" style="width: 100%; padding: 14px; font-size: 15px; font-weight: 600; color: #3f3f46; background: #f4f4f5; border-radius: 14px; border: none; cursor: pointer; transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);">取消</button>
                        </div>
                    </div>
                </div>

                <!-- 17. 自定义头像形状弹窗 -->
                <div class="chat-popup-overlay popup-container" id="cs-avatar-shape-popup" style="z-index: 1060; background-color: rgba(0, 0, 0, 0.4); transition: opacity 0.2s ease; display: none;">
                    <div class="chat-popup-content popup-content" style="max-width: 380px; width: 90%; background: #ffffff; border-radius: 16px; box-shadow: 0 24px 48px rgba(0,0,0,0.12); border: 1px solid rgba(0,0,0,0.08); overflow: hidden;">
                        <div class="chat-popup-header popup-header" style="padding: 16px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                            <h3 class="chat-popup-title popup-title" id="cs-avatar-shape-title" style="margin: 0; font-size: 16px; font-weight: 600; color: #18181b;">自定义头像形状</h3>
                            <button class="chat-popup-close popup-close-btn btn-close-shape-popup" style="background: none; border: none; font-size: 18px; color: #999; cursor: pointer;"><i class="ph ph-x"></i></button>
                        </div>
                        
                        <div class="chat-popup-body popup-body" style="padding: 16px; background: #f9f9f9;">
                            <p class="settings-item-desc" style="margin: 0 0 12px 0; font-size: 13px; color: #52525b;">选择下方预设形状，或输入 CSS 代码自定义。</p>
                        
                            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px;">
                                <button class="cs-shape-preset-btn chat-btn-text" data-code="border-radius: 4px;" style="background: #fff; border: 1px solid #e5e5ea; padding: 6px 12px; border-radius: 8px; font-size: 13px; cursor: pointer;">方形</button>
                                <button class="cs-shape-preset-btn chat-btn-text" data-code="border-radius: 18px;" style="background: #fff; border: 1px solid #e5e5ea; padding: 6px 12px; border-radius: 8px; font-size: 13px; cursor: pointer;">圆角</button>
                                <button class="cs-shape-preset-btn chat-btn-text" data-code="border-radius: 50%;" style="background: #fff; border: 1px solid #e5e5ea; padding: 6px 12px; border-radius: 8px; font-size: 13px; cursor: pointer;">圆形</button>
                                <button class="cs-shape-preset-btn chat-btn-text" data-code="border-radius: 50% 0 50% 50%;" style="background: #fff; border: 1px solid #e5e5ea; padding: 6px 12px; border-radius: 8px; font-size: 13px; cursor: pointer;">泪滴形</button>
                                <button class="cs-shape-preset-btn chat-btn-text" data-code="border-radius: 0;\nclip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);" style="background: #fff; border: 1px solid #e5e5ea; padding: 6px 12px; border-radius: 8px; font-size: 13px; cursor: pointer;">菱形</button>
                            </div>
                            
                            <div style="margin-bottom: 12px; display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">
                                <span style="font-size: 12px; color: var(--text-secondary);">我的预设:</span>
                                <div id="cs-avatar-shape-custom-presets" style="display: flex; gap: 6px; flex-wrap: wrap;"></div>
                            </div>

                            <div style="margin-bottom: 0;">
                                <textarea id="cs-avatar-shape-code" class="persona-textarea" spellcheck="false" placeholder="例如：border-radius: 50%;" rows="3" style="font-family: monospace; font-size: 12px; margin-bottom: 0; background: #fff;"></textarea>
                            </div>
                        </div>

                        <div class="chat-popup-footer popup-actions" style="padding: 16px; border-top: 1px solid var(--border-color); background: #ffffff; display: flex; justify-content: space-between; align-items: center;">
                            <button class="chat-btn-text" id="btn-save-cs-shape-preset" style="color: #007AFF; font-size: 13px; padding: 6px;">存为预设</button>
                            <div style="display: flex; gap: 8px;">
                                <button class="chat-btn-text btn-close-shape-popup" style="font-size: 13px; padding: 8px 16px; color: #52525b; background: #f4f4f5; border-radius: 8px;">取消</button>
                                <button class="chat-btn-primary" id="btn-apply-cs-shape-code" style="font-size: 13px; padding: 8px 16px; border-radius: 8px;">确认</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 18. 表情管理弹窗 -->
                <div class="chat-popup-overlay" id="chat-emoji-manage-popup" style="z-index: 1010; background-color: rgba(0, 0, 0, 0.4);">
                    <div class="chat-popup-content" style="max-width: 500px; width: 90%; height: 85%; max-height: 600px; display: flex; flex-direction: column;">
                        <div class="chat-popup-header">
                            <h3 class="chat-popup-title">管理表情包</h3>
                            <div class="chat-popup-actions" style="display: flex; align-items: center;">
                                <button class="chat-btn-text" id="btn-manage-emojis-multi" style="margin-right: 8px;">多选</button>
                                <button class="chat-popup-close btn-close-popup">✕</button>
                            </div>
                        </div>
                        <div class="chat-popup-body" style="flex: 1; display: flex; overflow: hidden; padding: 0;">
                            <!-- 左侧：分组列表 -->
                            <div style="width: 100px; border-right: 1px solid var(--border-color); display: flex; flex-direction: column; background: #f9f9f9; flex-shrink: 0;">
                                <div class="chat-scroll-area" id="emoji-manage-groups" style="flex: 1; padding: 8px; display: flex; flex-direction: column; gap: 4px;">
                                    <!-- 动态生成分组 -->
                                </div>
                                <button class="chat-btn-text" id="btn-add-emoji-group" style="padding: 12px 8px; font-size: 13px; color: var(--text-color); border-top: 1px solid var(--border-color); border-radius: 0; display: flex; align-items: center; justify-content: center; gap: 4px;"><i class="ph ph-plus"></i> 新建</button>
                            </div>
                            
                            <!-- 右侧：表情列表和搜索 -->
                            <div style="flex: 1; display: flex; flex-direction: column; padding: 12px; overflow: hidden;">
                                <div style="display: flex; gap: 8px; margin-bottom: 12px; flex-shrink: 0;">
                                    <div style="position: relative; flex: 1;">
                                        <i class="ph ph-magnifying-glass" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #9ca3af; font-size: 14px;"></i>
                                        <input type="text" id="emoji-manage-search" placeholder="搜索表情..." style="width: 100%; background: #ffffff; border: 1px solid var(--border-color); border-radius: 6px; padding: 6px 10px 6px 30px; font-size: 13px; color: #18181b; outline: none; box-sizing: border-box;">
                                    </div>
                                </div>
                                <div style="display: flex; gap: 8px; margin-bottom: 12px; flex-shrink: 0;">
                                    <button class="chat-btn-outline" id="btn-add-emoji-single" style="flex: 1; padding: 6px; font-size: 12px;"><i class="ph ph-plus"></i> 单个添加</button>
                                    <button class="chat-btn-outline" id="btn-add-emoji-batch" style="flex: 1; padding: 6px; font-size: 12px;"><i class="ph ph-list-plus"></i> 批量导入</button>
                                    <button class="chat-btn-outline" id="btn-manage-group-actions" style="padding: 6px; font-size: 13px; width: 32px;" title="当前分组操作"><i class="ph ph-dots-three"></i></button>
                                </div>
                                <div class="chat-scroll-area" style="flex: 1;">
                                    <div id="emoji-manage-list" style="display: flex; flex-wrap: wrap; gap: 12px; justify-content: flex-start; align-content: flex-start;">
                                        <!-- 动态生成 -->
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="chat-popup-footer" id="emoji-manage-footer" style="display: none; gap: 8px; flex-wrap: wrap;">
                            <button class="chat-btn-outline" id="btn-select-all-emojis" style="flex: 1; font-size: 13px; padding: 8px;">全选</button>
                            <button class="chat-btn-outline" id="btn-move-selected-emojis" style="flex: 1; font-size: 13px; padding: 8px;">移动</button>
                            <button class="chat-btn-danger" id="btn-delete-selected-emojis" style="flex: 1.5; background-color: #FF3B30; color: white; font-size: 13px; padding: 8px;" disabled>删除 (0)</button>
                        </div>
                    </div>
                </div>

                <!-- 19. 单个添加表情弹窗 -->
                <div class="chat-popup-overlay" id="chat-emoji-single-popup" style="z-index: 1020; background-color: rgba(0, 0, 0, 0.4);">
                    <div class="chat-popup-content" style="max-width: 320px;">
                        <div class="chat-popup-header">
                            <h3 class="chat-popup-title" id="emoji-single-title">添加表情</h3>
                            <button class="chat-popup-close btn-close-emoji-sub">✕</button>
                        </div>
                        <div class="chat-popup-body chat-scroll-area" style="padding: 16px;">
                            <div class="persona-form">
                                <div class="persona-form-group">
                                    <label>表情名称 (必填)</label>
                                    <input type="text" id="emoji-single-name" class="persona-input" placeholder="例如：开心">
                                </div>
                                <div class="persona-form-group">
                                    <label>所属分组</label>
                                    <select id="emoji-single-group" class="persona-input" style="appearance: auto; cursor: pointer;"></select>
                                </div>
                                <div class="persona-form-group">
                                    <label>图片链接</label>
                                    <input type="text" id="emoji-single-url" class="persona-input" placeholder="输入网络图片URL">
                                    <div style="text-align: center; margin: 12px 0; color: var(--text-secondary); font-size: 12px;">或</div>
                                    <button class="chat-btn-outline" id="btn-emoji-single-upload" style="width: 100%;"><i class="ph ph-upload-simple"></i> 选择本地图片</button>
                                    <input type="file" id="input-emoji-single-upload" accept="image/*" style="display: none;">
                                </div>
                                <div id="emoji-single-preview-container" style="display: none; text-align: center; margin-top: 12px;">
                                    <img id="emoji-single-preview" src="" style="max-width: 80px; max-height: 80px; border-radius: 8px;">
                                </div>
                            </div>
                        </div>
                        <div class="chat-popup-footer">
                            <button class="chat-btn-primary" id="btn-save-emoji-single" style="width: 100%;">保存</button>
                        </div>
                    </div>
                </div>

                <!-- 20. 批量导入表情弹窗 -->
                <div class="chat-popup-overlay" id="chat-emoji-batch-popup" style="z-index: 1020; background-color: rgba(0, 0, 0, 0.4);">
                    <div class="chat-popup-content" style="max-width: 400px; width: 90%; height: 80%; max-height: 500px; display: flex; flex-direction: column;">
                        <div class="chat-popup-header">
                            <h3 class="chat-popup-title">批量/文档导入</h3>
                            <button class="chat-popup-close btn-close-emoji-sub">✕</button>
                        </div>
                        <div class="chat-popup-body chat-scroll-area" style="flex: 1; padding: 16px; display: flex; flex-direction: column;">
                            <div class="persona-form" style="flex: 1; display: flex; flex-direction: column;">
                                <div class="persona-form-group" style="margin-bottom: 12px;">
                                    <label>导入到分组</label>
                                    <select id="emoji-batch-group" class="persona-input" style="appearance: auto; cursor: pointer;"></select>
                                </div>
                                <div class="persona-form-group" style="flex: 1; display: flex; flex-direction: column;">
                                    <label>粘贴文本 (智能识别：前面是名字，后面是链接，支持任意符号分隔)</label>
                                    <textarea id="emoji-batch-text" class="persona-textarea" placeholder="开心: https://xxx.jpg&#10;大笑 | https://xxx.jpg&#10;委屈——https://xxx.jpg&#10;愤怒，https://xxx.jpg" style="flex: 1; min-height: 150px; font-family: monospace; white-space: pre;"></textarea>
                                </div>
                                <div style="text-align: center; margin: 12px 0; color: var(--text-secondary); font-size: 12px;">或</div>
                                <button class="chat-btn-outline" id="btn-emoji-batch-upload" style="width: 100%;"><i class="ph ph-file-text"></i> 导入 TXT/DOCX/ZIP</button>
                                <input type="file" id="input-emoji-batch-upload" accept=".txt,.doc,.docx,.zip" style="display: none;">
                            </div>
                        </div>
                        <div class="chat-popup-footer">
                            <button class="chat-btn-primary" id="btn-save-emoji-batch" style="width: 100%;">解析并导入</button>
                        </div>
                    </div>
                </div>

                <!-- 21. 表情包移动分组弹窗 -->
                <div class="chat-popup-overlay" id="chat-emoji-move-popup" style="z-index: 1030; background-color: rgba(0, 0, 0, 0.4);">
                    <div class="chat-popup-content" style="max-width: 320px;">
                        <div class="chat-popup-header">
                            <h3 class="chat-popup-title" id="emoji-move-title">移动到分组</h3>
                            <button class="chat-popup-close btn-close-emoji-sub">✕</button>
                        </div>
                        <div class="chat-popup-body" style="padding: 16px;">
                            <div class="persona-form-group" style="margin: 0;">
                                <select id="emoji-move-target-group" class="persona-input" style="appearance: auto; cursor: pointer;"></select>
                            </div>
                        </div>
                        <div class="chat-popup-footer">
                            <button class="chat-btn-primary" id="btn-confirm-move-emojis" style="width: 100%;">确认移动</button>
                        </div>
                    </div>
                </div>
                
                <!-- 22. 表情包分组操作弹窗 -->
                <div class="chat-popup-overlay" id="chat-emoji-group-action-popup" style="z-index: 1030; background-color: rgba(0, 0, 0, 0.4);">
                    <div class="chat-popup-content" style="max-width: 320px;">
                        <div class="chat-popup-header">
                            <h3 class="chat-popup-title">管理分组</h3>
                            <button class="chat-popup-close btn-close-emoji-sub">✕</button>
                        </div>
                        <div class="chat-popup-body" style="padding: 16px;">
                            <div class="persona-form-group" style="margin: 0;">
                                <label>重命名分组</label>
                                <input type="text" id="emoji-group-action-name" class="persona-input" placeholder="输入新的分组名称">
                            </div>
                        </div>
                        <div class="chat-popup-footer" style="display: flex; gap: 8px;">
                            <button class="chat-btn-danger" id="btn-emoji-group-delete" style="flex: 1;">删除分组</button>
                            <button class="chat-btn-primary" id="btn-emoji-group-save" style="flex: 1;">保存</button>
                        </div>
                    </div>
                </div>

                <!-- 23. 角色专属表情包管理弹窗 -->
                <div class="chat-popup-overlay" id="chat-char-emoji-manage-popup" style="z-index: 1040; background-color: rgba(0, 0, 0, 0.4);">
                    <div class="chat-popup-content" style="max-width: 500px; width: 90%; height: 85%; max-height: 600px; display: flex; flex-direction: column;">
                        <div class="chat-popup-header">
                            <h3 class="chat-popup-title">管理角色表情包</h3>
                            <div class="chat-popup-actions" style="display: flex; align-items: center;">
                                <button class="chat-btn-text" id="btn-manage-char-emojis-multi" style="margin-right: 8px;">多选</button>
                                <button class="chat-popup-close btn-close-char-emoji-sub">✕</button>
                            </div>
                        </div>
                        <div class="chat-popup-body" style="flex: 1; display: flex; overflow: hidden; padding: 0;">
                            <!-- 左侧：分组列表 -->
                            <div style="width: 100px; border-right: 1px solid var(--border-color); display: flex; flex-direction: column; background: #f9f9f9; flex-shrink: 0;">
                                <div class="chat-scroll-area" id="char-emoji-manage-groups" style="flex: 1; padding: 8px; display: flex; flex-direction: column; gap: 4px;">
                                    <!-- 动态生成分组 -->
                                </div>
                                <button class="chat-btn-text" id="btn-add-char-emoji-group" style="padding: 12px 8px; font-size: 13px; color: var(--text-color); border-top: 1px solid var(--border-color); border-radius: 0; display: flex; align-items: center; justify-content: center; gap: 4px;"><i class="ph ph-plus"></i> 新建</button>
                            </div>
                            
                            <!-- 右侧：表情列表和搜索 -->
                            <div style="flex: 1; display: flex; flex-direction: column; padding: 12px; overflow: hidden;">
                                <div style="display: flex; gap: 8px; margin-bottom: 12px; flex-shrink: 0;">
                                    <div style="position: relative; flex: 1;">
                                        <i class="ph ph-magnifying-glass" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #9ca3af; font-size: 14px;"></i>
                                        <input type="text" id="char-emoji-manage-search" placeholder="搜索角色表情..." style="width: 100%; background: #ffffff; border: 1px solid var(--border-color); border-radius: 6px; padding: 6px 10px 6px 30px; font-size: 13px; color: #18181b; outline: none; box-sizing: border-box;">
                                    </div>
                                </div>
                                <div style="display: flex; gap: 8px; margin-bottom: 12px; flex-shrink: 0;">
                                    <button class="chat-btn-outline" id="btn-add-char-emoji-single" style="flex: 1; padding: 6px; font-size: 12px;"><i class="ph ph-plus"></i> 单个添加</button>
                                    <button class="chat-btn-outline" id="btn-add-char-emoji-batch" style="flex: 1; padding: 6px; font-size: 12px;"><i class="ph ph-list-plus"></i> 批量导入</button>
                                    <button class="chat-btn-outline" id="btn-manage-char-group-actions" style="padding: 6px; font-size: 13px; width: 32px;" title="当前分组操作"><i class="ph ph-dots-three"></i></button>
                                </div>
                                <div class="chat-scroll-area" style="flex: 1;">
                                    <div id="char-emoji-manage-list" style="display: flex; flex-wrap: wrap; gap: 12px; justify-content: flex-start; align-content: flex-start;">
                                        <!-- 动态生成 -->
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="chat-popup-footer" id="char-emoji-manage-footer" style="display: none; gap: 8px; flex-wrap: wrap;">
                            <button class="chat-btn-outline" id="btn-select-all-char-emojis" style="flex: 1; font-size: 13px; padding: 8px;">全选</button>
                            <button class="chat-btn-outline" id="btn-move-selected-char-emojis" style="flex: 1; font-size: 13px; padding: 8px;">移动</button>
                            <button class="chat-btn-danger" id="btn-delete-selected-char-emojis" style="flex: 1.5; background-color: #FF3B30; color: white; font-size: 13px; padding: 8px;" disabled>删除 (0)</button>
                        </div>
                    </div>
                </div>

                <!-- 24. 单个添加角色表情弹窗 -->
                <div class="chat-popup-overlay" id="chat-char-emoji-single-popup" style="z-index: 1050; background-color: rgba(0, 0, 0, 0.4);">
                    <div class="chat-popup-content" style="max-width: 320px;">
                        <div class="chat-popup-header">
                            <h3 class="chat-popup-title" id="char-emoji-single-title">添加角色表情</h3>
                            <button class="chat-popup-close btn-close-char-emoji-sub">✕</button>
                        </div>
                        <div class="chat-popup-body chat-scroll-area" style="padding: 16px;">
                            <div class="persona-form">
                                <div class="persona-form-group">
                                    <label>表情名称 (必填)</label>
                                    <input type="text" id="char-emoji-single-name" class="persona-input" placeholder="例如：开心">
                                </div>
                                <div class="persona-form-group">
                                    <label>所属分组</label>
                                    <select id="char-emoji-single-group" class="persona-input" style="appearance: auto; cursor: pointer;"></select>
                                </div>
                                <div class="persona-form-group">
                                    <label>图片链接</label>
                                    <input type="text" id="char-emoji-single-url" class="persona-input" placeholder="输入网络图片URL">
                                    <div style="text-align: center; margin: 12px 0; color: var(--text-secondary); font-size: 12px;">或</div>
                                    <button class="chat-btn-outline" id="btn-char-emoji-single-upload" style="width: 100%;"><i class="ph ph-upload-simple"></i> 选择本地图片</button>
                                    <input type="file" id="input-char-emoji-single-upload" accept="image/*" style="display: none;">
                                </div>
                                <div id="char-emoji-single-preview-container" style="display: none; text-align: center; margin-top: 12px;">
                                    <img id="char-emoji-single-preview" src="" style="max-width: 80px; max-height: 80px; border-radius: 8px;">
                                </div>
                            </div>
                        </div>
                        <div class="chat-popup-footer">
                            <button class="chat-btn-primary" id="btn-save-char-emoji-single" style="width: 100%;">保存</button>
                        </div>
                    </div>
                </div>

                <!-- 25. 批量导入角色表情弹窗 -->
                <div class="chat-popup-overlay" id="chat-char-emoji-batch-popup" style="z-index: 1050; background-color: rgba(0, 0, 0, 0.4);">
                    <div class="chat-popup-content" style="max-width: 400px; width: 90%; height: 80%; max-height: 500px; display: flex; flex-direction: column;">
                        <div class="chat-popup-header">
                            <h3 class="chat-popup-title">批量/文档导入角色表情</h3>
                            <button class="chat-popup-close btn-close-char-emoji-sub">✕</button>
                        </div>
                        <div class="chat-popup-body chat-scroll-area" style="flex: 1; padding: 16px; display: flex; flex-direction: column;">
                            <div class="persona-form" style="flex: 1; display: flex; flex-direction: column;">
                                <div class="persona-form-group" style="margin-bottom: 12px;">
                                    <label>导入到分组</label>
                                    <select id="char-emoji-batch-group" class="persona-input" style="appearance: auto; cursor: pointer;"></select>
                                </div>
                                <div class="persona-form-group" style="flex: 1; display: flex; flex-direction: column;">
                                    <label>粘贴文本 (智能识别：前面是名字，后面是链接，支持任意符号分隔)</label>
                                    <textarea id="char-emoji-batch-text" class="persona-textarea" placeholder="开心: https://xxx.jpg&#10;大笑 | https://xxx.jpg&#10;委屈——https://xxx.jpg&#10;愤怒，https://xxx.jpg" style="flex: 1; min-height: 150px; font-family: monospace; white-space: pre;"></textarea>
                                </div>
                                <div style="text-align: center; margin: 12px 0; color: var(--text-secondary); font-size: 12px;">或</div>
                                <button class="chat-btn-outline" id="btn-char-emoji-batch-upload" style="width: 100%;"><i class="ph ph-file-text"></i> 导入 TXT/DOCX/ZIP</button>
                                <input type="file" id="input-char-emoji-batch-upload" accept=".txt,.doc,.docx,.zip" style="display: none;">
                            </div>
                        </div>
                        <div class="chat-popup-footer">
                            <button class="chat-btn-primary" id="btn-save-char-emoji-batch" style="width: 100%;">解析并导入</button>
                        </div>
                    </div>
                </div>

                <!-- 25.1. 角色表情包移动分组弹窗 -->
                <div class="chat-popup-overlay" id="chat-char-emoji-move-popup" style="z-index: 1060; background-color: rgba(0, 0, 0, 0.4);">
                    <div class="chat-popup-content" style="max-width: 320px;">
                        <div class="chat-popup-header">
                            <h3 class="chat-popup-title" id="char-emoji-move-title">移动到分组</h3>
                            <button class="chat-popup-close btn-close-char-emoji-sub">✕</button>
                        </div>
                        <div class="chat-popup-body" style="padding: 16px;">
                            <div class="persona-form-group" style="margin: 0;">
                                <select id="char-emoji-move-target-group" class="persona-input" style="appearance: auto; cursor: pointer;"></select>
                            </div>
                        </div>
                        <div class="chat-popup-footer">
                            <button class="chat-btn-primary" id="btn-confirm-move-char-emojis" style="width: 100%;">确认移动</button>
                        </div>
                    </div>
                </div>
                
                <!-- 25.2. 角色表情包分组操作弹窗 -->
                <div class="chat-popup-overlay" id="chat-char-emoji-group-action-popup" style="z-index: 1060; background-color: rgba(0, 0, 0, 0.4);">
                    <div class="chat-popup-content" style="max-width: 320px;">
                        <div class="chat-popup-header">
                            <h3 class="chat-popup-title">管理角色分组</h3>
                            <button class="chat-popup-close btn-close-char-emoji-sub">✕</button>
                        </div>
                        <div class="chat-popup-body" style="padding: 16px; max-height: 400px; overflow-y: auto;">
                            <div class="persona-form-group" style="margin-bottom: 16px;">
                                <label>重命名分组</label>
                                <input type="text" id="char-emoji-group-action-name" class="persona-input" placeholder="输入新的分组名称">
                            </div>
                            
                            <div class="persona-form-group" style="margin: 0;">
                                <label>适用范围 (在此分组下的表情均遵循此范围)</label>
                                <select id="char-emoji-group-target-type" class="persona-input" style="appearance: auto; cursor: pointer; margin-bottom: 8px;">
                                    <option value="global">所有角色均可使用</option>
                                    <option value="specific">指定角色专属</option>
                                </select>
                                <div id="char-emoji-group-target-chars" style="display: none; flex-wrap: wrap; gap: 6px; padding: 8px; background: rgba(0,0,0,0.02); border-radius: 8px;">
                                    <!-- Checkboxes for characters generated by JS -->
                                </div>
                            </div>
                        </div>
                        <div class="chat-popup-footer" style="display: flex; gap: 8px;">
                            <button class="chat-btn-danger" id="btn-char-emoji-group-delete" style="flex: 1;">删除分组</button>
                            <button class="chat-btn-primary" id="btn-char-emoji-group-save" style="flex: 1;">保存</button>
                        </div>
                    </div>
                </div>

                <!-- 26. 会话分配分组弹窗 -->
                <div class="chat-popup-overlay" id="chat-session-group-popup" style="z-index: 1060; background-color: rgba(0, 0, 0, 0.4);">
                    <div class="chat-popup-content" style="max-width: 320px;">
                        <div class="chat-popup-header">
                            <h3 class="chat-popup-title">选择分组</h3>
                            <button class="chat-popup-close btn-close-session-group-sub">✕</button>
                        </div>
                        <div class="chat-popup-body chat-scroll-area" style="padding: 16px;">
                            <div class="persona-form-group" style="margin-bottom: 16px;">
                                <label>移动到以下分组</label>
                                <select id="session-group-select" class="persona-input" style="appearance: auto; cursor: pointer; margin-bottom: 8px;"></select>
                            </div>
                            <div class="persona-form-group" style="margin-bottom: 0;">
                                <label>或创建新分组</label>
                                <div style="display: flex; gap: 8px;">
                                    <input type="text" id="session-group-new-name" class="persona-input" placeholder="输入新分组名称" style="flex: 1; margin: 0;">
                                    <button class="chat-btn-outline" id="btn-create-session-group" style="padding: 0 12px; white-space: nowrap;">创建</button>
                                </div>
                            </div>
                            <div class="persona-form-group" style="margin-top: 16px;">
                                <button class="chat-btn-text" id="btn-manage-session-groups" style="width: 100%; color: var(--accent-color); font-size: 13px;"><i class="ph ph-gear"></i> 管理分组</button>
                            </div>
                        </div>
                        <div class="chat-popup-footer">
                            <button class="chat-btn-primary" id="btn-confirm-session-group" style="width: 100%;">确认移动</button>
                        </div>
                    </div>
                </div>

                <!-- 27. 会话分组管理弹窗 -->
                <div class="chat-popup-overlay" id="chat-session-group-manage-popup" style="z-index: 1070; background-color: rgba(0, 0, 0, 0.4);">
                    <div class="chat-popup-content" style="max-width: 320px; display: flex; flex-direction: column; max-height: 80vh;">
                        <div class="chat-popup-header">
                            <h3 class="chat-popup-title">管理分组</h3>
                            <div class="chat-popup-actions" style="display: flex; align-items: center;">
                                <button class="chat-btn-text" id="btn-manage-session-groups-multi" style="margin-right: 8px;">多选</button>
                                <button class="chat-popup-close btn-close-session-group-manage">✕</button>
                            </div>
                        </div>
                        <div class="chat-popup-body chat-scroll-area" style="padding: 16px; flex: 1; overflow-y: auto;">
                            <div id="session-group-manage-list" style="display: flex; flex-direction: column; gap: 8px;">
                                <!-- 动态生成 -->
                            </div>
                        </div>
                        <div class="chat-popup-footer" id="session-group-manage-footer" style="display: none; gap: 8px; flex-wrap: wrap;">
                            <button class="chat-btn-outline" id="btn-select-all-session-groups" style="flex: 1; font-size: 13px; padding: 8px;">全选</button>
                            <button class="chat-btn-danger" id="btn-delete-selected-session-groups" style="flex: 1.5; background-color: #FF3B30; color: white; font-size: 13px; padding: 8px;" disabled>删除 (0)</button>
                        </div>
                    </div>
                </div>

                <!-- 28. API 历史详情弹窗 -->
                <div class="chat-popup-overlay" id="chat-api-history-detail-popup" style="z-index: 1080; background-color: rgba(0, 0, 0, 0.4);">
                    <div class="chat-popup-content" style="max-width: 600px; width: 90%; height: 85%; max-height: 800px; display: flex; flex-direction: column; border-radius: 16px;">
                        <div class="chat-popup-header">
                            <h3 class="chat-popup-title">API 记录详情</h3>
                            <button class="chat-popup-close btn-close-api-history-detail">✕</button>
                        </div>
                        <div class="chat-popup-body chat-scroll-area" style="flex: 1; padding: 16px; background-color: #f9f9f9; display: flex; flex-direction: column; gap: 16px;">
                            <div style="background: #fff; border-radius: 12px; border: 1px solid var(--border-color); padding: 12px;">
                                <h4 style="font-size: 13px; color: var(--text-color); margin: 0 0 8px 0; font-weight: 600;">Request Data (发送给 AI 的数据)</h4>
                                <pre id="api-history-detail-req" style="margin: 0; font-family: monospace; font-size: 12px; color: #333; white-space: pre-wrap; word-wrap: break-word; max-height: 250px; overflow-y: auto; background: rgba(0,0,0,0.03); padding: 8px; border-radius: 6px; border: 1px solid rgba(0,0,0,0.05);"></pre>
                            </div>
                            <div style="background: #fff; border-radius: 12px; border: 1px solid var(--border-color); padding: 12px;">
                                <h4 style="font-size: 13px; color: var(--text-color); margin: 0 0 8px 0; font-weight: 600;">Response Data (AI 返回的数据)</h4>
                                <pre id="api-history-detail-res" style="margin: 0; font-family: monospace; font-size: 12px; color: #333; white-space: pre-wrap; word-wrap: break-word; max-height: 250px; overflow-y: auto; background: rgba(0,0,0,0.03); padding: 8px; border-radius: 6px; border: 1px solid rgba(0,0,0,0.05);"></pre>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
`;
