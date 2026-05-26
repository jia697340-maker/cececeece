window.ChatConstants = {
    ALL_TIMEZONES: [
        { code: '', name: '跟随本地时间 (默认)', offset: '', group: '默认' },
        { code: 'Asia/Shanghai', name: '中国 - 北京/上海', offset: 'GMT+8', group: '亚洲' },
        { code: 'Asia/Taipei', name: '中国 - 台北', offset: 'GMT+8', group: '亚洲' },
        { code: 'Asia/Hong_Kong', name: '中国 - 香港', offset: 'GMT+8', group: '亚洲' },
        { code: 'Asia/Tokyo', name: '日本 - 东京', offset: 'GMT+9', group: '亚洲' },
        { code: 'Asia/Seoul', name: '韩国 - 首尔', offset: 'GMT+9', group: '亚洲' },
        { code: 'Asia/Singapore', name: '新加坡', offset: 'GMT+8', group: '亚洲' },
        { code: 'Asia/Bangkok', name: '泰国 - 曼谷', offset: 'GMT+7', group: '亚洲' },
        { code: 'Asia/Jakarta', name: '印尼 - 雅加达', offset: 'GMT+7', group: '亚洲' },
        { code: 'Asia/Kuala_Lumpur', name: '马来西亚 - 吉隆坡', offset: 'GMT+8', group: '亚洲' },
        { code: 'Asia/Manila', name: '菲律宾 - 马尼拉', offset: 'GMT+8', group: '亚洲' },
        { code: 'Asia/Ho_Chi_Minh', name: '越南 - 胡志明市', offset: 'GMT+7', group: '亚洲' },
        { code: 'Asia/Dubai', name: '阿联酋 - 迪拜', offset: 'GMT+4', group: '亚洲' },
        { code: 'Asia/Kolkata', name: '印度 - 加尔各答', offset: 'GMT+5:30', group: '亚洲' },
        { code: 'Asia/Karachi', name: '巴基斯坦 - 卡拉奇', offset: 'GMT+5', group: '亚洲' },
        { code: 'Asia/Riyadh', name: '沙特阿拉伯 - 利雅得', offset: 'GMT+3', group: '亚洲' },
        { code: 'Asia/Tehran', name: '伊朗 - 德黑兰', offset: 'GMT+3:30', group: '亚洲' },
        
        { code: 'Europe/London', name: '英国 - 伦敦', offset: 'GMT+0', group: '欧洲' },
        { code: 'Europe/Paris', name: '法国 - 巴黎', offset: 'GMT+1', group: '欧洲' },
        { code: 'Europe/Berlin', name: '德国 - 柏林', offset: 'GMT+1', group: '欧洲' },
        { code: 'Europe/Rome', name: '意大利 - 罗马', offset: 'GMT+1', group: '欧洲' },
        { code: 'Europe/Madrid', name: '西班牙 - 马德里', offset: 'GMT+1', group: '欧洲' },
        { code: 'Europe/Amsterdam', name: '荷兰 - 阿姆斯特丹', offset: 'GMT+1', group: '欧洲' },
        { code: 'Europe/Moscow', name: '俄罗斯 - 莫斯科', offset: 'GMT+3', group: '欧洲' },
        { code: 'Europe/Istanbul', name: '土耳其 - 伊斯坦布尔', offset: 'GMT+3', group: '欧洲' },
        { code: 'Europe/Athens', name: '希腊 - 雅典', offset: 'GMT+2', group: '欧洲' },
        { code: 'Europe/Stockholm', name: '瑞典 - 斯德哥尔摩', offset: 'GMT+1', group: '欧洲' },
        
        { code: 'America/New_York', name: '美国 - 纽约 (美东)', offset: 'GMT-5', group: '美洲' },
        { code: 'America/Chicago', name: '美国 - 芝加哥 (美中)', offset: 'GMT-6', group: '美洲' },
        { code: 'America/Denver', name: '美国 - 丹佛 (山区)', offset: 'GMT-7', group: '美洲' },
        { code: 'America/Los_Angeles', name: '美国 - 洛杉矶 (美西)', offset: 'GMT-8', group: '美洲' },
        { code: 'America/Toronto', name: '加拿大 - 多伦多', offset: 'GMT-5', group: '美洲' },
        { code: 'America/Vancouver', name: '加拿大 - 温哥华', offset: 'GMT-8', group: '美洲' },
        { code: 'America/Sao_Paulo', name: '巴西 - 圣保罗', offset: 'GMT-3', group: '美洲' },
        { code: 'America/Argentina/Buenos_Aires', name: '阿根廷 - 布宜诺斯艾利斯', offset: 'GMT-3', group: '美洲' },
        { code: 'America/Mexico_City', name: '墨西哥 - 墨西哥城', offset: 'GMT-6', group: '美洲' },
        { code: 'America/Bogota', name: '哥伦比亚 - 波哥大', offset: 'GMT-5', group: '美洲' },
        { code: 'America/Lima', name: '秘鲁 - 利马', offset: 'GMT-5', group: '美洲' },
        { code: 'America/Santiago', name: '智利 - 圣地亚哥', offset: 'GMT-3', group: '美洲' },
        
        { code: 'Australia/Sydney', name: '澳大利亚 - 悉尼', offset: 'GMT+10', group: '大洋洲' },
        { code: 'Australia/Melbourne', name: '澳大利亚 - 墨尔本', offset: 'GMT+10', group: '大洋洲' },
        { code: 'Australia/Brisbane', name: '澳大利亚 - 布里斯班', offset: 'GMT+10', group: '大洋洲' },
        { code: 'Australia/Perth', name: '澳大利亚 - 珀斯', offset: 'GMT+8', group: '大洋洲' },
        { code: 'Pacific/Auckland', name: '新西兰 - 奥克兰', offset: 'GMT+12', group: '大洋洲' },
        { code: 'Pacific/Honolulu', name: '美国 - 夏威夷', offset: 'GMT-10', group: '大洋洲' },
        { code: 'Pacific/Fiji', name: '斐济', offset: 'GMT+12', group: '大洋洲' },
        
        { code: 'Africa/Cairo', name: '埃及 - 开罗', offset: 'GMT+2', group: '非洲' },
        { code: 'Africa/Johannesburg', name: '南非 - 约翰内斯堡', offset: 'GMT+2', group: '非洲' },
        { code: 'Africa/Lagos', name: '尼日利亚 - 拉各斯', offset: 'GMT+1', group: '非洲' },
        { code: 'Africa/Nairobi', name: '肯尼亚 - 内罗毕', offset: 'GMT+3', group: '非洲' },
        { code: 'Africa/Casablanca', name: '摩洛哥 - 卡萨布兰卡', offset: 'GMT+1', group: '非洲' }
    ],

    feedPosts: [
        {
            id: 1,
            name: '设计团队',
            initials: '设',
            color: '#D9E8DF', textColor: '#35503A',
            time: '2小时前',
            content: '刚刚完成了新一版的 UI 设计，极简主义的风格真的让人心旷神怡。大家觉得怎么样？',
            image: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
            likes: 24,
            comments: 5
        },
        {
            id: 2,
            name: '爱丽丝',
            initials: '爱',
            color: '#E8E1D9', textColor: '#4A3F35',
            time: '5小时前',
            content: '周末去喝了新开的咖啡店，拿铁味道很赞！☕️',
            image: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
            likes: 12,
            comments: 2
        },
        {
            id: 3,
            name: '鲍勃',
            initials: '鲍',
            color: '#D9E2E8', textColor: '#354450',
            time: '昨天',
            content: '今天天气真好，适合出去跑个步。🏃‍♂️',
            image: null,
            likes: 8,
            comments: 1
        }
    ],

    META_PROMPT: `你的真名是 {char_realname}，对方给你取的昵称是 {char_nickname}。

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
你不说"作为AI……"，不用任何客服或助理的语气。`
};
