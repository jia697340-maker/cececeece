window.ChatEmojiModule = {
    init: function(ctx) {
        const { container } = ctx;

        // 获取外部依赖（从 ctx 挂载）
        // 提取 Context 中的方法，或从全局/Storage读取
        const loadPersonas = window.ChatStorage.loadPersonas;
        const getActivePersonaId = window.ChatStorage.getActivePersonaId;
        const getChatHistory = window.ChatStorage.getChatHistory;
        const saveChatHistory = window.ChatStorage.saveChatHistory;

        // UI 节点
        const convMessages = container.querySelector('#chat-conv-messages');
        const convEmojiBtn = container.querySelector('#chat-conv-emoji-btn');
        const convEmojiPanel = container.querySelector('#chat-conv-emoji-panel');
        const convExtPanel = container.querySelector('#chat-conv-ext-panel');
        const convPlusBtn = container.querySelector('#chat-conv-plus-btn');

        // --- 核心工具函数从 ctx 注入（在实际环境应为 ctx 提供）---
        const showChatPrompt = ctx.showChatPrompt || window.showChatPrompt;
        const showChatConfirm = ctx.showChatConfirm || window.showChatConfirm;

        const loadEmojiGroups = () => {
            try {
                const groups = JSON.parse(localStorage.getItem('nrj-custom-emoji-groups') || '[]');
                if (groups.length === 0) {
                    const defaultGroups = [{ id: 'default', name: '默认分组' }];
                    localStorage.setItem('nrj-custom-emoji-groups', JSON.stringify(defaultGroups));
                    return defaultGroups;
                }
                return groups;
            } catch(e) { 
                return [{ id: 'default', name: '默认分组' }]; 
            }
        };
        
        const saveEmojiGroups = (groups) => {
            localStorage.setItem('nrj-custom-emoji-groups', JSON.stringify(groups));
        };

        const loadEmojis = () => {
            try {
                let emojis = JSON.parse(localStorage.getItem('nrj-custom-emojis') || '[]');
                let needSave = false;
                emojis.forEach(e => {
                    if (!e.groupId) {
                        e.groupId = 'default';
                        needSave = true;
                    }
                });
                if (needSave) {
                    saveEmojis(emojis);
                }
                return emojis;
            } catch(e) { return []; }
        };
        
        const saveEmojis = (emojis) => {
            localStorage.setItem('nrj-custom-emojis', JSON.stringify(emojis));
        };
        
        let currentEmojiManageGroupId = 'all'; // all 表示显示全部
        let currentEmojiManageSearchKey = '';
        let currentEmojiPanelGroupId = 'all';

        const renderEmojiPanelGroups = () => {
            const groupContainer = container.querySelector('#emoji-picker-groups');
            if (!groupContainer) return;
            groupContainer.innerHTML = '';
            
            const groups = loadEmojiGroups();
            const allGroups = [{ id: 'all', name: '全部' }, ...groups];
            
            allGroups.forEach(g => {
                const btn = document.createElement('button');
                btn.className = 'chat-btn-text';
                btn.style.cssText = `padding: 4px 10px; font-size: 12px; border-radius: 12px; border: 1px solid ${currentEmojiPanelGroupId === g.id ? 'var(--accent-color, #18181b)' : 'transparent'}; background: ${currentEmojiPanelGroupId === g.id ? 'rgba(0,0,0,0.05)' : 'transparent'}; color: ${currentEmojiPanelGroupId === g.id ? 'var(--accent-color, #18181b)' : 'var(--text-secondary)'}; flex-shrink: 0; transition: all 0.2s; white-space: nowrap;`;
                btn.textContent = g.name;
                btn.onclick = () => {
                    currentEmojiPanelGroupId = g.id;
                    renderEmojiPanelGroups();
                    renderEmojiPanelList();
                };
                groupContainer.appendChild(btn);
            });
        };

        const renderEmojiPanelList = () => {
            const listContainer = container.querySelector('#emoji-list-container');
            if (!listContainer) return;
            listContainer.innerHTML = '';
            
            let emojis = loadEmojis();
            if (currentEmojiPanelGroupId !== 'all') {
                emojis = emojis.filter(e => e.groupId === currentEmojiPanelGroupId);
            }
            
            if (emojis.length === 0) {
                listContainer.innerHTML = '<div style="width: 100%; text-align: center; color: var(--text-secondary); font-size: 12px; padding: 20px 0;">该分组暂无表情</div>';
                return;
            }

            emojis.forEach(emoji => {
                const el = document.createElement('div');
                el.style.cssText = 'width: 48px; height: 48px; flex-shrink: 0; border-radius: 8px; overflow: hidden; cursor: pointer; background: rgba(0,0,0,0.02); display: flex; align-items: center; justify-content: center; position: relative; border: 1px solid transparent; transition: border-color 0.2s;';
                el.title = emoji.name || '表情';
                
                const getImgSrc = async () => {
                    if (emoji.type === 'local' && window.ImageStorageManager) {
                        try {
                            const data = await window.ImageStorageManager.loadFromIndexedDB(emoji.id);
                            if (data) return data;
                        } catch(e) {}
                    }
                    return emoji.url;
                };

                const img = document.createElement('img');
                img.style.cssText = 'max-width: 100%; max-height: 100%; object-fit: contain;';
                img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                
                getImgSrc().then(src => { img.src = src || img.src; });
                
                el.appendChild(img);
                
                el.onmouseover = () => el.style.borderColor = 'var(--accent-color)';
                el.onmouseout = () => el.style.borderColor = 'transparent';

                // 添加长按与右键唤起编辑
                let pressTimer = null;
                let isDragging = false;
                let isEditing = false;
                
                const clearPressTimer = () => {
                    if (pressTimer) {
                        clearTimeout(pressTimer);
                        pressTimer = null;
                    }
                };

                el.addEventListener('touchstart', (e) => {
                    isDragging = false;
                    isEditing = false;
                    clearPressTimer();
                    pressTimer = setTimeout(() => {
                        if (!isDragging) {
                            if (navigator.vibrate) navigator.vibrate(50);
                            isEditing = true;
                            openEmojiEdit(emoji);
                        }
                    }, 500);
                }, { passive: true });

                el.addEventListener('touchmove', () => {
                    isDragging = true;
                    clearPressTimer();
                }, { passive: true });

                el.addEventListener('touchend', () => { clearPressTimer(); });
                el.addEventListener('touchcancel', () => { clearPressTimer(); });

                el.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    isEditing = true;
                    openEmojiEdit(emoji);
                });

                el.onclick = () => {
                    if (isEditing) return; // 如果刚才触发了长按编辑，就不再发送表情
                    if (!ctx.currentPersona) return;
                    const currentPersona = ctx.currentPersona;
                    
                    const emojiName = emoji.name || '表情';
                    const tag = `[[EMOJI:${emoji.id}|${emojiName}]]`;
                    const charId = currentPersona.id;
                    const history = getChatHistory(charId);

                    const newMsg = { role: 'user', content: tag, timestamp: Date.now() };
                    
                    if (window.ChatConversationModule && window.ChatConversationModule.addBubble) {
                        window.ChatConversationModule.addBubble('me', tag, null, false, newMsg, history.length);
                    }
                    
                    history.push(newMsg);
                    saveChatHistory(charId, history);
                    
                    currentPersona.message = tag;
                    
                    const getLocalTimeByTimezone = (timezone) => {
                        try {
                            return new Date().toLocaleTimeString('zh-CN', { timeZone: timezone, hour: '2-digit', minute: '2-digit' });
                        } catch (e) {
                            return '';
                        }
                    };
                    const finalTimezone = (currentPersona.rawCharData && currentPersona.rawCharData.timezone) || Intl.DateTimeFormat().resolvedOptions().timeZone;
                    currentPersona.time = getLocalTimeByTimezone(finalTimezone);
                    if (ctx.sessionModule) ctx.sessionModule.renderChatList();

                    if (convEmojiPanel) convEmojiPanel.style.display = 'none';
                };
                
                listContainer.appendChild(el);
            });
        };

        if (convEmojiBtn && convEmojiPanel) {
            convEmojiBtn.addEventListener('click', () => {
                if (convExtPanel) {
                    convExtPanel.style.display = 'none';
                    if (convPlusBtn) convPlusBtn.style.transform = 'rotate(0deg)';
                }
                
                if (convEmojiPanel.style.display === 'none') {
                    renderEmojiPanelGroups();
                    renderEmojiPanelList();
                    convEmojiPanel.style.display = 'flex';
                } else {
                    convEmojiPanel.style.display = 'none';
                }
                setTimeout(() => {
                    if (convMessages) convMessages.scrollTop = convMessages.scrollHeight;
                }, 50);
            });
        }

        // 角色专属表情包加载和保存
        const loadCharEmojis = () => {
            try {
                let emojis = JSON.parse(localStorage.getItem('nrj-char-emojis') || '[]');
                return emojis;
            } catch(e) { return []; }
        };

        const saveCharEmojis = (emojis) => {
            localStorage.setItem('nrj-char-emojis', JSON.stringify(emojis));
        };
        
        const loadCharEmojiGroups = window.ChatStorage.loadCharEmojiGroups;
        const saveCharEmojiGroups = window.ChatStorage.saveCharEmojiGroups;

        const btnManageEmojis = container.querySelector('#btn-manage-emojis');
        const popupEmojiManage = container.querySelector('#chat-emoji-manage-popup');
        const popupEmojiSingle = container.querySelector('#chat-emoji-single-popup');
        const popupEmojiBatch = container.querySelector('#chat-emoji-batch-popup');
        const popupEmojiMove = container.querySelector('#chat-emoji-move-popup');
        
        // 多选相关逻辑
        let isEmojiMultiSelectMode = false;
        let selectedEmojiIds = new Set();
        const btnManageEmojisMulti = container.querySelector('#btn-manage-emojis-multi');
        const emojiManageFooter = container.querySelector('#emoji-manage-footer');
        const btnSelectAllEmojis = container.querySelector('#btn-select-all-emojis');
        const btnMoveSelectedEmojis = container.querySelector('#btn-move-selected-emojis');
        const btnDeleteSelectedEmojis = container.querySelector('#btn-delete-selected-emojis');
        
        const updateEmojiManageFooter = () => {
            let emojis = loadEmojis();
            if (currentEmojiManageGroupId !== 'all') {
                emojis = emojis.filter(e => e.groupId === currentEmojiManageGroupId);
            }
            if (currentEmojiManageSearchKey) {
                const keyword = currentEmojiManageSearchKey.toLowerCase();
                emojis = emojis.filter(e => (e.name && e.name.toLowerCase().includes(keyword)));
            }

            if (isEmojiMultiSelectMode) {
                if (emojiManageFooter) emojiManageFooter.style.display = 'flex';
                if (btnManageEmojisMulti) btnManageEmojisMulti.textContent = '取消';
                if (btnDeleteSelectedEmojis) {
                    btnDeleteSelectedEmojis.textContent = `删除 (${selectedEmojiIds.size})`;
                    btnDeleteSelectedEmojis.disabled = selectedEmojiIds.size === 0;
                }
                if (btnMoveSelectedEmojis) {
                    btnMoveSelectedEmojis.textContent = `移动 (${selectedEmojiIds.size})`;
                    btnMoveSelectedEmojis.disabled = selectedEmojiIds.size === 0;
                }

                if (emojis.length > 0 && selectedEmojiIds.size === emojis.length) {
                    if (btnSelectAllEmojis) btnSelectAllEmojis.textContent = '取消全选';
                } else {
                    if (btnSelectAllEmojis) btnSelectAllEmojis.textContent = '全选当前';
                }
            } else {
                if (emojiManageFooter) emojiManageFooter.style.display = 'none';
                if (btnManageEmojisMulti) btnManageEmojisMulti.textContent = '多选';
            }
        };

        if (btnManageEmojisMulti) {
            btnManageEmojisMulti.addEventListener('click', () => {
                isEmojiMultiSelectMode = !isEmojiMultiSelectMode;
                selectedEmojiIds.clear();
                updateEmojiManageFooter();
                renderEmojiManageList();
            });
        }

        if (btnSelectAllEmojis) {
            btnSelectAllEmojis.addEventListener('click', () => {
                let emojis = loadEmojis();
                if (currentEmojiManageGroupId !== 'all') {
                    emojis = emojis.filter(e => e.groupId === currentEmojiManageGroupId);
                }
                if (currentEmojiManageSearchKey) {
                    const keyword = currentEmojiManageSearchKey.toLowerCase();
                    emojis = emojis.filter(e => (e.name && e.name.toLowerCase().includes(keyword)));
                }

                let allSelected = true;
                emojis.forEach(e => {
                    if (!selectedEmojiIds.has(e.id)) {
                        allSelected = false;
                    }
                });

                if (allSelected && emojis.length > 0) {
                    // 如果当前列表的都选中了，则取消选中当前列表的
                    emojis.forEach(e => selectedEmojiIds.delete(e.id));
                } else {
                    // 否则全选当前列表的
                    emojis.forEach(e => selectedEmojiIds.add(e.id));
                }
                updateEmojiManageFooter();
                renderEmojiManageList();
            });
        }

        if (btnDeleteSelectedEmojis) {
            btnDeleteSelectedEmojis.addEventListener('click', async () => {
                if (selectedEmojiIds.size === 0) return;
                
                if (ctx.showConfirm) {
                    ctx.showConfirm('批量删除表情', `确定要删除选中的 ${selectedEmojiIds.size} 个表情吗？`, async () => {
                        let currentEmojis = loadEmojis();
                        const localIdsToDelete = [];
                        currentEmojis.forEach(e => {
                            if (selectedEmojiIds.has(e.id) && e.type === 'local') {
                                localIdsToDelete.push(e.id);
                            }
                        });

                        currentEmojis = currentEmojis.filter(e => !selectedEmojiIds.has(e.id));
                        saveEmojis(currentEmojis);
                        
                        if (window.ImageStorageManager) {
                            for (let id of localIdsToDelete) {
                                try { await window.ImageStorageManager.deleteFromIndexedDB(id); } catch(e) {}
                            }
                        }
                        
                        selectedEmojiIds.clear();
                        isEmojiMultiSelectMode = false;
                        updateEmojiManageFooter();
                        renderEmojiManageList();
                        renderEmojiPanelList();
                        
                        if (ctx.showAlert) ctx.showAlert('提示', '已删除所选表情');
                    });
                }
            });
        }

        // 角色表情包管理逻辑
        const btnManageCharEmojis = container.querySelector('#btn-manage-char-emojis');
        const popupCharEmojiManage = container.querySelector('#chat-char-emoji-manage-popup');
        const popupCharEmojiSingle = container.querySelector('#chat-char-emoji-single-popup');
        const popupCharEmojiBatch = container.querySelector('#chat-char-emoji-batch-popup');

        let selectedCharEmojiIds = new Set();
        let isCharEmojiMultiSelectMode = false;
        let currentCharEmojiManageSearchKey = '';
        let editingCharEmojiId = null;
        let currentCharEmojiManageGroupId = 'all';

        const btnManageCharEmojisMulti = container.querySelector('#btn-manage-char-emojis-multi');
        const charEmojiManageFooter = container.querySelector('#char-emoji-manage-footer');
        const btnSelectAllCharEmojis = container.querySelector('#btn-select-all-char-emojis');
        const btnDeleteSelectedCharEmojis = container.querySelector('#btn-delete-selected-char-emojis');
        const inputCharEmojiManageSearch = container.querySelector('#char-emoji-manage-search');
        
        const updateCharEmojiManageFooter = () => {
            let emojis = loadCharEmojis();
            if (currentCharEmojiManageGroupId !== 'all') {
                emojis = emojis.filter(e => e.groupId === currentCharEmojiManageGroupId);
            }
            if (currentCharEmojiManageSearchKey) {
                const keyword = currentCharEmojiManageSearchKey.toLowerCase();
                emojis = emojis.filter(e => (e.name && e.name.toLowerCase().includes(keyword)));
            }

            if (isCharEmojiMultiSelectMode) {
                if (charEmojiManageFooter) charEmojiManageFooter.style.display = 'flex';
                if (btnManageCharEmojisMulti) btnManageCharEmojisMulti.textContent = '取消';
                if (btnDeleteSelectedCharEmojis) {
                    btnDeleteSelectedCharEmojis.textContent = `删除 (${selectedCharEmojiIds.size})`;
                    btnDeleteSelectedCharEmojis.disabled = selectedCharEmojiIds.size === 0;
                }
                const btnMoveSelectedCharEmojis = container.querySelector('#btn-move-selected-char-emojis');
                if (btnMoveSelectedCharEmojis) {
                    btnMoveSelectedCharEmojis.textContent = `移动 (${selectedCharEmojiIds.size})`;
                    btnMoveSelectedCharEmojis.disabled = selectedCharEmojiIds.size === 0;
                }

                if (emojis.length > 0 && selectedCharEmojiIds.size === emojis.length) {
                    if (btnSelectAllCharEmojis) btnSelectAllCharEmojis.textContent = '取消全选';
                } else {
                    if (btnSelectAllCharEmojis) btnSelectAllCharEmojis.textContent = '全选当前';
                }
            } else {
                if (charEmojiManageFooter) charEmojiManageFooter.style.display = 'none';
                if (btnManageCharEmojisMulti) btnManageCharEmojisMulti.textContent = '多选';
            }
        };

        const renderCharEmojiManageGroups = () => {
            const groupList = container.querySelector('#char-emoji-manage-groups');
            if (!groupList) return;
            groupList.innerHTML = '';
            
            const groups = loadCharEmojiGroups();
            const allGroups = [{ id: 'all', name: '全部' }, { id: 'default', name: '默认分组' }, ...groups];
            
            allGroups.forEach(g => {
                const el = document.createElement('div');
                const isActive = currentCharEmojiManageGroupId === g.id;
                el.style.cssText = `padding: 10px 8px; border-radius: 6px; font-size: 13px; cursor: pointer; transition: all 0.2s; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; justify-content: space-between; align-items: center;`;
                if (isActive) {
                    el.style.background = 'rgba(0,0,0,0.06)';
                    el.style.fontWeight = '600';
                    el.style.color = '#18181b';
                } else {
                    el.style.background = 'transparent';
                    el.style.fontWeight = 'normal';
                    el.style.color = '#52525b';
                }
                
                const nameSpan = document.createElement('span');
                nameSpan.textContent = g.name;
                nameSpan.style.flex = '1';
                nameSpan.style.overflow = 'hidden';
                nameSpan.style.textOverflow = 'ellipsis';
                el.appendChild(nameSpan);
                
                el.onclick = (e) => {
                    if (e.target.closest('.group-action')) return;
                    currentCharEmojiManageGroupId = g.id;
                    isCharEmojiMultiSelectMode = false;
                    selectedCharEmojiIds.clear();
                    renderCharEmojiManageGroups();
                    renderCharEmojiManageList();
                    updateCharEmojiManageFooter();
                };
                
                groupList.appendChild(el);
            });
        };

        const openCharEmojiEdit = async (emoji = null) => {
            const charSingleTitle = container.querySelector('#char-emoji-single-title');
            const charSingleName = container.querySelector('#char-emoji-single-name');
            const charSingleGroup = container.querySelector('#char-emoji-single-group');
            const charSingleUrl = container.querySelector('#char-emoji-single-url');
            const charSinglePreviewBox = container.querySelector('#char-emoji-single-preview-container');
            const charSinglePreviewImg = container.querySelector('#char-emoji-single-preview');

            if (charSingleGroup) {
                charSingleGroup.innerHTML = '';
                const groups = loadCharEmojiGroups();
                groups.forEach(g => {
                    const opt = document.createElement('option');
                    opt.value = g.id;
                    opt.textContent = g.name;
                    charSingleGroup.appendChild(opt);
                });
            }

            if (emoji) {
                editingCharEmojiId = emoji.id;
                if (charSingleTitle) charSingleTitle.textContent = '编辑角色表情';
                if (charSingleName) charSingleName.value = emoji.name || '';
                if (charSingleGroup) charSingleGroup.value = emoji.groupId || 'default';
                
                if (emoji.type === 'local') {
                    if (charSingleUrl) charSingleUrl.value = '';
                    try {
                        const base64 = await window.ImageStorageManager.loadFromIndexedDB(emoji.id);
                        if (base64) {
                            currentCharSingleBase64 = base64;
                            if (charSinglePreviewImg) charSinglePreviewImg.src = base64;
                            if (charSinglePreviewBox) charSinglePreviewBox.style.display = 'block';
                        }
                    } catch(e) {}
                } else {
                    if (charSingleUrl) charSingleUrl.value = emoji.url || '';
                    currentCharSingleBase64 = null;
                    if (emoji.url) {
                        if (charSinglePreviewImg) charSinglePreviewImg.src = emoji.url;
                        if (charSinglePreviewBox) charSinglePreviewBox.style.display = 'block';
                    } else {
                        if (charSinglePreviewBox) charSinglePreviewBox.style.display = 'none';
                    }
                }
            } else {
                editingCharEmojiId = null;
                if (charSingleTitle) charSingleTitle.textContent = '添加角色表情';
                if (charSingleName) charSingleName.value = '';
                if (charSingleGroup) charSingleGroup.value = currentCharEmojiManageGroupId !== 'all' ? currentCharEmojiManageGroupId : 'default';
                if (charSingleUrl) charSingleUrl.value = '';
                currentCharSingleBase64 = null;
                if (charSinglePreviewBox) charSinglePreviewBox.style.display = 'none';
            }
            if (popupCharEmojiSingle) popupCharEmojiSingle.classList.add('active');
        };

        const renderCharEmojiManageList = () => {
            const list = container.querySelector('#char-emoji-manage-list');
            if (!list) return;
            list.innerHTML = '';
            
            let emojis = loadCharEmojis();
            
            if (currentCharEmojiManageGroupId !== 'all') {
                emojis = emojis.filter(e => e.groupId === currentCharEmojiManageGroupId);
            }

            if (currentCharEmojiManageSearchKey) {
                const keyword = currentCharEmojiManageSearchKey.toLowerCase();
                emojis = emojis.filter(e => (e.name && e.name.toLowerCase().includes(keyword)));
            }
            
            if (emojis.length === 0) {
                list.innerHTML = '<div style="width: 100%; text-align: center; color: var(--text-secondary); font-size: 13px; padding: 40px 0;">空空如也</div>';
                return;
            }
            
            emojis.forEach(emoji => {
                const el = document.createElement('div');
                let isChecked = isCharEmojiMultiSelectMode && selectedCharEmojiIds.has(emoji.id);
                el.style.cssText = `width: 64px; height: 64px; flex-shrink: 0; border-radius: 8px; overflow: hidden; background: #f4f4f5; position: relative; border: 2px solid ${isChecked ? 'var(--accent-color, #18181b)' : 'var(--border-color)'}; box-sizing: border-box; transition: all 0.2s ease;`;
                
                if (isCharEmojiMultiSelectMode) {
                    const checkIcon = document.createElement('div');
                    checkIcon.style.cssText = `position: absolute; top: 4px; left: 4px; width: 16px; height: 16px; border-radius: 4px; background: ${isChecked ? 'var(--accent-color, #18181b)' : 'rgba(0,0,0,0.2)'}; color: white; display: flex; align-items: center; justify-content: center; z-index: 10;`;
                    if (isChecked) {
                        checkIcon.innerHTML = '<i class="ph-bold ph-check" style="font-size: 10px;"></i>';
                    }
                    el.appendChild(checkIcon);
                }

                const img = document.createElement('img');
                img.style.cssText = 'width: 100%; height: 100%; object-fit: contain; pointer-events: none;';
                img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                
                const getImgSrc = async () => {
                    if (emoji.type === 'local' && window.ImageStorageManager) {
                        try {
                            const data = await window.ImageStorageManager.loadFromIndexedDB(emoji.id);
                            if (data) return data;
                        } catch(e) {}
                    }
                    return emoji.url;
                };
                
                getImgSrc().then(src => { img.src = src || img.src; });
                el.appendChild(img);
                
                if (emoji.name) {
                    const nameTag = document.createElement('div');
                    nameTag.style.cssText = 'position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.5); color: #fff; font-size: 10px; padding: 2px 4px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; pointer-events: none;';
                    nameTag.textContent = emoji.name;
                    el.appendChild(nameTag);
                }
                
                el.style.cursor = 'pointer';
                el.onclick = (e) => {
                    if (e.target.closest('button')) return; 
                    if (isCharEmojiMultiSelectMode) {
                        if (selectedCharEmojiIds.has(emoji.id)) {
                            selectedCharEmojiIds.delete(emoji.id);
                        } else {
                            selectedCharEmojiIds.add(emoji.id);
                        }
                        updateCharEmojiManageFooter();
                        renderCharEmojiManageList();
                    } else {
                        openCharEmojiEdit(emoji);
                    }
                };

                if (!isCharEmojiMultiSelectMode) {
                    const delBtn = document.createElement('button');
                    delBtn.style.cssText = 'position: absolute; top: 4px; right: 4px; width: 20px; height: 20px; border-radius: 50%; background: rgba(255,59,48,0.9); color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 12px; z-index: 10;';
                    delBtn.innerHTML = '<i class="ph ph-x"></i>';
                    delBtn.onclick = async (e) => {
                        e.stopPropagation();
                        if (ctx.showConfirm) {
                            ctx.showConfirm('删除表情', '确定要删除这个角色表情吗？', async () => {
                                let currentEmojis = loadCharEmojis();
                                currentEmojis = currentEmojis.filter(e => e.id !== emoji.id);
                                saveCharEmojis(currentEmojis);
                                if (emoji.type === 'local' && window.ImageStorageManager) {
                                    await window.ImageStorageManager.deleteFromIndexedDB(emoji.id);
                                }
                                renderCharEmojiManageList();
                            });
                        }
                    };
                    el.appendChild(delBtn);
                }
                
                list.appendChild(el);
            });
        };

        if (btnManageCharEmojisMulti) {
            btnManageCharEmojisMulti.addEventListener('click', () => {
                isCharEmojiMultiSelectMode = !isCharEmojiMultiSelectMode;
                selectedCharEmojiIds.clear();
                updateCharEmojiManageFooter();
                renderCharEmojiManageList();
            });
        }

        if (btnSelectAllCharEmojis) {
            btnSelectAllCharEmojis.addEventListener('click', () => {
                let emojis = loadCharEmojis();
                if (currentCharEmojiManageSearchKey) {
                    const keyword = currentCharEmojiManageSearchKey.toLowerCase();
                    emojis = emojis.filter(e => (e.name && e.name.toLowerCase().includes(keyword)));
                }

                let allSelected = true;
                emojis.forEach(e => {
                    if (!selectedCharEmojiIds.has(e.id)) {
                        allSelected = false;
                    }
                });

                if (allSelected && emojis.length > 0) {
                    emojis.forEach(e => selectedCharEmojiIds.delete(e.id));
                } else {
                    emojis.forEach(e => selectedCharEmojiIds.add(e.id));
                }
                updateCharEmojiManageFooter();
                renderCharEmojiManageList();
            });
        }

        if (btnDeleteSelectedCharEmojis) {
            btnDeleteSelectedCharEmojis.addEventListener('click', async () => {
                if (selectedCharEmojiIds.size === 0) return;
                if (ctx.showConfirm) {
                    ctx.showConfirm('批量删除表情', `确定要删除选中的 ${selectedCharEmojiIds.size} 个角色表情吗？`, async () => {
                        let currentEmojis = loadCharEmojis();
                        const localIdsToDelete = [];
                        currentEmojis.forEach(e => {
                            if (selectedCharEmojiIds.has(e.id) && e.type === 'local') {
                                localIdsToDelete.push(e.id);
                            }
                        });

                        currentEmojis = currentEmojis.filter(e => !selectedCharEmojiIds.has(e.id));
                        saveCharEmojis(currentEmojis);
                        
                        if (window.ImageStorageManager) {
                            for (let id of localIdsToDelete) {
                                try { await window.ImageStorageManager.deleteFromIndexedDB(id); } catch(e) {}
                            }
                        }
                        
                        selectedCharEmojiIds.clear();
                        isCharEmojiMultiSelectMode = false;
                        updateCharEmojiManageFooter();
                        renderCharEmojiManageList();
                        
                        if (ctx.showAlert) ctx.showAlert('提示', '已删除所选表情');
                    });
                }
            });
        }

        const btnAddCharEmojiGroup = container.querySelector('#btn-add-char-emoji-group');
        if (btnAddCharEmojiGroup) {
            btnAddCharEmojiGroup.addEventListener('click', () => {
                if (ctx.showPrompt) {
                    ctx.showPrompt('新建角色表情分组', '', (name) => {
                        if (name && name.trim()) {
                            let groups = loadCharEmojiGroups();
                            const newGroupId = 'char_group_' + Date.now();
                            groups.push({ id: newGroupId, name: name.trim() });
                            saveCharEmojiGroups(groups);
                            
                            currentCharEmojiManageGroupId = newGroupId;
                            isCharEmojiMultiSelectMode = false;
                            selectedCharEmojiIds.clear();
                            renderCharEmojiManageGroups();
                            renderCharEmojiManageList();
                            updateCharEmojiManageFooter();
                        }
                    }, false, '', true, '例如：专属表情');
                }
            });
        }

        const popupCharEmojiGroupAction = container.querySelector('#chat-char-emoji-group-action-popup');
        const inputCharEmojiGroupName = container.querySelector('#char-emoji-group-action-name');
        const btnCharEmojiGroupDelete = container.querySelector('#btn-char-emoji-group-delete');
        const btnCharEmojiGroupSave = container.querySelector('#btn-char-emoji-group-save');
        const selCharEmojiGroupTargetType = container.querySelector('#char-emoji-group-target-type');
        const charEmojiGroupTargetCharsBox = container.querySelector('#char-emoji-group-target-chars');

        if (selCharEmojiGroupTargetType && charEmojiGroupTargetCharsBox) {
            selCharEmojiGroupTargetType.addEventListener('change', (e) => {
                charEmojiGroupTargetCharsBox.style.display = e.target.value === 'specific' ? 'flex' : 'none';
            });
        }

        const renderCharEmojiGroupTargetChars = (selectedChars = []) => {
            if (!charEmojiGroupTargetCharsBox) return;
            charEmojiGroupTargetCharsBox.innerHTML = '';
            const allChars = window.ChatStorage.loadCharacters();
            if (allChars.length === 0) {
                charEmojiGroupTargetCharsBox.innerHTML = '<span style="font-size: 12px; color: var(--text-secondary);">暂无角色，请先创建角色</span>';
                return;
            }
            allChars.forEach(c => {
                const label = document.createElement('label');
                label.style.cssText = 'display: flex; align-items: center; gap: 4px; font-size: 12px; cursor: pointer; padding: 4px 8px; background: #fff; border-radius: 6px; border: 1px solid var(--border-color);';
                
                const cb = document.createElement('input');
                cb.type = 'checkbox';
                cb.value = c.id;
                cb.checked = selectedChars.includes(c.id);
                
                label.appendChild(cb);
                label.appendChild(document.createTextNode(c.nickname || c.realname || '未命名'));
                charEmojiGroupTargetCharsBox.appendChild(label);
            });
        };

        const btnManageCharGroupActions = container.querySelector('#btn-manage-char-group-actions');
        if (btnManageCharGroupActions) {
            btnManageCharGroupActions.addEventListener('click', () => {
                if (currentCharEmojiManageGroupId === 'all') {
                    if (ctx.showAlert) ctx.showAlert('提示', '【全部】不是真实的分组，无法操作。');
                    return;
                }
                if (currentCharEmojiManageGroupId === 'default') {
                    if (ctx.showAlert) ctx.showAlert('提示', '【默认分组】是系统内置的分组，无法修改或删除。');
                    return;
                }
                
                const groups = loadCharEmojiGroups();
                const group = groups.find(g => g.id === currentCharEmojiManageGroupId);
                if (!group) return;
                
                if (popupCharEmojiGroupAction && inputCharEmojiGroupName) {
                    inputCharEmojiGroupName.value = group.name;
                    if (selCharEmojiGroupTargetType) {
                        selCharEmojiGroupTargetType.value = group.targetType || 'global';
                        charEmojiGroupTargetCharsBox.style.display = selCharEmojiGroupTargetType.value === 'specific' ? 'flex' : 'none';
                        renderCharEmojiGroupTargetChars(group.targetChars || []);
                    }
                    popupCharEmojiGroupAction.classList.add('active');
                }
            });
        }

        if (btnCharEmojiGroupDelete) {
            btnCharEmojiGroupDelete.addEventListener('click', () => {
                const groups = loadCharEmojiGroups();
                const group = groups.find(g => g.id === currentCharEmojiManageGroupId);
                if (!group) return;

                if (ctx.showConfirm) {
                    ctx.showConfirm('确认删除', `确定要删除分组【${group.name}】吗？表情将移至默认分组。`, () => {
                        let gs = loadCharEmojiGroups();
                        gs = gs.filter(g => g.id !== currentCharEmojiManageGroupId);
                        saveCharEmojiGroups(gs);
                        
                        let es = loadCharEmojis();
                        es.forEach(e => {
                            if (e.groupId === currentCharEmojiManageGroupId) {
                                e.groupId = 'default';
                            }
                        });
                        saveCharEmojis(es);
                        
                        currentCharEmojiManageGroupId = 'all';
                        renderCharEmojiManageGroups();
                        renderCharEmojiManageList();
                        
                        if (popupCharEmojiGroupAction) popupCharEmojiGroupAction.classList.remove('active');
                        if (ctx.showAlert) ctx.showAlert('已删除', '分组已删除。');
                    });
                }
            });
        }

        if (btnCharEmojiGroupSave) {
            btnCharEmojiGroupSave.addEventListener('click', () => {
                if (!inputCharEmojiGroupName) return;
                const newName = inputCharEmojiGroupName.value.trim();
                if (!newName) {
                    if (ctx.showAlert) ctx.showAlert('提示', '分组名称不能为空。');
                    return;
                }

                let gs = loadCharEmojiGroups();
                const idx = gs.findIndex(g => g.id === currentCharEmojiManageGroupId);
                if (idx !== -1) {
                    gs[idx].name = newName;
                    
                    if (selCharEmojiGroupTargetType) {
                        gs[idx].targetType = selCharEmojiGroupTargetType.value;
                        if (gs[idx].targetType === 'specific' && charEmojiGroupTargetCharsBox) {
                            const cbs = charEmojiGroupTargetCharsBox.querySelectorAll('input[type="checkbox"]:checked');
                            gs[idx].targetChars = Array.from(cbs).map(cb => cb.value);
                        } else {
                            gs[idx].targetChars = [];
                        }
                    }

                    saveCharEmojiGroups(gs);
                    renderCharEmojiManageGroups();
                    
                    if (popupCharEmojiGroupAction) popupCharEmojiGroupAction.classList.remove('active');
                    if (ctx.showAlert) ctx.showAlert('已保存', '分组信息保存成功。');
                }
            });
        }

        const btnAddCharEmojiSingle = container.querySelector('#btn-add-char-emoji-single');
        if (btnAddCharEmojiSingle && popupCharEmojiSingle) {
            btnAddCharEmojiSingle.addEventListener('click', () => {
                openCharEmojiEdit(null);
            });
        }

        let currentCharSingleBase64 = null;
        const charSingleUrl = container.querySelector('#char-emoji-single-url');
        const charSinglePreviewImg = container.querySelector('#char-emoji-single-preview');
        const charSinglePreviewBox = container.querySelector('#char-emoji-single-preview-container');
        const btnCharSingleUpload = container.querySelector('#btn-char-emoji-single-upload');
        const inputCharSingleUpload = container.querySelector('#input-char-emoji-single-upload');
        const btnSaveCharSingle = container.querySelector('#btn-save-char-emoji-single');
        const charSingleName = container.querySelector('#char-emoji-single-name');
        const charSingleGroup = container.querySelector('#char-emoji-single-group');

        if (charSingleUrl) {
            charSingleUrl.addEventListener('input', () => {
                if (charSingleUrl.value.trim()) {
                    charSinglePreviewImg.src = charSingleUrl.value.trim();
                    charSinglePreviewBox.style.display = 'block';
                    currentCharSingleBase64 = null;
                } else {
                    charSinglePreviewBox.style.display = 'none';
                }
            });
        }
        
        if (btnCharSingleUpload && inputCharSingleUpload) {
            btnCharSingleUpload.addEventListener('click', () => inputCharSingleUpload.click());
            inputCharSingleUpload.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                charSingleUrl.value = '';
                try {
                    const base64 = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = ev => resolve(ev.target.result);
                        reader.onerror = reject;
                        reader.readAsDataURL(file);
                    });
                    currentCharSingleBase64 = base64;
                    charSinglePreviewImg.src = base64;
                    charSinglePreviewBox.style.display = 'block';
                } catch(err) {
                    if (ctx.showAlert) ctx.showAlert('失败', '读取图片失败');
                }
                e.target.value = '';
            });
        }
        
        if (btnSaveCharSingle) {
            btnSaveCharSingle.addEventListener('click', async () => {
                const nameVal = charSingleName.value.trim();
                if (!nameVal) {
                    if (ctx.showAlert) ctx.showAlert('提示', '请填写表情名称');
                    return;
                }
                const urlVal = charSingleUrl.value.trim();
                if (!urlVal && !currentCharSingleBase64) {
                    if (ctx.showAlert) ctx.showAlert('提示', '请填写链接或上传图片');
                    return;
                }
                
                const emojiId = editingCharEmojiId || 'char_emoji_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
                const emojiObj = {
                    id: emojiId,
                    name: charSingleName.value.trim(),
                    groupId: charSingleGroup ? charSingleGroup.value : 'default',
                    type: currentCharSingleBase64 ? 'local' : 'url',
                    url: currentCharSingleBase64 ? '' : urlVal
                };
                
                if (currentCharSingleBase64 && window.ImageStorageManager) {
                    try {
                        await window.ImageStorageManager.saveToIndexedDB(emojiId, currentCharSingleBase64);
                    } catch(e) {
                        if (ctx.showAlert) ctx.showAlert('失败', '图片保存到本地存储失败');
                        return;
                    }
                } else if (editingCharEmojiId && emojiObj.type === 'url' && window.ImageStorageManager) {
                    try {
                        await window.ImageStorageManager.deleteFromIndexedDB(editingCharEmojiId);
                    } catch (e) {}
                }
                
                let emojis = loadCharEmojis();
                if (editingCharEmojiId) {
                    const idx = emojis.findIndex(e => e.id === editingCharEmojiId);
                    if (idx !== -1) {
                        emojis[idx] = emojiObj;
                    }
                } else {
                    emojis.unshift(emojiObj);
                }
                saveCharEmojis(emojis);
                
                popupCharEmojiSingle.classList.remove('active');
                renderCharEmojiManageList();
            });
        }

        const btnAddCharEmojiBatch = container.querySelector('#btn-add-char-emoji-batch');
        const charBatchText = container.querySelector('#char-emoji-batch-text');
        const charBatchGroup = container.querySelector('#char-emoji-batch-group');
        const btnCharBatchUpload = container.querySelector('#btn-char-emoji-batch-upload');
        const inputCharBatchUpload = container.querySelector('#input-char-emoji-batch-upload');
        const btnSaveCharBatch = container.querySelector('#btn-save-char-emoji-batch');
        
        if (btnAddCharEmojiBatch && popupCharEmojiBatch) {
            btnAddCharEmojiBatch.addEventListener('click', () => {
                if (charBatchText) charBatchText.value = '';
                if (charBatchGroup) {
                    charBatchGroup.innerHTML = '';
                    const groups = loadCharEmojiGroups();
                    groups.forEach(g => {
                        const opt = document.createElement('option');
                        opt.value = g.id;
                        opt.textContent = g.name;
                        charBatchGroup.appendChild(opt);
                    });
                    charBatchGroup.value = currentCharEmojiManageGroupId !== 'all' ? currentCharEmojiManageGroupId : 'default';
                }
                popupCharEmojiBatch.classList.add('active');
            });
        }
        
        if (btnCharBatchUpload && inputCharBatchUpload) {
            btnCharBatchUpload.addEventListener('click', () => inputCharBatchUpload.click());
            inputCharBatchUpload.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                // 处理 ZIP 批量导入
                if (file.name.toLowerCase().endsWith('.zip') && window.zipManager) {
                    try {
                        const files = await window.zipManager.processZipFile(file);
                        if (files && files.length > 0) {
                            let totalAddedCount = 0;
                            let totalTextContent = '';

                            if (ctx.showAlert) ctx.showAlert('正在解析', '正在读取ZIP内容...');

                            for (const f of files) {
                                const fExtension = f.name.split('.').pop().toLowerCase();
                                let textContent = '';
                                if (fExtension === 'txt') {
                                    textContent = await new Promise((resolve, reject) => {
                                        const reader = new FileReader();
                                        reader.onload = (ev) => resolve(ev.target.result);
                                        reader.onerror = () => reject(new Error('TXT读取失败'));
                                        reader.readAsText(f, 'utf-8'); 
                                    });
                                } else if (fExtension === 'doc' || fExtension === 'docx') {
                                    if (typeof mammoth === 'undefined') throw new Error('未加载文档解析库');
                                    const arrayBuffer = await new Promise((resolve, reject) => {
                                        const reader = new FileReader();
                                        reader.onload = (ev) => resolve(ev.target.result);
                                        reader.onerror = () => reject(new Error('文档读取失败'));
                                        reader.readAsArrayBuffer(f);
                                    });
                                    const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
                                    textContent = result.value;
                                }
                                totalTextContent += textContent + '\n';
                            }

                            if (ctx.nodes.chatAlertPopup) ctx.nodes.chatAlertPopup.classList.remove('active');
                            if (charBatchText) {
                                charBatchText.value = totalTextContent;
                            }
                        }
                    } catch (err) {
                        console.log('ZIP 处理被取消或失败:', err);
                        if (ctx.showAlert) ctx.showAlert('解析失败', err.message);
                    } finally {
                        e.target.value = '';
                    }
                    return;
                }

                if (ctx.showAlert) {
                    ctx.showAlert('正在解析', '正在读取文档内容...');
                }

                try {
                    let textContent = '';
                    const extension = file.name.split('.').pop().toLowerCase();

                    if (extension === 'txt') {
                        textContent = await new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = (ev) => resolve(ev.target.result);
                            reader.onerror = () => reject(new Error('TXT读取失败'));
                            reader.readAsText(file, 'utf-8'); 
                        });
                    } else if (extension === 'doc' || extension === 'docx') {
                        if (typeof mammoth === 'undefined') throw new Error('未加载文档解析库');
                        const arrayBuffer = await new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = (ev) => resolve(ev.target.result);
                            reader.onerror = () => reject(new Error('文档读取失败'));
                            reader.readAsArrayBuffer(file);
                        });
                        const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
                        textContent = result.value;
                    }
                    
                    if (ctx.nodes.chatAlertPopup) ctx.nodes.chatAlertPopup.classList.remove('active');
                    if (charBatchText) charBatchText.value = textContent;
                } catch (err) {
                    if (ctx.showAlert) ctx.showAlert('解析失败', err.message);
                } finally {
                    e.target.value = '';
                }
            });
        }
        
        if (btnSaveCharBatch) {
            btnSaveCharBatch.addEventListener('click', () => {
                if (!charBatchText) return;
                const text = charBatchText.value.trim();
                if (!text) {
                    if (ctx.showAlert) ctx.showAlert('提示', '请输入内容');
                    return;
                }
                
                const lines = text.split('\n');
                let emojis = loadCharEmojis();
                let addedCount = 0;
                
                lines.forEach(line => {
                    line = line.trim();
                    if (!line) return;
                    
                    const httpIndex = line.search(/http[s]?:\/\//i);
                    let name = '';
                    let url = '';

                    if (httpIndex !== -1) {
                        url = line.substring(httpIndex).trim();
                        if (httpIndex > 0) {
                            name = line.substring(0, httpIndex)
                                .replace(/[\s:\|：，,。、\-—=~～_]+$/, '')
                                .trim();
                        }
                        
                        const emojiObj = {
                            id: 'char_emoji_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5) + addedCount,
                            name: name,
                            groupId: charBatchGroup ? charBatchGroup.value : 'default',
                            type: 'url',
                            url: url
                        };
                        
                        emojis.unshift(emojiObj);
                        addedCount++;
                    }
                });
                
                if (addedCount > 0) {
                    saveCharEmojis(emojis);
                    if (popupCharEmojiBatch) popupCharEmojiBatch.classList.remove('active');
                    renderCharEmojiManageList();
                    if (ctx.showAlert) ctx.showAlert('导入成功', `成功导入了 ${addedCount} 个角色表情`);
                } else {
                    if (ctx.showAlert) ctx.showAlert('提示', '未能解析出任何有效的表情链接，请检查格式');
                }
            });
        }

        if (inputCharEmojiManageSearch) {
            inputCharEmojiManageSearch.addEventListener('input', (e) => {
                currentCharEmojiManageSearchKey = e.target.value.trim();
                renderCharEmojiManageList();
                updateCharEmojiManageFooter();
            });
        }
        
        // 移动表情包逻辑
        const selMoveTargetGroup = container.querySelector('#emoji-move-target-group');
        const btnConfirmMoveEmojis = container.querySelector('#btn-confirm-move-emojis');

        if (btnMoveSelectedEmojis) {
            btnMoveSelectedEmojis.addEventListener('click', () => {
                if (selectedEmojiIds.size === 0) return;
                
                if (selMoveTargetGroup) {
                    selMoveTargetGroup.innerHTML = '';
                    const groups = loadEmojiGroups();
                    groups.forEach(g => {
                        const opt = document.createElement('option');
                        opt.value = g.id;
                        opt.textContent = g.name;
                        selMoveTargetGroup.appendChild(opt);
                    });
                }
                
                if (popupEmojiMove) popupEmojiMove.classList.add('active');
            });
        }

        if (btnConfirmMoveEmojis) {
            btnConfirmMoveEmojis.addEventListener('click', () => {
                if (!selMoveTargetGroup || !selMoveTargetGroup.value) return;
                const targetGroupId = selMoveTargetGroup.value;
                
                let emojis = loadEmojis();
                emojis.forEach(e => {
                    if (selectedEmojiIds.has(e.id)) {
                        e.groupId = targetGroupId;
                    }
                });
                saveEmojis(emojis);
                
                selectedEmojiIds.clear();
                isEmojiMultiSelectMode = false;
                if (popupEmojiMove) popupEmojiMove.classList.remove('active');
                
                updateEmojiManageFooter();
                renderEmojiManageList();
                renderEmojiPanelGroups();
                renderEmojiPanelList();
                
                if (ctx.showAlert) ctx.showAlert('移动成功', '表情包已移动到指定分组。');
            });
        }
        
        // 角色表情包移动逻辑
        const btnMoveSelectedCharEmojis = container.querySelector('#btn-move-selected-char-emojis');
        const selCharMoveTargetGroup = container.querySelector('#char-emoji-move-target-group');
        const btnConfirmMoveCharEmojis = container.querySelector('#btn-confirm-move-char-emojis');
        const popupCharEmojiMove = container.querySelector('#chat-char-emoji-move-popup');

        if (btnMoveSelectedCharEmojis) {
            btnMoveSelectedCharEmojis.addEventListener('click', () => {
                if (selectedCharEmojiIds.size === 0) return;
                
                if (selCharMoveTargetGroup) {
                    selCharMoveTargetGroup.innerHTML = '';
                    const groups = loadCharEmojiGroups();
                    const allGroups = [{ id: 'default', name: '默认分组' }, ...groups];
                    
                    allGroups.forEach(g => {
                        const opt = document.createElement('option');
                        opt.value = g.id;
                        opt.textContent = g.name;
                        selCharMoveTargetGroup.appendChild(opt);
                    });
                }
                
                if (popupCharEmojiMove) popupCharEmojiMove.classList.add('active');
            });
        }

        if (btnConfirmMoveCharEmojis) {
            btnConfirmMoveCharEmojis.addEventListener('click', () => {
                if (!selCharMoveTargetGroup || !selCharMoveTargetGroup.value) return;
                const targetGroupId = selCharMoveTargetGroup.value;
                
                let emojis = loadCharEmojis();
                emojis.forEach(e => {
                    if (selectedCharEmojiIds.has(e.id)) {
                        e.groupId = targetGroupId;
                    }
                });
                saveCharEmojis(emojis);
                
                selectedCharEmojiIds.clear();
                isCharEmojiMultiSelectMode = false;
                if (popupCharEmojiMove) popupCharEmojiMove.classList.remove('active');
                
                updateCharEmojiManageFooter();
                renderCharEmojiManageGroups();
                renderCharEmojiManageList();
                
                if (ctx.showAlert) ctx.showAlert('移动成功', '角色表情包已移动到指定分组。');
            });
        }

        // 单个添加相关节点
        const singleTitle = container.querySelector('#emoji-single-title');
        const singleName = container.querySelector('#emoji-single-name');
        const singleGroup = container.querySelector('#emoji-single-group');
        const singleUrl = container.querySelector('#emoji-single-url');
        const btnSingleUpload = container.querySelector('#btn-emoji-single-upload');
        const inputSingleUpload = container.querySelector('#input-emoji-single-upload');
        const singlePreviewBox = container.querySelector('#emoji-single-preview-container');
        const singlePreviewImg = container.querySelector('#emoji-single-preview');
        const btnSaveSingle = container.querySelector('#btn-save-emoji-single');
        let currentSingleBase64 = null;
        let editingEmojiId = null;

        const openEmojiEdit = async (emoji = null) => {
            if (singleGroup) {
                singleGroup.innerHTML = '';
                const groups = loadEmojiGroups();
                groups.forEach(g => {
                    const opt = document.createElement('option');
                    opt.value = g.id;
                    opt.textContent = g.name;
                    singleGroup.appendChild(opt);
                });
            }

            if (emoji) {
                editingEmojiId = emoji.id;
                if (singleTitle) singleTitle.textContent = '编辑表情';
                if (singleName) singleName.value = emoji.name || '';
                if (singleGroup) singleGroup.value = emoji.groupId || 'default';
                
                if (emoji.type === 'local') {
                    if (singleUrl) singleUrl.value = '';
                    try {
                        const base64 = await window.ImageStorageManager.loadFromIndexedDB(emoji.id);
                        if (base64) {
                            currentSingleBase64 = base64;
                            if (singlePreviewImg) singlePreviewImg.src = base64;
                            if (singlePreviewBox) singlePreviewBox.style.display = 'block';
                        }
                    } catch(e) {}
                } else {
                    if (singleUrl) singleUrl.value = emoji.url || '';
                    currentSingleBase64 = null;
                    if (emoji.url) {
                        if (singlePreviewImg) singlePreviewImg.src = emoji.url;
                        if (singlePreviewBox) singlePreviewBox.style.display = 'block';
                    } else {
                        if (singlePreviewBox) singlePreviewBox.style.display = 'none';
                    }
                }
            } else {
                editingEmojiId = null;
                if (singleTitle) singleTitle.textContent = '添加表情';
                if (singleName) singleName.value = '';
                if (singleGroup) singleGroup.value = currentEmojiManageGroupId !== 'all' ? currentEmojiManageGroupId : 'default';
                if (singleUrl) singleUrl.value = '';
                currentSingleBase64 = null;
                if (singlePreviewBox) singlePreviewBox.style.display = 'none';
            }
            if (popupEmojiSingle) popupEmojiSingle.classList.add('active');
        };

        const renderEmojiManageGroups = () => {
            const groupList = container.querySelector('#emoji-manage-groups');
            if (!groupList) return;
            groupList.innerHTML = '';
            
            const groups = loadEmojiGroups();
            const allGroups = [{ id: 'all', name: '全部' }, ...groups];
            
            allGroups.forEach(g => {
                const el = document.createElement('div');
                const isActive = currentEmojiManageGroupId === g.id;
                el.style.cssText = `padding: 10px 8px; border-radius: 6px; font-size: 13px; cursor: pointer; transition: all 0.2s; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; justify-content: space-between; align-items: center;`;
                if (isActive) {
                    el.style.background = 'rgba(0,0,0,0.06)';
                    el.style.fontWeight = '600';
                    el.style.color = '#18181b';
                } else {
                    el.style.background = 'transparent';
                    el.style.fontWeight = 'normal';
                    el.style.color = '#52525b';
                }
                
                const nameSpan = document.createElement('span');
                nameSpan.textContent = g.name;
                nameSpan.style.flex = '1';
                nameSpan.style.overflow = 'hidden';
                nameSpan.style.textOverflow = 'ellipsis';
                el.appendChild(nameSpan);
                
                el.onclick = (e) => {
                    if (e.target.closest('.group-action')) return;
                    currentEmojiManageGroupId = g.id;
                    isEmojiMultiSelectMode = false;
                    selectedEmojiIds.clear();
                    renderEmojiManageGroups();
                    renderEmojiManageList();
                    updateEmojiManageFooter();
                };
                
                groupList.appendChild(el);
            });
        };

        const renderEmojiManageList = () => {
            const list = container.querySelector('#emoji-manage-list');
            if (!list) return;
            list.innerHTML = '';
            
            let emojis = loadEmojis();
            
            if (currentEmojiManageGroupId !== 'all') {
                emojis = emojis.filter(e => e.groupId === currentEmojiManageGroupId);
            }
            
            if (currentEmojiManageSearchKey) {
                const keyword = currentEmojiManageSearchKey.toLowerCase();
                emojis = emojis.filter(e => (e.name && e.name.toLowerCase().includes(keyword)));
            }
            
            if (emojis.length === 0) {
                list.innerHTML = '<div style="width: 100%; text-align: center; color: var(--text-secondary); font-size: 13px; padding: 40px 0;">空空如也</div>';
                return;
            }
            
            emojis.forEach(emoji => {
                const el = document.createElement('div');
                let isChecked = isEmojiMultiSelectMode && selectedEmojiIds.has(emoji.id);
                el.style.cssText = `width: 64px; height: 64px; flex-shrink: 0; border-radius: 8px; overflow: hidden; background: #f4f4f5; position: relative; border: 2px solid ${isChecked ? 'var(--accent-color, #18181b)' : 'var(--border-color)'}; box-sizing: border-box; transition: all 0.2s ease;`;
                
                if (isEmojiMultiSelectMode) {
                    const checkIcon = document.createElement('div');
                    checkIcon.style.cssText = `position: absolute; top: 4px; left: 4px; width: 16px; height: 16px; border-radius: 4px; background: ${isChecked ? 'var(--accent-color, #18181b)' : 'rgba(0,0,0,0.2)'}; color: white; display: flex; align-items: center; justify-content: center; z-index: 10;`;
                    if (isChecked) {
                        checkIcon.innerHTML = '<i class="ph-bold ph-check" style="font-size: 10px;"></i>';
                    }
                    el.appendChild(checkIcon);
                }

                const img = document.createElement('img');
                img.style.cssText = 'width: 100%; height: 100%; object-fit: contain; pointer-events: none;';
                img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                
                const getImgSrc = async () => {
                    if (emoji.type === 'local' && window.ImageStorageManager) {
                        try {
                            const data = await window.ImageStorageManager.loadFromIndexedDB(emoji.id);
                            if (data) return data;
                        } catch(e) {}
                    }
                    return emoji.url;
                };
                
                getImgSrc().then(src => { img.src = src || img.src; });
                el.appendChild(img);
                
                if (emoji.name) {
                    const nameTag = document.createElement('div');
                    nameTag.style.cssText = 'position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.5); color: #fff; font-size: 10px; padding: 2px 4px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; pointer-events: none;';
                    nameTag.textContent = emoji.name;
                    el.appendChild(nameTag);
                }
                
                el.style.cursor = 'pointer';
                el.onclick = (e) => {
                    if (e.target.closest('button')) return; 
                    if (isEmojiMultiSelectMode) {
                        if (selectedEmojiIds.has(emoji.id)) {
                            selectedEmojiIds.delete(emoji.id);
                        } else {
                            selectedEmojiIds.add(emoji.id);
                        }
                        updateEmojiManageFooter();
                        renderEmojiManageList();
                    } else {
                        openEmojiEdit(emoji);
                    }
                };

                if (!isEmojiMultiSelectMode) {
                    const delBtn = document.createElement('button');
                    delBtn.style.cssText = 'position: absolute; top: 4px; right: 4px; width: 20px; height: 20px; border-radius: 50%; background: rgba(255,59,48,0.9); color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 12px; z-index: 10;';
                    delBtn.innerHTML = '<i class="ph ph-x"></i>';
                    delBtn.onclick = async (e) => {
                        e.stopPropagation();
                        if (ctx.showConfirm) {
                            ctx.showConfirm('删除表情', '确定要删除这个表情吗？', async () => {
                                let currentEmojis = loadEmojis();
                                currentEmojis = currentEmojis.filter(e => e.id !== emoji.id);
                                saveEmojis(currentEmojis);
                                if (emoji.type === 'local' && window.ImageStorageManager) {
                                    await window.ImageStorageManager.deleteFromIndexedDB(emoji.id);
                                }
                                renderEmojiManageList();
                                renderEmojiPanelList();
                            });
                        }
                    };
                    el.appendChild(delBtn);
                }
                
                list.appendChild(el);
            });
        };

        const btnAddEmojiGroup = container.querySelector('#btn-add-emoji-group');
        if (btnAddEmojiGroup) {
            btnAddEmojiGroup.addEventListener('click', () => {
                if (ctx.showPrompt) {
                    ctx.showPrompt('新建表情分组', '', (name) => {
                        if (name && name.trim()) {
                            let groups = loadEmojiGroups();
                            const newGroupId = 'group_' + Date.now();
                            groups.push({ id: newGroupId, name: name.trim() });
                            saveEmojiGroups(groups);
                            
                            currentEmojiManageGroupId = newGroupId;
                            isEmojiMultiSelectMode = false;
                            selectedEmojiIds.clear();
                            renderEmojiManageGroups();
                            renderEmojiManageList();
                            updateEmojiManageFooter();
                            renderEmojiPanelGroups();
                        }
                    }, false, '', true, '例如：日常');
                }
            });
        }

        const popupEmojiGroupAction = container.querySelector('#chat-emoji-group-action-popup');
        const inputEmojiGroupName = container.querySelector('#emoji-group-action-name');
        const btnEmojiGroupDelete = container.querySelector('#btn-emoji-group-delete');
        const btnEmojiGroupSave = container.querySelector('#btn-emoji-group-save');

        const btnManageGroupActions = container.querySelector('#btn-manage-group-actions');
        if (btnManageGroupActions) {
            btnManageGroupActions.addEventListener('click', () => {
                if (currentEmojiManageGroupId === 'all') {
                    if (ctx.showAlert) ctx.showAlert('提示', '【全部】不是真实的分组，无法操作。');
                    return;
                }
                if (currentEmojiManageGroupId === 'default') {
                    if (ctx.showAlert) ctx.showAlert('提示', '【默认分组】是系统内置的分组，无法修改或删除。');
                    return;
                }
                
                const groups = loadEmojiGroups();
                const group = groups.find(g => g.id === currentEmojiManageGroupId);
                if (!group) return;
                
                if (popupEmojiGroupAction && inputEmojiGroupName) {
                    inputEmojiGroupName.value = group.name;
                    popupEmojiGroupAction.classList.add('active');
                }
            });
        }

        if (btnEmojiGroupDelete) {
            btnEmojiGroupDelete.addEventListener('click', () => {
                const groups = loadEmojiGroups();
                const group = groups.find(g => g.id === currentEmojiManageGroupId);
                if (!group) return;

                if (ctx.showConfirm) {
                    ctx.showConfirm('确认删除', `确定要删除分组【${group.name}】吗？表情将移至默认分组。`, () => {
                        let gs = loadEmojiGroups();
                        gs = gs.filter(g => g.id !== currentEmojiManageGroupId);
                        saveEmojiGroups(gs);
                        
                        let es = loadEmojis();
                        es.forEach(e => {
                            if (e.groupId === currentEmojiManageGroupId) {
                                e.groupId = 'default';
                            }
                        });
                        saveEmojis(es);
                        
                        currentEmojiManageGroupId = 'all';
                        renderEmojiManageGroups();
                        renderEmojiManageList();
                        renderEmojiPanelGroups();
                        renderEmojiPanelList();
                        
                        if (popupEmojiGroupAction) popupEmojiGroupAction.classList.remove('active');
                        if (ctx.showAlert) ctx.showAlert('已删除', '分组已删除。');
                    });
                }
            });
        }

        if (btnEmojiGroupSave) {
            btnEmojiGroupSave.addEventListener('click', () => {
                if (!inputEmojiGroupName) return;
                const newName = inputEmojiGroupName.value.trim();
                if (!newName) {
                    if (ctx.showAlert) ctx.showAlert('提示', '分组名称不能为空。');
                    return;
                }

                let gs = loadEmojiGroups();
                const idx = gs.findIndex(g => g.id === currentEmojiManageGroupId);
                if (idx !== -1) {
                    gs[idx].name = newName;
                    saveEmojiGroups(gs);
                    renderEmojiManageGroups();
                    renderEmojiPanelGroups();
                    
                    if (popupEmojiGroupAction) popupEmojiGroupAction.classList.remove('active');
                    if (ctx.showAlert) ctx.showAlert('已重命名', '分组重命名成功。');
                }
            });
        }

        const inputEmojiManageSearch = container.querySelector('#emoji-manage-search');
        if (inputEmojiManageSearch) {
            inputEmojiManageSearch.addEventListener('input', (e) => {
                currentEmojiManageSearchKey = e.target.value.trim();
                renderEmojiManageList();
                updateEmojiManageFooter();
            });
        }

        if (btnManageEmojis && popupEmojiManage) {
            btnManageEmojis.addEventListener('click', () => {
                isEmojiMultiSelectMode = false;
                selectedEmojiIds.clear();
                currentEmojiManageGroupId = 'all';
                currentEmojiManageSearchKey = '';
                if (inputEmojiManageSearch) inputEmojiManageSearch.value = '';
                
                renderEmojiManageGroups();
                renderEmojiManageList();
                updateEmojiManageFooter();
                popupEmojiManage.classList.add('active');
            });
        }
        
        // 单个添加
        const btnAddEmojiSingle = container.querySelector('#btn-add-emoji-single');
        if (btnAddEmojiSingle && popupEmojiSingle) {
            btnAddEmojiSingle.addEventListener('click', () => {
                openEmojiEdit(null);
            });
        }
        
        if (singleUrl) {
            singleUrl.addEventListener('input', () => {
                if (singleUrl.value.trim()) {
                    singlePreviewImg.src = singleUrl.value.trim();
                    singlePreviewBox.style.display = 'block';
                    currentSingleBase64 = null;
                } else {
                    singlePreviewBox.style.display = 'none';
                }
            });
        }
        
        if (btnSingleUpload && inputSingleUpload) {
            btnSingleUpload.addEventListener('click', () => inputSingleUpload.click());
            inputSingleUpload.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                singleUrl.value = '';
                try {
                    const base64 = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = ev => resolve(ev.target.result);
                        reader.onerror = reject;
                        reader.readAsDataURL(file);
                    });
                    currentSingleBase64 = base64;
                    singlePreviewImg.src = base64;
                    singlePreviewBox.style.display = 'block';
                } catch(err) {
                    if (ctx.showAlert) ctx.showAlert('失败', '读取图片失败');
                }
                e.target.value = '';
            });
        }
        
        if (btnSaveSingle) {
            btnSaveSingle.addEventListener('click', async () => {
                const nameVal = singleName.value.trim();
                if (!nameVal) {
                    if (ctx.showAlert) ctx.showAlert('提示', '请填写表情名称');
                    return;
                }
                const urlVal = singleUrl.value.trim();
                if (!urlVal && !currentSingleBase64) {
                    if (ctx.showAlert) ctx.showAlert('提示', '请填写链接或上传图片');
                    return;
                }
                
                const emojiId = editingEmojiId || 'emoji_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
                const emojiObj = {
                    id: emojiId,
                    name: singleName.value.trim(),
                    groupId: singleGroup ? singleGroup.value : 'default',
                    type: currentSingleBase64 ? 'local' : 'url',
                    url: currentSingleBase64 ? '' : urlVal
                };
                
                if (currentSingleBase64 && window.ImageStorageManager) {
                    try {
                        await window.ImageStorageManager.saveToIndexedDB(emojiId, currentSingleBase64);
                    } catch(e) {
                        if (ctx.showAlert) ctx.showAlert('失败', '图片保存到本地存储失败');
                        return;
                    }
                } else if (editingEmojiId && emojiObj.type === 'url' && window.ImageStorageManager) {
                    try {
                        await window.ImageStorageManager.deleteFromIndexedDB(editingEmojiId);
                    } catch (e) {}
                }
                
                let emojis = loadEmojis();
                if (editingEmojiId) {
                    const idx = emojis.findIndex(e => e.id === editingEmojiId);
                    if (idx !== -1) {
                        emojis[idx] = emojiObj;
                    }
                } else {
                    emojis.unshift(emojiObj);
                }
                saveEmojis(emojis);
                
                popupEmojiSingle.classList.remove('active');
                renderEmojiManageList();
                renderEmojiPanelList();
            });
        }
        
        // 批量导入
        const btnAddEmojiBatch = container.querySelector('#btn-add-emoji-batch');
        const batchText = container.querySelector('#emoji-batch-text');
        const selBatchGroup = container.querySelector('#emoji-batch-group');
        const btnBatchUpload = container.querySelector('#btn-emoji-batch-upload');
        const inputBatchUpload = container.querySelector('#input-emoji-batch-upload');
        const btnSaveBatch = container.querySelector('#btn-save-emoji-batch');
        
        if (btnAddEmojiBatch && popupEmojiBatch) {
            btnAddEmojiBatch.addEventListener('click', () => {
                batchText.value = '';
                if (selBatchGroup) {
                    selBatchGroup.innerHTML = '';
                    const groups = loadEmojiGroups();
                    groups.forEach(g => {
                        const opt = document.createElement('option');
                        opt.value = g.id;
                        opt.textContent = g.name;
                        selBatchGroup.appendChild(opt);
                    });
                    selBatchGroup.value = currentEmojiManageGroupId !== 'all' ? currentEmojiManageGroupId : 'default';
                }
                popupEmojiBatch.classList.add('active');
            });
        }
        
        if (btnBatchUpload && inputBatchUpload) {
            btnBatchUpload.addEventListener('click', () => inputBatchUpload.click());
            inputBatchUpload.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                // 处理 ZIP 批量导入
                if (file.name.toLowerCase().endsWith('.zip') && window.zipManager) {
                    try {
                        const files = await window.zipManager.processZipFile(file);
                        if (files && files.length > 0) {
                            let totalTextContent = '';

                            if (ctx.showAlert) ctx.showAlert('正在解析', '正在读取ZIP内容...');

                            for (const f of files) {
                                const fExtension = f.name.split('.').pop().toLowerCase();
                                let textContent = '';
                                if (fExtension === 'txt') {
                                    textContent = await new Promise((resolve, reject) => {
                                        const reader = new FileReader();
                                        reader.onload = (ev) => resolve(ev.target.result);
                                        reader.onerror = () => reject(new Error('TXT读取失败'));
                                        reader.readAsText(f, 'utf-8'); 
                                    });
                                } else if (fExtension === 'doc' || fExtension === 'docx') {
                                    if (typeof mammoth === 'undefined') throw new Error('未加载文档解析库');
                                    const arrayBuffer = await new Promise((resolve, reject) => {
                                        const reader = new FileReader();
                                        reader.onload = (ev) => resolve(ev.target.result);
                                        reader.onerror = () => reject(new Error('文档读取失败'));
                                        reader.readAsArrayBuffer(f);
                                    });
                                    const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
                                    textContent = result.value;
                                }
                                totalTextContent += textContent + '\n';
                            }

                            if (ctx.nodes.chatAlertPopup) ctx.nodes.chatAlertPopup.classList.remove('active');
                            if (batchText) {
                                batchText.value = totalTextContent;
                            }
                        }
                    } catch (err) {
                        console.log('ZIP 处理被取消或失败:', err);
                        if (ctx.showAlert) ctx.showAlert('解析失败', err.message);
                    } finally {
                        e.target.value = '';
                    }
                    return;
                }
                
                if (ctx.showAlert) {
                    ctx.showAlert('正在解析', '正在读取文档内容...');
                }

                try {
                    let textContent = '';
                    const extension = file.name.split('.').pop().toLowerCase();

                    if (extension === 'txt') {
                        textContent = await new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = (ev) => resolve(ev.target.result);
                            reader.onerror = () => reject(new Error('TXT读取失败'));
                            reader.readAsText(file, 'utf-8'); 
                        });
                    } else if (extension === 'doc' || extension === 'docx') {
                        if (typeof mammoth === 'undefined') throw new Error('未加载文档解析库');
                        const arrayBuffer = await new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = (ev) => resolve(ev.target.result);
                            reader.onerror = () => reject(new Error('文档读取失败'));
                            reader.readAsArrayBuffer(file);
                        });
                        const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
                        textContent = result.value;
                    }
                    
                    if (ctx.nodes.chatAlertPopup) ctx.nodes.chatAlertPopup.classList.remove('active');
                    batchText.value = textContent;
                } catch (err) {
                    if (ctx.showAlert) ctx.showAlert('解析失败', err.message);
                } finally {
                    e.target.value = '';
                }
            });
        }
        
        if (btnSaveBatch) {
            btnSaveBatch.addEventListener('click', () => {
                const text = batchText.value.trim();
                if (!text) {
                    if (ctx.showAlert) ctx.showAlert('提示', '请输入内容');
                    return;
                }
                
                const lines = text.split('\n');
                let emojis = loadEmojis();
                let addedCount = 0;
                
                lines.forEach(line => {
                    line = line.trim();
                    if (!line) return;
                    
                    const httpIndex = line.search(/http[s]?:\/\//i);
                    let name = '';
                    let url = '';

                    if (httpIndex !== -1) {
                        url = line.substring(httpIndex).trim();
                        if (httpIndex > 0) {
                            name = line.substring(0, httpIndex)
                                .replace(/[\s:\|：，,。、\-—=~～_]+$/, '')
                                .trim();
                        }
                        
                        emojis.unshift({
                            id: 'emoji_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5) + addedCount,
                            name: name,
                            groupId: selBatchGroup ? selBatchGroup.value : 'default',
                            type: 'url',
                            url: url
                        });
                        addedCount++;
                    }
                });
                
                if (addedCount > 0) {
                    saveEmojis(emojis);
                    popupEmojiBatch.classList.remove('active');
                    renderEmojiManageList();
                    renderEmojiPanelList();
                    if (ctx.showAlert) ctx.showAlert('导入成功', `成功导入了 ${addedCount} 个表情`);
                } else {
                    if (ctx.showAlert) ctx.showAlert('提示', '未能解析出任何有效的表情链接，请检查格式');
                }
            });
        }

        const openCharEmojiManage = () => {
            isCharEmojiMultiSelectMode = false;
            selectedCharEmojiIds.clear();
            currentCharEmojiManageGroupId = 'all';
            currentCharEmojiManageSearchKey = '';
            if (inputCharEmojiManageSearch) inputCharEmojiManageSearch.value = '';
            
            renderCharEmojiManageGroups();
            renderCharEmojiManageList();
            updateCharEmojiManageFooter();
            if (popupCharEmojiManage) popupCharEmojiManage.classList.add('active');
        };

        // 把方法暴露出去，使得其他模块也可以使用（例如角色设置弹窗里的表情包关联）
        window.ChatEmojiModule.openCharEmojiManage = openCharEmojiManage;
        
        ctx.emojiModule = {
            loadEmojis,
            saveEmojis,
            loadEmojiGroups,
            saveEmojiGroups,
            loadCharEmojis,
            saveCharEmojis,
            loadCharEmojiGroups,
            saveCharEmojiGroups,
            renderEmojiPanelGroups,
            renderEmojiPanelList,
            renderCharEmojiManageGroups,
            renderCharEmojiManageList,
            openCharEmojiManage
        };
    }
};
