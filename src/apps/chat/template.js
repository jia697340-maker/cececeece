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
       
       
                        <div class="chat-scroll-area" id="chat-list-container">
                            <!-- 动态生成聊天列表 -->
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
                            <input type="file" id="char-import-upload" accept=".png,.json" style="display: none;">
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
                            <input type="file" id="char-document-upload" accept=".txt,.doc,.docx" style="display: none;">
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
                <div class="chat-popup-overlay" id="chat-alert-popup" style="z-index: 999; background-color: rgba(0, 0, 0, 0.15); backdrop-filter: blur(2px); -webkit-backdrop-filter: blur(2px);">
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

                        <div class="chat-popup-tabs">
                            <div class="chat-popup-tab active" data-tab="cs-tab-role">角色</div>
                            <div class="chat-popup-tab" data-tab="cs-tab-user">我的身份</div>
                            <div class="chat-popup-tab" data-tab="cs-tab-memory">记忆与设定</div>
                            <div class="chat-popup-tab" data-tab="cs-tab-appearance">美化</div>
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
                                    <div id="cs-user-persona-options-panel" style="display: none; position: absolute; left: 0; right: 0; top: 42px; background-color: var(--app-bg); border-radius: 12px; border: 1px solid var(--border-color); box-shadow: 0 10px 30px rgba(0,0,0,0.15); max-height: 200px; overflow-y: auto; padding: 4px; font-size: 14px; backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);">
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
                                    <div id="cs-worldbook-options-panel" style="display: none; position: absolute; left: 0; right: 0; top: 76px; background-color: var(--app-bg); border-radius: 12px; border: 1px solid var(--border-color); box-shadow: 0 10px 30px rgba(0,0,0,0.15); z-index: 999; max-height: 200px; overflow-y: auto; padding: 4px; font-size: 14px; backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);">
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
                                            <button class="chat-btn-text" id="btn-clear-chat-bg" style="font-size: 12px; padding: 2px; color: #FF3B30; display: none;">清除</button>
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
                                        
                                        <div id="cs-avatar-display-options-panel" style="display: none; position: absolute; left: 0; right: 0; top: 76px; background-color: var(--app-bg); border-radius: 12px; border: 1px solid var(--border-color); box-shadow: 0 10px 30px rgba(0,0,0,0.15); z-index: 999; max-height: 200px; overflow-y: auto; padding: 4px; font-size: 14px; backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);">
                                        </div>
                                        
                                        <input type="hidden" id="cs-avatar-display-select" value="hide_me">
                                    </div>

                                    <div class="persona-form-group" style="margin-bottom: 16px; position: relative;">
                                        <label style="display: flex; align-items: center; gap: 6px; justify-content: space-between;">
                                            <span><i class="ph ph-chat-circle"></i> 气泡样式</span>
                                        </label>
                                        
                                        <div id="cs-bubble-style-dropdown-trigger" style="background-color: var(--app-bg); padding: 12px 16px; border-radius: 12px; border: 1px solid var(--border-color); color: var(--text-color); font-size: 14px; width: 100%; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.2s;">
                                            <span id="cs-bubble-style-selected-text">默认极简</span>
                                            <i class="ph ph-caret-down" style="color: var(--text-secondary); transition: transform 0.3s;" id="cs-bubble-style-caret"></i>
                                        </div>
                                        
                                        <div id="cs-bubble-style-options-panel" style="display: none; position: absolute; left: 0; right: 0; top: 76px; background-color: var(--app-bg); border-radius: 12px; border: 1px solid var(--border-color); box-shadow: 0 10px 30px rgba(0,0,0,0.15); z-index: 999; max-height: 200px; overflow-y: auto; padding: 4px; font-size: 14px; backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);">
                                        </div>
                                        
                                        <input type="hidden" id="cs-bubble-style-select" value="default">
                                    </div>

                                    <div class="persona-form-group" style="margin-bottom: 16px; position: relative;">
                                        <label style="display: flex; align-items: center; gap: 6px; justify-content: space-between;">
                                            <span><i class="ph ph-quotes"></i> 引用显示位置</span>
                                        </label>
                                        
                                        <div id="cs-quote-style-dropdown-trigger" style="background-color: var(--app-bg); padding: 12px 16px; border-radius: 12px; border: 1px solid var(--border-color); color: var(--text-color); font-size: 14px; width: 100%; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.2s;">
                                            <span id="cs-quote-style-selected-text">在气泡内 (微信风格)</span>
                                            <i class="ph ph-caret-down" style="color: var(--text-secondary); transition: transform 0.3s;" id="cs-quote-style-caret"></i>
                                        </div>
                                        
                                        <div id="cs-quote-style-options-panel" style="display: none; position: absolute; left: 0; right: 0; top: 76px; background-color: var(--app-bg); border-radius: 12px; border: 1px solid var(--border-color); box-shadow: 0 10px 30px rgba(0,0,0,0.15); z-index: 999; max-height: 200px; overflow-y: auto; padding: 4px; font-size: 14px; backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);">
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
                                        
                                        <div id="cs-msg-time-pos-options-panel" style="display: none; position: absolute; left: 0; right: 0; top: 76px; background-color: var(--app-bg); border-radius: 12px; border: 1px solid var(--border-color); box-shadow: 0 10px 30px rgba(0,0,0,0.15); z-index: 999; max-height: 200px; overflow-y: auto; padding: 4px; font-size: 14px; backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);">
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
                                        
                                        <div id="cs-msg-time-format-options-panel" style="display: none; position: absolute; left: 0; right: 0; top: 76px; background-color: var(--app-bg); border-radius: 12px; border: 1px solid var(--border-color); box-shadow: 0 10px 30px rgba(0,0,0,0.15); z-index: 999; max-height: 200px; overflow-y: auto; padding: 4px; font-size: 14px; backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);">
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
                                        
                                        <div id="cs-typing-style-options-panel" style="display: none; position: absolute; left: 0; right: 0; top: 76px; background-color: var(--app-bg); border-radius: 12px; border: 1px solid var(--border-color); box-shadow: 0 10px 30px rgba(0,0,0,0.15); z-index: 999; max-height: 200px; overflow-y: auto; padding: 4px; font-size: 14px; backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);">
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
                            <button class="chat-popup-close btn-close-popup">✕</button>
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
                            <button class="chat-popup-close btn-close-popup">✕</button>
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
                <div class="chat-popup-overlay" id="chat-prompt-popup" style="z-index: 1005; background-color: rgba(0, 0, 0, 0.15); backdrop-filter: blur(2px); -webkit-backdrop-filter: blur(2px); transition: opacity 0.2s ease;">
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
                <div class="chat-popup-overlay" id="chat-confirm-popup" style="z-index: 1000; background-color: rgba(0, 0, 0, 0.15); backdrop-filter: blur(2px); -webkit-backdrop-filter: blur(2px); transition: opacity 0.2s ease;">
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
                            <div class="chat-conv-title-box">
                                <div class="chat-conv-title-top">
                                    <span class="chat-conv-name" id="chat-conv-name">角色名称</span>
                                    <div class="chat-conv-status-dot" id="chat-conv-status-dot"></div>
                                </div>
                                <span class="chat-conv-status-text" id="chat-conv-status-text">ACTIVE NOW</span>
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
                        </div>
                    </div>
                </div>
                
                <!-- 15. 消息操作菜单 (全局居中 Grid Panel 风格) -->
                <!-- 多选操作底栏 -->
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
                <div class="chat-popup-overlay" id="chat-timezone-popup" style="z-index: 1050; background-color: rgba(0, 0, 0, 0.2); backdrop-filter: blur(2px); -webkit-backdrop-filter: blur(2px); transition: opacity 0.2s ease;">
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

            </div>
        </div>
`;
