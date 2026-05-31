window.ChatMemoryModule = {
    init: function(ctx) {
        const { container } = ctx;

        // 获取依赖
        const getChatHistory = window.ChatStorage.getChatHistory;
        const saveChatHistory = window.ChatStorage.saveChatHistory;
        const getMemory = window.ChatStorage.getMemory;
        const saveMemory = window.ChatStorage.saveMemory;

        // UI 节点
        const popupMemoryLibrary = container.querySelector('#memory-library-popup');
        const popupMemoryEdit = container.querySelector('#memory-edit-popup');
        const memoryListContainer = container.querySelector('#memory-list-container');
        const btnManualSummary = container.querySelector('#btn-manual-summary');
        const btnMemoryLibrary = container.querySelector('#btn-memory-library');
        const btnCompressMemory = container.querySelector('#btn-compress-memory');
        const btnSaveMemory = container.querySelector('#btn-save-memory');
        const btnDeleteMemory = container.querySelector('#btn-delete-memory');

        let editingMemoryId = null;

        const updateTokenStats = () => {
            if (window.ChatConversationModule && window.ChatConversationModule.updateTokenStats) {
                window.ChatConversationModule.updateTokenStats();
            }
        };

        const summarizeChatHistory = async (charId, isManual = false) => {
            const history = getChatHistory(charId);
            const charConfig = JSON.parse(localStorage.getItem(`nrj-chat-config-${charId}`) || '{}');
            const unsummarizedCount = charConfig.unsummarizedCount || 0;
            
            if (unsummarizedCount === 0 || history.length === 0) {
                if (window.showChatAlert) window.showChatAlert('提示', '当前没有新消息需要总结。');
                else if (window._currentChatOSAlert) window._currentChatOSAlert('提示', '当前没有新消息需要总结。');
                else if (ctx.showAlert) ctx.showAlert('提示', '当前没有新消息需要总结。');
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
                if (c.includes('[[EMOJI:')) {
                    c = c.replace(/\[\[EMOJI:([^|\]]+)(?:\|([^\]]+))?\]\]/g, (match, id, name) => `[${name || '表情'}]`);
                }
                return `${m.role === 'user' ? '用户' : '角色'}: ${c}`;
            }).join('\n');

            try {
                let summary = await window.ChatAPI.summarizeMemory(chatLog);
                summary = summary.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

                let hasNewMemory = false;
                if (summary && summary !== "无重要信息" && summary !== "无" && summary.indexOf('没有重要信息') === -1) {
                    let mems = getMemory(charId);
                    mems.push({
                        id: 'mem_' + Date.now(),
                        content: summary,
                        time: new Date().toLocaleString('zh-CN', { hour12: false })
                    });
                    saveMemory(charId, mems);
                    hasNewMemory = true;
                } else if (isManual) {
                    if (window.showChatAlert) window.showChatAlert('提示', '当前对话无重要信息，未生成新记忆。');
                    else if (window._currentChatOSAlert) window._currentChatOSAlert('提示', '当前对话无重要信息，未生成新记忆。');
                    else if (ctx.showAlert) ctx.showAlert('提示', '当前对话无重要信息，未生成新记忆。');
                }

                charConfig.unsummarizedCount = 0;
                localStorage.setItem(`nrj-chat-config-${charId}`, JSON.stringify(charConfig));
                updateTokenStats();
                return hasNewMemory;
            } catch (error) {
                console.error('总结失败:', error);
                if (error.message === 'NO_API') {
                    if (window.showChatAlert) window.showChatAlert('未配置 API', '请先在设置中配置 API！');
                    else if (window._currentChatOSAlert) window._currentChatOSAlert('未配置 API', '请先在设置中配置 API！');
                    else if (ctx.showAlert) ctx.showAlert('未配置 API', '请先在设置中配置 API！');
                } else {
                    if (window.showChatAlert) window.showChatAlert('请求失败', `无法连接到 AI 服务。\n\n详细错误:\n${error.message}`);
                    else if (window._currentChatOSAlert) window._currentChatOSAlert('请求失败', `无法连接到 AI 服务。\n\n详细错误:\n${error.message}`);
                    else if (ctx.showAlert) ctx.showAlert('请求失败', `无法连接到 AI 服务。\n\n详细错误:\n${error.message}`);
                }
                return false;
            }
        };

        const compressMemories = async (charId) => {
            let mems = getMemory(charId);
            if (mems.length <= 1) {
                if (window.showChatAlert) window.showChatAlert('提示', '记忆条目太少，无需压缩。');
                else if (window._currentChatOSAlert) window._currentChatOSAlert('提示', '记忆条目太少，无需压缩。');
                else if (ctx.showAlert) ctx.showAlert('提示', '记忆条目太少，无需压缩。');
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
                if (c.includes('[[EMOJI:')) {
                    c = c.replace(/\[\[EMOJI:([^|\]]+)(?:\|([^\]]+))?\]\]/g, (match, id, name) => `[${name || '表情'}]`);
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
                    if (window.showChatAlert) window.showChatAlert('未配置 API', '请先在设置中配置 API！');
                    else if (window._currentChatOSAlert) window._currentChatOSAlert('未配置 API', '请先在设置中配置 API！');
                    else if (ctx.showAlert) ctx.showAlert('未配置 API', '请先在设置中配置 API！');
                } else {
                    if (window.showChatAlert) window.showChatAlert('请求失败', `无法连接到 AI 服务。\n\n详细错误:\n${error.message}`);
                    else if (window._currentChatOSAlert) window._currentChatOSAlert('请求失败', `无法连接到 AI 服务。\n\n详细错误:\n${error.message}`);
                    else if (ctx.showAlert) ctx.showAlert('请求失败', `无法连接到 AI 服务。\n\n详细错误:\n${error.message}`);
                }
                return false;
            }
        };

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
                const currentPersona = ctx.currentPersona;
                if (!currentPersona) return;
                const charId = currentPersona.id;
                
                const btnText = btnManualSummary.innerHTML;
                btnManualSummary.innerHTML = '<i class="ph ph-spinner ph-spin"></i> 总结中...';
                btnManualSummary.disabled = true;
                
                try {
                    const success = await summarizeChatHistory(charId, true);
                    if (success) {
                        if (window.showChatAlert) window.showChatAlert('总结完成', '已成功提取最新记忆存入记忆库。');
                        else if (window._currentChatOSAlert) window._currentChatOSAlert('总结完成', '已成功提取最新记忆存入记忆库。');
                        else if (ctx.showAlert) ctx.showAlert('总结完成', '已成功提取最新记忆存入记忆库。');
                    }
                } finally {
                    btnManualSummary.innerHTML = btnText;
                    btnManualSummary.disabled = false;
                }
            });
        }

        if (btnMemoryLibrary) {
            btnMemoryLibrary.addEventListener('click', () => {
                const currentPersona = ctx.currentPersona;
                if (!currentPersona) return;
                renderMemoryList(currentPersona.id);
                if (popupMemoryLibrary) popupMemoryLibrary.classList.add('active');
            });
        }

        const btnClearChatHistory = container.querySelector('#btn-clear-chat-history');
        if (btnClearChatHistory) {
            btnClearChatHistory.addEventListener('click', () => {
                const currentPersona = ctx.currentPersona;
                if (!currentPersona) return;
                
                const confirmFn = window.showChatConfirm || (ctx.showChatConfirm);
                if (confirmFn) {
                    confirmFn('清空聊天记录', '确定要清空与当前角色的所有聊天记录吗？此操作不可恢复。', () => {
                        const charId = currentPersona.id;
                        saveChatHistory(charId, []);
                        
                        const popupCharacterSettings = container.querySelector('#character-settings-popup');
                        if (popupCharacterSettings) popupCharacterSettings.classList.remove('active');
                        
                        const convView = container.querySelector('#chat-conversation-view');
                        if (convView && convView.classList.contains('active')) {
                            if (window.ChatConversationModule && window.ChatConversationModule.openConversation) {
                                window.ChatConversationModule.openConversation(currentPersona);
                            }
                        }
                        
                        currentPersona.message = '暂无消息';
                        if (ctx.sessionModule) ctx.sessionModule.renderChatList();
                        updateTokenStats();
                        
                        const alertFn = window.showChatAlert || window._currentChatOSAlert || window._showChatOSToast;
                        if (alertFn) alertFn('已清空', '聊天记录已清空。');
                    });
                }
            });
        }

        if (btnCompressMemory) {
            btnCompressMemory.addEventListener('click', async () => {
                const currentPersona = ctx.currentPersona;
                if (!currentPersona) return;
                
                const confirmFn = window.showChatConfirm || (ctx.showChatConfirm);
                if (confirmFn) {
                    confirmFn('压缩记忆', '将融合当前所有记忆条目，可能会丢失部分细节。确认压缩吗？', async () => {
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
                }
            });
        }

        if (btnSaveMemory) {
            btnSaveMemory.addEventListener('click', () => {
                const currentPersona = ctx.currentPersona;
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
                const currentPersona = ctx.currentPersona;
                if (!currentPersona || !editingMemoryId) return;
                const charId = currentPersona.id;
                
                const confirmFn = window.showChatConfirm || (ctx.showChatConfirm);
                if (confirmFn) {
                    confirmFn('删除记忆', '确定要删除这条记忆吗？', () => {
                        let mems = getMemory(charId);
                        mems = mems.filter(m => m.id !== editingMemoryId);
                        saveMemory(charId, mems);
                        
                        if (popupMemoryEdit) popupMemoryEdit.classList.remove('active');
                        renderMemoryList(charId);
                        updateTokenStats();
                        if (popupMemoryLibrary) popupMemoryLibrary.classList.add('active');
                    });
                }
            });
        }

        // 把方法暴露出去
        ctx.memoryModule = {
            summarizeChatHistory,
            compressMemories,
            renderMemoryList
        };
    }
};
