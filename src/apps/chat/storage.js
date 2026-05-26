window.ChatStorage = {
    getMemory: function(charId) {
        return JSON.parse(localStorage.getItem(`nrj-chat-memory-${charId}`) || '[]');
    },
    
    saveMemory: function(charId, mems) {
        localStorage.setItem(`nrj-chat-memory-${charId}`, JSON.stringify(mems));
    },

    loadPersonas: function() {
        return JSON.parse(localStorage.getItem('nrj-chat-personas') || '[]');
    },
    
    savePersonas: function(personas) {
        localStorage.setItem('nrj-chat-personas', JSON.stringify(personas));
    },
    
    getActivePersonaId: function() {
        return localStorage.getItem('nrj-chat-active-persona');
    },
    
    setActivePersonaId: function(id) {
        localStorage.setItem('nrj-chat-active-persona', id);
    },

    getChatHistory: function(charId) {
        return JSON.parse(localStorage.getItem(`nrj-chat-history-${charId}`) || '[]');
    },
    
    saveChatHistory: function(charId, history) {
        localStorage.setItem(`nrj-chat-history-${charId}`, JSON.stringify(history));
    },

    loadCharacters: function() {
        return JSON.parse(localStorage.getItem('nrj-chat-characters') || '[]');
    },
    
    saveCharacters: function(chars) {
        localStorage.setItem('nrj-chat-characters', JSON.stringify(chars));
    },

    getTimeSince: function(lastTime) {
        if (!lastTime) return "这是你们的第一次聊天";
        const diffMs = Date.now() - lastTime;
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return "刚刚";
        if (diffMins < 60) return `${diffMins}分钟前`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}小时前`;
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 30) return `${diffDays}天前`;
        const diffMonths = Math.floor(diffDays / 30);
        return `${diffMonths}个月前`;
    },

    formatTimeForZone: function(code) {
        if (!code) return new Date().toLocaleString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit' });
        try {
            return new Date().toLocaleString('zh-CN', { timeZone: code, hour12: false, hour: '2-digit', minute: '2-digit' });
        } catch(e) {
            return '--:--';
        }
    },

    estimateTokens: function(text) {
        if (!text) return 0;
        let count = 0;
        for (let i = 0; i < text.length; i++) {
            const charCode = text.charCodeAt(i);
            if (charCode > 255) {
                count += 1.5;
            } else {
                count += 0.3;
            }
        }
        return Math.ceil(count);
    }
};
