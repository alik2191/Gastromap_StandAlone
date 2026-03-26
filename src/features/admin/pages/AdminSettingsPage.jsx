import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Settings, Globe, Shield, Activity,
    Save, AlertTriangle, Power, Hammer,
    CheckCircle2, Info, Image as ImageIcon, Upload
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppConfigStore } from '@/store/useAppConfigStore'

const SettingSection = ({ title, icon: Icon, children }) => (
    <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800/50 p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <Icon size={20} />
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{title}</h2>
        </div>
        {children}
    </div>
)

const StatusOption = ({ status, currentStatus, title, description, icon: Icon, color, onClick }) => {
    const isActive = currentStatus === status
    return (
        <button
            onClick={() => onClick(status)}
            className={cn(
                "flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left",
                isActive
                    ? cn("bg-white dark:bg-slate-800 shadow-xl scale-[1.02]", color.replace('text-', 'border-'))
                    : "bg-slate-50 dark:bg-slate-800/30 border-transparent hover:bg-white dark:hover:bg-slate-800"
            )}
        >
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", isActive ? color : "bg-slate-200 dark:bg-slate-700 text-slate-400")}>
                <Icon size={24} />
            </div>
            <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-black leading-none mb-1", isActive ? "text-slate-900 dark:text-white" : "text-slate-500")}>{title}</p>
                <p className="text-[10px] text-slate-400 font-medium truncate">{description}</p>
            </div>
            {isActive && <CheckCircle2 size={20} className={cn("shrink-0", color)} />}
        </button>
    )
}

const LogoUpload = ({ label, value, onUpload }) => {
    const inputRef = useRef(null)
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
            <div
                role="button"
                tabIndex={0}
                aria-label={`Upload ${label}`}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click() }}
                className="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 hover:border-indigo-400 transition-all group overflow-hidden relative"
            >
                {value ? (
                    <img src={value} alt="Logo preview" className="w-full h-full object-contain p-4" />
                ) : (
                    <>
                        <ImageIcon size={24} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Click to Upload</span>
                    </>
                )}
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/png,image/svg+xml,image/jpeg"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) onUpload(URL.createObjectURL(file))
                    }}
                />
            </div>
        </div>
    )
}

