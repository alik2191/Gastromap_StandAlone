import React from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, X } from 'lucide-react'

function ReloadPrompt() {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW()

    const close = () => {
        setOfflineReady(false)
        setNeedRefresh(false)
    }

    return (
        <AnimatePresence>
            {(offlineReady || needRefresh) && (
                <motion.div
                    initial={{ y: 50, opacity: 0, scale: 0.9 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 50, opacity: 0, scale: 0.9 }}
                    className="fixed bottom-24 left-4 right-4 z-[9999] p-5 bg-slate-900/90 text-white rounded-[32px] shadow-[0_20px_50px_rgba(37,99,235,0.3)] flex items-center justify-between gap-4 border border-white/10 backdrop-blur-xl"
                >
                    <div className="flex items-center gap-4">
                        <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-3 rounded-2xl shadow-lg">
                            <RefreshCw size={24} className={needRefresh ? 'animate-spin' : ''} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-base font-black tracking-tight leading-tight">
                                {offlineReady ? 'Ready to work offline' : 'Update available!'}
                            </span>
                            <span className="text-[11px] opacity-70 font-bold uppercase tracking-widest mt-0.5">
                                {offlineReady ? 'GastroMap works without internet' : 'Reload for new features'}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {needRefresh && (
                            <button
                                onClick={() => updateServiceWorker(true)}
                                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-2xl text-xs font-black shadow-[0_4px_15px_rgba(37,99,235,0.4)] active:scale-95 transition-all hover:brightness-110"
                            >
                                Reload
                            </button>
                        )}
                        <button
                            onClick={close}
                            aria-label="Dismiss"
                            className="p-2.5 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors border border-white/5"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default ReloadPrompt
