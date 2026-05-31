window.ChatContext = class ChatContext {
    constructor(container, closeCallback) {
        this.container = container;
        this.closeCallback = closeCallback;
        
        // --- 核心状态 (Shared State) ---
        this.initialMessages = [];
        this.aiAbortController = null;
        this.aiReplyPaused = false;
        this.currentQuote = null; 
        this.currentPersona = null;
        
        // 会话分组相关逻辑
        this.currentListGroupId = 'all';
        this.isSessionGroupManageMultiMode = false;
        this.selectedSessionGroupIds = new Set();
        
        // 消息多选模式状态
        this.isMessageSelectMode = false;
        this.selectedMessageIndices = new Set();
        
        // 会话多选模式状态
        this.isSessionSelectMode = false;
        this.selectedSessionIds = new Set();
        this.activeSessionForMenu = null;
        
        // 消息菜单状态
        this.activeMessageForMenu = null;
        
        // 人设库状态
        this.isManageMode = false;
        this.selectedPersonaIds = new Set();
        this.editingPersonaId = null;
        this.tempAvatarBase64 = null;
        this.viewingPersona = null;
        this.viewingAvatarUrl = null;
        
        // 角色创建/编辑状态
        this.editingCharacterId = null;
        this.tempCharacterAvatarBase64 = null;
        
        // 弹窗及 UI 状态
        this.promptCallback = null;
        this.isPromptExpanded = false;
        this.confirmCallback = null;
        this.timezoneSelectCallback = null;
        this.timezoneClockInterval = null;

        // 表情包相关状态
        this.currentEmojiManageGroupId = 'all';
        this.currentEmojiManageSearchKey = '';
        this.currentEmojiPanelGroupId = 'all';
        this.isEmojiMultiSelectMode = false;
        this.selectedEmojiIds = new Set();
        
        this.selectedCharEmojiIds = new Set();
        this.isCharEmojiMultiSelectMode = false;
        this.currentCharEmojiManageSearchKey = '';
        this.editingCharEmojiId = null;
        this.currentCharEmojiManageGroupId = 'all';
        this.currentCharSingleBase64 = null;
        this.editingEmojiId = null;
        this.currentSingleBase64 = null;

        // 记忆管理
        this.editingMemoryId = null;

        // --- DOM 节点缓存 (DOM References) ---
        this.nodes = {};
        this.initNodes();

        // --- 全局工具与覆盖 ---
        this.toastTimeout = null;
        this.initUtils();

        // 事件总线
        this.events = {};
    }

    // 事件总线方法
    on(eventName, callback) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);
    }

    emit(eventName, data) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(cb => cb(data));
        }
    }

    off(eventName, callback) {
        if (this.events[eventName]) {
            this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
        }
    }

    initNodes() {
        const c = this.container;
        const $ = (sel) => c.querySelector(sel);
        const $$ = (sel) => c.querySelectorAll(sel);

        this.nodes = {
            // 通用
            chatListContainer: $('#chat-list-container'),
            chatListGroupTabs: $('#chat-list-group-tabs'),
            
            // 会话列表相关
            popupSessionGroup: $('#chat-session-group-popup'),
            popupSessionGroupManage: $('#chat-session-group-manage-popup'),
            sessionGroupSelect: $('#session-group-select'),
            sessionGroupNewName: $('#session-group-new-name'),
            btnCreateSessionGroup: $('#btn-create-session-group'),
            btnConfirmSessionGroup: $('#btn-confirm-session-group'),
            btnManageSessionGroups: $('#btn-manage-session-groups'),
            sessionGroupManageList: $('#session-group-manage-list'),
            btnManageSessionGroupsMulti: $('#btn-manage-session-groups-multi'),
            sessionGroupManageFooter: $('#session-group-manage-footer'),
            btnSelectAllSessionGroups: $('#btn-select-all-session-groups'),
            btnDeleteSelectedSessionGroups: $('#btn-delete-selected-session-groups'),
            
            chatSessionSelectBar: $('#chat-session-select-bar'),
            btnSessionSelectCancel: $('#btn-session-select-cancel'),
            btnSessionSelectDelete: $('#btn-session-select-delete'),
            btnSessionSelectPin: $('#btn-session-select-pin'),
            btnSessionSelectUnpin: $('#btn-session-select-unpin'),
            btnSessionSelectRead: $('#btn-session-select-read'),
            btnSessionSelectUnread: $('#btn-session-select-unread'),
            btnSessionSelectAll: $('#btn-session-select-all'),
            btnSessionSelectGroup: $('#btn-session-select-group'),

            sessionMenuOverlay: $('#chat-session-menu-overlay'),
            btnSessionMenuPin: $('#btn-session-pin'),
            btnSessionMenuUnpin: $('#btn-session-unpin'),
            btnSessionMenuRead: $('#btn-session-read'),
            btnSessionMenuUnread: $('#btn-session-unread'),
            btnSessionMenuDelete: $('#btn-session-delete'),
            btnSessionMenuSelect: $('#btn-session-select'),
            btnSessionMenuGroup: $('#btn-session-group'),

            // 聊天交互相关
            convView: $('#chat-conversation-view'),
            convBackBtn: $('#chat-conv-back'),
            convMoreBtn: $('.chat-conv-more-btn'),
            convName: $('#chat-conv-name'),
            convStatusDot: $('#chat-conv-status-dot'),
            convStatusText: $('#chat-conv-status-text'),
            convMessages: $('#chat-conv-messages'),
            convInput: $('#chat-conv-input'),
            convSendBtn: $('#chat-conv-send'),
            convPlusBtn: $('#chat-conv-plus-btn'),
            convExtPanel: $('#chat-conv-ext-panel'),
            convEmojiBtn: $('#chat-conv-emoji-btn'),
            convEmojiPanel: $('#chat-conv-emoji-panel'),
            chatComposerArea: $('.chat-composer-area'),

            chatMessageSelectBar: $('#chat-message-select-bar'),
            btnSelectBarCancel: $('#btn-select-bar-cancel'),
            btnSelectBarDelete: $('#btn-select-bar-delete'),
            btnSelectBarAll: $('#btn-select-bar-all'),

            msgMenuOverlay: $('#chat-message-menu-overlay'),
            msgMenu: $('#chat-message-menu'),
            btnMsgCopy: $('#btn-msg-copy'),
            btnMsgReply: $('#btn-msg-reply'),
            btnMsgEdit: $('#btn-msg-edit'),
            btnMsgRecall: $('#btn-msg-recall'),
            btnMsgDelete: $('#btn-msg-delete'),
            btnMsgSelect: $('#btn-msg-select'),

            quotePreview: $('#chat-quote-preview'),
            quoteName: $('#chat-quote-name'),
            quoteText: $('#chat-quote-text'),
            quoteCloseBtn: $('#chat-quote-close'),

            // 人设相关
            profileName: $('.chat-profile-name'),
            profileEmail: $('.chat-profile-email'),
            profileAvatar: $('.chat-profile-avatar'),
            btnCreatePersona: $('#btn-create-persona'),
            btnPersonaLibrary: $('#btn-persona-library'),
            popupLibrary: $('#persona-library-popup'),
            popupEdit: $('#persona-edit-popup'),
            popupView: $('#persona-view-popup'),
            
            // 人设库弹窗细化节点
            listContainer: $('#persona-list-container'),
            btnManagePersonas: $('#btn-manage-personas'),
            manageFooter: $('#persona-manage-footer'),
            btnDeleteSelected: $('#btn-delete-selected-personas'),
            btnSelectAll: $('#btn-select-all-personas'),
            
            // 新建/编辑人设节点
            editTitle: $('#persona-edit-title'),
            inputRealname: $('#persona-edit-realname'),
            inputNickname: $('#persona-edit-nickname'),
            inputBio: $('#persona-edit-bio'),
            avatarPreview: $('#persona-edit-avatar-preview'),
            btnUploadAvatar: $('#btn-upload-persona-avatar'),
            btnSavePersona: $('#btn-save-persona'),
            
            // 查看人设节点
            viewAvatar: $('#persona-view-avatar'),
            viewNickname: $('#persona-view-nickname'),
            viewRealname: $('#persona-view-realname'),
            viewBio: $('#persona-view-bio'),
            btnEditCurrent: $('#btn-edit-current-persona'),
            btnSetActive: $('#btn-set-active-persona'),
            
            // 角色相关
            btnMenuCreateCharacter: $('#btn-menu-create-character'),
            popupCreate: $('#chat-create-popup'),
            popupCharacterType: $('#chat-create-character-type-popup'),
            popupCharacterEdit: $('#character-edit-popup'),
            popupCharacterSettings: $('#character-settings-popup'),
            
            // 弹窗和UI组件
            chatAlertPopup: $('#chat-alert-popup'),
            chatAlertTitle: $('#chat-alert-title'),
            chatAlertMessage: $('#chat-alert-message'),
            chatAlertDetails: $('#chat-alert-details'),
            btnCloseAlert: $('.btn-close-alert'),

            chatPromptPopup: $('#chat-prompt-popup'),
            chatPromptContent: $('#chat-prompt-popup .chat-popup-content'),
            chatPromptTitle: $('#chat-prompt-title'),
            chatPromptInput: $('#chat-prompt-input'),
            chatPromptInputSecondary: $('#chat-prompt-input-secondary'),
            btnPromptCancel: $('.btn-prompt-cancel'),
            btnPromptOk: $('.btn-prompt-ok'),
            btnPromptExpand: $('#chat-prompt-expand-btn'),
            btnPromptExpandIcon: $('#chat-prompt-expand-btn i'),

            chatConfirmPopup: $('#chat-confirm-popup'),
            chatConfirmTitle: $('#chat-confirm-title'),
            chatConfirmMessage: $('#chat-confirm-message'),
            btnConfirmCancel: $('.btn-confirm-cancel'),
            btnConfirmOk: $('.btn-confirm-ok'),

            popupTimezoneHelp: $('#timezone-help-popup'),
            popupTimezone: $('#chat-timezone-popup'),
            timezoneSearch: $('#chat-timezone-search'),
            timezoneListContainer: $('#chat-timezone-list-container'),
            btnCloseTimezone: $('.btn-close-timezone'),

            // Header & Nav
            leftBtn: $('#chat-header-left-btn'),
            rightBtn: $('#chat-header-right-btn'),
            headerTitle: $('#chat-header-title'),
            headerSubtitle: $('#chat-header-subtitle'),
            navPills: $$('.chat-nav-pill'),
            views: $$('.chat-view'),
            
            // 样式挂载
            customStyleTag: $('#chat-custom-style-tag')
        };
    }

    initUtils() {
        // Toast 全局提示框注入
        let chatOsToast = document.getElementById('chat-os-global-toast');
        if (!chatOsToast) {
            chatOsToast = document.createElement('div');
            chatOsToast.id = 'chat-os-global-toast';
            chatOsToast.className = 'chat-os-toast';
            document.body.appendChild(chatOsToast);
        }

        window._showChatOSToast = (message, icon = 'ph-check-circle') => {
            if (!chatOsToast) return;
            const isLight = localStorage.getItem('nrj-toast-theme') === 'light';
            if (isLight) {
                chatOsToast.classList.add('theme-light');
            } else {
                chatOsToast.classList.remove('theme-light');
            }

            chatOsToast.innerHTML = `<i class="ph ${icon}"></i> <span>${message}</span>`;
            chatOsToast.classList.add('show');
            
            if (this.toastTimeout) clearTimeout(this.toastTimeout);
            this.toastTimeout = setTimeout(() => {
                chatOsToast.classList.remove('show');
            }, 2000);
        };
    }
};