const AdminSettingsPage = () => {
    const config = useAppConfigStore()
    const [formData, setFormData] = useState({
        appName: config.appName,
        appDescription: config.appDescription,
        seoKeywords: config.seoKeywords,
        maintenanceMessage: config.maintenanceMessage,
        logoDark: config.logoDark ?? null,
        logoLight: config.logoLight ?? null,
    })
    const [toast, setToast] = useState(null)

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3000)
    }

    const handleSave = () => {
        config.updateSettings(formData)
        showToast('Settings saved successfully.')
    }

    const handleClearCache = () => {
        try {
            const keysToRemove = []
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i)
                if (key && (key.startsWith('nominatim:') || key.startsWith('gastromap:'))) {
                    keysToRemove.push(key)
                }
            }
            keysToRemove.forEach(k => localStorage.removeItem(k))
            showToast(`Cache cleared — ${keysToRemove.length} entries removed.`)
        } catch {
            showToast('Failed to clear cache.', 'error')
        }
    }

    return (
        <div className="space-y-8 pb-20">
            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={cn(
                            "fixed top-24 right-8 z-[9999] px-5 py-3 rounded-2xl text-white text-sm font-semibold shadow-xl border backdrop-blur-md flex items-center gap-2",
                            toast.type === 'error'
                                ? "bg-red-900/90 border-red-500/20"
                                : "bg-slate-900/95 border-white/10"
                        )}
                    >
                        <CheckCircle2 size={14} className={toast.type === 'error' ? "text-red-400" : "text-emerald-400"} />
                        {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">System Settings</h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 opacity-60">GastroOS Configuration • v2.1.0</p>
                </div>
                <button
                    onClick={handleSave}
                    className="h-12 px-8 rounded-xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
                >
                    <Save size={18} /> Save Changes
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* General Settings */}
                <div className="space-y-8">
                    <SettingSection title="General" icon={Settings}>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">App Name</label>
                                <input
                                    type="text"
                                    value={formData.appName}
                                    onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
                                    className="w-full h-14 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
                                    placeholder="GastroMap"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <LogoUpload
                                    label="Logo (Dark)"
                                    value={formData.logoDark}
                                    onUpload={(url) => setFormData(f => ({ ...f, logoDark: url }))}
                                />
                                <LogoUpload
                                    label="Logo (Light)"
                                    value={formData.logoLight}
                                    onUpload={(url) => setFormData(f => ({ ...f, logoLight: url }))}
                                />
                            </div>
                        </div>
                    </SettingSection>

                    <SettingSection title="SEO & Description" icon={Globe}>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Meta Description (SEO)</label>
                                <textarea
                                    value={formData.appDescription}
                                    onChange={(e) => setFormData({ ...formData, appDescription: e.target.value })}
                                    rows={4}
                                    className="w-full bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-all shadow-inner resize-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Keywords (comma-separated)</label>
                                <input
                                    type="text"
                                    value={formData.seoKeywords}
                                    onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })}
                                    className="w-full h-14 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
                                />
                            </div>
                        </div>
                    </SettingSection>
                </div>

                {/* Status & Maintenance */}
                <div className="space-y-8">
                    <SettingSection title="App Status" icon={Activity}>
                        <div className="flex flex-col gap-3">
                            <StatusOption
                                status="active"
                                currentStatus={config.appStatus}
                                title="Live — fully operational"
                                description="App is fully accessible to all users."
                                icon={Power}
                                color="bg-emerald-500 text-emerald-500"
                                onClick={config.setAppStatus}
                            />
                            <StatusOption
                                status="maintenance"
                                currentStatus={config.appStatus}
                                title="Maintenance mode"
                                description="Access restricted, users see a notice."
                                icon={Hammer}
                                color="bg-amber-500 text-amber-500"
                                onClick={config.setAppStatus}
                            />
                            <StatusOption
                                status="down"
                                currentStatus={config.appStatus}
                                title="Offline"
                                description="App is completely unavailable."
                                icon={AlertTriangle}
                                color="bg-rose-500 text-rose-500"
                                onClick={config.setAppStatus}
                            />
                        </div>

                        <AnimatePresence>
                            {config.appStatus !== 'active' && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="mt-8 pt-8 border-t border-slate-50 dark:border-slate-800/50 space-y-4 overflow-hidden"
                                >
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Message shown to users</label>
                                        <textarea
                                            value={formData.maintenanceMessage}
                                            onChange={(e) => setFormData({ ...formData, maintenanceMessage: e.target.value })}
                                            rows={3}
                                            className="w-full bg-slate-50/50 dark:bg-slate-800/50 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl p-6 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-all shadow-inner resize-none"
                                        />
                                    </div>
                                    <div className="bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl p-6 flex gap-4">
                                        <Info className="text-indigo-500 shrink-0" size={20} />
                                        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed italic">
                                            Admins and staff will continue to see the app normally.
                                            Only external users will see this notice.
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </SettingSection>

                    <SettingSection title="Security" icon={Shield}>
                        <div className="bg-rose-50 dark:bg-rose-500/10 rounded-3xl p-8 border border-rose-100 dark:border-rose-500/20">
                            <h3 className="text-sm font-black text-rose-500 uppercase tracking-widest mb-4">Danger Zone</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                                Clears the app's geo-cache (Nominatim responses stored in localStorage).
                                API calls will be made fresh on next visit.
                            </p>
                            <button
                                onClick={handleClearCache}
                                className="w-full h-12 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl border border-rose-500/20 font-black text-[10px] uppercase tracking-widest transition-all active:scale-95"
                            >
                                Clear System Cache
                            </button>
                        </div>
                    </SettingSection>
                </div>
            </div>
        </div>
    )
}

export default AdminSettingsPage
