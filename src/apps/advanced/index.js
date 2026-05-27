window.SystemApps = window.SystemApps || {};

window.DEFAULT_SYSTEM_PROMPT = `你的真名是 {char_realname}，对方给你取的昵称是 {char_nickname}。

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
你不说"作为AI……"，不用任何客服或助理的语气。`;

window.SystemApps['advanced'] = {
    html: `
        <div id="advanced-modal" class="settings-modal">
            <div class="settings-backdrop" id="advanced-backdrop"></div>
            
            <div class="settings-container">
                <!-- Header -->
                <header class="settings-header">
                    <h1 class="settings-header-title">高级设置</h1>
                    <button class="settings-close-btn" id="advanced-close-btn">✕</button>
                </header>

                <!-- Main Content -->
                <main class="settings-main" id="advanced-settings-body">
                    
                    <!-- 核心设定 Section -->
                    <div class="settings-section">
                        <h2 class="settings-section-title">核心模型设定</h2>
                        <div class="settings-card">
                            <div class="settings-item" id="btn-edit-global-prompt" style="cursor: pointer;">
                                <div class="settings-item-icon">
                                    <i class="ph-bold ph-terminal-window"></i>
                                </div>
                                <div class="settings-item-content">
                                    <p class="settings-item-title">全局系统提示词 (System Prompt)</p>
                                    <p class="settings-item-desc">自定义模型的基础行为逻辑与规则</p>
                                </div>
                                <div class="settings-item-right">
                                    <i class="ph-bold ph-caret-right" style="color: #999;"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 开发者选项 Section -->
                    <div class="settings-section">
                        <h2 class="settings-section-title">开发者选项</h2>
                        <div class="settings-card">
                            
                            <!-- 手动安装 PWA -->
                            <div class="settings-item" id="manual-install-pwa" style="cursor: pointer;">
                                <div class="settings-item-icon">
                                    <i class="ph-bold ph-download-simple"></i>
                                </div>
                                <div class="settings-item-content">
                                    <p class="settings-item-title">安装 PWA</p>
                                    <p class="settings-item-desc">手动拉起安装弹窗</p>
                                </div>
                                <div class="settings-item-right">
                                    <i class="ph-bold ph-caret-right" style="color: #999;"></i>
                                </div>
                            </div>

                            <!-- PWA 安装提示开关 -->
                            <div class="settings-item">
                                <div class="settings-item-icon">
                                    <i class="ph-bold ph-bell-ringing"></i>
                                </div>
                                <div class="settings-item-content">
                                    <p class="settings-item-title">PWA 安装提示</p>
                                    <p class="settings-item-desc">若未安装应用，每次进入弹窗提示安装</p>
                                </div>
                                <div class="settings-item-right">
                                    <button type="button" class="settings-toggle" id="toggle-pwa-prompt">
                                        <span class="settings-toggle-slider"></span>
                                    </button>
                                </div>
                            </div>
                            
                            <!-- 预留项目 -->
                            <div class="settings-item" style="cursor: default;">
                                <div class="settings-item-icon">
                                    <i class="ph-bold ph-flask"></i>
                                </div>
                                <div class="settings-item-content">
                                    <p class="settings-item-title">实验性功能</p>
                                    <p class="settings-item-desc">更多高级功能敬请期待</p>
                                </div>
                            </div>
                            
                        </div>
                    </div>

                </main>
            </div>

            <!-- 全局系统提示词编辑弹窗 -->
            <div class="settings-backdrop" id="global-prompt-backdrop" style="display: none; z-index: 100; background-color: rgba(0, 0, 0, 0.4);"></div>
            <div id="global-prompt-modal" class="settings-container" style="display: none; z-index: 101; position: absolute; top: 5%; bottom: 5%; left: 5%; right: 5%; width: auto; max-width: none; background: #ffffff; border-radius: 16px; flex-direction: column; box-shadow: 0 20px 40px rgba(0,0,0,0.15); overflow: hidden; height: 90%;">
                <header class="settings-header" style="flex-shrink: 0; background: #f8f8f8; border-bottom: 1px solid rgba(0,0,0,0.05); padding: 12px 16px;">
                    <h1 class="settings-header-title" style="font-weight: 600; font-size: 16px; color: #111;">全局系统提示词</h1>
                    <button class="settings-close-btn" id="global-prompt-close-btn" style="background: rgba(0,0,0,0.05); border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; color: #666; font-size: 14px;">✕</button>
                </header>
                <div class="settings-main" style="flex: 1; padding: 16px; display: flex; flex-direction: column; gap: 16px; overflow-y: auto; background: #ffffff;">
                    <div style="flex-shrink: 0; background: rgba(0,0,0,0.02); padding: 12px; border-radius: 12px; border: 1px solid rgba(0,0,0,0.04);">
                        <div style="font-size: 12px; font-weight: 600; color: #666; margin-bottom: 8px;">支持的变量：</div>
                        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                            <span style="background: #fff; border: 1px solid #ddd; padding: 2px 6px; border-radius: 4px; font-size: 11px; color: #333; font-family: monospace;">{char_realname}</span>
                            <span style="background: #fff; border: 1px solid #ddd; padding: 2px 6px; border-radius: 4px; font-size: 11px; color: #333; font-family: monospace;">{char_nickname}</span>
                            <span style="background: #fff; border: 1px solid #ddd; padding: 2px 6px; border-radius: 4px; font-size: 11px; color: #333; font-family: monospace;">{char_persona}</span>
                            <span style="background: #fff; border: 1px solid #ddd; padding: 2px 6px; border-radius: 4px; font-size: 11px; color: #333; font-family: monospace;">{worldbook_entries}</span>
                            <span style="background: #fff; border: 1px solid #ddd; padding: 2px 6px; border-radius: 4px; font-size: 11px; color: #333; font-family: monospace;">{long_term_memory}</span>
                            <span style="background: #fff; border: 1px solid #ddd; padding: 2px 6px; border-radius: 4px; font-size: 11px; color: #333; font-family: monospace;">{user_identity_info}</span>
                            <span style="background: #fff; border: 1px solid #ddd; padding: 2px 6px; border-radius: 4px; font-size: 11px; color: #333; font-family: monospace;">{user_bio}</span>
                            <span style="background: #fff; border: 1px solid #ddd; padding: 2px 6px; border-radius: 4px; font-size: 11px; color: #333; font-family: monospace;">{user_time_info}</span>
                            <span style="background: #fff; border: 1px solid #ddd; padding: 2px 6px; border-radius: 4px; font-size: 11px; color: #333; font-family: monospace;">{char_time_info}</span>
                            <span style="background: #fff; border: 1px solid #ddd; padding: 2px 6px; border-radius: 4px; font-size: 11px; color: #333; font-family: monospace;">{time_since_last_message}</span>
                        </div>
                    </div>
                    <textarea id="global-prompt-textarea" style="flex: 1; width: 100%; min-height: 200px; border: 1px solid rgba(0,0,0,0.1); border-radius: 12px; padding: 16px; background: #fafafa; color: #111; font-size: 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; resize: none; outline: none; box-sizing: border-box; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02); transition: border-color 0.2s;" onfocus="this.style.borderColor='#111'; this.style.background='#fff';" onblur="this.style.borderColor='rgba(0,0,0,0.1)'; this.style.background='#fafafa';"></textarea>
                </div>
                <div style="flex-shrink: 0; padding: 16px; border-top: 1px solid rgba(0,0,0,0.05); background: #ffffff; display: flex; gap: 12px;">
                    <button id="btn-reset-global-prompt" style="flex: 1; padding: 12px; background: transparent; border: 1px solid rgba(0,0,0,0.1); border-radius: 10px; color: #333; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(0,0,0,0.02)'" onmouseout="this.style.background='transparent'">恢复默认</button>
                    <button id="btn-save-global-prompt" style="flex: 2; padding: 12px; background: #111; border: none; border-radius: 10px; color: #fff; font-size: 14px; font-weight: 600; cursor: pointer; transition: transform 0.1s, opacity 0.2s;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'" onmousedown="this.style.transform='scale(0.98)'" onmouseup="this.style.transform='scale(1)'">保存更改</button>
                </div>
            </div>
        </div>
    `,

    init: function(closeCallback, container) {
        // 绑定关闭事件
        const closeBtn = container.querySelector('#advanced-close-btn');
        const backdrop = container.querySelector('#advanced-backdrop');
        
        if (closeBtn) closeBtn.addEventListener('click', closeCallback);
        if (backdrop) backdrop.addEventListener('click', closeCallback);

        // 初始化手动安装 PWA 按钮
        const manualInstallBtn = container.querySelector('#manual-install-pwa');
        if (manualInstallBtn) {
            manualInstallBtn.addEventListener('click', async () => {
                if (window.deferredPrompt) {
                    window.deferredPrompt.prompt();
                    const { outcome } = await window.deferredPrompt.userChoice;
                    console.log(`User response to the manual install prompt: ${outcome}`);
                    if (outcome === 'accepted') {
                        window.deferredPrompt = null;
                    }
                } else {
                    // 如果 deferredPrompt 不存在，可能已经安装或环境不支持
                    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
                    if (isStandalone) {
                        alert('您已经安装了此应用。');
                    } else {
                        alert('当前环境不支持或尚未准备好安装 PWA。您可以尝试在浏览器菜单中寻找“添加到主屏幕”选项。');
                    }
                }
            });
        }

        // 初始化全局系统提示词逻辑
        const btnEditGlobalPrompt = container.querySelector('#btn-edit-global-prompt');
        const globalPromptBackdrop = container.querySelector('#global-prompt-backdrop');
        const globalPromptModal = container.querySelector('#global-prompt-modal');
        const globalPromptCloseBtn = container.querySelector('#global-prompt-close-btn');
        const globalPromptTextarea = container.querySelector('#global-prompt-textarea');
        const btnResetGlobalPrompt = container.querySelector('#btn-reset-global-prompt');
        const btnSaveGlobalPrompt = container.querySelector('#btn-save-global-prompt');

        const closeGlobalPromptModal = () => {
            globalPromptBackdrop.style.display = 'none';
            globalPromptModal.style.display = 'none';
        };

        if (btnEditGlobalPrompt) {
            btnEditGlobalPrompt.addEventListener('click', () => {
                const savedPrompt = localStorage.getItem('nrj-global-system-prompt');
                globalPromptTextarea.value = savedPrompt || window.DEFAULT_SYSTEM_PROMPT || '';
                globalPromptBackdrop.style.display = 'block';
                globalPromptModal.style.display = 'flex';
            });
        }

        if (globalPromptCloseBtn) globalPromptCloseBtn.addEventListener('click', closeGlobalPromptModal);
        if (globalPromptBackdrop) globalPromptBackdrop.addEventListener('click', closeGlobalPromptModal);

        if (btnResetGlobalPrompt) {
            btnResetGlobalPrompt.addEventListener('click', () => {
                if (confirm('确定要恢复为系统默认提示词吗？当前修改将会丢失。')) {
                    globalPromptTextarea.value = window.DEFAULT_SYSTEM_PROMPT || '';
                }
            });
        }

        if (btnSaveGlobalPrompt) {
            btnSaveGlobalPrompt.addEventListener('click', () => {
                const val = globalPromptTextarea.value.trim();
                if (val) {
                    localStorage.setItem('nrj-global-system-prompt', val);
                    alert('保存成功！');
                    closeGlobalPromptModal();
                } else {
                    alert('提示词不能为空！');
                }
            });
        }

        // 初始化 PWA 安装提示开关
        const togglePwaPrompt = container.querySelector('#toggle-pwa-prompt');
        if (togglePwaPrompt) {
            // 默认开启
            const isPwaPromptEnabled = localStorage.getItem('nrj-pwa-prompt-enabled') !== 'false';
            
            if (isPwaPromptEnabled) {
                togglePwaPrompt.classList.add('active');
            }

            togglePwaPrompt.addEventListener('click', () => {
                togglePwaPrompt.classList.toggle('active');
                const isActive = togglePwaPrompt.classList.contains('active');
                localStorage.setItem('nrj-pwa-prompt-enabled', isActive);
            });
        }
    },

    destroy: function(container) {
        console.log('Advanced Settings app destroyed');
    }
};
