/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

export default function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-4">
      {/* 触发按钮 */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => setIsOpen(true)}
        className="px-6 py-2.5 bg-white border border-zinc-200/80 text-zinc-600 rounded-full text-[14px] shadow-sm hover:border-zinc-300 transition-all"
      >
        显示弹窗
      </motion.button>

      {/* 弹窗组件 */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 浅色背景遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-white/40 backdrop-blur-md z-40"
            />

            {/* 弹窗主体 */}
            <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 12 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white/80 backdrop-blur-2xl rounded-3xl p-8 max-w-[340px] w-full shadow-[0_8px_40px_rgb(0,0,0,0.04)] pointer-events-auto border border-white/60 relative overflow-hidden ring-1 ring-zinc-100/50"
              >
                <div className="flex justify-end mb-6">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-zinc-400 hover:text-zinc-600 transition-colors p-1"
                  >
                    <X size={18} strokeWidth={1.25} />
                  </button>
                </div>

                <div className="px-1">
                  <h2 className="text-[17px] font-medium text-zinc-800 tracking-tight mb-3">
                    系统更新提示
                  </h2>
                  <p className="text-[14px] text-zinc-500 leading-relaxed mb-10 font-normal">
                    这是一个极致简约的设计。摒弃了多余的修饰，大面积的浅色系运用与精心调校的留白，带来无负担的阅读体验。
                  </p>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="w-full py-3 bg-zinc-100/80 text-zinc-800 text-[14px] font-medium rounded-2xl hover:bg-zinc-200/80 transition-all active:scale-[0.98]"
                    >
                      确认
                    </button>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="w-full py-3 bg-transparent text-zinc-400 text-[14px] hover:text-zinc-600 transition-all active:scale-[0.98]"
                    >
                      忽略
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
