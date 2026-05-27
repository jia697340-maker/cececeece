window.ChatRender = {
    // 构建引用的 HTML
    buildQuoteHtml: function(quoteStyleOption, qName, qText) {
        let previewText = qText;
        if (previewText.includes('[[IMAGE:')) previewText = '[图片]';
        else if (previewText.includes('[[VOICE:')) previewText = '[语音]';
        else if (previewText.includes('[[LOCATION:')) previewText = '[位置]';
        else if (previewText.includes('[[TRANSFER:')) previewText = '[转账]';
        
        if (quoteStyleOption === 'inside') {
            return `
                <div class="chat-bubble-quote" style="margin-top: 8px; padding: 6px 10px; font-size: 11px; border-left: 2px solid currentColor; background: rgba(128,128,128,0.1); border-radius: 4px; color: inherit; opacity: 0.8; word-break: break-all;">
                    <div style="font-weight: 600; margin-bottom: 2px; opacity: 0.8;">${qName}</div>
                    <div style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; line-height: 1.4;">${previewText}</div>
                </div>
            `;
        } else {
            return `
                <div class="chat-bubble-quote-outside" style="margin-top: 2px; padding: 6px 10px; font-size: 11px; border-radius: 6px; border-left: 3px solid rgba(156, 163, 175, 0.35); background: rgba(0, 0, 0, 0.04); color: var(--text-secondary); word-break: break-all; width: fit-content; min-width: 80px; max-width: 100%; box-sizing: border-box;">
                    <div style="font-weight: 600; margin-bottom: 2px; color: var(--text-color); opacity: 0.85;">${qName}</div>
                    <div style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; line-height: 1.4; opacity: 0.9;">${previewText}</div>
                </div>
            `;
        }
    },

    // 渲染系统撤回消息
    renderRecallBubble: function(msgObj, charNameStr) {
        let recallName = msgObj.isUserRecall ? '你' : charNameStr;
        return `<div class="chat-recall-bubble" style="background: rgba(0,0,0,0.05); color: var(--text-secondary); font-size: 12px; padding: 6px 12px; border-radius: 12px; display: inline-flex; align-items: center; gap: 4px; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='rgba(0,0,0,0.08)'" onmouseout="this.style.background='rgba(0,0,0,0.05)'" onclick="window._currentChatOSAlert('被撤回的内容', decodeURIComponent('${encodeURIComponent(msgObj.recallContent)}'))"><i class="ph ph-arrow-counter-clockwise"></i> ${recallName} 撤回了一条消息</div>`;
    },

    // 渲染图片消息
    renderImageBubble: function(imageText) {
        return `
            <div class="chat-image-bubble-inner" data-imgtext="${imageText.replace(/"/g, '"')}" style="cursor: pointer; display: flex; align-items: center; justify-content: center; width: 150px; height: 150px; background-color: #E5E5EA; border-radius: 8px; overflow: hidden; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.05);">
                <i class="ph ph-image" style="font-size: 48px; color: #8E8E93;"></i>
            </div>
        `;
    },

    // 渲染语音消息
    renderVoiceBubble: function(voiceText, voiceWaveEnabled) {
        return `
            <div class="chat-voice-bubble-inner" style="display: flex; flex-direction: column; gap: 4px; padding: 2px 6px; cursor: pointer;" onclick="var t=this.querySelector('.voice-text'); t.style.display=t.style.display==='none'?'block':'none';">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="height: 16px; width: 40px; display: flex; align-items: center; gap: 2px;" class="${voiceWaveEnabled ? 'voice-wave-active' : ''}">
                        <div style="width: 3px; height: 40%; background: currentColor; border-radius: 2px; opacity: 0.6;"></div>
                        <div style="width: 3px; height: 80%; background: currentColor; border-radius: 2px; opacity: 0.8;"></div>
                        <div style="width: 3px; height: 100%; background: currentColor; border-radius: 2px;"></div>
                        <div style="width: 3px; height: 60%; background: currentColor; border-radius: 2px; opacity: 0.7;"></div>
                        <div style="width: 3px; height: 30%; background: currentColor; border-radius: 2px; opacity: 0.5;"></div>
                    </div>
                    <span style="font-size: 13px; font-weight: 500; margin-left: 4px;">${Math.max(1, Math.ceil(voiceText.length / 4))}"</span>
                </div>
                <div class="voice-text" style="font-size: 12px; opacity: 0.8; margin-top: 6px; padding-top: 6px; border-top: 1px dashed rgba(128,128,128,0.3); line-height: 1.4; font-weight: normal; display: none; word-break: break-all;">
                    ${voiceText}
                </div>
            </div>
        `;
    },

    // 渲染位置消息
    renderLocationBubble: function(locText) {
        return `
            <div class="chat-location-bubble-inner" data-loctext="${locText.replace(/"/g, '"')}" style="cursor: pointer; display: flex; flex-direction: column; width: 220px; background-color: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); color: #333;">
                <div style="padding: 10px 12px; display: flex; flex-direction: column; gap: 4px;">
                    <div style="font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">位置</div>
                    <div style="font-size: 11px; color: #999; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; line-height: 1.4;">${locText}</div>
                </div>
                <div style="height: 70px; background-color: #e5e5ea; display: flex; align-items: center; justify-content: center; position: relative;">
                    <i class="ph-fill ph-map-pin" style="font-size: 32px; color: #FF3B30; position: relative; z-index: 2; top: -4px;"></i>
                    <div style="position: absolute; width: 14px; height: 6px; background: rgba(0,0,0,0.1); border-radius: 50%; bottom: 15px; z-index: 1;"></div>
                </div>
            </div>
        `;
    },

    // 渲染发起转账消息
    renderTransferBubble: function(amount, remark, status, tId, type) {
        status = status || 'PENDING';
        let bgColor = '#FF9800';
        let iconHtml = '<i class="ph ph-currency-cny" style="font-size: 20px;"></i>';
        let statusText = '微信转账';
        let opacity = '1';

        if (status === 'RECEIVED') {
            opacity = '0.7';
            statusText = '已收款';
            iconHtml = '<i class="ph ph-check-circle" style="font-size: 20px;"></i>';
        } else if (status === 'RETURNED') {
            opacity = '0.7';
            bgColor = '#F44336';
            statusText = '已退款';
            iconHtml = '<i class="ph ph-x-circle" style="font-size: 20px;"></i>';
        }

        return `
            <div class="chat-transfer-bubble-inner" data-tid="${tId || ''}" data-status="${status}" data-amount="${amount}" style="cursor: ${status === 'PENDING' && type === 'them' ? 'pointer' : 'default'};">
                <div style="background-color: ${bgColor}; opacity: ${opacity}; padding: 12px 16px; min-width: 200px; display: flex; align-items: center; gap: 12px; color: #fff; box-sizing: border-box; text-align: left;">
                    <div style="background: rgba(255,255,255,0.2); border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        ${iconHtml}
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-size: 16px; font-weight: 600; margin-bottom: 2px;">¥ ${amount}</div>
                        <div style="font-size: 12px; opacity: 0.9; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${remark || '转账'}</div>
                    </div>
                </div>
                <div style="background: #fff; opacity: ${opacity}; padding: 4px 12px; font-size: 11px; color: ${bgColor}; text-align: left; border-top: 1px solid rgba(0,0,0,0.05);">
                    ${statusText}
                </div>
            </div>
        `;
    },

    // 渲染转账回执消息
    renderTransferReceiptBubble: function(amount, status, tId) {
        let bgColor = '#FF9800';
        let iconHtml = '<i class="ph ph-check-circle" style="font-size: 20px;"></i>';
        let statusText = '已收款';
        let opacity = '0.7';

        if (status === 'RETURNED') {
            bgColor = '#F44336';
            statusText = '已退还';
            iconHtml = '<i class="ph ph-x-circle" style="font-size: 20px;"></i>';
        }

        return `
            <div style="background-color: ${bgColor}; opacity: ${opacity}; padding: 12px 16px; min-width: 200px; display: flex; align-items: center; gap: 12px; color: #fff; box-sizing: border-box; text-align: left;">
                <div style="background: rgba(255,255,255,0.2); border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    ${iconHtml}
                </div>
                <div style="flex: 1; min-width: 0;">
                    <div style="font-size: 16px; font-weight: 600; margin-bottom: 2px;">¥ ${amount}</div>
                    <div style="font-size: 12px; opacity: 0.9; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">微信转账</div>
                </div>
            </div>
            <div style="background: #fff; opacity: ${opacity}; padding: 4px 12px; font-size: 11px; color: ${bgColor}; text-align: left; border-top: 1px solid rgba(0,0,0,0.05);">
                ${statusText}
            </div>
        `;
    },
    
    // 生成一条完整的气泡 HTML
    generateBubbleHtml: function(params) {
        const {
            type, text, persona, isTyping, msgObj, indexInHistory,
            charConfig, activeUser,
            quoteStyleOption, bubbleStyle, bColors, voiceWaveEnabled, avatarDisplay,
            charAvatarShape, userAvatarShape,
            msgTimePos, msgTimeFormat, timeStr
        } = params;

        let html = '';
        
        // 注入复选框
        if (indexInHistory !== -1) {
            html += `<div class="msg-checkbox"></div>`;
        }

        let isMultiGreeting = msgObj && msgObj.isGreeting && msgObj.greetings && msgObj.greetings.length > 1;
        
        let bubbleClass = 'chat-bubble';
        if (bubbleStyle === 'ios') bubbleClass += ' bubble-style-ios';
        if (bubbleStyle === 'wechat') bubbleClass += ' bubble-style-wechat';
        if (bubbleStyle === 'square') bubbleClass += ' bubble-style-square';
        
        // 头像逻辑
        let avatarHtmlThem = '';
        let avatarHtmlMe = '';

        let avatarTimeHtml = (timeStr && msgTimePos === 'avatar') ? `<div style="font-size: 10px; color: var(--text-secondary); opacity: 0.8; margin-top: 4px; text-align: center; width: 100%; white-space: nowrap; font-family: monospace;">${timeStr}</div>` : '';

        let charAvatarCustomStyle = charAvatarShape ? charAvatarShape : '';
        let userAvatarCustomStyle = userAvatarShape ? userAvatarShape : '';

        if (type === 'them' && persona && avatarDisplay !== 'hide_them' && avatarDisplay !== 'hide_both') {
            avatarHtmlThem = `<div class="chat-bubble-avatar-wrapper" style="display: flex; flex-direction: column; align-items: center;"><div class="chat-bubble-avatar" style="background-color: ${persona.color}; color: ${persona.textColor}; ${charAvatarCustomStyle}">${persona.initials}</div>${avatarTimeHtml}</div>`;
            if (persona.avatarUrl) {
                avatarHtmlThem = `<div class="chat-bubble-avatar-wrapper" style="display: flex; flex-direction: column; align-items: center;"><img src="${persona.avatarUrl}" class="chat-bubble-avatar" style="object-fit: cover; ${charAvatarCustomStyle}">${avatarTimeHtml}</div>`;
            }
        }

        if (type === 'me' && avatarDisplay !== 'hide_me' && avatarDisplay !== 'hide_both') {
            const myName = activeUser.nickname || activeUser.realname || '我';
            const myInitials = myName.charAt(0);
            const uniqueId = 'me-avatar-' + Date.now() + '-' + Math.random().toString(36).substr(2,9);
            
            avatarHtmlMe = `<div class="chat-bubble-avatar-wrapper" style="display: flex; flex-direction: column; align-items: center;"><div class="chat-bubble-avatar me-avatar-placeholder" id="${uniqueId}" data-userid="${activeUser.id}" style="background-color: #111; color: #fff; ${userAvatarCustomStyle}">${myInitials}</div>${avatarTimeHtml}</div>`;
            
            // 异步替换头像 (由调用方在插入 DOM 后执行处理，这里我们暴露出来)
            setTimeout(() => {
                if (window.ImageStorageManager && activeUser.id) {
                    window.ImageStorageManager.loadFromIndexedDB(`persona-avatar-${activeUser.id}`).then(url => {
                        const el = document.getElementById(uniqueId);
                        if (el && url && url !== 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7') {
                            const img = document.createElement('img');
                            img.src = url;
                            img.className = 'chat-bubble-avatar';
                            img.style.objectFit = 'cover';
                            if (userAvatarCustomStyle) img.style.cssText = `object-fit: cover; ${userAvatarCustomStyle}`;
                            el.replaceWith(img);
                        }
                    }).catch(()=>{});
                }
            }, 0);
        }

        let timeHtmlBubble = '';
        if (timeStr) {
            let shouldShowBubbleTime = msgTimePos === 'bubble';
            if (msgTimePos === 'avatar') {
                if (type === 'them' && (avatarDisplay === 'hide_them' || avatarDisplay === 'hide_both')) shouldShowBubbleTime = true;
                if (type === 'me' && (avatarDisplay === 'hide_me' || avatarDisplay === 'hide_both')) shouldShowBubbleTime = true;
            }
            if (shouldShowBubbleTime) {
                timeHtmlBubble = `<div style="font-size: 10px; color: var(--text-secondary); opacity: 0.6; margin-top: 2px; padding: 0 4px; ${type === 'me' ? 'text-align: right;' : 'text-align: left;'}">${timeStr}</div>`;
            }
        }
        
        let colorStyleStr = '';
        if (type === 'them') {
            colorStyleStr = `--chat-them-bg: ${bColors.themBg}; --chat-them-text: ${bColors.themText};`;
        } else if (type === 'system') {
            colorStyleStr = '';
        } else {
            colorStyleStr = `--chat-me-bg: ${bColors.meBg}; --chat-me-text: ${bColors.meText};`;
        }

        let displayText = text;
        let quoteHtml = '';

        const quoteRegex = /\n?\[\[QUOTE:([^|]+)\|([^\]]+)\]\]/g;
        if (displayText.match(quoteRegex)) {
            displayText = displayText.replace(quoteRegex, (match, qName, qBase64) => {
                try {
                    const qText = decodeURIComponent(escape(window.atob(qBase64)));
                    quoteHtml = this.buildQuoteHtml(quoteStyleOption, qName, qText);
                } catch (e) {}
                return '';
            });
        }

        const quoteTextRegex = /\n?\[\[QUOTE_TEXT:([^|]+)\|([^\]]+)\]\]/g;
        if (displayText.match(quoteTextRegex)) {
            displayText = displayText.replace(quoteTextRegex, (match, qName, qText) => {
                quoteHtml = this.buildQuoteHtml(quoteStyleOption, qName, qText);
                return '';
            });
        }

        if (type === 'system') {
            const userNameStr = '你'; 
            const charNameStr = (persona && (persona.rawCharData || persona).nickname) || (persona && (persona.rawCharData || persona).realname) || '对方';
            
            if (msgObj && (msgObj.isUserRecall || msgObj.isAiRecall)) {
                displayText = this.renderRecallBubble(msgObj, charNameStr);
                bubbleClass = '';
                colorStyleStr = 'padding: 0 !important; background: transparent !important; border: none !important; box-shadow: none !important;';
            } else {
                displayText = text.replace(/{{user}}/gi, userNameStr).replace(/{{char}}/gi, charNameStr);
            }
        }

        const transferRegex = /\[\[TRANSFER:([^|]+)\|([^|]+)(?:\|([^|]+)\|([^\]]+))?\]\]/g;
        const voiceRegex = /\[\[VOICE:(.*?)\]\]/g;
        const imageRegex = /\[\[IMAGE:(.*?)\]\]/g;
        const locationRegex = /\[\[LOCATION:(.*?)\]\]/g;
        const transferReceiptRegex = /\[\[TRANSFER_RECEIPT:([^|]+)\|([^|]+)(?:\|([^\]]+))?\]\]/g;
        const emojiRegex = /\[\[EMOJI:([^|\]]+)(?:\|([^\]]+))?\]\]/g;
        
        // 自定义表情渲染处理
        if (text.match(emojiRegex)) {
            const emojis = [];
            try {
                emojis.push(...JSON.parse(localStorage.getItem('nrj-custom-emojis') || '[]'));
            } catch(e) {}
            
            displayText = text.replace(emojiRegex, (match, emojiId, emojiName) => {
                const found = emojis.find(e => e.id === emojiId);
                if (found) {
                    const uniqueId = 'emoji-img-' + Date.now() + '-' + Math.random().toString(36).substr(2,9);
                    let src = found.type === 'url' ? found.url : 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                    
                    if (found.type === 'local') {
                        setTimeout(() => {
                            if (window.ImageStorageManager) {
                                window.ImageStorageManager.loadFromIndexedDB(found.id).then(data => {
                                    if (data) {
                                        const el = document.getElementById(uniqueId);
                                        if (el) el.src = data;
                                    }
                                }).catch(()=>{});
                            }
                        }, 0);
                    }
                    
                    return `<img id="${uniqueId}" src="${src}" style="width: 100px; height: 100px; object-fit: contain; vertical-align: middle; background: transparent;" alt="${found.name || emojiName || '表情'}">`;
                }
                return match;
            });
            
            // 如果只有表情没有其他文字，去掉气泡背景
            const textWithoutEmoji = text.replace(emojiRegex, '').trim();
            if (textWithoutEmoji === '') {
                bubbleClass = 'chat-bubble';
                colorStyleStr = 'padding: 0 !important; background: transparent !important; border: none !important; box-shadow: none !important;';
            }
        }

        if (text.match(imageRegex)) {
            displayText = text.replace(imageRegex, (match, imageText) => this.renderImageBubble(imageText));
            bubbleClass = 'chat-bubble';
            colorStyleStr = 'padding: 0 !important; overflow: hidden; background: transparent !important; border: none !important; box-shadow: none !important;';
        } else if (text.match(voiceRegex)) {
            displayText = text.replace(voiceRegex, (match, voiceText) => this.renderVoiceBubble(voiceText, voiceWaveEnabled));
        } else if (text.match(locationRegex)) {
            displayText = text.replace(locationRegex, (match, locText) => this.renderLocationBubble(locText));
            bubbleClass = 'chat-bubble';
            colorStyleStr = 'padding: 0 !important; overflow: hidden; background: transparent !important; border: none !important; box-shadow: none !important;';
        } else if (text.match(transferRegex)) {
            displayText = text.replace(transferRegex, (match, amount, remark, status, tId) => this.renderTransferBubble(amount, remark, status, tId, type));
            bubbleClass = 'chat-bubble';
            colorStyleStr = '--chat-them-bg: #FF9800; --chat-me-bg: #FF9800; padding: 0 !important; overflow: hidden; border: 1px solid transparent; border-radius: 8px !important;';
        } else if (text.match(transferReceiptRegex)) {
            displayText = text.replace(transferReceiptRegex, (match, amount, status, tId) => this.renderTransferReceiptBubble(amount, status, tId));
            bubbleClass = 'chat-bubble';
            colorStyleStr = '--chat-them-bg: #FF9800; --chat-me-bg: #FF9800; padding: 0 !important; overflow: hidden; border: 1px solid transparent; border-radius: 8px !important;';
        }

        let bubbleContentHtml = '';

        if (isMultiGreeting) {
            let currentIndex = msgObj.greetingIndex + 1;
            let totalGreetings = msgObj.greetings.length;
            bubbleContentHtml = `
                <div class="chat-bubble-group" style="display: flex; flex-direction: column; gap: 4px; max-width: 100%;">
                    <div class="${bubbleClass}" style="max-width: 100%; ${colorStyleStr}">
                        <div class="chat-bubble-text" style="position: relative; z-index: 10;">${displayText}${quoteStyleOption === 'inside' ? quoteHtml : ''}</div>
                    </div>
                    ${quoteStyleOption === 'outside' ? quoteHtml : ''}
                    <div class="greeting-nav-container" style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                        <button class="greeting-arrow left-arrow" data-idx="${indexInHistory}"><i class="ph ph-caret-left"></i></button>
                        <span class="greeting-indicator" style="font-size: 12px; font-weight: 600; color: #9ca3af; font-family: monospace;">${currentIndex} / ${totalGreetings}</span>
                        <button class="greeting-arrow right-arrow" data-idx="${indexInHistory}"><i class="ph ph-caret-right"></i></button>
                    </div>
                </div>
            `;
        } else {
            if (quoteStyleOption === 'outside' && quoteHtml) {
                let align = type === 'me' ? 'flex-end' : 'flex-start';
                bubbleContentHtml = `
                    <div style="display: flex; flex-direction: column; gap: 2px; max-width: 100%; align-items: ${align};">
                        <div class="${bubbleClass}" style="width: fit-content; max-width: 100%; ${colorStyleStr}">
                            <div class="chat-bubble-text" style="position: relative; z-index: 10;">${displayText}</div>
                        </div>
                        ${quoteHtml}
                    </div>
                `;
            } else {
                bubbleContentHtml = `
                    <div class="${bubbleClass}" style="${colorStyleStr}">
                        <div class="chat-bubble-text" style="position: relative; z-index: 10;">${displayText}${quoteHtml}</div>
                    </div>
                `;
            }
        }
        
        let alignWrapper = type === 'me' ? 'flex-end' : 'flex-start';
        if (type === 'system') {
            html += `<div class="chat-bubble-content-wrapper" style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; width: 100%;">${bubbleContentHtml}</div>`;
        } else {
            html += avatarHtmlThem;
            html += `<div class="chat-bubble-content-wrapper" style="display: flex; flex-direction: column; align-items: ${alignWrapper}; gap: 4px; max-width: 75%; flex: 1;">`;
            html += bubbleContentHtml;
            html += timeHtmlBubble;
            html += `</div>`;
            html += avatarHtmlMe;
        }
        
        return html;
    }
};
