window.ChatAPI = {
    getApiSettings: function() {
        try {
            const subSaved = JSON.parse(localStorage.getItem('nrj-sub-api-settings') || '{}');
            if (subSaved.key && subSaved.url && subSaved.model) return subSaved;
            const mainSaved = JSON.parse(localStorage.getItem('nrj-api-settings') || '{}');
            if (mainSaved.key && mainSaved.url && mainSaved.model) return mainSaved;
        } catch(e) {}
        return null;
    },

    callAPI: async function(messages, settings, abortSignal = null, fallbackMaxTokens = 500, charId = null) {
        let fetchUrl = settings.url.trim();
        if (!fetchUrl.endsWith('/chat/completions')) {
            if (fetchUrl.endsWith('/')) fetchUrl += 'chat/completions';
            else fetchUrl += '/chat/completions';
        }
        
        const requestBody = {
            model: settings.model,
            messages: messages,
            temperature: settings.temperature !== undefined ? settings.temperature : 0.7
        };
        
        if (settings.topPEnabled) requestBody.top_p = settings.topP;
        if (settings.maxTokensEnabled && settings.maxTokens) requestBody.max_tokens = settings.maxTokens;
        else requestBody.max_tokens = fallbackMaxTokens;
        if (settings.presencePenaltyEnabled) requestBody.presence_penalty = settings.presencePenalty;
        if (settings.frequencyPenaltyEnabled) requestBody.frequency_penalty = settings.frequencyPenalty;

        console.log("========== [Chat API Request] ==========");
        requestBody.messages.forEach(m => {
            console.log(`[${m.role.toUpperCase()}]\n${m.content}\n----------------------------------------`);
        });

        const fetchOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${settings.key}`
            },
            body: JSON.stringify(requestBody)
        };
        
        if (abortSignal) {
            fetchOptions.signal = abortSignal;
        }
        
        const startTime = Date.now();
        let apiRecord = null;
        let responseData = null;
        let isError = false;
        let errorMsg = '';

        try {
            const response = await fetch(fetchUrl, fetchOptions);

            if (!response.ok) {
                throw new Error(`API 请求失败 (状态码: ${response.status})`);
            }

            responseData = await response.json();
            let replyText = responseData.choices[0].message.content.trim();
            console.log("========== [Chat API Response] ==========");
            console.log(replyText);
            
            apiRecord = {
                request: requestBody,
                response: responseData
            };

            return replyText;
        } catch(err) {
            isError = true;
            errorMsg = err.message;
            apiRecord = {
                request: requestBody,
                response: { error: err.message }
            };
            throw err;
        } finally {
            // 保存 API 历史记录
            if (charId && window.ImageStorageManager && window.ImageStorageManager.saveApiHistory) {
                try {
                    const charConfig = JSON.parse(localStorage.getItem(`nrj-chat-config-${charId}`) || '{}');
                    if (charConfig.enableApiHistory) {
                        const costTime = Date.now() - startTime;
                        let tokenUsage = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
                        if (responseData && responseData.usage) {
                            tokenUsage = responseData.usage;
                        }
                        
                        const record = {
                            id: 'api_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                            charId: charId,
                            timestamp: Date.now(),
                            costTime: costTime,
                            isError: isError,
                            errorMsg: errorMsg,
                            model: settings.model,
                            usage: tokenUsage,
                            data: apiRecord
                        };
                        
                        await window.ImageStorageManager.saveApiHistory(record);
                        
                        // 强制清理超出限制的旧记录
                        const limit = charConfig.apiHistoryLimit !== undefined ? charConfig.apiHistoryLimit : 50;
                        await window.ImageStorageManager.enforceApiHistoryLimit(charId, limit);
                    }
                } catch(e) {
                    console.error("保存 API 历史记录失败", e);
                }
            }
        }
    },

    extractTimezone: async function(personaText) {
        const settings = this.getApiSettings();
        if (!settings) throw new Error('NO_API');
        
        const prompt = `你是一个专业的时区判断助手。
请根据以下人物设定/背景描述，推断该角色最可能居住的城市或地区的 IANA 时区代码（例如 Asia/Shanghai, America/New_York）。
【重要规则】：
1. 如果用户只提到了国家名称（如“奥地利”、“法国”等），请你直接输出该国首都的标准 IANA 时区代码（例如 奥地利->Europe/Vienna，法国->Europe/Paris）。
2. 如果你确实无法确定，或者描述中完全没有任何国家或地点暗示，请输出 "UNKNOWN"。
3. 除了时区代码（或UNKNOWN）本身，绝对不要输出任何其他文字、标点符号或解释。

人物描述:
"${personaText}"

你的输出:`;

        const requestSettings = Object.assign({}, settings, { temperature: 0.1 });
        return await this.callAPI([{ role: "user", content: prompt }], requestSettings, null, 500);
    },

    summarizeMemory: async function(chatLog) {
        const settings = this.getApiSettings();
        if (!settings) throw new Error('NO_API');

        const prompt = `你是一个记忆总结助手。请总结以下对话记录中发生的关键事件、新揭示的设定、用户偏好和角色状态变更。
要求：
1. 提取客观事实和重要信息。
2. 语言简练，使用第三人称陈述句。
3. 如果没有重要信息，直接回复"无重要信息"。
4. 绝对不要输出任何多余的解释和寒暄。

对话记录：
${chatLog}`;

        const requestSettings = Object.assign({}, settings, { temperature: 0.3 });
        return await this.callAPI([{ role: "user", content: prompt }], requestSettings, null, 500);
    },

    compressMemory: async function(combinedMems) {
        const settings = this.getApiSettings();
        if (!settings) throw new Error('NO_API');

        const prompt = `你是一个记忆整理助手。请将以下多条碎片化的记忆记录，整理成一段连贯、结构化的高密度总结。
要求：
1. 剔除重复信息，合并相关联的事件。
2. 保持客观、精简，保留所有关键事实（事件、设定、情感转折等）。
3. 绝对不要输出任何多余的解释和寒暄。

待整理的记忆：
${combinedMems}`;

        const requestSettings = Object.assign({}, settings, { temperature: 0.3 });
        return await this.callAPI([{ role: "user", content: prompt }], requestSettings, null, 800);
    },

    chatCompletion: async function(messages, settings, abortSignal, charId = null) {
        return await this.callAPI(messages, settings, abortSignal, 500, charId);
    }
};
