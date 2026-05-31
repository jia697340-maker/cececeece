window.ChatPersonaModule = {
    init: function(ctx) {
        this.ctx = ctx;
        this.bindEvents();
        
        // 绑定弹窗被关闭后（由 app.js 触发），顺便重置管理模式等状态
        ctx.on('popupsClosed', () => {
            ctx.isManageMode = false;
            ctx.selectedPersonaIds.clear();
            this.updateManageFooter();
            this.renderPersonaList();
        });

        // 暴露方法给外部调用（如主入口调用初始化）
        ctx.updateProfileDisplay = this.updateProfileDisplay.bind(this);
        
        // 初始渲染
        setTimeout(() => {
            this.updateProfileDisplay();
        }, 100);
    },

    bindEvents: function() {
        const ctx = this.ctx;
        const {
            btnManagePersonas, btnSelectAll, btnDeleteSelected, btnPersonaLibrary,
            btnCreatePersona, btnUploadAvatar, btnSavePersona,
            btnEditCurrent, btnSetActive,
            listContainer
        } = ctx.nodes;

        // 1. 人设库列表管理
        if (btnManagePersonas) {
            btnManagePersonas.addEventListener('click', () => {
                ctx.isManageMode = !ctx.isManageMode;
                ctx.selectedPersonaIds.clear();
                this.updateManageFooter();
                this.renderPersonaList();
            });
        }

        if (btnSelectAll) {
            btnSelectAll.addEventListener('click', () => {
                const personas = window.ChatStorage.loadPersonas();
                if (ctx.selectedPersonaIds.size === personas.length) {
                    ctx.selectedPersonaIds.clear();
                } else {
                    personas.forEach(p => ctx.selectedPersonaIds.add(p.id));
                }
                this.updateManageFooter();
                this.renderPersonaList();
            });
        }

        if (btnDeleteSelected) {
            btnDeleteSelected.addEventListener('click', async () => {
                if (ctx.selectedPersonaIds.size === 0) return;
                window.ChatConversationModule.showChatConfirm('删除人设', `确定要删除选中的 ${ctx.selectedPersonaIds.size} 个人设吗？`, async () => {
                    let personas = window.ChatStorage.loadPersonas();
                    personas = personas.filter(p => !ctx.selectedPersonaIds.has(p.id));
                    window.ChatStorage.savePersonas(personas);
                    
                    let activeId = window.ChatStorage.getActivePersonaId();
                    for (let id of ctx.selectedPersonaIds) {
                        if (window.ImageStorageManager) {
                            await window.ImageStorageManager.deleteFromIndexedDB(`persona-avatar-${id}`);
                        }
                        if (id === activeId) {
                            window.ChatStorage.setActivePersonaId(null);
                        }
                    }
                    
                    ctx.selectedPersonaIds.clear();
                    ctx.isManageMode = false;
                    this.updateManageFooter();
                    this.renderPersonaList();
                    this.updateProfileDisplay();
                });
            });
        }

        if (btnPersonaLibrary) {
            btnPersonaLibrary.addEventListener('click', () => {
                ctx.nodes.popupLibrary.classList.add('active');
                ctx.isManageMode = false;
                ctx.selectedPersonaIds.clear();
                this.updateManageFooter();
                this.renderPersonaList();
            });
        }

        // 2. 新建/编辑人设
        if (btnCreatePersona) {
            btnCreatePersona.addEventListener('click', () => {
                this.openPersonaEdit();
            });
        }

        if (btnUploadAvatar) {
            btnUploadAvatar.addEventListener('click', () => {
                if (typeof showImageModal === 'function') {
                    showImageModal('persona-avatar-temp', (result) => {
                        if (result && result.type === 'reset') {
                            ctx.tempAvatarBase64 = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                            ctx.nodes.avatarPreview.src = ctx.tempAvatarBase64;
                        } else if (result && result.url) {
                            ctx.tempAvatarBase64 = result.url;
                            ctx.nodes.avatarPreview.src = ctx.tempAvatarBase64;
                        }
                    });
                }
            });
        }

        if (btnSavePersona) {
            btnSavePersona.addEventListener('click', async () => {
                const realname = ctx.nodes.inputRealname.value.trim();
                const nickname = ctx.nodes.inputNickname.value.trim();
                const bio = ctx.nodes.inputBio.value.trim();

                if (!nickname && !realname) {
                    if (window._currentChatOSAlert) window._currentChatOSAlert('提示', '请至少填写真名或昵称！');
                    return;
                }

                let personas = window.ChatStorage.loadPersonas();
                let personaId = ctx.editingPersonaId;

                if (personaId) {
                    const index = personas.findIndex(p => p.id === personaId);
                    if (index !== -1) {
                        personas[index].realname = realname;
                        personas[index].nickname = nickname;
                        personas[index].bio = bio;
                    }
                } else {
                    personaId = 'persona_' + Date.now();
                    personas.unshift({
                        id: personaId,
                        realname,
                        nickname,
                        bio
                    });
                }

                window.ChatStorage.savePersonas(personas);

                if (ctx.tempAvatarBase64 && window.ImageStorageManager) {
                    await window.ImageStorageManager.saveToIndexedDB(`persona-avatar-${personaId}`, ctx.tempAvatarBase64);
                }

                if (!window.ChatStorage.getActivePersonaId() || personas.length === 1) {
                    window.ChatStorage.setActivePersonaId(personaId);
                }

                this.updateProfileDisplay();
                ctx.emit('closeAllPopups');
            });
        }

        // 3. 查看详情逻辑
        if (btnEditCurrent) {
            btnEditCurrent.addEventListener('click', () => {
                if (ctx.viewingPersona) {
                    this.openPersonaEdit(ctx.viewingPersona, ctx.viewingAvatarUrl);
                }
            });
        }

        if (btnSetActive) {
            btnSetActive.addEventListener('click', () => {
                if (ctx.viewingPersona) {
                    window.ChatStorage.setActivePersonaId(ctx.viewingPersona.id);
                    this.updateProfileDisplay();
                    ctx.emit('closeAllPopups');
                }
            });
        }
    },

    updateManageFooter: function() {
        const ctx = this.ctx;
        const personas = window.ChatStorage.loadPersonas();
        const { manageFooter, btnManagePersonas, btnDeleteSelected, btnSelectAll } = ctx.nodes;

        if (ctx.isManageMode) {
            manageFooter.style.display = 'flex';
            btnManagePersonas.textContent = '取消';
            btnDeleteSelected.textContent = `删除所选 (${ctx.selectedPersonaIds.size})`;
            btnDeleteSelected.disabled = ctx.selectedPersonaIds.size === 0;

            if (personas.length > 0 && ctx.selectedPersonaIds.size === personas.length) {
                btnSelectAll.textContent = '取消全选';
            } else {
                btnSelectAll.textContent = '全选';
            }
        } else {
            manageFooter.style.display = 'none';
            btnManagePersonas.textContent = '管理';
        }
    },

    renderPersonaList: async function() {
        const ctx = this.ctx;
        const personas = window.ChatStorage.loadPersonas();
        const activeId = window.ChatStorage.getActivePersonaId();
        const { listContainer } = ctx.nodes;

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
            if (ctx.isManageMode) {
                const isChecked = ctx.selectedPersonaIds.has(persona.id);
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
                if (ctx.isManageMode) {
                    if (ctx.selectedPersonaIds.has(persona.id)) {
                        ctx.selectedPersonaIds.delete(persona.id);
                    } else {
                        ctx.selectedPersonaIds.add(persona.id);
                    }
                    this.renderPersonaList();
                    this.updateManageFooter();
                } else {
                    this.openPersonaView(persona, avatarUrl);
                }
            });

            listContainer.appendChild(item);
        }
    },

    openPersonaEdit: function(persona = null, existingAvatarUrl = null) {
        const ctx = this.ctx;
        const { editTitle, inputRealname, inputNickname, inputBio, avatarPreview, popupLibrary, popupView, popupEdit } = ctx.nodes;

        if (persona) {
            ctx.editingPersonaId = persona.id;
            editTitle.textContent = '编辑人设';
            inputRealname.value = persona.realname || '';
            inputNickname.value = persona.nickname || '';
            inputBio.value = persona.bio || '';
            avatarPreview.src = existingAvatarUrl || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        } else {
            ctx.editingPersonaId = null;
            editTitle.textContent = '新建人设';
            inputRealname.value = '';
            inputNickname.value = '';
            inputBio.value = '';
            avatarPreview.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        }
        ctx.tempAvatarBase64 = null;
        
        [popupLibrary, popupView].forEach(p => p.classList.remove('active'));
        popupEdit.classList.add('active');
    },

    openPersonaView: function(persona, avatarUrl) {
        const ctx = this.ctx;
        const { viewAvatar, viewNickname, viewRealname, viewBio, btnSetActive, popupLibrary, popupView } = ctx.nodes;

        ctx.viewingPersona = persona;
        ctx.viewingAvatarUrl = avatarUrl;
        
        viewAvatar.src = avatarUrl;
        viewNickname.textContent = persona.nickname || persona.realname || '未命名';
        viewRealname.textContent = persona.realname ? `真名: ${persona.realname}` : '';
        viewBio.textContent = persona.bio || '该用户很懒，还没有填写简介。';
        
        const activeId = window.ChatStorage.getActivePersonaId();
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
    },

    updateProfileDisplay: async function() {
        const ctx = this.ctx;
        const personas = window.ChatStorage.loadPersonas();
        const activeId = window.ChatStorage.getActivePersonaId();
        const activePersona = personas.find(p => p.id === activeId);
        
        const { profileName, profileEmail, profileAvatar } = ctx.nodes;

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
    }
};
