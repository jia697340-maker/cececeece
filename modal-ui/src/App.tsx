import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Image as ImageIcon, Link2, RotateCcw, X, Upload, CheckCircle2 } from 'lucide-react';

type ModalType = 'none' | 'image' | 'success';

export default function App() {
  const [activeModal, setActiveModal] = useState<ModalType>('success');

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center justify-center gap-4 font-sans relative overflow-hidden">
      {/* Background ambient blurs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-200/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Controllers to switch modals */}
      <div className="flex items-center gap-4 z-10">
        <button
          onClick={() => setActiveModal('image')}
          className="px-4 py-2.5 bg-white text-slate-800 rounded-xl font-medium shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all flex items-center gap-2.5"
        >
          <div className="w-7 h-7 rounded border border-slate-100 bg-indigo-50 flex items-center justify-center">
            <ImageIcon className="w-4 h-4 text-indigo-500" />
          </div>
          <span className="text-[14px]">图片替换弹窗</span>
        </button>

        <button
          onClick={() => setActiveModal('success')}
          className="px-4 py-2.5 bg-white text-slate-800 rounded-xl font-medium shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all flex items-center gap-2.5"
        >
          <div className="w-7 h-7 rounded border border-slate-100 bg-emerald-50 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-[14px]">拉取成功弹窗</span>
        </button>
      </div>

      <AnimatePresence>
        {activeModal !== 'none' && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[4px]"
              onClick={() => setActiveModal('none')}
            />
            
            <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
              
              {/* === Modal 1: Image Upload (from before) === */}
              {activeModal === 'image' && (
                <motion.div
                  key="modal-image"
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="w-full max-w-[320px] bg-white rounded-[28px] shadow-[0_40px_80px_-16px_rgba(0,0,0,0.2)] overflow-hidden pointer-events-auto absolute"
                >
                  {/* Modern Colorful Banner */}
                  <div className="relative h-[110px] w-full overflow-hidden bg-slate-50">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 opacity-80" />
                    {/* Abstract decorative blobs */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60 translate-x-10 -translate-y-10" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60 -translate-x-10 translate-y-10" />
                    
                    <button 
                      onClick={() => setActiveModal('none')}
                      className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 bg-white/40 hover:bg-white/60 backdrop-blur-md rounded-full p-1.5 transition-colors z-10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="px-6 pb-6 relative">
                    {/* Overlapping App Icon */}
                    <div className="absolute -top-10 left-6 group cursor-pointer">
                      <div className="w-[76px] h-[76px] bg-white rounded-[22px] shadow-lg flex items-center justify-center border border-white/60 -rotate-3 group-hover:rotate-0 transition-transform duration-300">
                        <div className="w-[62px] h-[62px] bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform duration-300">
                          <ImageIcon className="w-7 h-7 text-indigo-500" />
                        </div>
                      </div>
                    </div>

                    <div className="pt-14 pb-5">
                      <h3 className="text-[20px] font-bold text-slate-800 tracking-tight leading-snug">更换图片</h3>
                      <p className="text-[13px] text-slate-500 mt-1.5 leading-relaxed">支持上传本地高清长图、动图，或直接粘贴网络链接。</p>
                    </div>

                    <div className="space-y-2">
                      {/* Primary Button */}
                      <button className="group w-full flex items-center px-4 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all active:scale-[0.98] shadow-md shadow-slate-900/10">
                        <Upload className="w-4 h-4 text-slate-300 group-hover:text-white transition-colors" />
                        <span className="font-medium text-[15px] flex-1 text-left ml-3">上传本地图片</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-white/20 rounded-md text-white/90">Main</span>
                      </button>

                      {/* Secondary Button */}
                      <button className="group w-full flex items-center px-4 py-3.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 transition-all active:scale-[0.98] shadow-sm">
                        <Link2 className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                        <span className="font-medium text-[15px] flex-1 text-left ml-3">使用网络 URL</span>
                      </button>

                      <div className="h-px bg-slate-100 my-2 w-full mx-auto" />

                      {/* Destructive Button */}
                      <button className="group w-full flex items-center px-4 py-3 bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-xl transition-all active:scale-[0.98]">
                        <RotateCcw className="w-4 h-4 text-slate-400 group-hover:text-red-500 transition-colors" />
                        <span className="font-medium text-[14px] flex-1 text-left ml-3">恢复默认设置</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* === Modal 2: Success Alert === */}
              {activeModal === 'success' && (
                <motion.div
                  key="modal-success"
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  transition={{ type: "spring", bounce: 0.4, duration: 0.5 }}
                  className="w-full max-w-[320px] bg-white rounded-[28px] shadow-[0_40px_80px_-16px_rgba(0,0,0,0.2)] overflow-hidden pointer-events-auto absolute"
                >
                  <div className="p-7 text-center relative overflow-hidden">
                     {/* Background soft glow behind icon */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[150px] bg-emerald-400/10 blur-[40px] rounded-full pointer-events-none -z-10" />

                    <div className="mx-auto w-[64px] h-[64px] bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-6 ring-4 ring-white shadow-sm relative">
                       {/* Pinging pulse effect */}
                      <div className="absolute inset-0 bg-emerald-400/20 rounded-2xl animate-ping opacity-50" style={{ animationDuration: '3s' }} />
                      <CheckCircle2 className="w-[32px] h-[32px]" />
                    </div>
                    
                    <h3 className="text-[20px] font-bold text-slate-800 tracking-tight">拉取成功</h3>
                    <p className="text-[14px] text-slate-500 mt-2.5 leading-relaxed px-1">
                      成功拉取到 37 个模型！<br />请在下拉框中选择。
                    </p>

                    <div className="mt-8 flex items-center gap-3">
                      <button 
                        onClick={() => setActiveModal('none')}
                        className="flex-1 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-all active:scale-[0.98] font-medium text-[14px] shadow-sm shadow-slate-200/50"
                      >
                        取消
                      </button>
                      <button 
                        onClick={() => setActiveModal('none')}
                        className="flex-1 py-3 bg-slate-900 border border-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all active:scale-[0.98] font-medium shadow-md shadow-slate-900/10 text-[14px]"
                      >
                        确定
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
