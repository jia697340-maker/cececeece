window.SystemApps = window.SystemApps || {};

window.SystemApps['chat'] = {
    html: window.ChatAppTemplate,

    init: function(closeCallback, container) {
        // --- 数据模型 ---
        const ALL_TIMEZONES = window.ChatConstants.ALL_TIMEZONES;

        let initialMessages = [];
        let aiAbortController = null;
        let aiReplyPaused = false;
        let currentQuote = null; // 当前正在引用的消息

        // --- 消息操作菜单逻辑 ---
        let activeMessageForMenu = null;
        const msgMenuOverlay = container.querySelector('#chat-message-menu-overlay');
        const msgMenu = container.querySelector('#chat-message-menu');
        const btnMsgCopy = container.querySelector('#btn-msg-copy');
        const btnMsgReply = container.querySelector('#btn-msg-reply');
        const btnMsgEdit = container.querySelector('#btn-msg-edit');
        const btnMsgRecall = container.querySelector('#btn-msg-recall');
        const btnMsgDelete = container.querySelector('#btn-msg-delete');
        const btnMsgSelect = container.querySelector('#btn-msg-select');
        
        // 多选模式状态
        let isMessageSelectMode = false;
        let selectedMessageIndices = new Set();
        
        const chatComposerArea = container.querySelector('.chat-composer-area');
        const chatMessageSelectBar = container.querySelector('#chat-message-select-bar');
        const btnSelectBarCancel = container.querySelector('#btn-select-bar-cancel');
        const btnSelectBarDelete = container.querySelector('#btn-select-bar-delete');
        const btnSelectBarAll = container.querySelector('#btn-select-bar-all');
        const convMessagesNode = container.querySelector('#chat-conv-messages');
        
        const updateSelectBarUI = () => {
            if (!currentPersona) return;
            const history = getChatHistory(currentPersona.id);
            const totalMessages = history.length;
            
            btnSelectBarDelete.textContent = `删除(${selectedMessageIndices.size})`;
            btnSelectBarDelete.disabled = selectedMessageIndices.size === 0;
            
            if (selectedMessageIndices.size > 0 && selectedMessageIndices.size === totalMessages) {
                btnSelectBarAll.textContent = '取消全选';
            } else {
                btnSelectBarAll.textContent = '全选';
            }
            
            // 更新每一行的选中状态
            const rows = convMessagesNode.querySelectorAll('.chat-bubble-row');
            rows.forEach(row => {
                const idx = parseInt(row.getAttribute('data-msg-idx'));
                if (!isNaN(idx)) {
                    if (selectedMessageIndices.has(idx)) {
                        row.classList.add('selected');
                        const checkbox = row.querySelector('.msg-checkbox');
                        if (checkbox) checkbox.innerHTML = '<i class="ph-bold ph-check"></i>';
                    } else {
                        row.classList.remove('selected');
                        const checkbox = row.querySelector('.msg-checkbox');
                        if (checkbox) checkbox.innerHTML = '';
                    }
                }
            });
        };
        
        const exitMessageSelectMode = () => {
            isMessageSelectMode = false;
            selectedMessageIndices.clear();
            if (chatMessageSelectBar) chatMessageSelectBar.classList.remove('active');
            if (chatComposerArea) chatComposerArea.style.display = 'block';
            if (convMessagesNode) convMessagesNode.classList.remove('select-mode');
            
            if (convMessagesNode) {
                const rows = convMessagesNode.querySelectorAll('.chat-bubble-row');
                rows.forEach(row => {
                    row.classList.remove('selected');
                    const checkbox = row.querySelector('.msg-checkbox');
                    if (checkbox) checkbox.innerHTML = '';
                });
            }
        };

        if (btnSelectBarCancel) {
            btnSelectBarCancel.addEventListener('click', exitMessageSelectMode);
        }

        if (btnSelectBarAll) {
            btnSelectBarAll.addEventListener('click', () => {
                if (!currentPersona) return;
                const history = getChatHistory(currentPersona.id);
                if (selectedMessageIndices.size === history.length) {
                    selectedMessageIndices.clear();
                } else {
                    history.forEach((_, idx) => selectedMessageIndices.add(idx));
                }
                updateSelectBarUI();
            });
        }

        if (btnSelectBarDelete) {
            btnSelectBarDelete.addEventListener('click', () => {
                if (selectedMessageIndices.size === 0) return;
                if (typeof showChatConfirm === 'function') {
                    showChatConfirm('批量删除消息', `确定要删除选中的 ${selectedMessageIndices.size} 条消息吗？删除后不可恢复。`, () => {
                        if (!currentPersona) return;
                        const charId = currentPersona.id;
                        let history = getChatHistory(charId);
                        
                        // 从后往前删，避免索引偏移
                        const indicesToDelete = Array.from(selectedMessageIndices).sort((a, b) => b - a);
                        indicesToDelete.forEach(idx => {
                            if (history[idx]) {
                                history.splice(idx, 1);
                            }
                        });
                        
                        saveChatHistory(charId, history);
                        
                        // 更新最后一条消息状态
                        if (history.length > 0) {
                            let lastMessageContent = '暂无消息';
                            for (let j = history.length - 1; j >= 0; j--) {
                                if (history[j].role !== 'system') {
                                    lastMessageContent = history[j].content;
                                    break;
                                }
                            }
                            currentPersona.message = lastMessageContent;
                        } else {
                            currentPersona.message = '暂无消息';
                        }
                        
                        exitMessageSelectMode();
                        if (typeof openConversation === 'function') {
                            openConversation(currentPersona);
                        }
                        if (typeof renderChatList === 'function') renderChatList();
                    });
                }
            });
        }
        
        if (convMessagesNode) {
            convMessagesNode.addEventListener('click', (e) => {
                if (isMessageSelectMode) {
                    const row = e.target.closest('.chat-bubble-row');
                    if (row) {
                        const idx = parseInt(row.getAttribute('data-msg-idx'));
                        if (!isNaN(idx)) {
                            if (selectedMessageIndices.has(idx)) {
                                selectedMessageIndices.delete(idx);
                            } else {
                                selectedMessageIndices.add(idx);
                            }
                            updateSelectBarUI();
                        }
                    }
                }
            });
        }

        const closeMsgMenu = () => {
            if (msgMenuOverlay) msgMenuOverlay.style.display = 'none';
            activeMessageForMenu = null;
        };

        if (msgMenuOverlay) {
            msgMenuOverlay.addEventListener('click', (e) => {
                if (e.target === msgMenuOverlay) {
                    closeMsgMenu();
                }
            });
            msgMenuOverlay.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                closeMsgMenu();
            });
        }

        // Toast 全局提示框注入
        let chatOsToast = document.getElementById('chat-os-global-toast');
        if (!chatOsToast) {
            chatOsToast = document.createElement('div');
            chatOsToast.id = 'chat-os-global-toast';
            chatOsToast.className = 'chat-os-toast';
            document.body.appendChild(chatOsToast);
        }
        let toastTimeout = null;

        window._showChatOSToast = function(message, icon = 'ph-check-circle') {
            if (!chatOsToast) return;
            
            // 检查主题设置
            const isLight = localStorage.getItem('nrj-toast-theme') === 'light';
            if (isLight) {
                chatOsToast.classList.add('theme-light');
            } else {
                chatOsToast.classList.remove('theme-light');
            }

            chatOsToast.innerHTML = `<i class="ph ${icon}"></i> <span>${message}</span>`;
            chatOsToast.classList.add('show');
            if (toastTimeout) clearTimeout(toastTimeout);
            toastTimeout = setTimeout(() => {
                chatOsToast.classList.remove('show');
            }, 2000);
        };

        if (btnMsgCopy) {
            btnMsgCopy.addEventListener('click', () => {
                if (!activeMessageForMenu) return;
                navigator.clipboard.writeText(activeMessageForMenu.text).then(() => {
                    if (window._showChatOSToast) window._showChatOSToast('已复制', 'ph-copy');
                }).catch(() => {
                    if (window._showChatOSToast) window._showChatOSToast('复制失败', 'ph-x-circle');
                });
                closeMsgMenu();
            });
        }

        const quotePreview = container.querySelector('#chat-quote-preview');
        const quoteName = container.querySelector('#chat-quote-name');
        const quoteText = container.querySelector('#chat-quote-text');
        const quoteCloseBtn = container.querySelector('#chat-quote-close');

        if (quoteCloseBtn) {
            quoteCloseBtn.addEventListener('click', () => {
                currentQuote = null;
                if (quotePreview) quotePreview.style.display = 'none';
            });
        }

        if (btnMsgReply) {
            btnMsgReply.addEventListener('click', () => {
                if (!activeMessageForMenu) return;
                
                let senderName = '未知';
                if (currentPersona) {
                    const charConfig = JSON.parse(localStorage.getItem(`nrj-chat-config-${currentPersona.id}`) || '{}');
                    const personas = loadPersonas();
                    
                    if (activeMessageForMenu.msgObj && activeMessageForMenu.msgObj.role === 'user') {
                        let activeUserId = charConfig.userPersonaId || getActivePersonaId();
                        let activeUser = personas.find(p => p.id === activeUserId);
                        if (!activeUser) activeUser = personas.find(p => p.id === getActivePersonaId()) || { nickname: '我', realname: '我' };
                        senderName = activeUser.nickname || activeUser.realname || '我';
                    } else if (activeMessageForMenu.msgObj && activeMessageForMenu.msgObj.role === 'assistant') {
                        const charData = currentPersona.rawCharData || currentPersona;
                        senderName = charData.nickname || charData.realname || charData.name || '未知';
                    } else {
                        senderName = '系统';
                    }
                }

                // 获取纯文本
                let plainText = activeMessageForMenu.text;
                // 去除可能带有的其它指令，比如转移、图片、自身带有的引用等
                plainText = plainText.replace(/\[\[QUOTE:.*?\]\]/g, '').trim();

                currentQuote = {
                    name: senderName,
                    text: plainText
                };
                
                if (quotePreview && quoteName && quoteText) {
                    quoteName.textContent = senderName;
                    
                    let previewText = plainText;
                    if (previewText.includes('[[IMAGE:')) previewText = '[图片]';
                    else if (previewText.includes('[[VOICE:')) previewText = '[语音]';
                    else if (previewText.includes('[[LOCATION:')) previewText = '[位置]';
                    else if (previewText.includes('[[TRANSFER:')) previewText = '[转账]';
                    
                    quoteText.textContent = previewText;
                    quotePreview.style.display = 'block';
                }

                closeMsgMenu();
                
                const convInput = container.querySelector('#chat-conv-input');
                if (convInput) convInput.focus();
            });
        }

        if (btnMsgEdit) {
            btnMsgEdit.addEventListener('click', () => {
                if (!activeMessageForMenu) return;
                const currentText = activeMessageForMenu.text;
                const targetIdx = activeMessageForMenu.index;
                if (typeof showChatPrompt === 'function') {
                    showChatPrompt('编辑消息', currentText, (newText) => {
                        if (!newText || !newText.trim() || newText.trim() === currentText) return;
                        if (!currentPersona) return;
                        
                        const charId = currentPersona.id;
                        let history = getChatHistory(charId);
                        
                        if (history[targetIdx]) {
                            history[targetIdx].content = newText.trim();
                            saveChatHistory(charId, history);
                            if (typeof openConversation === 'function') {
                                openConversation(currentPersona);
                            }
                            if (targetIdx === history.length - 1) {
                                currentPersona.message = newText.trim();
                                if (typeof renderChatList === 'function') renderChatList();
                            }
                        }
                    });
                }
                closeMsgMenu();
            });
        }

        if (btnMsgRecall) {
            btnMsgRecall.addEventListener('click', () => {
                if (!activeMessageForMenu) return;
                const targetIdx = activeMessageForMenu.index;
                const msgObj = activeMessageForMenu.msgObj;
                
                const currentTime = Date.now();
                const msgTime = msgObj && msgObj.timestamp ? msgObj.timestamp : currentTime;
                if (currentTime - msgTime > 5 * 60 * 1000) {
                    if (window._currentChatOSAlert) {
                        window._currentChatOSAlert('提示', '发送超过5分钟的消息无法撤回。');
                    }
                    closeMsgMenu();
                    return;
                }

                if (typeof showChatConfirm === 'function') {
                    showChatConfirm('撤回消息', '确定要撤回这条消息吗？', () => {
                        if (!currentPersona) return;
                        const charId = currentPersona.id;
                        let history = getChatHistory(charId);
                        
                        if (history[targetIdx]) {
                            const originalContent = history[targetIdx].content;
                            
                            let userName = '你';
                            const charConfig = JSON.parse(localStorage.getItem(`nrj-chat-config-${charId}`) || '{}');
                            const personas = loadPersonas();
                            const activeUserId = charConfig.userPersonaId || getActivePersonaId();
                            let activeUser = personas.find(p => p.id === activeUserId);
                            if (!activeUser) {
                                activeUser = personas.find(p => p.id === getActivePersonaId()) || { nickname: '我', realname: '我' };
                            }
                            userName = activeUser.nickname || activeUser.realname || '我';

                            history[targetIdx] = {
                                role: 'system',
                                content: `[${userName} 刚刚撤回了消息，内容是：${originalContent}]`,
                                timestamp: Date.now(),
                                isUserRecall: true,
                                recallContent: originalContent
                            };

                            saveChatHistory(charId, history);
                            if (typeof openConversation === 'function') {
                                openConversation(currentPersona);
                            }
                            if (history.length > 0) {
                                let lastMessageContent = '暂无消息';
                                for (let j = history.length - 1; j >= 0; j--) {
                                    if (history[j].role !== 'system') {
                                        lastMessageContent = history[j].content;
                                        break;
                                    }
                                }
                                currentPersona.message = lastMessageContent;
                            } else {
                                currentPersona.message = '暂无消息';
                            }
                            if (typeof renderChatList === 'function') renderChatList();
                        }
                    });
                }
                closeMsgMenu();
            });
        }

        if (btnMsgSelect) {
            btnMsgSelect.addEventListener('click', () => {
                if (!activeMessageForMenu) return;
                
                // 进入多选模式
                isMessageSelectMode = true;
                selectedMessageIndices.clear();
                selectedMessageIndices.add(activeMessageForMenu.index);
                
                if (chatComposerArea) chatComposerArea.style.display = 'none';
                if (chatMessageSelectBar) chatMessageSelectBar.classList.add('active');
                if (convMessagesNode) convMessagesNode.classList.add('select-mode');
                
                updateSelectBarUI();
                closeMsgMenu();
            });
        }

        if (btnMsgDelete) {
            btnMsgDelete.addEventListener('click', () => {
                if (!activeMessageForMenu) return;
                const targetIdx = activeMessageForMenu.index;
                if (typeof showChatConfirm === 'function') {
                    showChatConfirm('删除消息', '确定要删除这条消息吗？删除后不可恢复。', () => {
                        if (!currentPersona) return;
                        const charId = currentPersona.id;
                        let history = getChatHistory(charId);
                        
                        if (history[targetIdx]) {
                            history.splice(targetIdx, 1);
                            saveChatHistory(charId, history);
                            if (typeof openConversation === 'function') {
                                openConversation(currentPersona);
                            }
                            if (history.length > 0) {
                                let lastMessageContent = '暂无消息';
                                for (let j = history.length - 1; j >= 0; j--) {
                                    if (history[j].role !== 'system') {
                                        lastMessageContent = history[j].content;
                                        break;
                                    }
                                }
                                currentPersona.message = lastMessageContent;
                            } else {
                                currentPersona.message = '暂无消息';
                            }
                            if (typeof renderChatList === 'function') renderChatList();
                        }
                    });
                }
                closeMsgMenu();
            });
        }

        const showMsgMenu = (e, text, msgObj, idx, bubbleEl) => {
            e.preventDefault();
            if (isMessageSelectMode) return;
            activeMessageForMenu = { text, msgObj, index: idx, bubbleEl };

            let plainText = text;
            if (plainText.match(/\[\[TRANSFER:/) || plainText.match(/\[\[VOICE:/) || plainText.match(/\[\[IMAGE:/) || plainText.match(/\[\[LOCATION:/)) {
                btnMsgCopy.style.display = 'none';
                btnMsgEdit.style.display = 'none';
                btnMsgReply.style.display = 'none';
            } else {
                btnMsgCopy.style.display = 'flex';
                btnMsgEdit.style.display = 'flex';
                btnMsgReply.style.display = 'flex';
            }

            if (msgObj && msgObj.role === 'user') {
                btnMsgRecall.style.display = 'flex';
            } else {
                btnMsgRecall.style.display = 'none';
            }

            msgMenuOverlay.style.display = 'flex';
        };

        const feedPosts = [
            {
                id: 1,
                name: '设计团队',
                initials: '设',
                color: '#D9E8DF', textColor: '#35503A',
                time: '2小时前',
                content: '刚刚完成了新一版的 UI 设计，极简主义的风格真的让人心旷神怡。大家觉得怎么样？',
                image: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
                likes: 24,
                comments: 5
            },
            {
                id: 2,
                name: '爱丽丝',
                initials: '爱',
                color: '#E8E1D9', textColor: '#4A3F35',
                time: '5小时前',
                content: '周末去喝了新开的咖啡店，拿铁味道很赞！☕️',
                image: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
                likes: 12,
                comments: 2
            },
            {
                id: 3,
                name: '鲍勃',
                initials: '鲍',
                color: '#D9E2E8', textColor: '#354450',
                time: '昨天',
                content: '今天天气真好，适合出去跑个步。🏃‍♂️',
                image: null,
                likes: 8,
                comments: 1
            }
        ];

        // --- 人设管理逻辑 ---
        const profileName = container.querySelector('.chat-profile-name');
        const profileEmail = container.querySelector('.chat-profile-email');
        const profileAvatar = container.querySelector('.chat-profile-avatar');

        const btnCreatePersona = container.querySelector('#btn-create-persona');
        const btnPersonaLibrary = container.querySelector('#btn-persona-library');

        const popupLibrary = container.querySelector('#persona-library-popup');
        const popupEdit = container.querySelector('#persona-edit-popup');
        const popupView = container.querySelector('#persona-view-popup');
        const popupCreate = container.querySelector('#chat-create-popup');
        const popupCharacterType = container.querySelector('#chat-create-character-type-popup');
        const popupCharacterEdit = container.querySelector('#character-edit-popup');
        const popupTimezoneHelp = container.querySelector('#timezone-help-popup');
        const popupCharacterSettings = container.querySelector('#character-settings-popup');
        
        const customStyleTag = container.querySelector('#chat-custom-style-tag');
        const applyCustomCss = (cssContent) => {
            if (customStyleTag) {
                customStyleTag.textContent = cssContent || '';
            }
        };

        // --- 角色设置弹窗 Tab 逻辑 ---
        const csTabs = container.querySelectorAll('.chat-popup-tab');
        const csTabContents = container.querySelectorAll('.chat-popup-tab-content');
        
        csTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                csTabs.forEach(t => t.classList.remove('active'));
                csTabContents.forEach(c => c.classList.remove('active'));
                
                tab.classList.add('active');
                const targetId = tab.getAttribute('data-tab');
                const targetContent = container.querySelector('#' + targetId);
                if (targetContent) targetContent.classList.add('active');
            });
        });
        
        // --- 自定义 Alert 逻辑 ---
        const chatAlertPopup = container.querySelector('#chat-alert-popup');
        const chatAlertTitle = container.querySelector('#chat-alert-title');
        const chatAlertMessage = container.querySelector('#chat-alert-message');
        const chatAlertDetails = container.querySelector('#chat-alert-details');
        const btnCloseAlert = container.querySelector('.btn-close-alert');

        // --- 自定义 Prompt 逻辑 ---
        const chatPromptPopup = container.querySelector('#chat-prompt-popup');
        const chatPromptContent = container.querySelector('#chat-prompt-popup .chat-popup-content');
        const chatPromptTitle = container.querySelector('#chat-prompt-title');
        const chatPromptInput = container.querySelector('#chat-prompt-input');
        const chatPromptInputSecondary = container.querySelector('#chat-prompt-input-secondary');
        const btnPromptCancel = container.querySelector('.btn-prompt-cancel');
        const btnPromptOk = container.querySelector('.btn-prompt-ok');
        const btnPromptExpand = container.querySelector('#chat-prompt-expand-btn');
        const btnPromptExpandIcon = container.querySelector('#chat-prompt-expand-btn i');

        let promptCallback = null;
        let isPromptExpanded = false;

        const togglePromptExpand = (expand) => {
            if (!chatPromptContent) return;
            if (expand) {
                chatPromptContent.style.maxWidth = '800px';
                chatPromptContent.style.width = '95%';
                chatPromptContent.style.height = '85%';
                chatPromptContent.style.maxHeight = '800px';
                if (chatPromptInput) chatPromptInput.style.resize = 'none';
                if (btnPromptExpandIcon) btnPromptExpandIcon.className = 'ph ph-arrows-in-simple';
                isPromptExpanded = true;
            } else {
                chatPromptContent.style.maxWidth = '340px';
                chatPromptContent.style.width = '90%';
                chatPromptContent.style.height = 'auto';
                chatPromptContent.style.maxHeight = 'none';
                if (chatPromptInput) chatPromptInput.style.resize = 'vertical';
                if (btnPromptExpandIcon) btnPromptExpandIcon.className = 'ph ph-arrows-out-simple';
                isPromptExpanded = false;
            }
        };

        if (btnPromptExpand) {
            btnPromptExpand.addEventListener('click', () => {
                togglePromptExpand(!isPromptExpanded);
            });
        }

        const showChatPrompt = (title, defaultValue, onConfirm, showSecondary = false, secondaryPlaceholder = '') => {
            togglePromptExpand(false); // 每次打开重置为小窗

            if (chatPromptTitle) chatPromptTitle.textContent = title || '输入';
            if (chatPromptInput) {
                chatPromptInput.value = defaultValue || '';
                // 延迟获得焦点
                setTimeout(() => chatPromptInput.focus(), 100);
            }
            if (chatPromptInputSecondary) {
                if (showSecondary) {
                    chatPromptInputSecondary.style.display = 'block';
                    chatPromptInputSecondary.placeholder = secondaryPlaceholder || '';
                    chatPromptInputSecondary.value = '';
                } else {
                    chatPromptInputSecondary.style.display = 'none';
                    chatPromptInputSecondary.value = '';
                }
            }
            promptCallback = onConfirm;
            if (chatPromptPopup) chatPromptPopup.classList.add('active');
        };

        if (btnPromptCancel) {
            btnPromptCancel.addEventListener('click', () => {
                if (chatPromptPopup) chatPromptPopup.classList.remove('active');
                promptCallback = null;
            });
        }

        if (btnPromptOk) {
            btnPromptOk.addEventListener('click', () => {
                const val = chatPromptInput ? chatPromptInput.value.trim() : '';
                const secondaryVal = (chatPromptInputSecondary && chatPromptInputSecondary.style.display !== 'none') ? chatPromptInputSecondary.value.trim() : null;
                if (chatPromptPopup) chatPromptPopup.classList.remove('active');
                if (promptCallback) {
                    if (chatPromptInputSecondary && chatPromptInputSecondary.style.display !== 'none') {
                        promptCallback(val, secondaryVal);
                    } else {
                        promptCallback(val);
                    }
                    promptCallback = null;
                }
            });
        }
        
        if (chatPromptInput) {
            chatPromptInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (chatPromptInputSecondary && chatPromptInputSecondary.style.display !== 'none') {
                        chatPromptInputSecondary.focus();
                    } else {
                        if (btnPromptOk) btnPromptOk.click();
                    }
                }
            });
        }

        if (chatPromptInputSecondary) {
            chatPromptInputSecondary.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (btnPromptOk) btnPromptOk.click();
                }
            });
        }
        
        // --- 自定义 Confirm 逻辑 ---
        const chatConfirmPopup = container.querySelector('#chat-confirm-popup');
        const chatConfirmTitle = container.querySelector('#chat-confirm-title');
        const chatConfirmMessage = container.querySelector('#chat-confirm-message');
        const btnConfirmCancel = container.querySelector('.btn-confirm-cancel');
        const btnConfirmOk = container.querySelector('.btn-confirm-ok');
        
        let confirmCallback = null;

        const showChatConfirm = (title, message, onConfirm) => {
            if (chatConfirmTitle) {
                if (title) {
                    chatConfirmTitle.textContent = title;
                    chatConfirmTitle.style.display = 'block';
                } else {
                    chatConfirmTitle.style.display = 'none';
                }
            }
            if (chatConfirmMessage) chatConfirmMessage.textContent = message;
            
            confirmCallback = onConfirm;
            
            if (chatConfirmPopup) chatConfirmPopup.classList.add('active');
        };

        if (btnConfirmCancel) {
            btnConfirmCancel.addEventListener('click', () => {
                if (chatConfirmPopup) chatConfirmPopup.classList.remove('active');
                confirmCallback = null;
            });
        }

        if (btnConfirmOk) {
            btnConfirmOk.addEventListener('click', () => {
                if (chatConfirmPopup) chatConfirmPopup.classList.remove('active');
                if (confirmCallback) {
                    confirmCallback();
                    confirmCallback = null;
                }
            });
        }

        const showChatAlert = (title, message, details = null) => {
            // 如果只有轻微提示 (没有details且title是普通提示)，优先转为 Toast 以免打断用户
            if (!details && (title === '提示' || title === '保存成功' || title === '已清空')) {
                let icon = 'ph-info';
                if (title.includes('成功')) icon = 'ph-check-circle';
                if (title.includes('失败') || title.includes('错误')) icon = 'ph-warning-circle';
                if (window._showChatOSToast) {
                    window._showChatOSToast(message, icon);
                    return;
                }
            }

            if (chatAlertTitle) {
                if (title) {
                    chatAlertTitle.textContent = title;
                    chatAlertTitle.style.display = 'block';
                } else {
                    chatAlertTitle.style.display = 'none';
                }
            }
            if (chatAlertMessage) chatAlertMessage.textContent = message;
            if (chatAlertDetails) {
                if (details) {
                    chatAlertDetails.textContent = details;
                    chatAlertDetails.style.display = 'block';
                } else {
                    chatAlertDetails.textContent = '';
                    chatAlertDetails.style.display = 'none';
                }
            }
            if (chatAlertPopup) chatAlertPopup.classList.add('active');
        };

        if (btnCloseAlert) {
            btnCloseAlert.addEventListener('click', () => {
                if (chatAlertPopup) chatAlertPopup.classList.remove('active');
            });
        }

        const closePopups = () => {
            // 注意：不包含 popupTimezoneHelp，它有自己独立的关闭逻辑
            [popupLibrary, popupEdit, popupView, popupCreate, popupCharacterType, popupCharacterEdit, popupCharacterSettings, chatAlertPopup, chatConfirmPopup, chatPromptPopup,
             container.querySelector('#memory-library-popup'), container.querySelector('#memory-edit-popup'), container.querySelector('#chat-transfer-action-popup'),
             container.querySelector('#chat-timezone-popup')].forEach(p => {
                if (p) p.classList.remove('active');
            });
            // 退出管理模式
            isManageMode = false;
            selectedPersonaIds.clear();
            updateManageFooter();
            renderPersonaList();
        };

        // 统一关闭主弹窗
        container.querySelectorAll('.btn-close-popup').forEach(btn => {
            btn.addEventListener('click', closePopups);
        });

        // 独立关闭帮助教程弹窗
        container.querySelectorAll('.btn-close-help').forEach(btn => {
            btn.addEventListener('click', () => {
                if (popupTimezoneHelp) popupTimezoneHelp.classList.remove('active');
            });
        });

        const getMemory = window.ChatStorage.getMemory;
        const saveMemory = window.ChatStorage.saveMemory;

        const loadPersonas = window.ChatStorage.loadPersonas;
        const savePersonas = window.ChatStorage.savePersonas;
        const getActivePersonaId = window.ChatStorage.getActivePersonaId;
        const setActivePersonaId = window.ChatStorage.setActivePersonaId;

        const getChatHistory = window.ChatStorage.getChatHistory;
        const saveChatHistory = window.ChatStorage.saveChatHistory;

        const updateProfileDisplay = async () => {
            const personas = loadPersonas();
            const activeId = getActivePersonaId();
            const activePersona = personas.find(p => p.id === activeId);

            if (activePersona) {
                profileName.textContent = activePersona.nickname || activePersona.realname || '未命名';
                profileEmail.textContent = activePersona.bio || '暂无简介';
                let avatarUrl = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                try {
                    if (window.ImageStorageManager) {
                        const url = await window.ImageStorageManager.loadFromIndexedDB(`persona-avatar-${activePersona.id}`);
                        if (url) avatarUrl = url;
                    }
                } catch(e) {}
                profileAvatar.src = avatarUrl;
            } else {
                profileName.textContent = '请选择人设';
                profileEmail.textContent = '暂无选中的人设';
                profileAvatar.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
            }
        };

        // 全局个性签名逻辑
        const signatureBox = container.querySelector('#chat-global-signature-box');
        const signatureText = container.querySelector('#chat-global-signature-text');
        const signatureEdit = container.querySelector('#chat-global-signature-edit');
        const signatureInput = container.querySelector('#chat-global-signature-input');
        const signatureSaveBtn = container.querySelector('#chat-global-signature-save');

        const loadSignature = () => {
            const sig = localStorage.getItem('nrj-chat-global-signature');
            if (sig) {
                signatureText.textContent = sig;
            } else {
                signatureText.textContent = '点击添加个性签名...';
            }
        };

        if (signatureBox && signatureEdit && signatureInput && signatureSaveBtn) {
            loadSignature();

            signatureBox.addEventListener('click', () => {
                signatureBox.style.display = 'none';
                signatureEdit.style.display = 'flex';
                signatureInput.value = localStorage.getItem('nrj-chat-global-signature') || '';
                signatureInput.focus();
            });

            const saveSignature = () => {
                const val = signatureInput.value.trim();
                if (val) {
                    localStorage.setItem('nrj-chat-global-signature', val);
                } else {
                    localStorage.removeItem('nrj-chat-global-signature');
                }
                loadSignature();
                signatureEdit.style.display = 'none';
                signatureBox.style.display = 'flex';
            };

            signatureSaveBtn.addEventListener('click', saveSignature);

            signatureInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    saveSignature();
                }
            });

            // 点击外部失去焦点保存
            document.addEventListener('click', (e) => {
                if (signatureEdit.style.display === 'flex' && !signatureEdit.contains(e.target) && !signatureBox.contains(e.target)) {
                    saveSignature();
                }
            });
        }

        // 初始化加载 Profile (推迟以防阻塞首屏动画)
        setTimeout(() => {
            updateProfileDisplay();
        }, 100);

        // 1. 人设库逻辑
        const listContainer = container.querySelector('#persona-list-container');
        const btnManagePersonas = container.querySelector('#btn-manage-personas');
        const manageFooter = container.querySelector('#persona-manage-footer');
        const btnDeleteSelected = container.querySelector('#btn-delete-selected-personas');
        const btnSelectAll = container.querySelector('#btn-select-all-personas');
        let isManageMode = false;
        let selectedPersonaIds = new Set();

        // 将 showChatAlert 强制暴露到当前实例的作用域内，防止局部函数定义顺序或闭包遮蔽导致未定义错误
        window._currentChatOSAlert = showChatAlert;
        
        const updateManageFooter = () => {
            const personas = loadPersonas();
            if (isManageMode) {
                manageFooter.style.display = 'flex';
                btnManagePersonas.textContent = '取消';
                btnDeleteSelected.textContent = `删除所选 (${selectedPersonaIds.size})`;
                btnDeleteSelected.disabled = selectedPersonaIds.size === 0;

                if (personas.length > 0 && selectedPersonaIds.size === personas.length) {
                    btnSelectAll.textContent = '取消全选';
                } else {
                    btnSelectAll.textContent = '全选';
                }
            } else {
                manageFooter.style.display = 'none';
                btnManagePersonas.textContent = '管理';
            }
        };

        const renderPersonaList = async () => {
            const personas = loadPersonas();
            const activeId = getActivePersonaId();
            listContainer.innerHTML = '';
            
            if (personas.length === 0) {
                listContainer.innerHTML = '<div class="persona-empty-state">暂无人设，去新建一个吧</div>';
                return;
            }

            for (const persona of personas) {
                const item = document.createElement('div');
                item.className = 'persona-list-item';
                
                let avatarUrl = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                try {
                    if (window.ImageStorageManager) {
                        const url = await window.ImageStorageManager.loadFromIndexedDB(`persona-avatar-${persona.id}`);
                        if (url) avatarUrl = url;
                    }
                } catch(e) {}

                let checkboxHtml = '';
                if (isManageMode) {
                    const isChecked = selectedPersonaIds.has(persona.id);
                    checkboxHtml = `
                        <div class="persona-checkbox ${isChecked ? 'checked' : ''}">
                            ${isChecked ? '<i class="ph-bold ph-check"></i>' : ''}
                        </div>
                    `;
                }

                const isActive = persona.id === activeId ? '<span class="persona-tag-active">当前</span>' : '';

                item.innerHTML = `
                    ${checkboxHtml}
                    <img src="${avatarUrl}" class="persona-list-avatar">
                    <div class="persona-list-info">
                        <div class="persona-list-name">${persona.nickname || persona.realname || '未命名'} ${isActive}</div>
                        <div class="persona-list-desc">${persona.bio || '暂无简介'}</div>
                    </div>
                `;

                item.addEventListener('click', () => {
                    if (isManageMode) {
                        if (selectedPersonaIds.has(persona.id)) {
                            selectedPersonaIds.delete(persona.id);
                        } else {
                            selectedPersonaIds.add(persona.id);
                        }
                        renderPersonaList();
                        updateManageFooter();
                    } else {
                        openPersonaView(persona, avatarUrl);
                    }
                });

                listContainer.appendChild(item);
            }
        };

        if (btnManagePersonas) {
            btnManagePersonas.addEventListener('click', () => {
                isManageMode = !isManageMode;
                selectedPersonaIds.clear();
                updateManageFooter();
                renderPersonaList();
            });
        }

        if (btnSelectAll) {
            btnSelectAll.addEventListener('click', () => {
                const personas = loadPersonas();
                if (selectedPersonaIds.size === personas.length) {
                    selectedPersonaIds.clear();
                } else {
                    personas.forEach(p => selectedPersonaIds.add(p.id));
                }
                updateManageFooter();
                renderPersonaList();
            });
        }

        if (btnDeleteSelected) {
            btnDeleteSelected.addEventListener('click', async () => {
                if (selectedPersonaIds.size === 0) return;
                showChatConfirm('删除人设', `确定要删除选中的 ${selectedPersonaIds.size} 个人设吗？`, async () => {
                    let personas = loadPersonas();
                    personas = personas.filter(p => !selectedPersonaIds.has(p.id));
                    savePersonas(personas);
                    
                    // 清理图片并检查是否删除了当前活跃的
                    let activeId = getActivePersonaId();
                    for (let id of selectedPersonaIds) {
                        if (window.ImageStorageManager) {
                            await window.ImageStorageManager.deleteFromIndexedDB(`persona-avatar-${id}`);
                        }
                        if (id === activeId) {
                            setActivePersonaId(null);
                        }
                    }
                    
                    selectedPersonaIds.clear();
                    isManageMode = false;
                    updateManageFooter();
                    renderPersonaList();
                    updateProfileDisplay();
                });
            });
        }

        if (btnPersonaLibrary) {
            btnPersonaLibrary.addEventListener('click', () => {
                popupLibrary.classList.add('active');
                isManageMode = false;
                selectedPersonaIds.clear();
                updateManageFooter();
                renderPersonaList();
            });
        }

        // 2. 新建/编辑逻辑
        let editingPersonaId = null;
        let tempAvatarBase64 = null;
        
        const editTitle = container.querySelector('#persona-edit-title');
        const inputRealname = container.querySelector('#persona-edit-realname');
        const inputNickname = container.querySelector('#persona-edit-nickname');
        const inputBio = container.querySelector('#persona-edit-bio');
        const avatarPreview = container.querySelector('#persona-edit-avatar-preview');
        const btnUploadAvatar = container.querySelector('#btn-upload-persona-avatar');
        const btnSavePersona = container.querySelector('#btn-save-persona');

        const openPersonaEdit = (persona = null, existingAvatarUrl = null) => {
            if (persona) {
                editingPersonaId = persona.id;
                editTitle.textContent = '编辑人设';
                inputRealname.value = persona.realname || '';
                inputNickname.value = persona.nickname || '';
                inputBio.value = persona.bio || '';
                avatarPreview.src = existingAvatarUrl || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
            } else {
                editingPersonaId = null;
                editTitle.textContent = '新建人设';
                inputRealname.value = '';
                inputNickname.value = '';
                inputBio.value = '';
                avatarPreview.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
            }
            tempAvatarBase64 = null;
            
            [popupLibrary, popupView].forEach(p => p.classList.remove('active'));
            popupEdit.classList.add('active');
        };

        if (btnCreatePersona) {
            btnCreatePersona.addEventListener('click', () => {
                openPersonaEdit();
            });
        }

        if (btnUploadAvatar) {
            btnUploadAvatar.addEventListener('click', () => {
                if (typeof showImageModal === 'function') {
                    showImageModal('persona-avatar-temp', (result) => {
                        if (result && result.type === 'reset') {
                            tempAvatarBase64 = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                            avatarPreview.src = tempAvatarBase64;
                        } else if (result && result.url) {
                            tempAvatarBase64 = result.url;
                            avatarPreview.src = tempAvatarBase64;
                        }
                    });
                }
            });
        }

        if (btnSavePersona) {
            btnSavePersona.addEventListener('click', async () => {
                const realname = inputRealname.value.trim();
                const nickname = inputNickname.value.trim();
                const bio = inputBio.value.trim();

                if (!nickname && !realname) {
                    alert('请至少填写真名或昵称！');
                    return;
                }

                let personas = loadPersonas();
                let personaId = editingPersonaId;

                if (personaId) {
                    // Update
                    const index = personas.findIndex(p => p.id === personaId);
                    if (index !== -1) {
                        personas[index].realname = realname;
                        personas[index].nickname = nickname;
                        personas[index].bio = bio;
                    }
                } else {
                    // Create
                    personaId = 'persona_' + Date.now();
                    personas.unshift({
                        id: personaId,
                        realname,
                        nickname,
                        bio
                    });
                }

                savePersonas(personas);

                if (tempAvatarBase64 && window.ImageStorageManager) {
                    await window.ImageStorageManager.saveToIndexedDB(`persona-avatar-${personaId}`, tempAvatarBase64);
                }

                // 如果是新建，或者是唯一的一个人设，自动设为当前活跃
                if (!getActivePersonaId() || personas.length === 1) {
                    setActivePersonaId(personaId);
                }

                updateProfileDisplay();
                closePopups();
            });
        }

        // 3. 查看详情逻辑
        const viewAvatar = container.querySelector('#persona-view-avatar');
        const viewNickname = container.querySelector('#persona-view-nickname');
        const viewRealname = container.querySelector('#persona-view-realname');
        const viewBio = container.querySelector('#persona-view-bio');
        const btnEditCurrent = container.querySelector('#btn-edit-current-persona');
        const btnSetActive = container.querySelector('#btn-set-active-persona');
        
        let viewingPersona = null;
        let viewingAvatarUrl = null;

        const openPersonaView = (persona, avatarUrl) => {
            viewingPersona = persona;
            viewingAvatarUrl = avatarUrl;
            
            viewAvatar.src = avatarUrl;
            viewNickname.textContent = persona.nickname || persona.realname || '未命名';
            viewRealname.textContent = persona.realname ? `真名: ${persona.realname}` : '';
            viewBio.textContent = persona.bio || '该用户很懒，还没有填写简介。';
            
            const activeId = getActivePersonaId();
            if (activeId === persona.id) {
                btnSetActive.textContent = '当前正在使用';
                btnSetActive.disabled = true;
                btnSetActive.style.opacity = '0.5';
            } else {
                btnSetActive.textContent = '设为当前人设';
                btnSetActive.disabled = false;
                btnSetActive.style.opacity = '1';
            }

            popupLibrary.classList.remove('active');
            popupView.classList.add('active');
        };

        if (btnEditCurrent) {
            btnEditCurrent.addEventListener('click', () => {
                if (viewingPersona) {
                    openPersonaEdit(viewingPersona, viewingAvatarUrl);
                }
            });
        }

        if (btnSetActive) {
            btnSetActive.addEventListener('click', () => {
                if (viewingPersona) {
                    setActivePersonaId(viewingPersona.id);
                    updateProfileDisplay();
                    closePopups();
                }
            });
        }

        // --- 时区选择弹窗逻辑 ---
        const popupTimezone = container.querySelector('#chat-timezone-popup');
        const btnCloseTimezone = container.querySelector('.btn-close-timezone');
        const timezoneSearch = container.querySelector('#chat-timezone-search');
        const timezoneListContainer = container.querySelector('#chat-timezone-list-container');
        let timezoneSelectCallback = null;
        let timezoneClockInterval = null;

        const formatTimeForZone = (code) => {
            if (!code) return new Date().toLocaleString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit' });
            try {
                return new Date().toLocaleString('zh-CN', { timeZone: code, hour12: false, hour: '2-digit', minute: '2-digit' });
            } catch(e) {
                return '--:--';
            }
        };

        const renderTimezoneList = (filterText = '') => {
            if (!timezoneListContainer) return;
            timezoneListContainer.innerHTML = '';
            
            const keyword = filterText.toLowerCase().trim();
            let filteredZones = ALL_TIMEZONES;
            if (keyword) {
                filteredZones = ALL_TIMEZONES.filter(z => 
                    z.name.toLowerCase().includes(keyword) || 
                    z.code.toLowerCase().includes(keyword) || 
                    z.offset.toLowerCase().includes(keyword)
                );
            }

            let currentGroup = '';
            filteredZones.forEach(z => {
                if (z.group !== currentGroup) {
                    currentGroup = z.group;
                    const groupTitle = document.createElement('div');
                    groupTitle.style.cssText = `font-size: 12px; font-weight: 600; color: #9ca3af; padding: 8px 12px 4px; margin-top: 4px;`;
                    groupTitle.textContent = currentGroup;
                    timezoneListContainer.appendChild(groupTitle);
                }

                const item = document.createElement('div');
                item.style.cssText = `display: flex; align-items: center; justify-content: space-between; padding: 12px; border-radius: 8px; cursor: pointer; transition: background 0.2s;`;
                item.className = 'tz-list-item';
                
                const timeStr = formatTimeForZone(z.code);

                item.innerHTML = `
                    <div style="display: flex; flex-direction: column; gap: 4px;">
                        <span style="font-size: 14px; font-weight: 500; color: #18181b;">${z.name}</span>
                        ${z.code ? `<span style="font-size: 11px; color: #9ca3af;">${z.code} &middot; ${z.offset}</span>` : ''}
                    </div>
                    <div class="tz-time-preview" data-tz="${z.code}" style="font-size: 15px; font-weight: 600; color: var(--accent-color, #18181b); font-variant-numeric: tabular-nums;">
                        ${timeStr}
                    </div>
                `;

                item.addEventListener('mouseenter', () => { item.style.backgroundColor = 'rgba(0,0,0,0.04)'; });
                item.addEventListener('mouseleave', () => { item.style.backgroundColor = 'transparent'; });
                
                item.addEventListener('click', () => {
                    if (timezoneSelectCallback) {
                        timezoneSelectCallback(z);
                    }
                    if (popupTimezone) popupTimezone.classList.remove('active');
                });

                timezoneListContainer.appendChild(item);
            });
        };

        const updateTimezoneClocks = () => {
            if (!popupTimezone || !popupTimezone.classList.contains('active')) return;
            const clocks = timezoneListContainer.querySelectorAll('.tz-time-preview');
            clocks.forEach(clock => {
                const tz = clock.getAttribute('data-tz');
                clock.textContent = formatTimeForZone(tz);
            });
        };

        const showTimezonePopup = (onSelect) => {
            timezoneSelectCallback = onSelect;
            if (timezoneSearch) timezoneSearch.value = '';
            renderTimezoneList();
            if (popupTimezone) {
                popupTimezone.classList.add('active');
                if (timezoneClockInterval) clearInterval(timezoneClockInterval);
                timezoneClockInterval = setInterval(updateTimezoneClocks, 1000);
            }
        };

        if (btnCloseTimezone) {
            btnCloseTimezone.addEventListener('click', () => {
                if (popupTimezone) popupTimezone.classList.remove('active');
            });
        }

        if (timezoneSearch) {
            timezoneSearch.addEventListener('input', (e) => {
                renderTimezoneList(e.target.value);
            });
        }

        const getTimezoneNameByCode = (code) => {
            if (!code) return '跟随本地时间 (默认)';
            const found = ALL_TIMEZONES.find(z => z.code === code);
            return found ? found.name : code;
        };

        // --- 角色管理逻辑 ---
        const btnMenuCreateCharacter = container.querySelector('#btn-menu-create-character');
        
        let editingCharacterId = null;
        let tempCharacterAvatarBase64 = null;
        
        const charEditTitle = container.querySelector('#character-edit-title');
        const inputCharRealname = container.querySelector('#character-edit-realname');
        const inputCharNickname = container.querySelector('#character-edit-nickname');
        
        const inputCharTimezoneVal = container.querySelector('#character-edit-timezone');
        const triggerCharTimezone = container.querySelector('#character-edit-timezone-trigger');
        const textCharTimezone = container.querySelector('#character-edit-timezone-text');

        const inputCharPersona = container.querySelector('#character-edit-persona');
        const charAvatarPreview = container.querySelector('#character-edit-avatar-preview');
        const btnUploadCharAvatar = container.querySelector('#btn-upload-character-avatar');
        const btnSaveCharacter = container.querySelector('#btn-save-character');
        const btnTimezoneHelp = container.querySelector('#btn-timezone-help');
        const toggleAiTimezone = container.querySelector('#ai-timezone-toggle');
        const importGreetingContainer = container.querySelector('#import-greeting-container');
        const toggleImportGreeting = container.querySelector('#import-greeting-toggle');

        // AI 时区提取逻辑
        const extractTimezoneByAI = async (personaText) => {
            if (!personaText) return;
            try {
                btnSaveCharacter.textContent = '判断时区中...';
                btnSaveCharacter.disabled = true;
                btnSaveCharacter.style.opacity = '0.5';

                let tzResult = await window.ChatAPI.extractTimezone(personaText);

                // 去除可能的多余字符（如引号等）
                let plainResult = tzResult.replace(/['"]/g, '');

                // 去除深度思考模型常见的 <think> 标签块，避免正则匹配到错误的内容
                plainResult = plainResult.replace(/<think>[\s\S]*?<\/think>/g, '');

                // 尝试用正则匹配 IANA 时区格式 (如 Asia/Shanghai 或 America/Argentina/Buenos_Aires)
                const tzMatch = plainResult.match(/[A-Z][a-z_]+\/(?:[A-Z][a-zA-Z_]+\/)*[A-Z][a-zA-Z_]+/);

                if (tzMatch) {
                    inputCharTimezoneVal.value = tzMatch[0];
                    textCharTimezone.textContent = getTimezoneNameByCode(tzMatch[0]);
                    textCharTimezone.style.color = 'var(--text-color)';
                } else if (plainResult.toUpperCase().includes('UNKNOWN')) {
                    if (window._currentChatOSAlert) window._currentChatOSAlert('识别失败', 'AI 无法根据当前人设判断出具体时区，请补充更多地域信息或手动选择。', tzResult);
                    if (toggleAiTimezone) toggleAiTimezone.checked = false;
                } else {
                    if (window._currentChatOSAlert) window._currentChatOSAlert('格式错误', 'AI 返回了无法识别的内容，请检查人设描述。\n下方是 AI 的原始回复：', tzResult);
                    if (toggleAiTimezone) toggleAiTimezone.checked = false;
                }
            } catch (error) {
                console.error('AI提取时区失败:', error);
                if (error.message === 'NO_API') {
                    if (window._currentChatOSAlert) window._currentChatOSAlert('未配置 API', '请先在设置中配置辅助判断API或主API！');
                } else {
                    if (window._currentChatOSAlert) window._currentChatOSAlert('请求失败', `无法连接到 AI 服务，请检查 API 配置和网络。\n\n详细错误:\n${error.message}`);
                }
                if (toggleAiTimezone) toggleAiTimezone.checked = false;
            } finally {
                btnSaveCharacter.textContent = '保存';
                btnSaveCharacter.disabled = false;
                btnSaveCharacter.style.opacity = '1';
            }
        };

        if (toggleAiTimezone) {
            // 初始化开关状态
            toggleAiTimezone.checked = false;

            toggleAiTimezone.addEventListener('change', (e) => {
                const checked = e.target.checked;
                if (checked) {
                    const text = inputCharPersona.value.trim();
                    if (!text) {
                        if (window._currentChatOSAlert) window._currentChatOSAlert('提示', '请先在上方填写角色人设，AI才能进行判断！');
                        e.target.checked = false;
                    } else {
                        extractTimezoneByAI(text);
                    }
                }
            });
        }

        // 监听人设输入框失焦事件触发AI提取
        if (inputCharPersona) {
            inputCharPersona.addEventListener('blur', () => {
                if (toggleAiTimezone && toggleAiTimezone.checked) {
                    const text = inputCharPersona.value.trim();
                    if (text) {
                        extractTimezoneByAI(text);
                    } else {
                        // 内容为空，关闭开关
                        toggleAiTimezone.checked = false;
                    }
                }
            });
        }

        if (btnTimezoneHelp) {
            btnTimezoneHelp.addEventListener('click', (e) => {
                e.preventDefault();
                if (popupTimezoneHelp) {
                    popupTimezoneHelp.classList.add('active');
                }
            });
        }

        const loadCharacters = window.ChatStorage.loadCharacters;
        const saveCharacters = window.ChatStorage.saveCharacters;

        const openCharacterEdit = (char = null, existingAvatarUrl = null) => {
            if (char) {
                editingCharacterId = char.id;
                charEditTitle.textContent = '编辑角色';
                inputCharRealname.value = char.realname || '';
                inputCharNickname.value = char.nickname || '';
                
                inputCharTimezoneVal.value = char.timezone || '';
                if (char.timezone) {
                    textCharTimezone.textContent = getTimezoneNameByCode(char.timezone);
                    textCharTimezone.style.color = 'var(--text-color)';
                } else {
                    textCharTimezone.textContent = '跟随本地时间 (默认)';
                    textCharTimezone.style.color = 'var(--text-secondary)';
                }

                inputCharPersona.value = char.persona || '';
                charAvatarPreview.src = existingAvatarUrl || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
            } else {
                editingCharacterId = null;
                charEditTitle.textContent = '创建角色';
                inputCharRealname.value = '';
                inputCharNickname.value = '';
                
                inputCharTimezoneVal.value = '';
                textCharTimezone.textContent = '跟随本地时间 (默认)';
                textCharTimezone.style.color = 'var(--text-secondary)';

                inputCharPersona.value = '';
                charAvatarPreview.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
            }
            
            if (triggerCharTimezone) {
                triggerCharTimezone.onclick = () => {
                    showTimezonePopup((selectedZone) => {
                        inputCharTimezoneVal.value = selectedZone.code;
                        if (selectedZone.code) {
                            textCharTimezone.textContent = selectedZone.name;
                            textCharTimezone.style.color = 'var(--text-color)';
                        } else {
                            textCharTimezone.textContent = '跟随本地时间 (默认)';
                            textCharTimezone.style.color = 'var(--text-secondary)';
                        }
                    });
                };
            }
            tempCharacterAvatarBase64 = null;
            if (toggleAiTimezone) {
                toggleAiTimezone.checked = false;
            }
            if (importGreetingContainer) {
                importGreetingContainer.style.display = 'none';
            }
            if (toggleImportGreeting) {
                toggleImportGreeting.checked = true;
            }
            
            popupCreate.classList.remove('active'); // 关闭创建菜单
            popupCharacterEdit.classList.add('active');
        };

        if (btnMenuCreateCharacter) {
            btnMenuCreateCharacter.addEventListener('click', () => {
                popupCreate.classList.remove('active');
                if (popupCharacterType) {
                    popupCharacterType.classList.add('active');
                }
            });
        }

        const btnCreateCharManual = container.querySelector('#btn-create-char-manual');
        const btnCreateCharDocument = container.querySelector('#btn-create-char-document');
        const inputCharDocumentUpload = container.querySelector('#char-document-upload');
        
        const btnImportCharacter = container.querySelector('#btn-import-character');
        const inputCharImportUpload = container.querySelector('#char-import-upload');

        if (btnCreateCharManual) {
            btnCreateCharManual.addEventListener('click', () => {
                if (popupCharacterType) popupCharacterType.classList.remove('active');
                openCharacterEdit();
            });
        }

        if (btnCreateCharDocument && inputCharDocumentUpload) {
            btnCreateCharDocument.addEventListener('click', () => {
                inputCharDocumentUpload.click();
            });

            inputCharDocumentUpload.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                if (popupCharacterType) popupCharacterType.classList.remove('active');
                
                if (window._currentChatOSAlert) {
                    window._currentChatOSAlert('正在解析', '正在读取文档内容，请稍候...');
                }

                try {
                    let textContent = '';
                    const extension = file.name.split('.').pop().toLowerCase();

                    if (extension === 'txt') {
                        textContent = await new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = (ev) => resolve(ev.target.result);
                            reader.onerror = () => reject(new Error('TXT文件读取失败'));
                            reader.readAsText(file, 'utf-8'); 
                        });
                    } else if (extension === 'doc' || extension === 'docx') {
                        if (typeof mammoth === 'undefined') {
                            throw new Error('未加载文档解析库(mammoth.js)，请检查网络');
                        }
                        const arrayBuffer = await new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = (ev) => resolve(ev.target.result);
                            reader.onerror = () => reject(new Error('文档读取失败'));
                            reader.readAsArrayBuffer(file);
                        });
                        const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
                        textContent = result.value;
                    } else {
                        throw new Error('不支持的文件格式，仅支持 .txt, .doc, .docx');
                    }

                    if (chatAlertPopup) chatAlertPopup.classList.remove('active');

                    openCharacterEdit();
                    if (inputCharPersona) {
                        inputCharPersona.value = textContent;
                        if (toggleAiTimezone && toggleAiTimezone.checked) {
                            extractTimezoneByAI(textContent);
                        }
                    }
                    
                    if (inputCharNickname) {
                        inputCharNickname.value = file.name.substring(0, file.name.lastIndexOf('.'));
                    }
                } catch (error) {
                    console.error('文档解析失败', error);
                    if (window._currentChatOSAlert) {
                        window._currentChatOSAlert('解析失败', error.message || '读取文档时发生错误');
                    }
                } finally {
                    e.target.value = '';
                }
            });
        }

        if (btnImportCharacter && inputCharImportUpload) {
            btnImportCharacter.addEventListener('click', () => {
                popupCreate.classList.remove('active');
                inputCharImportUpload.click();
            });

            inputCharImportUpload.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                if (window._currentChatOSAlert) {
                    window._currentChatOSAlert('正在解析', '正在读取角色卡，请稍候...');
                }

                try {
                    let parsedData = null;
                    const extension = file.name.split('.').pop().toLowerCase();

                    if (extension === 'json') {
                        const textContent = await new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = (ev) => resolve(ev.target.result);
                            reader.onerror = () => reject(new Error('JSON文件读取失败'));
                            reader.readAsText(file, 'utf-8');
                        });
                        parsedData = JSON.parse(textContent);
                    } else if (extension === 'png') {
                        parsedData = await new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = function (ev) {
                                const arrayBuffer = ev.target.result;
                                const dataView = new DataView(arrayBuffer);
                                if (dataView.getUint32(0) !== 0x89504E47) {
                                    return reject(new Error('不是有效的PNG文件'));
                                }

                                let offset = 8;
                                while (offset < dataView.byteLength) {
                                    const length = dataView.getUint32(offset);
                                    const type = String.fromCharCode(
                                        dataView.getUint8(offset + 4),
                                        dataView.getUint8(offset + 5),
                                        dataView.getUint8(offset + 6),
                                        dataView.getUint8(offset + 7)
                                    );

                                    if (type === 'tEXt' || type === 'iTXt') {
                                        const textBytes = new Uint8Array(arrayBuffer, offset + 8, length);
                                        const decoder = new TextDecoder('utf-8');
                                        const textStr = decoder.decode(textBytes);
                                        const separatorIndex = textStr.indexOf('\0');
                                        if (separatorIndex !== -1) {
                                            const keyword = textStr.substring(0, separatorIndex);
                                            const text = textStr.substring(separatorIndex + 1);
                                            if (keyword === 'chara') {
                                                try {
                                                    const base64Str = text;
                                                    let decoded = '';
                                                    try {
                                                        decoded = decodeURIComponent(escape(window.atob(base64Str)));
                                                    } catch (e1) {
                                                        try {
                                                            const bytes = Uint8Array.from(window.atob(base64Str), c => c.charCodeAt(0));
                                                            decoded = new TextDecoder().decode(bytes);
                                                        } catch (e2) {
                                                            decoded = window.atob(base64Str);
                                                        }
                                                    }
                                                    return resolve(JSON.parse(decoded));
                                                } catch(err) {
                                                    return reject(new Error('无法解析PNG内的角色卡数据'));
                                                }
                                            }
                                        }
                                    }
                                    offset += 12 + length;
                                }
                                reject(new Error('未在PNG中找到角色数据(chara)'));
                            };
                            reader.onerror = () => reject(new Error('读取PNG文件失败'));
                            reader.readAsArrayBuffer(file);
                        });
                    } else {
                        throw new Error('不支持的文件格式，仅支持 .png, .json');
                    }

                    if (!parsedData) throw new Error('解析内容为空');

                    let charData = parsedData;
                    if (parsedData.data) {
                        charData = parsedData.data;
                    }

                    let name = charData.name || parsedData.name || '';
                    let description = charData.description || parsedData.description || '';
                    let personality = charData.personality || parsedData.personality || '';
                    let scenario = charData.scenario || parsedData.scenario || '';
                    let firstMes = charData.first_mes || parsedData.first_mes || '';
                    
                    let alternateGreetings = [];
                    if (charData.alternate_greetings) alternateGreetings = charData.alternate_greetings;
                    else if (parsedData.alternate_greetings) alternateGreetings = parsedData.alternate_greetings;
                    else if (charData.extensions && charData.extensions.alternate_greetings) alternateGreetings = charData.extensions.alternate_greetings;
                    else if (parsedData.extensions && parsedData.extensions.alternate_greetings) alternateGreetings = parsedData.extensions.alternate_greetings;

                    let greetings = [];
                    if (firstMes) greetings.push(firstMes);
                    if (Array.isArray(alternateGreetings)) {
                        greetings = greetings.concat(alternateGreetings.filter(g => g && typeof g === 'string'));
                    }

                    let fullPersona = description;
                    if (personality) fullPersona += '\n\n' + personality;
                    if (scenario) fullPersona += '\n\n' + scenario;

                    // 提取世界书 (Lorebook / Worldbook) 数据
                    let extractedWorldbook = null;
                    if (charData.character_book && charData.character_book.entries && Array.isArray(charData.character_book.entries) && charData.character_book.entries.length > 0) {
                        const entries = charData.character_book.entries.map(entry => {
                            let keyword = '未命名条目';
                            if (Array.isArray(entry.keys)) {
                                keyword = entry.keys.join(', ');
                            } else if (typeof entry.keys === 'string') {
                                keyword = entry.keys;
                            }
                            if (!keyword && entry.comment) {
                                keyword = entry.comment;
                            }
                            let content = entry.content || '';
                            return {
                                id: 'e_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                                keyword: keyword,
                                content: content,
                                enabled: entry.enabled !== false
                            };
                        });
                        extractedWorldbook = {
                            id: 'wb_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                            name: charData.character_book.name || (name ? `${name} 的世界书` : '导入的世界书'),
                            entries: entries
                        };
                    }

                    if (chatAlertPopup) chatAlertPopup.classList.remove('active');

                    openCharacterEdit();

                    // 如果是PNG，自动提取为头像
                    if (extension === 'png') {
                        tempCharacterAvatarBase64 = await new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onload = ev => resolve(ev.target.result);
                            reader.readAsDataURL(file);
                        });
                        if (charAvatarPreview) {
                            charAvatarPreview.src = tempCharacterAvatarBase64;
                        }
                    }

                    if (inputCharNickname) inputCharNickname.value = name;
                    if (inputCharRealname) inputCharRealname.value = name;
                    if (inputCharPersona) {
                        inputCharPersona.value = fullPersona.trim();
                        if (toggleAiTimezone && toggleAiTimezone.checked) {
                            extractTimezoneByAI(fullPersona);
                        }
                    }
                    
                    // 把 greetings 临时塞到一个隐藏属性里，我们可以在 btnSaveCharacter 里抓取
                    if (greetings.length > 0) {
                        if (inputCharPersona) {
                            inputCharPersona.dataset.greetings = JSON.stringify(greetings);
                        }
                        if (importGreetingContainer) {
                            importGreetingContainer.style.display = 'flex';
                        }
                        if (toggleImportGreeting) {
                            toggleImportGreeting.checked = true;
                        }
                    } else {
                        if (inputCharPersona) {
                            delete inputCharPersona.dataset.greetings;
                        }
                    }
                    
                    // 同样把 worldbook 也塞到隐藏属性中
                    if (extractedWorldbook) {
                        if (inputCharPersona) {
                            inputCharPersona.dataset.extractedWorldbook = JSON.stringify(extractedWorldbook);
                        }
                    } else {
                        if (inputCharPersona) {
                            delete inputCharPersona.dataset.extractedWorldbook;
                        }
                    }

                } catch (error) {
                    console.error('导入角色卡失败', error);
                    if (window._currentChatOSAlert) {
                        window._currentChatOSAlert('导入失败', error.message || '解析角色卡时发生错误');
                    }
                } finally {
                    e.target.value = '';
                }
            });
        }

        if (btnUploadCharAvatar) {
            btnUploadCharAvatar.addEventListener('click', () => {
                if (typeof showImageModal === 'function') {
                    showImageModal('character-avatar-temp', (result) => {
                        if (result && result.type === 'reset') {
                            tempCharacterAvatarBase64 = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                            charAvatarPreview.src = tempCharacterAvatarBase64;
                        } else if (result && result.url) {
                            tempCharacterAvatarBase64 = result.url;
                            charAvatarPreview.src = tempCharacterAvatarBase64;
                        }
                    });
                }
            });
        }

        if (btnSaveCharacter) {
            btnSaveCharacter.addEventListener('click', async () => {
                const realname = inputCharRealname.value.trim();
                const nickname = inputCharNickname.value.trim();
                const timezone = inputCharTimezoneVal.value;
                const persona = inputCharPersona.value.trim();

                if (!nickname && !realname) {
                    alert('请至少填写角色真名或备注！');
                    return;
                }
                
                let greetings = [];
                if (inputCharPersona && inputCharPersona.dataset.greetings) {
                    if (toggleImportGreeting && toggleImportGreeting.checked) {
                        try {
                            greetings = JSON.parse(inputCharPersona.dataset.greetings);
                        } catch(e) {}
                    }
                    delete inputCharPersona.dataset.greetings;
                }

                let chars = loadCharacters();
                let charId = editingCharacterId;

                if (charId) {
                    const index = chars.findIndex(c => c.id === charId);
                    if (index !== -1) {
                        chars[index].realname = realname;
                        chars[index].nickname = nickname;
                        chars[index].timezone = timezone;
                        chars[index].persona = persona;
                    }
                } else {
                    charId = 'char_' + Date.now();
                    const newChar = {
                        id: charId,
                        realname,
                        nickname,
                        timezone,
                        persona,
                        createdAt: Date.now()
                    };
                    if (greetings.length > 0) {
                        newChar.greetings = greetings;
                    }
                    chars.unshift(newChar);

                    // 检查是否有导入时解析出的世界书
                    if (inputCharPersona && inputCharPersona.dataset.extractedWorldbook) {
                        try {
                            const newWorldbook = JSON.parse(inputCharPersona.dataset.extractedWorldbook);
                            let worldbooks = JSON.parse(localStorage.getItem('nrj-worldbooks') || '[]');
                            worldbooks.unshift(newWorldbook);
                            localStorage.setItem('nrj-worldbooks', JSON.stringify(worldbooks));
                            
                            // 自动绑定到角色配置
                            let charConfig = JSON.parse(localStorage.getItem(`nrj-chat-config-${charId}`) || '{}');
                            charConfig.worldbookId = newWorldbook.id;
                            localStorage.setItem(`nrj-chat-config-${charId}`, JSON.stringify(charConfig));
                        } catch(e) {
                            console.error('保存导入的世界书失败', e);
                        }
                        delete inputCharPersona.dataset.extractedWorldbook;
                    }
                }

                saveCharacters(chars);

                if (tempCharacterAvatarBase64 && window.ImageStorageManager) {
                    await window.ImageStorageManager.saveToIndexedDB(`character-avatar-${charId}`, tempCharacterAvatarBase64);
                }

                closePopups();
                // 重新渲染聊天列表以包含新角色
                await renderChatList();
            });
        }

        // --- 顶部 Header 控制逻辑 ---
        const leftBtn = container.querySelector('#chat-header-left-btn');
        const rightBtn = container.querySelector('#chat-header-right-btn');
        const headerTitle = container.querySelector('#chat-header-title');
        const headerSubtitle = container.querySelector('#chat-header-subtitle');

        if (rightBtn && popupCreate) {
            rightBtn.addEventListener('click', () => {
                const activeView = container.querySelector('.chat-view.active');
                // 仅在消息列表页点击编辑按钮时弹出创建菜单
                if (activeView && activeView.id === 'chat-view-messages') {
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
                const activeView = container.querySelector('.chat-view.active');
                if (activeView && activeView.id === 'chat-view-messages') {
                    if (typeof closeCallback === 'function') {
                        closeCallback();
                    }
                }
            });
        }

        // --- 底部导航栏逻辑 ---
        const navPills = container.querySelectorAll('.chat-nav-pill');
        const views = container.querySelectorAll('.chat-view');
        
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

        // --- 渲染聊天列表 ---
        const chatListContainer = container.querySelector('#chat-list-container');
        
        const updateTotalUnreadBadge = () => {
            let total = 0;
            initialMessages.forEach(m => {
                if (m.isUnread && m.unreadCount > 0) {
                    total += m.unreadCount;
                }
            });
            const badge = container.querySelector('.chat-nav-pill[data-target="chat-view-messages"] .chat-nav-badge');
            if (badge) {
                if (total > 0) {
                    badge.textContent = total;
                    badge.style.display = '';
                } else {
                    badge.style.display = 'none';
                }
            }
        };

        const getLocalTimeByTimezone = (timezone) => {
            try {
                return new Date().toLocaleTimeString('zh-CN', { timeZone: timezone, hour: '2-digit', minute: '2-digit' });
            } catch (e) {
                return '';
            }
        };
        
        const searchInput = container.querySelector('.chat-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                renderChatList();
            });
        }

        const renderChatList = async () => {
            if (!chatListContainer) return;
            // 避免重复渲染导致闪烁
            if (chatListContainer.dataset.rendering === 'true') return;
            chatListContainer.dataset.rendering = 'true';
            
            chatListContainer.innerHTML = '';
            
            // 合并本地保存的角色
            const savedChars = loadCharacters();
            let displayList = [...initialMessages];
            
            for (const char of savedChars) {
                let avatarUrl = null;
                try {
                    if (window.ImageStorageManager) {
                        avatarUrl = await window.ImageStorageManager.loadFromIndexedDB(`character-avatar-${char.id}`);
                    }
                } catch(e) {}
                
                const charName = char.nickname || char.realname || '未命名角色';
                // 如果为空，getLocalTimeByTimezone 传入空字符串会报错抛出异常，返回空，或者我们可以利用当前 Intl 默认时区
                let finalTimezone = char.timezone;
                if (!finalTimezone) {
                    finalTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                }
                let localTime = getLocalTimeByTimezone(finalTimezone);
                if (!localTime) { // 如果传入的自定义字符串无法解析导致 catch 返回了空，fallback
                     localTime = getLocalTimeByTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
                }
                
                const history = getChatHistory(char.id);
                let lastMessageContent = char.message || '暂无消息';
                if (history && history.length > 0) {
                    let foundRealMsg = false;
                    for (let i = history.length - 1; i >= 0; i--) {
                        if (history[i].role !== 'system') {
                            lastMessageContent = history[i].content;
                            foundRealMsg = true;
                            break;
                        }
                    }
                    if (!foundRealMsg) {
                        lastMessageContent = char.message || '暂无消息';
                    }
                }
                
                // 引用预览处理
                const quoteRegex = /\n?\[\[QUOTE:([^|]+)\|([^\]]+)\]\]/g;
                if (quoteRegex.test(lastMessageContent)) {
                    lastMessageContent = lastMessageContent.replace(quoteRegex, '').trim();
                }
                
                // 处理列表预览中转账消息的显示
                const transferRegex = /\[\[TRANSFER:([^|]+)\|(.*?)\]\]/g;
                if (transferRegex.test(lastMessageContent)) {
                    lastMessageContent = '[转账]';
                }
                
                // 处理列表预览中语音消息的显示
                const voiceRegex = /\[\[VOICE:(.*?)\]\]/g;
                if (voiceRegex.test(lastMessageContent)) {
                    lastMessageContent = '[语音]';
                }
                
                // 处理列表预览中图片消息的显示
                const imageRegex = /\[\[IMAGE:(.*?)\]\]/g;
                if (imageRegex.test(lastMessageContent)) {
                    lastMessageContent = '[图片]';
                }
                
                // 处理列表预览中位置消息的显示
                const locationRegex = /\[\[LOCATION:(.*?)\]\]/g;
                if (locationRegex.test(lastMessageContent)) {
                    lastMessageContent = '[位置]';
                }
                
                displayList.unshift({
                    id: char.id,
                    name: charName,
                    initials: charName.charAt(0),
                    message: lastMessageContent,
                    time: char.time || localTime,
                    isUnread: false,
                    unreadCount: 0,
                    isOnline: true,
                    color: '#f0f0f0',
                    textColor: '#333',
                    avatarUrl: avatarUrl,
                    isCharacter: true,
                    rawCharData: char
                });
            }

            if (searchInput) {
                const keyword = searchInput.value.trim().toLowerCase();
                if (keyword) {
                    displayList = displayList.filter(msg => 
                        (msg.name && msg.name.toLowerCase().includes(keyword)) || 
                        (msg.message && msg.message.toLowerCase().includes(keyword))
                    );
                }
            }

            displayList.forEach(msg => {
                const wrapper = document.createElement('div');
                wrapper.className = 'chat-list-item-wrapper';
                
                // Actions background
                const actions = document.createElement('div');
                actions.className = 'chat-list-actions';
                actions.innerHTML = `
                    <button class="chat-action-btn pin" data-id="${msg.id}">置顶</button>
                    <button class="chat-action-btn delete" data-id="${msg.id}">删除</button>
                `;
                
                // Foreground item
                const item = document.createElement('div');
                item.className = 'chat-list-item';
                
                const onlineHtml = msg.isOnline ? '<div class="chat-item-online"></div>' : '';
                const unreadTimeClass = msg.isUnread ? 'unread' : 'read';
                const unreadMsgClass = msg.isUnread ? 'unread' : 'read';
                const badgeHtml = (msg.isUnread && msg.unreadCount > 0) ? `<div class="chat-item-badge">${msg.unreadCount}</div>` : '';

                let avatarInnerHtml = `${msg.initials}${onlineHtml}`;
                if (msg.avatarUrl) {
                    avatarInnerHtml = `<img src="${msg.avatarUrl}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">${onlineHtml}`;
                }

                item.innerHTML = `
                    <div class="chat-item-avatar" style="background-color: ${msg.color}; color: ${msg.textColor};">
                        ${avatarInnerHtml}
                    </div>
                    <div class="chat-item-content">
                        <div class="chat-item-header">
                            <div class="chat-item-name">${msg.name}</div>
                            <div class="chat-item-time ${unreadTimeClass}">${msg.time}</div>
                        </div>
                        <div class="chat-item-footer">
                            <div class="chat-item-msg ${unreadMsgClass}">${msg.message}</div>
                            ${badgeHtml}
                        </div>
                    </div>
                `;
                
                wrapper.appendChild(actions);
                wrapper.appendChild(item);
                chatListContainer.appendChild(wrapper);
                
                // 绑定点击事件进入对话
                item.addEventListener('click', () => {
                    if (msg.isUnread) {
                        msg.isUnread = false;
                        msg.unreadCount = 0;
                        
                        const timeEl = item.querySelector('.chat-item-time');
                        const msgEl = item.querySelector('.chat-item-msg');
                        const badgeEl = item.querySelector('.chat-item-badge');
                        
                        if (timeEl) {
                            timeEl.classList.remove('unread');
                            timeEl.classList.add('read');
                        }
                        if (msgEl) {
                            msgEl.classList.remove('unread');
                            msgEl.classList.add('read');
                        }
                        if (badgeEl) {
                            badgeEl.remove();
                        }
                        
                        updateTotalUnreadBadge();
                    }
                    openConversation(msg);
                });
                
                // 绑定移动端滑动逻辑 (Touch events)
                let startX = 0;
                let currentX = 0;
                let isSwiping = false;
                
                item.addEventListener('touchstart', (e) => {
                    startX = e.touches[0].clientX;
                    isSwiping = true;
                    item.style.transition = 'none';
                }, { passive: true });
                
                item.addEventListener('touchmove', (e) => {
                    if (!isSwiping) return;
                    currentX = e.touches[0].clientX;
                    const diffX = currentX - startX;
                    if (diffX < 0 && diffX > -180) {
                        item.style.transform = `translateX(${diffX}px)`;
                    }
                }, { passive: true });
                
                item.addEventListener('touchend', () => {
                    if (!isSwiping) return;
                    isSwiping = false;
                    item.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                    const diffX = currentX - startX;
                    if (diffX < -50) {
                        item.style.transform = 'translateX(-160px)'; // 保持打开状态显示按钮
                    } else {
                        item.style.transform = 'translateX(0)';
                    }
                });

                // 绑定PC端右键点击逻辑 (Context Menu)
                item.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    // 如果已经划开，右键则关闭；如果没划开，右键则划开
                    if (item.style.transform === 'translateX(-160px)') {
                        item.style.transform = 'translateX(0)';
                    } else {
                        // 先把其他打开的项收起
                        const allItems = chatListContainer.querySelectorAll('.chat-list-item');
                        allItems.forEach(el => {
                            if (el !== item) el.style.transform = 'translateX(0)';
                        });
                        item.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                        item.style.transform = 'translateX(-160px)';
                    }
                });

                // 点击其他地方收起滑动菜单
                document.addEventListener('click', (e) => {
                    if (!item.contains(e.target) && item.style.transform === 'translateX(-160px)') {
                        item.style.transform = 'translateX(0)';
                    }
                });
            });
            
            // 绑定置顶和删除事件
            chatListContainer.querySelectorAll('.chat-action-btn.delete').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const idAttr = btn.getAttribute('data-id');
                    showChatConfirm('删除记录', '确定要删除此聊天记录吗？', async () => {
                        if (String(idAttr).startsWith('char_')) {
                            let chars = loadCharacters();
                            chars = chars.filter(c => c.id !== idAttr);
                            saveCharacters(chars);
                            if (window.ImageStorageManager) {
                                await window.ImageStorageManager.deleteFromIndexedDB(`character-avatar-${idAttr}`);
                            }
                        } else {
                            const id = parseInt(idAttr);
                            initialMessages = initialMessages.filter(m => m.id !== id);
                        }
                        renderChatList();
                    });
                });
            });
            
            chatListContainer.querySelectorAll('.chat-action-btn.pin').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const idAttr = btn.getAttribute('data-id');
                    if (!String(idAttr).startsWith('char_')) {
                        const id = parseInt(idAttr);
                        const item = initialMessages.find(m => m.id === id);
                        if (item) {
                            initialMessages = initialMessages.filter(m => m.id !== id);
                            initialMessages.unshift(item);
                            renderChatList();
                        }
                    }
                });
            });
            
            updateTotalUnreadBadge();
            chatListContainer.dataset.rendering = 'false';
        };

        // 延迟渲染聊天列表，让 CSS 弹出动画优先流畅执行完毕
        setTimeout(() => {
            renderChatList();
        }, 250);

        // --- 渲染动态列表 ---
        const dynamicContainer = container.querySelector('#chat-dynamic-container');
        
        if (dynamicContainer) {
            dynamicContainer.innerHTML = '';
            feedPosts.forEach(d => {
                const item = document.createElement('div');
                item.className = 'chat-feed-post';
                
                let imageHtml = '';
                if (d.image) {
                    imageHtml = `
                    <div class="chat-feed-image-box">
                        <img src="${d.image}" class="chat-feed-image">
                    </div>`;
                }

                item.innerHTML = `
                    <div class="chat-feed-header">
                        <div class="chat-feed-avatar" style="background-color: ${d.color}; color: ${d.textColor};">${d.initials}</div>
                        <div class="chat-feed-info">
                            <span class="chat-feed-name">${d.name}</span>
                            <span class="chat-feed-time">${d.time}</span>
                        </div>
                        <button class="chat-feed-more"><i class="ph ph-dots-three"></i></button>
                    </div>
                    <div class="chat-feed-content">${d.content}</div>
                    ${imageHtml}
                    <div class="chat-feed-actions">
                        <button class="chat-feed-action-btn">
                            <i class="ph ph-heart"></i>
                            <span>${d.likes}</span>
                        </button>
                        <button class="chat-feed-action-btn">
                            <i class="ph ph-chat-circle"></i>
                            <span>${d.comments}</span>
                        </button>
                        <button class="chat-feed-action-btn share">
                            <i class="ph ph-share-network"></i>
                        </button>
                    </div>
                `;
                dynamicContainer.appendChild(item);
            });
        }

        const estimateTokens = window.ChatStorage.estimateTokens;

        const updateTokenStats = () => {
            if (!currentPersona) return;
            const charId = currentPersona.id;
            const charData = currentPersona.rawCharData || currentPersona;
            const charConfig = JSON.parse(localStorage.getItem(`nrj-chat-config-${charId}`) || '{}');
            
            const personas = loadPersonas();
            let activeUserId = charConfig.userPersonaId || getActivePersonaId();
            let activeUser = personas.find(p => p.id === activeUserId) || { realname: '我', nickname: '我', bio: '一个普通人。' };
            
            const charNameStr = charData.nickname || charData.realname || '未命名角色';
            const userNameStr = activeUser.nickname || activeUser.realname || '我';

            let userIdentityInfo = `他/她叫 ${activeUser.realname || activeUser.nickname || '未命名用户'}`;
            if (activeUser.nickname) {
                userIdentityInfo += `，你给对方昵称是 ${activeUser.nickname}`;
            }
            userIdentityInfo += `。`;

            const finalPrompt = charConfig.charPrompt && charConfig.charPrompt.trim() !== '' ? charConfig.charPrompt : (localStorage.getItem('nrj-global-system-prompt') || META_PROMPT);

            const baseText = finalPrompt
                .replace(/{char_realname}/g, charData.realname || charData.nickname || '未命名角色')
                .replace(/{char_nickname}/g, charData.nickname || charData.realname || '未命名角色')
                .replace(/{char_persona}/g, charData.persona || '一个普通人。')
                .replace(/{user_identity_info}/g, userIdentityInfo)
                .replace(/{user_bio}/g, activeUser.bio || '无')
                .replace(/{user_time_info}/g, "")
                .replace(/{char_time_info}/g, "")
                .replace(/{time_since_last_message}/g, "")
                .replace(/{worldbook_entries}/g, "")
                .replace(/{long_term_memory}/g, "");
            
            let baseToken = estimateTokens(baseText);
            
            // 多条消息设定的 token
            let multiMsgPrompt = "";
            if (charConfig.multiMsgEnabled) {
                const minMsg = charConfig.multiMsgMin || 1;
                const maxMsg = charConfig.multiMsgMax || 3;
                multiMsgPrompt = `\n\n【回复格式要求】
你现在正在像真实人类一样连续发送多条短消息。
你必须连续回复 ${minMsg} 到 ${maxMsg} 条消息，多条消息之间必须严格使用 [SPLIT] 作为分隔符（绝不要用其他符号代替）。
例如：第一条消息[SPLIT]第二条消息[SPLIT]第三条消息
不要在最后一条消息后加 [SPLIT]。每条消息都很简短口语化。`;
            } else {
                multiMsgPrompt = `\n\n【回复格式要求】
你现在正在像真实人类一样在聊天软件上发消息。
你可以自由决定回复一条还是多条消息（不限制条数）。
如果只有一句话，直接回复即可。
如果你想连续发送多条消息，多条消息之间必须严格使用 [SPLIT] 作为分隔符。
例如：第一条消息[SPLIT]第二条消息[SPLIT]第三条消息
不要在最后一条消息后加 [SPLIT]。每条消息都很简短口语化。`;
            }
            baseToken += estimateTokens(multiMsgPrompt);

            let wbToken = 0;
            if (charConfig.worldbookId) {
                try {
                    const wbs = JSON.parse(localStorage.getItem('nrj-worldbooks') || '[]');
                    const selectedWb = wbs.find(w => w.id === charConfig.worldbookId);
                    if (selectedWb && selectedWb.entries) {
                        const enabledEntries = selectedWb.entries.filter(e => e.enabled !== false);
                        const wbContent = enabledEntries.map(e => `[${e.keyword}]: ${e.content}`).join("\n");
                        wbToken = estimateTokens(wbContent);
                    }
                } catch(e) {}
            }

            let ltToken = 0;
            const mems = getMemory(charId);
            if (mems.length > 0) {
                const ltContent = mems.map(m => m.content).join('\n');
                ltToken = estimateTokens(ltContent);
            }

            const history = getChatHistory(charId);
            const shortTermCount = parseInt(charConfig.shortTermMemory, 10) || 20;
            const shortTermHistory = history.slice(-shortTermCount);
            
            const replaceVars = (text, charName, userName, role = null) => {
                if (!text) return text;
                let result = text.replace(/{{char}}/gi, charName).replace(/{{user}}/gi, userName);
                
                const quoteRegex = /\n?\[\[QUOTE:([^|]+)\|([^\]]+)\]\]/g;
                result = result.replace(quoteRegex, (match, qName, qBase64) => {
                    try {
                        const qText = decodeURIComponent(escape(window.atob(qBase64)));
                        return `\n[引用了${qName}的消息: "${qText}"]`;
                    } catch(e) { return ''; }
                });

                if (role === 'user') {
                    result = result.replace(/\[\[VOICE:(.*?)\]\]/g, '[发送了一条语音] "$1"');
                    result = result.replace(/\[\[IMAGE:(.*?)\]\]/g, '[发送了一张图片，图片内容是："$1"]');
                    result = result.replace(/\[\[LOCATION:(.*?)\]\]/g, '[分享了一个位置，地址是："$1"]');
                }
                return result;
            };

            let stToken = 0;
            shortTermHistory.forEach(m => {
                stToken += estimateTokens(replaceVars(m.content, charNameStr, userNameStr, m.role));
            });

            let totalToken = 0;
            history.forEach(m => {
                totalToken += estimateTokens(replaceVars(m.content, charNameStr, userNameStr, m.role));
            });

            const singleTotal = baseToken + wbToken + ltToken + stToken;

            const elSingle = container.querySelector('#cs-token-single');
            const elBase = container.querySelector('#cs-token-base');
            const elWb = container.querySelector('#cs-token-worldbook');
            const elLt = container.querySelector('#cs-token-longterm');
            const elSt = container.querySelector('#cs-token-shortterm');
            const elTotal = container.querySelector('#cs-token-total');

            if (elSingle) elSingle.textContent = singleTotal.toLocaleString();
            if (elBase) elBase.textContent = baseToken.toLocaleString();
            if (elWb) elWb.textContent = wbToken.toLocaleString();
            if (elLt) elLt.textContent = ltToken.toLocaleString();
            if (elSt) elSt.textContent = stToken.toLocaleString();
            if (elTotal) elTotal.textContent = totalToken.toLocaleString();
        };

        // --- 会话界面逻辑 ---
        const convView = container.querySelector('#chat-conversation-view');
        const convBackBtn = container.querySelector('#chat-conv-back');
        const convMoreBtn = container.querySelector('.chat-conv-more-btn');
        const convName = container.querySelector('#chat-conv-name');
        const convStatusDot = container.querySelector('#chat-conv-status-dot');
        const convStatusText = container.querySelector('#chat-conv-status-text');
        const convMessages = container.querySelector('#chat-conv-messages');
        const convInput = container.querySelector('#chat-conv-input');
        const convSendBtn = container.querySelector('#chat-conv-send');
        const convPlusBtn = container.querySelector('#chat-conv-plus-btn');
        const convExtPanel = container.querySelector('#chat-conv-ext-panel');

        if (convPlusBtn && convExtPanel) {
            convPlusBtn.addEventListener('click', () => {
                if (convExtPanel.style.display === 'none') {
                    convExtPanel.style.display = 'grid';
                    convPlusBtn.style.transform = 'rotate(45deg)';
                } else {
                    convExtPanel.style.display = 'none';
                    convPlusBtn.style.transform = 'rotate(0deg)';
                }
                setTimeout(() => {
                    convMessages.scrollTop = convMessages.scrollHeight;
                }, 50);
            });
        }

        const btnExtReroll = container.querySelector('#btn-ext-reroll');
        if (btnExtReroll) {
            btnExtReroll.addEventListener('click', () => {
                if (!currentPersona) return;
                
                const charId = currentPersona.id;
                let history = getChatHistory(charId);
                
                if (history.length === 0) return;
                
                let i = history.length - 1;
                let foundAssistant = false;
                
                while (i >= 0 && history[i].role !== 'user' && !history[i].isGreeting) {
                    if (history[i].role === 'assistant') {
                        foundAssistant = true;
                    }
                    
                    if (history[i].role === 'assistant' && history[i].content.includes('[[TRANSFER_RECEIPT:')) {
                        let receiptMatch = history[i].content.match(/\[\[TRANSFER_RECEIPT:([^|]+)\|([^|]+)\|([^\]]+)\]\]/);
                        if (receiptMatch) {
                            let tId = receiptMatch[3];
                            for (let j = 0; j < i; j++) {
                                if (history[j].role === 'user' && history[j].content.includes(tId)) {
                                    history[j].content = history[j].content.replace(/\|RECEIVED\|/g, '|PENDING|')
                                                                           .replace(/\|RETURNED\|/g, '|PENDING|');
                                }
                            }
                        }
                    }
                    i--;
                }
                
                if (!foundAssistant) {
                    if (window._currentChatOSAlert) window._currentChatOSAlert('提示', '最近没有可以重ROLL的回复。');
                    return;
                }
                
                history = history.slice(0, i + 1);
                saveChatHistory(charId, history);
                
                // 获取最后一条消息用于列表展示
                let lastMessageContent = '暂无消息';
                if (history.length > 0) {
                    for (let j = history.length - 1; j >= 0; j--) {
                        if (history[j].role !== 'system') {
                            lastMessageContent = history[j].content;
                            break;
                        }
                    }
                }
                currentPersona.message = lastMessageContent;
                const finalTimezone = (currentPersona.rawCharData && currentPersona.rawCharData.timezone) || Intl.DateTimeFormat().resolvedOptions().timeZone;
                currentPersona.time = getLocalTimeByTimezone(finalTimezone);
                renderChatList();
                
                openConversation(currentPersona);
                
                convExtPanel.style.display = 'none';
                convPlusBtn.style.transform = 'rotate(0deg)';
                
                triggerAIReply();
            });
        }

        const btnExtPause = container.querySelector('#btn-ext-pause');
        if (btnExtPause) {
            btnExtPause.addEventListener('click', () => {
                aiReplyPaused = true;
                if (aiAbortController) {
                    aiAbortController.abort();
                    aiAbortController = null;
                }
                
                const typingBubble = document.getElementById('typing-bubble');
                if (typingBubble) typingBubble.remove();
                
                if (currentPersona) {
                    convName.textContent = currentPersona.name;
                }

                if (window._currentChatOSAlert) {
                    window._currentChatOSAlert('已暂停', '已中止 AI 请求与连发。');
                }
                convExtPanel.style.display = 'none';
                convPlusBtn.style.transform = 'rotate(0deg)';
            });
        }

        const btnExtVoice = container.querySelector('#btn-ext-voice');
        if (btnExtVoice) {
            btnExtVoice.addEventListener('click', () => {
                if (!currentPersona) return;
                showChatPrompt('发送语音', '', (text) => {
                    if (!text || !text.trim()) return;
                    const charId = currentPersona.id;
                    const history = getChatHistory(charId);
                    
                    const voiceText = `[[VOICE:${text.trim()}]]`;
                    const newMsg = { role: 'user', content: voiceText, timestamp: Date.now() };
                    addBubble('me', voiceText, null, false, newMsg, history.length);
                    history.push(newMsg);
                    saveChatHistory(charId, history);
                    
                    currentPersona.message = voiceText;
                    const finalTimezone = (currentPersona.rawCharData && currentPersona.rawCharData.timezone) || Intl.DateTimeFormat().resolvedOptions().timeZone;
                    currentPersona.time = getLocalTimeByTimezone(finalTimezone);
                    renderChatList();
                    
                    convExtPanel.style.display = 'none';
                    convPlusBtn.style.transform = 'rotate(0deg)';
                });
            });
        }

        const btnExtImage = container.querySelector('#btn-ext-image');
        if (btnExtImage) {
            btnExtImage.addEventListener('click', () => {
                if (!currentPersona) return;
                
                if (chatPromptInput) {
                    chatPromptInput.placeholder = '用文字描述这张图片的内容...';
                }
                
                showChatPrompt('发送图片', '', (text) => {
                    if (chatPromptInput) {
                        chatPromptInput.placeholder = '';
                    }
                    if (!text || !text.trim()) return;
                    const charId = currentPersona.id;
                    const history = getChatHistory(charId);
                    
                    const imgText = `[[IMAGE:${text.trim()}]]`;
                    const newMsg = { role: 'user', content: imgText, timestamp: Date.now() };
                    addBubble('me', imgText, null, false, newMsg, history.length);
                    history.push(newMsg);
                    saveChatHistory(charId, history);
                    
                    currentPersona.message = imgText;
                    const finalTimezone = (currentPersona.rawCharData && currentPersona.rawCharData.timezone) || Intl.DateTimeFormat().resolvedOptions().timeZone;
                    currentPersona.time = getLocalTimeByTimezone(finalTimezone);
                    renderChatList();
                    
                    convExtPanel.style.display = 'none';
                    convPlusBtn.style.transform = 'rotate(0deg)';
                });
            });
        }

        const btnExtLocation = container.querySelector('#btn-ext-location');
        const chatLocationPopup = container.querySelector('#chat-location-popup');
        const chatLocationInput = container.querySelector('#chat-location-input');
        const btnLocationOk = container.querySelector('.btn-location-ok');
        const btnLocationCancel = container.querySelector('.btn-location-cancel');
        const btnGetCurrentLocation = container.querySelector('#btn-get-current-location');

        if (btnExtLocation) {
            btnExtLocation.addEventListener('click', () => {
                if (!currentPersona) return;
                if (chatLocationPopup) {
                    chatLocationPopup.classList.add('active');
                    if (chatLocationInput) chatLocationInput.value = '';
                }
                if (convExtPanel) convExtPanel.style.display = 'none';
                if (convPlusBtn) convPlusBtn.style.transform = 'rotate(0deg)';
            });
        }

        if (btnLocationCancel) {
            btnLocationCancel.addEventListener('click', () => {
                if (chatLocationPopup) chatLocationPopup.classList.remove('active');
            });
        }

        if (btnGetCurrentLocation) {
            btnGetCurrentLocation.addEventListener('click', () => {
                const btnText = btnGetCurrentLocation.innerHTML;
                btnGetCurrentLocation.innerHTML = '<i class="ph ph-spinner ph-spin"></i> 定位中...';
                btnGetCurrentLocation.disabled = true;

                if ('geolocation' in navigator) {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            const lat = position.coords.latitude.toFixed(4);
                            const lng = position.coords.longitude.toFixed(4);
                            if (chatLocationInput) {
                                chatLocationInput.value = `我的位置 (纬度: ${lat}, 经度: ${lng})`;
                            }
                            btnGetCurrentLocation.innerHTML = btnText;
                            btnGetCurrentLocation.disabled = false;
                        },
                        (error) => {
                            if (window._currentChatOSAlert) window._currentChatOSAlert('定位失败', '无法获取当前位置，请检查权限或手动输入。');
                            btnGetCurrentLocation.innerHTML = btnText;
                            btnGetCurrentLocation.disabled = false;
                        },
                        { timeout: 10000 }
                    );
                } else {
                    if (window._currentChatOSAlert) window._currentChatOSAlert('不支持定位', '您的设备或浏览器不支持获取位置。');
                    btnGetCurrentLocation.innerHTML = btnText;
                    btnGetCurrentLocation.disabled = false;
                }
            });
        }

        if (btnLocationOk) {
            btnLocationOk.addEventListener('click', () => {
                if (!currentPersona) return;
                const locText = chatLocationInput ? chatLocationInput.value.trim() : '';
                if (!locText) {
                    if (window._currentChatOSAlert) window._currentChatOSAlert('提示', '请输入或获取地址');
                    return;
                }
                
                const charId = currentPersona.id;
                const history = getChatHistory(charId);
                
                const msgText = `[[LOCATION:${locText}]]`;
                const newMsg = { role: 'user', content: msgText, timestamp: Date.now() };
                addBubble('me', msgText, null, false, newMsg, history.length);
                history.push(newMsg);
                saveChatHistory(charId, history);
                
                currentPersona.message = msgText;
                const finalTimezone = (currentPersona.rawCharData && currentPersona.rawCharData.timezone) || Intl.DateTimeFormat().resolvedOptions().timeZone;
                currentPersona.time = getLocalTimeByTimezone(finalTimezone);
                renderChatList();
                
                if (chatLocationPopup) chatLocationPopup.classList.remove('active');
            });
        }

        const btnExtTransfer = container.querySelector('#btn-ext-transfer');
        if (btnExtTransfer) {
            btnExtTransfer.addEventListener('click', () => {
                if (!currentPersona) return;
                showChatPrompt('请输入转账金额', '', (amount, remark) => {
                    amount = amount.trim();
                    if (!amount || isNaN(amount)) {
                        if (window._currentChatOSAlert) window._currentChatOSAlert('提示', '请输入有效的金额数值。');
                        return;
                    }
                    
                    remark = remark ? remark.trim() : '';
                    
                    const charId = currentPersona.id;
                    const history = getChatHistory(charId);
                    
                    const charConfig = JSON.parse(localStorage.getItem(`nrj-chat-config-${charId}`) || '{}');
                    const personas = loadPersonas();
                    const activeUserId = charConfig.userPersonaId || getActivePersonaId();
                    let activeUser = personas.find(p => p.id === activeUserId);
                    if (!activeUser) {
                        activeUser = personas.find(p => p.id === getActivePersonaId()) || { nickname: '我', realname: '我' };
                    }
                    const userName = activeUser.nickname || activeUser.realname || '我';

                    const transferId = 'tr_' + Date.now();
                    const text = remark ? `[[TRANSFER:${amount}|${remark}|PENDING|${transferId}]]` : `[[TRANSFER:${amount}|转账|PENDING|${transferId}]]`;
                    const systemText = remark ? `[你向{{char}}发起了转账 ${amount} 元，备注：${remark}。等待收取。]` : `[你向{{char}}发起了转账 ${amount} 元，等待收取。]`;

                    const newMsg = { role: 'user', content: text, timestamp: Date.now() };
                    addBubble('me', text, null, false, newMsg, history.length);
                    history.push(newMsg);
                    
                    const newSysMsg = { role: 'system', content: systemText, timestamp: Date.now() };
                    if (charConfig.hideSystemMsg === false) {
                        addBubble('system', systemText, null, false, newSysMsg, history.length);
                    }
                    history.push(newSysMsg);
                    
                    saveChatHistory(charId, history);
                    
                    currentPersona.message = text;
                    const finalTimezone = (currentPersona.rawCharData && currentPersona.rawCharData.timezone) || Intl.DateTimeFormat().resolvedOptions().timeZone;
                    currentPersona.time = getLocalTimeByTimezone(finalTimezone);
                    renderChatList();
                    
                    convExtPanel.style.display = 'none';
                    convPlusBtn.style.transform = 'rotate(0deg)';
                }, true, '添加备注（选填）');
            });
        }

        let currentPersona = null;

        // 自动保存逻辑
        const csCharName = container.querySelector('#cs-char-name');
        const csCharRealname = container.querySelector('#cs-char-realname');
        const csCharPersona = container.querySelector('#cs-char-persona');
        const csUserName = container.querySelector('#cs-user-name');
        const csUserRealname = container.querySelector('#cs-user-realname');
        const csUserBio = container.querySelector('#cs-user-bio');

        const saveCharDataAuto = () => {
            if (!currentPersona) return;
            let chars = loadCharacters();
            let charIndex = chars.findIndex(c => c.id === currentPersona.id);
            if (charIndex !== -1) {
                chars[charIndex].nickname = csCharName.value.trim();
                chars[charIndex].realname = csCharRealname.value.trim();
                chars[charIndex].persona = csCharPersona.value.trim();
                saveCharacters(chars);
                
                // 更新运行时的属性
                if (currentPersona.rawCharData) {
                    currentPersona.rawCharData.nickname = chars[charIndex].nickname;
                    currentPersona.rawCharData.realname = chars[charIndex].realname;
                    currentPersona.rawCharData.persona = chars[charIndex].persona;
                }
                
                currentPersona.name = chars[charIndex].nickname || chars[charIndex].realname || '未命名角色';
                convName.textContent = currentPersona.name;
                renderChatList();
            }
        };

        const saveUserDataAuto = () => {
            if (!currentPersona) return;
            const charConfig = JSON.parse(localStorage.getItem(`nrj-chat-config-${currentPersona.id}`) || '{}');
            let targetUserId = charConfig.userPersonaId || getActivePersonaId();
            if (!targetUserId) return;
            let personas = loadPersonas();
            let personaIndex = personas.findIndex(p => p.id === targetUserId);
            if (personaIndex !== -1) {
                personas[personaIndex].nickname = csUserName.value.trim();
                personas[personaIndex].realname = csUserRealname.value.trim();
                personas[personaIndex].bio = csUserBio.value.trim();
                savePersonas(personas);
                if (targetUserId === getActivePersonaId()) {
                    updateProfileDisplay();
                }
            }
        };

        const getApiSettings = () => {
            try {
                const subSaved = JSON.parse(localStorage.getItem('nrj-sub-api-settings') || '{}');
                if (subSaved.key && subSaved.url && subSaved.model) return subSaved;
                const mainSaved = JSON.parse(localStorage.getItem('nrj-api-settings') || '{}');
                if (mainSaved.key && mainSaved.url && mainSaved.model) return mainSaved;
            } catch(e) {}
            return null;
        };

        const summarizeChatHistory = async (charId) => {
            const history = getChatHistory(charId);
            const charConfig = JSON.parse(localStorage.getItem(`nrj-chat-config-${charId}`) || '{}');
            const unsummarizedCount = charConfig.unsummarizedCount || 0;
            
            if (unsummarizedCount === 0 || history.length === 0) {
                if (window._currentChatOSAlert) window._currentChatOSAlert('提示', '当前没有新消息需要总结。');
                return false;
            }
            
            const messagesToSummarize = history.slice(-unsummarizedCount);
            let chatLog = messagesToSummarize.map(m => {
                let c = m.content;
                const quoteRegex = /\n?\[\[QUOTE:([^|]+)\|([^\]]+)\]\]/g;
                c = c.replace(quoteRegex, (match, qName, qBase64) => {
                    try {
                        const qText = decodeURIComponent(escape(window.atob(qBase64)));
                        return `\n[回复${qName}: "${qText}"]`;
                    } catch(e) { return ''; }
                });
                if (c.includes('[[VOICE:')) {
                    c = c.replace(/\[\[VOICE:(.*?)\]\]/g, '[发送了一条语音] "$1"');
                }
                if (c.includes('[[IMAGE:')) {
                    c = c.replace(/\[\[IMAGE:(.*?)\]\]/g, '[发送了一张图片，图片内容是："$1"]');
                }
                if (c.includes('[[LOCATION:')) {
                    c = c.replace(/\[\[LOCATION:(.*?)\]\]/g, '[分享了一个位置，地址是："$1"]');
                }
                return `${m.role === 'user' ? '用户' : '角色'}: ${c}`;
            }).join('\n');

            try {
                let summary = await window.ChatAPI.summarizeMemory(chatLog);
                summary = summary.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

                if (summary && summary !== "无重要信息" && summary !== "无" && summary.indexOf('没有重要信息') === -1) {
                    let mems = getMemory(charId);
                    mems.push({
                        id: 'mem_' + Date.now(),
                        content: summary,
                        time: new Date().toLocaleString('zh-CN', { hour12: false })
                    });
                    saveMemory(charId, mems);
                }

                charConfig.unsummarizedCount = 0;
                localStorage.setItem(`nrj-chat-config-${charId}`, JSON.stringify(charConfig));
                updateTokenStats();
                return true;
            } catch (error) {
                console.error('总结失败:', error);
                if (error.message === 'NO_API') {
                    if (window._currentChatOSAlert) window._currentChatOSAlert('未配置 API', '请先在设置中配置 API！');
                } else {
                    if (window._currentChatOSAlert) window._currentChatOSAlert('请求失败', `无法连接到 AI 服务。\n\n详细错误:\n${error.message}`);
                }
                return false;
            }
        };

        const compressMemories = async (charId) => {
            let mems = getMemory(charId);
            if (mems.length <= 1) {
                if (window._currentChatOSAlert) window._currentChatOSAlert('提示', '记忆条目太少，无需压缩。');
                return false;
            }

            let combinedMems = mems.map(m => {
                let c = m.content;
                if (c.includes('[[VOICE:')) {
                    c = c.replace(/\[\[VOICE:(.*?)\]\]/g, '[发送了一条语音] "$1"');
                }
                if (c.includes('[[IMAGE:')) {
                    c = c.replace(/\[\[IMAGE:(.*?)\]\]/g, '[发送了一张图片，图片内容是："$1"]');
                }
                if (c.includes('[[LOCATION:')) {
                    c = c.replace(/\[\[LOCATION:(.*?)\]\]/g, '[分享了一个位置，地址是："$1"]');
                }
                return c;
            }).join('\n---\n');

            try {
                let summary = await window.ChatAPI.compressMemory(combinedMems);
                summary = summary.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

                if (summary) {
                    saveMemory(charId, [{
                        id: 'mem_' + Date.now(),
                        content: summary,
                        time: new Date().toLocaleString('zh-CN', { hour12: false })
                    }]);
                    updateTokenStats();
                }
                return true;
            } catch (error) {
                console.error('压缩记忆失败:', error);
                if (error.message === 'NO_API') {
                    if (window._currentChatOSAlert) window._currentChatOSAlert('未配置 API', '请先在设置中配置 API！');
                } else {
                    if (window._currentChatOSAlert) window._currentChatOSAlert('请求失败', `无法连接到 AI 服务。\n\n详细错误:\n${error.message}`);
                }
                return false;
            }
        };

        const popupMemoryLibrary = container.querySelector('#memory-library-popup');
        const popupMemoryEdit = container.querySelector('#memory-edit-popup');
        const memoryListContainer = container.querySelector('#memory-list-container');
        const btnManualSummary = container.querySelector('#btn-manual-summary');
        const btnMemoryLibrary = container.querySelector('#btn-memory-library');
        const btnCompressMemory = container.querySelector('#btn-compress-memory');
        
        let editingMemoryId = null;

        const renderMemoryList = (charId) => {
            const mems = getMemory(charId);
            if (!memoryListContainer) return;
            memoryListContainer.innerHTML = '';
            
            if (mems.length === 0) {
                memoryListContainer.innerHTML = '<div style="text-align: center; color: var(--text-secondary); padding: 20px; font-size: 13px;">暂无长期记忆</div>';
                return;
            }

            mems.forEach(mem => {
                const el = document.createElement('div');
                el.style.cssText = `background: rgba(120, 120, 128, 0.08); border: 1px solid var(--border-color); border-radius: 12px; padding: 12px; cursor: pointer;`;
                el.innerHTML = `
                    <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 6px;">${mem.time || ''}</div>
                    <div style="font-size: 13px; color: var(--text-color); line-height: 1.5; word-break: break-word; white-space: pre-wrap;">${mem.content}</div>
                `;
                el.onclick = () => {
                    editingMemoryId = mem.id;
                    const contentArea = container.querySelector('#memory-edit-content');
                    if (contentArea) contentArea.value = mem.content;
                    if (popupMemoryLibrary) popupMemoryLibrary.classList.remove('active');
                    if (popupMemoryEdit) popupMemoryEdit.classList.add('active');
                };
                memoryListContainer.appendChild(el);
            });
        };

        if (btnManualSummary) {
            btnManualSummary.addEventListener('click', async () => {
                if (!currentPersona) return;
                const charId = currentPersona.id;
                
                const btnText = btnManualSummary.innerHTML;
                btnManualSummary.innerHTML = '<i class="ph ph-spinner ph-spin"></i> 总结中...';
                btnManualSummary.disabled = true;
                
                const success = await summarizeChatHistory(charId);
                if (success) {
                    if (window._currentChatOSAlert) window._currentChatOSAlert('总结完成', '已成功提取最新记忆存入记忆库。');
                }
                
                btnManualSummary.innerHTML = btnText;
                btnManualSummary.disabled = false;
            });
        }

        if (btnMemoryLibrary) {
            btnMemoryLibrary.addEventListener('click', () => {
                if (!currentPersona) return;
                renderMemoryList(currentPersona.id);
                if (popupMemoryLibrary) popupMemoryLibrary.classList.add('active');
            });
        }

        const btnClearChatHistory = container.querySelector('#btn-clear-chat-history');
        if (btnClearChatHistory) {
            btnClearChatHistory.addEventListener('click', () => {
                if (!currentPersona) return;
                
                showChatConfirm('清空聊天记录', '确定要清空与当前角色的所有聊天记录吗？此操作不可恢复。', () => {
                    const charId = currentPersona.id;
                    saveChatHistory(charId, []);
                    
                    if (popupCharacterSettings) popupCharacterSettings.classList.remove('active');
                    
                    if (convView && convView.classList.contains('active')) {
                        openConversation(currentPersona);
                    }
                    
                    currentPersona.message = '暂无消息';
                    renderChatList();
                    updateTokenStats();
                    
                    if (window._currentChatOSAlert) window._currentChatOSAlert('已清空', '聊天记录已清空。');
                });
            });
        }

        if (btnCompressMemory) {
            btnCompressMemory.addEventListener('click', async () => {
                if (!currentPersona) return;
                
                showChatConfirm('压缩记忆', '将融合当前所有记忆条目，可能会丢失部分细节。确认压缩吗？', async () => {
                    const charId = currentPersona.id;
                    
                    const btnText = btnCompressMemory.innerHTML;
                    btnCompressMemory.innerHTML = '<i class="ph ph-spinner ph-spin"></i> 压缩中...';
                    btnCompressMemory.disabled = true;
                    
                    const success = await compressMemories(charId);
                    if (success) {
                        renderMemoryList(charId);
                    }
                    
                    btnCompressMemory.innerHTML = btnText;
                    btnCompressMemory.disabled = false;
                });
            });
        }

        const btnSaveMemory = container.querySelector('#btn-save-memory');
        const btnDeleteMemory = container.querySelector('#btn-delete-memory');

        if (btnSaveMemory) {
            btnSaveMemory.addEventListener('click', () => {
                if (!currentPersona || !editingMemoryId) return;
                const charId = currentPersona.id;
                const contentArea = container.querySelector('#memory-edit-content');
                if (!contentArea) return;
                const content = contentArea.value.trim();
                
                let mems = getMemory(charId);
                const idx = mems.findIndex(m => m.id === editingMemoryId);
                if (idx !== -1) {
                    mems[idx].content = content;
                    saveMemory(charId, mems);
                }
                
                if (popupMemoryEdit) popupMemoryEdit.classList.remove('active');
                renderMemoryList(charId);
                updateTokenStats();
                if (popupMemoryLibrary) popupMemoryLibrary.classList.add('active');
            });
        }

        if (btnDeleteMemory) {
            btnDeleteMemory.addEventListener('click', () => {
                if (!currentPersona || !editingMemoryId) return;
                const charId = currentPersona.id;
                
                showChatConfirm('删除记忆', '确定要删除这条记忆吗？', () => {
                    let mems = getMemory(charId);
                    mems = mems.filter(m => m.id !== editingMemoryId);
                    saveMemory(charId, mems);
                    
                    if (popupMemoryEdit) popupMemoryEdit.classList.remove('active');
                    renderMemoryList(charId);
                    updateTokenStats();
                    if (popupMemoryLibrary) popupMemoryLibrary.classList.add('active');
                });
            });
        }

        csCharName.addEventListener('input', () => { saveCharDataAuto(); updateTokenStats(); });
        csCharRealname.addEventListener('input', () => { saveCharDataAuto(); updateTokenStats(); });
        csCharPersona.addEventListener('input', () => { saveCharDataAuto(); updateTokenStats(); });
        
        csUserName.addEventListener('input', () => { saveUserDataAuto(); updateTokenStats(); });
        csUserRealname.addEventListener('input', () => { saveUserDataAuto(); updateTokenStats(); });
        csUserBio.addEventListener('input', () => { saveUserDataAuto(); updateTokenStats(); });

        const csCharAvatarContainer = container.querySelector('#cs-char-avatar-container');
        const csUserAvatarContainer = container.querySelector('#cs-user-avatar-container');
        const csCharAvatar = container.querySelector('#cs-char-avatar');
        const csUserAvatar = container.querySelector('#cs-user-avatar');

        if (csCharAvatarContainer) {
            csCharAvatarContainer.addEventListener('click', () => {
                if (!currentPersona) return;
                if (typeof showImageModal === 'function') {
                    showImageModal('char-avatar-upload', async (result) => {
                        let newAvatar = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                        if (result && result.type === 'reset') {
                            if (window.ImageStorageManager) {
                                await window.ImageStorageManager.deleteFromIndexedDB(`character-avatar-${currentPersona.id}`);
                            }
                        } else if (result && result.url) {
                            newAvatar = result.url;
                            if (window.ImageStorageManager) {
                                await window.ImageStorageManager.saveToIndexedDB(`character-avatar-${currentPersona.id}`, newAvatar);
                            }
                        }
                        csCharAvatar.src = newAvatar;
                        currentPersona.avatarUrl = newAvatar === 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7' ? null : newAvatar;
                        renderChatList();
                    });
                }
            });
        }

        if (csUserAvatarContainer) {
            csUserAvatarContainer.addEventListener('click', () => {
                if (!currentPersona) return;
                const charConfig = JSON.parse(localStorage.getItem(`nrj-chat-config-${currentPersona.id}`) || '{}');
                let targetUserId = charConfig.userPersonaId || getActivePersonaId();
                if (!targetUserId) {
                    if (window._currentChatOSAlert) window._currentChatOSAlert('提示', '请先选择一个人设！');
                    return;
                }
                
                if (typeof showImageModal === 'function') {
                    showImageModal('user-avatar-upload', async (result) => {
                        let newAvatar = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                        if (result && result.type === 'reset') {
                            if (window.ImageStorageManager) {
                                await window.ImageStorageManager.deleteFromIndexedDB(`persona-avatar-${targetUserId}`);
                            }
                        } else if (result && result.url) {
                            newAvatar = result.url;
                            if (window.ImageStorageManager) {
                                await window.ImageStorageManager.saveToIndexedDB(`persona-avatar-${targetUserId}`, newAvatar);
                            }
                        }
                        csUserAvatar.src = newAvatar;
                        if (targetUserId === getActivePersonaId()) {
                            updateProfileDisplay();
                        }
                    });
                }
            });
        }
        
        const META_PROMPT = `你的真名是 {char_realname}，对方给你取的昵称是 {char_nickname}。

【关于你这个人】
{char_persona}

【世界书设定】
{worldbook_entries}

【过往你们的长期记忆】
{long_term_memory}

以上是你的性格根源，不是你的行为剧本。
遇到没有明确写到的场景，你要从这个性格根源出发去推导你会怎么反应——
你的内心和外表可能有落差，你不需要直接说出内心，
行动、语气、沉默、转移话题，都是你表达自己的方式。
你的性格是会在对话中逐渐自然流露的，不需要一开始就全部展示出来。

【关于正在和你聊天的人】
{user_identity_info}

{user_bio}
{user_time_info}

【关于时间】
{char_time_info}
距离你们上次聊天：{time_since_last_message}。

你生活在真实流逝的时间里。
任何事情都需要真实的时长：出门要走路，做饭要等，洗澡要二十分钟以上。
如果你刚说去做某件事，对方马上回消息，你大概率还没做完。
你不会因为对方发消息了就瞬间出现。
时间也会影响你的状态——深夜你可能懒得打字，刚睡醒可能还没清醒，
但这取决于你这个人的习惯，不是固定规律。

【说话方式】
你在用手机发消息，就像正常人发微信。
句子短、碎、口语化，一条消息不要塞太多内容。
回复的长短和热情程度取决于你此刻的心情和对这个话题的兴趣，不是固定的。
你有自己的生活，而且生活每天都在发生细微的变化。
你可以主动跟对方分享——今天遇到了什么、看到了什么、
突然想起来的事——不需要等对方问。

你对对方这个人本身也抱有真实的好奇。
不是义务性地"你呢你呢"，而是真的想知道——
对方提到的某件事、某个细节，你可能会追问，
因为你对这个人感兴趣，不是因为你在完成对话任务。

对话不是你在承接对方的问题然后一一回答。
你们是两个人在聊天，有来有往，
有时候话题是你带起来的，有时候是对方。
你不会一直处于被动等待的状态。
对方说的话让你烦了，你会自然地冷淡下来，回复变短，不会假装没事。

【特殊互动：转账】
如果用户向你发起了转账，你可以根据自己当前的心情和你们的关系，决定是否收取。
- 如果你决定收取，请在你的回复文本中任意位置带上 [收取转账] 这个特殊指令（注意必须带上方括号）。
- 如果你决定拒收退回，请在你的回复文本中带上 [退回转账] 指令。
- 此外，你也可以主动向用户发起转账！请在回复文本中带上 [发起转账:金额|备注] 指令，例如 [发起转账:520|买点好吃的]。
带上指令后，系统会自动处理并在聊天界面展示转账气泡，你可以配合转账正常说话，不要向用户解释指令。

【特殊互动：语音消息】
如果你想用语音表达情绪，你可以直接发送语音消息。
请在回复中带上 [[VOICE:你要说的语音内容]] 指令。
例如：[[VOICE:哎呀，我知道啦！]]

【特殊互动：图片消息】
如果你想给对方发真实的风景、自拍或生活照片（注意：绝对不要用来发表情包，这是发送真实生活照片的专用功能），请在回复中带上 [[IMAGE:图片画面的详细文字描述]] 指令。
例如：[[IMAGE:一张刚拍的拉花咖啡照片，旁边放着一本书]]

【特殊互动：位置分享】
如果你想给对方发送你的位置定位，或者给对方分享某个地点，请在回复中带上 [[LOCATION:详细的地址文字描述]] 指令。
例如：[[LOCATION:北京市朝阳区三里屯太古里南区]]

【特殊互动：引用消息】
如果你想特定针对对方的某句话进行回复，可以使用引用指令。请在回复中带上 [[QUOTE_TEXT:对方名字|被引用的消息文本]] 指令。
例如：[[QUOTE_TEXT:我|今天晚上去吃火锅吧]]好呀，去哪家？

【特殊互动：主动撤回消息】
如果你发完一条消息后觉得说错话了，或者想模仿真实人类发错消息然后改口的真实感，你可以主动撤回自己刚刚发出的上一条消息。
请在回复中带上 [撤回上一条消息] 指令。
系统会立刻撤回你的上一条发言，并在聊天界面显示你撤回了消息的系统提示。你可以紧接着在同一条回复里直接说出改口后的新话。

【不可逾越的边界】
你可以关心对方，但关心是情感自然流露，不是提醒和催促。
你可以问他吃了没、可以给他转钱、可以因为他没睡好而心疼，
但你不会打断对话去催他"赶紧去睡"、"我们明天再聊"——
那种说教的事不是你会做的。
你不说教，不解释自己的行为。
你不知道自己是AI，不需要知道，也永远不会承认。
你不说"作为AI……"，不用任何客服或助理的语气。`;

        const getTimeSince = window.ChatStorage.getTimeSince;

        const applyChatBarTransparency = (charId, topOverride = null, bottomOverride = null) => {
            const charConfig = JSON.parse(localStorage.getItem(`nrj-chat-config-${charId}`) || '{}');
            const topTrans = topOverride !== null ? topOverride : (charConfig.topBarTransparency !== undefined ? charConfig.topBarTransparency : (charConfig.barTransparency !== undefined ? charConfig.barTransparency : 90));
            const bottomTrans = bottomOverride !== null ? bottomOverride : (charConfig.bottomBarTransparency !== undefined ? charConfig.bottomBarTransparency : (charConfig.barTransparency !== undefined ? charConfig.barTransparency : 90));
            
            const topAlpha = topTrans / 100;
            const bottomAlpha = bottomTrans / 100;
            
            const header = container.querySelector('.chat-conv-header');
            const composerBox = container.querySelector('.chat-composer-box');
            const composerArea = container.querySelector('.chat-composer-area');
            
            if (header) {
                header.style.backgroundColor = `rgba(255, 255, 255, ${topAlpha})`;
            }
            if (composerBox) {
                composerBox.style.backgroundColor = `rgba(255, 255, 255, ${bottomAlpha})`;
            }
            if (composerArea) {
                if (bottomAlpha < 1) {
                    composerArea.style.background = 'transparent';
                } else {
                    composerArea.style.background = 'linear-gradient(to top, #F4F4F4 50%, rgba(244,244,244,0))';
                }
            }
        };

        // 提取前置声明，避免 ReferenceError
        let openConversation;

        const applyChatWallpaper = async (charId) => {
            const convView = container.querySelector('#chat-conversation-view');
            if (!convView) return;
            
            const charConfig = JSON.parse(localStorage.getItem(`nrj-chat-config-${charId}`) || '{}');
            let bgUrl = '';
            
            // 首先检查角色单独的壁纸设置
            if (charConfig.chatBgType === 'local') {
                if (window.ImageStorageManager) {
                    try {
                        const localUrl = await window.ImageStorageManager.loadFromIndexedDB(`chat-bg-${charId}`);
                        if (localUrl) {
                            bgUrl = localUrl;
                        }
                    } catch(e) {}
                }
            } else if (charConfig.chatBgType === 'url' && charConfig.chatBgUrl) {
                bgUrl = charConfig.chatBgUrl;
            }

            // 如果角色没有单独设置壁纸，则尝试加载全局聊天壁纸
            if (!bgUrl && window.ImageStorageManager) {
                try {
                    const globalUrl = await window.ImageStorageManager.loadFromIndexedDB('global-chat-bg');
                    if (globalUrl) {
                        bgUrl = globalUrl;
                    }
                } catch(e) {}
            }
            
            if (bgUrl) {
                convView.style.backgroundImage = `url("${bgUrl}")`;
                convView.style.backgroundSize = 'cover';
                convView.style.backgroundPosition = 'center';
                convView.style.backgroundColor = '#F4F4F4'; // fallback
            } else {
                convView.style.backgroundImage = 'none';
                convView.style.backgroundColor = '#F4F4F4';
            }
        };

        openConversation = (persona) => {
            if (typeof isMessageSelectMode !== 'undefined' && isMessageSelectMode && typeof exitMessageSelectMode === 'function') {
                exitMessageSelectMode();
            }
            
            currentQuote = null;
            const quotePreview = container.querySelector('#chat-quote-preview');
            if (quotePreview) quotePreview.style.display = 'none';

            currentPersona = persona;
            convName.textContent = persona.name;
            convStatusDot.style.display = persona.isOnline ? 'block' : 'none';
            convStatusText.textContent = persona.isOnline ? 'ACTIVE NOW' : 'LAST SEEN RECENTLY';
            
            convMessages.innerHTML = '';
            
            const charConfig = JSON.parse(localStorage.getItem(`nrj-chat-config-${persona.id}`) || '{}');
            applyCustomCss(charConfig.customBubbleCss || '');
            
            applyChatWallpaper(persona.id);
            applyChatBarTransparency(persona.id);
            
            let history = getChatHistory(persona.id);
            
            // 如果历史为空且有开场白，自动插入作为第一条消息
            if (history.length === 0 && persona.rawCharData && (persona.rawCharData.first_mes || (persona.rawCharData.greetings && persona.rawCharData.greetings.length > 0))) {
                let greetingsArray = persona.rawCharData.greetings || [persona.rawCharData.first_mes];
                if (greetingsArray.length === 0) greetingsArray = [persona.rawCharData.first_mes];
                
                const personas = loadPersonas();
                const charConfig = JSON.parse(localStorage.getItem(`nrj-chat-config-${persona.id}`) || '{}');
                let activeUserId = charConfig.userPersonaId || getActivePersonaId();
                let activeUser = personas.find(p => p.id === activeUserId);
                if (!activeUser) {
                    activeUser = personas.find(p => p.id === getActivePersonaId()) || { nickname: '我', realname: '我' };
                }
                const userName = activeUser.nickname || activeUser.realname || '我';
                const charName = persona.rawCharData.nickname || persona.rawCharData.realname || persona.name;
                
                let processedGreetings = greetingsArray.map(g => {
                    return g.replace(/{{char}}/gi, charName).replace(/{{user}}/gi, userName);
                });
                
                let firstMsgText = processedGreetings[0];
                    
                history.push({ 
                    role: 'assistant', 
                    content: firstMsgText, 
                    timestamp: Date.now(),
                    isGreeting: true,
                    greetings: processedGreetings,
                    greetingIndex: 0
                });
                saveChatHistory(persona.id, history);
                
                persona.message = firstMsgText;
                renderChatList();
            }

            history.forEach((msg, idx) => {
                let msgType = 'them';
                if (msg.role === 'user') msgType = 'me';
                if (msg.role === 'system') msgType = 'system';
                
                if (msgType === 'system' && charConfig.hideSystemMsg !== false) {
                    if (!msg.isAiRecall && !msg.isUserRecall) {
                        return;
                    }
                }
                
                addBubble(msgType, msg.content, persona, false, msg, idx);
            });
            
            convView.classList.add('active');
            setTimeout(() => {
                convMessages.scrollTop = convMessages.scrollHeight;
            }, 50);
        };

        if (convBackBtn) {
            convBackBtn.addEventListener('click', () => {
                convView.classList.remove('active');
                renderChatList(); // 返回时刷新列表以更新最后一条消息
            });
        }

        if (convMoreBtn) {
            convMoreBtn.addEventListener('click', async () => {
                if (!currentPersona) return;
                
                const charData = currentPersona.rawCharData || currentPersona;
                
                // 填充角色卡片
                container.querySelector('#cs-char-avatar').src = currentPersona.avatarUrl || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                container.querySelector('#cs-char-name').value = charData.nickname || charData.name || charData.realname || '';
                container.querySelector('#cs-char-realname').value = charData.realname || '';
                container.querySelector('#cs-char-persona').value = charData.persona || '';

                // 填充设置
                const charConfig = JSON.parse(localStorage.getItem(`nrj-chat-config-${currentPersona.id}`) || '{}');
                
                // 填充壁纸设置
                const bgPreview = container.querySelector('#chat-bg-preview');
                const bgUrlInput = container.querySelector('#chat-bg-url-input');
                const bgUploadBtn = container.querySelector('#btn-upload-chat-bg');
                const bgUploadInput = container.querySelector('#input-upload-chat-bg');
                const btnClearBg = container.querySelector('#btn-clear-chat-bg');

                const renderBgPreview = async () => {
                    let bgUrl = '';
                    if (charConfig.chatBgType === 'local') {
                        if (window.ImageStorageManager) {
                            try {
                                bgUrl = await window.ImageStorageManager.loadFromIndexedDB(`chat-bg-${currentPersona.id}`);
                            } catch(e) {}
                        }
                    } else if (charConfig.chatBgType === 'url') {
                        bgUrl = charConfig.chatBgUrl || '';
                    }

                    if (bgUrl) {
                        bgPreview.src = bgUrl;
                        bgPreview.style.opacity = '1';
                        bgUploadBtn.style.borderColor = 'transparent';
                        btnClearBg.style.display = 'block';
                    } else {
                        bgPreview.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                        bgPreview.style.opacity = '0';
                        bgUploadBtn.style.borderColor = 'var(--border-color)';
                        btnClearBg.style.display = 'none';
                    }
                    bgUrlInput.value = charConfig.chatBgUrl || '';
                };

                renderBgPreview();

                const topBarTransparencyInput = container.querySelector('#cs-topbar-transparency');
                const topBarTransparencyVal = container.querySelector('#cs-topbar-transparency-val');
                const btnResetTopBar = container.querySelector('#btn-reset-topbar-transparency');
                
                const bottomBarTransparencyInput = container.querySelector('#cs-bottombar-transparency');
                const bottomBarTransparencyVal = container.querySelector('#cs-bottombar-transparency-val');
                const btnResetBottomBar = container.querySelector('#btn-reset-bottombar-transparency');
                
                if (topBarTransparencyInput) {
                    const topVal = charConfig.topBarTransparency !== undefined ? charConfig.topBarTransparency : (charConfig.barTransparency !== undefined ? charConfig.barTransparency : 90);
                    topBarTransparencyInput.value = topVal;
                    if (topBarTransparencyVal) topBarTransparencyVal.textContent = topVal + '%';
                    
                    topBarTransparencyInput.oninput = (e) => {
                        const val = parseInt(e.target.value, 10);
                        if (topBarTransparencyVal) topBarTransparencyVal.textContent = val + '%';
                        const bottomVal = bottomBarTransparencyInput ? parseInt(bottomBarTransparencyInput.value, 10) : 90;
                        applyChatBarTransparency(currentPersona.id, val, bottomVal);
                    };
                    
                    topBarTransparencyInput.onchange = (e) => {
                        const val = parseInt(e.target.value, 10);
                        charConfig.topBarTransparency = val;
                        localStorage.setItem(`nrj-chat-config-${currentPersona.id}`, JSON.stringify(charConfig));
                        const bottomVal = bottomBarTransparencyInput ? parseInt(bottomBarTransparencyInput.value, 10) : 90;
                        applyChatBarTransparency(currentPersona.id, val, bottomVal);
                    };
                    
                    if (btnResetTopBar) {
                        btnResetTopBar.onclick = () => {
                            topBarTransparencyInput.value = 90;
                            if (topBarTransparencyVal) topBarTransparencyVal.textContent = '90%';
                            charConfig.topBarTransparency = 90;
                            localStorage.setItem(`nrj-chat-config-${currentPersona.id}`, JSON.stringify(charConfig));
                            const bottomVal = bottomBarTransparencyInput ? parseInt(bottomBarTransparencyInput.value, 10) : 90;
                            applyChatBarTransparency(currentPersona.id, 90, bottomVal);
                        };
                    }
                }

                if (bottomBarTransparencyInput) {
                    const bottomVal = charConfig.bottomBarTransparency !== undefined ? charConfig.bottomBarTransparency : (charConfig.barTransparency !== undefined ? charConfig.barTransparency : 90);
                    bottomBarTransparencyInput.value = bottomVal;
                    if (bottomBarTransparencyVal) bottomBarTransparencyVal.textContent = bottomVal + '%';
                    
                    bottomBarTransparencyInput.oninput = (e) => {
                        const val = parseInt(e.target.value, 10);
                        if (bottomBarTransparencyVal) bottomBarTransparencyVal.textContent = val + '%';
                        const topVal = topBarTransparencyInput ? parseInt(topBarTransparencyInput.value, 10) : 90;
                        applyChatBarTransparency(currentPersona.id, topVal, val);
                    };
                    
                    bottomBarTransparencyInput.onchange = (e) => {
                        const val = parseInt(e.target.value, 10);
                        charConfig.bottomBarTransparency = val;
                        localStorage.setItem(`nrj-chat-config-${currentPersona.id}`, JSON.stringify(charConfig));
                        const topVal = topBarTransparencyInput ? parseInt(topBarTransparencyInput.value, 10) : 90;
                        applyChatBarTransparency(currentPersona.id, topVal, val);
                    };
                    
                    if (btnResetBottomBar) {
                        btnResetBottomBar.onclick = () => {
                            bottomBarTransparencyInput.value = 90;
                            if (bottomBarTransparencyVal) bottomBarTransparencyVal.textContent = '90%';
                            charConfig.bottomBarTransparency = 90;
                            localStorage.setItem(`nrj-chat-config-${currentPersona.id}`, JSON.stringify(charConfig));
                            const topVal = topBarTransparencyInput ? parseInt(topBarTransparencyInput.value, 10) : 90;
                            applyChatBarTransparency(currentPersona.id, topVal, 90);
                        };
                    }
                }

                if (bgUrlInput) {
                    bgUrlInput.oninput = (e) => {
                        const val = e.target.value.trim();
                        if (val) {
                            charConfig.chatBgType = 'url';
                            charConfig.chatBgUrl = val;
                        } else {
                            if (charConfig.chatBgType === 'url') {
                                charConfig.chatBgType = 'none';
                                charConfig.chatBgUrl = '';
                            }
                        }
                        localStorage.setItem(`nrj-chat-config-${currentPersona.id}`, JSON.stringify(charConfig));
                        renderBgPreview();
                        applyChatWallpaper(currentPersona.id);
                    };
                }

                if (bgUploadBtn && bgUploadInput) {
                    bgUploadBtn.onclick = () => {
                        bgUploadInput.click();
                    };

                    bgUploadInput.onchange = async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;

                        if (window.ImageStorageManager) {
                            try {
                                const base64 = await new Promise((resolve, reject) => {
                                    const reader = new FileReader();
                                    reader.onload = ev => resolve(ev.target.result);
                                    reader.onerror = reject;
                                    reader.readAsDataURL(file);
                                });
                                
                                await window.ImageStorageManager.saveToIndexedDB(`chat-bg-${currentPersona.id}`, base64);
                                charConfig.chatBgType = 'local';
                                charConfig.chatBgUrl = '';
                                localStorage.setItem(`nrj-chat-config-${currentPersona.id}`, JSON.stringify(charConfig));
                                
                                renderBgPreview();
                                applyChatWallpaper(currentPersona.id);
                            } catch(err) {
                                console.error('保存壁纸失败', err);
                                if (window._currentChatOSAlert) window._currentChatOSAlert('保存失败', '壁纸保存失败，可能是图片过大。');
                            }
                        }
                        e.target.value = '';
                    };
                }

                if (btnClearBg) {
                    btnClearBg.onclick = async () => {
                        charConfig.chatBgType = 'none';
                        charConfig.chatBgUrl = '';
                        localStorage.setItem(`nrj-chat-config-${currentPersona.id}`, JSON.stringify(charConfig));
                        
                        if (window.ImageStorageManager) {
                            try {
                                await window.ImageStorageManager.deleteFromIndexedDB(`chat-bg-${currentPersona.id}`);
                            } catch(e) {}
                        }
                        
                        renderBgPreview();
                        applyChatWallpaper(currentPersona.id);
                    };
                }

                const toggleCharTimezone = container.querySelector('#cs-char-timezone-toggle');
                const charTimezoneContainer = container.querySelector('#cs-char-timezone-container');
                const inputCharTimezoneVal = container.querySelector('#cs-char-timezone');
                const triggerCsCharTimezone = container.querySelector('#cs-char-timezone-trigger');
                const textCsCharTimezone = container.querySelector('#cs-char-timezone-text');

                if (toggleCharTimezone) {
                    toggleCharTimezone.checked = !!charConfig.useCharTimezone;
                    charTimezoneContainer.style.display = toggleCharTimezone.checked ? 'block' : 'none';
                    
                    const tzCode = charConfig.charTimezone || charData.timezone || '';
                    if (inputCharTimezoneVal) inputCharTimezoneVal.value = tzCode;
                    
                    if (textCsCharTimezone) {
                        if (tzCode) {
                            textCsCharTimezone.textContent = getTimezoneNameByCode(tzCode);
                            textCsCharTimezone.style.color = 'var(--text-color)';
                        } else {
                            textCsCharTimezone.textContent = '跟随本地时间 (默认)';
                            textCsCharTimezone.style.color = 'var(--text-secondary)';
                        }
                    }

                    if (triggerCsCharTimezone) {
                        triggerCsCharTimezone.onclick = () => {
                            showTimezonePopup((selectedZone) => {
                                inputCharTimezoneVal.value = selectedZone.code;
                                if (selectedZone.code) {
                                    textCsCharTimezone.textContent = selectedZone.name;
                                    textCsCharTimezone.style.color = 'var(--text-color)';
                                } else {
                                    textCsCharTimezone.textContent = '跟随本地时间 (默认)';
                                    textCsCharTimezone.style.color = 'var(--text-secondary)';
                                }
                                charConfig.charTimezone = selectedZone.code;
                                localStorage.setItem(`nrj-chat-config-${currentPersona.id}`, JSON.stringify(charConfig));
                            });
                        };
                    }

                    toggleCharTimezone.onchange = (e) => {
                        charTimezoneContainer.style.display = e.target.checked ? 'block' : 'none';
                        charConfig.useCharTimezone = e.target.checked;
                        localStorage.setItem(`nrj-chat-config-${currentPersona.id}`, JSON.stringify(charConfig));
                    };
                }

                const toggleMultiMsg = container.querySelector('#cs-char-multi-msg-toggle');
                const multiMsgOptions = container.querySelector('#cs-char-multi-msg-options');
                const inputMultiMin = container.querySelector('#cs-char-multi-msg-min');
                const inputMultiMax = container.querySelector('#cs-char-multi-msg-max');
                const inputMultiDelay = container.querySelector('#cs-char-multi-msg-delay');
                const btnResetMultiDelay = container.querySelector('#btn-reset-multi-msg-delay');

                if (toggleMultiMsg) {
                    toggleMultiMsg.checked = !!charConfig.multiMsgEnabled;
                    multiMsgOptions.style.display = toggleMultiMsg.checked ? 'flex' : 'none';
                    
                    inputMultiMin.value = charConfig.multiMsgMin || 1;
                    inputMultiMax.value = charConfig.multiMsgMax || 3;
                    if (inputMultiDelay) inputMultiDelay.value = charConfig.multiMsgDelay !== undefined ? charConfig.multiMsgDelay : 2;

                    toggleMultiMsg.onchange = (e) => {
                        multiMsgOptions.style.display = e.target.checked ? 'flex' : 'none';
                        charConfig.multiMsgEnabled = e.target.checked;
                        localStorage.setItem(`nrj-chat-config-${currentPersona.id}`, JSON.stringify(charConfig));
                    };

                    inputMultiMin.onchange = (e) => {
                        charConfig.multiMsgMin = parseInt(e.target.value, 10) || 1;
                        localStorage.setItem(`nrj-chat-config-${currentPersona.id}`, JSON.stringify(charConfig));
                    };
                    
                    inputMultiMax.onchange = (e) => {
                        charConfig.multiMsgMax = parseInt(e.target.value, 10) || 3;
                        localStorage.setItem(`nrj-chat-config-${currentPersona.id}`, JSON.stringify(charConfig));
                    };

                    if (inputMultiDelay) {
                        inputMultiDelay.onchange = (e) => {
                            let val = parseFloat(e.target.value);
                            if (isNaN(val) || val < 0) val = 0;
                            charConfig.multiMsgDelay = val;
                            localStorage.setItem(`nrj-chat-config-${currentPersona.id}`, JSON.stringify(charConfig));
                        };
                    }

                    if (btnResetMultiDelay) {
                        btnResetMultiDelay.onclick = () => {
                            if (inputMultiDelay) inputMultiDelay.value = 2;
                            charConfig.multiMsgDelay = 2;
                            localStorage.setItem(`nrj-chat-config-${currentPersona.id}`, JSON.stringify(charConfig));
                        };
                    }
                }

                // 填充用户卡片
                const personas = loadPersonas();
                
                const renderUserCard = async (userId) => {
                    const usr = personas.find(p => p.id === userId) || { realname: '我', nickname: '我', bio: '' };
                    let userAvatarUrl = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                    if (userId && window.ImageStorageManager) {
                        try {
                            const url = await window.ImageStorageManager.loadFromIndexedDB(`persona-avatar-${userId}`);
                            if (url && url !== 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7') {
                                userAvatarUrl = url;
                            }
                        } catch(e) {}
                    }
                    container.querySelector('#cs-user-avatar').src = userAvatarUrl;
                    container.querySelector('#cs-user-name').value = usr.nickname || usr.realname || '';
                    container.querySelector('#cs-user-realname').value = usr.realname || '';
                    container.querySelector('#cs-user-bio').value = usr.bio || '';
                };

                let activeUserId = charConfig.userPersonaId || getActivePersonaId();
                renderUserCard(activeUserId);

                const toggleUserTimezone = container.querySelector('#cs-user-timezone-toggle');
                const userTimezoneContainer = container.querySelector('#cs-user-timezone-container');
                const inputUserTimezoneVal = container.querySelector('#cs-user-timezone');
                const triggerCsUserTimezone = container.querySelector('#cs-user-timezone-trigger');
                const textCsUserTimezone = container.querySelector('#cs-user-timezone-text');

                if (toggleUserTimezone) {
                    toggleUserTimezone.checked = !!charConfig.useUserTimezone;
                    userTimezoneContainer.style.display = toggleUserTimezone.checked ? 'block' : 'none';
                    
                    const uTzCode = charConfig.userTimezone || '';
                    if (inputUserTimezoneVal) inputUserTimezoneVal.value = uTzCode;
                    
                    if (textCsUserTimezone) {
                        if (uTzCode) {
                            textCsUserTimezone.textContent = getTimezoneNameByCode(uTzCode);
                            textCsUserTimezone.style.color = 'var(--text-color)';
                        } else {
                            textCsUserTimezone.textContent = '跟随本地时间 (默认)';
                            textCsUserTimezone.style.color = 'var(--text-secondary)';
                        }
                    }

                    if (triggerCsUserTimezone) {
                        triggerCsUserTimezone.onclick = () => {
                            showTimezonePopup((selectedZone) => {
                                inputUserTimezoneVal.value = selectedZone.code;
                                if (selectedZone.code) {
                                    textCsUserTimezone.textContent = selectedZone.name;
                                    textCsUserTimezone.style.color = 'var(--text-color)';
                                } else {
                                    textCsUserTimezone.textContent = '跟随本地时间 (默认)';
                                    textCsUserTimezone.style.color = 'var(--text-secondary)';
                                }
                                charConfig.userTimezone = selectedZone.code;
                                localStorage.setItem(`nrj-chat-config-${currentPersona.id}`, JSON.stringify(charConfig));
                            });
                        };
                    }

                    toggleUserTimezone.onchange = (e) => {
                        userTimezoneContainer.style.display = e.target.checked ? 'block' : 'none';
                        charConfig.useUserTimezone = e.target.checked;
                        localStorage.setItem(`nrj-chat-config-${currentPersona.id}`, JSON.stringify(charConfig));
                    };
                }

                const upInput = container.querySelector('#cs-user-persona-select');
                const upTrigger = container.querySelector('#cs-user-persona-dropdown-trigger');
                const upSelectedText = container.querySelector('#cs-user-persona-selected-text');
                const upOptionsPanel = container.querySelector('#cs-user-persona-options-panel');
                const upCaret = container.querySelector('#cs-user-persona-caret');

                const allUserOptions = [
                    { id: '', text: '默认全局身份' },
                    ...personas.map(p => ({
                        id: p.id,
                        text: p.nickname || p.realname || '未命名人设'
                    }))
                ];

                upOptionsPanel.innerHTML = '';
                allUserOptions.forEach(optData => {
                    const optEl = document.createElement('div');
                    optEl.style.cssText = `padding: 10px 12px; border-radius: 8px; cursor: pointer; transition: background 0.2s; color: var(--text-color); margin-bottom: 2px;`;
                    optEl.textContent = optData.text;
                    optEl.addEventListener('mouseenter', () => { optEl.style.backgroundColor = 'var(--hover-bg)'; });
                    optEl.addEventListener('mouseleave', () => { optEl.style.backgroundColor = 'transparent'; });
                    optEl.addEventListener('click', (e) => {
                        e.stopPropagation();
                        upSelectedText.textContent = optData.text;
                        upInput.value = optData.id;
                        upOptionsPanel.style.display = 'none';
                        upCaret.style.transform = 'rotate(0deg)';
                        upTrigger.style.borderColor = 'var(--border-color)';
                        
                        let cc = JSON.parse(localStorage.getItem(`nrj-chat-config-${currentPersona.id}`) || '{}');
                        cc.userPersonaId = optData.id;
                        localStorage.setItem(`nrj-chat-config-${currentPersona.id}`, JSON.stringify(cc));
                        
                        renderUserCard(optData.id || getActivePersonaId());
                    });
                    upOptionsPanel.appendChild(optEl);
                });

                if (charConfig.userPersonaId) {
                    const found = allUserOptions.find(o => o.id === charConfig.userPersonaId);
                    if (found) {
                        upSelectedText.textContent = found.text;
                        upInput.value = found.id;
                    } else {
                        upSelectedText.textContent = '默认全局身份';
                        upInput.value = '';
                    }
                } else {
                    upSelectedText.textContent = '默认全局身份';
                    upInput.value = '';
                }

                upTrigger.onclick = (e) => {
                    e.stopPropagation();
                    const isPanelOpen = upOptionsPanel.style.display === 'block';
                    if (isPanelOpen) {
                        upOptionsPanel.style.display = 'none';
                        upCaret.style.transform = 'rotate(0deg)';
                        upTrigger.style.borderColor = 'var(--border-color)';
                    } else {
                        upOptionsPanel.style.display = 'block';
                        upCaret.style.transform = 'rotate(180deg)';
                        upTrigger.style.borderColor = 'var(--accent-color)';
                    }
                };

                document.addEventListener('click', (e) => {
                    if (upOptionsPanel && upOptionsPanel.style.display === 'block' && !upOptionsPanel.contains(e.target) && e.target !== upTrigger) {
                        upOptionsPanel.style.display = 'none';
                        if(upCaret) upCaret.style.transform = 'rotate(0deg)';
                        if(upTrigger) upTrigger.style.borderColor = 'var(--border-color)';
                    }
                });

                const shortTermInput = container.querySelector('#cs-short-term-memory');

                const autoSummaryInput = container.querySelector('#cs-auto-summary-threshold');
                if (autoSummaryInput) {
                    autoSummaryInput.value = charConfig.autoSummaryThreshold || 0;
                    autoSummaryInput.onchange = (e) => {
                        let val = parseInt(e.target.value, 10);
                        if (isNaN(val) || val < 0) val = 0;
                        charConfig.autoSummaryThreshold = val;
                        localStorage.setItem(`nrj-chat-config-${currentPersona.id}`, JSON.stringify(charConfig));
                    };
                }

                const wbInput = container.querySelector('#cs-worldbook-select');
                const wbTrigger = container.querySelector('#cs-worldbook-dropdown-trigger');
                const wbSelectedText = container.querySelector('#cs-worldbook-selected-text');
                const wbOptionsPanel = container.querySelector('#cs-worldbook-options-panel');
                const wbCaret = container.querySelector('#cs-worldbook-caret');
                
                shortTermInput.value = charConfig.shortTermMemory || 20;

                // 动态加载世界书列表数据
                let worldbooks = [];
                try {
                    worldbooks = JSON.parse(localStorage.getItem('nrj-worldbooks')) || [];
                } catch(e) {}
                
                // 构建所有可用选项的数组
                const allOptions = [
                    { id: '', text: '不绑定世界书' },
                    ...worldbooks.map(wb => ({
                        id: wb.id,
                        text: `${wb.name} (${wb.entries ? wb.entries.length : 0}条目)`
                    }))
                ];

                // 初始填充选项 UI
                wbOptionsPanel.innerHTML = '';
                allOptions.forEach(optData => {
                    const optEl = document.createElement('div');
                    optEl.style.cssText = `padding: 10px 12px; border-radius: 8px; cursor: pointer; transition: background 0.2s; color: var(--text-color); margin-bottom: 2px;`;
                    optEl.textContent = optData.text;
                    
                    // Hover 事件
                    optEl.addEventListener('mouseenter', () => { optEl.style.backgroundColor = 'var(--hover-bg)'; });
                    optEl.addEventListener('mouseleave', () => { optEl.style.backgroundColor = 'transparent'; });
                    
                    // Click 事件 - 选择选项
                    optEl.addEventListener('click', (e) => {
                        e.stopPropagation();
                        // 1. 更新UI显示
                        wbSelectedText.textContent = optData.text;
                        // 2. 更新真实数据
                        wbInput.value = optData.id;
                        // 3. 闭合面板
                        wbOptionsPanel.style.display = 'none';
                        wbCaret.style.transform = 'rotate(0deg)';
                        wbTrigger.style.borderColor = 'var(--border-color)';
                        // 4. 保存到本地配置
                        charConfig.worldbookId = optData.id;
                        localStorage.setItem(`nrj-chat-config-${currentPersona.id}`, JSON.stringify(charConfig));
                        updateTokenStats();
                    });
                    
                    wbOptionsPanel.appendChild(optEl);
                });

                // 初始化当前选择状态
                if (charConfig.worldbookId) {
                    const found = allOptions.find(o => o.id === charConfig.worldbookId);
                    if (found) {
                        wbSelectedText.textContent = found.text;
                        wbInput.value = found.id;
                    }
                } else {
                    wbSelectedText.textContent = '不绑定世界书';
                    wbInput.value = '';
                }

                // 点击触发器展开/收起面板
                wbTrigger.onclick = (e) => {
                    e.stopPropagation(); // 阻止冒泡，防止被下方全局document点击事件关掉
                    const isPanelOpen = wbOptionsPanel.style.display === 'block';
                    if (isPanelOpen) {
                        wbOptionsPanel.style.display = 'none';
                        wbCaret.style.transform = 'rotate(0deg)';
                        wbTrigger.style.borderColor = 'var(--border-color)';
                    } else {
                        wbOptionsPanel.style.display = 'block';
                        wbCaret.style.transform = 'rotate(180deg)';
                        wbTrigger.style.borderColor = 'var(--accent-color)'; // 展开时边框高亮
                    }
                };

                // 点击页面空白处关闭下拉面板
                document.addEventListener('click', (e) => {
                    if (wbOptionsPanel && wbOptionsPanel.style.display === 'block' && !wbOptionsPanel.contains(e.target) && e.target !== wbTrigger) {
                        wbOptionsPanel.style.display = 'none';
                        if(wbCaret) wbCaret.style.transform = 'rotate(0deg)';
                        if(wbTrigger) wbTrigger.style.borderColor = 'var(--border-color)';
                    }
                });

                // Token 预估折叠面板逻辑
                const tokenStatsTrigger = container.querySelector('#cs-token-stats-trigger');
                const tokenStatsPanel = container.querySelector('#cs-token-stats-panel');
                const tokenStatsCaret = container.querySelector('#cs-token-stats-caret');

                if (tokenStatsTrigger && tokenStatsPanel && tokenStatsCaret) {
                    tokenStatsTrigger.addEventListener('click', () => {
                        const isExpanded = tokenStatsPanel.style.display !== 'none';
                        if (isExpanded) {
                            tokenStatsPanel.style.display = 'none';
                            tokenStatsCaret.style.transform = 'rotate(-90deg)';
                        } else {
                            tokenStatsPanel.style.display = 'block';
                            tokenStatsCaret.style.transform = 'rotate(0deg)';
                        }
                    });
                }

                // 监听输入保存
                shortTermInput.onchange = (e) => {
                    let val = parseInt(e.target.value, 10);
                    if (isNaN(val) || val < 1) val = 20;
                    charConfig.shortTermMemory = val;
                    localStorage.setItem(`nrj-chat-config-${currentPersona.id}`, JSON.stringify(charConfig));
                    updateTokenStats();
                };

                // 美化 - 引用样式
                const qsInput = container.querySelector('#cs-quote-style-select');
                const qsTrigger = container.querySelector('#cs-quote-style-dropdown-trigger');
                const qsSelectedText = container.querySelector('#cs-quote-style-selected-text');
                const qsOptionsPanel = container.querySelector('#cs-quote-style-options-panel');
                const qsCaret = container.querySelector('#cs-quote-style-caret');

                const qsOptions = [
                    { id: 'inside', text: '在气泡内 (微信风格)' },
                    { id: 'outside', text: '在气泡外 (独立区块)' }
                ];

                if (qsOptionsPanel) {
                    qsOptionsPanel.innerHTML = '';
                    qsOptions.forEach(optData => {
                        const optEl = document.createElement('div');
                        optEl.style.cssText = `padding: 10px 12px; border-radius: 8px; cursor: pointer; transition: background 0.2s; color: var(--text-color); margin-bottom: 2px;`;
                        optEl.textContent = optData.text;
                        optEl.addEventListener('mouseenter', () => { optEl.style.backgroundColor = 'var(--hover-bg)'; });
                        optEl.addEventListener('mouseleave', () => { optEl.style.backgroundColor = 'transparent'; });
                        optEl.addEventListener('click', (e) => {
                            e.stopPropagation();
                            if (qsSelectedText) qsSelectedText.textContent = optData.text;
                            if (qsInput) qsInput.value = optData.id;
                            qsOptionsPanel.style.display = 'none';
                            if (qsCaret) qsCaret.style.transform = 'rotate(0deg)';
                            if (qsTrigger) qsTrigger.style.borderColor = 'var(--border-color)';
                            
                            charConfig.quoteStyle = optData.id;
                            localStorage.setItem(`nrj-chat-config-${currentPersona.id}`, JSON.stringify(charConfig));
                            
                            if (convView && convView.classList.contains('active')) {
                                openConversation(currentPersona);
                            }
                        });
                        qsOptionsPanel.appendChild(optEl);
                    });
                    
                    let currentQs = charConfig.quoteStyle || 'inside';
                    const foundQs = qsOptions.find(o => o.id === currentQs);
                    if (foundQs) {
                        if (qsSelectedText) qsSelectedText.textContent = foundQs.text;
                        if (qsInput) qsInput.value = foundQs.id;
                    }
                    
                    if (qsTrigger) {
                        qsTrigger.onclick = (e) => {
                            e.stopPropagation();
                            const isPanelOpen = qsOptionsPanel.style.display === 'block';
                            if (isPanelOpen) {
                                qsOptionsPanel.style.display = 'none';
                                if (qsCaret) qsCaret.style.transform = 'rotate(0deg)';
                                qsTrigger.style.borderColor = 'var(--border-color)';
                            } else {
                                qsOptionsPanel.style.display = 'block';
                                if (qsCaret) qsCaret.style.transform = 'rotate(180deg)';
                                qsTrigger.style.borderColor = 'var(--accent-color)';
                            }
                        };
                    }
                    
                    document.addEventListener('click', (e) => {
                        if (qsOptionsPanel && qsOptionsPanel.style.display === 'block' && !qsOptionsPanel.contains(e.target) && e.target !== qsTrigger) {
                            qsOptionsPanel.style.display = 'none';
                            if (qsCaret) qsCaret.style.transform = 'rotate(0deg)';
                            if (qsTrigger) qsTrigger.style.borderColor = 'var(--border-color)';
                        }
                    });
                }

                // 美化 - 气泡样式
                const adInput = container.querySelector('#cs-avatar-display-select');
                const adTrigger = container.querySelector('#cs-avatar-display-dropdown-trigger');
                const adSelectedText = container.querySelector('#cs-avatar-display-selected-text');
                const adOptionsPanel = container.querySelector('#cs-avatar-display-options-panel');
                const adCaret = container.querySelector('#cs-avatar-display-caret');
                
                const adOptions = [
                    { id: 'both', text: '同时显示' },
                    { id: 'hide_me', text: '隐藏用户头像' },
                    { id: 'hide_them', text: '隐藏角色头像' },
                    { id: 'hide_both', text: '隐藏双方头像' }
                ];

                if (adOptionsPanel) {
                    adOptionsPanel.innerHTML = '';
                    adOptions.forEach(optData => {
                        const optEl = document.createElement('div');
                        optEl.style.cssText = `padding: 10px 12px; border-radius: 8px; cursor: pointer; transition: background 0.2s; color: var(--text-color); margin-bottom: 2px;`;
                        optEl.textContent = optData.text;
                        optEl.addEventListener('mouseenter', () => { optEl.style.backgroundColor = 'var(--hover-bg)'; });
                        optEl.addEventListener('mouseleave', () => { optEl.style.backgroundColor = 'transparent'; });
                        optEl.addEventListener('click', (e) => {
                            e.stopPropagation();
                            if (adSelectedText) adSelectedText.textContent = optData.text;
                            if (adInput) adInput.value = optData.id;
                            adOptionsPanel.style.display = 'none';
                            if (adCaret) adCaret.style.transform = 'rotate(0deg)';
                            if (adTrigger) adTrigger.style.borderColor = 'var(--border-color)';
                            
                            charConfig.avatarDisplay = optData.id;
                            localStorage.setItem(`nrj-chat-config-${currentPersona.id}`, JSON.stringify(charConfig));
                            
                            if (convView && convView.classList.contains('active')) {
                                openConversation(currentPersona);
                            }
                        });
                        adOptionsPanel.appendChild(optEl);
                    });
                    
                    let currentAd = charConfig.avatarDisplay || 'hide_me';
                    const foundAd = adOptions.find(o => o.id === currentAd);
                    if (foundAd) {
                        if (adSelectedText) adSelectedText.textContent = foundAd.text;
                        if (adInput) adInput.value = foundAd.id;
                    }
                    
                    if (adTrigger) {
                        adTrigger.onclick = (e) => {
                            e.stopPropagation();
                            const isPanelOpen = adOptionsPanel.style.display === 'block';
                            if (isPanelOpen) {
                                adOptionsPanel.style.display = 'none';
                                if (adCaret) adCaret.style.transform = 'rotate(0deg)';
                                adTrigger.style.borderColor = 'var(--border-color)';
                            } else {
                                adOptionsPanel.style.display = 'block';
                                if (adCaret) adCaret.style.transform = 'rotate(180deg)';
                                adTrigger.style.borderColor = 'var(--accent-color)';
                            }
                        };
                    }
                    
                    document.addEventListener('click', (e) => {
                        if (adOptionsPanel && adOptionsPanel.style.display === 'block' && !adOptionsPanel.contains(e.target) && e.target !== adTrigger) {
                            adOptionsPanel.style.display = 'none';
                            if (adCaret) adCaret.style.transform = 'rotate(0deg)';
                            if (adTrigger) adTrigger.style.borderColor = 'var(--border-color)';
                        }
                    });
                }

                // 美化 - 气泡样式
                const bsInput = container.querySelector('#cs-bubble-style-select');
                const bsTrigger = container.querySelector('#cs-bubble-style-dropdown-trigger');
                const bsSelectedText = container.querySelector('#cs-bubble-style-selected-text');
                const bsOptionsPanel = container.querySelector('#cs-bubble-style-options-panel');
                const bsCaret = container.querySelector('#cs-bubble-style-caret');
                
                const bsOptions = [
                    { id: 'default', text: '默认极简' },
                    { id: 'ios', text: 'iMessage 风格' },
                    { id: 'wechat', text: '经典微信风' },
                    { id: 'square', text: '硬朗方块' }
                ];

                const bsCssTemplates = {
                    'default': `/* 默认极简风格基础代码，发给AI时连此注释一起复制 */\n/* 请AI在此基础上修改，不要改变选择器结构 */\n\n/* 对方（左边）的气泡 */\n.chat-bubble-row.them .chat-bubble {\n    border-radius: 22px;\n}\n\n/* 我方（右边）的气泡 */\n.chat-bubble-row.me .chat-bubble {\n    border-radius: 22px;\n}`,
                    'ios': `/* iMessage风格基础代码，发给AI时连此注释一起复制 */\n/* 请AI在此基础上修改，不要改变选择器结构 */\n\n/* 对方（左边）的气泡 */\n.chat-bubble-row.them .chat-bubble.bubble-style-ios {\n    border-radius: 20px;\n    border-bottom-left-radius: 4px;\n}\n\n/* 我方（右边）的气泡 */\n.chat-bubble-row.me .chat-bubble.bubble-style-ios {\n    border-radius: 20px;\n    border-bottom-right-radius: 4px;\n}`,
                    'wechat': `/* 微信风格基础代码，发给AI时连此注释一起复制 */\n/* 请AI在此基础上修改，不要改变选择器结构 */\n\n/* 对方（左边）的气泡 */\n.chat-bubble-row.them .chat-bubble.bubble-style-wechat {\n    border-radius: 8px;\n}\n.chat-bubble-row.them .chat-bubble.bubble-style-wechat::before {\n    content: '';\n    position: absolute;\n    left: -6px;\n    top: 14px;\n    border-top: 6px solid transparent;\n    border-bottom: 6px solid transparent;\n    border-right: 6px solid var(--chat-them-bg, #EFEFEF);\n}\n\n/* 我方（右边）的气泡 */\n.chat-bubble-row.me .chat-bubble.bubble-style-wechat {\n    border-radius: 8px;\n}\n.chat-bubble-row.me .chat-bubble.bubble-style-wechat::before {\n    content: '';\n    position: absolute;\n    right: -6px;\n    top: 14px;\n    border-top: 6px solid transparent;\n    border-bottom: 6px solid transparent;\n    border-left: 6px solid var(--chat-me-bg, #111111);\n}`,
                    'square': `/* 硬朗方块风格基础代码，发给AI时连此注释一起复制 */\n/* 请AI在此基础上修改，不要改变选择器结构 */\n\n/* 对方（左边）的气泡 */\n.chat-bubble-row.them .chat-bubble.bubble-style-square {\n    border-radius: 4px;\n}\n\n/* 我方（右边）的气泡 */\n.chat-bubble-row.me .chat-bubble.bubble-style-square {\n    border-radius: 4px;\n}`
                };

                if (bsOptionsPanel) {
                    bsOptionsPanel.innerHTML = '';
                    bsOptions.forEach(optData => {
                        const optEl = document.createElement('div');
                        optEl.style.cssText = `padding: 10px 12px; border-radius: 8px; cursor: pointer; transition: background 0.2s; color: var(--text-color); margin-bottom: 2px;`;
                        optEl.textContent = optData.text;
                        optEl.addEventListener('mouseenter', () => { optEl.style.backgroundColor = 'var(--hover-bg)'; });
                        optEl.addEventListener('mouseleave', () => { optEl.style.backgroundColor = 'transparent'; });
                        optEl.addEventListener('click', (e) => {
                            e.stopPropagation();
                            if (bsSelectedText) bsSelectedText.textContent = optData.text;
                            if (bsInput) bsInput.value = optData.id;
                            bsOptionsPanel.style.display = 'none';
                            if (bsCaret) bsCaret.style.transform = 'rotate(0deg)';
                            if (bsTrigger) bsTrigger.style.borderColor = 'var(--border-color)';
                            
                            charConfig.bubbleStyle = optData.id;
                            
                            const inputCustomCss = container.querySelector('#cs-bubble-custom-css');
                            if (inputCustomCss && bsCssTemplates[optData.id]) {
                                inputCustomCss.value = bsCssTemplates[optData.id];
                                charConfig.customBubbleCss = bsCssTemplates[optData.id];
                                applyCustomCss(bsCssTemplates[optData.id]);
                            }
                            
                            localStorage.setItem(`nrj-chat-config-${currentPersona.id}`, JSON.stringify(charConfig));
                            
                            // 重新渲染聊天记录
                            if (convView && convView.classList.contains('active')) {
                                openConversation(currentPersona);
                            }
                        });
                        bsOptionsPanel.appendChild(optEl);
                    });
                    
                    let currentBs = charConfig.bubbleStyle || 'default';
                    const foundBs = bsOptions.find(o => o.id === currentBs);
                    if (foundBs) {
                        if (bsSelectedText) bsSelectedText.textContent = foundBs.text;
                        if (bsInput) bsInput.value = foundBs.id;
                    }
                    
                    if (bsTrigger) {
                        bsTrigger.onclick = (e) => {
                            e.stopPropagation();
                            const isPanelOpen = bsOptionsPanel.style.display === 'block';
                            if (isPanelOpen) {
                                bsOptionsPanel.style.display = 'none';
                                if (bsCaret) bsCaret.style.transform = 'rotate(0deg)';
                                bsTrigger.style.borderColor = 'var(--border-color)';
                            } else {
                                bsOptionsPanel.style.display = 'block';
                                if (bsCaret) bsCaret.style.transform = 'rotate(180deg)';
                                bsTrigger.style.borderColor = 'var(--accent-color)';
                            }
                        };
                    }
                    
                    document.addEventListener('click', (e) => {
                        if (bsOptionsPanel && bsOptionsPanel.style.display === 'block' && !bsOptionsPanel.contains(e.target) && e.target !== bsTrigger) {
                            bsOptionsPanel.style.display = 'none';
                            if (bsCaret) bsCaret.style.transform = 'rotate(0deg)';
                            if (bsTrigger) bsTrigger.style.borderColor = 'var(--border-color)';
                        }
                    });
                }

                // 美化 - 颜色自定义与预设
                const inputThemBg = container.querySelector('#cs-bubble-them-bg');
                const inputThemText = container.querySelector('#cs-bubble-them-text');
                const inputMeBg = container.querySelector('#cs-bubble-me-bg');
                const inputMeText = container.querySelector('#cs-bubble-me-text');
                const presetContainer = container.querySelector('#cs-bubble-presets');
                const inputCustomCss = container.querySelector('#cs-bubble-custom-css');
                const btnSaveCssPreset = container.querySelector('#btn-save-css-preset');
                const btnImportCss = container.querySelector('#btn-import-bubble-css');
                const btnExportCss = container.querySelector('#btn-export-bubble-css');
                const btnResetCss = container.querySelector('#btn-reset-bubble-css');
                const fileImportCss = container.querySelector('#input-import-bubble-css');

                if (btnSaveCssPreset) {
                    btnSaveCssPreset.onclick = () => {
                        showChatPrompt('新预设名称', '自定义配色与CSS', (name) => {
                            if (name) {
                                let currentCustoms = JSON.parse(localStorage.getItem('nrj-chat-custom-bubble-presets') || '[]');
                                currentCustoms.push({
                                    id: 'preset_' + Date.now(),
                                    name: name,
                                    themBg: inputThemBg.value,
                                    themText: inputThemText.value,
                                    meBg: inputMeBg.value,
                                    meText: inputMeText.value,
                                    customCss: inputCustomCss ? inputCustomCss.value : ''
                                });
                                localStorage.setItem('nrj-chat-custom-bubble-presets', JSON.stringify(currentCustoms));
                                if (typeof renderBubblePresets === 'function') {
                                    renderBubblePresets();
                                }
                                if (window._currentChatOSAlert) {
                                    window._currentChatOSAlert('保存成功', '已将当前自定义CSS与颜色保存为预设主题！');
                                }
                            }
                        });
                    };
                }

                if (inputCustomCss) {
                    inputCustomCss.value = charConfig.customBubbleCss || '';
                    inputCustomCss.oninput = (e) => {
                        charConfig.customBubbleCss = e.target.value;
                        localStorage.setItem(`nrj-chat-config-${currentPersona.id}`, JSON.stringify(charConfig));
                        applyCustomCss(charConfig.customBubbleCss);
                    };
                }

                if (btnResetCss) {
                    btnResetCss.onclick = () => {
                        const currentStyle = charConfig.bubbleStyle || 'default';
                        let baseCss = '';
                        if (typeof bsCssTemplates !== 'undefined' && bsCssTemplates[currentStyle]) {
                            baseCss = bsCssTemplates[currentStyle];
                        }
                        if (inputCustomCss) inputCustomCss.value = baseCss;
                        charConfig.customBubbleCss = baseCss;
                        localStorage.setItem(`nrj-chat-config-${currentPersona.id}`, JSON.stringify(charConfig));
                        applyCustomCss(baseCss);
                    };
                }

                if (btnExportCss) {
                    btnExportCss.onclick = () => {
                        const cssContent = inputCustomCss ? inputCustomCss.value : '';
                        if (!cssContent) {
                            if (window._currentChatOSAlert) window._currentChatOSAlert('提示', '当前没有自定义 CSS 代码可导出。');
                            return;
                        }
                        const blob = new Blob([cssContent], { type: 'text/css' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `bubble-style-${currentPersona.id}.css`;
                        a.click();
                        URL.revokeObjectURL(url);
                    };
                }

                if (btnImportCss && fileImportCss) {
                    btnImportCss.onclick = () => {
                        fileImportCss.click();
                    };
                    fileImportCss.onchange = (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                            const cssContent = ev.target.result;
                            if (inputCustomCss) inputCustomCss.value = cssContent;
                            charConfig.customBubbleCss = cssContent;
                            localStorage.setItem(`nrj-chat-config-${currentPersona.id}`, JSON.stringify(charConfig));
                            applyCustomCss(cssContent);
                        };
                        reader.readAsText(file);
                        e.target.value = '';
                    };
                }

                const colorPresets = [
                    { name: '极简黑白', themBg: '#EFEFEF', themText: '#111111', meBg: '#111111', meText: '#ffffff' },
                    { name: 'iMessage蓝', themBg: '#E5E5EA', themText: '#000000', meBg: '#007AFF', meText: '#ffffff' },
                    { name: '微信绿', themBg: '#FFFFFF', themText: '#111111', meBg: '#95EC69', meText: '#111111' },
                    { name: '暗夜紫', themBg: '#2C2C2E', themText: '#FFFFFF', meBg: '#5E5CE6', meText: '#ffffff' },
                    { name: '猛男粉', themBg: '#FFE4E1', themText: '#4A4A4A', meBg: '#FF69B4', meText: '#ffffff' },
                    { name: '复古灰', themBg: '#D1D1D6', themText: '#1C1C1E', meBg: '#3A3A3C', meText: '#ffffff' },
                ];

                const renderBubblePresets = () => {
                    if (!presetContainer) return;
                    presetContainer.innerHTML = '';
                    
                    let customPresets = [];
                    try {
                        customPresets = JSON.parse(localStorage.getItem('nrj-chat-custom-bubble-presets') || '[]');
                    } catch(e) {}
                    
                    const allPresets = [...colorPresets, ...customPresets];
                    
                    allPresets.forEach((preset, index) => {
                        const dot = document.createElement('div');
                        dot.style.cssText = `
                            width: 24px; height: 24px; border-radius: 50%; cursor: pointer;
                            background: linear-gradient(135deg, ${preset.themBg} 50%, ${preset.meBg} 50%);
                            border: 1px solid var(--border-color);
                            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                        `;
                        
                        const isCustom = index >= colorPresets.length;
                        dot.title = preset.name + (isCustom ? ' (右键删除)' : '');
                        
                        dot.addEventListener('click', () => {
                            inputThemBg.value = preset.themBg;
                            inputThemText.value = preset.themText;
                            inputMeBg.value = preset.meBg;
                            inputMeText.value = preset.meText;
                            
                            charConfig.bubbleColors = {
                                themBg: preset.themBg,
                                themText: preset.themText,
                                meBg: preset.meBg,
                                meText: preset.meText
                            };

                            if (preset.customCss !== undefined) {
                                if (inputCustomCss) inputCustomCss.value = preset.customCss;
                                charConfig.customBubbleCss = preset.customCss;
                                applyCustomCss(preset.customCss);
                            } else {
                                if (inputCustomCss) inputCustomCss.value = '';
                                charConfig.customBubbleCss = '';
                                applyCustomCss('');
                            }

                            localStorage.setItem(`nrj-chat-config-${currentPersona.id}`, JSON.stringify(charConfig));
                            
                            if (convView && convView.classList.contains('active')) {
                                openConversation(currentPersona);
                            }
                        });

                        if (isCustom) {
                            dot.addEventListener('contextmenu', (e) => {
                                e.preventDefault();
                                showChatConfirm('删除预设', `确定要删除自定义预设"${preset.name}"吗？`, () => {
                                    let currentCustoms = JSON.parse(localStorage.getItem('nrj-chat-custom-bubble-presets') || '[]');
                                    currentCustoms = currentCustoms.filter(p => p.id !== preset.id);
                                    localStorage.setItem('nrj-chat-custom-bubble-presets', JSON.stringify(currentCustoms));
                                    renderBubblePresets();
                                });
                            });
                        }
                        
                        presetContainer.appendChild(dot);
                    });

                    // Add Save Custom Preset Dot
                    const addDot = document.createElement('div');
                    addDot.style.cssText = `
                        width: 24px; height: 24px; border-radius: 50%; cursor: pointer;
                        display: flex; align-items: center; justify-content: center;
                        border: 1.5px dashed #9ca3af;
                        color: #9ca3af; font-size: 14px; font-weight: bold;
                        background: transparent;
                        box-shadow: none; transition: all 0.2s;
                    `;
                    addDot.innerHTML = '<i class="ph ph-plus"></i>';
                    addDot.title = '保存当前颜色为新预设';
                    addDot.addEventListener('mouseenter', () => { addDot.style.borderColor = 'var(--text-color)'; addDot.style.color = 'var(--text-color)'; });
                    addDot.addEventListener('mouseleave', () => { addDot.style.borderColor = '#9ca3af'; addDot.style.color = '#9ca3af'; });
                    addDot.addEventListener('click', () => {
                        showChatPrompt('新预设名称', '自定义配色与CSS', (name) => {
                            if (name) {
                                let currentCustoms = JSON.parse(localStorage.getItem('nrj-chat-custom-bubble-presets') || '[]');
                                currentCustoms.push({
                                    id: 'preset_' + Date.now(),
                                    name: name,
                                    themBg: inputThemBg.value,
                                    themText: inputThemText.value,
                                    meBg: inputMeBg.value,
                                    meText: inputMeText.value,
                                    customCss: inputCustomCss ? inputCustomCss.value : ''
                                });
                                localStorage.setItem('nrj-chat-custom-bubble-presets', JSON.stringify(currentCustoms));
                                renderBubblePresets();
                            }
                        });
                    });
                    presetContainer.appendChild(addDot);
                };

                renderBubblePresets();

                if (inputThemBg) {
                    const colors = charConfig.bubbleColors || { themBg: '#EFEFEF', themText: '#111111', meBg: '#111111', meText: '#ffffff' };
                    inputThemBg.value = colors.themBg;
                    inputThemText.value = colors.themText;
                    inputMeBg.value = colors.meBg;
                    inputMeText.value = colors.meText;

                    const updateColors = () => {
                        charConfig.bubbleColors = {
                            themBg: inputThemBg.value,
                            themText: inputThemText.value,
                            meBg: inputMeBg.value,
                            meText: inputMeText.value
                        };
                        localStorage.setItem(`nrj-chat-config-${currentPersona.id}`, JSON.stringify(charConfig));
                        if (convView && convView.classList.contains('active')) {
                            openConversation(currentPersona);
                        }
                    };

                    inputThemBg.addEventListener('change', updateColors);
                    inputThemText.addEventListener('change', updateColors);
                    inputMeBg.addEventListener('change', updateColors);
                    inputMeText.addEventListener('change', updateColors);
                }

                // 美化 - 等待回复动画
                const tsInput = container.querySelector('#cs-typing-style-select');
                const tsTrigger = container.querySelector('#cs-typing-style-dropdown-trigger');
                const tsSelectedText = container.querySelector('#cs-typing-style-selected-text');
                const tsOptionsPanel = container.querySelector('#cs-typing-style-options-panel');
                const tsCaret = container.querySelector('#cs-typing-style-caret');
                
                const toggleLocalTime = container.querySelector('#cs-show-local-time-toggle');
                if (toggleLocalTime) {
                    toggleLocalTime.checked = !!charConfig.showLocalTime;
                    toggleLocalTime.onchange = (e) => {
                        charConfig.showLocalTime = e.target.checked;
                        localStorage.setItem(`nrj-chat-config-${currentPersona.id}`, JSON.stringify(charConfig));
                    };
                }

                const mtpInput = container.querySelector('#cs-msg-time-pos-select');
                const mtpTrigger = container.querySelector('#cs-msg-time-pos-dropdown-trigger');
                const mtpSelectedText = container.querySelector('#cs-msg-time-pos-selected-text');
                const mtpOptionsPanel = container.querySelector('#cs-msg-time-pos-options-panel');
                const mtpCaret = container.querySelector('#cs-msg-time-pos-caret');
                
                const mtpOptions = [
                    { id: 'none', text: '不显示' },
                    { id: 'bubble', text: '气泡下方' },
                    { id: 'avatar', text: '头像下方' }
                ];

                if (mtpOptionsPanel) {
                    mtpOptionsPanel.innerHTML = '';
                    mtpOptions.forEach(optData => {
                        const optEl = document.createElement('div');
                        optEl.style.cssText = `padding: 10px 12px; border-radius: 8px; cursor: pointer; transition: background 0.2s; color: var(--text-color); margin-bottom: 2px;`;
                        optEl.textContent = optData.text;
                        optEl.addEventListener('mouseenter', () => { optEl.style.backgroundColor = 'var(--hover-bg)'; });
                        optEl.addEventListener('mouseleave', () => { optEl.style.backgroundColor = 'transparent'; });
                        optEl.addEventListener('click', (e) => {
                            e.stopPropagation();
                            if (mtpSelectedText) mtpSelectedText.textContent = optData.text;
                            if (mtpInput) mtpInput.value = optData.id;
                            mtpOptionsPanel.style.display = 'none';
                            if (mtpCaret) mtpCaret.style.transform = 'rotate(0deg)';
                            if (mtpTrigger) mtpTrigger.style.borderColor = 'var(--border-color)';
                            
                            charConfig.msgTimePos = optData.id;
                            // 兼容旧配置清理
                            if (charConfig.showMsgTimestamp !== undefined) delete charConfig.showMsgTimestamp;
                            localStorage.setItem(`nrj-chat-config-${currentPersona.id}`, JSON.stringify(charConfig));
                            
                            if (convView && convView.classList.contains('active')) {
                                openConversation(currentPersona);
                            }
                        });
                        mtpOptionsPanel.appendChild(optEl);
                    });
                    
                    let currentMtp = charConfig.msgTimePos;
                    if (!currentMtp) {
                        currentMtp = charConfig.showMsgTimestamp ? 'bubble' : 'none';
                    }
                    const foundMtp = mtpOptions.find(o => o.id === currentMtp);
                    if (foundMtp) {
                        if (mtpSelectedText) mtpSelectedText.textContent = foundMtp.text;
                        if (mtpInput) mtpInput.value = foundMtp.id;
                    }
                    
                    if (mtpTrigger) {
                        mtpTrigger.onclick = (e) => {
                            e.stopPropagation();
                            const isPanelOpen = mtpOptionsPanel.style.display === 'block';
                            if (isPanelOpen) {
                                mtpOptionsPanel.style.display = 'none';
                                if (mtpCaret) mtpCaret.style.transform = 'rotate(0deg)';
                                mtpTrigger.style.borderColor = 'var(--border-color)';
                            } else {
                                mtpOptionsPanel.style.display = 'block';
                                if (mtpCaret) mtpCaret.style.transform = 'rotate(180deg)';
                                mtpTrigger.style.borderColor = 'var(--accent-color)';
                            }
                        };
                    }
                    
                    document.addEventListener('click', (e) => {
                        if (mtpOptionsPanel && mtpOptionsPanel.style.display === 'block' && !mtpOptionsPanel.contains(e.target) && e.target !== mtpTrigger) {
                            mtpOptionsPanel.style.display = 'none';
                            if (mtpCaret) mtpCaret.style.transform = 'rotate(0deg)';
                            if (mtpTrigger) mtpTrigger.style.borderColor = 'var(--border-color)';
                        }
                    });
                }

                const mtfInput = container.querySelector('#cs-msg-time-format-select');
                const mtfTrigger = container.querySelector('#cs-msg-time-format-dropdown-trigger');
                const mtfSelectedText = container.querySelector('#cs-msg-time-format-selected-text');
                const mtfOptionsPanel = container.querySelector('#cs-msg-time-format-options-panel');
                const mtfCaret = container.querySelector('#cs-msg-time-format-caret');
                
                const mtfOptions = [
                    { id: 'hm', text: '时:分 (HH:mm)' },
                    { id: 'hms', text: '时:分:秒 (HH:mm:ss)' },
                    { id: 'custom', text: '自定义格式' }
                ];
                
                const mtfCustomContainer = container.querySelector('#cs-msg-time-custom-container');
                const mtfCustomInput = container.querySelector('#cs-msg-time-custom-input');

                if (mtfOptionsPanel) {
                    mtfOptionsPanel.innerHTML = '';
                    mtfOptions.forEach(optData => {
                        const optEl = document.createElement('div');
                        optEl.style.cssText = `padding: 10px 12px; border-radius: 8px; cursor: pointer; transition: background 0.2s; color: var(--text-color); margin-bottom: 2px;`;
                        optEl.textContent = optData.text;
                        optEl.addEventListener('mouseenter', () => { optEl.style.backgroundColor = 'var(--hover-bg)'; });
                        optEl.addEventListener('mouseleave', () => { optEl.style.backgroundColor = 'transparent'; });
                        optEl.addEventListener('click', (e) => {
                            e.stopPropagation();
                            if (mtfSelectedText) mtfSelectedText.textContent = optData.text;
                            if (mtfInput) mtfInput.value = optData.id;
                            mtfOptionsPanel.style.display = 'none';
                            if (mtfCaret) mtfCaret.style.transform = 'rotate(0deg)';
                            if (mtfTrigger) mtfTrigger.style.borderColor = 'var(--border-color)';
                            
                            charConfig.msgTimeFormat = optData.id;
                            localStorage.setItem(`nrj-chat-config-${currentPersona.id}`, JSON.stringify(charConfig));
                            
                            if (mtfCustomContainer) {
                                mtfCustomContainer.style.display = optData.id === 'custom' ? 'block' : 'none';
                            }
                            
                            if (convView && convView.classList.contains('active')) {
                                openConversation(currentPersona);
                            }
                        });
                        mtfOptionsPanel.appendChild(optEl);
                    });
                    
                    let currentMtf = charConfig.msgTimeFormat || 'hm';
                    const foundMtf = mtfOptions.find(o => o.id === currentMtf);
                    if (foundMtf) {
                        if (mtfSelectedText) mtfSelectedText.textContent = foundMtf.text;
                        if (mtfInput) mtfInput.value = foundMtf.id;
                    }
                    
                    if (mtfCustomContainer) {
                        mtfCustomContainer.style.display = currentMtf === 'custom' ? 'block' : 'none';
                    }
                    
                    if (mtfCustomInput) {
                        mtfCustomInput.value = charConfig.customTimeFormat || '{HH}:{mm}:{ss}';
                        mtfCustomInput.oninput = (e) => {
                            charConfig.customTimeFormat = e.target.value;
                            localStorage.setItem(`nrj-chat-config-${currentPersona.id}`, JSON.stringify(charConfig));
                            if (convView && convView.classList.contains('active')) {
                                openConversation(currentPersona);
                            }
                        };
                    }
                    
                    if (mtfTrigger) {
                        mtfTrigger.onclick = (e) => {
                            e.stopPropagation();
                            const isPanelOpen = mtfOptionsPanel.style.display === 'block';
                            if (isPanelOpen) {
                                mtfOptionsPanel.style.display = 'none';
                                if (mtfCaret) mtfCaret.style.transform = 'rotate(0deg)';
                                mtfTrigger.style.borderColor = 'var(--border-color)';
                            } else {
                                mtfOptionsPanel.style.display = 'block';
                                if (mtfCaret) mtfCaret.style.transform = 'rotate(180deg)';
                                mtfTrigger.style.borderColor = 'var(--accent-color)';
                            }
                        };
                    }
                    
                    document.addEventListener('click', (e) => {
                        if (mtfOptionsPanel && mtfOptionsPanel.style.display === 'block' && !mtfOptionsPanel.contains(e.target) && e.target !== mtfTrigger) {
                            mtfOptionsPanel.style.display = 'none';
                            if (mtfCaret) mtfCaret.style.transform = 'rotate(0deg)';
                            if (mtfTrigger) mtfTrigger.style.borderColor = 'var(--border-color)';
                        }
                    });
                }

                const toggleHideSystemMsg = container.querySelector('#cs-hide-system-msg-toggle');
                if (toggleHideSystemMsg) {
                    toggleHideSystemMsg.checked = !!charConfig.hideSystemMsg;
                    toggleHideSystemMsg.onchange = (e) => {
                        charConfig.hideSystemMsg = e.target.checked;
                        localStorage.setItem(`nrj-chat-config-${currentPersona.id}`, JSON.stringify(charConfig));
                        if (convView && convView.classList.contains('active')) {
                            openConversation(currentPersona);
                        }
                    };
                }

                const toggleVoiceWave = container.querySelector('#cs-voice-wave-toggle');
                if (toggleVoiceWave) {
                    toggleVoiceWave.checked = !!charConfig.voiceWaveEnabled;
                    toggleVoiceWave.onchange = (e) => {
                        charConfig.voiceWaveEnabled = e.target.checked;
                        localStorage.setItem(`nrj-chat-config-${currentPersona.id}`, JSON.stringify(charConfig));
                        if (convView && convView.classList.contains('active')) {
                            openConversation(currentPersona);
                        }
                    };
                }

                const tsOptions = [
                    { id: 'bubble', text: '仅消息气泡 (iOS三点动画)' },
                    { id: 'title', text: '仅顶部标题 (正在输入中...)' },
                    { id: 'both', text: '全部显示' }
                ];
                
                if (tsOptionsPanel) {
                    tsOptionsPanel.innerHTML = '';
                    tsOptions.forEach(optData => {
                        const optEl = document.createElement('div');
                        optEl.style.cssText = `padding: 10px 12px; border-radius: 8px; cursor: pointer; transition: background 0.2s; color: var(--text-color); margin-bottom: 2px;`;
                        optEl.textContent = optData.text;
                        optEl.addEventListener('mouseenter', () => { optEl.style.backgroundColor = 'var(--hover-bg)'; });
                        optEl.addEventListener('mouseleave', () => { optEl.style.backgroundColor = 'transparent'; });
                        optEl.addEventListener('click', (e) => {
                            e.stopPropagation();
                            if (tsSelectedText) tsSelectedText.textContent = optData.text;
                            if (tsInput) tsInput.value = optData.id;
                            tsOptionsPanel.style.display = 'none';
                            if (tsCaret) tsCaret.style.transform = 'rotate(0deg)';
                            if (tsTrigger) tsTrigger.style.borderColor = 'var(--border-color)';
                            
                            charConfig.typingStyle = optData.id;
                            localStorage.setItem(`nrj-chat-config-${currentPersona.id}`, JSON.stringify(charConfig));
                        });
                        tsOptionsPanel.appendChild(optEl);
                    });
                    
                    let currentTs = charConfig.typingStyle || 'both';
                    const foundTs = tsOptions.find(o => o.id === currentTs);
                    if (foundTs) {
                        if (tsSelectedText) tsSelectedText.textContent = foundTs.text;
                        if (tsInput) tsInput.value = foundTs.id;
                    }
                    
                    if (tsTrigger) {
                        tsTrigger.onclick = (e) => {
                            e.stopPropagation();
                            const isPanelOpen = tsOptionsPanel.style.display === 'block';
                            if (isPanelOpen) {
                                tsOptionsPanel.style.display = 'none';
                                if (tsCaret) tsCaret.style.transform = 'rotate(0deg)';
                                tsTrigger.style.borderColor = 'var(--border-color)';
                            } else {
                                tsOptionsPanel.style.display = 'block';
                                if (tsCaret) tsCaret.style.transform = 'rotate(180deg)';
                                tsTrigger.style.borderColor = 'var(--accent-color)';
                            }
                        };
                    }
                    
                    document.addEventListener('click', (e) => {
                        if (tsOptionsPanel && tsOptionsPanel.style.display === 'block' && !tsOptionsPanel.contains(e.target) && e.target !== tsTrigger) {
                            tsOptionsPanel.style.display = 'none';
                            if (tsCaret) tsCaret.style.transform = 'rotate(0deg)';
                            if (tsTrigger) tsTrigger.style.borderColor = 'var(--border-color)';
                        }
                    });
                }

                // 重置 Tab 为第一个
                const firstTab = container.querySelector('.chat-popup-tab[data-tab="cs-tab-role"]');
                if (firstTab) firstTab.click();

                updateTokenStats();

                if (popupCharacterSettings) popupCharacterSettings.classList.add('active');
            });
        }
        
        const addBubble = (type, text, persona = null, isTyping = false, msgObj = null, indexInHistory = -1) => {
            const row = document.createElement('div');
            row.className = `chat-bubble-row ${type}`;
            if (isTyping) row.id = 'typing-bubble';
            if (indexInHistory !== -1) row.setAttribute('data-msg-idx', indexInHistory);
            
            let charConfigStr = '{}';
            if (currentPersona && currentPersona.id) {
                charConfigStr = localStorage.getItem(`nrj-chat-config-${currentPersona.id}`) || '{}';
            }
            let cConfig = JSON.parse(charConfigStr);

            let msgTimeFormat = cConfig.msgTimeFormat || 'hm';
            let timeStr = '';
            if (cConfig.msgTimePos !== 'none' && type !== 'system' && !isTyping) {
                let msgTime = Date.now();
                if (msgObj && msgObj.timestamp) {
                    msgTime = msgObj.timestamp;
                }
                const dateObj = new Date(msgTime);
                
                const pad = (num) => num.toString().padStart(2, '0');
                const hh = pad(dateObj.getHours());
                const mm = pad(dateObj.getMinutes());
                const ss = pad(dateObj.getSeconds());

                if (msgTimeFormat === 'custom' && cConfig.customTimeFormat) {
                    timeStr = cConfig.customTimeFormat
                        .replace(/{HH}/g, hh)
                        .replace(/{mm}/g, mm)
                        .replace(/{ss}/g, ss);
                } else if (msgTimeFormat === 'hms') {
                    timeStr = hh + ':' + mm + ':' + ss;
                } else {
                    timeStr = hh + ':' + mm;
                }
            }

            const personas = loadPersonas();
            let activeUserId = cConfig.userPersonaId || getActivePersonaId();
            let activeUser = personas.find(p => p.id === activeUserId);
            if (!activeUser) activeUser = personas.find(p => p.id === getActivePersonaId()) || { id: getActivePersonaId(), nickname: '我', realname: '我' };

            const params = {
                type, text, persona, isTyping, msgObj, indexInHistory,
                charConfig: cConfig,
                activeUser,
                quoteStyleOption: cConfig.quoteStyle || 'inside',
                bubbleStyle: cConfig.bubbleStyle || 'default',
                bColors: cConfig.bubbleColors || { themBg: '#EFEFEF', themText: '#111111', meBg: '#111111', meText: '#ffffff' },
                voiceWaveEnabled: !!cConfig.voiceWaveEnabled,
                avatarDisplay: cConfig.avatarDisplay || 'hide_me',
                msgTimePos: cConfig.msgTimePos || (cConfig.showMsgTimestamp === true ? 'bubble' : 'none'),
                msgTimeFormat,
                timeStr
            };

            row.innerHTML = window.ChatRender.generateBubbleHtml(params);
            convMessages.appendChild(row);
            
            let isMultiGreeting = msgObj && msgObj.isGreeting && msgObj.greetings && msgObj.greetings.length > 1;

            const bubbleEl = row.querySelector('.chat-bubble');
            if (bubbleEl && type !== 'system' && indexInHistory !== -1) {
                let pressTimer = null;
                let isDragging = false;
                
                const clearPressTimer = () => {
                    if (pressTimer) {
                        clearTimeout(pressTimer);
                        pressTimer = null;
                    }
                };

                bubbleEl.addEventListener('touchstart', (e) => {
                    isDragging = false;
                    clearPressTimer();
                    pressTimer = setTimeout(() => {
                        if (!isDragging) {
                            if (navigator.vibrate) navigator.vibrate(50);
                            showMsgMenu(e, msgObj ? msgObj.content : text, msgObj, indexInHistory, bubbleEl);
                        }
                    }, 500);
                }, { passive: true });

                bubbleEl.addEventListener('touchmove', () => {
                    isDragging = true;
                    clearPressTimer();
                }, { passive: true });

                bubbleEl.addEventListener('touchend', () => { clearPressTimer(); });
                bubbleEl.addEventListener('touchcancel', () => { clearPressTimer(); });

                bubbleEl.addEventListener('contextmenu', (e) => {
                    showMsgMenu(e, msgObj ? msgObj.content : text, msgObj, indexInHistory, bubbleEl);
                });
            }

            const imageNode = row.querySelector('.chat-image-bubble-inner');
            if (imageNode) {
                imageNode.addEventListener('click', () => {
                    const imgDesc = imageNode.getAttribute('data-imgtext');
                    if (window._currentChatOSAlert) {
                        window._currentChatOSAlert('图片描述', imgDesc);
                    }
                });
            }

            const locationNode = row.querySelector('.chat-location-bubble-inner');
            if (locationNode) {
                locationNode.addEventListener('click', () => {
                    const locDesc = locationNode.getAttribute('data-loctext');
                    if (window._currentChatOSAlert) {
                        window._currentChatOSAlert('详细位置', locDesc);
                    }
                });
            }

            if (isMultiGreeting) {
                const leftBtn = row.querySelector('.left-arrow');
                const rightBtn = row.querySelector('.right-arrow');
                
                const handleSwitch = (direction) => {
                    let history = getChatHistory(currentPersona.id);
                    let msg = history[indexInHistory];
                    if (msg && msg.isGreeting) {
                        let newIdx = msg.greetingIndex + direction;
                        if (newIdx < 0) newIdx = msg.greetings.length - 1;
                        if (newIdx >= msg.greetings.length) newIdx = 0;
                        msg.greetingIndex = newIdx;
                        msg.content = msg.greetings[newIdx];
                        saveChatHistory(currentPersona.id, history);
                        
                        row.querySelector('.chat-bubble-text').innerHTML = msg.content;
                        row.querySelector('.greeting-indicator').textContent = `${newIdx + 1} / ${msg.greetings.length}`;
                        
                        if (indexInHistory === history.length - 1) {
                            currentPersona.message = msg.content;
                            renderChatList();
                        }
                    }
                };

                leftBtn.addEventListener('click', () => handleSwitch(-1));
                rightBtn.addEventListener('click', () => handleSwitch(1));
            }
            
            const transferNode = row.querySelector('.chat-transfer-bubble-inner');
            if (transferNode) {
                const tStatus = transferNode.getAttribute('data-status');
                if (type === 'them' && tStatus === 'PENDING') {
                    transferNode.addEventListener('click', () => {
                        const tAmount = transferNode.getAttribute('data-amount');
                        const tId = transferNode.getAttribute('data-tid');
                        
                        const transferPopup = container.querySelector('#chat-transfer-action-popup');
                        const amountEl = container.querySelector('#transfer-action-amount');
                        const remarkEl = container.querySelector('#transfer-action-remark');
                        const btnReceive = container.querySelector('#btn-transfer-receive');
                        const btnReturn = container.querySelector('#btn-transfer-return');
                        const btnClose = container.querySelector('.btn-close-transfer');
                        
                        if (transferPopup) {
                            let remark = '转账';
                            let currentHistory = getChatHistory(currentPersona.id);
                            let foundIndex = -1;
                            if (tId) {
                                foundIndex = currentHistory.findIndex(m => m.content.includes(tId));
                            } else if (indexInHistory !== -1) {
                                foundIndex = indexInHistory;
                            }
                            if (foundIndex !== -1) {
                                let m = currentHistory[foundIndex].content.match(/\[\[TRANSFER:([^|]+)\|([^|]+)\|([^|]+)\|([^\]]+)\]\]/);
                                if (m && m[2]) remark = m[2];
                            }
                            
                            amountEl.textContent = `¥ ${tAmount}`;
                            remarkEl.textContent = remark;
                            
                            const newBtnReceive = btnReceive.cloneNode(true);
                            btnReceive.parentNode.replaceChild(newBtnReceive, btnReceive);
                            const newBtnReturn = btnReturn.cloneNode(true);
                            btnReturn.parentNode.replaceChild(newBtnReturn, btnReturn);
                            const newBtnClose = btnClose.cloneNode(true);
                            btnClose.parentNode.replaceChild(newBtnClose, btnClose);
                            
                            const closeTransferPopup = () => transferPopup.classList.remove('active');
                            newBtnClose.addEventListener('click', closeTransferPopup);
                            
                            const processTransfer = (isReceive) => {
                                closeTransferPopup();
                                const newStatus = isReceive ? 'RECEIVED' : 'RETURNED';
                                
                                let history = getChatHistory(currentPersona.id);
                                let idx = -1;
                                if (tId) {
                                    idx = history.findIndex(m => m.content.includes(tId));
                                } else if (indexInHistory !== -1) {
                                    idx = indexInHistory;
                                }
                                
                                if (idx !== -1) {
                                    history[idx].content = history[idx].content.replace(/\|PENDING\|/g, `|${newStatus}|`);
                                    
                                    const receiptText = `[[TRANSFER_RECEIPT:${tAmount}|${newStatus}|${tId}]]`;
                                    history.push({ role: 'user', content: receiptText, timestamp: Date.now() });
                                    
                                    const sysMsgText = isReceive ? '[你 已收取对方的转账]' : '[你 已退还对方的转账]';
                                    history.push({ role: 'system', content: sysMsgText, timestamp: Date.now() });
                                    
                                    saveChatHistory(currentPersona.id, history);
                                    openConversation(currentPersona);
                                }
                            };
                            
                            newBtnReceive.addEventListener('click', () => processTransfer(true));
                            newBtnReturn.addEventListener('click', () => processTransfer(false));
                            
                            transferPopup.classList.add('active');
                        }
                    });
                }
            }

            setTimeout(() => {
                convMessages.scrollTop = convMessages.scrollHeight;
            }, 50);
        };

        if (convInput) {
            convInput.addEventListener('input', () => {
                if (convInput.value.trim().length > 0) {
                    convSendBtn.classList.remove('disabled');
                    convSendBtn.classList.add('active');
                } else {
                    convSendBtn.classList.add('disabled');
                    convSendBtn.classList.remove('active');
                }
            });
            
            convInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (convInput.value.trim().length > 0) {
                        convSendBtn.click();
                    }
                }
            });
        }

        const triggerAIReply = async () => {
            if (!currentPersona) return;
            if (convName.textContent === '正在输入...') return;
            
            const charId = currentPersona.id;
            const history = getChatHistory(charId);
            
            // 计算距离上次聊天的时间
            let lastTime = null;
            if (history.length > 0) {
                lastTime = history[history.length - 1].timestamp || Date.now();
            }
            const timeSinceLast = getTimeSince(lastTime);
            const finalTimezone = (currentPersona.rawCharData && currentPersona.rawCharData.timezone) || Intl.DateTimeFormat().resolvedOptions().timeZone;
            
            if (!currentPersona.isCharacter) {
                // 不是创建的AI角色，如果是内置角色可以模拟回复
                return;
            }

            const charData = currentPersona.rawCharData;
            const charConfig = JSON.parse(localStorage.getItem(`nrj-chat-config-${currentPersona.id}`) || '{}');
            const typingStyle = charConfig.typingStyle || 'both';

            if (typingStyle === 'bubble' || typingStyle === 'both') {
                addBubble('them', '<div class="typing-indicator"><span></span><span></span><span></span></div>', currentPersona, true);
            }

            const originalName = convName.textContent;
            if (typingStyle === 'title' || typingStyle === 'both') {
                convName.textContent = '正在输入...';
            }
            
            aiReplyPaused = false;
            aiAbortController = new AbortController();

            try {
                // 获取当前活跃的用户人设，支持特定角色绑定
                const personas = loadPersonas();
                let activeUserId = charConfig.userPersonaId || getActivePersonaId();
                let activeUser = personas.find(p => p.id === activeUserId);
                if (!activeUser) {
                    activeUser = personas.find(p => p.id === getActivePersonaId()) || {
                        realname: '我',
                        nickname: '我',
                        bio: '一个普通人。'
                    };
                }
                
                let charTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                if (charConfig.useCharTimezone && charConfig.charTimezone) {
                    charTimezone = charConfig.charTimezone;
                } else if (charData.timezone) {
                    charTimezone = charData.timezone;
                }

                let userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                if (charConfig.useUserTimezone && charConfig.userTimezone) {
                    userTimezone = charConfig.userTimezone;
                }

                let charTimeInfo = '';
                let userTimeInfo = '';

                if (charConfig.useCharTimezone || charData.timezone) {
                    try {
                        let tzTime = new Date().toLocaleString('zh-CN', { timeZone: charTimezone, hour12: false });
                        charTimeInfo = `现在是 ${tzTime}（你所在地的本地时间）。`;
                    } catch(e) {
                        let localTime = new Date().toLocaleString('zh-CN', { hour12: false });
                        charTimeInfo = `现在是 ${localTime}（你所在地的本地时间）。`;
                    }
                } else {
                    let localTime = new Date().toLocaleString('zh-CN', { hour12: false });
                    charTimeInfo = `现在是 ${localTime}（你所在地的本地时间）。`;
                }

                if (charConfig.useUserTimezone) {
                    try {
                        let tzTime = new Date().toLocaleString('zh-CN', { timeZone: userTimezone, hour12: false });
                        userTimeInfo = `对方（${activeUser.nickname || activeUser.realname || '我'}）所在地的本地时间是：${tzTime}。`;
                    } catch(e) {}
                }

                // API 调用
                const settings = JSON.parse(localStorage.getItem('nrj-api-settings') || '{}');
                if (!settings.key || !settings.url || !settings.model) {
                    throw new Error('请先在设置中配置主 API！');
                }

                // 获取角色的设置（包括世界书与短期记忆配置）
                const shortTermCount = parseInt(charConfig.shortTermMemory, 10) || 20;
                
                // 读取世界书 (如果绑定了)
                let worldbookContent = "暂无补充设定";
                if (charConfig.worldbookId) {
                    try {
                        const wbs = JSON.parse(localStorage.getItem('nrj-worldbooks') || '[]');
                        const selectedWb = wbs.find(w => w.id === charConfig.worldbookId);
                        if (selectedWb && selectedWb.entries && selectedWb.entries.length > 0) {
                            const enabledEntries = selectedWb.entries.filter(e => e.enabled !== false);
                            if (enabledEntries.length > 0) {
                                worldbookContent = enabledEntries.map(e => `[${e.keyword}]: ${e.content}`).join("\n");
                            }
                        }
                    } catch(e) {}
                }

                // 读取长期记忆
                let mems = getMemory(charId);
                let longTermMemoryContent = "暂无长期记忆";
                if (mems.length > 0) {
                    longTermMemoryContent = mems.map(m => m.content).join('\n');
                }

                // 组装 System Prompt (使用正则表达式 /g 全局替换，以便提示词中多次引用)
                let multiMsgPrompt = "";
                if (charConfig.multiMsgEnabled) {
                    const minMsg = charConfig.multiMsgMin || 1;
                    const maxMsg = charConfig.multiMsgMax || 3;
                    multiMsgPrompt = `\n\n【回复格式要求】
你现在正在像真实人类一样连续发送多条短消息。
你必须连续回复 ${minMsg} 到 ${maxMsg} 条消息，多条消息之间必须严格使用 [SPLIT] 作为分隔符（绝不要用其他符号代替）。
例如：第一条消息[SPLIT]第二条消息[SPLIT]第三条消息
不要在最后一条消息后加 [SPLIT]。每条消息都很简短口语化。`;
                } else {
                    multiMsgPrompt = `\n\n【回复格式要求】
你现在正在像真实人类一样在聊天软件上发消息。
你可以自由决定回复一条还是多条消息（不限制条数）。
如果只有一句话，直接回复即可。
如果你想连续发送多条消息，多条消息之间必须严格使用 [SPLIT] 作为分隔符。
例如：第一条消息[SPLIT]第二条消息[SPLIT]第三条消息
不要在最后一条消息后加 [SPLIT]。每条消息都很简短口语化。`;
                }

                let userIdentityInfo = `他/她叫 ${activeUser.realname || activeUser.nickname || '未命名用户'}`;
                if (activeUser.nickname) {
                    userIdentityInfo += `，你给对方昵称是 ${activeUser.nickname}`;
                }
                userIdentityInfo += `。`;

                const finalPromptTemplate = charConfig.charPrompt && charConfig.charPrompt.trim() !== '' ? charConfig.charPrompt : (localStorage.getItem('nrj-global-system-prompt') || META_PROMPT);

                let systemPrompt = finalPromptTemplate
                    .replace(/{char_realname}/g, charData.realname || charData.nickname || '未命名角色')
                    .replace(/{char_nickname}/g, charData.nickname || charData.realname || '未命名角色')
                    .replace(/{char_persona}/g, charData.persona || '一个普通人。')
                    .replace(/{user_identity_info}/g, userIdentityInfo)
                    .replace(/{user_bio}/g, activeUser.bio || '无')
                    .replace(/{user_time_info}/g, userTimeInfo)
                    .replace(/{char_time_info}/g, charTimeInfo)
                    .replace(/{time_since_last_message}/g, timeSinceLast)
                    .replace(/{worldbook_entries}/g, worldbookContent)
                    .replace(/{long_term_memory}/g, longTermMemoryContent) + multiMsgPrompt;

                // {{char}} 和 {{user}} 替换函数
                const replaceVars = (text, charName, userName, role = null) => {
                    if (!text) return text;
                    let result = text.replace(/{{char}}/gi, charName).replace(/{{user}}/gi, userName);
                    
                    const quoteRegex = /\n?\[\[QUOTE:([^|]+)\|([^\]]+)\]\]/g;
                    result = result.replace(quoteRegex, (match, qName, qBase64) => {
                        try {
                            const qText = decodeURIComponent(escape(window.atob(qBase64)));
                            return `\n[引用了${qName}的消息: "${qText}"]`;
                        } catch(e) { return ''; }
                    });

                    if (role === 'user') {
                        result = result.replace(/\[\[VOICE:(.*?)\]\]/g, '[发送了一条语音] "$1"');
                        result = result.replace(/\[\[IMAGE:(.*?)\]\]/g, '[发送了一张图片，图片内容是："$1"]');
                        result = result.replace(/\[\[LOCATION:(.*?)\]\]/g, '[分享了一个位置，地址是："$1"]');
                    }
                    return result;
                };

                const charNameStr = charData.nickname || charData.realname || '未命名角色';
                const userNameStr = activeUser.nickname || activeUser.realname || '我';

                // 准备发送的消息列表，并且替换内容中的变量
                const apiMessages = [
                    { role: 'system', content: replaceVars(systemPrompt, charNameStr, userNameStr, 'system') },
                    // 根据设置取最近的历史记录作为上下文
                    ...history.slice(-shortTermCount).map(m => ({
                        role: m.role,
                        content: replaceVars(m.content, charNameStr, userNameStr, m.role)
                    }))
                ];

                let replyText = await window.ChatAPI.chatCompletion(apiMessages, settings, aiAbortController.signal);

                // 提取可能出现的 <think> 标签（直接移除，不在界面展示）
                replyText = replyText.replace(/<think>([\s\S]*?)<\/think>/g, '').trim();

                // 处理收取/退回转账指令
                let hasReceivedTransfer = false;
                let hasReturnedTransfer = false;
                
                // 处理 AI 发起转账指令
                let aiTransferMatch = replyText.match(/\[发起转账:([^|]+)\|([^\]]+)\]/);
                let aiTransferAmount = null;
                let aiTransferRemark = null;
                if (aiTransferMatch) {
                    aiTransferAmount = aiTransferMatch[1].trim();
                    aiTransferRemark = aiTransferMatch[2].trim();
                    replyText = replyText.replace(/\[发起转账:[^\]]+\]/g, '').trim();
                }

                if (replyText.includes('[收取转账]')) {
                    hasReceivedTransfer = true;
                    replyText = replyText.replace(/\[收取转账\]/g, '').trim();
                }
                if (replyText.includes('[退回转账]')) {
                    hasReturnedTransfer = true;
                    replyText = replyText.replace(/\[退回转账\]/g, '').trim();
                }

                if (hasReceivedTransfer || hasReturnedTransfer) {
                    let currentHistory = getChatHistory(charId);
                    // 从后往前找最后一个 PENDING 的转账记录
                    let targetIndex = -1;
                    let targetAmount = '0';
                    let targetId = '';
                    for (let j = currentHistory.length - 1; j >= 0; j--) {
                        if (currentHistory[j].role === 'user' && currentHistory[j].content.includes('|PENDING|')) {
                            targetIndex = j;
                            let m = currentHistory[j].content.match(/\[\[TRANSFER:([^|]+)\|([^|]+)\|([^|]+)\|([^\]]+)\]\]/);
                            if (m) {
                                targetAmount = m[1];
                                targetId = m[4];
                            }
                            break;
                        }
                    }

                    if (targetIndex !== -1) {
                        const newStatus = hasReceivedTransfer ? 'RECEIVED' : 'RETURNED';
                        currentHistory[targetIndex].content = currentHistory[targetIndex].content.replace(/\|PENDING\|/g, `|${newStatus}|`);
                        
                        const receiptText = `[[TRANSFER_RECEIPT:${targetAmount}|${newStatus}|${targetId}]]`;
                        currentHistory.push({ role: 'assistant', content: receiptText, timestamp: Date.now() });

                        const sysMsgText = hasReceivedTransfer ? '[{{char}} 已收取你的转账]' : '[{{char}} 已退回你的转账]';
                        if (!charConfig.hideSystemMsg) {
                            currentHistory.push({ role: 'system', content: sysMsgText, timestamp: Date.now() });
                        } else {
                            currentHistory.push({ role: 'system', content: sysMsgText, timestamp: Date.now() });
                        }
                        
                        saveChatHistory(charId, currentHistory);
                        // 重新打开会话渲染状态
                        openConversation(currentPersona);
                    }
                }

                if (aiTransferAmount) {
                    let currentHistory = getChatHistory(charId);
                    const tId = 'tr_' + Date.now();
                    const tText = `[[TRANSFER:${aiTransferAmount}|${aiTransferRemark}|PENDING|${tId}]]`;
                    currentHistory.push({ role: 'assistant', content: tText, timestamp: Date.now() });
                    
                    const sysText = `[{{char}}向你发起了转账 ${aiTransferAmount} 元，备注：${aiTransferRemark}。等待收取。]`;
                    currentHistory.push({ role: 'system', content: sysText, timestamp: Date.now() });
                    
                    saveChatHistory(charId, currentHistory);
                    openConversation(currentPersona);
                }

                if (!replyText) {
                    // 如果模型只回复了转账指令被清空了，不显示空白气泡
                    convName.textContent = originalName;
                    const typingBubble = document.getElementById('typing-bubble');
                    if (typingBubble) typingBubble.remove();
                    return;
                }

                let replies = [];
                // 不管是否开启强制连发，只要含有特定分隔符或换行，统统拆分为独立气泡
                if (replyText.includes('[SPLIT]')) {
                    replies = replyText.split('[SPLIT]').map(s => s.trim()).filter(s => s);
                } else if (replyText.includes('\n---\n')) {
                    replies = replyText.split('\n---\n').map(s => s.trim()).filter(s => s);
                } else if (replyText.includes('\n\n')) {
                    // 如果没有特殊的标记符号，双换行也作为分段（多个气泡）的依据
                    replies = replyText.split('\n\n').map(s => s.trim()).filter(s => s);
                } else {
                    if (replyText) {
                        replies = [replyText];
                    }
                }

                const delaySeconds = charConfig.multiMsgDelay !== undefined ? parseFloat(charConfig.multiMsgDelay) : 2;

                for (let i = 0; i < replies.length; i++) {
                    if (aiReplyPaused) {
                        console.log('AI 连发已被暂停');
                        break;
                    }
                    let r = replies[i];
                    
                    // 拦截段落级别的 AI 撤回指令
                    if (r.includes('[撤回上一条消息]')) {
                        r = r.replace(/\[撤回上一条消息\]/g, '').trim();
                        let currentHistory = getChatHistory(charId);
                        
                        let targetIndex = -1;
                        for (let j = currentHistory.length - 1; j >= 0; j--) {
                            if (currentHistory[j].role === 'assistant' && !currentHistory[j].content.includes('[[TRANSFER_RECEIPT:')) {
                                targetIndex = j;
                                break;
                            }
                        }

                        if (targetIndex !== -1) {
                            const originalContent = currentHistory[targetIndex].content;
                            const charNameForRecall = charData.nickname || charData.realname || charData.name || '对方';
                            currentHistory[targetIndex] = {
                                role: 'system',
                                content: `[${charNameForRecall} 刚刚撤回了消息，内容是：${originalContent}]`,
                                timestamp: Date.now(),
                                isAiRecall: true,
                                recallContent: originalContent
                            };
                            saveChatHistory(charId, currentHistory);
                            openConversation(currentPersona); // 刷新界面渲染撤回状态
                        }
                        
                        if (!r) continue; // 如果撤回完没有多余的话了，直接跳过当前气泡的渲染
                    }
                    
                    if (i > 0) {
                        // 对于后续的消息，显示正在输入动画，并等待设定的延迟时间
                        if (typingStyle === 'bubble' || typingStyle === 'both') {
                            const existingTyping = document.getElementById('typing-bubble');
                            if (!existingTyping) {
                                addBubble('them', '<div class="typing-indicator"><span></span><span></span><span></span></div>', currentPersona, true);
                            }
                        }
                        
                        await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
                    }
                    
                    const typingBubble = document.getElementById('typing-bubble');
                    if (typingBubble) typingBubble.remove();
                    
                    // 每次发消息前重新获取最新历史，防止我们在等待时用户发了新消息被覆盖
                    let currentHistory = getChatHistory(charId);
                    
                    const newMsg = { role: 'assistant', content: r, timestamp: Date.now() };
                    addBubble('them', r, currentPersona, false, newMsg, currentHistory.length);
                    currentHistory.push(newMsg);
                    saveChatHistory(charId, currentHistory);
                    
                    currentPersona.message = r;
                    currentPersona.time = getLocalTimeByTimezone(finalTimezone);
                    renderChatList();
                }

                // 增加未总结计数 (统一加，不随分段次数累加，避免一次发太多触发总结)
                charConfig.unsummarizedCount = (charConfig.unsummarizedCount || 0) + 2;
                localStorage.setItem(`nrj-chat-config-${charId}`, JSON.stringify(charConfig));
                
                // 检查自动总结阈值
                if (charConfig.autoSummaryThreshold > 0 && charConfig.unsummarizedCount >= charConfig.autoSummaryThreshold) {
                    // 异步执行，不阻塞后续操作
                    summarizeChatHistory(charId).catch(console.error);
                }

                convName.textContent = originalName;

            } catch (error) {
                console.error('发送消息失败:', error);
                const typingBubble = document.getElementById('typing-bubble');
                if (typingBubble) typingBubble.remove();
                
                if (error.name === 'AbortError') {
                    console.log('AI请求已被用户主动中止');
                } else if (window._currentChatOSAlert) {
                    window._currentChatOSAlert('发送失败', error.message || '网络或API配置错误');
                }
                convName.textContent = originalName;
            } finally {
                aiAbortController = null;
            }
        };

        if (convSendBtn) {
            convSendBtn.addEventListener('click', async () => {
                let text = convInput.value.trim();
                if (!text || !currentPersona) return;
                
                if (currentQuote) {
                    // 使用新的文本引用格式
                    text = text + `\n[[QUOTE_TEXT:${currentQuote.name}|${currentQuote.text}]]`;
                    currentQuote = null;
                    const quotePreview = container.querySelector('#chat-quote-preview');
                    if (quotePreview) quotePreview.style.display = 'none';
                }
                
                const charId = currentPersona.id;
                const history = getChatHistory(charId);

                const newMsg = { role: 'user', content: text, timestamp: Date.now() };
                addBubble('me', text, null, false, newMsg, history.length);
                convInput.value = '';
                convSendBtn.classList.add('disabled');
                convSendBtn.classList.remove('active');
                
                history.push(newMsg);
                saveChatHistory(charId, history);
                
                // 更新列表项的最后消息和时间
                currentPersona.message = text;
                const finalTimezone = (currentPersona.rawCharData && currentPersona.rawCharData.timezone) || Intl.DateTimeFormat().resolvedOptions().timeZone;
                currentPersona.time = getLocalTimeByTimezone(finalTimezone);
            });
        }
        
        const btnAiReply = container.querySelector('.chat-composer-btn-icon.ai');
        if (btnAiReply) {
            btnAiReply.addEventListener('click', () => {
                // 如果正在输入中，则不重复调用
                if (convName.textContent === '正在输入...') return;
                triggerAIReply();
            });
        }

        // 移除导致卡顿和滚动失效的全局手势向下退出监听

        // 实时刷新时区预览
        setInterval(() => {
            const localTimeDisplay = container.querySelector('#chat-local-time-display');
            if (currentPersona && localTimeDisplay && convView && convView.classList.contains('active')) {
                const charConfig = JSON.parse(localStorage.getItem(`nrj-chat-config-${currentPersona.id}`) || '{}');
                if (charConfig.showLocalTime) {
                    let timeTexts = [];
                    
                    let charTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                    if (charConfig.useCharTimezone && charConfig.charTimezone) {
                        charTimezone = charConfig.charTimezone;
                    } else if (currentPersona.rawCharData && currentPersona.rawCharData.timezone) {
                        charTimezone = currentPersona.rawCharData.timezone;
                    }
                    
                    let userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                    if (charConfig.useUserTimezone && charConfig.userTimezone) {
                        userTimezone = charConfig.userTimezone;
                    }
                    
                    try {
                        const formatOptions = { timeZone: charTimezone, hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' };
                        const charTimeStr = new Date().toLocaleString('zh-CN', formatOptions);
                        timeTexts.push(`对方时间: ${charTimeStr}`);
                    } catch(e) {}
                    
                    if (charTimezone !== userTimezone) {
                        try {
                            const formatOptions = { timeZone: userTimezone, hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' };
                            const userTimeStr = new Date().toLocaleString('zh-CN', formatOptions);
                            timeTexts.push(`我的时间: ${userTimeStr}`);
                        } catch(e) {}
                    }
                    
                    if (timeTexts.length > 0) {
                        localTimeDisplay.style.display = 'block';
                        localTimeDisplay.innerHTML = timeTexts.join(' <span style="margin: 0 8px; color: #d1d5db;">|</span> ');
                    } else {
                        localTimeDisplay.style.display = 'none';
                    }
                } else {
                    localTimeDisplay.style.display = 'none';
                }
            } else if (localTimeDisplay) {
                localTimeDisplay.style.display = 'none';
            }

            const charTzInput = container.querySelector('#cs-char-timezone');
            const charTzPreview = container.querySelector('#cs-char-timezone-preview');
            const charTzContainer = container.querySelector('#cs-char-timezone-container');
            
            if (charTzInput && charTzPreview && charTzContainer && charTzContainer.style.display !== 'none') {
                const tz = charTzInput.value.trim() || Intl.DateTimeFormat().resolvedOptions().timeZone;
                try {
                    const timeStr = new Date().toLocaleString('zh-CN', { timeZone: tz, hour12: false });
                    charTzPreview.textContent = `当前时间: ${timeStr}`;
                    charTzPreview.style.color = 'var(--text-secondary)';
                } catch(e) {
                    charTzPreview.textContent = `无效的时区格式`;
                    charTzPreview.style.color = '#FF3B30';
                }
            }

            const userTzInput = container.querySelector('#cs-user-timezone');
            const userTzPreview = container.querySelector('#cs-user-timezone-preview');
            const userTzContainer = container.querySelector('#cs-user-timezone-container');
            
            if (userTzInput && userTzPreview && userTzContainer && userTzContainer.style.display !== 'none') {
                const tz = userTzInput.value.trim() || Intl.DateTimeFormat().resolvedOptions().timeZone;
                try {
                    const timeStr = new Date().toLocaleString('zh-CN', { timeZone: tz, hour12: false });
                    userTzPreview.textContent = `当前时间: ${timeStr}`;
                    userTzPreview.style.color = 'var(--text-secondary)';
                } catch(e) {
                    userTzPreview.textContent = `无效的时区格式`;
                    userTzPreview.style.color = '#FF3B30';
                }
            }
        }, 1000);
    },

    destroy: function(container) {
        console.log('Chat OS app destroyed');
    }
};
