import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
    Plus, Search, Filter, MoreHorizontal, Edit, Trash2,
    Download, Upload, ChevronRight, Globe, Building2, MapPin,
    CheckCircle, Clock, AlertCircle, Star, ChevronDown, ArrowRight,
    X, LayoutGrid, List as ListIcon, Activity, Zap, Phone, Link as LinkIcon, Tag, Sparkles,
    Instagram, Facebook, Wand2, Image as ImageIcon, Map, CalendarCheck
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { cn } from '@/lib/utils'
import LocationHierarchyExplorer from '../components/LocationHierarchyExplorer'
import ImportWizard from '../components/ImportWizard'
import MapTab from '@/features/dashboard/components/MapTab'
import { useLocationsStore } from '@/features/public/hooks/useLocationsStore'

// Fix for default marker icon issue with Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

function LocationPicker({ position, onLocationSelect }) {
    const map = useMapEvents({
        click(e) {
            onLocationSelect(e.latlng);
        },
    });

    useEffect(() => {
        if (position) {
            map.setView(position, map.getZoom());
        }
    }, [position, map]);

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
}

const AdminLocationsPage = () => {
    const [view, setView] = useState('list')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedLocation, setSelectedLocation] = useState(null)
    const [isSlideOverOpen, setIsSlideOverOpen] = useState(false)
    const [isImportWizardOpen, setIsImportWizardOpen] = useState(false)
    const [viewMode, setViewMode] = useState('list') // 'list' | 'map'
    const [formData, setFormData] = useState(null)
    const location = useLocation()
    const navigate = useNavigate()

    const [locationsList, setLocationsList] = useState([
        { id: 1, name: 'Zen Garden', category: 'Restaurant', cuisine: 'Китайская', city: 'Krakow', country: 'Poland', status: 'Active', rating: 4.8, description: 'Лучший дзен в Кракове', address: 'ul. Kanonicza 12', special_labels: ['Китайская'] },
        { id: 2, name: 'Coffee Hub', category: 'Cafe', cuisine: 'Французская', city: 'Warsaw', country: 'Poland', status: 'Pending', rating: 4.5, description: 'Кофе и работа', address: 'ul. Marszałkowska 8', special_labels: ['Вкусные десерты'] },
        { id: 3, name: 'Pasta Viva', category: 'Restaurant', cuisine: 'Итальянская', city: 'Berlin', country: 'Germany', status: 'Active', rating: 4.2, description: 'Итальянская страсть', address: 'Müllerstraße 15', special_labels: ['Итальянская'] },
        { id: 4, name: 'Sushi Wave', category: 'Sushi', cuisine: 'Японская', city: 'Krakow', country: 'Poland', status: 'Draft', rating: 0.0, description: 'Японская волна', address: 'ul. Grodzka 3', special_labels: ['Японская'] },
    ])

    const handleCreateNew = () => {
        const emptyLocation = {
            id: 'NEW',
            name: '',
            category: 'Cafe',
            city: '',
            country: '',
            address: '',
            description: '',
            insider_tip: '',
            must_try: '',
            price_range: '$$',
            website: '',
            phone: '',
            opening_hours: '',
            booking_url: '',
            social_instagram: '',
            social_facebook: '',
            image_url: '',
            images: [],
            latitude: 50.0647,
            longitude: 19.9450,
            tags: [],
            best_time: [],
            special_labels: [],
            cuisine: '',
            is_hidden_gem: false,
            is_featured: false,
            status: 'Draft'
        }
        setSelectedLocation(emptyLocation)
        setFormData(emptyLocation)
        setIsSlideOverOpen(true)
    }

    const handleEdit = (loc) => {
        setSelectedLocation(loc)
        setFormData({
            id: loc.id,
            name: loc.name || '',
            category: loc.category || 'Cafe',
            city: loc.city || '',
            country: loc.country || '',
            address: loc.address || '',
            description: loc.description || '',
            insider_tip: loc.insider_tip || '',
            must_try: loc.must_try || '',
            price_range: loc.price_range || '$$',
            website: loc.website || '',
            phone: loc.phone || '',
            opening_hours: loc.opening_hours || '',
            booking_url: loc.booking_url || '',
            social_instagram: loc.social_instagram || '',
            social_facebook: loc.social_facebook || '',
            image_url: loc.image_url || '',
            images: loc.images || (loc.image_url ? [loc.image_url] : []),
            latitude: loc.latitude || 50.0647,
            longitude: loc.longitude || 19.9450,
            tags: loc.tags || [],
            best_time: loc.best_time || [],
            special_labels: loc.special_labels || [],
            cuisine: loc.cuisine || '',
            is_hidden_gem: loc.is_hidden_gem || false,
            is_featured: loc.is_featured || false
        })
        setIsSlideOverOpen(true)
    }

    useEffect(() => {
        const params = new URLSearchParams(location.search)
        if (params.get('create') === 'true') {
            handleCreateNew()
            // Clear params to prevent re-triggering on refresh
            navigate(location.pathname, { replace: true })
        } else if (params.get('import') === 'true') {
            setIsImportWizardOpen(true)
            navigate(location.pathname, { replace: true })
        }
    }, [location.search])


    const stats = [
        { label: 'Всего', val: '456', icon: MapPin, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
        { label: 'В очереди', val: '12', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10' },
        { label: 'Сегодня', val: '+5', icon: Zap, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-500/10' },
    ]

    const handleApprove = (id) => setLocationsList(prev => prev.map(l => l.id === id ? { ...l, status: 'Active' } : l))

    const categories = [
        'Cafe', 'Restaurant', 'Street Food', 'Bar', 'Market',
        'Bakery', 'Winery', 'Store', 'Coffee Shop', 'Pastry Shop'
    ]

    const LABEL_GROUPS = {
        "Кухня и Меню": [
            "Авторская кухня", "Веганское меню", "Вкусные десерты", "Завтраки целый день",
            "Импортные продукты", "Местные продукты", "Меню завтраков", "Меню ланча", "Фьюжен",
            "Итальянская", "Французская", "Японская", "Китайская", "Греческая", "Испанская",
            "Мексиканская", "Тайская", "Грузинская", "Польская", "Израильская", "Американская",
            "Средиземноморская", "Индийская", "Вьетнамская", "Турецкая"
        ].sort(),
        "Бар и Напитки": [
            "Авторские коктейли", "Винная карта", "Гостевые смены", "Дегустация вин",
            "DJ сеты", "Крафтовое пиво", "Миксология (без меню)", "Спешиалти кофе", "Широкий выбор джина"
        ].sort(),
        "Атмосфера": [
            "Живописный вид", "Живая музыка", "Коворкинг", "Настольные игры",
            "Оживленная атмосфера", "Романтическая атмосфера", "Скрытый вход (Speakeasy)",
            "Счастливые часы", "Тематический интерьер", "Тихая атмосфера", "Уютно"
        ].sort(),
        "Удобства и Сервис": [
            "Балкончики", "Детская игровая зона", "Детские стульчики", "Доставка",
            "Инклюзивность", "Любимое у местных", "Парковка", "Pet friendly",
            "Самовывоз", "Терраса во дворе", "Терраса на крыше", "WiFi"
        ].sort(),
        "Награды и Особое": [
            "Гид Мишлен", "Звезда Мишлен", "Кальян", "Поздний ужин"
        ].sort()
    }

    const BEST_TIMES = [
        { id: 'morning', label: 'Утро', icon: Clock },
        { id: 'day', label: 'День', icon: Clock },
        { id: 'evening', label: 'Вечер', icon: Clock },
        { id: 'late_night', label: 'Поздняя ночь', icon: Clock }
    ]

    const addImageUrl = (url) => {
        if (!url) return;
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, url],
            image_url: prev.image_url || url // Set as main if it's the first one
        }))
    }

    const removeImage = (index) => {
        setFormData(prev => {
            const newImages = prev.images.filter((_, i) => i !== index);
            return {
                ...prev,
                images: newImages,
                image_url: prev.image_url === prev.images[index] ? (newImages[0] || '') : prev.image_url
            }
        })
    }

    const renderListView = (filtered) => (
        <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-900/50">
                        <th className="px-6 py-4 text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-widest pl-8 lg:pl-10">Объект</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-widest">Локация</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-widest">Рейтинг</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-widest">Статус</th>
                        <th className="px-6 py-4 text-right pr-8 lg:pr-10"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                    {filtered.map((loc, i) => (
                        <tr key={loc.id} onClick={() => handleEdit(loc)} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all group cursor-pointer border-none leading-none">
                            <td className="px-6 py-4 pl-8 lg:pl-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner shrink-0">
                                        <Building2 size={18} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[13px] font-bold text-slate-900 dark:text-white truncate leading-tight">{loc.name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black shrink-0">{loc.category}</p>
                                            {loc.cuisine && (
                                                <Badge variant="secondary" className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[8px] h-4 px-1.5 font-black border-none uppercase tracking-widest shrink-0">
                                                    {loc.cuisine}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-[11px] font-bold flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                    <MapPin size={12} className="text-slate-300 dark:text-slate-600" />
                                    <span>{loc.city}</span>
                                    <span className="opacity-30">/</span>
                                    <span className="opacity-60">{loc.country}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-1">
                                    <Star size={12} className={cn("fill-current", loc.rating > 0 ? "text-yellow-500" : "text-slate-200 dark:text-slate-800")} />
                                    <span className="text-[11px] font-bold">{loc.rating > 0 ? loc.rating : '—'}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className={cn(
                                    "inline-flex items-center p-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider",
                                    loc.status === 'Active' ? 'bg-green-50 dark:bg-green-500/5 text-green-600' :
                                        loc.status === 'Pending' ? 'bg-orange-50 dark:bg-orange-500/5 text-orange-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'
                                )}>
                                    <div className={cn("w-1.5 h-1.5 rounded-full mr-2", loc.status === 'Active' ? 'bg-green-500' : loc.status === 'Pending' ? 'bg-orange-500' : 'bg-slate-300')} />
                                    {loc.status}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right pr-8 lg:pr-10">
                                <button className="p-2 rounded-xl text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all">
                                    <MoreHorizontal size={18} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )

    return (
        <div className="space-y-6 lg:space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                <div>
                    <h1 className="text-xl lg:text-3xl font-bold text-slate-900 dark:text-white leading-none tracking-tight">Локации</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-1.5 text-xs lg:text-base">База объектов и инструменты модерации.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto p-1 bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/20 dark:border-slate-800/50">
                    <button
                        onClick={() => setIsImportWizardOpen(true)}
                        className="flex-1 sm:px-6 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-sm active:scale-95 transition-all"
                    >
                        Импорт
                    </button>
                    <button
                        onClick={handleCreateNew}
                        className="flex-1 sm:px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                    >
                        Создать
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-3 lg:gap-8">
                {stats.map((s, i) => (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} key={i} className="bg-white dark:bg-slate-900/50 p-4 lg:p-6 rounded-[28px] lg:rounded-[40px] border border-slate-100 dark:border-slate-800/50 shadow-sm flex flex-col sm:flex-row items-center gap-3 lg:gap-5 group hover:border-indigo-500/10 transition-all">
                        <div className={cn("w-10 h-10 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner overflow-hidden relative", s.bg, s.color)}>
                            <s.icon size={20} className="lg:w-6 lg:h-6 group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="text-center sm:text-left min-w-0">
                            <p className="text-[9px] lg:text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-1">{s.label}</p>
                            <p className="text-sm lg:text-2xl font-bold text-slate-900 dark:text-white leading-none tracking-tight truncate">{s.val}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Content Card */}
            <div className="bg-white dark:bg-slate-900/50 rounded-[32px] lg:rounded-[48px] border border-slate-100 dark:border-slate-800/50 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                <div className="p-4 lg:p-10 border-b border-slate-50 dark:border-slate-800/50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="flex gap-1.5 p-1 bg-slate-50 dark:bg-slate-950/50 rounded-2xl w-full lg:w-fit overflow-x-auto no-scrollbar border border-slate-100/50 dark:border-slate-800/50">
                        {[
                            { id: 'list', label: 'Все объекты', icon: ListIcon },
                            { id: 'moderation', label: 'В очереди', icon: AlertCircle, count: 2 }
                        ].map(tab => (
                            <button key={tab.id} onClick={() => setView(tab.id)} className={cn(
                                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                                view === tab.id ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            )}>
                                <tab.icon size={14} />{tab.label}
                                {tab.count > 0 && <span className="w-5 h-5 flex items-center justify-center bg-indigo-500 text-white rounded-lg text-[9px] ml-1 shadow-lg shadow-indigo-500/20">{tab.count}</span>}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-4 w-full lg:w-auto">
                        <div className="flex gap-1.5 p-1 bg-slate-50 dark:bg-slate-950/30 rounded-2xl border border-slate-100/50 dark:border-slate-800/50">
                            <button
                                onClick={() => setViewMode('list')}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                                    viewMode === 'list' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-400'
                                )}
                            >
                                Список
                            </button>
                            <button
                                onClick={() => setViewMode('map')}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                                    viewMode === 'map' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-400'
                                )}
                            >
                                Карта
                            </button>
                        </div>

                        <div className="relative flex-1 lg:w-80 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={16} />
                            <input type="text" placeholder="Поиск объектов..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950/30 border-none rounded-2xl text-[13px] font-medium outline-none focus:ring-2 ring-indigo-500/10 transition-all font-black leading-none" />
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex flex-col pt-2 font-black leading-none">
                    <AnimatePresence mode="wait">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={view}>
                            {view === 'list' && (
                                viewMode === 'list' ? renderListView(locationsList) : (
                                    <div className="h-[600px] w-full p-4 lg:p-10">
                                        <MapTab />
                                    </div>
                                )
                            )}
                            {view === 'moderation' && (
                                <div className="p-8 lg:p-14 space-y-6">
                                    {locationsList.filter(l => l.status === 'Pending').map(loc => (
                                        <div key={loc.id} className="bg-slate-50/50 dark:bg-slate-800/30 rounded-[32px] border border-slate-100 dark:border-slate-800/50 p-6 flex flex-col sm:flex-row items-center justify-between gap-6 group hover:border-indigo-500/10 transition-all">
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 rounded-[24px] bg-white dark:bg-slate-800 flex items-center justify-center text-slate-300 shadow-sm group-hover:scale-105 transition-transform"><Building2 size={24} /></div>
                                                <div>
                                                    <h3 className="text-lg lg:text-xl font-bold text-slate-900 dark:text-white leading-none mb-2">{loc.name}</h3>
                                                    <p className="text-xs font-medium text-slate-400 flex items-center gap-1.5"><MapPin size={12} /> {loc.city}, {loc.country}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-3 w-full sm:w-auto">
                                                <button onClick={() => handleApprove(loc.id)} className="flex-1 sm:px-8 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[20px] font-bold text-[10px] uppercase tracking-widest active:scale-95 transition-all">Одобрить</button>
                                                <button className="flex-1 sm:px-8 py-3.5 bg-white dark:bg-slate-800 text-red-500 rounded-[20px] font-bold text-[10px] uppercase tracking-widest border border-slate-100 dark:border-slate-700 transition-all">Отмена</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            <AnimatePresence>
                {isSlideOverOpen && formData && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSlideOverOpen(false)} className="fixed inset-0 z-[100] bg-slate-900/10 backdrop-blur-md" />
                        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 250 }} className="fixed top-0 right-0 w-full sm:w-[600px] bg-white dark:bg-slate-900 h-full z-[110] flex flex-col shadow-2xl overflow-hidden font-sans">

                            {/* Header */}
                            <div className="p-6 lg:p-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800/50 flex justify-between items-center shrink-0">
                                <div className="flex items-center gap-4 lg:gap-5">
                                    <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                                        <Building2 size={20} className="lg:w-6 lg:h-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg lg:text-2xl font-bold text-slate-900 dark:text-white leading-none mb-1.5">
                                            {selectedLocation.id === 'NEW' ? 'Новый объект' : 'Редактирование'}
                                        </h2>
                                        <p className="text-[9px] lg:text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em] leading-none">
                                            {selectedLocation.id === 'NEW' ? 'Черновик Gastro AI' : `ID: #${selectedLocation.id}`}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => setIsSlideOverOpen(false)} aria-label="close-panel" className="p-2.5 lg:p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-xl lg:rounded-2xl hover:rotate-90 transition-all"><X size={18} className="lg:w-5 lg:h-5" /></button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-10 lg:space-y-12 custom-scrollbar relative">

                                {/* Section: AI Magic */}
                                <div className="p-6 rounded-[28px] bg-gradient-to-br from-indigo-600 to-indigo-700 text-white relative overflow-hidden shadow-lg shadow-indigo-500/20 group border border-white/10 transition-all hover:shadow-indigo-500/30">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 blur-2xl group-hover:bg-white/20 transition-all duration-700" />
                                    <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
                                        <div className="flex items-center gap-3 shrink-0">
                                            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md border border-white/10 group-hover:bg-white/20 transition-all">
                                                <Sparkles size={18} className="text-amber-300 animate-pulse" />
                                            </div>
                                            <div>
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] leading-none mb-1">Gastro AI</h4>
                                                <p className="text-[8px] font-bold text-white/50 whitespace-nowrap">Умное заполнение</p>
                                            </div>
                                        </div>

                                        <div className="flex-1 w-full flex gap-3">
                                            <div className="relative flex-1 group/input">
                                                <input
                                                    type="text"
                                                    className="w-full pl-5 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold placeholder:text-white/30 outline-none focus:bg-white/10 focus:border-white/20 transition-all"
                                                    placeholder="Название и город..."
                                                />
                                                <Wand2 size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/input:text-white/60 group-focus-within/input:scale-110 transition-all" />
                                            </div>
                                            <button className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg active:scale-[0.96] hover:bg-indigo-50 transition-all shrink-0">
                                                Заполнить
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Section: General */}
                                <div className="space-y-8">
                                    <div className="flex items-center gap-3 border-l-4 border-indigo-500 pl-4">
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white">Основная информация</h3>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] ml-1">Название объекта *</label>
                                            <div className="relative group">
                                                <input
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full px-6 py-4.5 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border-2 border-transparent focus:border-indigo-500/20 focus:bg-white dark:focus:bg-slate-800 font-bold text-sm outline-none transition-all"
                                                    placeholder="Напр. Zen Garden"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] ml-1">Тип / Категория</label>
                                                <div className="relative">
                                                    <select
                                                        value={formData.category}
                                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                                        className="w-full px-6 py-4 bg-slate-50/40 dark:bg-slate-800/40 rounded-2xl border-none font-bold text-xs outline-none focus:ring-4 ring-indigo-500/5 transition-all appearance-none"
                                                    >
                                                        {categories.map(cat => (
                                                            <option key={cat} value={cat}>{cat}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] ml-1">Основная кухня</label>
                                                <div className="relative">
                                                    <select
                                                        value={formData.cuisine}
                                                        onChange={e => setFormData({ ...formData, cuisine: e.target.value })}
                                                        className="w-full px-6 py-4 bg-slate-50/40 dark:bg-slate-800/40 rounded-2xl border-none font-bold text-xs outline-none focus:ring-4 ring-indigo-500/5 transition-all appearance-none"
                                                    >
                                                        <option value="">Не выбрано</option>
                                                        {[
                                                            "Итальянская", "Французская", "Японская", "Китайская", "Греческая", "Испанская",
                                                            "Мексиканская", "Тайская", "Грузинская", "Польская", "Израильская", "Американская",
                                                            "Средиземноморская", "Индийская", "Вьетнамская", "Турецкая"
                                                        ].sort().map(cuisine => (
                                                            <option key={cuisine} value={cuisine}>{cuisine}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] ml-1">Диапазон цен</label>
                                            <div className="relative">
                                                <select
                                                    value={formData.price_range}
                                                    onChange={e => setFormData({ ...formData, price_range: e.target.value })}
                                                    className="w-full px-6 py-4 bg-slate-50/40 dark:bg-slate-800/40 rounded-2xl border-none font-bold text-xs outline-none focus:ring-4 ring-indigo-500/5 transition-all appearance-none"
                                                >
                                                    <option value="$">$ (Дешево)</option>
                                                    <option value="$$">$$ (Средне)</option>
                                                    <option value="$$$">$$$ (Дорого)</option>
                                                    <option value="$$$$">$$$$ (Люкс)</option>
                                                </select>
                                                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section: Location */}
                                <div className="space-y-8">
                                    <div className="flex items-center gap-3 border-l-4 border-indigo-500 pl-4">
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white">Геопозиция и Адрес</h3>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] ml-1">Страна</label>
                                                <input
                                                    type="text"
                                                    value={formData.country}
                                                    onChange={e => setFormData({ ...formData, country: e.target.value })}
                                                    className="w-full px-6 py-4 bg-slate-50/40 dark:bg-slate-800/40 rounded-2xl border-none font-bold text-xs outline-none focus:ring-4 ring-indigo-500/5 transition-all"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] ml-1">Город</label>
                                                <input
                                                    type="text"
                                                    value={formData.city}
                                                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                                                    className="w-full px-6 py-4 bg-slate-50/40 dark:bg-slate-800/40 rounded-2xl border-none font-bold text-xs outline-none focus:ring-4 ring-indigo-500/5 transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] ml-1">Полный адрес</label>
                                            <div className="relative group">
                                                <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors w-4 h-4" />
                                                <input
                                                    type="text"
                                                    value={formData.address}
                                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                                    className="w-full pl-14 pr-6 py-4.5 bg-slate-50/40 dark:bg-slate-800/40 rounded-2xl border-none font-bold text-xs outline-none focus:ring-4 ring-indigo-500/5 transition-all"
                                                    placeholder="Улица, дом, район..."
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] ml-1 text-emerald-500/80">Широта (Lat)</label>
                                                <input
                                                    type="number"
                                                    step="0.000001"
                                                    value={formData.latitude}
                                                    onChange={e => setFormData({ ...formData, latitude: e.target.value })}
                                                    className="w-full px-6 py-4 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-2xl border-none font-bold text-xs outline-none focus:ring-4 ring-emerald-500/10 transition-all font-mono"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] ml-1 text-emerald-500/80">Долгота (Lng)</label>
                                                <input
                                                    type="number"
                                                    step="0.000001"
                                                    value={formData.longitude}
                                                    onChange={e => setFormData({ ...formData, longitude: e.target.value })}
                                                    className="w-full px-6 py-4 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-2xl border-none font-bold text-xs outline-none focus:ring-4 ring-emerald-500/10 transition-all font-mono"
                                                />
                                            </div>
                                        </div>

                                        {/* Mini Map */}
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] ml-1">Предпросмотр на карте</label>
                                            <div className="h-[220px] w-full rounded-[32px] border-4 border-slate-50 dark:border-slate-800/50 relative z-0 overflow-hidden shadow-inner">
                                                <MapContainer
                                                    center={[formData.latitude || 50.0647, formData.longitude || 19.9450]}
                                                    zoom={15}
                                                    style={{ height: '100%', width: '100%' }}
                                                >
                                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                                    <LocationPicker
                                                        position={[formData.latitude, formData.longitude]}
                                                        onLocationSelect={(latlng) => setFormData({ ...formData, latitude: latlng.lat, longitude: latlng.lng })}
                                                    />
                                                </MapContainer>
                                            </div>
                                            <p className="text-[9px] font-bold text-slate-400 text-center uppercase tracking-[0.2em] italic mt-2 opacity-60">Кликните по карте, чтобы изменить координаты</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Section: Contacts & Socials */}
                                <div className="space-y-8">
                                    <div className="flex items-center gap-3 border-l-4 border-indigo-500 pl-4">
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white">Контакты и Сети</h3>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] ml-1">Сайт</label>
                                                <div className="relative group">
                                                    <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors w-4 h-4" />
                                                    <input
                                                        type="url"
                                                        value={formData.website}
                                                        onChange={e => setFormData({ ...formData, website: e.target.value })}
                                                        className="w-full pl-14 pr-6 py-4.5 bg-slate-50/40 dark:bg-slate-800/40 rounded-2xl border-none font-bold text-xs outline-none focus:ring-4 ring-indigo-500/5 transition-all"
                                                        placeholder="Website URL"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] ml-1">Телефон</label>
                                                <div className="relative group">
                                                    <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors w-4 h-4" />
                                                    <input
                                                        type="tel"
                                                        value={formData.phone}
                                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                        className="w-full pl-14 pr-6 py-4.5 bg-slate-50/40 dark:bg-slate-800/40 rounded-2xl border-none font-bold text-xs outline-none focus:ring-4 ring-indigo-500/5 transition-all"
                                                        placeholder="Телефон"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase text-indigo-500 tracking-[0.2em] ml-1">Забронировать столик (URL / API)</label>
                                            <div className="relative group">
                                                <CalendarCheck className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-400 group-focus-within:scale-110 transition-all w-4 h-4" />
                                                <input
                                                    type="url"
                                                    value={formData.booking_url}
                                                    onChange={e => setFormData({ ...formData, booking_url: e.target.value })}
                                                    className="w-full pl-14 pr-6 py-5 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-[28px] border-2 border-indigo-500/10 font-bold text-xs outline-none focus:ring-4 ring-indigo-500/20 transition-all text-indigo-900 dark:text-indigo-200"
                                                    placeholder="Ссылка на бронирование..."
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] ml-1">Instagram</label>
                                                <div className="relative group">
                                                    <Instagram className="absolute left-6 top-1/2 -translate-y-1/2 text-pink-500 group-focus-within:scale-110 transition-all w-4 h-4" />
                                                    <input
                                                        type="text"
                                                        value={formData.social_instagram}
                                                        onChange={e => setFormData({ ...formData, social_instagram: e.target.value })}
                                                        className="w-full pl-14 pr-6 py-4 bg-slate-50/40 dark:bg-slate-800/40 rounded-2xl border-none font-bold text-xs outline-none focus:ring-4 ring-pink-500/10 transition-all"
                                                        placeholder="@username"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] ml-1">Facebook</label>
                                                <div className="relative group">
                                                    <Facebook className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500 group-focus-within:scale-110 transition-all w-4 h-4" />
                                                    <input
                                                        type="text"
                                                        value={formData.social_facebook}
                                                        onChange={e => setFormData({ ...formData, social_facebook: e.target.value })}
                                                        className="w-full pl-14 pr-6 py-4 bg-slate-50/40 dark:bg-slate-800/40 rounded-2xl border-none font-bold text-xs outline-none focus:ring-4 ring-blue-500/10 transition-all"
                                                        placeholder="facebook.com/..."
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section: Media Gallery */}
                                <div className="space-y-8">
                                    <div className="flex items-center gap-3 border-l-4 border-indigo-500 pl-4">
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white">Медиа-галерея</h3>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-4">

                                            <div className="space-y-4">
                                                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1">Фотографии ({formData.images.length})</label>

                                                <div className="grid grid-cols-4 gap-4">
                                                    {formData.images.map((img, idx) => (
                                                        <div key={idx} className={cn(
                                                            "relative aspect-square rounded-2xl overflow-hidden group border-2 transition-all",
                                                            formData.image_url === img ? "border-indigo-500 shadow-lg shadow-indigo-500/10" : "border-transparent"
                                                        )}>
                                                            <img src={img} alt="Location photo option" className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-2">
                                                                <button
                                                                    onClick={() => setFormData({ ...formData, image_url: img })}
                                                                    className="p-2 bg-indigo-500 text-white rounded-lg hover:scale-110 transition-transform"
                                                                >
                                                                    <Star size={12} fill={formData.image_url === img ? "white" : "none"} />
                                                                </button>
                                                                <button
                                                                    onClick={() => removeImage(idx)}
                                                                    className="p-2 bg-red-500 text-white rounded-lg hover:scale-110 transition-transform"
                                                                >
                                                                    <Trash2 size={12} />
                                                                </button>
                                                            </div>
                                                            {formData.image_url === img && (
                                                                <div className="absolute top-2 left-2 bg-indigo-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-md">Main</div>
                                                            )}
                                                        </div>
                                                    ))}

                                                    <button
                                                        onClick={() => {
                                                            const url = prompt('Введите URL изображения:');
                                                            if (url) addImageUrl(url);
                                                        }}
                                                        className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-500 hover:border-indigo-500 transition-all"
                                                    >
                                                        <Plus size={20} />
                                                        <span className="text-[8px] font-black uppercase mt-1">Добавить</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>


                                {/* Section: Content & AI */}
                                <div className="space-y-8 pb-10">
                                    <div className="flex items-center gap-3 border-l-4 border-indigo-500 pl-4">
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white">Описание и контент</h3>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2.5">
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1">Описание</label>
                                                <button className="flex items-center gap-1.5 text-indigo-500 text-[9px] font-black uppercase tracking-widest hover:bg-indigo-50 dark:hover:bg-slate-800 px-3 py-1.5 rounded-lg transition-all">
                                                    <Sparkles size={12} /> AI Улучшить
                                                </button>
                                            </div>
                                            <textarea
                                                rows={4}
                                                value={formData.description}
                                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                className="w-full px-6 py-5 bg-slate-50/50 dark:bg-slate-800/50 rounded-3xl border-none font-medium text-[13px] leading-relaxed outline-none shadow-inner resize-y min-h-[120px] focus:ring-2 ring-indigo-500/10 transition-all font-sans"
                                            />
                                        </div>

                                        <div className="space-y-2.5">
                                            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1 text-orange-400">Insider Tip</label>
                                            <textarea
                                                rows={2}
                                                value={formData.insider_tip}
                                                onChange={e => setFormData({ ...formData, insider_tip: e.target.value })}
                                                className="w-full px-6 py-4 bg-orange-500/5 rounded-2xl border border-orange-500/10 font-medium text-[12px] leading-relaxed outline-none focus:ring-2 ring-orange-500/10 transition-all italic text-orange-900 dark:text-orange-200 resize-y min-h-[80px]"
                                                placeholder="Секреты, лучшие места, лайфхаки..."
                                            />
                                        </div>

                                        <div className="space-y-2.5">
                                            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1 text-emerald-500">Must Try</label>
                                            <textarea
                                                rows={2}
                                                value={formData.must_try}
                                                onChange={e => setFormData({ ...formData, must_try: e.target.value })}
                                                className="w-full px-6 py-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 font-bold text-xs outline-none focus:ring-2 ring-emerald-500/10 transition-all text-emerald-900 dark:text-emerald-200 resize-y min-h-[80px]"
                                                placeholder="Напр. Фирменный латте, Краковская паста"
                                            />
                                        </div>

                                        <div className="space-y-2.5">
                                            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1">Теги (Tags)</label>
                                            <div className="flex flex-wrap gap-2 p-1">
                                                <div className="flex items-center gap-2 w-full">
                                                    <Tag size={14} className="text-slate-300" />
                                                    <input
                                                        type="text"
                                                        value={formData.tags.join(', ')}
                                                        onChange={e => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()) })}
                                                        className="flex-1 bg-transparent border-none outline-none font-bold text-xs text-slate-600 dark:text-slate-400"
                                                        placeholder="coffee, cozy, work, pizza..."
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Options */}
                                <div className="p-8 rounded-[40px] bg-slate-900 dark:bg-white text-white dark:text-slate-900 relative overflow-hidden shadow-2xl">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full -translate-y-16 translate-x-16 blur-3xl" />
                                    <div className="relative z-10 space-y-6">
                                        <div className="flex items-center gap-3">
                                            <Activity className="text-indigo-400" size={20} />
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Настройки публикации</h4>
                                        </div>

                                        <div className="flex flex-col gap-5">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Sparkles className="text-amber-400" size={16} />
                                                    <span className="text-[11px] font-bold uppercase tracking-widest">Hidden Gem</span>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.is_hidden_gem}
                                                    onChange={e => setFormData({ ...formData, is_hidden_gem: e.target.checked })}
                                                    className="w-10 h-5 rounded-full appearance-none bg-slate-800 dark:bg-slate-200 checked:bg-indigo-500 relative transition-all cursor-pointer before:content-[''] before:absolute before:left-1 before:top-1 before:w-3 before:h-3 before:bg-white dark:before:bg-slate-900 before:rounded-full before:transition-all checked:before:translate-x-5"
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Star className="text-indigo-400" size={16} />
                                                    <span className="text-[11px] font-bold uppercase tracking-widest">Featured (Рекомендуемое)</span>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.is_featured}
                                                    onChange={e => setFormData({ ...formData, is_featured: e.target.checked })}
                                                    className="w-10 h-5 rounded-full appearance-none bg-slate-800 dark:bg-slate-200 checked:bg-indigo-500 relative transition-all cursor-pointer before:content-[''] before:absolute before:left-1 before:top-1 before:w-3 before:h-3 before:bg-white dark:before:bg-slate-900 before:rounded-full before:transition-all checked:before:translate-x-5"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section: Best Time & Special Labels */}
                                <div className="space-y-10 pb-10">
                                    <div className="flex items-center gap-3 border-l-4 border-indigo-500 pl-4">
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white">Метки и Особенности</h3>
                                    </div>

                                    <div className="space-y-8">
                                        {/* Best Time to Visit */}
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em] ml-1">Лучшее время для посещения</label>
                                            <div className="flex flex-wrap gap-3">
                                                {BEST_TIMES.map(time => {
                                                    const isSelected = formData.best_time?.includes(time.id);
                                                    return (
                                                        <button
                                                            key={time.id}
                                                            type="button"
                                                            onClick={() => {
                                                                const current = formData.best_time || [];
                                                                const next = isSelected
                                                                    ? current.filter(t => t !== time.id)
                                                                    : [...current, time.id];
                                                                setFormData({ ...formData, best_time: next });
                                                            }}
                                                            className={cn(
                                                                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border",
                                                                isSelected
                                                                    ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                                                                    : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-500 hover:border-indigo-500/30"
                                                            )}
                                                        >
                                                            <time.icon size={14} />
                                                            {time.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Specialized Labels */}
                                        <div className="space-y-8">
                                            {Object.entries(LABEL_GROUPS).map(([group, labels]) => (
                                                <div key={group} className="space-y-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800/50"></div>
                                                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300 dark:text-slate-600">{group}</span>
                                                        <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800/50"></div>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {labels.map(label => {
                                                            const isSelected = formData.special_labels?.includes(label);
                                                            return (
                                                                <button
                                                                    key={label}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const current = formData.special_labels || [];
                                                                        const next = isSelected
                                                                            ? current.filter(l => l !== label)
                                                                            : [...current, label];
                                                                        setFormData({ ...formData, special_labels: next });
                                                                    }}
                                                                    className={cn(
                                                                        "px-4 py-2 rounded-lg text-[10px] font-bold transition-all border",
                                                                        isSelected
                                                                            ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-md shadow-slate-900/10"
                                                                            : "bg-slate-50/50 dark:bg-slate-800/50 border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                                    )}
                                                                >
                                                                    {label}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-6 lg:p-10 border-t border-slate-50 dark:border-slate-800/50 flex gap-4 shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl relative z-10">
                                <button className="flex-1 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[20px] lg:rounded-[24px] font-bold text-[10px] lg:text-[11px] uppercase tracking-[0.2em] shadow-2xl active:scale-[0.97] transition-all hover:shadow-indigo-500/20 border-none outline-none">
                                    {selectedLocation.id === 'NEW' ? 'Создать объект' : 'Сохранить изменения'}
                                </button>
                                <button onClick={() => setIsSlideOverOpen(false)} className="px-6 lg:px-10 py-4 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-[20px] lg:rounded-[24px] font-bold text-[10px] lg:text-[11px] uppercase tracking-[0.2em] hover:text-slate-900 dark:hover:text-white transition-all border-none outline-none">Отмена</button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Import Wizard Modal */}
            <AnimatePresence>
                {isImportWizardOpen && (
                    <ImportWizard
                        isOpen={isImportWizardOpen}
                        onClose={() => setIsImportWizardOpen(false)}
                        onImportComplete={() => {
                            // Optionally refresh list
                            console.log('Import successful')
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}

export default AdminLocationsPage
