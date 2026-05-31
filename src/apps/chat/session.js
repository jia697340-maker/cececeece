window.ChatSession = class ChatSession {
    constructor(context) {
        this.ctx = context;
        this.initEventListeners();
    }

    initEventListeners() {
        const { nodes } = this.ctx;

        // ----------------------------------------------------
        // 会话分组管理逻辑
        // ----------------------------------------------------
        
        // 新建分组
        if (nodes.btnCreateSessionGroup) {
            nodes.btnCreateSessionGroup.addEventListener('click', () => {
                const name = nodes.sessionGroupNewName.value.trim();
                if (!name) {
                    if (window._currentChatOSAlert) window._currentChatOSAlert('提示', '请输入分组名称');
                    return;
                }
                const groups = window.ChatStorage.loadCharListGroups();
                const newId = 'list_group_' + Date.now();
                groups.push({ id: newId, name: name });
                window.ChatStorage.saveCharListGroups(groups);
                
                nodes.sessionGroupNewName.value = '';
                this.renderChatListGroups();
                this.renderSessionGroupOptions();
                if (nodes.sessionGroupSelect) nodes.sessionGroupSelect.value = newId;
                if (window._currentChatOSAlert) window._currentChatOSAlert('成功', '分组创建成功');
            });
        }

        // 分组管理多选模式切换
        if (nodes.btnManageSessionGroupsMulti) {
            nodes.btnManageSessionGroupsMulti.addEventListener('click', () => {
                this.ctx.isSessionGroupManageMultiMode = !this.ctx.isSessionGroupManageMultiMode;
                this.ctx.selectedSessionGroupIds.clear();
                this.updateSessionGroupManageFooter();
                this.renderSessionGroupManageList();
            });
        }

        // 分组管理全选
        if (nodes.btnSelectAllSessionGroups) {
            nodes.btnSelectAllSessionGroups.addEventListener('click', () => {
                const groups = window.ChatStorage.loadCharListGroups();
                if (this.ctx.selectedSessionGroupIds.size === groups.length) {
                    this.ctx.selectedSessionGroupIds.clear();
                } else {
                    groups.forEach(g => this.ctx.selectedSessionGroupIds.add(g.id));
                }
                this.updateSessionGroupManageFooter();
                this.renderSessionGroupManageList();
            });
        }

        // 批量删除分组
        if (nodes.btnDeleteSelectedSessionGroups) {
            nodes.btnDeleteSelectedSessionGroups.addEventListener('click', () => {
                if (this.ctx.selectedSessionGroupIds.size === 0) return;
                
                // 这里需要调用全局的 showChatConfirm，由于它定义在之前的 index.js 中比较复杂，
                // 我们在 context 中可以将其暴露，或者如果尚未重构完全，可以用 window._showChatConfirm 替代。
                // 暂时假设在全局可用或者通过事件总线处理。这里如果还未重构 showChatConfirm，
                // 我们可以先保留调用方式。
                if (typeof showChatConfirm !== 'undefined') {
                    showChatConfirm('批量删除分组', `确定要删除选中的 ${this.ctx.selectedSessionGroupIds.size} 个分组吗？角色不会被删除。`, () => {
                        this.deleteSelectedGroups();
                    });
                } else {
                    // Fallback to basic confirm if UI not ready
                    if (confirm(`确定要删除选中的 ${this.ctx.selectedSessionGroupIds.size} 个分组吗？角色不会被删除。`)) {
                        this.deleteSelectedGroups();
                    }
                }
            });
        }

        // 开启分组管理面板
        if (nodes.btnManageSessionGroups) {
            nodes.btnManageSessionGroups.addEventListener('click', () => {
                this.ctx.isSessionGroupManageMultiMode = false;
                this.ctx.selectedSessionGroupIds.clear();
                this.updateSessionGroupManageFooter();
                this.renderSessionGroupManageList();
                nodes.popupSessionGroupManage.classList.add('active');
            });
        }

        // 确认将会话移动到分组
        if (nodes.btnConfirmSessionGroup) {
            nodes.btnConfirmSessionGroup.addEventListener('click', () => {
                const targetGroupId = nodes.sessionGroupSelect ? nodes.sessionGroupSelect.value : '';
                let chars = window.ChatStorage.loadCharacters();
                let charsChanged = false;
                
                const processIdAttr = (idAttr) => {
                    if (String(idAttr).startsWith('char_')) {
                        const index = chars.findIndex(c => c.id === idAttr);
                        if (index !== -1) {
                            if (targetGroupId) {
                                chars[index].listGroupId = targetGroupId;
                            } else {
                                delete chars[index].listGroupId;
                            }
                            charsChanged = true;
                        }
                    } else {
                        const id = parseInt(idAttr);
                        const item = this.ctx.initialMessages.find(m => m.id === id);
                        if (item) {
                            if (targetGroupId) {
                                item.listGroupId = targetGroupId;
                            } else {
                                delete item.listGroupId;
                            }
                        }
                    }
                };

                if (this.ctx.isSessionSelectMode && this.ctx.selectedSessionIds.size > 0) {
                    this.ctx.selectedSessionIds.forEach(idAttr => {
                        processIdAttr(idAttr);
                    });
                    this.exitSessionSelectMode();
                } else if (this.ctx.activeSessionForMenu) {
                    processIdAttr(this.ctx.activeSessionForMenu.id);
                    this.closeSessionMenu();
                }

                if (charsChanged) {
                    window.ChatStorage.saveCharacters(chars);
                }

                nodes.popupSessionGroup.classList.remove('active');
                this.renderChatList();
                if (window._currentChatOSAlert) window._currentChatOSAlert('提示', '分组设置成功');
            });
        }

        // ----------------------------------------------------
        // 会话多选操作栏逻辑
        // ----------------------------------------------------
        
        if (nodes.btnSessionSelectCancel) {
            nodes.btnSessionSelectCancel.addEventListener('click', () => this.exitSessionSelectMode());
        }

        if (nodes.btnSessionSelectAll) {
            nodes.btnSessionSelectAll.addEventListener('click', () => {
                const allItems = nodes.chatListContainer.querySelectorAll('.chat-list-item-wrapper');
                if (this.ctx.selectedSessionIds.size === allItems.length) {
                    this.ctx.selectedSessionIds.clear();
                } else {
                    allItems.forEach(wrapper => {
                        const idAttr = wrapper.getAttribute('data-id');
                        if (idAttr) this.ctx.selectedSessionIds.add(idAttr);
                    });
                }
                this.updateSessionSelectBarUI();
            });
        }
        
        if (nodes.btnSessionSelectPin) {
            nodes.btnSessionSelectPin.addEventListener('click', () => {
                if (this.ctx.selectedSessionIds.size === 0) return;
                this.ctx.selectedSessionIds.forEach(idAttr => {
                    this.setSessionPinned(idAttr, true);
                });
                this.exitSessionSelectMode();
                this.renderChatList();
            });
        }
        
        if (nodes.btnSessionSelectUnpin) {
            nodes.btnSessionSelectUnpin.addEventListener('click', () => {
                if (this.ctx.selectedSessionIds.size === 0) return;
                this.ctx.selectedSessionIds.forEach(idAttr => {
                    this.setSessionPinned(idAttr, false);
                });
                this.exitSessionSelectMode();
                this.renderChatList();
            });
        }

        if (nodes.btnSessionSelectRead) {
            nodes.btnSessionSelectRead.addEventListener('click', () => {
                if (this.ctx.selectedSessionIds.size === 0) return;
                this.ctx.selectedSessionIds.forEach(idAttr => {
                    this.setSessionReadStatus(idAttr, false);
                });
                this.exitSessionSelectMode();
                this.renderChatList();
            });
        }

        if (nodes.btnSessionSelectUnread) {
            nodes.btnSessionSelectUnread.addEventListener('click', () => {
                if (this.ctx.selectedSessionIds.size === 0) return;
                this.ctx.selectedSessionIds.forEach(idAttr => {
                    this.setSessionReadStatus(idAttr, true);
                });
                this.exitSessionSelectMode();
                this.renderChatList();
            });
        }

        if (nodes.btnSessionSelectGroup) {
            nodes.btnSessionSelectGroup.addEventListener('click', () => {
                if (this.ctx.selectedSessionIds.size === 0) return;
                this.renderSessionGroupOptions();
                if (nodes.sessionGroupSelect) nodes.sessionGroupSelect.value = '';
                nodes.popupSessionGroup.classList.add('active');
            });
        }

        if (nodes.btnSessionSelectDelete) {
            nodes.btnSessionSelectDelete.addEventListener('click', () => {
                if (this.ctx.selectedSessionIds.size === 0) return;
                const doDelete = async () => {
                    let chars = window.ChatStorage.loadCharacters();
                    let charsChanged = false;
                    
                    for (let idAttr of this.ctx.selectedSessionIds) {
                        if (String(idAttr).startsWith('char_')) {
                            chars = chars.filter(c => c.id !== idAttr);
                            charsChanged = true;
                            if (window.ImageStorageManager) {
                                await window.ImageStorageManager.deleteFromIndexedDB(`character-avatar-${idAttr}`);
                            }
                        } else {
                            const id = parseInt(idAttr);
                            this.ctx.initialMessages = this.ctx.initialMessages.filter(m => m.id !== id);
                        }
                    }
                    
                    if (charsChanged) {
                        window.ChatStorage.saveCharacters(chars);
                    }
                    
                    this.exitSessionSelectMode();
                    this.renderChatList();
                };

                if (typeof showChatConfirm !== 'undefined') {
                    showChatConfirm('批量删除会话', `确定要删除选中的 ${this.ctx.selectedSessionIds.size} 个会话吗？删除后不可恢复。`, doDelete);
                } else {
                    if (confirm(`确定要删除选中的 ${this.ctx.selectedSessionIds.size} 个会话吗？删除后不可恢复。`)) {
                        doDelete();
                    }
                }
            });
        }

        // ----------------------------------------------------
        // 会话长按菜单逻辑
        // ----------------------------------------------------
        
        if (nodes.sessionMenuOverlay) {
            nodes.sessionMenuOverlay.addEventListener('click', (e) => {
                if (e.target === nodes.sessionMenuOverlay) {
                    this.closeSessionMenu();
                }
            });
            nodes.sessionMenuOverlay.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.closeSessionMenu();
            });
        }

        if (nodes.btnSessionMenuGroup) {
            nodes.btnSessionMenuGroup.addEventListener('click', () => {
                if (!this.ctx.activeSessionForMenu) return;
                this.renderSessionGroupOptions();
                
                const idAttr = this.ctx.activeSessionForMenu.id;
                let currentGroupId = '';
                if (String(idAttr).startsWith('char_')) {
                    const chars = window.ChatStorage.loadCharacters();
                    const c = chars.find(c => c.id === idAttr);
                    if (c && c.listGroupId) currentGroupId = c.listGroupId;
                } else {
                    const id = parseInt(idAttr);
                    const item = this.ctx.initialMessages.find(m => m.id === id);
                    if (item && item.listGroupId) currentGroupId = item.listGroupId;
                }
                if (nodes.sessionGroupSelect) nodes.sessionGroupSelect.value = currentGroupId;

                nodes.popupSessionGroup.classList.add('active');
                this.closeSessionMenu();
            });
        }

        if (nodes.btnSessionMenuSelect) {
            nodes.btnSessionMenuSelect.addEventListener('click', () => {
                if (!this.ctx.activeSessionForMenu) return;
                
                this.ctx.isSessionSelectMode = true;
                this.ctx.selectedSessionIds.clear();
                this.ctx.selectedSessionIds.add(this.ctx.activeSessionForMenu.id);
                
                if (nodes.chatSessionSelectBar) nodes.chatSessionSelectBar.classList.add('active');
                if (nodes.chatListContainer) nodes.chatListContainer.classList.add('select-mode');
                
                this.updateSessionSelectBarUI();
                this.closeSessionMenu();
            });
        }

        if (nodes.btnSessionMenuDelete) {
            nodes.btnSessionMenuDelete.addEventListener('click', () => {
                if (!this.ctx.activeSessionForMenu) return;
                const idAttr = this.ctx.activeSessionForMenu.id;
                
                const doDelete = async () => {
                    if (String(idAttr).startsWith('char_')) {
                        let chars = window.ChatStorage.loadCharacters();
                        chars = chars.filter(c => c.id !== idAttr);
                        window.ChatStorage.saveCharacters(chars);
                        if (window.ImageStorageManager) {
                            await window.ImageStorageManager.deleteFromIndexedDB(`character-avatar-${idAttr}`);
                        }
                    } else {
                        const id = parseInt(idAttr);
                        this.ctx.initialMessages = this.ctx.initialMessages.filter(m => m.id !== id);
                    }
                    this.renderChatList();
                };

                if (typeof showChatConfirm !== 'undefined') {
                    showChatConfirm('删除记录', '确定要删除此聊天记录吗？', doDelete);
                } else {
                    if (confirm('确定要删除此聊天记录吗？')) {
                        doDelete();
                    }
                }
                this.closeSessionMenu();
            });
        }
        
        if (nodes.btnSessionMenuPin) {
            nodes.btnSessionMenuPin.addEventListener('click', () => {
                if (!this.ctx.activeSessionForMenu) return;
                this.setSessionPinned(this.ctx.activeSessionForMenu.id, true);
                this.renderChatList();
                this.closeSessionMenu();
            });
        }

        if (nodes.btnSessionMenuUnpin) {
            nodes.btnSessionMenuUnpin.addEventListener('click', () => {
                if (!this.ctx.activeSessionForMenu) return;
                this.setSessionPinned(this.ctx.activeSessionForMenu.id, false);
                this.renderChatList();
                this.closeSessionMenu();
            });
        }

        if (nodes.btnSessionMenuRead) {
            nodes.btnSessionMenuRead.addEventListener('click', () => {
                if (!this.ctx.activeSessionForMenu) return;
                this.setSessionReadStatus(this.ctx.activeSessionForMenu.id, false);
                this.renderChatList();
                this.closeSessionMenu();
            });
        }

        if (nodes.btnSessionMenuUnread) {
            nodes.btnSessionMenuUnread.addEventListener('click', () => {
                if (!this.ctx.activeSessionForMenu) return;
                this.setSessionReadStatus(this.ctx.activeSessionForMenu.id, true);
                this.renderChatList();
                this.closeSessionMenu();
            });
        }
        
        // 搜索功能
        const searchInput = this.ctx.container.querySelector('.chat-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.renderChatList();
            });
        }
    }

    // ----------------------------------------------------
    // 方法：分组管理
    // ----------------------------------------------------

    deleteSelectedGroups() {
        const groups = window.ChatStorage.loadCharListGroups();
        const newGroups = groups.filter(group => !this.ctx.selectedSessionGroupIds.has(group.id));
        window.ChatStorage.saveCharListGroups(newGroups);
        
        // 清理该分组下的角色的groupId
        let chars = window.ChatStorage.loadCharacters();
        let changed = false;
        chars.forEach(c => {
            if (c.listGroupId && this.ctx.selectedSessionGroupIds.has(c.listGroupId)) {
                delete c.listGroupId;
                changed = true;
            }
        });
        if (changed) window.ChatStorage.saveCharacters(chars);

        if (this.ctx.selectedSessionGroupIds.has(this.ctx.currentListGroupId)) {
            this.ctx.currentListGroupId = 'all';
        }
        
        this.ctx.selectedSessionGroupIds.clear();
        this.ctx.isSessionGroupManageMultiMode = false;
        
        this.updateSessionGroupManageFooter();
        this.renderChatListGroups();
        this.renderSessionGroupManageList();
        this.renderChatList();
        
        if (window._currentChatOSAlert) window._currentChatOSAlert('提示', '已删除所选分组');
    }

    renderChatListGroups() {
        const { nodes } = this.ctx;
        if (!nodes.chatListGroupTabs) return;
        nodes.chatListGroupTabs.innerHTML = '';
        
        const groups = window.ChatStorage.loadCharListGroups();
        const allGroups = [{ id: 'all', name: '全部' }, ...groups];
        
        allGroups.forEach(g => {
            const btn = document.createElement('button');
            btn.className = 'chat-btn-text';
            const isActive = this.ctx.currentListGroupId === g.id;
            btn.style.cssText = `padding: 4px 12px; font-size: 13px; border-radius: 16px; border: 1px solid ${isActive ? 'var(--accent-color, #18181b)' : 'transparent'}; background: ${isActive ? 'rgba(0,0,0,0.05)' : 'transparent'}; color: ${isActive ? 'var(--accent-color, #18181b)' : 'var(--text-secondary)'}; flex-shrink: 0; transition: all 0.2s; white-space: nowrap; font-weight: ${isActive ? '600' : 'normal'};`;
            btn.textContent = g.name;
            btn.onclick = () => {
                this.ctx.currentListGroupId = g.id;
                this.renderChatListGroups();
                this.renderChatList();
            };
            nodes.chatListGroupTabs.appendChild(btn);
        });
    }

    renderSessionGroupOptions() {
        const { nodes } = this.ctx;
        if (!nodes.sessionGroupSelect) return;
        nodes.sessionGroupSelect.innerHTML = '<option value="">无分组</option>';
        const groups = window.ChatStorage.loadCharListGroups();
        groups.forEach(g => {
            const opt = document.createElement('option');
            opt.value = g.id;
            opt.textContent = g.name;
            nodes.sessionGroupSelect.appendChild(opt);
        });
    }

    updateSessionGroupManageFooter() {
        const { nodes } = this.ctx;
        const groups = window.ChatStorage.loadCharListGroups();
        if (this.ctx.isSessionGroupManageMultiMode) {
            if (nodes.sessionGroupManageFooter) nodes.sessionGroupManageFooter.style.display = 'flex';
            if (nodes.btnManageSessionGroupsMulti) nodes.btnManageSessionGroupsMulti.textContent = '取消';
            if (nodes.btnDeleteSelectedSessionGroups) {
                nodes.btnDeleteSelectedSessionGroups.textContent = `删除 (${this.ctx.selectedSessionGroupIds.size})`;
                nodes.btnDeleteSelectedSessionGroups.disabled = this.ctx.selectedSessionGroupIds.size === 0;
            }
            if (groups.length > 0 && this.ctx.selectedSessionGroupIds.size === groups.length) {
                if (nodes.btnSelectAllSessionGroups) nodes.btnSelectAllSessionGroups.textContent = '取消全选';
            } else {
                if (nodes.btnSelectAllSessionGroups) nodes.btnSelectAllSessionGroups.textContent = '全选';
            }
        } else {
            if (nodes.sessionGroupManageFooter) nodes.sessionGroupManageFooter.style.display = 'none';
            if (nodes.btnManageSessionGroupsMulti) nodes.btnManageSessionGroupsMulti.textContent = '多选';
        }
    }

    renderSessionGroupManageList() {
        const { nodes } = this.ctx;
        if (!nodes.sessionGroupManageList) return;
        nodes.sessionGroupManageList.innerHTML = '';
        const groups = window.ChatStorage.loadCharListGroups();
        if (groups.length === 0) {
            nodes.sessionGroupManageList.innerHTML = '<div style="text-align:center; color:#999; font-size:13px; padding: 20px 0;">暂无分组</div>';
            return;
        }
        groups.forEach(g => {
            const item = document.createElement('div');
            let isChecked = this.ctx.isSessionGroupManageMultiMode && this.ctx.selectedSessionGroupIds.has(g.id);
            item.style.cssText = `display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: rgba(0,0,0,0.02); border-radius: 8px; border: 1px solid ${isChecked ? 'var(--accent-color, #18181b)' : 'var(--border-color)'}; cursor: ${this.ctx.isSessionGroupManageMultiMode ? 'pointer' : 'default'}; transition: border-color 0.2s;`;
            
            if (this.ctx.isSessionGroupManageMultiMode) {
                const checkIcon = document.createElement('div');
                checkIcon.style.cssText = `width: 18px; height: 18px; border-radius: 4px; background: ${isChecked ? 'var(--accent-color, #18181b)' : 'transparent'}; border: 1px solid ${isChecked ? 'transparent' : '#d1d1d6'}; color: white; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0;`;
                if (isChecked) {
                    checkIcon.innerHTML = '<i class="ph-bold ph-check" style="font-size: 12px;"></i>';
                }
                item.appendChild(checkIcon);
                
                const nameSpan = document.createElement('span');
                nameSpan.style.cssText = 'flex: 1; font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;';
                nameSpan.textContent = g.name;
                item.appendChild(nameSpan);
                
                item.addEventListener('click', () => {
                    if (this.ctx.selectedSessionGroupIds.has(g.id)) {
                        this.ctx.selectedSessionGroupIds.delete(g.id);
                    } else {
                        this.ctx.selectedSessionGroupIds.add(g.id);
                    }
                    this.updateSessionGroupManageFooter();
                    this.renderSessionGroupManageList();
                });
            } else {
                const input = document.createElement('input');
                input.type = 'text';
                input.value = g.name;
                input.style.cssText = 'flex: 1; border: none; background: transparent; outline: none; font-size: 14px; margin-right: 8px;';
                
                input.addEventListener('change', (e) => {
                    const newName = e.target.value.trim();
                    if (newName) {
                        g.name = newName;
                        window.ChatStorage.saveCharListGroups(groups);
                        this.renderChatListGroups();
                    }
                });

                const delBtn = document.createElement('button');
                delBtn.style.cssText = 'background: none; border: none; color: #FF3B30; cursor: pointer; padding: 4px; display: flex; align-items: center; justify-content: center;';
                delBtn.innerHTML = '<i class="ph ph-trash"></i>';
                
                delBtn.addEventListener('click', () => {
                    const doDeleteGroup = () => {
                        const newGroups = groups.filter(group => group.id !== g.id);
                        window.ChatStorage.saveCharListGroups(newGroups);
                        
                        let chars = window.ChatStorage.loadCharacters();
                        let changed = false;
                        chars.forEach(c => {
                            if (c.listGroupId === g.id) {
                                delete c.listGroupId;
                                changed = true;
                            }
                        });
                        if (changed) window.ChatStorage.saveCharacters(chars);

                        if (this.ctx.currentListGroupId === g.id) {
                            this.ctx.currentListGroupId = 'all';
                        }
                        this.renderChatListGroups();
                        this.renderSessionGroupManageList();
                        this.renderChatList();
                    };

                    if (typeof showChatConfirm !== 'undefined') {
                        showChatConfirm('删除分组', `确定要删除分组"${g.name}"吗？角色不会被删除。`, doDeleteGroup);
                    } else {
                        if (confirm(`确定要删除分组"${g.name}"吗？角色不会被删除。`)) {
                            doDeleteGroup();
                        }
                    }
                });
                
                item.appendChild(input);
                item.appendChild(delBtn);
            }
            
            nodes.sessionGroupManageList.appendChild(item);
        });
    }

    // ----------------------------------------------------
    // 方法：会话多选操作
    // ----------------------------------------------------

    updateSessionSelectBarUI() {
        const { nodes } = this.ctx;
        if (!nodes.chatListContainer) return;
        
        const allItems = nodes.chatListContainer.querySelectorAll('.chat-list-item-wrapper');
        const totalSessions = allItems.length;
        
        if (nodes.btnSessionSelectDelete) {
            nodes.btnSessionSelectDelete.textContent = `删除(${this.ctx.selectedSessionIds.size})`;
            nodes.btnSessionSelectDelete.disabled = this.ctx.selectedSessionIds.size === 0;
        }
        if (nodes.btnSessionSelectGroup) {
            nodes.btnSessionSelectGroup.textContent = `分组(${this.ctx.selectedSessionIds.size})`;
            nodes.btnSessionSelectGroup.disabled = this.ctx.selectedSessionIds.size === 0;
        }
        
        let allPinned = true;
        let anyPinned = false;
        let allRead = true;
        let allUnread = true;
        
        this.ctx.selectedSessionIds.forEach(id => {
            let isPinned = false;
            let isUnread = false;
            if (!String(id).startsWith('char_')) {
                const item = this.ctx.initialMessages.find(m => m.id === parseInt(id));
                if (item && item.isPinned) isPinned = true;
                if (item && item.isUnread) isUnread = true;
            } else {
                const chars = window.ChatStorage.loadCharacters();
                const item = chars.find(c => c.id === id);
                if (item && item.isPinned) isPinned = true;
                if (item && item.isUnread) isUnread = true;
            }
            if (isPinned) anyPinned = true;
            if (!isPinned) allPinned = false;
            if (isUnread) allRead = false;
            if (!isUnread) allUnread = false;
        });
        
        if (nodes.btnSessionSelectPin && nodes.btnSessionSelectUnpin) {
            if (this.ctx.selectedSessionIds.size === 0) {
                nodes.btnSessionSelectPin.style.display = 'block';
                nodes.btnSessionSelectUnpin.style.display = 'none';
                nodes.btnSessionSelectPin.textContent = '置顶(0)';
                nodes.btnSessionSelectPin.disabled = true;
            } else if (allPinned) {
                nodes.btnSessionSelectPin.style.display = 'none';
                nodes.btnSessionSelectUnpin.style.display = 'block';
                nodes.btnSessionSelectUnpin.textContent = `取消置顶(${this.ctx.selectedSessionIds.size})`;
                nodes.btnSessionSelectUnpin.disabled = false;
            } else {
                nodes.btnSessionSelectPin.style.display = 'block';
                nodes.btnSessionSelectUnpin.style.display = 'none';
                nodes.btnSessionSelectPin.textContent = `置顶(${this.ctx.selectedSessionIds.size})`;
                nodes.btnSessionSelectPin.disabled = false;
            }
        }

        if (nodes.btnSessionSelectRead && nodes.btnSessionSelectUnread) {
            if (this.ctx.selectedSessionIds.size === 0) {
                nodes.btnSessionSelectRead.style.display = 'none';
                nodes.btnSessionSelectUnread.style.display = 'block';
                nodes.btnSessionSelectUnread.textContent = '标为未读(0)';
                nodes.btnSessionSelectUnread.disabled = true;
            } else if (allUnread) {
                nodes.btnSessionSelectUnread.style.display = 'none';
                nodes.btnSessionSelectRead.style.display = 'block';
                nodes.btnSessionSelectRead.textContent = `标为已读(${this.ctx.selectedSessionIds.size})`;
                nodes.btnSessionSelectRead.disabled = false;
            } else {
                nodes.btnSessionSelectRead.style.display = 'none';
                nodes.btnSessionSelectUnread.style.display = 'block';
                nodes.btnSessionSelectUnread.textContent = `标为未读(${this.ctx.selectedSessionIds.size})`;
                nodes.btnSessionSelectUnread.disabled = false;
            }
        }

        if (nodes.btnSessionSelectAll) {
            if (this.ctx.selectedSessionIds.size > 0 && this.ctx.selectedSessionIds.size === totalSessions) {
                nodes.btnSessionSelectAll.textContent = '取消全选';
            } else {
                nodes.btnSessionSelectAll.textContent = '全选';
            }
        }
        
        allItems.forEach(wrapper => {
            const item = wrapper.querySelector('.chat-list-item');
            const idAttr = wrapper.getAttribute('data-id');
            if (idAttr) {
                const cb = item.querySelector('.session-checkbox');
                if (this.ctx.selectedSessionIds.has(idAttr)) {
                    item.classList.add('selected');
                    if (cb) cb.innerHTML = '<i class="ph-bold ph-check"></i>';
                } else {
                    item.classList.remove('selected');
                    if (cb) cb.innerHTML = '';
                }
            }
        });
    }

    exitSessionSelectMode() {
        const { nodes } = this.ctx;
        this.ctx.isSessionSelectMode = false;
        this.ctx.selectedSessionIds.clear();
        if (nodes.chatSessionSelectBar) nodes.chatSessionSelectBar.classList.remove('active');
        if (nodes.chatListContainer) {
            nodes.chatListContainer.classList.remove('select-mode');
            const allItems = nodes.chatListContainer.querySelectorAll('.chat-list-item-wrapper');
            allItems.forEach(wrapper => {
                const item = wrapper.querySelector('.chat-list-item');
                item.classList.remove('selected');
                const cb = item.querySelector('.session-checkbox');
                if (cb) cb.innerHTML = '';
            });
        }
    }

    setSessionPinned(idAttr, isPinned) {
         if (String(idAttr).startsWith('char_')) {
             let chars = window.ChatStorage.loadCharacters();
             const index = chars.findIndex(c => c.id === idAttr);
             if (index !== -1) {
                 chars[index].isPinned = isPinned;
                 chars[index].pinTime = isPinned ? Date.now() : 0;
                 window.ChatStorage.saveCharacters(chars);
             }
         } else {
             const id = parseInt(idAttr);
             const item = this.ctx.initialMessages.find(m => m.id === id);
             if (item) {
                 item.isPinned = isPinned;
                 item.pinTime = isPinned ? Date.now() : 0;
             }
         }
    }

    setSessionReadStatus(idAttr, isUnread) {
        if (String(idAttr).startsWith('char_')) {
            let chars = window.ChatStorage.loadCharacters();
            const index = chars.findIndex(c => c.id === idAttr);
            if (index !== -1) {
                chars[index].isUnread = isUnread;
                chars[index].unreadCount = isUnread ? 1 : 0;
                window.ChatStorage.saveCharacters(chars);
            }
        } else {
            const id = parseInt(idAttr);
            const item = this.ctx.initialMessages.find(m => m.id === id);
            if (item) {
                item.isUnread = isUnread;
                item.unreadCount = isUnread ? 1 : 0;
            }
        }
        this.updateTotalUnreadBadge();
    }

    // ----------------------------------------------------
    // 方法：会话长按菜单
    // ----------------------------------------------------

    closeSessionMenu() {
        const { nodes } = this.ctx;
        if (nodes.sessionMenuOverlay) nodes.sessionMenuOverlay.style.display = 'none';
        this.ctx.activeSessionForMenu = null;
    }

    showSessionMenu(e, msgObj, idAttr) {
        e.preventDefault();
        if (this.ctx.isSessionSelectMode) return;
        const { nodes } = this.ctx;
        
        this.ctx.activeSessionForMenu = { msgObj, id: idAttr };
        
        let isPinned = false;
        if (msgObj && msgObj.rawCharData && msgObj.rawCharData.isPinned) {
            isPinned = true;
        } else if (msgObj && msgObj.isPinned) {
            isPinned = true;
        }

        if (isPinned) {
            nodes.btnSessionMenuPin.style.display = 'none';
            nodes.btnSessionMenuUnpin.style.display = 'flex';
        } else {
            nodes.btnSessionMenuPin.style.display = 'flex';
            nodes.btnSessionMenuUnpin.style.display = 'none';
        }

        let isUnread = false;
        if (msgObj && msgObj.rawCharData && msgObj.rawCharData.isUnread) {
            isUnread = true;
        } else if (msgObj && msgObj.isUnread) {
            isUnread = true;
        }

        if (isUnread) {
            nodes.btnSessionMenuRead.style.display = 'flex';
            nodes.btnSessionMenuUnread.style.display = 'none';
        } else {
            nodes.btnSessionMenuRead.style.display = 'none';
            nodes.btnSessionMenuUnread.style.display = 'flex';
        }

        nodes.sessionMenuOverlay.style.display = 'flex';
    }

    // ----------------------------------------------------
    // 方法：渲染聊天列表
    // ----------------------------------------------------

    updateTotalUnreadBadge() {
        let total = 0;
        this.ctx.initialMessages.forEach(m => {
            if (m.isUnread && m.unreadCount > 0) {
                total += m.unreadCount;
            }
        });
        const chars = window.ChatStorage.loadCharacters();
        chars.forEach(c => {
            if (c.isUnread && c.unreadCount > 0) {
                total += c.unreadCount;
            }
        });
        const badge = this.ctx.container.querySelector('.chat-nav-pill[data-target="chat-view-messages"] .chat-nav-badge');
        if (badge) {
            if (total > 0) {
                badge.textContent = total > 99 ? '99+' : total;
                badge.style.display = '';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    getLocalTimeByTimezone(timezone) {
        try {
            return new Date().toLocaleTimeString('zh-CN', { timeZone: timezone, hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return '';
        }
    }

    async renderChatList() {
        const { nodes } = this.ctx;
        if (!nodes.chatListContainer) return;
        if (nodes.chatListContainer.dataset.rendering === 'true') return;
        nodes.chatListContainer.dataset.rendering = 'true';
        
        // 我们也在这里同时更新联系人列表
        this.renderContactsList();
        
        const fragment = document.createDocumentFragment();
        const savedChars = window.ChatStorage.loadCharacters();
        let displayList = [...this.ctx.initialMessages];
        
        for (const char of savedChars) {
            let avatarUrl = null;
            try {
                if (window.ImageStorageManager) {
                    avatarUrl = await window.ImageStorageManager.loadFromIndexedDB(`character-avatar-${char.id}`);
                }
            } catch(e) {}
            
            const charName = char.nickname || char.realname || '未命名角色';
            let finalTimezone = char.timezone;
            if (!finalTimezone) {
                finalTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            }
            let localTime = this.getLocalTimeByTimezone(finalTimezone);
            if (!localTime) {
                 localTime = this.getLocalTimeByTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
            }
            
            const history = window.ChatStorage.getChatHistory(char.id);
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
            
            const quoteRegex = /\n?\[\[QUOTE:([^|]+)\|([^\]]+)\]\]/g;
            if (quoteRegex.test(lastMessageContent)) {
                lastMessageContent = lastMessageContent.replace(quoteRegex, '').trim();
            }
            
            lastMessageContent = lastMessageContent.replace(/\[\[EMOJI:[^|\]]+\|([^\]]+)\]\]/g, '[$1]').replace(/\[\[EMOJI:[^\]]+\]\]/g, '[表情]');

            const transferRegex = /\[\[TRANSFER:([^|]+)\|(.*?)\]\]/g;
            if (transferRegex.test(lastMessageContent)) {
                lastMessageContent = '[转账]';
            }
            
            const voiceRegex = /\[\[VOICE:(.*?)\]\]/g;
            if (voiceRegex.test(lastMessageContent)) {
                lastMessageContent = '[语音]';
            }
            
            const imageRegex = /\[\[IMAGE:(.*?)\]\]/g;
            if (imageRegex.test(lastMessageContent)) {
                lastMessageContent = '[图片]';
            }
            
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
                isUnread: char.isUnread || false,
                unreadCount: char.unreadCount || 0,
                isOnline: true,
                color: '#f0f0f0',
                textColor: '#333',
                avatarUrl: avatarUrl,
                isCharacter: true,
                rawCharData: char,
                isPinned: char.isPinned,
                pinTime: char.pinTime || 0
            });
        }

        const searchInput = this.ctx.container.querySelector('.chat-search-input');
        if (searchInput) {
            const keyword = searchInput.value.trim().toLowerCase();
            if (keyword) {
                displayList = displayList.filter(msg => 
                    (msg.name && msg.name.toLowerCase().includes(keyword)) || 
                    (msg.message && msg.message.toLowerCase().includes(keyword))
                );
            }
        }
        
        if (this.ctx.currentListGroupId !== 'all') {
            displayList = displayList.filter(msg => {
                return msg.rawCharData && msg.rawCharData.listGroupId === this.ctx.currentListGroupId;
            });
        }
        
        displayList.sort((a, b) => {
            const aPinned = a.isPinned || (a.rawCharData && a.rawCharData.isPinned);
            const bPinned = b.isPinned || (b.rawCharData && b.rawCharData.isPinned);
            
            if (aPinned && !bPinned) return -1;
            if (!aPinned && bPinned) return 1;
            
            if (aPinned && bPinned) {
                const aTime = a.pinTime || (a.rawCharData && a.rawCharData.pinTime) || 0;
                const bTime = b.pinTime || (b.rawCharData && b.rawCharData.pinTime) || 0;
                return bTime - aTime;
            }
            return 0;
        });

        displayList.forEach(msg => {
            const wrapper = document.createElement('div');
            wrapper.className = 'chat-list-item-wrapper';
            wrapper.setAttribute('data-id', msg.id);
            
            const isPinned = msg.isPinned || (msg.rawCharData && msg.rawCharData.isPinned);
            if (isPinned) {
                wrapper.classList.add('pinned');
            }
            
            const item = document.createElement('div');
            item.className = 'chat-list-item';
            
            const checkboxHtml = `<div class="session-checkbox"></div>`;
            const onlineHtml = msg.isOnline ? '<div class="chat-item-online"></div>' : '';
            const unreadTimeClass = msg.isUnread ? 'unread' : 'read';
            const unreadMsgClass = msg.isUnread ? 'unread' : 'read';
            const badgeHtml = (msg.isUnread && msg.unreadCount > 0) ? `<div class="chat-item-badge">${msg.unreadCount}</div>` : '';

            let avatarInnerHtml = `${msg.initials}${onlineHtml}`;
            if (msg.avatarUrl) {
                avatarInnerHtml = `<img src="${msg.avatarUrl}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">${onlineHtml}`;
            }

            item.innerHTML = `
                ${checkboxHtml}
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
            
            wrapper.appendChild(item);
            fragment.appendChild(wrapper);
            
            item.addEventListener('click', (e) => {
                if (this.ctx.isSessionSelectMode) {
                    if (this.ctx.selectedSessionIds.has(String(msg.id))) {
                        this.ctx.selectedSessionIds.delete(String(msg.id));
                    } else {
                        this.ctx.selectedSessionIds.add(String(msg.id));
                    }
                    this.updateSessionSelectBarUI();
                    return;
                }

                if (msg.isUnread) {
                    msg.isUnread = false;
                    msg.unreadCount = 0;
                    
                    if (msg.isCharacter) {
                        let chars = window.ChatStorage.loadCharacters();
                        let charIdx = chars.findIndex(c => c.id === msg.id);
                        if (charIdx !== -1) {
                            chars[charIdx].isUnread = false;
                            chars[charIdx].unreadCount = 0;
                            window.ChatStorage.saveCharacters(chars);
                        }
                    }
                    
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
                    
                    this.updateTotalUnreadBadge();
                }
                
                // 触发打开对话的事件（在聊天交互模块处理）
                this.ctx.emit('openConversation', msg);
            });
            
            let pressTimer = null;
            let isDragging = false;
            
            const clearPressTimer = () => {
                if (pressTimer) {
                    clearTimeout(pressTimer);
                    pressTimer = null;
                }
            };

            item.addEventListener('touchstart', (e) => {
                isDragging = false;
                clearPressTimer();
                pressTimer = setTimeout(() => {
                    if (!isDragging) {
                        if (navigator.vibrate) navigator.vibrate(50);
                        this.showSessionMenu(e, msg, msg.id);
                    }
                }, 500);
            }, { passive: true });

            item.addEventListener('touchmove', () => {
                isDragging = true;
                clearPressTimer();
            }, { passive: true });

            item.addEventListener('touchend', () => { clearPressTimer(); });
            item.addEventListener('touchcancel', () => { clearPressTimer(); });

            item.addEventListener('contextmenu', (e) => {
                this.showSessionMenu(e, msg, msg.id);
            });
        });
        
        nodes.chatListContainer.innerHTML = '';
        nodes.chatListContainer.appendChild(fragment);
        
        if (this.ctx.isSessionSelectMode) {
            this.updateSessionSelectBarUI();
        }

        this.updateTotalUnreadBadge();
        nodes.chatListContainer.dataset.rendering = 'false';
    }

    // ----------------------------------------------------
    // 方法：渲染联系人列表 (通讯录)
    // ----------------------------------------------------
    async renderContactsList() {
        const contactsContainer = this.ctx.container.querySelector('#chat-contacts-container');
        if (!contactsContainer) return;

        const groups = window.ChatStorage.loadCharListGroups();
        const allGroups = [{ id: 'ungrouped', name: '未分组' }, ...groups];
        const savedChars = window.ChatStorage.loadCharacters();
        
        // 根据分组整理角色数据
        const groupedChars = {};
        allGroups.forEach(g => {
            groupedChars[g.id] = [];
        });
        
        savedChars.forEach(char => {
            const gid = char.listGroupId || 'ungrouped';
            if (groupedChars[gid]) {
                groupedChars[gid].push(char);
            } else {
                // 如果角色所在的分组被删了，放回未分组
                groupedChars['ungrouped'].push(char);
            }
        });

        const fragment = document.createDocumentFragment();

        for (const g of allGroups) {
            const charsInGroup = groupedChars[g.id];
            if (g.id === 'ungrouped' && charsInGroup.length === 0) continue; // 未分组为空则不显示
            
            // 分组标题
            const groupHeader = document.createElement('div');
            groupHeader.className = 'contacts-group-header';
            groupHeader.style.cssText = 'padding: 8px 16px; background: rgba(0,0,0,0.02); color: var(--text-secondary); font-size: 12px; font-weight: 600; display: flex; align-items: center; justify-content: space-between; cursor: pointer; border-bottom: 1px solid rgba(0,0,0,0.05); border-top: 1px solid rgba(0,0,0,0.05); margin-top: 8px;';
            groupHeader.innerHTML = `
                <span>${g.name}</span>
                <span style="font-weight: normal; font-size: 11px;">${charsInGroup.length}</span>
            `;

            // 分组容器
            const groupContent = document.createElement('div');
            groupContent.className = 'contacts-group-content';
            // 默认展开
            groupContent.style.display = 'block';

            // 点击折叠/展开
            groupHeader.addEventListener('click', () => {
                if (groupContent.style.display === 'none') {
                    groupContent.style.display = 'block';
                } else {
                    groupContent.style.display = 'none';
                }
            });

            fragment.appendChild(groupHeader);
            fragment.appendChild(groupContent);

            // 渲染该分组下的联系人
            for (const char of charsInGroup) {
                let avatarUrl = null;
                try {
                    if (window.ImageStorageManager) {
                        avatarUrl = await window.ImageStorageManager.loadFromIndexedDB(`character-avatar-${char.id}`);
                    }
                } catch(e) {}
                
                const charName = char.nickname || char.realname || '未命名角色';
                const avatarInnerHtml = avatarUrl 
                    ? `<img src="${avatarUrl}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`
                    : charName.charAt(0);

                const item = document.createElement('div');
                item.style.cssText = 'display: flex; align-items: center; padding: 12px 16px; border-bottom: 1px solid rgba(0,0,0,0.05); cursor: pointer; transition: background 0.2s;';
                item.innerHTML = `
                    <div style="width: 40px; height: 40px; border-radius: 50%; background: #f0f0f0; color: #333; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 500; margin-right: 12px; flex-shrink: 0; overflow: hidden;">
                        ${avatarInnerHtml}
                    </div>
                    <div style="flex: 1; overflow: hidden;">
                        <div style="font-size: 15px; font-weight: 500; color: var(--text-color); margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${charName}</div>
                        ${char.persona ? `<div style="font-size: 12px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${char.persona.split('\\n')[0]}</div>` : ''}
                    </div>
                `;

                item.addEventListener('mouseenter', () => item.style.backgroundColor = 'rgba(0,0,0,0.02)');
                item.addEventListener('mouseleave', () => item.style.backgroundColor = 'transparent');
                
                // 点击联系人直接打开对话
                item.addEventListener('click', () => {
                    const fakeMsg = { id: char.id, name: charName, rawCharData: char, isCharacter: true, isOnline: true };
                    this.ctx.emit('openConversation', fakeMsg);
                });

                groupContent.appendChild(item);
            }
        }

        contactsContainer.innerHTML = '';
        contactsContainer.appendChild(fragment);
    }
};
