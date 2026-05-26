window.SystemApps = window.SystemApps || {};

window.SystemApps['api'] = {
    html: `
        <div id="api-modal" class="settings-modal">
            <div class="settings-backdrop" id="api-backdrop"></div>
            
            <div class="settings-container">
                <!-- Header -->
                <header class="settings-header">
                    <h1 class="settings-header-title">API 设置</h1>
                    <button class="settings-close-btn" id="api-close-btn">✕</button>
                </header>

                <!-- Main Content -->
                <main class="settings-main">
                    
                    <!-- 预设方案 Section -->
                    <div class="settings-section" style="margin-top: 10px;">
                        <h2 class="settings-section-title">预设方案</h2>
                        <div class="settings-card" style="padding: 16px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                <span style="font-size: 13px; font-weight: 500; color: #18181b;">API 配置预设</span>
                                <button id="btn-save-preset" class="minimal-btn" style="padding: 4px 10px; font-size: 11px;">+ 保存当前</button>
                            </div>
                            <div style="display: flex; gap: 8px;">
                                <select id="api-preset-select" class="minimal-select" style="padding: 10px 12px;">
                                    <option value="">-- 选择方案 --</option>
                                </select>
                                <button id="btn-apply-preset" class="minimal-btn minimal-btn-primary" style="padding: 8px 12px;">应用</button>
                                <button id="btn-delete-preset" class="minimal-btn minimal-btn-danger" style="padding: 8px 12px; display: none;">删除</button>
                            </div>
                        </div>
                    </div>

                    <!-- 基础配置 Section -->
                    <div class="settings-section">
                        <h2 class="settings-section-title">基础配置 (主 API)</h2>
                        <div class="settings-card">
                            
                            <div class="settings-item" style="flex-direction: column; align-items: stretch; cursor: default;">
                                <div class="settings-item-content" style="margin-bottom: 12px;">
                                    <p class="settings-item-title">AI 服务商</p>
                                </div>
                                <div class="api-provider-selector">
                                    <button class="provider-btn active" data-provider="deepseek">DeepSeek</button>
                                    <button class="provider-btn" data-provider="google">Google</button>
                                    <button class="provider-btn" data-provider="claude">Claude</button>
                                    <button class="provider-btn" data-provider="openai">OpenAI</button>
                                    <button class="provider-btn" data-provider="glm">GLM (智谱)</button>
                                    <button class="provider-btn" data-provider="qwen">Qwen (通义)</button>
                                    <button class="provider-btn" data-provider="moonshot">Moonshot</button>
                                    <button class="provider-btn" data-provider="custom">自定义</button>
                                </div>
                            </div>

                            <div class="settings-item" style="flex-direction: column; align-items: stretch; cursor: default;">
                                <div class="settings-item-content" style="margin-bottom: 12px;">
                                    <p class="settings-item-title">API 地址 (Base URL)</p>
                                </div>
                                <input type="text" id="api-base-url" class="minimal-input" placeholder="例如: https://api.deepseek.com/v1">
                            </div>

                            <div class="settings-item" style="flex-direction: column; align-items: stretch; cursor: default;">
                                <div class="settings-item-content" style="margin-bottom: 12px;">
                                    <p class="settings-item-title">API 密钥 (API Key)</p>
                                </div>
                                <div style="position: relative; width: 100%;">
                                    <input type="password" id="api-key" class="minimal-input" style="padding-right: 40px;" placeholder="sk-...">
                                    <button id="toggle-pwd-btn" class="pwd-toggle-btn">
                                        <i class="ph-bold ph-eye"></i>
                                    </button>
                                </div>
                            </div>

                            <div class="settings-item" style="flex-direction: column; align-items: stretch; cursor: default;">
                                <div class="settings-item-content" style="margin-bottom: 12px;">
                                    <p class="settings-item-title">模型名称 (Model)</p>
                                </div>
                                <input type="text" id="api-model" class="minimal-input" placeholder="例如: deepseek-chat" style="margin-bottom: 12px;">
                                <div style="display: flex; gap: 8px;">
                                    <select id="model-select" class="minimal-select" style="padding: 10px 12px; flex: 1;">
                                        <option value="">-- 先拉取，后选择 --</option>
                                    </select>
                                    <button id="btn-fetch-models" class="minimal-btn" style="padding: 8px 12px; white-space: nowrap;">拉取模型</button>
                                </div>
                            </div>

                            <!-- 主 API 生成参数 折叠面板 -->
                            <div class="settings-item accordion-header" data-target="main-params-accordion" style="cursor: pointer; border-bottom: none; padding-top: 16px;">
                                <div class="settings-item-left">
                                    <div class="settings-item-content">
                                        <p class="settings-item-title" style="font-weight: 500;"><i class="ph ph-sliders" style="margin-right: 6px; vertical-align: -2px;"></i>生成参数</p>
                                    </div>
                                </div>
                                <i class="ph ph-caret-down settings-settings-arrow" style="transition: transform 0.3s;"></i>
                            </div>
                            
                            <div id="main-params-accordion" class="accordion-content" style="display: none; padding: 0 16px 16px 16px; margin-top: -8px;">
                                <div style="display: flex; justify-content: flex-end; margin-bottom: 12px;">
                                    <button id="btn-reset-params" class="minimal-btn" style="padding: 4px 8px; font-size: 11px;">恢复默认</button>
                                </div>
                                
                                <div class="settings-item" style="flex-direction: column; align-items: stretch; cursor: default; padding: 12px 0;">
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                                        <p class="settings-item-title">Temperature (温度)</p>
                                        <span class="settings-item-desc" style="margin: 0; font-size: 11px;">0.0 - 2.0</span>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 12px;">
                                        <input type="range" id="api-temperature" class="settings-card-slider" min="0" max="2" step="0.1" value="0.7" style="flex: 1;">
                                        <input type="number" id="api-temperature-val" class="minimal-input" min="0" max="2" step="0.1" value="0.7" style="width: 70px; padding: 6px; text-align: center; margin: 0; font-size: 13px;">
                                    </div>
                                </div>

                                <div class="settings-item" style="flex-direction: column; align-items: stretch; cursor: default; padding: 12px 0;">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                        <div style="display: flex; align-items: center; gap: 12px;">
                                            <p class="settings-item-title" style="margin: 0;">Top P (核采样)</p>
                                            <label class="settings-toggle" id="api-top-p-toggle">
                                                <input type="checkbox" id="api-top-p-enabled" style="display:none;">
                                                <span class="settings-toggle-slider"></span>
                                            </label>
                                        </div>
                                        <span class="settings-item-desc" style="margin: 0; font-size: 11px;">0.0 - 1.0</span>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 12px;" id="api-top-p-container" style="opacity: 0.5; pointer-events: none;">
                                        <input type="range" id="api-top-p" class="settings-card-slider" min="0" max="1" step="0.05" value="1.0" style="flex: 1;">
                                        <input type="number" id="api-top-p-val" class="minimal-input" min="0" max="1" step="0.05" value="1.0" style="width: 70px; padding: 6px; text-align: center; margin: 0; font-size: 13px;">
                                    </div>
                                </div>

                                <div class="settings-item" style="flex-direction: column; align-items: stretch; cursor: default; padding: 12px 0;">
                                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                                        <p class="settings-item-title" style="margin: 0;">Max Tokens (最大生成长度)</p>
                                        <label class="settings-toggle" id="api-max-tokens-toggle">
                                            <input type="checkbox" id="api-max-tokens-enabled" style="display:none;">
                                            <span class="settings-toggle-slider"></span>
                                        </label>
                                    </div>
                                    <div id="api-max-tokens-container" style="opacity: 0.5; pointer-events: none;">
                                        <input type="number" id="api-max-tokens" class="minimal-input" placeholder="例如: 2048 (留空表示不限制)">
                                    </div>
                                </div>

                                <div class="settings-item" style="flex-direction: column; align-items: stretch; cursor: default; padding: 12px 0;">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                        <div style="display: flex; align-items: center; gap: 12px;">
                                            <p class="settings-item-title" style="margin: 0;">Presence Penalty (存在惩罚)</p>
                                            <label class="settings-toggle" id="api-presence-penalty-toggle">
                                                <input type="checkbox" id="api-presence-penalty-enabled" style="display:none;">
                                                <span class="settings-toggle-slider"></span>
                                            </label>
                                        </div>
                                        <span class="settings-item-desc" style="margin: 0; font-size: 11px;">-2.0 - 2.0</span>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 12px;" id="api-presence-penalty-container" style="opacity: 0.5; pointer-events: none;">
                                        <input type="range" id="api-presence-penalty" class="settings-card-slider" min="-2" max="2" step="0.1" value="0" style="flex: 1;">
                                        <input type="number" id="api-presence-penalty-val" class="minimal-input" min="-2" max="2" step="0.1" value="0" style="width: 70px; padding: 6px; text-align: center; margin: 0; font-size: 13px;">
                                    </div>
                                </div>

                                <div class="settings-item" style="flex-direction: column; align-items: stretch; cursor: default; border-bottom: none; padding: 12px 0 0 0;">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                        <div style="display: flex; align-items: center; gap: 12px;">
                                            <p class="settings-item-title" style="margin: 0;">Frequency Penalty (频率惩罚)</p>
                                            <label class="settings-toggle" id="api-frequency-penalty-toggle">
                                                <input type="checkbox" id="api-frequency-penalty-enabled" style="display:none;">
                                                <span class="settings-toggle-slider"></span>
                                            </label>
                                        </div>
                                        <span class="settings-item-desc" style="margin: 0; font-size: 11px;">-2.0 - 2.0</span>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 12px;" id="api-frequency-penalty-container" style="opacity: 0.5; pointer-events: none;">
                                        <input type="range" id="api-frequency-penalty" class="settings-card-slider" min="-2" max="2" step="0.1" value="0" style="flex: 1;">
                                        <input type="number" id="api-frequency-penalty-val" class="minimal-input" min="-2" max="2" step="0.1" value="0" style="width: 70px; padding: 6px; text-align: center; margin: 0; font-size: 13px;">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 辅助判断 API Section -->
                    <div class="settings-section">
                        <div class="settings-card">
                            
                            <div class="settings-item accordion-header" data-target="sub-api-accordion" style="cursor: pointer; border-bottom: none;">
                                <div class="settings-item-left">
                                    <div class="settings-item-content">
                                        <h2 class="settings-section-title" style="margin: 0;"><i class="ph ph-magic-wand" style="margin-right: 6px; vertical-align: -2px;"></i>辅助判断 API (可选)</h2>
                                        <p class="settings-item-desc" style="margin-top: 4px; font-size: 12px; color: #666;">用于后台辅助任务，如语言分析、时区提取等。如不填则默认使用主 API。</p>
                                    </div>
                                </div>
                                <i class="ph ph-caret-down settings-settings-arrow" style="transition: transform 0.3s;"></i>
                            </div>

                            <div id="sub-api-accordion" class="accordion-content" style="display: none; padding: 0 16px 16px 16px; border-top: 1px solid var(--border-color); margin-top: 8px; padding-top: 16px;">
                                
                                <div style="margin-bottom: 16px; background: #f4f4f5; padding: 12px; border-radius: 12px;">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                        <span style="font-size: 13px; font-weight: 500; color: #18181b;">副 API 配置预设</span>
                                        <button id="btn-save-sub-preset" class="minimal-btn" style="padding: 2px 8px; font-size: 11px;">+ 保存当前</button>
                                    </div>
                                    <div style="display: flex; gap: 8px;">
                                        <select id="sub-api-preset-select" class="minimal-select" style="padding: 8px 10px; flex: 1;">
                                            <option value="">-- 选择方案 --</option>
                                        </select>
                                        <button id="btn-apply-sub-preset" class="minimal-btn minimal-btn-primary" style="padding: 6px 10px;">应用</button>
                                        <button id="btn-delete-sub-preset" class="minimal-btn minimal-btn-danger" style="padding: 6px 10px; display: none;">删除</button>
                                    </div>
                                </div>

                                <div class="settings-item" style="flex-direction: column; align-items: stretch; cursor: default; padding-top: 0;">
                                    <div class="settings-item-content" style="margin-bottom: 12px;">
                                        <p class="settings-item-title">AI 服务商</p>
                                    </div>
                                    <div class="api-provider-selector sub-api">
                                        <button class="provider-btn sub active" data-provider="deepseek">DeepSeek</button>
                                        <button class="provider-btn sub" data-provider="google">Google</button>
                                        <button class="provider-btn sub" data-provider="claude">Claude</button>
                                        <button class="provider-btn sub" data-provider="openai">OpenAI</button>
                                        <button class="provider-btn sub" data-provider="glm">GLM (智谱)</button>
                                        <button class="provider-btn sub" data-provider="qwen">Qwen (通义)</button>
                                        <button class="provider-btn sub" data-provider="moonshot">Moonshot</button>
                                        <button class="provider-btn sub" data-provider="custom">自定义</button>
                                    </div>
                                </div>

                                <div class="settings-item" style="flex-direction: column; align-items: stretch; cursor: default;">
                                    <div class="settings-item-content" style="margin-bottom: 12px;">
                                        <p class="settings-item-title">API 地址 (Base URL)</p>
                                    </div>
                                    <input type="text" id="sub-api-base-url" class="minimal-input" placeholder="例如: https://api.deepseek.com/v1">
                                </div>

                                <div class="settings-item" style="flex-direction: column; align-items: stretch; cursor: default;">
                                    <div class="settings-item-content" style="margin-bottom: 12px;">
                                        <p class="settings-item-title">API 密钥 (API Key)</p>
                                    </div>
                                    <div style="position: relative; width: 100%;">
                                        <input type="password" id="sub-api-key" class="minimal-input" style="padding-right: 40px;" placeholder="sk-...">
                                        <button id="toggle-sub-pwd-btn" class="pwd-toggle-btn">
                                            <i class="ph-bold ph-eye"></i>
                                        </button>
                                    </div>
                                </div>

                                <div class="settings-item" style="flex-direction: column; align-items: stretch; cursor: default; border-bottom: none; padding-bottom: 0;">
                                    <div class="settings-item-content" style="margin-bottom: 12px;">
                                        <p class="settings-item-title">模型名称 (Model)</p>
                                    </div>
                                    <input type="text" id="sub-api-model" class="minimal-input" placeholder="例如: deepseek-chat" style="margin-bottom: 12px;">
                                    <div style="display: flex; gap: 8px;">
                                        <select id="sub-model-select" class="minimal-select" style="padding: 10px 12px; flex: 1;">
                                            <option value="">-- 先拉取，后选择 --</option>
                                        </select>
                                        <button id="btn-fetch-sub-models" class="minimal-btn" style="padding: 8px 12px; white-space: nowrap;">拉取模型</button>
                                    </div>
                                </div>

                                <div style="display: flex; justify-content: space-between; align-items: center; margin: 24px 0 12px 0;">
                                    <span style="font-size: 14px; font-weight: 500; color: #18181b;"><i class="ph ph-sliders" style="margin-right: 6px; vertical-align: -2px;"></i>副 API 生成参数</span>
                                    <button id="btn-reset-sub-params" class="minimal-btn" style="padding: 4px 8px; font-size: 11px;">恢复默认</button>
                                </div>

                                <div class="settings-item" style="flex-direction: column; align-items: stretch; cursor: default; padding: 12px 0;">
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                                        <p class="settings-item-title">Temperature (温度)</p>
                                        <span class="settings-item-desc" style="margin: 0; font-size: 11px;">0.0 - 2.0</span>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 12px;">
                                        <input type="range" id="sub-api-temperature" class="settings-card-slider" min="0" max="2" step="0.1" value="0.1" style="flex: 1;">
                                        <input type="number" id="sub-api-temperature-val" class="minimal-input" min="0" max="2" step="0.1" value="0.1" style="width: 70px; padding: 6px; text-align: center; margin: 0; font-size: 13px;">
                                    </div>
                                </div>

                                <div class="settings-item" style="flex-direction: column; align-items: stretch; cursor: default; padding: 12px 0;">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                        <div style="display: flex; align-items: center; gap: 12px;">
                                            <p class="settings-item-title" style="margin: 0;">Top P (核采样)</p>
                                            <label class="settings-toggle" id="sub-api-top-p-toggle">
                                                <input type="checkbox" id="sub-api-top-p-enabled" style="display:none;">
                                                <span class="settings-toggle-slider"></span>
                                            </label>
                                        </div>
                                        <span class="settings-item-desc" style="margin: 0; font-size: 11px;">0.0 - 1.0</span>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 12px;" id="sub-api-top-p-container" style="opacity: 0.5; pointer-events: none;">
                                        <input type="range" id="sub-api-top-p" class="settings-card-slider" min="0" max="1" step="0.05" value="1.0" style="flex: 1;">
                                        <input type="number" id="sub-api-top-p-val" class="minimal-input" min="0" max="1" step="0.05" value="1.0" style="width: 70px; padding: 6px; text-align: center; margin: 0; font-size: 13px;">
                                    </div>
                                </div>

                                <div class="settings-item" style="flex-direction: column; align-items: stretch; cursor: default; padding: 12px 0;">
                                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                                        <p class="settings-item-title" style="margin: 0;">Max Tokens (最大生成长度)</p>
                                        <label class="settings-toggle" id="sub-api-max-tokens-toggle">
                                            <input type="checkbox" id="sub-api-max-tokens-enabled" style="display:none;">
                                            <span class="settings-toggle-slider"></span>
                                        </label>
                                    </div>
                                    <div id="sub-api-max-tokens-container" style="opacity: 0.5; pointer-events: none;">
                                        <input type="number" id="sub-api-max-tokens" class="minimal-input" placeholder="例如: 2048 (留空表示不限制)">
                                    </div>
                                </div>

                                <div class="settings-item" style="flex-direction: column; align-items: stretch; cursor: default; padding: 12px 0;">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                        <div style="display: flex; align-items: center; gap: 12px;">
                                            <p class="settings-item-title" style="margin: 0;">Presence Penalty (存在惩罚)</p>
                                            <label class="settings-toggle" id="sub-api-presence-penalty-toggle">
                                                <input type="checkbox" id="sub-api-presence-penalty-enabled" style="display:none;">
                                                <span class="settings-toggle-slider"></span>
                                            </label>
                                        </div>
                                        <span class="settings-item-desc" style="margin: 0; font-size: 11px;">-2.0 - 2.0</span>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 12px;" id="sub-api-presence-penalty-container" style="opacity: 0.5; pointer-events: none;">
                                        <input type="range" id="sub-api-presence-penalty" class="settings-card-slider" min="-2" max="2" step="0.1" value="0" style="flex: 1;">
                                        <input type="number" id="sub-api-presence-penalty-val" class="minimal-input" min="-2" max="2" step="0.1" value="0" style="width: 70px; padding: 6px; text-align: center; margin: 0; font-size: 13px;">
                                    </div>
                                </div>

                                <div class="settings-item" style="flex-direction: column; align-items: stretch; cursor: default; border-bottom: none; padding: 12px 0 0 0;">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                        <div style="display: flex; align-items: center; gap: 12px;">
                                            <p class="settings-item-title" style="margin: 0;">Frequency Penalty (频率惩罚)</p>
                                            <label class="settings-toggle" id="sub-api-frequency-penalty-toggle">
                                                <input type="checkbox" id="sub-api-frequency-penalty-enabled" style="display:none;">
                                                <span class="settings-toggle-slider"></span>
                                            </label>
                                        </div>
                                        <span class="settings-item-desc" style="margin: 0; font-size: 11px;">-2.0 - 2.0</span>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 12px;" id="sub-api-frequency-penalty-container" style="opacity: 0.5; pointer-events: none;">
                                        <input type="range" id="sub-api-frequency-penalty" class="settings-card-slider" min="-2" max="2" step="0.1" value="0" style="flex: 1;">
                                        <input type="number" id="sub-api-frequency-penalty-val" class="minimal-input" min="-2" max="2" step="0.1" value="0" style="width: 70px; padding: 6px; text-align: center; margin: 0; font-size: 13px;">
                                    </div>
                                </div>

                            </div>

                        </div>
                    </div>

                </main>
            </div>
        </div>
    `,

    init: function(closeCallback, container) {
        // 绑定关闭事件
        const closeBtn = container.querySelector('#api-close-btn');
        const backdrop = container.querySelector('#api-backdrop');
        
        if (closeBtn) closeBtn.addEventListener('click', closeCallback);
        if (backdrop) backdrop.addEventListener('click', closeCallback);

        // 密码显隐逻辑
        const pwdInput = container.querySelector('#api-key');
        const togglePwdBtn = container.querySelector('#toggle-pwd-btn');
        if (togglePwdBtn && pwdInput) {
            togglePwdBtn.addEventListener('click', () => {
                const type = pwdInput.getAttribute('type') === 'password' ? 'text' : 'password';
                pwdInput.setAttribute('type', type);
                const icon = togglePwdBtn.querySelector('i');
                if (type === 'text') {
                    icon.classList.replace('ph-eye', 'ph-eye-closed');
                } else {
                    icon.classList.replace('ph-eye-closed', 'ph-eye');
                }
            });
        }
        
        const subPwdInput = container.querySelector('#sub-api-key');
        const toggleSubPwdBtn = container.querySelector('#toggle-sub-pwd-btn');
        if (toggleSubPwdBtn && subPwdInput) {
            toggleSubPwdBtn.addEventListener('click', () => {
                const type = subPwdInput.getAttribute('type') === 'password' ? 'text' : 'password';
                subPwdInput.setAttribute('type', type);
                const icon = toggleSubPwdBtn.querySelector('i');
                if (type === 'text') {
                    icon.classList.replace('ph-eye', 'ph-eye-closed');
                } else {
                    icon.classList.replace('ph-eye-closed', 'ph-eye');
                }
            });
        }
        
        // 折叠面板交互逻辑
        const accordions = container.querySelectorAll('.accordion-header');
        accordions.forEach(header => {
            header.addEventListener('click', () => {
                const targetId = header.getAttribute('data-target');
                const targetContent = container.querySelector('#' + targetId);
                const arrow = header.querySelector('.settings-settings-arrow');
                if (targetContent.style.display === 'none') {
                    targetContent.style.display = 'block';
                    if(arrow) arrow.style.transform = 'rotate(180deg)';
                } else {
                    targetContent.style.display = 'none';
                    if(arrow) arrow.style.transform = 'rotate(0deg)';
                }
            });
        });

        // 绑定开关逻辑通用函数
        const bindToggle = (toggleId, inputId, containerId) => {
            const toggle = container.querySelector(`#${toggleId}`);
            const input = container.querySelector(`#${inputId}`);
            const elContainer = container.querySelector(`#${containerId}`);
            if (toggle && input) {
                toggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    input.checked = !input.checked;
                    if (input.checked) {
                        toggle.classList.add('active');
                        if (elContainer) {
                            elContainer.style.opacity = '1';
                            elContainer.style.pointerEvents = 'auto';
                        }
                    } else {
                        toggle.classList.remove('active');
                        if (elContainer) {
                            elContainer.style.opacity = '0.5';
                            elContainer.style.pointerEvents = 'none';
                        }
                    }
                    saveApiSettings();
                    // 这里可以再触发一个变化事件，如果需要的话
                });
            }
        };

        const updateToggleUI = (toggleId, inputId, containerId, isEnabled) => {
            const toggle = container.querySelector(`#${toggleId}`);
            const input = container.querySelector(`#${inputId}`);
            const elContainer = container.querySelector(`#${containerId}`);
            if (toggle && input) {
                input.checked = !!isEnabled;
                if (input.checked) {
                    toggle.classList.add('active');
                    if (elContainer) {
                        elContainer.style.opacity = '1';
                        elContainer.style.pointerEvents = 'auto';
                    }
                } else {
                    toggle.classList.remove('active');
                    if (elContainer) {
                        elContainer.style.opacity = '0.5';
                        elContainer.style.pointerEvents = 'none';
                    }
                }
            }
        };

        const getToggleVal = (inputId) => {
            const el = container.querySelector(`#${inputId}`);
            return el ? el.checked : false;
        };

        // 绑定主 API 开关
        bindToggle('api-top-p-toggle', 'api-top-p-enabled', 'api-top-p-container');
        bindToggle('api-max-tokens-toggle', 'api-max-tokens-enabled', 'api-max-tokens-container');
        bindToggle('api-presence-penalty-toggle', 'api-presence-penalty-enabled', 'api-presence-penalty-container');
        bindToggle('api-frequency-penalty-toggle', 'api-frequency-penalty-enabled', 'api-frequency-penalty-container');

        // 绑定副 API 开关
        bindToggle('sub-api-top-p-toggle', 'sub-api-top-p-enabled', 'sub-api-top-p-container');
        bindToggle('sub-api-max-tokens-toggle', 'sub-api-max-tokens-enabled', 'sub-api-max-tokens-container');
        bindToggle('sub-api-presence-penalty-toggle', 'sub-api-presence-penalty-enabled', 'sub-api-presence-penalty-container');
        bindToggle('sub-api-frequency-penalty-toggle', 'sub-api-frequency-penalty-enabled', 'sub-api-frequency-penalty-container');


        // 大模型 API 设置逻辑
        const providerBtns = container.querySelectorAll('.provider-btn:not(.sub)');
        const subProviderBtns = container.querySelectorAll('.provider-btn.sub');
        const apiBaseUrlInput = container.querySelector('#api-base-url');
        const apiKeyInput = container.querySelector('#api-key');
        const apiModelInput = container.querySelector('#api-model');
        const modelSelect = container.querySelector('#model-select');

        // 主高级参数元素
        const temperatureInput = container.querySelector('#api-temperature');
        const temperatureVal = container.querySelector('#api-temperature-val');
        const topPInput = container.querySelector('#api-top-p');
        const topPVal = container.querySelector('#api-top-p-val');
        const maxTokensInput = container.querySelector('#api-max-tokens');
        const presencePenaltyInput = container.querySelector('#api-presence-penalty');
        const presencePenaltyVal = container.querySelector('#api-presence-penalty-val');
        const frequencyPenaltyInput = container.querySelector('#api-frequency-penalty');
        const frequencyPenaltyVal = container.querySelector('#api-frequency-penalty-val');
        const btnResetParams = container.querySelector('#btn-reset-params');

        // 副高级参数元素
        const subTemperatureInput = container.querySelector('#sub-api-temperature');
        const subTemperatureVal = container.querySelector('#sub-api-temperature-val');
        const subTopPInput = container.querySelector('#sub-api-top-p');
        const subTopPVal = container.querySelector('#sub-api-top-p-val');
        const subMaxTokensInput = container.querySelector('#sub-api-max-tokens');
        const subPresencePenaltyInput = container.querySelector('#sub-api-presence-penalty');
        const subPresencePenaltyVal = container.querySelector('#sub-api-presence-penalty-val');
        const subFrequencyPenaltyInput = container.querySelector('#sub-api-frequency-penalty');
        const subFrequencyPenaltyVal = container.querySelector('#sub-api-frequency-penalty-val');
        const btnResetSubParams = container.querySelector('#btn-reset-sub-params');

        // Preset 相关元素 (主)
        const presetSelect = container.querySelector('#api-preset-select');
        const btnSavePreset = container.querySelector('#btn-save-preset');
        const btnApplyPreset = container.querySelector('#btn-apply-preset');
        const btnDeletePreset = container.querySelector('#btn-delete-preset');

        // Preset 相关元素 (副)
        const subPresetSelect = container.querySelector('#sub-api-preset-select');
        const btnSaveSubPreset = container.querySelector('#btn-save-sub-preset');
        const btnApplySubPreset = container.querySelector('#btn-apply-sub-preset');
        const btnDeleteSubPreset = container.querySelector('#btn-delete-sub-preset');

        // 同步 Slider 和 Number Input
        const syncSliderAndInput = (slider, input) => {
            if (!slider || !input) return;
            slider.addEventListener('input', () => {
                input.value = slider.value;
                saveApiSettings();
            });
            input.addEventListener('change', () => {
                let val = parseFloat(input.value);
                let min = parseFloat(slider.min);
                let max = parseFloat(slider.max);
                if (isNaN(val)) val = parseFloat(slider.defaultValue || 0);
                if (val < min) val = min;
                if (val > max) val = max;
                input.value = val;
                slider.value = val;
                saveApiSettings();
            });
        };

        syncSliderAndInput(temperatureInput, temperatureVal);
        syncSliderAndInput(topPInput, topPVal);
        syncSliderAndInput(presencePenaltyInput, presencePenaltyVal);
        syncSliderAndInput(frequencyPenaltyInput, frequencyPenaltyVal);

        syncSliderAndInput(subTemperatureInput, subTemperatureVal);
        syncSliderAndInput(subTopPInput, subTopPVal);
        syncSliderAndInput(subPresencePenaltyInput, subPresencePenaltyVal);
        syncSliderAndInput(subFrequencyPenaltyInput, subFrequencyPenaltyVal);

        // 重置生成参数逻辑 (主)
        if (btnResetParams) {
            btnResetParams.addEventListener('click', () => {
                if (temperatureInput && temperatureVal) {
                    temperatureInput.value = 0.7;
                    temperatureVal.value = 0.7;
                }
                if (topPInput && topPVal) {
                    topPInput.value = 1.0;
                    topPVal.value = 1.0;
                }
                if (maxTokensInput) {
                    maxTokensInput.value = '';
                }
                if (presencePenaltyInput && presencePenaltyVal) {
                    presencePenaltyInput.value = 0;
                    presencePenaltyVal.value = 0;
                }
                if (frequencyPenaltyInput && frequencyPenaltyVal) {
                    frequencyPenaltyInput.value = 0;
                    frequencyPenaltyVal.value = 0;
                }
                updateToggleUI('api-top-p-toggle', 'api-top-p-enabled', 'api-top-p-container', false);
                updateToggleUI('api-max-tokens-toggle', 'api-max-tokens-enabled', 'api-max-tokens-container', false);
                updateToggleUI('api-presence-penalty-toggle', 'api-presence-penalty-enabled', 'api-presence-penalty-container', false);
                updateToggleUI('api-frequency-penalty-toggle', 'api-frequency-penalty-enabled', 'api-frequency-penalty-container', false);
                
                saveApiSettings();
                resetPresetToDefault();
            });
        }

        // 重置生成参数逻辑 (副)
        if (btnResetSubParams) {
            btnResetSubParams.addEventListener('click', () => {
                if (subTemperatureInput && subTemperatureVal) {
                    subTemperatureInput.value = 0.1;
                    subTemperatureVal.value = 0.1;
                }
                if (subTopPInput && subTopPVal) {
                    subTopPInput.value = 1.0;
                    subTopPVal.value = 1.0;
                }
                if (subMaxTokensInput) {
                    subMaxTokensInput.value = '';
                }
                if (subPresencePenaltyInput && subPresencePenaltyVal) {
                    subPresencePenaltyInput.value = 0;
                    subPresencePenaltyVal.value = 0;
                }
                if (subFrequencyPenaltyInput && subFrequencyPenaltyVal) {
                    subFrequencyPenaltyInput.value = 0;
                    subFrequencyPenaltyVal.value = 0;
                }
                updateToggleUI('sub-api-top-p-toggle', 'sub-api-top-p-enabled', 'sub-api-top-p-container', false);
                updateToggleUI('sub-api-max-tokens-toggle', 'sub-api-max-tokens-enabled', 'sub-api-max-tokens-container', false);
                updateToggleUI('sub-api-presence-penalty-toggle', 'sub-api-presence-penalty-enabled', 'sub-api-presence-penalty-container', false);
                updateToggleUI('sub-api-frequency-penalty-toggle', 'sub-api-frequency-penalty-enabled', 'sub-api-frequency-penalty-container', false);
                
                saveApiSettings();
                resetSubPresetToDefault();
            });
        }

        // 预设方案逻辑 (主)
        const PRESETS_STORAGE_KEY = 'nrj-api-presets';
        let apiPresets = JSON.parse(localStorage.getItem(PRESETS_STORAGE_KEY) || '{}');

        // 预设方案逻辑 (副)
        const SUB_PRESETS_STORAGE_KEY = 'nrj-sub-api-presets';
        let subApiPresets = JSON.parse(localStorage.getItem(SUB_PRESETS_STORAGE_KEY) || '{}');

        const renderPresets = (selectedId = '') => {
            if (!presetSelect) return;
            presetSelect.innerHTML = '<option value="">-- 选择预设方案 --</option>';
            
            for (const [id, preset] of Object.entries(apiPresets)) {
                const opt = document.createElement('option');
                opt.value = id;
                opt.textContent = preset.name;
                if (id === selectedId) opt.selected = true;
                presetSelect.appendChild(opt);
            }
            
            if (btnDeletePreset) {
                btnDeletePreset.style.display = selectedId ? 'block' : 'none';
            }
        };

        const renderSubPresets = (selectedId = '') => {
            if (!subPresetSelect) return;
            subPresetSelect.innerHTML = '<option value="">-- 选择方案 --</option>';
            
            for (const [id, preset] of Object.entries(subApiPresets)) {
                const opt = document.createElement('option');
                opt.value = id;
                opt.textContent = preset.name;
                if (id === selectedId) opt.selected = true;
                subPresetSelect.appendChild(opt);
            }
            
            if (btnDeleteSubPreset) {
                btnDeleteSubPreset.style.display = selectedId ? 'block' : 'none';
            }
        };

        if (btnSavePreset) {
            btnSavePreset.addEventListener('click', () => {
                const presetName = prompt('请输入预设名称 (例如: "主API写代码专用"):');
                if (!presetName || !presetName.trim()) return;

                const activeBtn = container.querySelector('.provider-btn:not(.sub).active');
                const newPreset = {
                    name: presetName.trim(),
                    provider: activeBtn ? activeBtn.getAttribute('data-provider') : 'deepseek',
                    url: apiBaseUrlInput ? apiBaseUrlInput.value : '',
                    key: apiKeyInput ? apiKeyInput.value : '',
                    model: apiModelInput ? apiModelInput.value : '',
                    temperature: temperatureInput ? parseFloat(temperatureInput.value) : 0.7,
                    topPEnabled: getToggleVal('api-top-p-enabled'),
                    topP: topPInput ? parseFloat(topPInput.value) : 1.0,
                    maxTokensEnabled: getToggleVal('api-max-tokens-enabled'),
                    maxTokens: maxTokensInput ? (maxTokensInput.value ? parseInt(maxTokensInput.value) : null) : null,
                    presencePenaltyEnabled: getToggleVal('api-presence-penalty-enabled'),
                    presencePenalty: presencePenaltyInput ? parseFloat(presencePenaltyInput.value) : 0,
                    frequencyPenaltyEnabled: getToggleVal('api-frequency-penalty-enabled'),
                    frequencyPenalty: frequencyPenaltyInput ? parseFloat(frequencyPenaltyInput.value) : 0
                };

                // 生成唯一 ID
                const presetId = 'preset_' + Date.now();
                apiPresets[presetId] = newPreset;
                localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(apiPresets));
                
                renderPresets(presetId);
                if (typeof showCustomModal === 'function') {
                    showCustomModal('保存成功', `预设 "${newPreset.name}" 已保存！`, false, '', () => {});
                } else {
                    alert(`预设 "${newPreset.name}" 已保存！`);
                }
            });
        }

        if (btnSaveSubPreset) {
            btnSaveSubPreset.addEventListener('click', () => {
                const presetName = prompt('请输入副 API 预设名称 (例如: "便宜模型"):');
                if (!presetName || !presetName.trim()) return;

                const activeBtn = container.querySelector('.provider-btn.sub.active');
                const newPreset = {
                    name: presetName.trim(),
                    provider: activeBtn ? activeBtn.getAttribute('data-provider') : 'deepseek',
                    url: subApiBaseUrlInput ? subApiBaseUrlInput.value : '',
                    key: subApiKeyInput ? subApiKeyInput.value : '',
                    model: subApiModelInput ? subApiModelInput.value : '',
                    temperature: subTemperatureInput ? parseFloat(subTemperatureInput.value) : 0.1,
                    topPEnabled: getToggleVal('sub-api-top-p-enabled'),
                    topP: subTopPInput ? parseFloat(subTopPInput.value) : 1.0,
                    maxTokensEnabled: getToggleVal('sub-api-max-tokens-enabled'),
                    maxTokens: subMaxTokensInput ? (subMaxTokensInput.value ? parseInt(subMaxTokensInput.value) : null) : null,
                    presencePenaltyEnabled: getToggleVal('sub-api-presence-penalty-enabled'),
                    presencePenalty: subPresencePenaltyInput ? parseFloat(subPresencePenaltyInput.value) : 0,
                    frequencyPenaltyEnabled: getToggleVal('sub-api-frequency-penalty-enabled'),
                    frequencyPenalty: subFrequencyPenaltyInput ? parseFloat(subFrequencyPenaltyInput.value) : 0
                };

                // 生成唯一 ID
                const presetId = 'sub_preset_' + Date.now();
                subApiPresets[presetId] = newPreset;
                localStorage.setItem(SUB_PRESETS_STORAGE_KEY, JSON.stringify(subApiPresets));
                
                renderSubPresets(presetId);
                if (typeof showCustomModal === 'function') {
                    showCustomModal('保存成功', `预设 "${newPreset.name}" 已保存！`, false, '', () => {});
                } else {
                    alert(`预设 "${newPreset.name}" 已保存！`);
                }
            });
        }

        if (btnDeletePreset) {
            btnDeletePreset.addEventListener('click', () => {
                const selectedId = presetSelect.value;
                if (!selectedId || !apiPresets[selectedId]) return;

                if (confirm(`确定要删除预设 "${apiPresets[selectedId].name}" 吗？`)) {
                    delete apiPresets[selectedId];
                    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(apiPresets));
                    renderPresets('');
                }
            });
        }

        if (btnDeleteSubPreset) {
            btnDeleteSubPreset.addEventListener('click', () => {
                const selectedId = subPresetSelect.value;
                if (!selectedId || !subApiPresets[selectedId]) return;

                if (confirm(`确定要删除预设 "${subApiPresets[selectedId].name}" 吗？`)) {
                    delete subApiPresets[selectedId];
                    localStorage.setItem(SUB_PRESETS_STORAGE_KEY, JSON.stringify(subApiPresets));
                    renderSubPresets('');
                }
            });
        }
        
        if (btnApplyPreset) {
            btnApplyPreset.addEventListener('click', () => {
                const selectedId = presetSelect ? presetSelect.value : '';
                if (!selectedId || !apiPresets[selectedId]) {
                    if (typeof showCustomModal === 'function') {
                        showCustomModal('提示', '请先在左侧选择一个有效的预设方案。', false, '', () => {});
                    } else {
                        alert('请先在左侧选择一个有效的预设方案。');
                    }
                    return;
                }
                
                applyPresetValues(apiPresets[selectedId]);
                if (typeof showCustomModal === 'function') {
                    showCustomModal('应用成功', `已成功加载 "${apiPresets[selectedId].name}" 的配置参数。`, false, '', () => {});
                } else {
                    alert(`已成功加载 "${apiPresets[selectedId].name}" 的配置参数。`);
                }
            });
        }

        if (btnApplySubPreset) {
            btnApplySubPreset.addEventListener('click', () => {
                const selectedId = subPresetSelect ? subPresetSelect.value : '';
                if (!selectedId || !subApiPresets[selectedId]) {
                    if (typeof showCustomModal === 'function') {
                        showCustomModal('提示', '请先选择一个有效的副 API 预设方案。', false, '', () => {});
                    } else {
                        alert('请先选择一个有效的副 API 预设方案。');
                    }
                    return;
                }
                
                applySubPresetValues(subApiPresets[selectedId]);
                if (typeof showCustomModal === 'function') {
                    showCustomModal('应用成功', `已成功加载 "${subApiPresets[selectedId].name}" 的配置参数。`, false, '', () => {});
                } else {
                    alert(`已成功加载 "${subApiPresets[selectedId].name}" 的配置参数。`);
                }
            });
        }

        const applyPresetValues = (settings) => {
            const provider = settings.provider || 'deepseek';
            
            if (providerBtns) {
                providerBtns.forEach(b => {
                    if (b.getAttribute('data-provider') === provider) {
                        b.classList.add('active');
                    } else {
                        b.classList.remove('active');
                    }
                });
            }

            if (apiBaseUrlInput) apiBaseUrlInput.value = settings.url !== undefined ? settings.url : (apiProviders[provider]?.defaultUrl || '');
            if (apiKeyInput) apiKeyInput.value = settings.key || '';
            if (apiModelInput) apiModelInput.value = settings.model || '';
            
            if (temperatureInput && temperatureVal) {
                const temp = settings.temperature !== undefined ? settings.temperature : 0.7;
                temperatureInput.value = temp;
                temperatureVal.value = temp;
            }

            if (topPInput && topPVal) {
                const tp = settings.topP !== undefined ? settings.topP : 1.0;
                topPInput.value = tp;
                topPVal.value = tp;
            }
            
            if (maxTokensInput) {
                maxTokensInput.value = settings.maxTokens || '';
            }

            if (presencePenaltyInput && presencePenaltyVal) {
                const pp = settings.presencePenalty !== undefined ? settings.presencePenalty : 0;
                presencePenaltyInput.value = pp;
                presencePenaltyVal.value = pp;
            }

            if (frequencyPenaltyInput && frequencyPenaltyVal) {
                const fp = settings.frequencyPenalty !== undefined ? settings.frequencyPenalty : 0;
                frequencyPenaltyInput.value = fp;
                frequencyPenaltyVal.value = fp;
            }

            updateToggleUI('api-top-p-toggle', 'api-top-p-enabled', 'api-top-p-container', settings.topPEnabled);
            updateToggleUI('api-max-tokens-toggle', 'api-max-tokens-enabled', 'api-max-tokens-container', settings.maxTokensEnabled);
            updateToggleUI('api-presence-penalty-toggle', 'api-presence-penalty-enabled', 'api-presence-penalty-container', settings.presencePenaltyEnabled);
            updateToggleUI('api-frequency-penalty-toggle', 'api-frequency-penalty-enabled', 'api-frequency-penalty-container', settings.frequencyPenaltyEnabled);
            
            if (modelSelect) modelSelect.innerHTML = '<option value="">-- 先拉取，后选择 --</option>';
            
            saveApiSettings(); // 应用后立即保存到当前配置
        };

        const applySubPresetValues = (settings) => {
            const provider = settings.provider || 'deepseek';
            
            if (subProviderBtns) {
                subProviderBtns.forEach(b => {
                    if (b.getAttribute('data-provider') === provider) {
                        b.classList.add('active');
                    } else {
                        b.classList.remove('active');
                    }
                });
            }

            if (subApiBaseUrlInput) subApiBaseUrlInput.value = settings.url !== undefined ? settings.url : (apiProviders[provider]?.defaultUrl || '');
            if (subApiKeyInput) subApiKeyInput.value = settings.key || '';
            if (subApiModelInput) subApiModelInput.value = settings.model || '';
            
            if (subTemperatureInput && subTemperatureVal) {
                const temp = settings.temperature !== undefined ? settings.temperature : 0.1;
                subTemperatureInput.value = temp;
                subTemperatureVal.value = temp;
            }

            if (subTopPInput && subTopPVal) {
                const tp = settings.topP !== undefined ? settings.topP : 1.0;
                subTopPInput.value = tp;
                subTopPVal.value = tp;
            }
            
            if (subMaxTokensInput) {
                subMaxTokensInput.value = settings.maxTokens || '';
            }

            if (subPresencePenaltyInput && subPresencePenaltyVal) {
                const pp = settings.presencePenalty !== undefined ? settings.presencePenalty : 0;
                subPresencePenaltyInput.value = pp;
                subPresencePenaltyVal.value = pp;
            }

            if (subFrequencyPenaltyInput && subFrequencyPenaltyVal) {
                const fp = settings.frequencyPenalty !== undefined ? settings.frequencyPenalty : 0;
                subFrequencyPenaltyInput.value = fp;
                subFrequencyPenaltyVal.value = fp;
            }

            updateToggleUI('sub-api-top-p-toggle', 'sub-api-top-p-enabled', 'sub-api-top-p-container', settings.topPEnabled);
            updateToggleUI('sub-api-max-tokens-toggle', 'sub-api-max-tokens-enabled', 'sub-api-max-tokens-container', settings.maxTokensEnabled);
            updateToggleUI('sub-api-presence-penalty-toggle', 'sub-api-presence-penalty-enabled', 'sub-api-presence-penalty-container', settings.presencePenaltyEnabled);
            updateToggleUI('sub-api-frequency-penalty-toggle', 'sub-api-frequency-penalty-enabled', 'sub-api-frequency-penalty-container', settings.frequencyPenaltyEnabled);
            
            const subModelSelect = container.querySelector('#sub-model-select');
            if (subModelSelect) subModelSelect.innerHTML = '<option value="">-- 先拉取，后选择 --</option>';
            
            saveApiSettings(); // 应用后立即保存到当前配置
        };

        if (presetSelect) {
            presetSelect.addEventListener('change', () => {
                const selectedId = presetSelect.value;
                if (btnDeletePreset) {
                    btnDeletePreset.style.display = selectedId ? 'block' : 'none';
                }
            });
        }

        if (subPresetSelect) {
            subPresetSelect.addEventListener('change', () => {
                const selectedId = subPresetSelect.value;
                if (btnDeleteSubPreset) {
                    btnDeleteSubPreset.style.display = selectedId ? 'block' : 'none';
                }
            });
        }

        const apiProviders = {
            deepseek: {
                defaultUrl: 'https://api.deepseek.com/v1'
            },
            google: {
                defaultUrl: 'https://generativelanguage.googleapis.com/v1beta/openai'
            },
            claude: {
                defaultUrl: 'https://api.anthropic.com/v1'
            },
            openai: {
                defaultUrl: 'https://api.openai.com/v1'
            },
            glm: {
                defaultUrl: 'https://open.bigmodel.cn/api/paas/v4'
            },
            qwen: {
                defaultUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
            },
            moonshot: {
                defaultUrl: 'https://api.moonshot.cn/v1'
            },
            custom: {
                defaultUrl: ''
            }
        };

        const renderDynamicModels = (models, selectElement) => {
            if (!selectElement) return;
            selectElement.innerHTML = '<option value="">-- 请选择模型 --</option>';
            
            if (models.length === 0) {
                selectElement.innerHTML = '<option value="">无可用模型</option>';
                return;
            }

            models.forEach(model => {
                const opt = document.createElement('option');
                opt.value = model;
                opt.textContent = model;
                selectElement.appendChild(opt);
            });
        };

        if (modelSelect) {
            modelSelect.addEventListener('change', () => {
                if (modelSelect.value && apiModelInput) {
                    apiModelInput.value = modelSelect.value;
                    saveApiSettings();
                }
            });
        }

        const subModelSelectDropdown = container.querySelector('#sub-model-select');
        if (subModelSelectDropdown) {
            subModelSelectDropdown.addEventListener('change', () => {
                if (subModelSelectDropdown.value && subApiModelInput) {
                    subApiModelInput.value = subModelSelectDropdown.value;
                    saveApiSettings();
                }
            });
        }
        
        // 拉取模型功能 (主 API)
        const btnFetchModels = container.querySelector('#btn-fetch-models');
        if (btnFetchModels) {
            btnFetchModels.addEventListener('click', async () => {
                const baseUrl = apiBaseUrlInput ? apiBaseUrlInput.value.trim() : '';
                const apiKey = apiKeyInput ? apiKeyInput.value.trim() : '';
                
                if (!baseUrl) {
                    if (typeof showCustomModal === 'function') {
                        showCustomModal('提示', '请先填写 API Base URL', false, '', () => {});
                    }
                    return;
                }
                
                let fetchUrl = baseUrl;
                if (!fetchUrl.endsWith('/')) fetchUrl += '/';
                fetchUrl += 'models';
                
                btnFetchModels.textContent = '拉取中...';
                btnFetchModels.disabled = true;
                
                try {
                    const headers = { 'Content-Type': 'application/json' };
                    if (apiKey) {
                        headers['Authorization'] = `Bearer ${apiKey}`;
                    }
                    
                    const response = await fetch(fetchUrl, { headers });
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    
                    const data = await response.json();
                    let models = [];
                    
                    if (data && Array.isArray(data.data)) {
                        models = data.data.map(item => item.id).filter(id => id);
                    } else if (Array.isArray(data)) {
                        models = data.map(item => item.id || item).filter(id => typeof id === 'string');
                    }
                    
                    if (models.length > 0) {
                        renderDynamicModels(models, modelSelect);
                        if (typeof showCustomModal === 'function') {
                            showCustomModal('拉取成功', `成功拉取到 ${models.length} 个模型！请在下拉框中选择。`, false, '', () => {});
                        }
                    } else {
                        throw new Error('未获取到模型列表数据格式或数据为空');
                    }
                } catch (err) {
                    console.error('拉取模型失败', err);
                    if (typeof showCustomModal === 'function') {
                        showCustomModal('拉取失败', '无法拉取模型列表，请检查 Base URL 和 API Key 是否正确。<br>错误信息: ' + err.message, false, '', () => {});
                    }
                    if (modelSelect) {
                        modelSelect.innerHTML = '<option value="">-- 拉取失败 --</option>';
                    }
                } finally {
                    btnFetchModels.textContent = '拉取模型';
                    btnFetchModels.disabled = false;
                }
            });
        }

        // 拉取模型功能 (副 API)
        const btnFetchSubModels = container.querySelector('#btn-fetch-sub-models');
        if (btnFetchSubModels) {
            btnFetchSubModels.addEventListener('click', async () => {
                const baseUrl = subApiBaseUrlInput ? subApiBaseUrlInput.value.trim() : '';
                const apiKey = subApiKeyInput ? subApiKeyInput.value.trim() : '';
                
                if (!baseUrl) {
                    if (typeof showCustomModal === 'function') {
                        showCustomModal('提示', '请先填写副 API Base URL', false, '', () => {});
                    }
                    return;
                }
                
                let fetchUrl = baseUrl;
                if (!fetchUrl.endsWith('/')) fetchUrl += '/';
                fetchUrl += 'models';
                
                btnFetchSubModels.textContent = '拉取中...';
                btnFetchSubModels.disabled = true;
                
                try {
                    const headers = { 'Content-Type': 'application/json' };
                    if (apiKey) {
                        headers['Authorization'] = `Bearer ${apiKey}`;
                    }
                    
                    const response = await fetch(fetchUrl, { headers });
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    
                    const data = await response.json();
                    let models = [];
                    
                    if (data && Array.isArray(data.data)) {
                        models = data.data.map(item => item.id).filter(id => id);
                    } else if (Array.isArray(data)) {
                        models = data.map(item => item.id || item).filter(id => typeof id === 'string');
                    }
                    
                    if (models.length > 0) {
                        renderDynamicModels(models, subModelSelectDropdown);
                        if (typeof showCustomModal === 'function') {
                            showCustomModal('拉取成功', `成功拉取到 ${models.length} 个模型！请在下拉框中选择。`, false, '', () => {});
                        }
                    } else {
                        throw new Error('未获取到模型列表数据格式或数据为空');
                    }
                } catch (err) {
                    console.error('拉取模型失败', err);
                    if (typeof showCustomModal === 'function') {
                        showCustomModal('拉取失败', '无法拉取模型列表，请检查 Base URL 和 API Key 是否正确。<br>错误信息: ' + err.message, false, '', () => {});
                    }
                    if (subModelSelectDropdown) {
                        subModelSelectDropdown.innerHTML = '<option value="">-- 拉取失败 --</option>';
                    }
                } finally {
                    btnFetchSubModels.textContent = '拉取模型';
                    btnFetchSubModels.disabled = false;
                }
            });
        }

        // --- 辅助 API 相关变量 ---已提前定义

        const saveApiSettings = () => {
            const activeBtn = container.querySelector('.provider-btn:not(.sub).active');
            const provider = activeBtn ? activeBtn.getAttribute('data-provider') : 'deepseek';
            const settings = {
                provider: provider,
                url: apiBaseUrlInput ? apiBaseUrlInput.value : '',
                key: apiKeyInput ? apiKeyInput.value : '',
                model: apiModelInput ? apiModelInput.value : '',
                temperature: temperatureInput ? parseFloat(temperatureInput.value) : 0.7,
                topPEnabled: getToggleVal('api-top-p-enabled'),
                topP: topPInput ? parseFloat(topPInput.value) : 1.0,
                maxTokensEnabled: getToggleVal('api-max-tokens-enabled'),
                maxTokens: maxTokensInput ? (maxTokensInput.value ? parseInt(maxTokensInput.value) : null) : null,
                presencePenaltyEnabled: getToggleVal('api-presence-penalty-enabled'),
                presencePenalty: presencePenaltyInput ? parseFloat(presencePenaltyInput.value) : 0,
                frequencyPenaltyEnabled: getToggleVal('api-frequency-penalty-enabled'),
                frequencyPenalty: frequencyPenaltyInput ? parseFloat(frequencyPenaltyInput.value) : 0
            };
            localStorage.setItem('nrj-api-settings', JSON.stringify(settings));
            
            if (provider === 'custom') {
                localStorage.setItem('nrj-api-custom-url', settings.url);
            }

            const subActiveBtn = container.querySelector('.provider-btn.sub.active');
            const subProvider = subActiveBtn ? subActiveBtn.getAttribute('data-provider') : 'deepseek';
            const subSettings = {
                provider: subProvider,
                url: subApiBaseUrlInput ? subApiBaseUrlInput.value : '',
                key: subApiKeyInput ? subApiKeyInput.value : '',
                model: subApiModelInput ? subApiModelInput.value : '',
                temperature: subTemperatureInput ? parseFloat(subTemperatureInput.value) : 0.1,
                topPEnabled: getToggleVal('sub-api-top-p-enabled'),
                topP: subTopPInput ? parseFloat(subTopPInput.value) : 1.0,
                maxTokensEnabled: getToggleVal('sub-api-max-tokens-enabled'),
                maxTokens: subMaxTokensInput ? (subMaxTokensInput.value ? parseInt(subMaxTokensInput.value) : null) : null,
                presencePenaltyEnabled: getToggleVal('sub-api-presence-penalty-enabled'),
                presencePenalty: subPresencePenaltyInput ? parseFloat(subPresencePenaltyInput.value) : 0,
                frequencyPenaltyEnabled: getToggleVal('sub-api-frequency-penalty-enabled'),
                frequencyPenalty: subFrequencyPenaltyInput ? parseFloat(subFrequencyPenaltyInput.value) : 0
            };
            localStorage.setItem('nrj-sub-api-settings', JSON.stringify(subSettings));
            if (subProvider === 'custom') {
                localStorage.setItem('nrj-sub-api-custom-url', subSettings.url);
            }
        };

        const loadApiSettings = () => {
            try {
                const saved = JSON.parse(localStorage.getItem('nrj-api-settings') || '{}');
                applyPresetValues(saved);
                renderPresets('');

                const subSaved = JSON.parse(localStorage.getItem('nrj-sub-api-settings') || '{}');
                applySubPresetValues(subSaved);
                renderSubPresets('');

            } catch (e) {
                console.error('Failed to load API settings', e);
            }
        };

        if (providerBtns) {
            providerBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const provider = btn.getAttribute('data-provider');
                    
                    providerBtns.forEach(b => {
                        b.classList.remove('active');
                    });
                    btn.classList.add('active');

                    if (provider === 'custom') {
                        // 切回自定义时，恢复上次单独保存的自定义地址
                        const customUrl = localStorage.getItem('nrj-api-custom-url') || '';
                        if (apiBaseUrlInput) apiBaseUrlInput.value = customUrl;
                    } else {
                        // 切换其他服务商时，只填充默认的 Base URL，保留用户手写的 Key 和 Model
                        if (apiBaseUrlInput) apiBaseUrlInput.value = apiProviders[provider].defaultUrl;
                    }
                    
                    if (modelSelect) modelSelect.innerHTML = '<option value="">-- 先拉取，后选择 --</option>';
                    
                    if (presetSelect) presetSelect.value = '';
                    if (btnDeletePreset) btnDeletePreset.style.display = 'none';
                    saveApiSettings();
                });
            });
        }

        if (subProviderBtns) {
            subProviderBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const provider = btn.getAttribute('data-provider');
                    subProviderBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');

                    if (provider === 'custom') {
                        const customUrl = localStorage.getItem('nrj-sub-api-custom-url') || '';
                        if (subApiBaseUrlInput) subApiBaseUrlInput.value = customUrl;
                    } else {
                        if (subApiBaseUrlInput) subApiBaseUrlInput.value = apiProviders[provider].defaultUrl;
                    }
                    
                    if (subModelSelectDropdown) subModelSelectDropdown.innerHTML = '<option value="">-- 先拉取，后选择 --</option>';
                    
                    if (subPresetSelect) subPresetSelect.value = '';
                    if (btnDeleteSubPreset) btnDeleteSubPreset.style.display = 'none';
                    saveApiSettings();
                });
            });
        }
        
        // 当用户手动修改任何设置时，自动将预设下拉框清空状态
        const resetPresetToDefault = () => {
            if (presetSelect && presetSelect.value !== '') {
                presetSelect.value = '';
                if (btnDeletePreset) btnDeletePreset.style.display = 'none';
            }
            saveApiSettings();
        };

        const resetSubPresetToDefault = () => {
            if (subPresetSelect && subPresetSelect.value !== '') {
                subPresetSelect.value = '';
                if (btnDeleteSubPreset) btnDeleteSubPreset.style.display = 'none';
            }
            saveApiSettings();
        };

        if (apiBaseUrlInput) apiBaseUrlInput.addEventListener('input', resetPresetToDefault);
        if (apiKeyInput) apiKeyInput.addEventListener('input', resetPresetToDefault);
        if (apiModelInput) apiModelInput.addEventListener('input', resetPresetToDefault);
        if (maxTokensInput) maxTokensInput.addEventListener('input', resetPresetToDefault);
        if (temperatureInput) temperatureInput.addEventListener('input', resetPresetToDefault);
        if (topPInput) topPInput.addEventListener('input', resetPresetToDefault);
        if (presencePenaltyInput) presencePenaltyInput.addEventListener('input', resetPresetToDefault);
        if (frequencyPenaltyInput) frequencyPenaltyInput.addEventListener('input', resetPresetToDefault);

        if (subApiBaseUrlInput) subApiBaseUrlInput.addEventListener('input', resetSubPresetToDefault);
        if (subApiKeyInput) subApiKeyInput.addEventListener('input', resetSubPresetToDefault);
        if (subApiModelInput) subApiModelInput.addEventListener('input', resetSubPresetToDefault);
        if (subMaxTokensInput) subMaxTokensInput.addEventListener('input', resetSubPresetToDefault);
        if (subTemperatureInput) subTemperatureInput.addEventListener('input', resetSubPresetToDefault);
        if (subTopPInput) subTopPInput.addEventListener('input', resetSubPresetToDefault);
        if (subPresencePenaltyInput) subPresencePenaltyInput.addEventListener('input', resetSubPresetToDefault);
        if (subFrequencyPenaltyInput) subFrequencyPenaltyInput.addEventListener('input', resetSubPresetToDefault);

        loadApiSettings();
    },

    destroy: function(container) {
        console.log('API app destroyed');
    }
};
