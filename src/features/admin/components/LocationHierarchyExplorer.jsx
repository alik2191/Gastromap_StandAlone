import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    MapPin, ChevronRight, ArrowLeft, Building2, Star,
    Image as ImageIcon, Eye, EyeOff, Clock, Upload,
    Sun, Moon, Sunset, CloudSun, Calendar, Edit, Trash2,
    Gem, Trophy, X
} from 'lucide-react'
import { cn } from '@/lib/utils'

const LocationHierarchyExplorer = ({ className }) => {
    const [level, setLevel] = useState('countries') // countries | cities | locations | details
    const [history, setHistory] = useState([])
    const [timeOfDay, setTimeOfDay] = useState('day')
    const [selectedLocation, setSelectedLocation] = useState(null)

    // Detect time of day for dynamic city images
    useEffect(() => {
        const hour = new Date().getHours()
        if (hour >= 5 && hour < 12) setTimeOfDay('morning')
        else if (hour >= 12 && hour < 17) setTimeOfDay('day')
        else if (hour >= 17 && hour < 21) setTimeOfDay('evening')
        else setTimeOfDay('night')
    }, [])

    // Mock Data with Images and Status
    const [data, setData] = useState({
        countries: [
            { id: 'pl', name: 'Poland', code: '🇵🇱', count: '12 locs', status: 'active', image: 'https://images.unsplash.com/photo-1519197924294-8ba991629d66?auto=format&fit=crop&q=80&w=600' },
            { id: 'de', name: 'Germany', code: '🇩🇪', count: '8 locs', status: 'active', image: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&q=80&w=600' },
            { id: 'it', name: 'Italy', code: '🇮🇹', count: '15 locs', status: 'coming_soon', image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&q=80&w=600' },
            { id: 'jp', name: 'Japan', code: '🇯🇵', count: '24 locs', status: 'hidden', image: 'https://images.unsplash.com/photo-1528360983277-13d9b152cace?auto=format&fit=crop&q=80&w=600' },
        ],
        cities: {
            'pl': [
                {
                    id: 'krk', name: 'Krakow', count: '8 spots', status: 'active',
                    images: {
                        morning: 'https://images.unsplash.com/photo-1534351590666-13e3e9635009?auto=format&fit=crop&q=80&w=600',
                        day: 'https://images.unsplash.com/photo-1519197924294-8ba991629d66?auto=format&fit=crop&q=80&w=600',
                        evening: 'https://images.unsplash.com/photo-1605130284535-11dd9eedc58a?auto=format&fit=crop&q=80&w=600',
                        night: 'https://images.unsplash.com/photo-1634633722442-c5df977ba229?auto=format&fit=crop&q=80&w=600'
                    }
                },
                {
                    id: 'waw', name: 'Warsaw', count: '4 spots', status: 'coming_soon',
                    images: {
                        morning: 'https://images.unsplash.com/photo-1534351590666-13e3e9635009?auto=format&fit=crop&q=80&w=600',
                        day: 'https://images.unsplash.com/photo-1519197924294-8ba991629d66?auto=format&fit=crop&q=80&w=600',
                        evening: 'https://images.unsplash.com/photo-1605130284535-11dd9eedc58a?auto=format&fit=crop&q=80&w=600',
                        night: 'https://images.unsplash.com/photo-1634633722442-c5df977ba229?auto=format&fit=crop&q=80&w=600'
                    }
                }
            ],
            'de': [
                {
                    id: 'ber', name: 'Berlin', count: '8 spots', status: 'coming_soon',
                    images: {
                        morning: 'https://images.unsplash.com/photo-1560969184-10fe8719e654?auto=format&fit=crop&q=80&w=600',
                        day: 'https://images.unsplash.com/photo-1560969184-10fe8719e654?auto=format&fit=crop&q=80&w=600',
                        evening: 'https://images.unsplash.com/photo-1560969184-10fe8719e654?auto=format&fit=crop&q=80&w=600',
                        night: 'https://images.unsplash.com/photo-1560969184-10fe8719e654?auto=format&fit=crop&q=80&w=600'
                    }
                }
            ],
            // ... strict subset for demo
            'it': [], 'jp': []
        },
        locations: {
            'krk': [
                { id: 1, name: "N'Pizza", category: 'restaurant', rating: 4.8, status: 'Active', address: 'ul. Rajska 3', city: 'Krakow', country: 'Poland', createdAt: '22.01.2024', updatedAt: '24.01.2024', specialTag: 'Must visit', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=600' },
                { id: 4, name: 'Knitted Coffee | Specialty', category: 'cafe', rating: 4.9, status: 'Active', address: 'ul. Starowiślna 10', city: 'Krakow', country: 'Poland', createdAt: '13.01.2024', updatedAt: '20.01.2024', specialTag: 'Hidden Gem', image: 'https://images.unsplash.com/photo-1525610553991-2bede1a236e2?auto=format&fit=crop&q=80&w=600' },
                { id: 5, name: 'Szklarnia | Kawa książki', category: 'cafe', rating: 4.7, status: 'Active', address: 'ul. Krupnicza 12', city: 'Krakow', country: 'Poland', createdAt: '15.01.2024', updatedAt: '18.01.2024', specialTag: null, image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=600' },
                { id: 6, name: 'BRUK Caffe', category: 'cafe', rating: 4.5, status: 'Pending', address: 'ul. Grodzka 3', city: 'Krakow', country: 'Poland', createdAt: '15.01.2024', updatedAt: '15.01.2024', specialTag: null, image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=600' },
                { id: 7, name: 'Dwa Kolory Cafe', category: 'cafe', rating: 4.2, status: 'Active', address: 'ul. Długa 1', city: 'Krakow', country: 'Poland', createdAt: '11.01.2024', updatedAt: '12.01.2024', specialTag: null, image: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&q=80&w=600' },
            ],
            'waw': [], 'ber': [], 'it': [], 'jp': [], 'de': []
        }
    })

    const handleSelect = (item) => {
        if (item.status === 'hidden' || item.status === 'coming_soon') return // Prevent drill down if blocked

        if (level === 'countries') {
            setHistory([...history, { level: 'countries', id: item.id, name: item.name }])
            setLevel('cities')
        } else if (level === 'cities') {
            setHistory([...history, { level: 'cities', id: item.id, name: item.name }])
            setLevel('locations')
        } else if (level === 'locations') {
            setSelectedLocation(item)
            setLevel('details')
        }
    }

    const handleBack = () => {
        if (level === 'details') {
            setSelectedLocation(null)
            setLevel('locations')
            return
        }

        const newHistory = [...history]
        newHistory.pop()
        setHistory(newHistory)

        if (level === 'locations') {
            setLevel('cities')
        } else if (level === 'cities') {
            setLevel('countries')
        }
    }

    const toggleStatus = (e, item, collectionType, parentId = null) => {
        e.stopPropagation() // Prevent card click

        const nextStatus = {
            'active': 'coming_soon',
            'coming_soon': 'hidden',
            'hidden': 'active'
        }[item.status] || 'active'

        // Deep update structure
        const newData = { ...data }
        if (collectionType === 'countries') {
            const idx = newData.countries.findIndex(c => c.id === item.id)
            if (idx !== -1) newData.countries[idx].status = nextStatus
        } else {
            // Cities or Locations
            const collection = newData[collectionType]
            const list = collection[parentId] || []
            const idx = list.findIndex(x => x.id === item.id)
            if (idx !== -1) list[idx].status = nextStatus
        }
        setData(newData)
    }

    const getCurrentItems = () => {
        if (level === 'countries') return { items: data.countries, type: 'countries' }
        if (level === 'details') return { items: [], type: 'details' }

        const parentId = history[history.length - 1]?.id
        if (level === 'cities') return { items: data.cities[parentId] || [], type: 'cities', parentId }
        if (level === 'locations') return { items: data.locations[parentId] || [], type: 'locations', parentId } // Locations usually don't have sub-nav status logic here for simplify
        return { items: [], type: 'none' }
    }

    const { items, type, parentId } = getCurrentItems()

    // Helper to get image based on time of day for cities
    const getItemImage = (item) => {
        if (level === 'cities' && item.images) {
            return item.images[timeOfDay] || item.images.day
        }
        return item.image
    }

    return (
        <div className={cn("bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50 rounded-[32px] p-2 lg:p-6 shadow-sm flex flex-col min-h-[460px] w-full relative transition-all", className, level === 'details' && "lg:col-span-3")}>
            <div className="flex items-center justify-between mb-4 lg:mb-6 px-1 shrink-0">
                <div className="flex items-center gap-3">
                    {level !== 'countries' ? (
                        <button onClick={handleBack} className="p-1.5 -ml-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400">
                            <ArrowLeft size={18} />
                        </button>
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                            <MapPin size={16} />
                        </div>
                    )}
                    <div>
                        <h2 className="text-[10px] lg:text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                            {level === 'countries' ? 'География' : level === 'cities' ? history[0].name : level === 'locations' ? history[1].name : 'Объект'}
                            {level === 'cities' && (
                                <span className="hidden sm:inline-flex p-0.5 px-1.5 bg-slate-100 dark:bg-slate-800 rounded-md text-[9px] text-slate-400 items-center gap-1">
                                    {timeOfDay === 'morning' && <CloudSun size={10} />}
                                    {timeOfDay === 'day' && <Sun size={10} />}
                                    {timeOfDay === 'evening' && <Sunset size={10} />}
                                    {timeOfDay === 'night' && <Moon size={10} />}
                                    {timeOfDay}
                                </span>
                            )}
                        </h2>
                        {level !== 'countries' && level !== 'details' && <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide opacity-60">
                            {level === 'cities' ? 'Выберите город и время' : 'Список локаций'}
                        </p>}
                    </div>
                </div>
                {level === 'locations' && <div className="hidden lg:flex gap-2">
                    <input type="text" placeholder="Поиск..." className="bg-slate-50 dark:bg-slate-950/50 px-3 py-1.5 rounded-xl text-[10px] font-bold border-none outline-none w-32 focus:w-48 transition-all" />
                </div>}
            </div>

            {level === 'details' && selectedLocation ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row gap-6 h-full p-2">
                    <div className="w-full lg:w-1/3 aspect-video lg:aspect-auto lg:h-64 rounded-[24px] overflow-hidden relative group border border-slate-100 dark:border-slate-800">
                        <img src={selectedLocation.image} className="w-full h-full object-cover" alt="Cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold uppercase tracking-widest text-xs cursor-pointer">Изменить фото</div>
                    </div>
                    <div className="flex-1 space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[9px] font-bold uppercase tracking-widest text-slate-500">{selectedLocation.category}</span>
                                    {selectedLocation.specialTag && <span className="px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-[9px] font-bold uppercase tracking-widest text-indigo-500 flex items-center gap-1"><Gem size={10} /> {selectedLocation.specialTag}</span>}
                                </div>
                                <h2 className="text-xl lg:text-3xl font-bold text-slate-900 dark:text-white leading-tight">{selectedLocation.name}</h2>
                                <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5"><MapPin size={12} /> {selectedLocation.city}, {selectedLocation.address}</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-indigo-500 hover:text-white transition-all text-slate-400"><Edit size={16} /></button>
                                <button className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-rose-500 hover:text-white transition-all text-slate-400"><Trash2 size={16} /></button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-slate-50 dark:border-slate-800/50">
                            <div className="space-y-1">
                                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Рейтинг</p>
                                <div className="flex items-center gap-1 text-yellow-500 font-bold text-lg"><Star size={16} className="fill-current" /> {selectedLocation.rating}</div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Статус</p>
                                <div className="flex items-center gap-1.5 text-sm"><div className="w-2 h-2 rounded-full bg-green-500" /> <span className="font-bold text-slate-700 dark:text-slate-200">{selectedLocation.status}</span></div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Создано</p>
                                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{selectedLocation.createdAt}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">ID Локации</p>
                                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 font-mono">#{selectedLocation.id}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            ) : level === 'locations' ? (
                <div className="flex-1 overflow-x-auto no-scrollbar -mx-2 px-2 pb-2">
                    <table className="w-full border-collapse min-w-[700px]">
                        <thead>
                            <tr className="border-b border-slate-50 dark:border-slate-800/50 text-left">
                                <th className="py-3 px-4 text-[9px] font-bold uppercase tracking-widest text-slate-400 w-[30%]">Название</th>
                                <th className="py-3 px-4 text-[9px] font-bold uppercase tracking-widest text-slate-400">Локация</th>
                                <th className="py-3 px-4 text-[9px] font-bold uppercase tracking-widest text-slate-400">Создано</th>
                                <th className="py-3 px-4 text-[9px] font-bold uppercase tracking-widest text-slate-400">Обновлено</th>
                                <th className="py-3 px-4 text-[9px] font-bold uppercase tracking-widest text-slate-400">Метки</th>
                                <th className="py-3 px-4 text-right text-[9px] font-bold uppercase tracking-widest text-slate-400 w-24">Действия</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/30">
                            {items.map((item) => (
                                <tr
                                    key={item.id}
                                    onClick={() => handleSelect(item)}
                                    className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                                >
                                    <td className="py-3 px-4 align-top">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight">{item.name}</span>
                                            <span className="self-start inline-flex px-1.5 py-0.5 rounded-[6px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 text-[9px] font-bold uppercase tracking-wide text-slate-500">{item.category}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 align-top">
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-bold text-slate-900 dark:text-white leading-tight">{item.city}</span>
                                            <span className="text-[9px] font-bold text-slate-400 leading-tight">{item.country}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 align-top">
                                        <span className="text-[11px] font-medium text-slate-500 font-mono tracking-tight">{item.createdAt}</span>
                                    </td>
                                    <td className="py-3 px-4 align-top">
                                        <span className="text-[11px] font-medium text-slate-500 font-mono tracking-tight">{item.updatedAt}</span>
                                    </td>
                                    <td className="py-3 px-4 align-top">
                                        {item.specialTag ? (
                                            <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                                                <Gem size={10} />
                                                <span className="text-[9px] font-bold uppercase tracking-wide whitespace-nowrap">{item.specialTag}</span>
                                            </div>
                                        ) : (
                                            <span className="text-[11px] text-slate-300 dark:text-slate-700">—</span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 text-right align-top">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={(e) => { e.stopPropagation() }} className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"><Edit size={14} /></button>
                                            <button onClick={(e) => { e.stopPropagation() }} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {items.length === 0 && (
                        <div className="py-8 text-center text-slate-400 text-xs font-bold uppercase tracking-widest opacity-50">
                            Нет данных
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 flex-1 overflow-y-auto min-h-0">
                    <AnimatePresence mode="popLayout">
                        {items.map((item) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                onClick={() => handleSelect(item)}
                                className={cn(
                                    "group relative aspect-[4/5] rounded-[24px] overflow-hidden border border-slate-100 dark:border-slate-800/50 transition-all cursor-pointer bg-slate-50 dark:bg-slate-800",
                                    item.status === 'hidden' && "opacity-60 grayscale",
                                    item.status === 'coming_soon' && "cursor-not-allowed"
                                )}
                            >
                                {/* Background Image */}
                                <div className="absolute inset-0">
                                    {getItemImage(item) ? (
                                        <img src={getItemImage(item)} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                            <ImageIcon className="text-slate-300" size={32} />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                </div>

                                {/* Status Badge Overlays */}
                                {item.status === 'coming_soon' && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-20">
                                        <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 flex items-center gap-2">
                                            <Clock size={12} className="text-white" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-white">Coming Soon</span>
                                        </div>
                                    </div>
                                )}

                                {item.status === 'hidden' && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-[2px] z-20">
                                        <div className="bg-black/50 px-3 py-1.5 rounded-xl flex items-center gap-2">
                                            <EyeOff size={12} className="text-white/70" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">Hidden</span>
                                        </div>
                                    </div>
                                )}

                                {/* Top Right Controls (Admin Only) */}
                                {level !== 'locations' && (
                                    <div className="absolute top-2 right-2 flex flex-col gap-2 z-30 translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); /* Mock Upload */ }}
                                            className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors"
                                            title="Загрузить фото"
                                        >
                                            <Upload size={14} />
                                        </button>
                                        <button
                                            onClick={(e) => toggleStatus(e, item, type, parentId)}
                                            className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors"
                                            title={item.status === 'active' ? 'Скрыть' : item.status === 'hidden' ? 'Активировать' : 'Включить'}
                                        >
                                            {item.status === 'active' ? <Eye size={14} /> : item.status === 'hidden' ? <EyeOff size={14} /> : <Clock size={14} />}
                                        </button>
                                    </div>
                                )}

                                {/* Content Bottom */}
                                <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10 transition-transform duration-300 group-hover:-translate-y-2">
                                    <div className="flex items-center gap-2 mb-1">
                                        {item.code && <span className="text-lg">{item.code}</span>}
                                        <h3 className="text-lg font-bold leading-none translate-y-2 group-hover:translate-y-0 transition-transform duration-300">{item.name}</h3>
                                    </div>
                                    <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                        <p className="text-[10px] uppercase tracking-widest font-bold text-white/60">{item.count}</p>
                                        {item.rating && (
                                            <div className="flex items-center gap-1 bg-white/20 px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                                                <Star size={10} className="fill-yellow-400 text-yellow-400" />
                                                <span className="text-[10px] font-bold">{item.rating}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    )
}

export default LocationHierarchyExplorer
