window.SystemApps = window.SystemApps || {};

window.SystemApps['chat'] = {
    html: window.ChatAppTemplate,

    init: function(closeCallback, container) {
        // 1. 初始化核心上下文
        const ctx = new window.ChatContext(container, closeCallback);
        window.currentChatContext = ctx; // 临时挂载到全局，方便模块间通讯与调试
        
        // --- 各模块初始化 ---
        // 随着拆分进度，这里将逐步取消注释并调用对应的模块初始化方法

        // 2. 会话列表模块
        if (window.ChatSession) {
            ctx.sessionModule = new window.ChatSession(ctx);
            // 初始化渲染
            ctx.sessionModule.renderChatListGroups();
            setTimeout(() => {
                ctx.sessionModule.renderChatList();
            }, 250);
        }

        // 3. 聊天交互模块
        if (window.ChatConversationModule) {
            window.ChatConversationModule.init(ctx);
        }

        // 4. 用户人设模块
        if (window.ChatPersonaModule) {
            window.ChatPersonaModule.init(ctx);
        }

        // 5. AI 角色模块
        if (window.ChatCharacterModule) {
            window.ChatCharacterModule.init(ctx);
        }

        // 6. 表情包模块
        if (window.ChatEmojiModule) {
            window.ChatEmojiModule.init(ctx);
        }

        // 7. 记忆模块
        if (window.ChatMemoryModule) {
            window.ChatMemoryModule.init(ctx);
        }

        // 8. 动态页模块
        if (window.ChatDynamicModule) {
            window.ChatDynamicModule.init(ctx);
        }
        
        // --- 其他未拆分的零散逻辑占位 ---
        // 比如：顶部 Header 控制、底部导航栏逻辑 等
        this.initBasicUI(ctx);
    },

    initBasicUI: function(ctx) {
        const { leftBtn, rightBtn, headerTitle, headerSubtitle, navPills, views, popupCreate } = ctx.nodes;

        // 顶部 Header 控制逻辑
        if (rightBtn && popupCreate) {
            rightBtn.addEventListener('click', () => {
                const activeView = ctx.container.querySelector('.chat-view.active');
                if (activeView && (activeView.id === 'chat-view-messages' || activeView.id === 'chat-view-contacts')) {
                    popupCreate.classList.add('active');
                }
            });
        }

        const updateHeader = (tab) => {
            if (tab === 'chat-view-messages') {
                headerSubtitle.textContent = 'INBOX';
                headerTitle.textContent = '消息';
                leftBtn.innerHTML = '<i class="ph ph-caret-left"></i>';
                leftBtn.style.visibility = 'visible';
                rightBtn.innerHTML = '<i class="ph ph-pencil-simple"></i>';
                rightBtn.style.visibility = 'visible';
            } else if (tab === 'chat-view-contacts') {
                headerSubtitle.textContent = 'ADDRESS BOOK';
                headerTitle.textContent = '联系人';
                leftBtn.style.visibility = 'hidden';
                rightBtn.innerHTML = '<i class="ph ph-user-plus"></i>';
                rightBtn.style.visibility = 'visible';
            } else if (tab === 'chat-view-dynamic') {
                headerSubtitle.textContent = 'MOMENTS';
                headerTitle.textContent = '动态';
                leftBtn.style.visibility = 'hidden';
                rightBtn.innerHTML = '<i class="ph ph-plus"></i>';
                rightBtn.style.visibility = 'visible';
            } else if (tab === 'chat-view-settings') {
                headerSubtitle.textContent = 'PROFILE';
                headerTitle.textContent = '设置';
                leftBtn.style.visibility = 'hidden';
                rightBtn.innerHTML = '<i class="ph ph-gear"></i>';
                rightBtn.style.visibility = 'visible';
            }
        };

        if (leftBtn) {
            leftBtn.addEventListener('click', () => {
                const activeView = ctx.container.querySelector('.chat-view.active');
                if (activeView && activeView.id === 'chat-view-messages') {
                    if (typeof ctx.closeCallback === 'function') {
                        ctx.closeCallback();
                    }
                }
            });
        }

        // 底部导航栏逻辑
        if (navPills && views) {
            navPills.forEach(pill => {
                pill.addEventListener('click', () => {
                    navPills.forEach(p => p.classList.remove('active'));
                    pill.classList.add('active');

                    const targetId = pill.getAttribute('data-target');
                    views.forEach(view => {
                        view.classList.remove('active');
                        if (view.id === targetId) {
                            view.classList.add('active');
                        }
                    });
                    
                    updateHeader(targetId);
                });
            });
        }
        
        // 统一执行关闭弹窗的全局事件处理
        ctx.on('closeAllPopups', () => {
            // 精确指定需要关闭的弹窗 ID，避免误伤主窗口 (主窗口也带 settings-modal/chat-popup 类)
            const popupIds = [
                '#persona-library-popup', '#persona-edit-popup', '#persona-view-popup', 
                '#chat-create-popup', '#chat-create-character-type-popup', '#character-edit-popup', '#character-settings-popup', 
                '#chat-alert-popup', '#chat-confirm-popup', '#chat-prompt-popup',
                '#memory-library-popup', '#memory-edit-popup', '#chat-transfer-action-popup',
                '#chat-timezone-popup', '#cs-avatar-shape-popup',
                '#chat-emoji-manage-popup', '#chat-emoji-single-popup', '#chat-emoji-batch-popup', '#chat-emoji-group-action-popup',
                '#chat-char-emoji-manage-popup', '#chat-char-emoji-single-popup', '#chat-char-emoji-batch-popup', '#chat-char-emoji-group-action-popup'
            ];
            
            popupIds.forEach(id => {
                const p = ctx.container.querySelector(id);
                if (p) p.classList.remove('active');
            });
            
            // 发出事件让其他模块 (例如人设库) 可以去重置它们的“管理模式”等多选状态
            ctx.emit('popupsClosed');
        });

        // 统一关闭主弹窗
        ctx.container.querySelectorAll('.btn-close-popup').forEach(btn => {
            btn.addEventListener('click', () => ctx.emit('closeAllPopups'));
        });

        // 点击遮罩层空白处关闭弹窗
        ctx.container.querySelectorAll('.chat-popup-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    const closeBtn = overlay.querySelector('.btn-close-popup, .btn-close-memory-sub, .btn-close-emoji-sub, .btn-close-char-emoji-sub, .btn-close-help, .btn-prompt-cancel, .btn-confirm-cancel, .btn-close-alert, .btn-close-transfer, .btn-location-cancel, .btn-close-shape-popup, .btn-close-timezone, .btn-close-session-group-sub, .btn-close-session-group-manage');
                    if (closeBtn) {
                        closeBtn.click();
                    } else {
                        overlay.classList.remove('active');
                    }
                }
            });
        });

        // 独立关闭表情包子弹窗、记忆库子弹窗、会话分组相关子弹窗（保留底层的弹窗）
        ctx.container.querySelectorAll('.btn-close-emoji-sub, .btn-close-char-emoji-sub, .btn-close-session-group-sub, .btn-close-session-group-manage, .btn-close-memory-sub').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const subPopup = e.target.closest('.chat-popup-overlay');
                if (subPopup) {
                    subPopup.classList.remove('active');
                }
            });
        });

        // 独立关闭帮助教程弹窗
        ctx.container.querySelectorAll('.btn-close-help').forEach(btn => {
            btn.addEventListener('click', () => {
                const popupTimezoneHelp = ctx.container.querySelector('#timezone-help-popup');
                if (popupTimezoneHelp) popupTimezoneHelp.classList.remove('active');
            });
        });
    },

    destroy: function(container) {
        console.log('Chat OS app destroyed');
        if (window.currentChatContext) {
            if (window.currentChatContext.timezoneClockInterval) {
                clearInterval(window.currentChatContext.timezoneClockInterval);
            }
            if (window.currentChatContext.toastTimeout) {
                clearTimeout(window.currentChatContext.toastTimeout);
            }
            window.currentChatContext = null;
        }
    }
};
