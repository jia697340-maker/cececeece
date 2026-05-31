window.ChatCharacterModule = {
    init: function(ctx) {
        this.ctx = ctx;
        
        // 我们需要单独缓存一些这部分拆分出的专属节点，避免 context.js 太过臃肿
        this.initLocalNodes();
        this.bindEvents();
        if (typeof this.bindEvents2 === 'function') {
            this.bindEvents2();
        }
    },

    initLocalNodes: function() {
        const c = this.ctx.container;
        const $ = (sel) => c.querySelector(sel);
        
        this.nodes = {
            charEditTitle: $('#character-edit-title'),
            inputCharRealname: $('#character-edit-realname'),
            inputCharNickname: $('#character-edit-nickname'),
            inputCharTimezoneVal: $('#character-edit-timezone'),
            triggerCharTimezone: $('#character-edit-timezone-trigger'),
            textCharTimezone: $('#character-edit-timezone-text'),
            inputCharPersona: $('#character-edit-persona'),
            charAvatarPreview: $('#character-edit-avatar-preview'),
            btnUploadCharAvatar: $('#btn-upload-character-avatar'),
            btnSaveCharacter: $('#btn-save-character'),
            btnTimezoneHelp: $('#btn-timezone-help'),
            toggleAiTimezone: $('#ai-timezone-toggle'),
            importGreetingContainer: $('#import-greeting-container'),
            toggleImportGreeting: $('#import-greeting-toggle'),

            btnMenuCreateCharacter: $('#btn-menu-create-character'),
            btnCreateCharManual: $('#btn-create-char-manual'),
            btnCreateCharDocument: $('#btn-create-char-document'),
            inputCharDocumentUpload: $('#char-document-upload'),
            btnImportCharacter: $('#btn-import-character'),
            inputCharImportUpload: $('#char-import-upload'),
            
            // API History
            tabApiHistory: $('.chat-popup-tab[data-tab="cs-tab-api-history"]'),
            tabApiHistoryContent: $('#cs-tab-api-history'),
            toggleApiHistory: $('#cs-api-history-toggle'),
            inputApiHistoryLimit: $('#cs-api-history-limit'),
            btnApiHistorySelectAll: $('#btn-api-history-select-all'),
            btnApiHistoryExportSelected: $('#btn-api-history-export-selected'),
            btnApiHistoryDeleteSelected: $('#btn-api-history-delete-selected'),
            btnApiHistoryClearAll: $('#btn-api-history-clear-all'),
            apiHistoryList: $('#cs-api-history-list')
        };
    },

    getTimezoneNameByCode: function(code) {
        if (!code) return '跟随本地时间 (默认)';
        const found = window.ChatConstants.ALL_TIMEZONES.find(z => z.code === code);
        return found ? found.name : code;
    },

    bindEvents: function() {
        const { popupCreate, popupCharacterType, convMoreBtn } = this.ctx.nodes;
        const { 
            btnMenuCreateCharacter, btnCreateCharManual, btnCreateCharDocument, inputCharDocumentUpload,
            btnImportCharacter, inputCharImportUpload, toggleAiTimezone, inputCharPersona,
            btnTimezoneHelp, btnUploadCharAvatar, btnSaveCharacter
        } = this.nodes;

        // --- 角色创建入口与类型选择 ---
        if (btnMenuCreateCharacter) {
            btnMenuCreateCharacter.addEventListener('click', () => {
                popupCreate.classList.remove('active');
                if (popupCharacterType) {
                    popupCharacterType.classList.add('active');
                }
            });
        }

        if (btnCreateCharManual) {
            btnCreateCharManual.addEventListener('click', () => {
                if (popupCharacterType) popupCharacterType.classList.remove('active');
                this.openCharacterEdit();
            });
        }

        // --- 角色设置弹窗 Tab 逻辑 ---
        const csTabs = this.ctx.container.querySelectorAll('.chat-popup-tab');
        const csTabContents = this.ctx.container.querySelectorAll('.chat-popup-tab-content');
        
        csTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                csTabs.forEach(t => t.classList.remove('active'));
                csTabContents.forEach(c => c.classList.remove('active'));
                
                tab.classList.add('active');
                const targetId = tab.getAttribute('data-tab');
                const targetContent = this.ctx.container.querySelector('#' + targetId);
                if (targetContent) targetContent.classList.add('active');
                
                // 记录状态
                if (localStorage.getItem('nrj-remember-cs-tab') === 'true') {
                    localStorage.setItem('nrj-saved-cs-tab', targetId);
                }
            });
        });

        // --- 智能时区提取逻辑 ---
        if (toggleAiTimezone) {
            toggleAiTimezone.checked = false;
            toggleAiTimezone.addEventListener('change', (e) => {
                const checked = e.target.checked;
                if (checked) {
                    const text = inputCharPersona.value.trim();
                    if (!text) {
                        if (window._currentChatOSAlert) window._currentChatOSAlert('提示', '请先在上方填写角色人设，AI才能进行判断！');
                        e.target.checked = false;
                    } else {
                        this.extractTimezoneByAI(text);
                    }
                }
            });
        }

        if (inputCharPersona) {
            inputCharPersona.addEventListener('blur', () => {
                if (toggleAiTimezone && toggleAiTimezone.checked) {
                    const text = inputCharPersona.value.trim();
                    if (text) {
                        this.extractTimezoneByAI(text);
                    } else {
                        toggleAiTimezone.checked = false;
                    }
                }
            });
        }

        if (btnTimezoneHelp) {
            btnTimezoneHelp.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.ctx.nodes.popupTimezoneHelp) {
                    this.ctx.nodes.popupTimezoneHelp.classList.add('active');
                }
            });
        }
        
        // 修复：绑定时区帮助弹窗的关闭按钮
        const btnCloseHelpList = this.ctx.container.querySelectorAll('.btn-close-help');
        btnCloseHelpList.forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.ctx.nodes.popupTimezoneHelp) {
                    this.ctx.nodes.popupTimezoneHelp.classList.remove('active');
                }
            });
        });

        // --- 文档导入角色逻辑 ---
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

                    if (this.ctx.nodes.chatAlertPopup) this.ctx.nodes.chatAlertPopup.classList.remove('active');

                    this.openCharacterEdit();
                    if (inputCharPersona) {
                        inputCharPersona.value = textContent;
                        if (toggleAiTimezone && toggleAiTimezone.checked) {
                            this.extractTimezoneByAI(textContent);
                        }
                    }
                    
                    if (this.nodes.inputCharNickname) {
                        this.nodes.inputCharNickname.value = file.name.substring(0, file.name.lastIndexOf('.'));
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

        // --- 角色卡导入逻辑 (JSON/PNG) ---
        if (btnImportCharacter && inputCharImportUpload) {
            btnImportCharacter.addEventListener('click', () => {
                popupCreate.classList.remove('active');
                inputCharImportUpload.click();
            });

            inputCharImportUpload.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                // 处理 ZIP 批量导入
                if (file.name.toLowerCase().endsWith('.zip') && window.zipManager) {
                    try {
                        const files = await window.zipManager.processZipFile(file);
                        if (files && files.length > 0) {
                            for (const f of files) {
                                // 复用原有的导入逻辑（模拟触发并传递单个文件）
                                await this.processCharacterImport(f);
                            }
                            if (window._currentChatOSAlert) window._currentChatOSAlert('导入完成', `成功导入 ${files.length} 个角色卡！`);
                        }
                    } catch (err) {
                        console.log('ZIP 处理被取消或失败:', err);
                    } finally {
                        e.target.value = '';
                    }
                    return;
                }

                await this.processCharacterImport(file);
                e.target.value = '';
            });
        }

        // --- 提取的角色卡单文件导入逻辑 ---
    },

    processCharacterImport: async function(file) {
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

            let charData = parsedData.data || parsedData;

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

            if (this.ctx.nodes.chatAlertPopup) this.ctx.nodes.chatAlertPopup.classList.remove('active');

            this.openCharacterEdit();

            if (extension === 'png') {
                this.ctx.tempCharacterAvatarBase64 = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = ev => resolve(ev.target.result);
                    reader.readAsDataURL(file);
                });
                if (this.nodes.charAvatarPreview) {
                    this.nodes.charAvatarPreview.src = this.ctx.tempCharacterAvatarBase64;
                }
            }

            if (this.nodes.inputCharNickname) this.nodes.inputCharNickname.value = name;
            if (this.nodes.inputCharRealname) this.nodes.inputCharRealname.value = name;
            
            const inputCharPersona = this.nodes.inputCharPersona;
            const toggleAiTimezone = this.nodes.toggleAiTimezone;

            if (inputCharPersona) {
                inputCharPersona.value = fullPersona.trim();
                if (toggleAiTimezone && toggleAiTimezone.checked) {
                    this.extractTimezoneByAI(fullPersona);
                }
            }
            
            if (greetings.length > 0) {
                if (inputCharPersona) {
                    inputCharPersona.dataset.greetings = JSON.stringify(greetings);
                }
                if (this.nodes.importGreetingContainer) {
                    this.nodes.importGreetingContainer.style.display = 'flex';
                }
                if (this.nodes.toggleImportGreeting) {
                    this.nodes.toggleImportGreeting.checked = true;
                }
            } else {
                if (inputCharPersona) {
                    delete inputCharPersona.dataset.greetings;
                }
            }
            
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
        }
    },

    bindEvents2: function() {
        const { btnUploadCharAvatar, btnSaveCharacter } = this.nodes;
        const { convMoreBtn } = this.ctx.nodes;
        if (btnUploadCharAvatar) {
            btnUploadCharAvatar.addEventListener('click', () => {
                if (typeof showImageModal === 'function') {
                    showImageModal('character-avatar-temp', (result) => {
                        if (result && result.type === 'reset') {
                            this.ctx.tempCharacterAvatarBase64 = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                            this.nodes.charAvatarPreview.src = this.ctx.tempCharacterAvatarBase64;
                        } else if (result && result.url) {
                            this.ctx.tempCharacterAvatarBase64 = result.url;
                            this.nodes.charAvatarPreview.src = this.ctx.tempCharacterAvatarBase64;
                        }
                    });
                }
            });
        }

        if (btnSaveCharacter) {
            btnSaveCharacter.addEventListener('click', async () => {
                const realname = this.nodes.inputCharRealname.value.trim();
                const nickname = this.nodes.inputCharNickname.value.trim();
                const timezone = this.nodes.inputCharTimezoneVal.value;
                const persona = this.nodes.inputCharPersona.value.trim();

                if (!nickname && !realname) {
                    if (window._currentChatOSAlert) window._currentChatOSAlert('提示', '请至少填写角色真名或备注！');
                    return;
                }
                
                let greetings = [];
                if (this.nodes.inputCharPersona && this.nodes.inputCharPersona.dataset.greetings) {
                    if (this.nodes.toggleImportGreeting && this.nodes.toggleImportGreeting.checked) {
                        try {
                            greetings = JSON.parse(this.nodes.inputCharPersona.dataset.greetings);
                        } catch(e) {}
                    }
                    delete this.nodes.inputCharPersona.dataset.greetings;
                }

                let chars = window.ChatStorage.loadCharacters();
                let charId = this.ctx.editingCharacterId;

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

                    if (this.nodes.inputCharPersona && this.nodes.inputCharPersona.dataset.extractedWorldbook) {
                        try {
                            const newWorldbook = JSON.parse(this.nodes.inputCharPersona.dataset.extractedWorldbook);
                            let worldbooks = JSON.parse(localStorage.getItem('nrj-worldbooks') || '[]');
                            worldbooks.unshift(newWorldbook);
                            localStorage.setItem('nrj-worldbooks', JSON.stringify(worldbooks));
                            
                            let charConfig = JSON.parse(localStorage.getItem(`nrj-chat-config-${charId}`) || '{}');
                            charConfig.worldbookId = newWorldbook.id;
                            localStorage.setItem(`nrj-chat-config-${charId}`, JSON.stringify(charConfig));
                        } catch(e) {
                            console.error('保存导入的世界书失败', e);
                        }
                        delete this.nodes.inputCharPersona.dataset.extractedWorldbook;
                    }
                }

                window.ChatStorage.saveCharacters(chars);

                if (this.ctx.tempCharacterAvatarBase64 && window.ImageStorageManager) {
                    await window.ImageStorageManager.saveToIndexedDB(`character-avatar-${charId}`, this.ctx.tempCharacterAvatarBase64);
                }

                this.ctx.emit('closeAllPopups');
                // 重新渲染聊天列表以包含新角色
                if (this.ctx.sessionModule) {
                    this.ctx.sessionModule.renderChatList();
                }
            });
        }
        

        // 绑定更多设置按钮
        if (convMoreBtn) {
            convMoreBtn.addEventListener('click', () => {
                this.openCharacterSettings();
            });
        }
    },

    openCharacterEdit: function(char = null, existingAvatarUrl = null) {
        const { popupCreate, popupCharacterEdit } = this.ctx.nodes;
        const { 
            charEditTitle, inputCharRealname, inputCharNickname, inputCharTimezoneVal, 
            textCharTimezone, inputCharPersona, charAvatarPreview, triggerCharTimezone,
            toggleAiTimezone, importGreetingContainer, toggleImportGreeting
        } = this.nodes;

        if (char) {
            this.ctx.editingCharacterId = char.id;
            charEditTitle.textContent = '编辑角色';
            inputCharRealname.value = char.realname || '';
            inputCharNickname.value = char.nickname || '';
            
            inputCharTimezoneVal.value = char.timezone || '';
            if (char.timezone) {
                textCharTimezone.textContent = this.getTimezoneNameByCode(char.timezone);
                textCharTimezone.style.color = 'var(--text-color)';
            } else {
                textCharTimezone.textContent = '跟随本地时间 (默认)';
                textCharTimezone.style.color = 'var(--text-secondary)';
            }

            inputCharPersona.value = char.persona || '';
            charAvatarPreview.src = existingAvatarUrl || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        } else {
            this.ctx.editingCharacterId = null;
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
                this.showTimezonePopup((selectedZone) => {
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
        this.ctx.tempCharacterAvatarBase64 = null;
        if (toggleAiTimezone) {
            toggleAiTimezone.checked = false;
        }
        if (importGreetingContainer) {
            importGreetingContainer.style.display = 'none';
        }
        if (toggleImportGreeting) {
            toggleImportGreeting.checked = true;
        }
        
        popupCreate.classList.remove('active');
        popupCharacterEdit.classList.add('active');
    },

    extractTimezoneByAI: async function(personaText) {
        if (!personaText) return;
        const { btnSaveCharacter, inputCharTimezoneVal, textCharTimezone, toggleAiTimezone } = this.nodes;

        try {
            btnSaveCharacter.textContent = '判断时区中...';
            btnSaveCharacter.disabled = true;
            btnSaveCharacter.style.opacity = '0.5';

            let tzResult = await window.ChatAPI.extractTimezone(personaText);

            let plainResult = tzResult.replace(/['"]/g, '');
            plainResult = plainResult.replace(/<think>[\s\S]*?<\/think>/g, '');

            const tzMatch = plainResult.match(/[A-Z][a-z_]+\/(?:[A-Z][a-zA-Z_]+\/)*[A-Z][a-zA-Z_]+/);

            if (tzMatch) {
                inputCharTimezoneVal.value = tzMatch[0];
                textCharTimezone.textContent = this.getTimezoneNameByCode(tzMatch[0]);
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
    },

    showTimezonePopup: function(onSelect) {
        const { popupTimezone, timezoneSearch, timezoneListContainer, btnCloseTimezone } = this.ctx.nodes;
        this.ctx.timezoneSelectCallback = onSelect;
        
        if (btnCloseTimezone) {
            btnCloseTimezone.onclick = () => {
                if (popupTimezone) popupTimezone.classList.remove('active');
            };
        }
        
        if (timezoneSearch) timezoneSearch.value = '';
        this.renderTimezoneList();
        
        if (popupTimezone) {
            popupTimezone.classList.add('active');
            if (this.ctx.timezoneClockInterval) clearInterval(this.ctx.timezoneClockInterval);
            this.ctx.timezoneClockInterval = setInterval(() => this.updateTimezoneClocks(), 1000);
        }
    },

    renderTimezoneList: function(filterText = '') {
        const { timezoneListContainer, popupTimezone } = this.ctx.nodes;
        if (!timezoneListContainer) return;
        timezoneListContainer.innerHTML = '';
        
        const keyword = filterText.toLowerCase().trim();
        let filteredZones = window.ChatConstants.ALL_TIMEZONES;
        if (keyword) {
            filteredZones = window.ChatConstants.ALL_TIMEZONES.filter(z => 
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
            
            const timeStr = this.formatTimeForZone(z.code);

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
                if (this.ctx.timezoneSelectCallback) {
                    this.ctx.timezoneSelectCallback(z);
                }
                if (popupTimezone) popupTimezone.classList.remove('active');
            });

            timezoneListContainer.appendChild(item);
        });
    },

    updateTimezoneClocks: function() {
        const { popupTimezone, timezoneListContainer } = this.ctx.nodes;
        if (!popupTimezone || !popupTimezone.classList.contains('active')) return;
        const clocks = timezoneListContainer.querySelectorAll('.tz-time-preview');
        clocks.forEach(clock => {
            const tz = clock.getAttribute('data-tz');
            clock.textContent = this.formatTimeForZone(tz);
        });
    },

    formatTimeForZone: function(code) {
        if (!code) return new Date().toLocaleString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit' });
        try {
            return new Date().toLocaleString('zh-CN', { timeZone: code, hour12: false, hour: '2-digit', minute: '2-digit' });
        } catch(e) {
            return '--:--';
        }
    },

    openCharacterSettings: async function() {
        const container = this.ctx.container;
        const currentPersona = this.ctx.currentPersona;
        const { popupCharacterSettings, convView } = this.ctx.nodes;
        if (!currentPersona) return;
        
        const renderChatList = () => {
            if (this.ctx.sessionModule) this.ctx.sessionModule.renderChatList();
        };
        const openConversation = (persona) => {
            if (window.ChatConversationModule && typeof window.ChatConversationModule.openConversation === 'function') {
                window.ChatConversationModule.openConversation(persona);
            }
        };
        const updateTokenStats = () => {
            if (window.ChatConversationModule && typeof window.ChatConversationModule.updateTokenStats === 'function') {
                window.ChatConversationModule.updateTokenStats();
            }
        };
        const applyCustomCss = (css) => {
            const customStyleTag = container.querySelector('#chat-custom-style-tag');
            if (customStyleTag) {
                customStyleTag.textContent = css || '';
            }
        };
        const applyChatBarTransparency = (charId, topOverride = null, bottomOverride = null) => {
            if (window.ChatConversationModule && typeof window.ChatConversationModule.applyChatBarTransparency === 'function') {
                window.ChatConversationModule.applyChatBarTransparency(charId, topOverride, bottomOverride);
            }
        };
        const applyChatWallpaper = (charId) => {
            if (window.ChatConversationModule && typeof window.ChatConversationModule.applyChatWallpaper === 'function') {
                window.ChatConversationModule.applyChatWallpaper(charId);
            }
        };

        const charData = currentPersona.rawCharData || currentPersona;
        
        // 填充角色卡片
        container.querySelector('#cs-char-avatar').src = currentPersona.avatarUrl || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        container.querySelector('#cs-char-name').value = charData.nickname || charData.name || charData.realname || '';
        container.querySelector('#cs-char-realname').value = charData.realname || '';
        container.querySelector('#cs-char-persona').value = charData.persona || '';

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
                        if (csCharAvatar) csCharAvatar.src = newAvatar;
                        currentPersona.avatarUrl = newAvatar === 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7' ? null : newAvatar;
                        renderChatList();
                    });
                }
            });
        }

        if (csUserAvatarContainer) {
            csUserAvatarContainer.addEventListener('click', () => {
                if (!currentPersona) return;
                const charConfigTmp = JSON.parse(localStorage.getItem(`nrj-chat-config-${currentPersona.id}`) || '{}');
                let targetUserId = charConfigTmp.userPersonaId || window.ChatStorage.getActivePersonaId();
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
                        if (csUserAvatar) csUserAvatar.src = newAvatar;
                        if (targetUserId === window.ChatStorage.getActivePersonaId()) {
                            if (typeof this.ctx.updateProfileDisplay === 'function') {
                                this.ctx.updateProfileDisplay();
                            }
                        }
                    });
                }
            });
        }

        // 填充设置
        const charConfig = JSON.parse(localStorage.getItem(`nrj-chat-config-${currentPersona.id}`) || '{}');
        
        // 填充壁纸设置
        const bgPreview = container.querySelector('#chat-bg-preview');
        const bgUrlInput = container.querySelector('#chat-bg-url-input');
        const bgUploadBtn = container.querySelector('#btn-upload-chat-bg');
        const bgUploadInput = container.querySelector('#input-upload-chat-bg');
        const btnClearBg = container.querySelector('#btn-clear-chat-bg');

        // API 历史设置及交互绑定
        const apiHistoryConfig = {
            toggle: container.querySelector('#cs-api-history-toggle'),
            limit: container.querySelector('#cs-api-history-limit'),
            selectAll: container.querySelector('#btn-api-history-select-all'),
            exportSelected: container.querySelector('#btn-api-history-export-selected'),
            deleteSelected: container.querySelector('#btn-api-history-delete-selected'),
            clearAll: container.querySelector('#btn-api-history-clear-all'),
            list: container.querySelector('#cs-api-history-list'),
            detailPopup: container.querySelector('#chat-api-history-detail-popup'),
            detailReq: container.querySelector('#api-history-detail-req'),
            detailRes: container.querySelector('#api-history-detail-res'),
            closeDetail: container.querySelector('.btn-close-api-history-detail')
        };

        if (apiHistoryConfig.toggle) {
            apiHistoryConfig.toggle.checked = !!charConfig.enableApiHistory;
            apiHistoryConfig.toggle.onchange = (e) => {
                charConfig.enableApiHistory = e.target.checked;
                localStorage.setItem(`nrj-chat-config-${currentPersona.id}`, JSON.stringify(charConfig));
            };
        }

        if (apiHistoryConfig.limit) {
            apiHistoryConfig.limit.value = charConfig.apiHistoryLimit !== undefined ? charConfig.apiHistoryLimit : 50;
            apiHistoryConfig.limit.onchange = (e) => {
                let val = parseInt(e.target.value, 10);
                if (isNaN(val) || val < 1) val = 50;
                charConfig.apiHistoryLimit = val;
                localStorage.setItem(`nrj-chat-config-${currentPersona.id}`, JSON.stringify(charConfig));
            };
        }

        let selectedApiRecords = new Set();
        
        const renderApiHistory = async () => {
            if (!apiHistoryConfig.list || !window.ImageStorageManager) return;
            const records = await window.ImageStorageManager.loadApiHistory(currentPersona.id);
            apiHistoryConfig.list.innerHTML = '';
            selectedApiRecords.clear();
            
            if (apiHistoryConfig.exportSelected) {
                apiHistoryConfig.exportSelected.disabled = true;
                apiHistoryConfig.exportSelected.textContent = '导出所选';
            }
            if (apiHistoryConfig.deleteSelected) {
                apiHistoryConfig.deleteSelected.disabled = true;
                apiHistoryConfig.deleteSelected.textContent = '删除所选';
            }
            if (apiHistoryConfig.selectAll) {
                apiHistoryConfig.selectAll.textContent = '全选';
            }

            if (!records || records.length === 0) {
                apiHistoryConfig.list.innerHTML = '<div style="text-align: center; color: var(--text-secondary); font-size: 12px; padding: 20px 0;">暂无记录</div>';
                return;
            }

            records.forEach(r => {
                const item = document.createElement('div');
                item.className = 'api-history-item';
                item.style.cssText = `display: flex; align-items: center; justify-content: space-between; padding: 10px; background: #fff; border: 1px solid var(--border-color); border-radius: 8px; cursor: pointer; transition: background 0.2s; position: relative;`;
                
                const timeStr = new Date(r.timestamp).toLocaleString();
                const costStr = r.costTime ? ` | ${r.costTime}ms` : '';
                const errStr = r.isError ? ` | <span style="color: #FF3B30;">Error</span>` : '';
                const tokensStr = r.usage && r.usage.total_tokens ? ` | Tokens: ${r.usage.total_tokens}` : '';
                
                item.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <input type="checkbox" class="api-history-checkbox" data-id="${r.id}" style="width: 16px; height: 16px; flex-shrink: 0; cursor: pointer;">
                        <div style="display: flex; flex-direction: column; gap: 4px;">
                            <div style="font-size: 13px; font-weight: 500; color: #333;">${timeStr}</div>
                            <div style="font-size: 11px; color: #999;">${r.model || 'Unknown Model'}${costStr}${tokensStr}${errStr}</div>
                        </div>
                    </div>
                    <div class="api-history-view-btn" style="padding: 4px 8px; background: rgba(0,0,0,0.04); border-radius: 4px; font-size: 12px; color: var(--accent-color);">查看</div>
                `;

                const cb = item.querySelector('.api-history-checkbox');
                cb.addEventListener('click', (e) => e.stopPropagation());
                cb.addEventListener('change', () => {
                    if (cb.checked) selectedApiRecords.add(r.id);
                    else selectedApiRecords.delete(r.id);
                    
                    if (apiHistoryConfig.exportSelected) {
                        apiHistoryConfig.exportSelected.disabled = selectedApiRecords.size === 0;
                        apiHistoryConfig.exportSelected.textContent = `导出所选 (${selectedApiRecords.size})`;
                    }
                    if (apiHistoryConfig.deleteSelected) {
                        apiHistoryConfig.deleteSelected.disabled = selectedApiRecords.size === 0;
                        apiHistoryConfig.deleteSelected.textContent = `删除所选 (${selectedApiRecords.size})`;
                    }
                    if (apiHistoryConfig.selectAll) {
                        apiHistoryConfig.selectAll.textContent = selectedApiRecords.size === records.length ? '取消全选' : '全选';
                    }
                });

                const viewBtn = item.querySelector('.api-history-view-btn');
                viewBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (apiHistoryConfig.detailPopup) {
                        apiHistoryConfig.detailReq.textContent = r.data && r.data.request ? JSON.stringify(r.data.request, null, 2) : '无请求数据';
                        apiHistoryConfig.detailRes.textContent = r.data && r.data.response ? JSON.stringify(r.data.response, null, 2) : '无响应数据';
                        apiHistoryConfig.detailPopup.classList.add('active');
                    }
                });

                item.addEventListener('click', () => {
                    cb.click();
                });

                apiHistoryConfig.list.appendChild(item);
            });
        };

        if (apiHistoryConfig.closeDetail) {
            apiHistoryConfig.closeDetail.addEventListener('click', () => {
                if (apiHistoryConfig.detailPopup) apiHistoryConfig.detailPopup.classList.remove('active');
            });
        }

        if (apiHistoryConfig.selectAll) {
            apiHistoryConfig.selectAll.addEventListener('click', async () => {
                const records = await window.ImageStorageManager.loadApiHistory(currentPersona.id);
                if (selectedApiRecords.size === records.length) {
                    selectedApiRecords.clear();
                    apiHistoryConfig.list.querySelectorAll('.api-history-checkbox').forEach(cb => cb.checked = false);
                } else {
                    records.forEach(r => selectedApiRecords.add(r.id));
                    apiHistoryConfig.list.querySelectorAll('.api-history-checkbox').forEach(cb => cb.checked = true);
                }
                if (apiHistoryConfig.exportSelected) {
                    apiHistoryConfig.exportSelected.disabled = selectedApiRecords.size === 0;
                    apiHistoryConfig.exportSelected.textContent = `导出所选 (${selectedApiRecords.size})`;
                }
                if (apiHistoryConfig.deleteSelected) {
                    apiHistoryConfig.deleteSelected.disabled = selectedApiRecords.size === 0;
                    apiHistoryConfig.deleteSelected.textContent = `删除所选 (${selectedApiRecords.size})`;
                }
                apiHistoryConfig.selectAll.textContent = selectedApiRecords.size === records.length ? '取消全选' : '全选';
            });
        }

        if (apiHistoryConfig.exportSelected) {
            apiHistoryConfig.exportSelected.addEventListener('click', async () => {
                if (selectedApiRecords.size === 0) return;
                try {
                    const records = await window.ImageStorageManager.loadApiHistory(currentPersona.id);
                    const selectedData = records.filter(r => selectedApiRecords.has(r.id)).map(r => ({
                        timestamp: new Date(r.timestamp).toLocaleString(),
                        costTimeMs: r.costTime,
                        model: r.model,
                        isError: r.isError,
                        errorMsg: r.errorMsg,
                        tokens: r.usage,
                        request: r.data?.request,
                        response: r.data?.response
                    }));
                    
                    const blob = new Blob([JSON.stringify(selectedData, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    const charName = currentPersona.name || 'Unknown';
                    a.download = `api_history_${charName}_${Date.now()}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                    
                    if (window._currentChatOSAlert) window._currentChatOSAlert('提示', '导出成功');
                } catch(e) {
                    console.error("导出API历史失败", e);
                    if (window._currentChatOSAlert) window._currentChatOSAlert('导出失败', e.message || '未知错误');
                }
            });
        }

        if (apiHistoryConfig.deleteSelected) {
            apiHistoryConfig.deleteSelected.addEventListener('click', async () => {
                if (selectedApiRecords.size === 0) return;
                window.showChatConfirm('删除记录', `确定要删除这 ${selectedApiRecords.size} 条API历史记录吗？`, async () => {
                    await window.ImageStorageManager.deleteApiHistory(Array.from(selectedApiRecords));
                    renderApiHistory();
                    if (window._currentChatOSAlert) window._currentChatOSAlert('提示', '删除成功');
                });
            });
        }

        if (apiHistoryConfig.clearAll) {
            apiHistoryConfig.clearAll.addEventListener('click', () => {
                window.showChatConfirm('清空记录', '确定要清空该角色的所有API历史记录吗？', async () => {
                    await window.ImageStorageManager.clearApiHistory(currentPersona.id);
                    renderApiHistory();
                    if (window._currentChatOSAlert) window._currentChatOSAlert('提示', '已清空');
                });
            });
        }

        // 当点击 API 历史 Tab 时，才去加载渲染数据，避免性能浪费
        const tabApiHistoryTrigger = container.querySelector('.chat-popup-tab[data-tab="cs-tab-api-history"]');
        if (tabApiHistoryTrigger) {
            tabApiHistoryTrigger.addEventListener('click', () => {
                renderApiHistory();
            });
        }


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
            } else {
                bgPreview.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                bgPreview.style.opacity = '0';
                bgUploadBtn.style.borderColor = 'var(--border-color)';
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
                
                if (typeof showCustomModal === 'function') {
                    showCustomModal('重置成功', '聊天壁纸已清除，将使用默认或全局壁纸。', false, '', () => {});
                }
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
                    textCsCharTimezone.textContent = this.getTimezoneNameByCode(tzCode);
                    textCsCharTimezone.style.color = 'var(--text-color)';
                } else {
                    textCsCharTimezone.textContent = '跟随本地时间 (默认)';
                    textCsCharTimezone.style.color = 'var(--text-secondary)';
                }
            }

            if (triggerCsCharTimezone) {
                triggerCsCharTimezone.onclick = () => {
                    this.showTimezonePopup((selectedZone) => {
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
        const personas = window.ChatStorage.loadPersonas();
        
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

        let activeUserId = charConfig.userPersonaId || window.ChatStorage.getActivePersonaId();
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
                    textCsUserTimezone.textContent = this.getTimezoneNameByCode(uTzCode);
                    textCsUserTimezone.style.color = 'var(--text-color)';
                } else {
                    textCsUserTimezone.textContent = '跟随本地时间 (默认)';
                    textCsUserTimezone.style.color = 'var(--text-secondary)';
                }
            }

            if (triggerCsUserTimezone) {
                triggerCsUserTimezone.onclick = () => {
                    this.showTimezonePopup((selectedZone) => {
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

        // 角色设置中：渲染表情包兜底分组选项
        const renderCharEmojiFallbackGroups = (cc) => {
            const containerBox = container.querySelector('#cs-char-emoji-fallback-groups-list');
            if (!containerBox) return;
            containerBox.innerHTML = '';
            
            const groups = JSON.parse(localStorage.getItem('nrj-custom-emoji-groups') || '[]');
            if (groups.length === 0) {
                containerBox.innerHTML = '<span style="font-size: 12px; color: var(--text-secondary);">暂无用户表情包分组</span>';
                return;
            }
            
            const fallbackGroups = cc.emojiFallbackGroups || [];
            
            groups.forEach(g => {
                const label = document.createElement('label');
                label.style.cssText = 'display: flex; align-items: center; gap: 4px; font-size: 12px; cursor: pointer; padding: 4px 8px; background: #fff; border-radius: 6px; border: 1px solid var(--border-color);';
                
                const cb = document.createElement('input');
                cb.type = 'checkbox';
                cb.value = g.id;
                cb.checked = fallbackGroups.includes(g.id);
                
                cb.addEventListener('change', () => {
                    let fc = JSON.parse(localStorage.getItem(`nrj-chat-config-${currentPersona.id}`) || '{}');
                    if (!fc.emojiFallbackGroups) fc.emojiFallbackGroups = [];
                    if (cb.checked) {
                        if (!fc.emojiFallbackGroups.includes(g.id)) fc.emojiFallbackGroups.push(g.id);
                    } else {
                        fc.emojiFallbackGroups = fc.emojiFallbackGroups.filter(id => id !== g.id);
                    }
                    localStorage.setItem(`nrj-chat-config-${currentPersona.id}`, JSON.stringify(fc));
                });
                
                label.appendChild(cb);
                label.appendChild(document.createTextNode(g.name));
                containerBox.appendChild(label);
            });
        };

        const toggleCharEmojiFallback = container.querySelector('#cs-char-emoji-fallback-toggle');
        const charEmojiFallbackGroupsContainer = container.querySelector('#cs-char-emoji-fallback-groups-container');
        if (toggleCharEmojiFallback) {
            const currentStrategy = charConfig.emojiStrategy || 'fallback_user';
            toggleCharEmojiFallback.checked = currentStrategy === 'fallback_user';
            
            if (charEmojiFallbackGroupsContainer) {
                charEmojiFallbackGroupsContainer.style.display = toggleCharEmojiFallback.checked ? 'flex' : 'none';
            }
            renderCharEmojiFallbackGroups(charConfig);

            toggleCharEmojiFallback.addEventListener('change', (e) => {
                const strategy = e.target.checked ? 'fallback_user' : 'char_only';
                charConfig.emojiStrategy = strategy;
                localStorage.setItem(`nrj-chat-config-${currentPersona.id}`, JSON.stringify(charConfig));
                if (charEmojiFallbackGroupsContainer) {
                    charEmojiFallbackGroupsContainer.style.display = e.target.checked ? 'flex' : 'none';
                }
            });
        }

        const btnManageCharEmojisSettings = container.querySelector('#btn-manage-char-emojis');
        if (btnManageCharEmojisSettings) {
            btnManageCharEmojisSettings.addEventListener('click', () => {
                if (window.ChatEmojiModule) {
                    window.ChatEmojiModule.openCharEmojiManage();
                } else {
                    if (window._currentChatOSAlert) window._currentChatOSAlert('提示', '表情包模块尚未加载');
                }
            });
        }

        const closeAllDropdowns = () => {
            const panelIds = ['#cs-user-persona-options-panel', '#cs-worldbook-options-panel', '#cs-translation-pos-options-panel', '#cs-quote-style-options-panel', '#cs-avatar-display-options-panel', '#cs-bubble-style-options-panel', '#cs-msg-time-pos-options-panel', '#cs-msg-time-format-options-panel', '#cs-typing-style-options-panel'];
            const caretIds = ['#cs-user-persona-caret', '#cs-worldbook-caret', '#cs-translation-pos-caret', '#cs-quote-style-caret', '#cs-avatar-display-caret', '#cs-bubble-style-caret', '#cs-msg-time-pos-caret', '#cs-msg-time-format-caret', '#cs-typing-style-caret'];
            const triggerIds = ['#cs-user-persona-dropdown-trigger', '#cs-worldbook-dropdown-trigger', '#cs-translation-pos-dropdown-trigger', '#cs-quote-style-dropdown-trigger', '#cs-avatar-display-dropdown-trigger', '#cs-bubble-style-dropdown-trigger', '#cs-msg-time-pos-dropdown-trigger', '#cs-msg-time-format-dropdown-trigger', '#cs-typing-style-dropdown-trigger'];
            
            panelIds.forEach(id => {
                const el = container.querySelector(id);
                if (el) el.style.display = 'none';
            });
            caretIds.forEach(id => {
                const el = container.querySelector(id);
                if (el) el.style.transform = 'rotate(0deg)';
            });
            triggerIds.forEach(id => {
                const el = container.querySelector(id);
                if (el) el.style.borderColor = 'var(--border-color)';
            });
        };

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
                
                renderUserCard(optData.id || window.ChatStorage.getActivePersonaId());
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
            closeAllDropdowns();
            if (!isPanelOpen) {
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
            autoSummaryInput.value = charConfig.autoSummaryThreshold !== undefined ? charConfig.autoSummaryThreshold : 100;
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
                wbSelectedText.textContent = optData.text;
                wbInput.value = optData.id;
                wbOptionsPanel.style.display = 'none';
                wbCaret.style.transform = 'rotate(0deg)';
                wbTrigger.style.borderColor = 'var(--border-color)';
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
            closeAllDropdowns();
            if (!isPanelOpen) {
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
                    closeAllDropdowns();
                    if (!isPanelOpen) {
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
                    closeAllDropdowns();
                    if (!isPanelOpen) {
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

        // 美化 - 头像形状逻辑
        const charShapeTrigger = container.querySelector('#cs-char-avatar-shape-trigger');
        const charShapeText = container.querySelector('#cs-char-avatar-shape-text');
        const charShapeVal = container.querySelector('#cs-char-avatar-shape-val');
        
        const userShapeTrigger = container.querySelector('#cs-user-avatar-shape-trigger');
        const userShapeText = container.querySelector('#cs-user-avatar-shape-text');
        const userShapeVal = container.querySelector('#cs-user-avatar-shape-val');
        
        const shapePopup = container.querySelector('#cs-avatar-shape-popup');
        const shapePopupTitle = container.querySelector('#cs-avatar-shape-title');
        const shapeCodeInput = container.querySelector('#cs-avatar-shape-code');
        const btnSaveShapePreset = container.querySelector('#btn-save-cs-shape-preset');
        const btnApplyShapeCode = container.querySelector('#btn-apply-cs-shape-code');
        const customPresetsContainer = container.querySelector('#cs-avatar-shape-custom-presets');
        
        let currentShapeEditing = ''; // 'char' or 'user'

        const renderShapeCustomPresets = () => {
            if (!customPresetsContainer) return;
            customPresetsContainer.innerHTML = '';
            let presets = [];
            try {
                presets = JSON.parse(localStorage.getItem('nrj-chat-custom-shape-presets') || '[]');
            } catch(e) {}
            
            if (presets.length === 0) {
                customPresetsContainer.innerHTML = '<span style="font-size: 12px; color: #aaa;">无</span>';
                return;
            }
            
            presets.forEach(p => {
                const btn = document.createElement('button');
                btn.className = 'chat-btn-text';
                btn.style.cssText = 'background: #f4f4f5; border: 1px solid #e5e5ea; padding: 4px 10px; border-radius: 8px; font-size: 12px; cursor: pointer; color: #333;';
                btn.textContent = p.name;
                btn.title = '右键删除';
                
                btn.onclick = () => {
                    if (shapeCodeInput) shapeCodeInput.value = p.code;
                };
                
                btn.oncontextmenu = (e) => {
                    e.preventDefault();
                    showChatConfirm('删除预设', `确定删除形状预设"${p.name}"吗？`, () => {
                        let newPresets = presets.filter(item => item.id !== p.id);
                        localStorage.setItem('nrj-chat-custom-shape-presets', JSON.stringify(newPresets));
                        renderShapeCustomPresets();
                    });
                };
                
                customPresetsContainer.appendChild(btn);
            });
        };

                const updateShapeTriggerText = (val, textEl) => {
                    if (!val) {
                        textEl.textContent = '圆形 (默认)';
                    } else if (val.includes('50% 0 50% 50%')) {
                        textEl.textContent = '泪滴形';
                    } else if (val.includes('50%') && !val.includes('polygon')) {
                        textEl.textContent = '圆形';
                    } else if (val.includes('18px')) {
                        textEl.textContent = '圆角';
                    } else if (val.includes('4px') || val.includes('8px')) {
                        textEl.textContent = '方形';
                    } else {
                        textEl.textContent = '自定义';
                    }
                };

        if (charShapeTrigger) {
            const savedCharShape = charConfig.charAvatarShape || '';
            if (charShapeVal) charShapeVal.value = savedCharShape;
            updateShapeTriggerText(savedCharShape, charShapeText);

            charShapeTrigger.onclick = () => {
                currentShapeEditing = 'char';
                if (shapePopupTitle) shapePopupTitle.textContent = '自定义角色头像形状';
                if (shapeCodeInput) shapeCodeInput.value = charShapeVal.value || '';
                renderShapeCustomPresets();
                if (shapePopup) {
                    shapePopup.style.display = 'flex';
                    setTimeout(() => shapePopup.classList.add('active'), 10);
                }
            };
        }

        if (userShapeTrigger) {
            const savedUserShape = charConfig.userAvatarShape || '';
            if (userShapeVal) userShapeVal.value = savedUserShape;
            updateShapeTriggerText(savedUserShape, userShapeText);

            userShapeTrigger.onclick = () => {
                currentShapeEditing = 'user';
                if (shapePopupTitle) shapePopupTitle.textContent = '自定义用户头像形状';
                if (shapeCodeInput) shapeCodeInput.value = userShapeVal.value || '';
                renderShapeCustomPresets();
                if (shapePopup) {
                    shapePopup.style.display = 'flex';
                    setTimeout(() => shapePopup.classList.add('active'), 10);
                }
            };
        }

        container.querySelectorAll('.cs-shape-preset-btn').forEach(btn => {
            btn.onclick = () => {
                const code = btn.getAttribute('data-code').replace(/\\n/g, '\n');
                if (shapeCodeInput) shapeCodeInput.value = code;
            };
        });

        if (btnSaveShapePreset) {
            btnSaveShapePreset.onclick = () => {
                showChatPrompt('新预设名称', '', (name) => {
                    if (name) {
                        let presets = JSON.parse(localStorage.getItem('nrj-chat-custom-shape-presets') || '[]');
                        presets.push({
                            id: 'shape_' + Date.now(),
                            name: name,
                            code: shapeCodeInput ? shapeCodeInput.value : ''
                        });
                        localStorage.setItem('nrj-chat-custom-shape-presets', JSON.stringify(presets));
                        renderShapeCustomPresets();
                    }
                }, false, '', true, '例如：魔法阵形状');
            };
        }

        if (btnApplyShapeCode) {
            btnApplyShapeCode.onclick = () => {
                const code = shapeCodeInput ? shapeCodeInput.value.trim() : '';
                if (currentShapeEditing === 'char') {
                    if (charShapeVal) charShapeVal.value = code;
                    charConfig.charAvatarShape = code;
                    updateShapeTriggerText(code, charShapeText);
                } else if (currentShapeEditing === 'user') {
                    if (userShapeVal) userShapeVal.value = code;
                    charConfig.userAvatarShape = code;
                    updateShapeTriggerText(code, userShapeText);
                }
                
                localStorage.setItem(`nrj-chat-config-${currentPersona.id}`, JSON.stringify(charConfig));
                
                if (shapePopup) {
                    shapePopup.classList.remove('active');
                    setTimeout(() => shapePopup.style.display = 'none', 200);
                }
                
                if (convView && convView.classList.contains('active')) {
                    openConversation(currentPersona);
                }
            };
        }

        container.querySelectorAll('.btn-close-shape-popup').forEach(btn => {
            btn.onclick = () => {
                if (shapePopup) {
                    shapePopup.classList.remove('active');
                    setTimeout(() => shapePopup.style.display = 'none', 200);
                }
            };
        });

        // 美化 - 顶栏样式
        const topbarStyleInput = container.querySelector('#cs-topbar-style-select');
        const topbarStyleTrigger = container.querySelector('#cs-topbar-style-dropdown-trigger');
        const topbarStyleSelectedText = container.querySelector('#cs-topbar-style-selected-text');
        const topbarStyleOptionsPanel = container.querySelector('#cs-topbar-style-options-panel');
        const topbarStyleCaret = container.querySelector('#cs-topbar-style-caret');
        
        const polaroidSettingsContainer = container.querySelector('#cs-polaroid-settings-container');
        const polaroidPosSelect = container.querySelector('#cs-polaroid-position');
        const polaroidSizeRange = container.querySelector('#cs-polaroid-size-range');
        const polaroidSizeInput = container.querySelector('#cs-polaroid-size-input');
        const polaroidSizeVal = container.querySelector('#cs-polaroid-size-val');
        const btnResetPolaroidSize = container.querySelector('#btn-reset-polaroid-size');
        
        const polaroidXRange = container.querySelector('#cs-polaroid-x-range');
        const polaroidXInput = container.querySelector('#cs-polaroid-x-input');
        const polaroidXVal = container.querySelector('#cs-polaroid-x-val');
        const btnResetPolaroidX = container.querySelector('#btn-reset-polaroid-x');
        
        const polaroidYRange = container.querySelector('#cs-polaroid-y-range');
        const polaroidYInput = container.querySelector('#cs-polaroid-y-input');
        const polaroidYVal = container.querySelector('#cs-polaroid-y-val');
        const btnResetPolaroidY = container.querySelector('#btn-reset-polaroid-y');

        const topbarStyleOptions = [
            { id: 'default', text: '默认极简' },
            { id: 'wave', text: '声波连线' },
            { id: 'ecg', text: '心电波连线' },
            { id: 'polaroid', text: '拍立得吊坠' }
        ];

        const updatePolaroidSettingsVisibility = (styleId) => {
            if (polaroidSettingsContainer) {
                if (styleId === 'polaroid' || styleId === 'default') {
                    polaroidSettingsContainer.style.display = 'none'; // 新逻辑下，polaroid 就是 default + 挂件。但用户说“拍立得吊坠”这个风格本身就是附带位置大小调节的。所以如果是 polaroid 则显示
                    if (styleId === 'polaroid') {
                        polaroidSettingsContainer.style.display = 'block';
                    }
                } else {
                    polaroidSettingsContainer.style.display = 'none';
                }
            }
        };

        if (polaroidPosSelect) {
            polaroidPosSelect.value = charConfig.polaroidPos || 'none';
            polaroidPosSelect.onchange = (e) => {
                charConfig.polaroidPos = e.target.value;
                localStorage.setItem(`nrj-chat-config-${currentPersona.id}`, JSON.stringify(charConfig));
                if (convView && convView.classList.contains('active')) {
                    openConversation(currentPersona);
                }
            };
        }

        if (polaroidSizeRange && polaroidSizeInput) {
            const currentSize = charConfig.polaroidSize !== undefined ? charConfig.polaroidSize : 100;
            polaroidSizeRange.value = currentSize;
            polaroidSizeInput.value = currentSize;
            if (polaroidSizeVal) polaroidSizeVal.textContent = currentSize + '%';

            const updatePolaroidSize = (val) => {
                charConfig.polaroidSize = val;
                localStorage.setItem(`nrj-chat-config-${currentPersona.id}`, JSON.stringify(charConfig));
                if (convView && convView.classList.contains('active')) {
                    openConversation(currentPersona);
                }
            };

            polaroidSizeRange.oninput = (e) => {
                const val = parseInt(e.target.value, 10);
                polaroidSizeInput.value = val;
                if (polaroidSizeVal) polaroidSizeVal.textContent = val + '%';
                updatePolaroidSize(val);
            };

            polaroidSizeInput.onchange = (e) => {
                let val = parseInt(e.target.value, 10);
                if (isNaN(val)) val = 100;
                e.target.value = val;
                polaroidSizeRange.value = val;
                if (polaroidSizeVal) polaroidSizeVal.textContent = val + '%';
                updatePolaroidSize(val);
            };

            if (btnResetPolaroidSize) {
                btnResetPolaroidSize.onclick = () => {
                    polaroidSizeRange.value = 100;
                    polaroidSizeInput.value = 100;
                    if (polaroidSizeVal) polaroidSizeVal.textContent = '100%';
                    updatePolaroidSize(100);
                };
            }
        }

        if (polaroidXRange && polaroidXInput) {
            const currentX = charConfig.polaroidOffsetX || 0;
            polaroidXRange.value = currentX;
            polaroidXInput.value = currentX;
            if (polaroidXVal) polaroidXVal.textContent = currentX + 'px';

            const updatePolaroidX = (val) => {
                charConfig.polaroidOffsetX = val;
                localStorage.setItem(`nrj-chat-config-${currentPersona.id}`, JSON.stringify(charConfig));
                if (convView && convView.classList.contains('active')) {
                    openConversation(currentPersona);
                }
            };

            polaroidXRange.oninput = (e) => {
                const val = parseInt(e.target.value, 10);
                polaroidXInput.value = val;
                if (polaroidXVal) polaroidXVal.textContent = val + 'px';
                updatePolaroidX(val);
            };

            polaroidXInput.onchange = (e) => {
                let val = parseInt(e.target.value, 10);
                if (isNaN(val)) val = 0;
                e.target.value = val;
                polaroidXRange.value = val;
                if (polaroidXVal) polaroidXVal.textContent = val + 'px';
                updatePolaroidX(val);
            };

            if (btnResetPolaroidX) {
                btnResetPolaroidX.onclick = () => {
                    polaroidXRange.value = 0;
                    polaroidXInput.value = 0;
                    if (polaroidXVal) polaroidXVal.textContent = '0px';
                    updatePolaroidX(0);
                };
            }
        }

        if (polaroidYRange && polaroidYInput) {
            const currentY = charConfig.polaroidOffsetY || 0;
            polaroidYRange.value = currentY;
            polaroidYInput.value = currentY;
            if (polaroidYVal) polaroidYVal.textContent = currentY + 'px';

            const updatePolaroidY = (val) => {
                charConfig.polaroidOffsetY = val;
                localStorage.setItem(`nrj-chat-config-${currentPersona.id}`, JSON.stringify(charConfig));
                if (convView && convView.classList.contains('active')) {
                    openConversation(currentPersona);
                }
            };

            polaroidYRange.oninput = (e) => {
                const val = parseInt(e.target.value, 10);
                polaroidYInput.value = val;
                if (polaroidYVal) polaroidYVal.textContent = val + 'px';
                updatePolaroidY(val);
            };

            polaroidYInput.onchange = (e) => {
                let val = parseInt(e.target.value, 10);
                if (isNaN(val)) val = 0;
                e.target.value = val;
                polaroidYRange.value = val;
                if (polaroidYVal) polaroidYVal.textContent = val + 'px';
                updatePolaroidY(val);
            };

            if (btnResetPolaroidY) {
                btnResetPolaroidY.onclick = () => {
                    polaroidYRange.value = 0;
                    polaroidYInput.value = 0;
                    if (polaroidYVal) polaroidYVal.textContent = '0px';
                    updatePolaroidY(0);
                };
            }
        }

        if (topbarStyleOptionsPanel) {
            topbarStyleOptionsPanel.innerHTML = '';
            topbarStyleOptions.forEach(optData => {
                const optEl = document.createElement('div');
                optEl.style.cssText = `padding: 10px 12px; border-radius: 8px; cursor: pointer; transition: background 0.2s; color: var(--text-color); margin-bottom: 2px;`;
                optEl.textContent = optData.text;
                optEl.addEventListener('mouseenter', () => { optEl.style.backgroundColor = 'var(--hover-bg)'; });
                optEl.addEventListener('mouseleave', () => { optEl.style.backgroundColor = 'transparent'; });
                optEl.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (topbarStyleSelectedText) topbarStyleSelectedText.textContent = optData.text;
                    if (topbarStyleInput) topbarStyleInput.value = optData.id;
                    topbarStyleOptionsPanel.style.display = 'none';
                    if (topbarStyleCaret) topbarStyleCaret.style.transform = 'rotate(0deg)';
                    if (topbarStyleTrigger) topbarStyleTrigger.style.borderColor = 'var(--border-color)';
                    
                    charConfig.topbarStyle = optData.id;
                    localStorage.setItem(`nrj-chat-config-${currentPersona.id}`, JSON.stringify(charConfig));
                    
                    updatePolaroidSettingsVisibility(optData.id);

                    if (convView && convView.classList.contains('active')) {
                        openConversation(currentPersona);
                    }
                });
                topbarStyleOptionsPanel.appendChild(optEl);
            });
            
            let currentTopbarStyle = charConfig.topbarStyle || 'default';
            const foundTopbarStyle = topbarStyleOptions.find(o => o.id === currentTopbarStyle);
            if (foundTopbarStyle) {
                if (topbarStyleSelectedText) topbarStyleSelectedText.textContent = foundTopbarStyle.text;
                if (topbarStyleInput) topbarStyleInput.value = foundTopbarStyle.id;
            }
            
            updatePolaroidSettingsVisibility(currentTopbarStyle);

            if (topbarStyleTrigger) {
                topbarStyleTrigger.onclick = (e) => {
                    e.stopPropagation();
                    const isPanelOpen = topbarStyleOptionsPanel.style.display === 'block';
                    closeAllDropdowns();
                    if (!isPanelOpen) {
                        topbarStyleOptionsPanel.style.display = 'block';
                        if (topbarStyleCaret) topbarStyleCaret.style.transform = 'rotate(180deg)';
                        topbarStyleTrigger.style.borderColor = 'var(--accent-color)';
                    }
                };
            }
            
            document.addEventListener('click', (e) => {
                if (topbarStyleOptionsPanel && topbarStyleOptionsPanel.style.display === 'block' && !topbarStyleOptionsPanel.contains(e.target) && e.target !== topbarStyleTrigger) {
                    topbarStyleOptionsPanel.style.display = 'none';
                    if (topbarStyleCaret) topbarStyleCaret.style.transform = 'rotate(0deg)';
                    if (topbarStyleTrigger) topbarStyleTrigger.style.borderColor = 'var(--border-color)';
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
                    closeAllDropdowns();
                    if (!isPanelOpen) {
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
                showChatPrompt('新预设名称', '', (name) => {
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
                }, false, '', true, '例如：自定义配色与CSS');
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
                showChatPrompt('新预设名称', '', (name) => {
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
                }, false, '', true, '例如：自定义配色与CSS');
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
                    closeAllDropdowns();
                    if (!isPanelOpen) {
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
                    closeAllDropdowns();
                    if (!isPanelOpen) {
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
                    closeAllDropdowns();
                    if (!isPanelOpen) {
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

        // 恢复 Tab 状态
        let targetTabId = 'cs-tab-role';
        if (localStorage.getItem('nrj-remember-cs-tab') === 'true') {
            targetTabId = localStorage.getItem('nrj-saved-cs-tab') || 'cs-tab-role';
        }
        
        const targetTab = container.querySelector(`.chat-popup-tab[data-tab="${targetTabId}"]`);
        if (targetTab) {
            targetTab.click();
        } else {
            const firstTab = container.querySelector('.chat-popup-tab[data-tab="cs-tab-role"]');
            if (firstTab) firstTab.click();
        }

        updateTokenStats();

        if (popupCharacterSettings) popupCharacterSettings.classList.add('active');
    }
};
