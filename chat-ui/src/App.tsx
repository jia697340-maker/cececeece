/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { ChevronLeft, MoreHorizontal, Plus, PawPrint, Edit, Trash2, Pin, Heart, MessageCircle, Share, Settings, User, Bell, Lock, HelpCircle, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, animate } from 'motion/react';

const feedPosts = [
  {
    id: 1,
    name: '设计团队',
    initials: '设',
    color: 'bg-gradient-to-br from-[#D9E8DF] to-[#C4DFC8] text-[#35503A]',
    time: '2小时前',
    content: '刚刚完成了新一版的 UI 设计，极简主义的风格真的让人心旷神怡。大家觉得怎么样？',
    image: 'https://picsum.photos/seed/design/800/600',
    likes: 24,
    comments: 5
  },
  {
    id: 2,
    name: '爱丽丝',
    initials: '爱',
    color: 'bg-gradient-to-br from-[#E8E1D9] to-[#D8CFC4] text-[#4A3F35]',
    time: '5小时前',
    content: '周末去喝了新开的咖啡店，拿铁味道很赞！☕️',
    image: 'https://picsum.photos/seed/coffee/800/800',
    likes: 12,
    comments: 2
  },
  {
    id: 3,
    name: '鲍勃',
    initials: '鲍',
    color: 'bg-gradient-to-br from-[#D9E2E8] to-[#C4D3DF] text-[#354450]',
    time: '昨天',
    content: '今天天气真好，适合出去跑个步。🏃‍♂️',
    image: null,
    likes: 8,
    comments: 1
  }
];

const initialMessages = [
  { id: 1, name: '爱丽丝', initials: '爱', message: '发送了一个附件', time: '14:30', isUnread: true, unreadCount: 2, isOnline: false, color: 'bg-gradient-to-br from-[#E8E1D9] to-[#D8CFC4] text-[#4A3F35]' },
  { id: 2, name: '设计团队', initials: '设', message: '在快拍中提到了你', time: '12:15', isUnread: true, unreadCount: 5, isOnline: true, color: 'bg-gradient-to-br from-[#D9E8DF] to-[#C4DFC8] text-[#35503A]' },
  { id: 3, name: '鲍勃', initials: '鲍', message: '好的，没问题！', time: '昨天', isUnread: false, unreadCount: 0, isOnline: true, color: 'bg-gradient-to-br from-[#D9E2E8] to-[#C4D3DF] text-[#354450]' },
  { id: 4, name: '妈妈', initials: '妈', message: '到家给我打个电话。', time: '星期二', isUnread: false, unreadCount: 0, isOnline: false, color: 'bg-gradient-to-br from-[#E8D9D9] to-[#DFC4C4] text-[#503535]' },
  { id: 5, name: '查理', initials: '查', message: '赞了消息', time: '星期一', isUnread: false, unreadCount: 0, isOnline: false, color: 'bg-gradient-to-br from-[#E5E4E2] to-[#D3D3D3] text-[#111111]' },
  { id: 6, name: '大卫', initials: '大', message: '哈哈对，就是这样', time: '3月12日', isUnread: false, unreadCount: 0, isOnline: false, color: 'bg-gradient-to-br from-[#E8E1D9] to-[#D8CFC4] text-[#4A3F35]' },
  { id: 7, name: '伊芙', initials: '伊', message: '我看一下日历。', time: '3月10日', isUnread: false, unreadCount: 0, isOnline: false, color: 'bg-gradient-to-br from-[#D9E2E8] to-[#C4D3DF] text-[#354450]' },
  { id: 8, name: '弗兰克', initials: '弗', message: '谢谢！', time: '3月9日', isUnread: false, unreadCount: 0, isOnline: false, color: 'bg-gradient-to-br from-[#D9E8DF] to-[#C4DFC8] text-[#35503A]' },
  { id: 9, name: '格蕾丝', initials: '格', message: '5点见。', time: '3月8日', isUnread: false, unreadCount: 0, isOnline: false, color: 'bg-gradient-to-br from-[#E8D9D9] to-[#DFC4C4] text-[#503535]' },
];

