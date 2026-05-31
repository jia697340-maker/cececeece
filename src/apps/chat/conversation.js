window.ChatConversationModule = {
    META_PROMPT: `你的真名是 {char_realname}，对方给你取的昵称是 {char_nickname}。

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
你不说"作为AI……"，不用任何客服或助理的语气。`,

    init: function(ctx) {
        this.ctx = ctx;
        
        // 挂载公共方法到 ctx，供其他模块访问
        ctx.openConversation = this.openConversation.bind(this);
        ctx.addBubble = this.addBubble.bind(this);
        ctx.triggerAIReply = this.triggerAIReply.bind(this);
        ctx.updateTokenStats = this.updateTokenStats.bind(this);
        ctx.getLocalTimeByTimezone = this.getLocalTimeByTimezone.bind(this);
        ctx.applyChatWallpaper = this.applyChatWallpaper.bind(this);
        ctx.applyTopbarStyle = this.applyTopbarStyle.bind(this);

        // 挂载全局公共 UI 函数到 window
        window.showChatPrompt = this.showChatPrompt.bind(this);
        window.showChatConfirm = this.showChatConfirm.bind(this);
        window.showChatAlert = this.showChatAlert.bind(this);
        if (!window._currentChatOSAlert) {
            window._currentChatOSAlert = window.showChatAlert;
        }

        this.bindGlobalUIEvents();
        this.bindConversationEvents();
        
        // 监听来自其他模块（如 session 列表）的打开对话事件
        ctx.on('openConversation', (msg) => {
            this.openConversation(msg);
        });
    },

    getLocalTimeByTimezone: function(timezone) {
        try {
            return new Date().toLocaleTimeString('zh-CN', { timeZone: timezone, hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return '';
        }
    },

    // --- 全局通用 UI (Alert / Confirm / Prompt) ---
    showChatAlert: function(title, message, details = null) {
        const { ctx } = this;
        // 如果只有轻微提示，优先转为 Toast
        if (!details && (title === '提示' || title === '保存成功' || title === '已清空')) {
            let icon = 'ph-info';
            if (title.includes('成功')) icon = 'ph-check-circle';
            if (title.includes('失败') || title.includes('错误')) icon = 'ph-warning-circle';
            if (window._showChatOSToast) {
                window._showChatOSToast(message, icon);
                return;
            }
        }
        const { chatAlertTitle, chatAlertMessage, chatAlertDetails, chatAlertPopup } = ctx.nodes;
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
    },

    showChatConfirm: function(title, message, onConfirm) {
        const { ctx } = this;
        const { chatConfirmTitle, chatConfirmMessage, chatConfirmPopup } = ctx.nodes;
        if (chatConfirmTitle) {
            if (title) {
                chatConfirmTitle.textContent = title;
                chatConfirmTitle.style.display = 'block';
            } else {
                chatConfirmTitle.style.display = 'none';
            }
        }
        if (chatConfirmMessage) chatConfirmMessage.textContent = message;
        ctx.confirmCallback = onConfirm;
        if (chatConfirmPopup) chatConfirmPopup.classList.add('active');
    },

    togglePromptExpand: function(expand) {
        const { ctx } = this;
        const { chatPromptContent, chatPromptInput, btnPromptExpandIcon } = ctx.nodes;
        if (!chatPromptContent) return;
        if (expand) {
            chatPromptContent.style.maxWidth = '800px';
            chatPromptContent.style.width = '95%';
            chatPromptContent.style.height = '85%';
            chatPromptContent.style.maxHeight = '800px';
            if (chatPromptInput) chatPromptInput.style.resize = 'none';
            if (btnPromptExpandIcon) btnPromptExpandIcon.className = 'ph ph-arrows-in-simple';
            ctx.isPromptExpanded = true;
        } else {
            chatPromptContent.style.maxWidth = '340px';
            chatPromptContent.style.width = '90%';
            chatPromptContent.style.height = 'auto';
            chatPromptContent.style.maxHeight = 'none';
            if (chatPromptInput) chatPromptInput.style.resize = 'vertical';
            if (btnPromptExpandIcon) btnPromptExpandIcon.className = 'ph ph-arrows-out-simple';
            ctx.isPromptExpanded = false;
        }
    },

    showChatPrompt: function(title, defaultValue, onConfirm, showSecondary = false, secondaryPlaceholder = '', isSingleLine = false, mainPlaceholder = '') {
        const { ctx } = this;
        this.togglePromptExpand(false);

        const { btnPromptExpand, chatPromptTitle, chatPromptInput, chatPromptInputSecondary, chatPromptPopup } = ctx.nodes;
        if (btnPromptExpand) {
            btnPromptExpand.style.display = isSingleLine ? 'none' : 'flex';
        }
        if (chatPromptTitle) chatPromptTitle.textContent = title || '输入';
        if (chatPromptInput) {
            if (isSingleLine) {
                chatPromptInput.style.minHeight = '44px';
                chatPromptInput.style.height = '44px';
                chatPromptInput.style.resize = 'none';
                chatPromptInput.style.lineHeight = '24px';
                chatPromptInput.style.flex = 'none';
            } else {
                chatPromptInput.style.minHeight = '80px';
                chatPromptInput.style.height = 'auto';
                chatPromptInput.style.resize = 'vertical';
                chatPromptInput.style.lineHeight = '1.5';
                chatPromptInput.style.flex = '1';
            }
            chatPromptInput.placeholder = mainPlaceholder || '';
            chatPromptInput.value = defaultValue || '';
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
        ctx.promptCallback = onConfirm;
        if (chatPromptPopup) chatPromptPopup.classList.add('active');
    },

    bindGlobalUIEvents: function() {
        const { ctx } = this;
        const nodes = ctx.nodes;

        // Alert
        if (nodes.btnCloseAlert) {
            nodes.btnCloseAlert.addEventListener('click', () => {
                if (nodes.chatAlertPopup) nodes.chatAlertPopup.classList.remove('active');
            });
        }

        // Confirm
        if (nodes.btnConfirmCancel) {
            nodes.btnConfirmCancel.addEventListener('click', () => {
                if (nodes.chatConfirmPopup) nodes.chatConfirmPopup.classList.remove('active');
                ctx.confirmCallback = null;
            });
        }
        if (nodes.btnConfirmOk) {
            nodes.btnConfirmOk.addEventListener('click', () => {
                if (nodes.chatConfirmPopup) nodes.chatConfirmPopup.classList.remove('active');
                if (ctx.confirmCallback) {
                    ctx.confirmCallback();
                    ctx.confirmCallback = null;
                }
            });
        }

        // Prompt
        if (nodes.btnPromptExpand) {
            nodes.btnPromptExpand.addEventListener('click', () => {
                this.togglePromptExpand(!ctx.isPromptExpanded);
            });
        }
        if (nodes.btnPromptCancel) {
            nodes.btnPromptCancel.addEventListener('click', () => {
                if (nodes.chatPromptPopup) nodes.chatPromptPopup.classList.remove('active');
                ctx.promptCallback = null;
            });
        }
        if (nodes.btnPromptOk) {
            nodes.btnPromptOk.addEventListener('click', () => {
                const val = nodes.chatPromptInput ? nodes.chatPromptInput.value.trim() : '';
                const secondaryVal = (nodes.chatPromptInputSecondary && nodes.chatPromptInputSecondary.style.display !== 'none') ? nodes.chatPromptInputSecondary.value.trim() : null;
                if (nodes.chatPromptPopup) nodes.chatPromptPopup.classList.remove('active');
                if (ctx.promptCallback) {
                    if (nodes.chatPromptInputSecondary && nodes.chatPromptInputSecondary.style.display !== 'none') {
                        ctx.promptCallback(val, secondaryVal);
                    } else {
                        ctx.promptCallback(val);
                    }
                    ctx.promptCallback = null;
                }
            });
        }
        if (nodes.chatPromptInput) {
            nodes.chatPromptInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (nodes.chatPromptInputSecondary && nodes.chatPromptInputSecondary.style.display !== 'none') {
                        nodes.chatPromptInputSecondary.focus();
                    } else {
                        if (nodes.btnPromptOk) nodes.btnPromptOk.click();
                    }
                }
            });
        }
        if (nodes.chatPromptInputSecondary) {
            nodes.chatPromptInputSecondary.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (nodes.btnPromptOk) nodes.btnPromptOk.click();
                }
            });
        }
    },

    // --- 聊天交互模块核心方法与事件 ---

    bindConversationEvents: function() {
        const { ctx } = this;
        const nodes = ctx.nodes;

        // 1. 返回与菜单
        if (nodes.convBackBtn) {
            nodes.convBackBtn.addEventListener('click', () => {
                nodes.convView.classList.remove('active');
                if (ctx.sessionModule && typeof ctx.sessionModule.renderChatList === 'function') {
                    ctx.sessionModule.renderChatList();
                }
            });
        }

        // 2. 消息多选条
        if (nodes.btnSelectBarCancel) {
            nodes.btnSelectBarCancel.addEventListener('click', () => this.exitMessageSelectMode());
        }
        if (nodes.btnSelectBarAll) {
            nodes.btnSelectBarAll.addEventListener('click', () => {
                if (!ctx.currentPersona) return;
                const history = window.ChatStorage.getChatHistory(ctx.currentPersona.id);
                if (ctx.selectedMessageIndices.size === history.length) {
                    ctx.selectedMessageIndices.clear();
                } else {
                    history.forEach((_, idx) => ctx.selectedMessageIndices.add(idx));
                }
                this.updateSelectBarUI();
            });
        }
        if (nodes.btnSelectBarDelete) {
            nodes.btnSelectBarDelete.addEventListener('click', () => {
                if (ctx.selectedMessageIndices.size === 0) return;
                window.showChatConfirm('批量删除消息', `确定要删除选中的 ${ctx.selectedMessageIndices.size} 条消息吗？删除后不可恢复。`, () => {
                    if (!ctx.currentPersona) return;
                    const charId = ctx.currentPersona.id;
                    let history = window.ChatStorage.getChatHistory(charId);
                    
                    const indicesToDelete = Array.from(ctx.selectedMessageIndices).sort((a, b) => b - a);
                    indicesToDelete.forEach(idx => {
                        if (history[idx]) {
                            history.splice(idx, 1);
                        }
                    });
                    
                    window.ChatStorage.saveChatHistory(charId, history);
                    
                    if (history.length > 0) {
                        let lastMessageContent = '暂无消息';
                        for (let j = history.length - 1; j >= 0; j--) {
                            if (history[j].role !== 'system') {
                                lastMessageContent = history[j].content;
                                break;
                            }
                        }
                        ctx.currentPersona.message = lastMessageContent;
                    } else {
                        ctx.currentPersona.message = '暂无消息';
                    }
                    
                    this.exitMessageSelectMode();
                    this.openConversation(ctx.currentPersona);
                    if (ctx.sessionModule) ctx.sessionModule.renderChatList();
                });
            });
        }

        // 3. 消息区点击（包括处理多选）
        if (nodes.convMessages) {
            nodes.convMessages.addEventListener('click', (e) => {
                if (ctx.isMessageSelectMode) {
                    const row = e.target.closest('.chat-bubble-row');
                    if (row) {
                        const idx = parseInt(row.getAttribute('data-msg-idx'));
                        if (!isNaN(idx)) {
                            if (ctx.selectedMessageIndices.has(idx)) {
                                ctx.selectedMessageIndices.delete(idx);
                            } else {
                                ctx.selectedMessageIndices.add(idx);
                            }
                            this.updateSelectBarUI();
                        }
                    }
                } else {
                    if (nodes.convExtPanel && nodes.convExtPanel.style.display !== 'none') {
                        nodes.convExtPanel.style.display = 'none';
                        if (nodes.convPlusBtn) nodes.convPlusBtn.style.transform = 'rotate(0deg)';
                    }
                    if (nodes.convEmojiPanel && nodes.convEmojiPanel.style.display !== 'none') {
                        nodes.convEmojiPanel.style.display = 'none';
                    }
                }
            });
        }

        // 4. 引用取消
        if (nodes.quoteCloseBtn) {
            nodes.quoteCloseBtn.addEventListener('click', () => {
                ctx.currentQuote = null;
                if (nodes.quotePreview) nodes.quotePreview.style.display = 'none';
            });
        }

        // 5. 输入框与发送
        if (nodes.convInput) {
            nodes.convInput.addEventListener('input', () => {
                if (nodes.convInput.value.trim().length > 0) {
                    nodes.convSendBtn.classList.remove('disabled');
                    nodes.convSendBtn.classList.add('active');
                } else {
                    nodes.convSendBtn.classList.add('disabled');
                    nodes.convSendBtn.classList.remove('active');
                }
            });
            nodes.convInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (nodes.convInput.value.trim().length > 0) {
                        nodes.convSendBtn.click();
                    }
                }
            });
        }
        if (nodes.convSendBtn) {
            nodes.convSendBtn.addEventListener('click', () => {
                let text = nodes.convInput.value.trim();
                if (!text || !ctx.currentPersona) return;
                
                if (ctx.currentQuote) {
                    text = text + `\n[[QUOTE_TEXT:${ctx.currentQuote.name}|${ctx.currentQuote.text}]]`;
                    ctx.currentQuote = null;
                    if (nodes.quotePreview) nodes.quotePreview.style.display = 'none';
                }
                
                const charId = ctx.currentPersona.id;
                const history = window.ChatStorage.getChatHistory(charId);

                const mediaRegexForSplit = /(\[\[(?:EMOJI|IMAGE|VOICE|LOCATION|TRANSFER|QUOTE_TEXT)[^\]]*(?:\]\])?)/gi;
                let parts = text.split(mediaRegexForSplit).map(s => s.trim()).filter(s => s);

                if (parts.length === 0) return;

                parts.forEach(part => {
                    const newMsg = { role: 'user', content: part, timestamp: Date.now() };
                    this.addBubble('me', part, null, false, newMsg, history.length);
                    history.push(newMsg);
                });

                nodes.convInput.value = '';
                nodes.convSendBtn.classList.add('disabled');
                nodes.convSendBtn.classList.remove('active');
                
                window.ChatStorage.saveChatHistory(charId, history);
                
                ctx.currentPersona.message = parts[parts.length - 1];
                const finalTimezone = (ctx.currentPersona.rawCharData && ctx.currentPersona.rawCharData.timezone) || Intl.DateTimeFormat().resolvedOptions().timeZone;
                ctx.currentPersona.time = this.getLocalTimeByTimezone(finalTimezone);
            });
        }

        // 6. 扩展菜单开关
        if (nodes.convPlusBtn && nodes.convExtPanel) {
            nodes.convPlusBtn.addEventListener('click', () => {
                if (nodes.convEmojiPanel) nodes.convEmojiPanel.style.display = 'none';
                if (nodes.convExtPanel.style.display === 'none') {
                    nodes.convExtPanel.style.display = 'grid';
                    nodes.convPlusBtn.style.transform = 'rotate(45deg)';
                } else {
                    nodes.convExtPanel.style.display = 'none';
                    nodes.convPlusBtn.style.transform = 'rotate(0deg)';
                }
                setTimeout(() => {
                    nodes.convMessages.scrollTop = nodes.convMessages.scrollHeight;
                }, 50);
            });
        }

        // 7. 扩展面板按键
        const btnExtReroll = ctx.container.querySelector('#btn-ext-reroll');
        const btnExtPause = ctx.container.querySelector('#btn-ext-pause');
        const btnExtVoice = ctx.container.querySelector('#btn-ext-voice');
        const btnExtImage = ctx.container.querySelector('#btn-ext-image');
        const btnExtLocation = ctx.container.querySelector('#btn-ext-location');
        const btnExtTransfer = ctx.container.querySelector('#btn-ext-transfer');
        
        if (btnExtReroll) {
            btnExtReroll.addEventListener('click', () => {
                if (!ctx.currentPersona) return;
                const charId = ctx.currentPersona.id;
                let history = window.ChatStorage.getChatHistory(charId);
                
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
                    window.showChatAlert('提示', '最近没有可以重ROLL的回复。');
                    return;
                }
                
                history = history.slice(0, i + 1);
                window.ChatStorage.saveChatHistory(charId, history);
                
                let lastMessageContent = '暂无消息';
                if (history.length > 0) {
                    for (let j = history.length - 1; j >= 0; j--) {
                        if (history[j].role !== 'system') {
                            lastMessageContent = history[j].content;
                            break;
                        }
                    }
                }
                ctx.currentPersona.message = lastMessageContent;
                const finalTimezone = (ctx.currentPersona.rawCharData && ctx.currentPersona.rawCharData.timezone) || Intl.DateTimeFormat().resolvedOptions().timeZone;
                ctx.currentPersona.time = this.getLocalTimeByTimezone(finalTimezone);
                if (ctx.sessionModule) ctx.sessionModule.renderChatList();
                
                this.openConversation(ctx.currentPersona);
                nodes.convExtPanel.style.display = 'none';
                nodes.convPlusBtn.style.transform = 'rotate(0deg)';
                
                this.triggerAIReply();
            });
        }

        if (btnExtPause) {
            btnExtPause.addEventListener('click', () => {
                ctx.aiReplyPaused = true;
                if (ctx.aiAbortController) {
                    ctx.aiAbortController.abort();
                    ctx.aiAbortController = null;
                }
                const typingBubble = document.getElementById('typing-bubble');
                if (typingBubble) typingBubble.remove();
                if (ctx.currentPersona) {
                    nodes.convName.textContent = ctx.currentPersona.name;
                }
                window.showChatAlert('已暂停', '已中止 AI 请求与连发。');
                nodes.convExtPanel.style.display = 'none';
                nodes.convPlusBtn.style.transform = 'rotate(0deg)';
            });
        }

        if (btnExtVoice) {
            btnExtVoice.addEventListener('click', () => {
                if (!ctx.currentPersona) return;
                window.showChatPrompt('发送语音', '', (text) => {
                    if (!text || !text.trim()) return;
                    const charId = ctx.currentPersona.id;
                    const history = window.ChatStorage.getChatHistory(charId);
                    
                    const voiceText = `[[VOICE:${text.trim()}]]`;
                    const newMsg = { role: 'user', content: voiceText, timestamp: Date.now() };
                    this.addBubble('me', voiceText, null, false, newMsg, history.length);
                    history.push(newMsg);
                    window.ChatStorage.saveChatHistory(charId, history);
                    
                    ctx.currentPersona.message = voiceText;
                    const finalTimezone = (ctx.currentPersona.rawCharData && ctx.currentPersona.rawCharData.timezone) || Intl.DateTimeFormat().resolvedOptions().timeZone;
                    ctx.currentPersona.time = this.getLocalTimeByTimezone(finalTimezone);
                    if (ctx.sessionModule) ctx.sessionModule.renderChatList();
                    
                    nodes.convExtPanel.style.display = 'none';
                    nodes.convPlusBtn.style.transform = 'rotate(0deg)';
                }, false, '', true);
            });
        }

        if (btnExtImage) {
            btnExtImage.addEventListener('click', () => {
                if (!ctx.currentPersona) return;
                if (nodes.chatPromptInput) {
                    nodes.chatPromptInput.placeholder = '用文字描述这张图片的内容...';
                }
                window.showChatPrompt('发送图片', '', (text) => {
                    if (nodes.chatPromptInput) {
                        nodes.chatPromptInput.placeholder = '';
                    }
                    if (!text || !text.trim()) return;
                    const charId = ctx.currentPersona.id;
                    const history = window.ChatStorage.getChatHistory(charId);
                    
                    const imgText = `[[IMAGE:${text.trim()}]]`;
                    const newMsg = { role: 'user', content: imgText, timestamp: Date.now() };
                    this.addBubble('me', imgText, null, false, newMsg, history.length);
                    history.push(newMsg);
                    window.ChatStorage.saveChatHistory(charId, history);
                    
                    ctx.currentPersona.message = imgText;
                    const finalTimezone = (ctx.currentPersona.rawCharData && ctx.currentPersona.rawCharData.timezone) || Intl.DateTimeFormat().resolvedOptions().timeZone;
                    ctx.currentPersona.time = this.getLocalTimeByTimezone(finalTimezone);
                    if (ctx.sessionModule) ctx.sessionModule.renderChatList();
                    
                    nodes.convExtPanel.style.display = 'none';
                    nodes.convPlusBtn.style.transform = 'rotate(0deg)';
                }, false, '', true);
            });
        }

        const chatLocationPopup = ctx.container.querySelector('#chat-location-popup');
        const chatLocationInput = ctx.container.querySelector('#chat-location-input');
        const btnLocationOk = ctx.container.querySelector('.btn-location-ok');
        const btnLocationCancel = ctx.container.querySelector('.btn-location-cancel');
        const btnGetCurrentLocation = ctx.container.querySelector('#btn-get-current-location');

        if (btnExtLocation) {
            btnExtLocation.addEventListener('click', () => {
                if (!ctx.currentPersona) return;
                if (chatLocationPopup) {
                    chatLocationPopup.classList.add('active');
                    if (chatLocationInput) chatLocationInput.value = '';
                }
                if (nodes.convExtPanel) nodes.convExtPanel.style.display = 'none';
                if (nodes.convPlusBtn) nodes.convPlusBtn.style.transform = 'rotate(0deg)';
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
                            window.showChatAlert('定位失败', '无法获取当前位置，请检查权限或手动输入。');
                            btnGetCurrentLocation.innerHTML = btnText;
                            btnGetCurrentLocation.disabled = false;
                        },
                        { timeout: 10000 }
                    );
                } else {
                    window.showChatAlert('不支持定位', '您的设备或浏览器不支持获取位置。');
                    btnGetCurrentLocation.innerHTML = btnText;
                    btnGetCurrentLocation.disabled = false;
                }
            });
        }
        if (btnLocationOk) {
            btnLocationOk.addEventListener('click', () => {
                if (!ctx.currentPersona) return;
                const locText = chatLocationInput ? chatLocationInput.value.trim() : '';
                if (!locText) {
                    window.showChatAlert('提示', '请输入或获取地址');
                    return;
                }
                const charId = ctx.currentPersona.id;
                const history = window.ChatStorage.getChatHistory(charId);
                const msgText = `[[LOCATION:${locText}]]`;
                const newMsg = { role: 'user', content: msgText, timestamp: Date.now() };
                this.addBubble('me', msgText, null, false, newMsg, history.length);
                history.push(newMsg);
                window.ChatStorage.saveChatHistory(charId, history);
                
                ctx.currentPersona.message = msgText;
                const finalTimezone = (ctx.currentPersona.rawCharData && ctx.currentPersona.rawCharData.timezone) || Intl.DateTimeFormat().resolvedOptions().timeZone;
                ctx.currentPersona.time = this.getLocalTimeByTimezone(finalTimezone);
                if (ctx.sessionModule) ctx.sessionModule.renderChatList();
                if (chatLocationPopup) chatLocationPopup.classList.remove('active');
            });
        }

        if (btnExtTransfer) {
            btnExtTransfer.addEventListener('click', () => {
                if (!ctx.currentPersona) return;
                window.showChatPrompt('请输入转账金额', '', (amount, remark) => {
                    amount = amount.trim();
                    if (!amount || isNaN(amount)) {
                        window.showChatAlert('提示', '请输入有效的金额数值。');
                        return;
                    }
                    remark = remark ? remark.trim() : '';
                    
                    const charId = ctx.currentPersona.id;
                    const history = window.ChatStorage.getChatHistory(charId);
                    const charConfig = JSON.parse(localStorage.getItem(`nrj-chat-config-${charId}`) || '{}');
                    
                    const transferId = 'tr_' + Date.now();
                    const text = remark ? `[[TRANSFER:${amount}|${remark}|PENDING|${transferId}]]` : `[[TRANSFER:${amount}|转账|PENDING|${transferId}]]`;
                    const systemText = remark ? `[你向{{char}}发起了转账 ${amount} 元，备注：${remark}。等待收取。]` : `[你向{{char}}发起了转账 ${amount} 元，等待收取。]`;

                    const newMsg = { role: 'user', content: text, timestamp: Date.now() };
                    this.addBubble('me', text, null, false, newMsg, history.length);
                    history.push(newMsg);
                    
                    const newSysMsg = { role: 'system', content: systemText, timestamp: Date.now() };
                    if (charConfig.hideSystemMsg === false) {
                        this.addBubble('system', systemText, null, false, newSysMsg, history.length);
                    }
                    history.push(newSysMsg);
                    
                    window.ChatStorage.saveChatHistory(charId, history);
                    ctx.currentPersona.message = text;
                    const finalTimezone = (ctx.currentPersona.rawCharData && ctx.currentPersona.rawCharData.timezone) || Intl.DateTimeFormat().resolvedOptions().timeZone;
                    ctx.currentPersona.time = this.getLocalTimeByTimezone(finalTimezone);
                    if (ctx.sessionModule) ctx.sessionModule.renderChatList();
                    
                    nodes.convExtPanel.style.display = 'none';
                    nodes.convPlusBtn.style.transform = 'rotate(0deg)';
                }, true, '添加备注（选填）', true);
            });
        }

        // 8. 消息长按菜单
        if (nodes.msgMenuOverlay) {
            nodes.msgMenuOverlay.addEventListener('click', (e) => {
                if (e.target === nodes.msgMenuOverlay) {
                    this.closeMsgMenu();
                }
            });
            nodes.msgMenuOverlay.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.closeMsgMenu();
            });
        }
        if (nodes.btnMsgCopy) {
            nodes.btnMsgCopy.addEventListener('click', () => {
                if (!ctx.activeMessageForMenu) return;
                navigator.clipboard.writeText(ctx.activeMessageForMenu.text).then(() => {
                    if (window._showChatOSToast) window._showChatOSToast('已复制', 'ph-copy');
                }).catch(() => {
                    if (window._showChatOSToast) window._showChatOSToast('复制失败', 'ph-x-circle');
                });
                this.closeMsgMenu();
            });
        }
        if (nodes.btnMsgReply) {
            nodes.btnMsgReply.addEventListener('click', () => {
                if (!ctx.activeMessageForMenu) return;
                let senderName = '未知';
                if (ctx.currentPersona) {
                    const charConfig = JSON.parse(localStorage.getItem(`nrj-chat-config-${ctx.currentPersona.id}`) || '{}');
                    const personas = window.ChatStorage.loadPersonas();
                    
                    if (ctx.activeMessageForMenu.msgObj && ctx.activeMessageForMenu.msgObj.role === 'user') {
                        let activeUserId = charConfig.userPersonaId || window.ChatStorage.getActivePersonaId();
                        let activeUser = personas.find(p => p.id === activeUserId);
                        if (!activeUser) activeUser = personas.find(p => p.id === window.ChatStorage.getActivePersonaId()) || { nickname: '我', realname: '我' };
                        senderName = activeUser.nickname || activeUser.realname || '我';
                    } else if (ctx.activeMessageForMenu.msgObj && ctx.activeMessageForMenu.msgObj.role === 'assistant') {
                        const charData = ctx.currentPersona.rawCharData || ctx.currentPersona;
                        senderName = charData.nickname || charData.realname || charData.name || '未知';
                    } else {
                        senderName = '系统';
                    }
                }

                let plainText = ctx.activeMessageForMenu.text;
                plainText = plainText.replace(/\[\[QUOTE:.*?\]\]/g, '').trim();

                ctx.currentQuote = {
                    name: senderName,
                    text: plainText
                };
                
                if (nodes.quotePreview && nodes.quoteName && nodes.quoteText) {
                    nodes.quoteName.textContent = senderName;
                    let previewText = plainText;
                    previewText = previewText.replace(/\[\[EMOJI:[^|\]]+\|([^\]]+)\]\]/g, '[$1]').replace(/\[\[EMOJI:[^\]]+\]\]/g, '[表情]');
                    if (previewText.includes('[[IMAGE:')) previewText = '[图片]';
                    else if (previewText.includes('[[VOICE:')) previewText = '[语音]';
                    else if (previewText.includes('[[LOCATION:')) previewText = '[位置]';
                    else if (previewText.includes('[[TRANSFER:')) previewText = '[转账]';
                    
                    nodes.quoteText.textContent = previewText;
                    nodes.quotePreview.style.display = 'block';
                }
                this.closeMsgMenu();
                if (nodes.convInput) nodes.convInput.focus();
            });
        }
        if (nodes.btnMsgEdit) {
            nodes.btnMsgEdit.addEventListener('click', () => {
                if (!ctx.activeMessageForMenu) return;
                const currentText = ctx.activeMessageForMenu.text;
                const targetIdx = ctx.activeMessageForMenu.index;
                window.showChatPrompt('编辑消息', currentText, (newText) => {
                    if (!newText || !newText.trim() || newText.trim() === currentText) return;
                    if (!ctx.currentPersona) return;
                    
                    const charId = ctx.currentPersona.id;
                    let history = window.ChatStorage.getChatHistory(charId);
                    
                    if (history[targetIdx]) {
                        history[targetIdx].content = newText.trim();
                        window.ChatStorage.saveChatHistory(charId, history);
                        this.openConversation(ctx.currentPersona);
                        if (targetIdx === history.length - 1) {
                            ctx.currentPersona.message = newText.trim();
                            if (ctx.sessionModule) ctx.sessionModule.renderChatList();
                        }
                    }
                });
                this.closeMsgMenu();
            });
        }
        if (nodes.btnMsgRecall) {
            nodes.btnMsgRecall.addEventListener('click', () => {
                if (!ctx.activeMessageForMenu) return;
                const targetIdx = ctx.activeMessageForMenu.index;
                const msgObj = ctx.activeMessageForMenu.msgObj;
                
                const currentTime = Date.now();
                const msgTime = msgObj && msgObj.timestamp ? msgObj.timestamp : currentTime;
                if (currentTime - msgTime > 5 * 60 * 1000) {
                    window.showChatAlert('提示', '发送超过5分钟的消息无法撤回。');
                    this.closeMsgMenu();
                    return;
                }

                window.showChatConfirm('撤回消息', '确定要撤回这条消息吗？', () => {
                    if (!ctx.currentPersona) return;
                    const charId = ctx.currentPersona.id;
                    let history = window.ChatStorage.getChatHistory(charId);
                    
                    if (history[targetIdx]) {
                        const originalContent = history[targetIdx].content;
                        let userName = '你';
                        const charConfig = JSON.parse(localStorage.getItem(`nrj-chat-config-${charId}`) || '{}');
                        const personas = window.ChatStorage.loadPersonas();
                        const activeUserId = charConfig.userPersonaId || window.ChatStorage.getActivePersonaId();
                        let activeUser = personas.find(p => p.id === activeUserId);
                        if (!activeUser) {
                            activeUser = personas.find(p => p.id === window.ChatStorage.getActivePersonaId()) || { nickname: '我', realname: '我' };
                        }
                        userName = activeUser.nickname || activeUser.realname || '我';

                        history[targetIdx] = {
                            role: 'system',
                            content: `[${userName} 刚刚撤回了消息，内容是：${originalContent}]`,
                            timestamp: Date.now(),
                            isUserRecall: true,
                            recallContent: originalContent
                        };

                        window.ChatStorage.saveChatHistory(charId, history);
                        this.openConversation(ctx.currentPersona);
                        if (history.length > 0) {
                            let lastMessageContent = '暂无消息';
                            for (let j = history.length - 1; j >= 0; j--) {
                                if (history[j].role !== 'system') {
                                    lastMessageContent = history[j].content;
                                    break;
                                }
                            }
                            ctx.currentPersona.message = lastMessageContent;
                        } else {
                            ctx.currentPersona.message = '暂无消息';
                        }
                        if (ctx.sessionModule) ctx.sessionModule.renderChatList();
                    }
                });
                this.closeMsgMenu();
            });
        }
        if (nodes.btnMsgSelect) {
            nodes.btnMsgSelect.addEventListener('click', () => {
                if (!ctx.activeMessageForMenu) return;
                ctx.isMessageSelectMode = true;
                ctx.selectedMessageIndices.clear();
                ctx.selectedMessageIndices.add(ctx.activeMessageForMenu.index);
                
                if (nodes.chatComposerArea) nodes.chatComposerArea.style.display = 'none';
                if (nodes.chatMessageSelectBar) nodes.chatMessageSelectBar.classList.add('active');
                if (nodes.convMessages) nodes.convMessages.classList.add('select-mode');
                
                this.updateSelectBarUI();
                this.closeMsgMenu();
            });
        }
        if (nodes.btnMsgDelete) {
            nodes.btnMsgDelete.addEventListener('click', () => {
                if (!ctx.activeMessageForMenu) return;
                const targetIdx = ctx.activeMessageForMenu.index;
                window.showChatConfirm('删除消息', '确定要删除这条消息吗？删除后不可恢复。', () => {
                    if (!ctx.currentPersona) return;
                    const charId = ctx.currentPersona.id;
                    let history = window.ChatStorage.getChatHistory(charId);
                    
                    if (history[targetIdx]) {
                        history.splice(targetIdx, 1);
                        window.ChatStorage.saveChatHistory(charId, history);
                        this.openConversation(ctx.currentPersona);
                        if (history.length > 0) {
                            let lastMessageContent = '暂无消息';
                            for (let j = history.length - 1; j >= 0; j--) {
                                if (history[j].role !== 'system') {
                                    lastMessageContent = history[j].content;
                                    break;
                                }
                            }
                            ctx.currentPersona.message = lastMessageContent;
                        } else {
                            ctx.currentPersona.message = '暂无消息';
                        }
                        if (ctx.sessionModule) ctx.sessionModule.renderChatList();
                    }
                });
                this.closeMsgMenu();
            });
        }

        // 9. AI 回复触发按钮
        const btnAiReply = ctx.container.querySelector('.chat-composer-btn-icon.ai');
        if (btnAiReply) {
            btnAiReply.addEventListener('click', () => {
                if (nodes.convName.textContent === '正在输入...') return;
                this.triggerAIReply();
            });
        }
    },

    showMsgMenu: function(e, text, msgObj, idx, bubbleEl) {
        e.preventDefault();
        const { ctx } = this;
        if (ctx.isMessageSelectMode) return;
        ctx.activeMessageForMenu = { text, msgObj, index: idx, bubbleEl };

        const { btnMsgCopy, btnMsgEdit, btnMsgReply, btnMsgRecall, msgMenuOverlay } = ctx.nodes;

        let plainText = text;
        if (plainText.match(/\[\[TRANSFER:/) || plainText.match(/\[\[VOICE:/) || plainText.match(/\[\[IMAGE:/) || plainText.match(/\[\[LOCATION:/)) {
            if (btnMsgCopy) btnMsgCopy.style.display = 'none';
            if (btnMsgEdit) btnMsgEdit.style.display = 'none';
            if (btnMsgReply) btnMsgReply.style.display = 'none';
        } else {
            if (btnMsgCopy) btnMsgCopy.style.display = 'flex';
            if (btnMsgEdit) btnMsgEdit.style.display = 'flex';
            if (btnMsgReply) btnMsgReply.style.display = 'flex';
        }

        if (msgObj && msgObj.role === 'user') {
            if (btnMsgRecall) btnMsgRecall.style.display = 'flex';
        } else {
            if (btnMsgRecall) btnMsgRecall.style.display = 'none';
        }

        if (msgMenuOverlay) msgMenuOverlay.style.display = 'flex';
    },

    closeMsgMenu: function() {
        const { ctx } = this;
        if (ctx.nodes.msgMenuOverlay) ctx.nodes.msgMenuOverlay.style.display = 'none';
        ctx.activeMessageForMenu = null;
    },

    updateSelectBarUI: function() {
        const { ctx } = this;
        if (!ctx.currentPersona) return;
        const history = window.ChatStorage.getChatHistory(ctx.currentPersona.id);
        const totalMessages = history.length;
        const { btnSelectBarDelete, btnSelectBarAll, convMessages } = ctx.nodes;
        
        if (btnSelectBarDelete) {
            btnSelectBarDelete.textContent = `删除(${ctx.selectedMessageIndices.size})`;
            btnSelectBarDelete.disabled = ctx.selectedMessageIndices.size === 0;
        }
        if (btnSelectBarAll) {
            if (ctx.selectedMessageIndices.size > 0 && ctx.selectedMessageIndices.size === totalMessages) {
                btnSelectBarAll.textContent = '取消全选';
            } else {
                btnSelectBarAll.textContent = '全选';
            }
        }
        
        if (convMessages) {
            const rows = convMessages.querySelectorAll('.chat-bubble-row');
            rows.forEach(row => {
                const idx = parseInt(row.getAttribute('data-msg-idx'));
                if (!isNaN(idx)) {
                    if (ctx.selectedMessageIndices.has(idx)) {
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
        }
    },

    exitMessageSelectMode: function() {
        const { ctx } = this;
        ctx.isMessageSelectMode = false;
        ctx.selectedMessageIndices.clear();
        
        const { chatMessageSelectBar, chatComposerArea, convMessages } = ctx.nodes;
        if (chatMessageSelectBar) chatMessageSelectBar.classList.remove('active');
        if (chatComposerArea) chatComposerArea.style.display = 'block';
        if (convMessages) convMessages.classList.remove('select-mode');
        
        if (convMessages) {
            const rows = convMessages.querySelectorAll('.chat-bubble-row');
            rows.forEach(row => {
                row.classList.remove('selected');
                const checkbox = row.querySelector('.msg-checkbox');
                if (checkbox) checkbox.innerHTML = '';
            });
        }
    },

    updateTokenStats: function() {
        const { ctx } = this;
        if (!ctx.currentPersona) return;
        const charId = ctx.currentPersona.id;
        const charData = ctx.currentPersona.rawCharData || ctx.currentPersona;
        const charConfig = JSON.parse(localStorage.getItem(`nrj-chat-config-${charId}`) || '{}');
        
        const personas = window.ChatStorage.loadPersonas();
        let activeUserId = charConfig.userPersonaId || window.ChatStorage.getActivePersonaId();
        let activeUser = personas.find(p => p.id === activeUserId) || { realname: '我', nickname: '我', bio: '一个普通人。' };
        
        const charNameStr = charData.nickname || charData.realname || '未命名角色';
        const userNameStr = activeUser.nickname || activeUser.realname || '我';

        let userIdentityInfo = `他/她叫 ${activeUser.realname || activeUser.nickname || '未命名用户'}`;
        if (activeUser.nickname) {
            userIdentityInfo += `，你给对方昵称是 ${activeUser.nickname}`;
        }
        userIdentityInfo += `。`;

        const finalPrompt = charConfig.charPrompt && charConfig.charPrompt.trim() !== '' ? charConfig.charPrompt : (localStorage.getItem('nrj-global-system-prompt') || this.META_PROMPT);

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
        
        let baseToken = window.ChatStorage.estimateTokens(baseText);
        
        let multiMsgPrompt = "";
        if (charConfig.multiMsgEnabled) {
            const minMsg = charConfig.multiMsgMin || 1;
            const maxMsg = charConfig.multiMsgMax || 3;
            multiMsgPrompt = `\n\n【回复格式要求】\n你现在正在像真实人类一样连续发送多条短消息。\n你必须连续回复 ${minMsg} 到 ${maxMsg} 条消息，多条消息之间必须严格使用 [SPLIT] 作为分隔符（绝不要用其他符号代替）。\n例如：第一条消息[SPLIT]第二条消息[SPLIT]第三条消息\n不要在最后一条消息后加 [SPLIT]。每条消息都很简短口语化。`;
        } else {
            multiMsgPrompt = `\n\n【回复格式要求】\n你现在正在像真实人类一样在聊天软件上发消息。\n你可以自由决定回复一条还是多条消息（不限制条数）。\n如果只有一句话，直接回复即可。\n如果你想连续发送多条消息，多条消息之间必须严格使用 [SPLIT] 作为分隔符。\n例如：第一条消息[SPLIT]第二条消息[SPLIT]第三条消息\n不要在最后一条消息后加 [SPLIT]。每条消息都很简短口语化。`;
        }
        baseToken += window.ChatStorage.estimateTokens(multiMsgPrompt);

        let wbToken = 0;
        if (charConfig.worldbookId) {
            try {
                const wbs = JSON.parse(localStorage.getItem('nrj-worldbooks') || '[]');
                const selectedWb = wbs.find(w => w.id === charConfig.worldbookId);
                if (selectedWb && selectedWb.entries) {
                    const enabledEntries = selectedWb.entries.filter(e => e.enabled !== false);
                    const wbContent = enabledEntries.map(e => `[${e.keyword}]: ${e.content}`).join("\n");
                    wbToken = window.ChatStorage.estimateTokens(wbContent);
                }
            } catch(e) {}
        }

        let ltToken = 0;
        const mems = window.ChatStorage.getMemory(charId);
        if (mems.length > 0) {
            const ltContent = mems.map(m => m.content).join('\n');
            ltToken = window.ChatStorage.estimateTokens(ltContent);
        }

        const history = window.ChatStorage.getChatHistory(charId);
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
            stToken += window.ChatStorage.estimateTokens(replaceVars(m.content, charNameStr, userNameStr, m.role));
        });

        let totalToken = 0;
        history.forEach(m => {
            totalToken += window.ChatStorage.estimateTokens(replaceVars(m.content, charNameStr, userNameStr, m.role));
        });

        const singleTotal = baseToken + wbToken + ltToken + stToken;

        const elSingle = ctx.container.querySelector('#cs-token-single');
        const elBase = ctx.container.querySelector('#cs-token-base');
        const elWb = ctx.container.querySelector('#cs-token-worldbook');
        const elLt = ctx.container.querySelector('#cs-token-longterm');
        const elSt = ctx.container.querySelector('#cs-token-shortterm');
        const elTotal = ctx.container.querySelector('#cs-token-total');

        if (elSingle) elSingle.textContent = singleTotal.toLocaleString();
        if (elBase) elBase.textContent = baseToken.toLocaleString();
        if (elWb) elWb.textContent = wbToken.toLocaleString();
        if (elLt) elLt.textContent = ltToken.toLocaleString();
        if (elSt) elSt.textContent = stToken.toLocaleString();
        if (elTotal) elTotal.textContent = totalToken.toLocaleString();
    },

    applyChatBarTransparency: function(charId, topOverride = null, bottomOverride = null) {
        const { ctx } = this;
        const charConfig = JSON.parse(localStorage.getItem(`nrj-chat-config-${charId}`) || '{}');
        const topTrans = topOverride !== null ? topOverride : (charConfig.topBarTransparency !== undefined ? charConfig.topBarTransparency : (charConfig.barTransparency !== undefined ? charConfig.barTransparency : 90));
        const bottomTrans = bottomOverride !== null ? bottomOverride : (charConfig.bottomBarTransparency !== undefined ? charConfig.bottomBarTransparency : (charConfig.barTransparency !== undefined ? charConfig.barTransparency : 90));
        
        const topAlpha = topTrans / 100;
        const bottomAlpha = bottomTrans / 100;
        
        const header = ctx.container.querySelector('.chat-conv-header');
        const composerBox = ctx.container.querySelector('.chat-composer-box');
        const composerArea = ctx.container.querySelector('.chat-composer-area');
        
        if (header) header.style.backgroundColor = `rgba(255, 255, 255, ${topAlpha})`;
        if (composerBox) composerBox.style.backgroundColor = `rgba(255, 255, 255, ${bottomAlpha})`;
        if (composerArea) {
            if (bottomAlpha < 1) {
                composerArea.style.background = 'transparent';
            } else {
                composerArea.style.background = 'linear-gradient(to top, #F4F4F4 50%, rgba(244,244,244,0))';
            }
        }
    },

    applyTopbarStyle: async function(charId) {
        const { ctx } = this;
        const charConfig = JSON.parse(localStorage.getItem(`nrj-chat-config-${charId}`) || '{}');
        const style = charConfig.topbarStyle || 'default';
        const persona = ctx.currentPersona || { id: charId };
        
        const titleDefault = ctx.nodes.convView.querySelector('#chat-conv-title-default');
        const titleWave = ctx.nodes.convView.querySelector('#chat-conv-title-wave');
        const titleEcg = ctx.nodes.convView.querySelector('#chat-conv-title-ecg');
        const polaroidElement = ctx.nodes.convView.querySelector('#chat-conv-title-polaroid');
        
        if (titleDefault) titleDefault.style.display = 'none';
        if (titleWave) titleWave.style.display = 'none';
        if (titleEcg) titleEcg.style.display = 'none';
        if (polaroidElement) polaroidElement.style.display = 'none';

        // Load avatars function helper
        const loadAvatarsForLineStyle = async (containerNode) => {
            let userAvatarUrl = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
            let activeUserId = charConfig.userPersonaId || window.ChatStorage.getActivePersonaId();
            if (activeUserId && window.ImageStorageManager) {
                try {
                    const url = await window.ImageStorageManager.loadFromIndexedDB(`persona-avatar-${activeUserId}`);
                    if (url) userAvatarUrl = url;
                } catch(e) {}
            }
            const imgUser = containerNode.querySelector('img[id$="-user-avatar"]');
            if (imgUser) imgUser.src = userAvatarUrl;
            
            let charAvatarUrl = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
            if (persona && persona.avatarUrl) {
                charAvatarUrl = persona.avatarUrl;
            }
            const imgChar = containerNode.querySelector('img[id$="-char-avatar"]');
            if (imgChar) imgChar.src = charAvatarUrl;
        };

        if (style === 'wave') {
            if (titleWave) {
                titleWave.style.display = 'flex';
                await loadAvatarsForLineStyle(titleWave);
            }
        } else if (style === 'ecg') {
            if (titleEcg) {
                titleEcg.style.display = 'flex';
                await loadAvatarsForLineStyle(titleEcg);
            }
        } else {
            // style === 'default' or 'polaroid'
            if (titleDefault) {
                titleDefault.style.display = 'flex';
                const nameEl = titleDefault.querySelector('#chat-conv-name');
                if (nameEl) nameEl.textContent = persona.nickname || persona.realname || persona.name || '未命名角色';
            }

            // 处理附挂拍立得
            const polaroidPos = charConfig.polaroidPos || 'none';
            if (polaroidElement && (style === 'polaroid' || polaroidPos !== 'none')) {
                polaroidElement.style.display = 'flex';
                
                // 处理位置
                polaroidElement.className = 'chat-header-polaroid-style';
                if (style === 'polaroid' && (!charConfig.polaroidPos || charConfig.polaroidPos === 'none')) {
                    polaroidElement.classList.add('pos-center');
                } else if (polaroidPos === 'left') {
                    polaroidElement.classList.add('pos-left');
                } else if (polaroidPos === 'right') {
                    polaroidElement.classList.add('pos-right');
                } else {
                    polaroidElement.classList.add('pos-center');
                }

                // 处理偏移和缩放
                const polaroidSize = charConfig.polaroidSize !== undefined ? charConfig.polaroidSize : 100;
                const offsetX = charConfig.polaroidOffsetX || 0;
                const offsetY = charConfig.polaroidOffsetY || 0;
                
                let scaleVal = polaroidSize / 100;
                let transformStr = `translate(${offsetX}px, ${offsetY}px) scale(${scaleVal})`;
                
                if (polaroidElement.classList.contains('pos-center')) {
                    // 如果是居中，原本有 translateX(-50%) 的基础偏移，我们需要把它和自定义偏移结合起来
                    transformStr = `translateX(calc(-50% + ${offsetX}px)) translateY(${offsetY}px) scale(${scaleVal})`;
                }
                
                polaroidElement.style.transform = transformStr;

                // 加载照片
                let polaroidUrl = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                if (window.ImageStorageManager) {
                    try {
                        const url = await window.ImageStorageManager.loadFromIndexedDB(`chat-polaroid-${charId}`);
                        if (url) polaroidUrl = url;
                    } catch(e) {}
                }
                const imgPolaroid = polaroidElement.querySelector('#chat-polaroid-img');
                if (imgPolaroid) imgPolaroid.src = polaroidUrl;
                
                const frame = polaroidElement.querySelector('#chat-polaroid-frame');
                if (frame && !frame.dataset.bound) {
                    frame.dataset.bound = "true";
                    frame.addEventListener('click', () => {
                        if (typeof showImageModal === 'function') {
                            showImageModal(`chat-polaroid-${charId}`, async (result) => {
                                let newUrl = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                                if (result && result.type === 'reset') {
                                    if (window.ImageStorageManager) {
                                        await window.ImageStorageManager.deleteFromIndexedDB(`chat-polaroid-${charId}`);
                                    }
                                } else if (result && result.url) {
                                    newUrl = result.url;
                                    if (window.ImageStorageManager) {
                                        await window.ImageStorageManager.saveToIndexedDB(`chat-polaroid-${charId}`, newUrl);
                                    }
                                }
                                if (imgPolaroid) imgPolaroid.src = newUrl;
                            });
                        }
                    });
                }
            }
        }
    },

    applyChatWallpaper: async function(charId) {
        const { ctx } = this;
        const convView = ctx.nodes.convView;
        if (!convView) return;
        
        const charConfig = JSON.parse(localStorage.getItem(`nrj-chat-config-${charId}`) || '{}');
        let bgUrl = '';
        
        if (charConfig.chatBgType === 'local') {
            if (window.ImageStorageManager) {
                try {
                    const localUrl = await window.ImageStorageManager.loadFromIndexedDB(`chat-bg-${charId}`);
                    if (localUrl) bgUrl = localUrl;
                } catch(e) {}
            }
        } else if (charConfig.chatBgType === 'url' && charConfig.chatBgUrl) {
            bgUrl = charConfig.chatBgUrl;
        }

        if (!bgUrl && window.ImageStorageManager) {
            try {
                const globalUrl = await window.ImageStorageManager.loadFromIndexedDB('global-chat-bg');
                if (globalUrl) bgUrl = globalUrl;
            } catch(e) {}
        }
        
        if (bgUrl) {
            convView.style.backgroundImage = `url("${bgUrl}")`;
            convView.style.backgroundSize = 'cover';
            convView.style.backgroundPosition = 'center';
            convView.style.backgroundColor = '#F4F4F4';
        } else {
            convView.style.backgroundImage = 'none';
            convView.style.backgroundColor = '#F4F4F4';
        }
    },

    addBubble: function(type, text, persona = null, isTyping = false, msgObj = null, indexInHistory = -1) {
        const { ctx } = this;
        const row = document.createElement('div');
        row.className = `chat-bubble-row ${type}`;
        if (isTyping) row.id = 'typing-bubble';
        if (indexInHistory !== -1) row.setAttribute('data-msg-idx', indexInHistory);
        
        let charConfigStr = '{}';
        if (ctx.currentPersona && ctx.currentPersona.id) {
            charConfigStr = localStorage.getItem(`nrj-chat-config-${ctx.currentPersona.id}`) || '{}';
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
                timeStr = cConfig.customTimeFormat.replace(/{HH}/g, hh).replace(/{mm}/g, mm).replace(/{ss}/g, ss);
            } else if (msgTimeFormat === 'hms') {
                timeStr = hh + ':' + mm + ':' + ss;
            } else {
                timeStr = hh + ':' + mm;
            }
        }

        const personas = window.ChatStorage.loadPersonas();
        let activeUserId = cConfig.userPersonaId || window.ChatStorage.getActivePersonaId();
        let activeUser = personas.find(p => p.id === activeUserId);
        if (!activeUser) activeUser = personas.find(p => p.id === window.ChatStorage.getActivePersonaId()) || { id: window.ChatStorage.getActivePersonaId(), nickname: '我', realname: '我' };

        const params = {
            type, text, persona, isTyping, msgObj, indexInHistory,
            charConfig: cConfig,
            activeUser,
            quoteStyleOption: cConfig.quoteStyle || 'inside',
            bubbleStyle: cConfig.bubbleStyle || 'default',
            bColors: cConfig.bubbleColors || { themBg: '#EFEFEF', themText: '#111111', meBg: '#111111', meText: '#ffffff' },
            voiceWaveEnabled: !!cConfig.voiceWaveEnabled,
            avatarDisplay: cConfig.avatarDisplay || 'hide_me',
            charAvatarShape: cConfig.charAvatarShape || '',
            userAvatarShape: cConfig.userAvatarShape || '',
            msgTimePos: cConfig.msgTimePos || (cConfig.showMsgTimestamp === true ? 'bubble' : 'none'),
            msgTimeFormat,
            timeStr
        };

        row.innerHTML = window.ChatRender.generateBubbleHtml(params);
        ctx.nodes.convMessages.appendChild(row);
        
        let isMultiGreeting = msgObj && msgObj.isGreeting && msgObj.greetings && msgObj.greetings.length > 1;

        const bubbleEl = row.querySelector('.chat-bubble');
        if (bubbleEl && type !== 'system' && indexInHistory !== -1) {
            let pressTimer = null;
            let isDragging = false;
            const clearPressTimer = () => { if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; } };

            bubbleEl.addEventListener('touchstart', (e) => {
                isDragging = false;
                clearPressTimer();
                pressTimer = setTimeout(() => {
                    if (!isDragging) {
                        if (navigator.vibrate) navigator.vibrate(50);
                        this.showMsgMenu(e, msgObj ? msgObj.content : text, msgObj, indexInHistory, bubbleEl);
                    }
                }, 500);
            }, { passive: true });

            bubbleEl.addEventListener('touchmove', () => { isDragging = true; clearPressTimer(); }, { passive: true });
            bubbleEl.addEventListener('touchend', () => { clearPressTimer(); });
            bubbleEl.addEventListener('touchcancel', () => { clearPressTimer(); });
            bubbleEl.addEventListener('contextmenu', (e) => {
                this.showMsgMenu(e, msgObj ? msgObj.content : text, msgObj, indexInHistory, bubbleEl);
            });

            // 点击切换双语翻译
            bubbleEl.addEventListener('click', (e) => {
                if (ctx.isMessageSelectMode) return;
                let transEl = null;
                if (cConfig.translationPos === 'inside') {
                    transEl = bubbleEl.querySelector('.chat-bubble-translation');
                } else {
                    const contentWrapper = bubbleEl.closest('.chat-bubble-content-wrapper');
                    if (contentWrapper) {
                        transEl = contentWrapper.querySelector('.chat-bubble-translation-outside');
                    }
                }
                if (transEl) {
                    transEl.style.display = transEl.style.display === 'none' ? 'block' : 'none';
                }
            });
        }

        const imageNode = row.querySelector('.chat-image-bubble-inner');
        if (imageNode) {
            imageNode.addEventListener('click', () => {
                const imgDesc = imageNode.getAttribute('data-imgtext');
                window.showChatAlert('图片描述', imgDesc);
            });
        }

        const locationNode = row.querySelector('.chat-location-bubble-inner');
        if (locationNode) {
            locationNode.addEventListener('click', () => {
                const locDesc = locationNode.getAttribute('data-loctext');
                window.showChatAlert('详细位置', locDesc);
            });
        }

        if (isMultiGreeting) {
            const leftBtn = row.querySelector('.left-arrow');
            const rightBtn = row.querySelector('.right-arrow');
            const handleSwitch = (direction) => {
                let history = window.ChatStorage.getChatHistory(ctx.currentPersona.id);
                let msg = history[indexInHistory];
                if (msg && msg.isGreeting) {
                    let newIdx = msg.greetingIndex + direction;
                    if (newIdx < 0) newIdx = msg.greetings.length - 1;
                    if (newIdx >= msg.greetings.length) newIdx = 0;
                    msg.greetingIndex = newIdx;
                    msg.content = msg.greetings[newIdx];
                    window.ChatStorage.saveChatHistory(ctx.currentPersona.id, history);
                    
                    row.querySelector('.chat-bubble-text').innerHTML = msg.content;
                    row.querySelector('.greeting-indicator').textContent = `${newIdx + 1} / ${msg.greetings.length}`;
                    
                    if (indexInHistory === history.length - 1) {
                        ctx.currentPersona.message = msg.content;
                        if (ctx.sessionModule) ctx.sessionModule.renderChatList();
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
                    
                    const transferPopup = ctx.container.querySelector('#chat-transfer-action-popup');
                    const amountEl = ctx.container.querySelector('#transfer-action-amount');
                    const remarkEl = ctx.container.querySelector('#transfer-action-remark');
                    const btnReceive = ctx.container.querySelector('#btn-transfer-receive');
                    const btnReturn = ctx.container.querySelector('#btn-transfer-return');
                    const btnClose = ctx.container.querySelector('.btn-close-transfer');
                    
                    if (transferPopup) {
                        let remark = '转账';
                        let currentHistory = window.ChatStorage.getChatHistory(ctx.currentPersona.id);
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
                            let history = window.ChatStorage.getChatHistory(ctx.currentPersona.id);
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
                                window.ChatStorage.saveChatHistory(ctx.currentPersona.id, history);
                                this.openConversation(ctx.currentPersona);
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
            ctx.nodes.convMessages.scrollTop = ctx.nodes.convMessages.scrollHeight;
        }, 50);
    },

    openConversation: function(persona) {
        const { ctx } = this;
        const { convView, convName, convStatusDot, convStatusText, convMessages, quotePreview, customStyleTag } = ctx.nodes;
        
        if (ctx.isMessageSelectMode) {
            this.exitMessageSelectMode();
        }
        
        ctx.currentQuote = null;
        if (quotePreview) quotePreview.style.display = 'none';

        ctx.currentPersona = persona;
        convName.textContent = persona.name;
        convStatusDot.style.display = persona.isOnline ? 'block' : 'none';
        convStatusText.textContent = persona.isOnline ? 'ACTIVE NOW' : 'LAST SEEN RECENTLY';
        
        convMessages.innerHTML = '';
        
        const charConfig = JSON.parse(localStorage.getItem(`nrj-chat-config-${persona.id}`) || '{}');
        if (customStyleTag) customStyleTag.textContent = charConfig.customBubbleCss || '';
        
        this.applyChatWallpaper(persona.id);
        this.applyChatBarTransparency(persona.id);
        this.applyTopbarStyle(persona.id);
        
        let history = window.ChatStorage.getChatHistory(persona.id);
        
        if (history.length === 0 && persona.rawCharData && (persona.rawCharData.first_mes || (persona.rawCharData.greetings && persona.rawCharData.greetings.length > 0))) {
            let greetingsArray = persona.rawCharData.greetings || [persona.rawCharData.first_mes];
            if (greetingsArray.length === 0) greetingsArray = [persona.rawCharData.first_mes];
            
            const personas = window.ChatStorage.loadPersonas();
            let activeUserId = charConfig.userPersonaId || window.ChatStorage.getActivePersonaId();
            let activeUser = personas.find(p => p.id === activeUserId);
            if (!activeUser) activeUser = personas.find(p => p.id === window.ChatStorage.getActivePersonaId()) || { nickname: '我', realname: '我' };
            
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
            window.ChatStorage.saveChatHistory(persona.id, history);
            persona.message = firstMsgText;
            if (ctx.sessionModule) ctx.sessionModule.renderChatList();
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
            this.addBubble(msgType, msg.content, persona, false, msg, idx);
        });
        
        convView.classList.add('active');
        setTimeout(() => {
            convMessages.scrollTop = convMessages.scrollHeight;
        }, 50);
    },

    triggerAIReply: async function() {
        const { ctx } = this;
        if (!ctx.currentPersona) return;
        const { convName, convView } = ctx.nodes;

        if (convName.textContent === '正在输入...') return;
        
        const charId = ctx.currentPersona.id;
        const history = window.ChatStorage.getChatHistory(charId);
        
        let lastTime = null;
        if (history.length > 0) {
            lastTime = history[history.length - 1].timestamp || Date.now();
        }
        const timeSinceLast = window.ChatStorage.getTimeSince(lastTime);
        const finalTimezone = (ctx.currentPersona.rawCharData && ctx.currentPersona.rawCharData.timezone) || Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        if (!ctx.currentPersona.isCharacter) return;

        const charData = ctx.currentPersona.rawCharData;
        const charConfig = JSON.parse(localStorage.getItem(`nrj-chat-config-${ctx.currentPersona.id}`) || '{}');
        const typingStyle = charConfig.typingStyle || 'both';

        const isConvActiveInitial = convView && convView.classList.contains('active') && ctx.currentPersona && ctx.currentPersona.id === charId;
        if (isConvActiveInitial && (typingStyle === 'bubble' || typingStyle === 'both')) {
            this.addBubble('them', '<div class="typing-indicator"><span></span><span></span><span></span></div>', ctx.currentPersona, true);
        }

        const originalName = convName.textContent;
        if (typingStyle === 'title' || typingStyle === 'both') {
            convName.textContent = '正在输入...';
        }
        
        ctx.aiReplyPaused = false;
        ctx.aiAbortController = new AbortController();

        try {
            const personas = window.ChatStorage.loadPersonas();
            let activeUserId = charConfig.userPersonaId || window.ChatStorage.getActivePersonaId();
            let activeUser = personas.find(p => p.id === activeUserId);
            if (!activeUser) {
                activeUser = personas.find(p => p.id === window.ChatStorage.getActivePersonaId()) || {
                    realname: '我',
                    nickname: '我',
                    bio: '一个普通人。'
                };
            }
            
            let charTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            if (charConfig.useCharTimezone && charConfig.charTimezone) charTimezone = charConfig.charTimezone;
            else if (charData.timezone) charTimezone = charData.timezone;

            let userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            if (charConfig.useUserTimezone && charConfig.userTimezone) userTimezone = charConfig.userTimezone;

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

            const settings = JSON.parse(localStorage.getItem('nrj-api-settings') || '{}');
            if (!settings.key || !settings.url || !settings.model) {
                throw new Error('请先在设置中配置主 API！');
            }

            const shortTermCount = parseInt(charConfig.shortTermMemory, 10) || 20;
            
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

            let mems = window.ChatStorage.getMemory(charId);
            let longTermMemoryContent = "暂无长期记忆";
            if (mems.length > 0) {
                longTermMemoryContent = mems.map(m => m.content).join('\n');
            }

            let availableEmojis = [];
            const charEmojis = window.ChatStorage.loadCharEmojis ? window.ChatStorage.loadCharEmojis() : [];
            const charEmojiGroups = window.ChatStorage.loadCharEmojiGroups ? window.ChatStorage.loadCharEmojiGroups() : [];
            
            const validGroupIds = new Set();
            charEmojiGroups.forEach(g => {
                if (g.targetType === 'global' || (g.targetType === 'specific' && g.targetChars && g.targetChars.includes(charId))) {
                    validGroupIds.add(g.id);
                }
            });
            charEmojis.forEach(e => {
                if (validGroupIds.has(e.groupId)) {
                    availableEmojis.push({ id: e.id, name: e.name || '表情' });
                }
            });

            const emojiStrategy = charConfig.emojiStrategy || 'fallback_user';
            if (emojiStrategy === 'fallback_user' && availableEmojis.length === 0) {
                // To fetch emojis properly if ChatStorage doesn't export loadEmojis directly yet.
                let userEmojis = [];
                try { userEmojis = JSON.parse(localStorage.getItem('nrj-custom-emojis') || '[]'); } catch(e){}
                const fallbackGroups = charConfig.emojiFallbackGroups || [];
                if (fallbackGroups.length > 0) {
                    userEmojis.forEach(e => {
                        if (fallbackGroups.includes(e.groupId)) {
                            availableEmojis.push({ id: e.id, name: e.name || '表情' });
                        }
                    });
                }
            }

            let emojiMapping = {};
            let reverseEmojiMapping = {};
            let emojiPrompt = '';
            if (availableEmojis.length > 0) {
                emojiPrompt = `\n\n【互动：发送表情包】\n当且仅当你的情绪和下列表情包的含义高度匹配时，你可以发送表情包。格式严格为 [[EMOJI:表情ID|表情名称]]，必须包含闭合的两个右方括号！\n你当前可以使用的表情包列表如下（绝对不能自己编造不存在的ID）：\n`;
                availableEmojis.forEach((e, idx) => {
                    const shortId = `e${idx}`;
                    emojiMapping[shortId] = e.id;
                    reverseEmojiMapping[e.id] = shortId;
                    emojiPrompt += `- id: ${shortId}, 含义: ${e.name}\n`;
                });
            } else {
                emojiPrompt = `\n\n【互动：发送表情包】\n当前没有任何表情包可用，请不要发送任何 [[EMOJI:xxx]] 格式的消息。`;
            }

            let multiMsgPrompt = "";
            if (charConfig.multiMsgEnabled) {
                const minMsg = charConfig.multiMsgMin || 1;
                const maxMsg = charConfig.multiMsgMax || 3;
                multiMsgPrompt = `\n\n【回复格式要求】\n你现在正在像真实人类一样连续发送多条短消息。\n你必须连续回复 ${minMsg} 到 ${maxMsg} 条消息，多条消息之间必须严格使用 [SPLIT] 作为分隔符（绝不要用其他符号代替）。\n例如：第一条消息[SPLIT]第二条消息[SPLIT]第三条消息\n不要在最后一条消息后加 [SPLIT]。每条消息都很简短口语化。`;
            } else {
                multiMsgPrompt = `\n\n【回复格式要求】\n你现在正在像真实人类一样在聊天软件上发消息。\n你可以自由决定回复一条还是多条消息（不限制条数）。\n如果只有一句话，直接回复即可。\n如果你想连续发送多条消息，多条消息之间必须严格使用 [SPLIT] 作为分隔符。\n例如：第一条消息[SPLIT]第二条消息[SPLIT]第三条消息\n不要在最后一条消息后加 [SPLIT]。每条消息都很简短口语化。`;
            }

            let bilingualPrompt = "";
            if (charConfig.bilingualEnabled) {
                bilingualPrompt = `\n\n【双语翻译要求】\n如果你正在使用外语（如英语、日语等非中文语言）进行回复，你必须在每句话（或每条消息的末尾）使用特殊括号 〖 〗 包裹对应的中文翻译。例如：Hello baby 〖你好宝贝〗`;
            }

            let userIdentityInfo = `他/她叫 ${activeUser.realname || activeUser.nickname || '未命名用户'}`;
            if (activeUser.nickname) userIdentityInfo += `，你给对方昵称是 ${activeUser.nickname}`;
            userIdentityInfo += `。`;

            const finalPromptTemplate = charConfig.charPrompt && charConfig.charPrompt.trim() !== '' ? charConfig.charPrompt : (localStorage.getItem('nrj-global-system-prompt') || this.META_PROMPT);

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
                .replace(/{long_term_memory}/g, longTermMemoryContent) + emojiPrompt + multiMsgPrompt + bilingualPrompt;

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
                    result = result.replace(/\[\[EMOJI:([^|\]]+)(?:\|([^\]]+))?\]\]/g, (match, id, name) => `[发送了一个表情包，表情含义是：${name || '表情'}]`);
                } else if (role === 'assistant') {
                    result = result.replace(/\[\[EMOJI:([^|\]]+)(?:\|([^\]]+))?\]\]/g, (match, id, name) => {
                        const shortId = reverseEmojiMapping[id];
                        if (shortId) {
                            return `[[EMOJI:${shortId}|${name || '表情'}]]`;
                        } else {
                            return `[发送了一个表情包，表情含义是：${name || '表情'}]`;
                        }
                    });
                }
                return result;
            };

            const charNameStr = charData.nickname || charData.realname || '未命名角色';
            const userNameStr = activeUser.nickname || activeUser.realname || '我';

            const apiMessages = [
                { role: 'system', content: replaceVars(systemPrompt, charNameStr, userNameStr, 'system') },
                ...history.slice(-shortTermCount).map(m => ({
                    role: m.role,
                    content: replaceVars(m.content, charNameStr, userNameStr, m.role)
                }))
            ];

            let replyText = await window.ChatAPI.chatCompletion(apiMessages, settings, ctx.aiAbortController.signal, charId);
            replyText = replyText.replace(/<think>([\s\S]*?)<\/think>/g, '').trim();

            replyText = replyText.replace(/\[\[EMOJI:([^\s|\]]+)(?:\|([^\]\n]*))?(?:\]\])?/g, (match, id, name) => {
                let realId = emojiMapping[id];
                if (!realId) {
                    const exactMatch = availableEmojis.find(e => e.id === id);
                    if (exactMatch) {
                        realId = exactMatch.id;
                    } else {
                        const fuzzyMatch = availableEmojis.find(e => e.id.startsWith(id) || id.startsWith(e.id));
                        if (fuzzyMatch) realId = fuzzyMatch.id;
                    }
                }
                if (!realId) return ''; 
                return `[[EMOJI:${realId}|${name || '表情'}]]`; 
            });

            let hasReceivedTransfer = false;
            let hasReturnedTransfer = false;
            
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
                let currentHistory = window.ChatStorage.getChatHistory(charId);
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
                    currentHistory.push({ role: 'system', content: sysMsgText, timestamp: Date.now() });
                    
                    window.ChatStorage.saveChatHistory(charId, currentHistory);
                    const isConvActive = convView && convView.classList.contains('active') && ctx.currentPersona && ctx.currentPersona.id === charId;
                    if (isConvActive) {
                        this.openConversation(ctx.currentPersona);
                    } else {
                        let chars = window.ChatStorage.loadCharacters();
                        let charIdx = chars.findIndex(c => c.id === charId);
                        if (charIdx !== -1) {
                            chars[charIdx].isUnread = true;
                            chars[charIdx].unreadCount = (chars[charIdx].unreadCount || 0) + 1;
                            chars[charIdx].message = '[转账]';
                            chars[charIdx].time = this.getLocalTimeByTimezone(finalTimezone);
                            window.ChatStorage.saveCharacters(chars);
                        }
                        if (ctx.sessionModule) ctx.sessionModule.renderChatList();
                    }
                }
            }

            if (aiTransferAmount) {
                let currentHistory = window.ChatStorage.getChatHistory(charId);
                const tId = 'tr_' + Date.now();
                const tText = `[[TRANSFER:${aiTransferAmount}|${aiTransferRemark}|PENDING|${tId}]]`;
                currentHistory.push({ role: 'assistant', content: tText, timestamp: Date.now() });
                const sysText = `[{{char}}向你发起了转账 ${aiTransferAmount} 元，备注：${aiTransferRemark}。等待收取。]`;
                currentHistory.push({ role: 'system', content: sysText, timestamp: Date.now() });
                window.ChatStorage.saveChatHistory(charId, currentHistory);
                
                const isConvActive = convView && convView.classList.contains('active') && ctx.currentPersona && ctx.currentPersona.id === charId;
                if (isConvActive) {
                    this.openConversation(ctx.currentPersona);
                } else {
                    let chars = window.ChatStorage.loadCharacters();
                    let charIdx = chars.findIndex(c => c.id === charId);
                    if (charIdx !== -1) {
                        chars[charIdx].isUnread = true;
                        chars[charIdx].unreadCount = (chars[charIdx].unreadCount || 0) + 1;
                        chars[charIdx].message = '[转账]';
                        chars[charIdx].time = this.getLocalTimeByTimezone(finalTimezone);
                        window.ChatStorage.saveCharacters(chars);
                    }
                    if (ctx.sessionModule) ctx.sessionModule.renderChatList();
                }
            }

            if (!replyText) {
                convName.textContent = originalName;
                const typingBubble = document.getElementById('typing-bubble');
                if (typingBubble) typingBubble.remove();
                return;
            }

            let initialReplies = [];
            if (replyText.includes('[SPLIT]')) {
                initialReplies = replyText.split('[SPLIT]').map(s => s.trim()).filter(s => s);
            } else if (replyText.includes('\n---\n')) {
                initialReplies = replyText.split('\n---\n').map(s => s.trim()).filter(s => s);
            } else if (replyText.includes('\n\n')) {
                initialReplies = replyText.split('\n\n').map(s => s.trim()).filter(s => s);
            } else {
                if (replyText) initialReplies = [replyText];
            }

            let replies = [];
            const mediaRegexForSplit = /(\[\[(?:EMOJI|IMAGE|VOICE|LOCATION|TRANSFER|QUOTE_TEXT)[^\]]*(?:\]\])?)/gi;
            initialReplies.forEach(r => {
                if (r.match(mediaRegexForSplit)) {
                    let parts = r.split(mediaRegexForSplit).map(s => s.trim()).filter(s => s);
                    replies.push(...parts);
                } else {
                    replies.push(r);
                }
            });

            const delaySeconds = charConfig.multiMsgDelay !== undefined ? parseFloat(charConfig.multiMsgDelay) : 2;

            for (let i = 0; i < replies.length; i++) {
                if (ctx.aiReplyPaused) break;
                let r = replies[i];
                
                if (r.includes('[撤回上一条消息]')) {
                    r = r.replace(/\[撤回上一条消息\]/g, '').trim();
                    let currentHistory = window.ChatStorage.getChatHistory(charId);
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
                        window.ChatStorage.saveChatHistory(charId, currentHistory);
                        this.openConversation(ctx.currentPersona);
                    }
                    if (!r) continue;
                }
                
                if (i > 0) {
                    const isConvActiveTyping = convView && convView.classList.contains('active') && ctx.currentPersona && ctx.currentPersona.id === charId;
                    if (isConvActiveTyping && (typingStyle === 'bubble' || typingStyle === 'both')) {
                        const existingTyping = document.getElementById('typing-bubble');
                        if (!existingTyping) {
                            this.addBubble('them', '<div class="typing-indicator"><span></span><span></span><span></span></div>', ctx.currentPersona, true);
                        }
                    }
                    await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
                }
                
                const typingBubble = document.getElementById('typing-bubble');
                if (typingBubble) typingBubble.remove();
                
                let currentHistory = window.ChatStorage.getChatHistory(charId);
                const newMsg = { role: 'assistant', content: r, timestamp: Date.now() };
                const isConvActive = convView && convView.classList.contains('active') && ctx.currentPersona && ctx.currentPersona.id === charId;
                
                if (isConvActive) {
                    this.addBubble('them', r, ctx.currentPersona, false, newMsg, currentHistory.length);
                }
                
                currentHistory.push(newMsg);
                window.ChatStorage.saveChatHistory(charId, currentHistory);
                
                ctx.currentPersona.message = r;
                ctx.currentPersona.time = this.getLocalTimeByTimezone(finalTimezone);
                
                if (!isConvActive) {
                    let chars = window.ChatStorage.loadCharacters();
                    let charIdx = chars.findIndex(c => c.id === charId);
                    if (charIdx !== -1) {
                        chars[charIdx].isUnread = true;
                        chars[charIdx].unreadCount = (chars[charIdx].unreadCount || 0) + 1;
                        chars[charIdx].message = r;
                        chars[charIdx].time = this.getLocalTimeByTimezone(finalTimezone);
                        window.ChatStorage.saveCharacters(chars);
                        
                        ctx.currentPersona.isUnread = true;
                        ctx.currentPersona.unreadCount = chars[charIdx].unreadCount;
                    }
                }
                if (ctx.sessionModule) ctx.sessionModule.renderChatList();
            }

            charConfig.unsummarizedCount = (charConfig.unsummarizedCount || 0) + 2;
            localStorage.setItem(`nrj-chat-config-${charId}`, JSON.stringify(charConfig));
            
            if (charConfig.autoSummaryThreshold > 0 && charConfig.unsummarizedCount >= charConfig.autoSummaryThreshold) {
                // 如果后期拆分了记忆模块，可以通过上下文事件或全局调用
                if (window.ChatMemoryModule && typeof window.ChatMemoryModule.summarizeChatHistory === 'function') {
                    window.ChatMemoryModule.summarizeChatHistory(charId).catch(console.error);
                }
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
            ctx.aiAbortController = null;
        }
    }
};
