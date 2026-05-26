import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronRight,
  Image as ImageIcon,
  Type,
  Box,
  Layers,
  Check,
  X,
  Moon,
  LayoutTemplate
} from 'lucide-react';

// --- Types & Data ---

type PopupType = 'none' | 'rename' | 'wallpaper' | 'icon' | 'animation' | 'popupStyle';

const WALLPAPERS = [
  { id: 'aura', name: '极光', class: 'bg-gradient-to-tr from-violet-100 via-fuchsia-50 to-cyan-50' },
  { id: 'midnight', name: '深邃', class: 'bg-gradient-to-tr from-zinc-800 to-zinc-950' },
  { id: 'peach', name: '蜜桃', class: 'bg-gradient-to-tr from-orange-50 to-rose-50' },
  { id: 'mint', name: '薄荷', class: 'bg-gradient-to-tr from-emerald-50 to-teal-50' },
];

const ICONS = [
  { id: 'minimal', name: '极简白', class: 'bg-white border border-zinc-200 shadow-sm' },
  { id: 'dark', name: '暗黑', class: 'bg-zinc-900 shadow-md' },
  { id: 'glass', name: '毛玻璃', class: 'bg-white/30 backdrop-blur-md border border-white/50 shadow-sm' },
  { id: 'gradient', name: '炫彩', class: 'bg-gradient-to-br from-indigo-400 to-purple-400 shadow-md' },
];

const ANIMATIONS = [
  { id: 'bouncy', name: '灵动回弹', desc: '带有弹簧物理效果的活泼过渡' },
  { id: 'smooth', name: '丝滑过渡', desc: '优雅平缓的渐入渐出效果' },
  { id: 'snappy', name: '瞬间响应', desc: '干净利落的线性快速切换' },
];

// --- Reusable Components ---

const Section = ({ children, title }: { children: React.ReactNode; title?: string }) => (
  <div className="mb-8">
    {title && <h2 className="text-[12px] font-medium text-zinc-400 tracking-widest ml-4 mb-2">{title}</h2>}
    <div className="bg-white rounded-[24px] shadow-[0_4px_20px_-10px_rgba(0,0,0,0.03)] overflow-hidden">
      {children}
    </div>
  </div>
);

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  value?: string;
  onClick?: () => void;
  hasBorder?: boolean;
}

const SettingItem = ({ icon, title, value, onClick, hasBorder = true }: SettingItemProps) => (
  <div 
    onClick={onClick}
    className={`flex items-center px-5 py-4 bg-white active:bg-zinc-50/50 transition-colors cursor-pointer ${hasBorder ? 'border-b border-zinc-100/50' : ''}`}
  >
    <div className="text-zinc-800 mr-4 shrink-0 flex items-center justify-center">
      {React.cloneElement(icon as React.ReactElement, { strokeWidth: 1.5, className: "w-5 h-5" })}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[15px] text-zinc-800 tracking-wide">{title}</p>
    </div>
    <div className="ml-3 shrink-0 flex items-center gap-3">
      {value && <span className="text-[14px] text-zinc-400 font-light">{value}</span>}
      <ChevronRight className="w-4 h-4 text-zinc-300" strokeWidth={1.5} />
    </div>
  </div>
);