function SwipeableItem({ msg, onClick, onDelete, onPin }: any) {
  const x = useMotionValue(0);

  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.x < -50) {
      animate(x, -150, { type: 'spring', stiffness: 300, damping: 30 });
    } else {
      animate(x, 0, { type: 'spring', stiffness: 300, damping: 30 });
    }
  };

  return (
    <div className="relative overflow-hidden bg-white border-b border-gray-50 last:border-none">
      {/* Background Actions */}
      <div className="absolute inset-y-0 right-0 flex items-center justify-end px-5 gap-2 bg-[#F9F9F9] w-full">
        <button 
          onClick={(e) => { e.stopPropagation(); onPin(msg.id); animate(x, 0); }}
          className="px-4 h-10 bg-[#111111] text-white rounded-full flex items-center justify-center text-[13px] font-bold shadow-sm hover:scale-105 transition-transform"
        >
          置顶
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(msg.id); }}
          className="px-4 h-10 bg-[#FF3B30] text-white rounded-full flex items-center justify-center text-[13px] font-bold shadow-sm hover:scale-105 transition-transform"
        >
          删除
        </button>
      </div>

      {/* Foreground Item */}
      <motion.div
        style={{ x }}
        drag="x"
        dragConstraints={{ left: -150, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        onClick={onClick}
        className="relative bg-white flex items-center px-6 py-4 hover:bg-[#F9F9F9] active:bg-[#F5F5F5] transition-colors cursor-pointer group z-10"
      >
        {/* Circular Avatar */}
        <div className={`w-[60px] h-[60px] rounded-full ${msg.color} flex items-center justify-center text-[22px] font-bold flex-shrink-0 relative transition-transform group-active:scale-95 shadow-[0_2px_10px_rgba(0,0,0,0.05)]`}>
          {msg.initials}
          {msg.isOnline && (
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#111111] border-[3px] border-white rounded-full"></div>
          )}
        </div>
        
        {/* Content */}
        <div className="ml-5 flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex justify-between items-baseline mb-1">
            <h2 className="text-[18px] font-extrabold text-[#111111] truncate pr-2 tracking-tight">{msg.name}</h2>
            <span className={`text-[13px] font-bold flex-shrink-0 ${msg.isUnread ? 'text-[#111111]' : 'text-gray-400'}`}>
              {msg.time}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <p className={`text-[15px] truncate pr-4 ${msg.isUnread ? 'text-[#111111] font-bold' : 'text-gray-500 font-medium'}`}>
              {msg.message}
            </p>
            {msg.isUnread && msg.unreadCount > 0 && (
              <span className="bg-[#111111] text-white text-[12px] font-bold px-2 py-0.5 rounded-full min-w-[24px] text-center flex-shrink-0 leading-none">
                {msg.unreadCount}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function App() {
  const [chatList, setChatList] = useState(initialMessages);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState('chat');

  const handleDelete = (id: number) => {
    setChatList(prev => prev.filter(chat => chat.id !== id));
  };

  const handlePin = (id: number) => {
    setChatList(prev => {
      const item = prev.find(chat => chat.id === id);
      if (!item) return prev;
      const filtered = prev.filter(chat => chat.id !== id);
      return [item, ...filtered];
    });
  };

  if (activeChat) {
    return (
      <div className="h-[100dvh] bg-[#F4F4F4] text-black font-sans max-w-md mx-auto relative flex flex-col">
        {/* Floating Island Header */}
        <div className="pt-12 pb-4 px-6 sticky top-0 z-20">
          <header className="bg-white/90 backdrop-blur-xl rounded-[24px] px-5 py-4 flex items-center justify-between shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <button 
              onClick={() => setActiveChat(null)} 
              className="w-10 h-10 bg-[#F5F5F5] rounded-full flex items-center justify-center text-gray-600 hover:bg-[#EEEEEE] transition-colors"
            >
              <ChevronLeft size={20} strokeWidth={2.5} />
            </button>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2">
                {activeChat.isOnline && <div className="w-2 h-2 bg-[#00C853] rounded-full"></div>}
                <span className="text-[16px] font-black tracking-tight text-[#111111]">{activeChat.name}</span>
              </div>
              <span className="text-[11px] font-bold text-gray-400 tracking-widest uppercase mt-0.5">
                {activeChat.isOnline ? 'Active Now' : 'Last seen recently'}
              </span>
            </div>
            <button className="w-10 h-10 bg-[#F5F5F5] rounded-full flex items-center justify-center text-gray-600 hover:bg-[#EEEEEE] transition-colors">
              <MoreHorizontal size={20} strokeWidth={2.5} />
            </button>
          </header>
        </div>

        {/* Chat Messages Area - Instagram Direct / iMessage Style */}
        <div className="flex-1 overflow-y-auto px-4 flex flex-col gap-4 pb-8 pt-2">
          <div className="text-center text-[11px] font-medium text-gray-400 tracking-widest uppercase my-2">
            TODAY 14:30
          </div>

          {/* Them */}
          <div className="flex items-end gap-2">
            <div className={`w-8 h-8 rounded-full ${activeChat.color} flex items-center justify-center text-[12px] font-bold flex-shrink-0`}>
              {activeChat.initials}
            </div>
            <div className="bg-[#EFEFEF] px-4 py-2.5 rounded-[22px] max-w-[75%]">
              <div className="text-[15px] leading-snug text-[#111111]">
                嗨！最近怎么样？周末打算去哪里玩吗？听说新开了一家咖啡店很不错。
              </div>
            </div>
          </div>

          {/* Me */}
          <div className="flex flex-col gap-1 items-end">
            <div className="bg-[#111111] px-4 py-2.5 rounded-[22px] max-w-[75%]">
              <div className="text-[15px] leading-snug text-white">
                挺好的，刚忙完工作。好啊！要不周六下午一起去看看？
              </div>
            </div>
          </div>

          {/* Them */}
          <div className="flex items-end gap-2">
            <div className={`w-8 h-8 rounded-full ${activeChat.color} flex items-center justify-center text-[12px] font-bold flex-shrink-0`}>
              {activeChat.initials}
            </div>
            <div className="bg-[#EFEFEF] px-4 py-2.5 rounded-[22px] max-w-[75%]">
              <div className="text-[15px] leading-snug text-[#111111]">
                {activeChat.message || '那就这么定了！到时候见。'}
              </div>
            </div>
          </div>
          
          <div className="h-2"></div>
        </div>

        {/* Integrated AI Composer Area */}
        <div className="px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-4 bg-gradient-to-t from-[#F4F4F4] via-[#F4F4F4] to-transparent">
          <div className="bg-white p-2.5 rounded-[32px] shadow-[0_10px_40px_rgba(0,0,0,0.06)] flex flex-col gap-2 transition-all focus-within:shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-gray-100">
            {/* Text Input */}
            <div className="px-4 pt-3 pb-1">
              <textarea 
                placeholder="输入消息..." 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={1}
                className="w-full bg-transparent text-[16px] outline-none placeholder:text-gray-400 font-medium resize-none max-h-[100px]" 
              />
            </div>
            
            {/* Action Bar */}
            <div className="flex items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-1">
                {/* Expand Menu Button */}
                <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:bg-[#F5F5F5] hover:text-[#111111] transition-colors">
                  <Plus size={22} strokeWidth={2.5} />
                </button>
                
                {/* Small AI Button (Icon Only) */}
                <button className="w-10 h-10 rounded-full flex items-center justify-center text-[#4A3E6D] hover:bg-[#F0F4FF] transition-colors">
                  <PawPrint size={18} strokeWidth={2.5} />
                </button>
              </div>
              
              {/* Send Button */}
              <button 
                className={`px-5 h-10 rounded-full flex items-center justify-center text-[13px] font-bold transition-all flex-shrink-0 ${inputText.trim() ? 'bg-[#111111] text-white shadow-md' : 'bg-[#F5F5F5] text-gray-400'}`}
              >
                发送
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans max-w-md mx-auto relative pb-[env(safe-area-inset-bottom)]">
      {/* Editorial Header with Actions */}
      <header className="pt-14 pb-6 px-6 flex items-center justify-between relative">
        {activeTab === 'chat' ? (
          <button className="w-10 h-10 bg-[#F5F5F5] rounded-full flex items-center justify-center text-gray-600 hover:bg-[#EEEEEE] transition-colors z-10">
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>
        ) : (
          <div className="w-10 h-10 z-10"></div>
        )}
        <div className="flex flex-col items-center absolute left-1/2 -translate-x-1/2">
          <span className="text-[10px] font-bold tracking-[0.3em] text-gray-400 uppercase mb-1 ml-[0.3em]">
            {activeTab === 'chat' ? 'INBOX' : activeTab === 'feed' ? 'MOMENTS' : 'PROFILE'}
          </span>
          <h1 className="text-[22px] font-black tracking-[0.2em] text-[#111111] ml-[0.2em]">
            {activeTab === 'chat' ? '消息' : activeTab === 'feed' ? '动态' : '设置'}
          </h1>
        </div>
        <button className="w-10 h-10 bg-[#F5F5F5] rounded-full flex items-center justify-center text-gray-600 hover:bg-[#EEEEEE] transition-colors z-10">
          {activeTab === 'chat' ? <Edit size={18} strokeWidth={2.5} /> : activeTab === 'feed' ? <Plus size={18} strokeWidth={2.5} /> : <Settings size={18} strokeWidth={2.5} />}
        </button>
      </header>

      {activeTab === 'chat' && (
        <>
          {/* Minimalist Centered Search */}
          <div className="px-6 pb-6">
            <input 
              type="text" 
              placeholder="搜索联系人或消息..." 
              className="w-full bg-[#F5F5F5] px-5 py-3.5 rounded-2xl text-[14px] text-center outline-none placeholder:text-gray-400 font-bold transition-all focus:bg-[#EEEEEE]" 
            />
          </div>

          {/* Editorial Squarcle Chat List */}
          <main className="pb-32 overflow-x-hidden">
            <AnimatePresence>
              {chatList.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <SwipeableItem 
                    msg={msg} 
                    onClick={() => setActiveChat(msg)} 
                    onDelete={handleDelete}
                    onPin={handlePin}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </main>
        </>
      )}

      {activeTab === 'feed' && (
        <main className="pb-32 overflow-y-auto flex flex-col gap-10 pt-2">
          {feedPosts.map((post) => (
            <div key={post.id} className="px-6 flex flex-col gap-4">
              {/* User Info */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${post.color} flex items-center justify-center text-[14px] font-bold flex-shrink-0`}>
                  {post.initials}
                </div>
                <div className="flex flex-col">
                  <span className="text-[15px] font-bold text-[#111111]">{post.name}</span>
                  <span className="text-[12px] font-medium text-gray-400">{post.time}</span>
                </div>
                <button className="ml-auto text-gray-400 hover:text-[#111111] transition-colors">
                  <MoreHorizontal size={20} />
                </button>
              </div>
              
              {/* Content */}
              <p className="text-[15px] leading-relaxed text-[#111111]">
                {post.content}
              </p>
              
              {/* Image */}
              {post.image && (
                <div className="w-full rounded-[24px] overflow-hidden bg-[#F5F5F5] border border-gray-100">
                  <img src={post.image} alt="Post content" className="w-full h-auto object-cover" referrerPolicy="no-referrer" />
                </div>
              )}
              
              {/* Actions */}
              <div className="flex items-center gap-6 pt-1">
                <button className="flex items-center gap-2 text-gray-500 hover:text-[#111111] transition-colors">
                  <Heart size={20} strokeWidth={2} />
                  <span className="text-[13px] font-bold">{post.likes}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-500 hover:text-[#111111] transition-colors">
                  <MessageCircle size={20} strokeWidth={2} />
                  <span className="text-[13px] font-bold">{post.comments}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-500 hover:text-[#111111] transition-colors ml-auto">
                  <Share size={20} strokeWidth={2} />
                </button>
              </div>
            </div>
          ))}
        </main>
      )}

      {activeTab === 'settings' && (
        <main className="pb-32 overflow-y-auto flex flex-col px-6 pt-2 gap-8">
          {/* User Profile */}
          <div className="flex flex-col items-center mt-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden mb-4 shadow-sm">
              <img src="https://picsum.photos/seed/userprofile/200/200" alt="User Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <h2 className="text-[24px] font-black text-[#111111]">Alex Chen</h2>
            <p className="text-[14px] text-gray-400 font-medium mt-1">alex.chen@example.com</p>
          </div>

          {/* Create Persona Button */}
          <button className="w-full py-5 rounded-[20px] border-2 border-dashed border-gray-200 flex items-center justify-center group hover:border-[#111111] hover:bg-gray-50 transition-all duration-300 active:scale-[0.98] cursor-pointer">
            <span className="text-[14px] font-bold tracking-[0.2em] text-gray-400 group-hover:text-[#111111] transition-colors ml-[0.2em]">新建人设</span>
          </button>

          {/* Settings List */}
          <div className="flex flex-col gap-2">
            <h4 className="text-[12px] font-bold text-gray-400 tracking-wider uppercase mb-2 px-2">通用设置</h4>
            
            {[
              { icon: User, label: '账号与安全' },
              { icon: Bell, label: '消息通知' },
              { icon: Lock, label: '隐私设置' },
              { icon: HelpCircle, label: '帮助与反馈' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-[#F9F9F9] rounded-[20px] hover:bg-[#F5F5F5] transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <item.icon size={18} className="text-[#111111]" />
                  </div>
                  <span className="text-[15px] font-bold text-[#111111]">{item.label}</span>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
              </div>
            ))}
          </div>
        </main>
      )}

      {/* Floating Typographic Pill Navigation */}
      <div className="fixed bottom-8 w-full max-w-md flex justify-center z-50 px-6 pointer-events-none">
        <nav className="bg-[#111111]/95 backdrop-blur-xl p-1.5 rounded-full flex gap-1 shadow-[0_8px_30px_rgba(0,0,0,0.2)] pointer-events-auto">
          <button 
            onClick={() => setActiveTab('chat')}
            className={`px-7 py-3 rounded-full text-[14px] font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === 'chat' ? 'bg-white text-black shadow-sm' : 'text-white/60 hover:text-white'}`}
          >
            聊天
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full leading-none ${activeTab === 'chat' ? 'bg-black text-white' : 'bg-white/20 text-white'}`}>
              7
            </span>
          </button>
          <button 
            onClick={() => setActiveTab('feed')}
            className={`px-7 py-3 rounded-full text-[14px] font-bold transition-all duration-300 ${activeTab === 'feed' ? 'bg-white text-black shadow-sm' : 'text-white/60 hover:text-white'}`}
          >
            动态
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`px-7 py-3 rounded-full text-[14px] font-bold transition-all duration-300 ${activeTab === 'settings' ? 'bg-white text-black shadow-sm' : 'text-white/60 hover:text-white'}`}
          >
            设置
          </button>
        </nav>
      </div>
    </div>
  );
}
