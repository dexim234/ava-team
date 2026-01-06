import { useState, useEffect, useRef, useMemo } from 'react'
import { useThemeStore } from '@/store/themeStore'
import { useAuthStore } from '@/store/authStore'
import { useAdminStore } from '@/store/adminStore'
import { getAiAlerts, addAiAlert, updateAiAlert, deleteAiAlert } from '@/services/firestoreService'
import { AiAlert } from '@/types'
import { Plus, Edit, Trash2, Save, X, Copy, Check, Filter, ArrowUp, ArrowDown, RotateCcw, Calendar, Hash, Coins, TrendingDown, TrendingUp, Activity, Clock, FileText, Image as ImageIcon, AlertTriangle, ChevronDown } from 'lucide-react'

type SortField = 'date' | 'drop' | 'profit'
type SortOrder = 'asc' | 'desc'

export const AiAoAlerts = () => {
    const { theme } = useThemeStore()
    const { user } = useAuthStore()
    const { isAdmin } = useAdminStore()

    const subTextColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
    const headingColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
    const cardBg = theme === 'dark' ? 'bg-[#151a21]/80 backdrop-blur-xl' : 'bg-white/80 backdrop-blur-xl'
    const cardBorder = theme === 'dark' ? 'border-blue-500/30' : 'border-blue-500/20'
    const cardShadow = theme === 'dark' ? 'shadow-[0_8px_32px_rgba(0,0,0,0.4)]' : 'shadow-[0_8px_32px_rgba(0,0,0,0.08)]'

    const [alerts, setAlerts] = useState<AiAlert[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingAlert, setEditingAlert] = useState<AiAlert | null>(null)
    const [copyingId, setCopyingId] = useState<string | null>(null)
    const [isCopyingTable, setIsCopyingTable] = useState(false)

    // Filter states
    const [showFilters, setShowFilters] = useState(false)
    const [specificDate, setSpecificDate] = useState('')
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo] = useState('')
    const [minDrop, setMinDrop] = useState('')
    const [maxDrop, setMaxDrop] = useState('')
    const [minProfit, setMinProfit] = useState('')
    const [maxProfit, setMaxProfit] = useState('')
    const [minMc, setMinMc] = useState('')
    const [maxMc, setMaxMc] = useState('')
    const [sortBy, setSortBy] = useState<SortField>('date')
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

    // Form state for single alert
    const [formData, setFormData] = useState<Partial<AiAlert>>({
        signalDate: new Date().toISOString().split('T')[0],
        signalTime: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        marketCap: '',
        address: '',
        strategy: 'Market Entry',
        maxDrop: '',
        maxDropFromLevel07: '',
        maxProfit: '',
        comment: '',
        isScam: false
    })

    const [alertsToAdd, setAlertsToAdd] = useState<Partial<AiAlert>[]>([])
    const [commonDate, setCommonDate] = useState(new Date().toISOString().split('T')[0])
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)

    useEffect(() => {
        loadAlerts()
    }, [])

    const loadAlerts = async () => {
        setLoading(true)
        const data = await getAiAlerts()
        setAlerts(data)
        setLoading(false)
    }

    const handleAddToList = () => {
        if (!formData.address) {
            alert('Введите адрес токена')
            return
        }

        const newAlert: Partial<AiAlert> = {
            signalDate: commonDate,
            signalTime: formData.signalTime,
            marketCap: formData.marketCap,
            address: formData.address,
            strategy: formData.strategy,
            maxDrop: formData.maxDrop,
            maxDropFromLevel07: formData.maxDropFromLevel07,
            maxProfit: formData.maxProfit,
            comment: formData.comment,
            screenshot: screenshotPreview || undefined,
            isScam: formData.isScam || false
        }

        setAlertsToAdd([...alertsToAdd, newAlert])

        setFormData({
            signalTime: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
            marketCap: '',
            address: '',
            strategy: 'Market Entry',
            maxDrop: '',
            maxDropFromLevel07: '',
            maxProfit: '',
            comment: ''
        })
        setScreenshotPreview(null)
    }

    const handleSaveAll = async () => {
        if (alertsToAdd.length === 0) {
            alert('Добавьте хотя бы один сигнал')
            return
        }

        try {
            const promises = alertsToAdd.map(alert =>
                addAiAlert({
                    ...alert as AiAlert,
                    createdAt: new Date().toISOString(),
                    createdBy: user?.id || 'admin'
                })
            )
            await Promise.all(promises)

            setAlertsToAdd([])
            setFormData({
                signalDate: new Date().toISOString().split('T')[0],
                signalTime: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
                marketCap: '',
                address: '',
                strategy: 'Market Entry',
                maxDrop: '',
                maxProfit: '',
                comment: '',
                isScam: false
            })
            setScreenshotPreview(null)
            setShowModal(false)
            await loadAlerts()
        } catch (error: any) {
            console.error('Error saving alerts:', error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const alertData = {
                ...formData,
                signalDate: commonDate,
                screenshot: screenshotPreview || formData.screenshot
            }
            if (editingAlert) {
                await updateAiAlert(editingAlert.id, alertData as AiAlert)
            } else {
                await addAiAlert({
                    ...alertData as AiAlert,
                    createdAt: new Date().toISOString(),
                    createdBy: user?.id || 'admin'
                })
            }
            setShowModal(false)
            setEditingAlert(null)
            setAlertsToAdd([])
            setFormData({
                signalDate: new Date().toISOString().split('T')[0],
                signalTime: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
                marketCap: '',
                address: '',
                strategy: 'Market Entry',
                maxDrop: '',
                maxProfit: '',
                comment: '',
                isScam: false
            })
            setScreenshotPreview(null)
            await loadAlerts()
        } catch (error: any) {
            console.error('Error saving alert:', error)
        }
    }

    const truncateAddress = (address: string) => {
        if (!address) return '-'
        if (address.length <= 16) return address
        return `${address.slice(0, 6)}...${address.slice(-6)}`
    }

    const copyToClipboard = async (text: string, id: string) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopyingId(id)
            setTimeout(() => setCopyingId(null), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    const copyTableToClipboard = async () => {
        setIsCopyingTable(true)
        try {
            const header = `Дата\tВремя\tMC\tАдрес\tDrop\tПрофит\n`
            const rows = filteredAlerts.map(alert =>
                `${alert.signalDate}\t${alert.signalTime}\t${alert.marketCap || '-'}\t${alert.address}\t${alert.maxDrop || '-'}\t${alert.maxProfit || '-'}`
            ).join('\n')
            await navigator.clipboard.writeText(header + rows)
            setTimeout(() => setIsCopyingTable(false), 2000)
        } catch (err) {
            console.error('Failed to copy table:', err)
            setIsCopyingTable(false)
        }
    }

    const parseValue = (value: string | undefined): number => {
        if (!value) return 0
        const cleaned = value.replace(/[+%]/g, '').toUpperCase()
        if (cleaned.startsWith('X')) {
            const multiplier = parseFloat(cleaned.slice(1))
            return isNaN(multiplier) ? 0 : multiplier * 100
        }
        const num = parseFloat(cleaned)
        return isNaN(num) ? 0 : num
    }

    const parseMarketCap = (value: string | undefined): number => {
        if (!value) return 0
        const cleaned = value.toUpperCase().replace(/[^0-9.]/g, '')
        const num = parseFloat(cleaned)
        if (isNaN(num)) return 0
        if (value.toUpperCase().includes('K')) return num * 1000
        if (value.toUpperCase().includes('M')) return num * 1000000
        if (value.toUpperCase().includes('B')) return num * 1000000000
        return num
    }

    const resetFilters = () => {
        setSpecificDate('')
        setDateFrom('')
        setDateTo('')
        setMinDrop('')
        setMaxDrop('')
        setMinProfit('')
        setMaxProfit('')
        setMinMc('')
        setMaxMc('')
    }

    const filteredAlerts = useMemo(() => {
        let result = [...alerts]

        if (specificDate) result = result.filter(a => a.signalDate === specificDate)
        if (dateFrom) result = result.filter(a => a.signalDate >= dateFrom)
        if (dateTo) result = result.filter(a => a.signalDate <= dateTo)

        if (minDrop) {
            const minVal = parseFloat(minDrop)
            if (!isNaN(minVal)) result = result.filter(a => parseValue(a.maxDrop) >= minVal)
        }
        if (maxDrop) {
            const maxVal = parseFloat(maxDrop)
            if (!isNaN(maxVal)) result = result.filter(a => parseValue(a.maxDrop) <= maxVal)
        }
        
        if (minProfit) {
            const minVal = parseFloat(minProfit)
            if (!isNaN(minVal)) result = result.filter(a => parseValue(a.maxProfit) >= minVal)
        }
        if (maxProfit) {
            const maxVal = parseFloat(maxProfit)
            if (!isNaN(maxVal)) result = result.filter(a => parseValue(a.maxProfit) <= maxVal)
        }
        
        if (minMc || maxMc) {
            const mcStr = alerts[0]?.marketCap?.toLowerCase() || ''
            let mcVal = 0
            if (mcStr.includes('k')) mcVal = parseFloat(mcStr) * 1000
            else if (mcStr.includes('m')) mcVal = parseFloat(mcStr) * 1000000
            else if (mcStr.includes('b')) mcVal = parseFloat(mcStr) * 1000000000
            else mcVal = parseFloat(mcStr)

            if (minMc && mcVal > 0) result = result.filter(a => parseMarketCap(a.marketCap) >= parseFloat(minMc) * 1000000)
            if (maxMc && mcVal > 0) result = result.filter(a => parseMarketCap(a.marketCap) <= parseFloat(maxMc) * 1000000)
        }

        result.sort((a, b) => {
            let comparison = 0
            switch (sortBy) {
                case 'date': comparison = new Date(a.signalDate).getTime() - new Date(b.signalDate).getTime(); break
                case 'drop': comparison = parseValue(a.maxDrop) - parseValue(b.maxDrop); break
                case 'profit': comparison = parseValue(a.maxProfit) - parseValue(b.maxProfit); break
            }
            return sortOrder === 'asc' ? comparison : -comparison
        })
        return result
    }, [alerts, specificDate, dateFrom, dateTo, minDrop, maxDrop, minProfit, maxProfit, minMc, maxMc, sortBy, sortOrder])

    const stats = useMemo(() => {
        const total = filteredAlerts.length
        const totalProfit = filteredAlerts.reduce((sum, a) => sum + parseValue(a.maxProfit), 0)
        const totalDrop = filteredAlerts.reduce((sum, a) => sum + Math.abs(parseValue(a.maxDrop)), 0)
        return { total, totalProfit, totalDrop }
    }, [filteredAlerts])

    const handleDelete = async (id: string) => {
        if (confirm('Вы уверены, что хотите удалить этот сигнал?')) {
            await deleteAiAlert(id)
            await loadAlerts()
        }
    }

    const handleEdit = (alert: AiAlert) => {
        setEditingAlert(alert)
        setFormData(alert)
        setCommonDate(alert.signalDate)
        setScreenshotPreview(alert.screenshot || null)
        setShowModal(true)
    }

    const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('Файл слишком большой. Максимальный размер 5MB')
                return
            }
            const reader = new FileReader()
            reader.onloadend = () => setScreenshotPreview(reader.result as string)
            reader.readAsDataURL(file)
        }
    }

    const removeScreenshot = () => {
        setScreenshotPreview(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    return (
        <div className={`min-h-screen p-6 lg:p-8 ${theme === 'dark' ? 'bg-[#0a0e14]' : 'bg-gray-50'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-blue-500/10 border-blue-500/30'} shadow-inner`}>
                            <Activity className={`w-8 h-8 ${theme === 'dark' ? 'text-white' : 'text-blue-500'}`} />
                        </div>
                        <div className="flex flex-col">
                            <h1 className={`text-3xl font-black ${headingColor}`}>AI AO ALERTS</h1>
                            <p className={`text-sm ${subTextColor}`}>Сигналы от AI AO</p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${stats.total > 0 ? 'bg-emerald-500' : 'bg-gray-500'}`}></div>
                            <span className={`text-sm font-medium ${subTextColor}`}>Всего сигналов: <span className={`font-bold ${headingColor}`}>{stats.total}</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                            <span className={`text-sm font-medium ${subTextColor}`}>Профит: <span className={`font-bold text-emerald-500`}>+{stats.totalProfit.toFixed(1)}</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <TrendingDown className="w-4 h-4 text-rose-500" />
                            <span className={`text-sm font-medium ${subTextColor}`}>Просадка: <span className={`font-bold text-rose-500`}>-{stats.totalDrop.toFixed(1)}%</span></span>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button onClick={copyTableToClipboard} disabled={filteredAlerts.length === 0} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 border ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-300' : 'bg-gray-100 border-gray-200 hover:bg-gray-200 text-gray-700'} disabled:opacity-50`}>
                            {isCopyingTable ? <><Check className="w-4 h-4 text-green-500" /><span>Скопировано</span></> : <><Copy className="w-4 h-4" /><span>Копировать</span></>}
                        </button>

                        <button onClick={() => setShowFilters(!showFilters)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 border ${showFilters ? 'bg-blue-500 border-blue-500 text-white' : theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-300' : 'bg-gray-100 border-gray-200 hover:bg-gray-100 text-gray-700'}`}>
                            <Filter className="w-4 h-4" /><span>Фильтры</span>
                        </button>

                        {(specificDate || dateFrom || dateTo || minDrop || maxDrop || minProfit || maxProfit || minMc || maxMc) && (
                            <button onClick={resetFilters} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 border ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-100 border-gray-200 text-gray-900'}`}>
                                <RotateCcw size={14} className="text-gray-500 transition-transform duration-300" />
                                <span>Сброс</span>
                            </button>
                        )}

                        {isAdmin && (
                            <button onClick={() => { setEditingAlert(null); setAlertsToAdd([]); setFormData({ signalDate: new Date().toISOString().split('T')[0], signalTime: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }), marketCap: '', address: '', strategy: 'Market Entry', maxDrop: '', maxProfit: '', comment: '', isScam: false }); setScreenshotPreview(null); setShowModal(true) }} className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20">
                                <Plus className="w-4 h-4" /><span>Добавить</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Filters */}
                {showFilters && (
                    <div className={`rounded-3xl border ${cardBorder} ${cardBg} p-6 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300 shadow-xl relative overflow-hidden`}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -z-10"></div>

                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl ${theme === 'dark' ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                                    <Filter size={18} />
                                </div>
                                <div>
                                    <h3 className={`text-sm font-bold uppercase tracking-tight ${headingColor}`}>Параметры фильтрации</h3>
                                    <p className={`text-[10px] ${subTextColor}`}>Настройте отображение сигналов</p>
                                </div>
                            </div>
                            <button onClick={resetFilters} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${theme === 'dark' ? 'hover:bg-white/5 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'}`}>
                                <RotateCcw size={14} className="ml-auto" />Сбросить
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-y-6 gap-x-4">
                            <PremiumInput label="Дата" type="date" icon={Calendar} placeholder="Выберите дату..." value={specificDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSpecificDate(e.target.value)} theme={theme} />

                            <div className="grid grid-cols-2 gap-2">
                                <PremiumInput label="Мин. Drop" icon={TrendingDown} placeholder="-50" value={minDrop} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMinDrop(e.target.value)} theme={theme} />
                                <PremiumInput label="Макс. Drop" icon={TrendingDown} placeholder="-5" value={maxDrop} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMaxDrop(e.target.value)} theme={theme} />
                            </div>

                            <PremiumInput label="Мин. Профит" icon={TrendingUp} placeholder="10" value={minProfit} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMinProfit(e.target.value)} theme={theme} />

                            <PremiumSelect value={sortBy} options={[{ value: 'date', label: 'По дате' }, { value: 'drop', label: 'По падению' }, { value: 'profit', label: 'По профиту' }]} onChange={(val: string) => setSortBy(val as SortField)} theme={theme} />

                            <div className="space-y-1.5">
                                <label className={`text-[10px] font-bold uppercase tracking-wider ml-1 opacity-50 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Направление</label>
                                <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all shadow-sm ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white hover:bg-white/10 active:scale-95' : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50 active:scale-95'}`}>
                                    {sortOrder === 'asc' ? <ArrowUp size={16} className="text-blue-500" /> : <ArrowDown size={16} className="text-blue-500" />}
                                    <span>{sortOrder === 'asc' ? 'По возрастанию' : 'По убыванию'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Table */}
                <div className={`${cardBg} ${cardBorder} ${cardShadow} rounded-3xl overflow-hidden`}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className={`border-b ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
                                    <th className={`p-4 text-[10px] font-bold uppercase tracking-wider ${subTextColor} text-center`}>Дата</th>
                                    <th className={`p-4 text-[10px] font-bold uppercase tracking-wider ${subTextColor} text-center`}>Время</th>
                                    <th className={`p-4 text-[10px] font-bold uppercase tracking-wider ${subTextColor} text-center`}>MC</th>
                                    <th className={`p-4 text-[10px] font-bold uppercase tracking-wider ${subTextColor} text-center`}>Адрес</th>
                                    <th className={`p-4 text-[10px] font-bold uppercase tracking-wider ${subTextColor} text-center`}>Стратегия</th>
                                    <th className={`p-4 text-[10px] font-bold uppercase tracking-wider ${subTextColor} text-center`}>Drop</th>
                                    <th className={`p-4 text-[10px] font-bold uppercase tracking-wider ${subTextColor} text-center`}>Drop 0.7</th>
                                    <th className={`p-4 text-[10px] font-bold uppercase tracking-wider ${subTextColor} text-center`}>Профит</th>
                                    <th className={`p-4 text-[10px] font-bold uppercase tracking-wider ${subTextColor} text-center`}>Коммент</th>
                                    {isAdmin && <th className={`p-4 text-[10px] font-bold uppercase tracking-wider ${subTextColor} text-center`}></th>}
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${theme === 'dark' ? 'divide-white/10' : 'divide-gray-100'}`}>
                                {loading ? (
                                    <tr>
                                        <td colSpan={10} className={`p-8 text-center ${subTextColor}`}>Загрузка...</td>
                                    </tr>
                                ) : filteredAlerts.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className={`p-8 text-center ${subTextColor}`}>Сигналы не найдены</td>
                                    </tr>
                                ) : (
                                    filteredAlerts.map((alert) => (
                                        <tr key={alert.id} className={`group transition-colors ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                                            <td className={`p-4 text-sm font-semibold ${headingColor} text-center`}>{alert.signalDate}</td>
                                            <td className={`p-4 text-sm font-mono ${subTextColor} text-center`}>{alert.signalTime}</td>
                                            <td className={`p-4 text-sm font-mono font-bold ${headingColor} text-center`}>{alert.marketCap || '-'}</td>
                                            <td className={`p-4 text-sm font-mono ${subTextColor} text-center`}>
                                                <button onClick={() => copyToClipboard(alert.address, alert.id)} className="flex items-center justify-center gap-1 hover:text-blue-400 transition-colors">
                                                    {truncateAddress(alert.address)}
                                                    {copyingId === alert.id ? <Check size={12} className="ml-auto" /> : <Copy size={12} />}
                                                </button>
                                            </td>
                                            <td className={`p-4 text-sm font-semibold ${subTextColor} text-center`}>{alert.strategy || 'Market Entry'}</td>
                                            <td className={`p-4 text-sm font-mono font-bold ${alert.maxDrop && parseFloat(alert.maxDrop.replace('%', '').replace('X', '').replace('x', '')) < 0 ? 'text-emerald-500' : 'text-rose-500'} text-center`}>
                                                {alert.maxDrop || '-'}
                                            </td>
                                            <td className={`p-4 text-sm font-mono font-bold ${subTextColor} text-center`}>{alert.maxDropFromLevel07 || '-'}</td>
                                            <td className={`p-4 text-sm font-mono font-bold ${alert.maxProfit && parseFloat(alert.maxProfit.replace('%', '').replace('X', '').replace('x', '').replace('+', '')) > 0 ? 'text-emerald-500' : headingColor} text-center`}>
                                                {alert.maxProfit || '-'}
                                            </td>
                                            <td className={`p-4 text-sm ${subTextColor} max-w-xs truncate text-center`}>{alert.comment || '-'}</td>
                                            {isAdmin && (
                                                <td className="p-4">
                                                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => handleEdit(alert)} className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"><Edit size={14} /></button>
                                                        <button onClick={() => handleDelete(alert.id)} className="p-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors"><Trash2 size={14} /></button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className={`w-full max-w-4xl rounded-3xl ${cardBg} ${cardBorder} border shadow-2xl overflow-hidden max-h-[90vh] flex flex-col`}>
                        <div className={`p-6 border-b ${theme === 'dark' ? 'border-white/10' : 'border-gray-100'} flex items-center justify-between`}>
                            <div className="space-y-1">
                                <h3 className={`text-xl font-bold ${headingColor}`}>{editingAlert ? 'Редактировать сигнал' : 'Добавить новый сигнал'}</h3>
                                <p className={`text-xs ${subTextColor}`}>{editingAlert ? 'Измените данные сигнала' : 'Заполните данные сигнала для добавления в журнал'}</p>
                            </div>
                            <button onClick={() => { setShowModal(false); setEditingAlert(null); setAlertsToAdd([]) }} className={`p-2 rounded-lg hover:bg-white/10 ${subTextColor}`}><X size={20} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Left Column */}
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <PremiumInput label="Дата сигнала" type="date" icon={Calendar} value={commonDate} onChange={(e) => setCommonDate(e.target.value)} theme={theme} />
                                        <PremiumInput label="Время (UTC)" type="time" icon={Clock} value={formData.signalTime || ''} onChange={(e) => setFormData({ ...formData, signalTime: e.target.value })} theme={theme} />
                                    </div>

                                    <PremiumInput label="Market Cap" icon={Coins} placeholder="Напр. 300K или 1.5M" value={formData.marketCap || ''} onChange={(e) => setFormData({ ...formData, marketCap: e.target.value })} theme={theme} />

                                    <div className="grid grid-cols-2 gap-4">
                                        <PremiumInput label="Max Drop" icon={TrendingDown} placeholder="-16%" value={formData.maxDrop || ''} onChange={(e) => setFormData({ ...formData, maxDrop: e.target.value })} theme={theme} />
                                        <PremiumInput label="Max Drop (0.7)" icon={TrendingDown} placeholder="-5%" value={formData.maxDropFromLevel07 || ''} onChange={(e) => setFormData({ ...formData, maxDropFromLevel07: e.target.value })} theme={theme} />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className={`text-[10px] font-bold uppercase tracking-wider ml-1 ${subTextColor}`}>Комментарий</label>
                                        <div className="relative">
                                            <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                                            <textarea
                                                rows={3}
                                                placeholder="Дополнительные детали..."
                                                value={formData.comment || ''}
                                                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                                                className={`w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition-all text-sm resize-none ${theme === 'dark' ? 'bg-black/20 border-white/5 text-white focus:border-blue-500/50' : 'bg-gray-50 border-gray-100 text-gray-900 focus:border-blue-500/30'}`}
                                            />
                                        </div>
                                    </div>

                                    <button type="button" onClick={() => setFormData({ ...formData, isScam: !formData.isScam })} className={`w-full p-4 rounded-2xl border-2 border-dashed flex items-center gap-4 transition-all ${formData.isScam ? 'bg-red-500/10 border-red-500/50 text-red-500' : 'bg-black/10 border-white/5 text-gray-500 hover:border-white/10'}`}>
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.isScam ? 'bg-red-500 text-white' : 'bg-white/5'}`}><AlertTriangle size={20} /></div>
                                        <div className="text-left"><h4 className="text-sm font-bold">SCAM ALERT</h4><p className="text-[10px] opacity-70">Пометить как мошеннический</p></div>
                                    </button>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-6">
                                    <div className="space-y-1.5">
                                        <label className={`text-[10px] font-bold uppercase tracking-wider ml-1 ${subTextColor}`}>Стратегия</label>
                                        <select value={formData.strategy || 'Market Entry'} onChange={(e) => setFormData({ ...formData, strategy: e.target.value as 'Фиба' | 'Market Entry' })} className={`w-full px-4 py-3 rounded-xl border outline-none transition-all text-sm font-semibold appearance-none cursor-pointer ${theme === 'dark' ? 'bg-black/20 border-white/5 text-white focus:border-blue-500/50' : 'bg-gray-50 border-gray-100 text-gray-900 focus:border-blue-500/30'}`}>
                                            <option value="Market Entry">Market Entry</option>
                                            <option value="Фиба">Фиба</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className={`text-[10px] font-bold uppercase tracking-wider ml-1 ${subTextColor}`}>Contract Address</label>
                                        <div className="relative">
                                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                            <input type="text" placeholder="Введите адрес контракта..." value={formData.address || ''} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className={`w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition-all text-sm font-mono ${theme === 'dark' ? 'bg-black/20 border-white/5 text-white focus:border-blue-500/50' : 'bg-gray-50 border-gray-100 text-gray-900 focus:border-blue-500/30'}`} />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className={`text-[10px] font-bold uppercase tracking-wider ml-1 ${subTextColor}`}>Max Profit</label>
                                        <div className="relative">
                                            <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                            <input type="text" placeholder="Напр. +28% или X3" value={formData.maxProfit || ''} onChange={(e) => setFormData({ ...formData, maxProfit: e.target.value })} className={`w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition-all text-sm font-mono ${theme === 'dark' ? 'bg-black/20 border-white/5 text-white focus:border-blue-500/50' : 'bg-gray-50 border-gray-100 text-gray-900 focus:border-blue-500/30'}`} />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className={`text-[10px] font-bold tracking-wider ml-1 ${subTextColor}`}>Скриншот графика</label>
                                        <div onClick={() => fileInputRef.current?.click()} className={`group relative h-32 rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center gap-2 ${screenshotPreview ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/10 hover:border-blue-500/30 hover:bg-white/5'}`}>
                                            {screenshotPreview ? (
                                                <>
                                                    <img src={screenshotPreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-40" />
                                                    <div className="relative z-10 flex flex-col items-center gap-1">
                                                        <Check className="w-8 h-8 text-blue-500" />
                                                        <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Фото загружено</span>
                                                    </div>
                                                    <button type="button" onClick={(e) => { e.stopPropagation(); removeScreenshot() }} className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-500 text-white shadow-lg hover:scale-110 transition-transform"><X className="w-4 h-4" /></button>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                        <ImageIcon className="w-5 h-5 text-gray-500" />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className={`text-xs font-bold ${headingColor}`}>Нажмите для загрузки</p>
                                                        <p className={`text-[10px] ${subTextColor} opacity-70`}>PNG, JPG до 5MB</p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleScreenshotChange} className="hidden" />
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            {!editingAlert && (
                                <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center gap-4">
                                    <button onClick={handleAddToList} className="flex-1 w-full py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold flex items-center justify-center gap-2 transition-all"><Plus className="w-5 h-5" />Добавить в список</button>
                                    {alertsToAdd.length > 0 && (
                                        <button onClick={handleSaveAll} className="flex-1 w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"><Save className="w-5 h-5" />Сохранить все ({alertsToAdd.length})</button>
                                    )}
                                </div>
                            )}

                            {editingAlert && (
                                <div className="mt-8 pt-6 border-t border-white/5">
                                    <button onClick={handleSubmit} className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"><Save className="w-5 h-5" />Сохранить изменения</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// Premium Helper Components

interface PremiumInputProps { icon?: any; label?: string; placeholder?: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; theme: string }
const PremiumInput: React.FC<PremiumInputProps> = ({ icon: Icon, label, placeholder, value, onChange, type = "text", theme }) => (
    <div className="space-y-1.5 group/input">
        {label && <label className={`text-[10px] font-bold uppercase tracking-wider ml-1 opacity-50 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{label}</label>}
        <div className="relative">
            {Icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none transition-transform group-focus-within/input:scale-110"><Icon size={14} className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} /></div>}
            <input type={type} value={value} onChange={onChange} placeholder={placeholder} className={`w-full px-4 py-2.5 ${Icon ? 'pl-10' : ''} rounded-xl border text-sm font-semibold transition-all outline-none shadow-sm ${theme === 'dark' ? 'bg-white/5 border-white/5 text-white placeholder:text-gray-600 focus:bg-white/10 focus:border-white/20 focus:ring-4 focus:ring-white/5' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/5 hover:border-gray-300'}`} />
        </div>
    </div>
)

interface PremiumSelectProps { value: string; options: { value: string; label: string }[]; onChange: (val: string) => void; theme: string }
const PremiumSelect: React.FC<PremiumSelectProps> = ({ value, options, onChange, theme }) => {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const selectedOption = options.find(o => o.value === value)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) setIsOpen(false)
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className="relative" ref={containerRef}>
            <div className="flex flex-col space-y-1.5">
                <label className={`text-[10px] font-bold uppercase tracking-wider ml-1 opacity-50 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Сортировать по</label>
                <button type="button" onClick={() => setIsOpen(!isOpen)} className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm font-bold transition-all shadow-sm ${theme === 'dark' ? 'bg-white/5 border-white/5 text-white hover:bg-white/10 hover:border-white/10 active:scale-95' : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50 active:scale-95'}`}>
                    <span className="truncate">{selectedOption?.label}</span>
                    <ChevronDown size={14} className={`text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            </div>
            {isOpen && (
                <div className={`absolute z-50 bottom-full mb-2 w-full min-w-[160px] rounded-xl border shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 ${theme === 'dark' ? 'bg-[#151a21] border-white/10' : 'bg-white border-gray-200'}`}>
                    <div className="p-1 space-y-1">
                        {options.map(opt => (
                            <button key={opt.value} type="button" onClick={() => { onChange(opt.value); setIsOpen(false) }} className={`w-full flex items-center px-4 py-2.5 rounded-lg text-xs font-bold transition-all text-left ${opt.value === value ? theme === 'dark' ? 'bg-white/10 text-white' : 'bg-blue-500/10 text-blue-600' : theme === 'dark' ? 'text-gray-400 hover:bg-white/5 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                                {opt.label}{opt.value === value && <Check size={12} className="ml-auto" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default AiAoAlerts