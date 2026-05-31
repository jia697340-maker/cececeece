window.ChatDynamicModule = {
    init: function(ctx) {
        this.ctx = ctx;
        this.renderDynamicList();
    },

    renderDynamicList: function() {
        const feedPosts = [
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
        ];

        const dynamicContainer = this.ctx.container.querySelector('#chat-dynamic-container');
        
        if (dynamicContainer) {
            dynamicContainer.innerHTML = '';
            feedPosts.forEach(d => {
                const item = document.createElement('div');
                item.className = 'chat-feed-post';
                
                let imageHtml = '';
                if (d.image) {
                    imageHtml = `
                    <div class="chat-feed-image-box">
                        <img src="${d.image}" class="chat-feed-image">
                    </div>`;
                }

                item.innerHTML = `
                    <div class="chat-feed-header">
                        <div class="chat-feed-avatar" style="background-color: ${d.color}; color: ${d.textColor};">${d.initials}</div>
                        <div class="chat-feed-info">
                            <span class="chat-feed-name">${d.name}</span>
                            <span class="chat-feed-time">${d.time}</span>
                        </div>
                        <button class="chat-feed-more"><i class="ph ph-dots-three"></i></button>
                    </div>
                    <div class="chat-feed-content">${d.content}</div>
                    ${imageHtml}
                    <div class="chat-feed-actions">
                        <button class="chat-feed-action-btn">
                            <i class="ph ph-heart"></i>
                            <span>${d.likes}</span>
                        </button>
                        <button class="chat-feed-action-btn">
                            <i class="ph ph-chat-circle"></i>
                            <span>${d.comments}</span>
                        </button>
                        <button class="chat-feed-action-btn share">
                            <i class="ph ph-share-network"></i>
                        </button>
                    </div>
                `;
                dynamicContainer.appendChild(item);
            });
        }
    }
};