const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: (val: boolean) => void }) => (
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      onChange(!enabled);
    }}
    className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none ${
      enabled ? 'bg-zinc-900' : 'bg-zinc-200'
    }`}
  >
    <span
      className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-sm ring-0 transition duration-300 ease-in-out ${
        enabled ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
);

// --- Main App Component ---

export default function App() {
  const [activePopup, setActivePopup] = useState<PopupType>('none');
  
  // Customization States
  const [appName, setAppName] = useState('我的应用');
  const [tempName, setTempName] = useState('');
  const [selectedWallpaper, setSelectedWallpaper] = useState(WALLPAPERS[0]);
  const [selectedIcon, setSelectedIcon] = useState(ICONS[0]);
  const [selectedAnimation, setSelectedAnimation] = useState(ANIMATIONS[0]);
  const [popupStyle, setPopupStyle] = useState<'bottom' | 'center'>('center');
  const [darkMode, setDarkMode] = useState(false);

  const openPopup = (type: PopupType) => {
    if (type === 'rename') setTempName(appName);
    setActivePopup(type);
  };

  const closePopup = () => setActivePopup('none');

  const handleRenameSave = () => {
    if (tempName.trim()) setAppName(tempName.trim());
    closePopup();
  };

  // Animation variants based on selected style
  const getModalTransition = () => {
    switch (selectedAnimation.id) {
      case 'bouncy': return { type: "spring", bounce: 0.5, duration: 0.6 };
      case 'snappy': return { type: "spring", bounce: 0, duration: 0.2 };
      case 'smooth': default: return { type: "tween", ease: "easeInOut", duration: 0.3 };
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9FB] font-sans text-zinc-900 selection:bg-zinc-200 flex justify-center">
      {/* Mobile App Container */}
      <div className="w-full max-w-md bg-[#F9F9FB] min-h-screen relative shadow-2xl overflow-x-hidden flex flex-col">
        
        {/* Header */}
        <header className="pt-14 pb-6 px-6 flex items-center justify-center">
          <h1 className="text-[17px] font-medium tracking-widest text-zinc-900">外观设置</h1>
        </header>

        <main className="flex-1 px-5 pb-24 overflow-y-auto">
          
          {/* Live Preview Area - Ultra Minimal */}
          <div className="mb-10 flex flex-col items-center justify-center">
            <div className={`w-44 h-60 rounded-[32px] shadow-sm transition-all duration-500 ${selectedWallpaper.class}`} />
            <p className="text-[11px] text-zinc-400 mt-5 tracking-[0.2em] uppercase">壁纸预览</p>
          </div>

          {/* Home Screen Section */}
          <Section title="主屏幕">
            <SettingItem 
              icon={<ImageIcon />} 
              title="壁纸" 
              value={selectedWallpaper.name}
              onClick={() => openPopup('wallpaper')}
              hasBorder={false}
            />
          </Section>

          {/* App Icon Section */}
          <Section title="应用标识">
            <SettingItem 
              icon={<Box />} 
              title="图标样式" 
              value={selectedIcon.name}
              onClick={() => openPopup('icon')}
            />
            <SettingItem 
              icon={<Type />} 
              title="显示名称" 
              value={appName}
              onClick={() => openPopup('rename')}
              hasBorder={false}
            />
          </Section>

          {/* Interface Section */}
          <Section title="界面交互">
            <SettingItem 
              icon={<LayoutTemplate />} 
              title="弹窗样式" 
              value={popupStyle === 'center' ? '居中弹出' : '底部弹出'}
              onClick={() => openPopup('popupStyle')}
            />
            <SettingItem 
              icon={<Layers />} 
              title="弹窗动效" 
              value={selectedAnimation.name}
              onClick={() => openPopup('animation')}
            />
            <div className="flex items-center px-5 py-4 bg-white active:bg-zinc-50/50 transition-colors cursor-pointer">
              <div className="text-zinc-800 mr-4 shrink-0 flex items-center justify-center">
                <Moon strokeWidth={1.5} className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] text-zinc-800 tracking-wide">深色模式</p>
              </div>
              <div className="ml-3 shrink-0 flex items-center">
                <Toggle enabled={darkMode} onChange={setDarkMode} />
              </div>
            </div>
          </Section>
          
        </main>

        {/* --- POPUPS --- */}
        <AnimatePresence>
          {activePopup !== 'none' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 z-40 bg-zinc-900/20 backdrop-blur-sm flex flex-col justify-end sm:justify-center"
              onClick={closePopup}
            >
              
              {/* 1. Rename Popup (Center Modal) */}
              {activePopup === 'rename' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={getModalTransition()}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white w-[85%] max-w-[300px] mx-auto rounded-[28px] shadow-2xl overflow-hidden p-6"
                >
                  <h3 className="text-[16px] font-medium text-zinc-900 mb-2 text-center tracking-wide">修改名称</h3>
                  <p className="text-[13px] text-zinc-400 mb-6 text-center font-light">请输入新的应用显示名称</p>
                  
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    autoFocus
                    className="w-full bg-zinc-50/50 border border-zinc-200/60 rounded-[16px] px-4 py-3.5 text-[15px] text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400 transition-all mb-6 text-center tracking-wide"
                    placeholder="应用名称"
                  />
                  
                  <div className="flex gap-3">
                    <button
                      onClick={closePopup}
                      className="flex-1 py-3.5 rounded-[16px] bg-zinc-50 text-zinc-600 text-[14px] font-medium active:bg-zinc-100 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleRenameSave}
                      className="flex-1 py-3.5 rounded-[16px] bg-zinc-900 text-white text-[14px] font-medium active:bg-zinc-800 transition-colors"
                    >
                      保存
                    </button>
                  </div>
                </motion.div>
              )}

              {/* 2. Wallpaper Popup (Dynamic Position) */}
              {activePopup === 'wallpaper' && (
                <motion.div
                  initial={popupStyle === 'bottom' ? { opacity: 0, y: "100%" } : { opacity: 0, scale: 0.95 }}
                  animate={popupStyle === 'bottom' ? { opacity: 1, y: 0 } : { opacity: 1, scale: 1 }}
                  exit={popupStyle === 'bottom' ? { opacity: 0, y: "100%" } : { opacity: 0, scale: 0.95 }}
                  transition={getModalTransition()}
                  onClick={(e) => e.stopPropagation()}
                  className={`bg-white shadow-2xl ${popupStyle === 'bottom' ? 'w-full rounded-t-[32px] p-6 pb-12 mt-auto' : 'w-[85%] max-w-[320px] mx-auto rounded-[32px] p-6'}`}
                >
                  {popupStyle === 'bottom' && <div className="w-10 h-1 bg-zinc-200/60 rounded-full mx-auto mb-8" />}
                  
                  <div className="flex justify-between items-center mb-6 px-2">
                    <h3 className="text-[16px] font-medium text-zinc-900 tracking-wide">选择壁纸</h3>
                    {popupStyle === 'center' && (
                      <button onClick={closePopup} className="w-8 h-8 bg-zinc-50 rounded-full flex items-center justify-center active:bg-zinc-100 transition-colors">
                        <X className="w-4 h-4 text-zinc-400" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 px-2">
                    {WALLPAPERS.map((wp) => (
                      <div 
                        key={wp.id}
                        onClick={() => { setSelectedWallpaper(wp); closePopup(); }}
                        className="cursor-pointer group"
                      >
                        <div className={`w-full aspect-[4/5] rounded-[20px] mb-3 relative overflow-hidden ${wp.class} ring-1 ring-offset-2 transition-all ${selectedWallpaper.id === wp.id ? 'ring-zinc-900' : 'ring-transparent group-hover:ring-zinc-200'}`}>
                          {selectedWallpaper.id === wp.id && (
                            <div className="absolute top-3 right-3 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                              <Check className="w-3 h-3 text-zinc-900" strokeWidth={2.5} />
                            </div>
                          )}
                        </div>
                        <p className="text-[13px] text-zinc-600 text-center tracking-wide">{wp.name}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* 3. Icon Popup (Dynamic Position) */}
              {activePopup === 'icon' && (
                <motion.div
                  initial={popupStyle === 'bottom' ? { opacity: 0, y: "100%" } : { opacity: 0, scale: 0.95 }}
                  animate={popupStyle === 'bottom' ? { opacity: 1, y: 0 } : { opacity: 1, scale: 1 }}
                  exit={popupStyle === 'bottom' ? { opacity: 0, y: "100%" } : { opacity: 0, scale: 0.95 }}
                  transition={getModalTransition()}
                  onClick={(e) => e.stopPropagation()}
                  className={`bg-white shadow-2xl ${popupStyle === 'bottom' ? 'w-full rounded-t-[32px] p-6 pb-12 mt-auto' : 'w-[85%] max-w-[320px] mx-auto rounded-[32px] p-6'}`}
                >
                  {popupStyle === 'bottom' && <div className="w-10 h-1 bg-zinc-200/60 rounded-full mx-auto mb-8" />}
                  
                  <div className="flex justify-between items-center mb-6 px-2">
                    <h3 className="text-[16px] font-medium text-zinc-900 tracking-wide">应用图标</h3>
                    {popupStyle === 'center' && (
                      <button onClick={closePopup} className="w-8 h-8 bg-zinc-50 rounded-full flex items-center justify-center active:bg-zinc-100 transition-colors">
                        <X className="w-4 h-4 text-zinc-400" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 px-2">
                    {ICONS.map((icon) => (
                      <div 
                        key={icon.id}
                        onClick={() => { setSelectedIcon(icon); closePopup(); }}
                        className={`flex flex-col items-center justify-center p-5 rounded-[24px] border cursor-pointer transition-all ${selectedIcon.id === icon.id ? 'border-zinc-900 bg-zinc-50/50' : 'border-zinc-100 hover:border-zinc-200'}`}
                      >
                        {/* Empty div for icon, NO SVG */}
                        <div className={`w-12 h-12 rounded-[12px] mb-4 ${icon.class}`} />
                        <p className="text-[13px] text-zinc-700 tracking-wide">{icon.name}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* 4. Animation Style Popup (Dynamic Position) */}
              {activePopup === 'animation' && (
                <motion.div
                  initial={popupStyle === 'bottom' ? { opacity: 0, y: "100%" } : { opacity: 0, scale: 0.95 }}
                  animate={popupStyle === 'bottom' ? { opacity: 1, y: 0 } : { opacity: 1, scale: 1 }}
                  exit={popupStyle === 'bottom' ? { opacity: 0, y: "100%" } : { opacity: 0, scale: 0.95 }}
                  transition={getModalTransition()}
                  onClick={(e) => e.stopPropagation()}
                  className={`bg-white shadow-2xl ${popupStyle === 'bottom' ? 'w-full rounded-t-[32px] p-6 pb-12 mt-auto' : 'w-[85%] max-w-[320px] mx-auto rounded-[32px] p-6'}`}
                >
                  {popupStyle === 'bottom' && <div className="w-10 h-1 bg-zinc-200/60 rounded-full mx-auto mb-8" />}
                  
                  <div className="flex justify-between items-start mb-6 px-2">
                    <div>
                      <h3 className="text-[16px] font-medium text-zinc-900 mb-2 tracking-wide">弹窗动效</h3>
                      <p className="text-[13px] text-zinc-400 font-light">选择界面弹窗的动画过渡效果</p>
                    </div>
                    {popupStyle === 'center' && (
                      <button onClick={closePopup} className="w-8 h-8 bg-zinc-50 rounded-full flex items-center justify-center active:bg-zinc-100 transition-colors shrink-0 ml-4">
                        <X className="w-4 h-4 text-zinc-400" />
                      </button>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2 px-2">
                    {ANIMATIONS.map((anim) => (
                      <div 
                        key={anim.id}
                        onClick={() => { setSelectedAnimation(anim); closePopup(); }}
                        className={`flex items-center p-4 rounded-[20px] border cursor-pointer transition-all ${selectedAnimation.id === anim.id ? 'border-zinc-900 bg-zinc-50/50' : 'border-zinc-100 hover:border-zinc-200'}`}
                      >
                        <div className="flex-1 pl-2">
                          <p className="text-[15px] font-medium text-zinc-800 tracking-wide">{anim.name}</p>
                          <p className="text-[12px] text-zinc-400 mt-1 font-light">{anim.desc}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-2 ${selectedAnimation.id === anim.id ? 'border-zinc-900 bg-zinc-900' : 'border-zinc-200'}`}>
                          {selectedAnimation.id === anim.id && <Check className="w-3 h-3 text-white" strokeWidth={2.5} />}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* 5. Popup Style Selector (Dynamic Position) */}
              {activePopup === 'popupStyle' && (
                <motion.div
                  initial={popupStyle === 'bottom' ? { opacity: 0, y: "100%" } : { opacity: 0, scale: 0.95 }}
                  animate={popupStyle === 'bottom' ? { opacity: 1, y: 0 } : { opacity: 1, scale: 1 }}
                  exit={popupStyle === 'bottom' ? { opacity: 0, y: "100%" } : { opacity: 0, scale: 0.95 }}
                  transition={getModalTransition()}
                  onClick={(e) => e.stopPropagation()}
                  className={`bg-white shadow-2xl ${popupStyle === 'bottom' ? 'w-full rounded-t-[32px] p-6 pb-12 mt-auto' : 'w-[85%] max-w-[320px] mx-auto rounded-[32px] p-6'}`}
                >
                  {popupStyle === 'bottom' && <div className="w-10 h-1 bg-zinc-200/60 rounded-full mx-auto mb-8" />}
                  
                  <div className="flex justify-between items-center mb-6 px-2">
                    <h3 className="text-[16px] font-medium text-zinc-900 tracking-wide">弹窗样式</h3>
                    {popupStyle === 'center' && (
                      <button onClick={closePopup} className="w-8 h-8 bg-zinc-50 rounded-full flex items-center justify-center active:bg-zinc-100 transition-colors">
                        <X className="w-4 h-4 text-zinc-400" />
                      </button>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2 px-2">
                    <div 
                      onClick={() => { setPopupStyle('center'); closePopup(); }}
                      className={`flex items-center p-4 rounded-[20px] border cursor-pointer transition-all ${popupStyle === 'center' ? 'border-zinc-900 bg-zinc-50/50' : 'border-zinc-100 hover:border-zinc-200'}`}
                    >
                      <div className="flex-1 pl-2">
                        <p className="text-[15px] font-medium text-zinc-800 tracking-wide">居中弹出</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-2 ${popupStyle === 'center' ? 'border-zinc-900 bg-zinc-900' : 'border-zinc-200'}`}>
                        {popupStyle === 'center' && <Check className="w-3 h-3 text-white" strokeWidth={2.5} />}
                      </div>
                    </div>
                    <div 
                      onClick={() => { setPopupStyle('bottom'); closePopup(); }}
                      className={`flex items-center p-4 rounded-[20px] border cursor-pointer transition-all ${popupStyle === 'bottom' ? 'border-zinc-900 bg-zinc-50/50' : 'border-zinc-100 hover:border-zinc-200'}`}
                    >
                      <div className="flex-1 pl-2">
                        <p className="text-[15px] font-medium text-zinc-800 tracking-wide">底部弹出</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-2 ${popupStyle === 'bottom' ? 'border-zinc-900 bg-zinc-900' : 'border-zinc-200'}`}>
                        {popupStyle === 'bottom' && <Check className="w-3 h-3 text-white" strokeWidth={2.5} />}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
