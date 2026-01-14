import React, { useState, useMemo, useEffect } from 'react'
import { useThemeStore } from '@/store/themeStore'
import { useAuthStore } from '@/store/authStore'
import { useAdminStore } from '@/store/adminStore'
import { Plus, X, Copy, TrendingUp, DollarSign, TrendingDown, Calculator, Image as ImageIcon, Eye, User, Edit2, Trash2 } from 'lucide-react'
import { getFasolTriggerAlerts, addFasolTriggerAlert, updateFasolTriggerAlert, deleteFasolTriggerAlert } from '@/services/firestoreService'

// Types
interface OurDealSignal {
  id: string
  contract: string
  marketCap: string
  liq: string
  hold: string
  top10: string
  drop07: string
  profit: string
  screenshot?: string
  signalDate: string
  signalTime: string
  createdAt: string
  createdBy: string
}

// Get current Moscow time (UTC+3)
const getMoscowDate = () => {
  const now = new Date()
  const moscowTime = new Date(now.getTime() + 3 * 60 * 60 * 1000)
  return moscowTime.toISOString().split('T')[0]
}

const getMoscowDateTime = (date: string, time: string) => {
  return `${date}T${time}:00`
}

// Format Moscow date for display
const formatMoscowDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })
}

export const FasolSignalsStrategy = () => {
  const { theme } = useThemeStore()
  const { user } = useAuthStore()
  const { isAdmin } = useAdminStore()

  const [deals, setDeals] = useState<OurDealSignal[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [copyFeedback, setCopyFeedback] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showScreenshotModal, setShowScreenshotModal] = useState(false)
  const [currentScreenshot, setCurrentScreenshot] = useState<string | null>(null)
  const [currentDealInfo, setCurrentDealInfo] = useState<{ date: string; time: string; contract: string } | null>(null)

  const [newDeal, setNewDeal] = useState<Partial<OurDealSignal>>({
    contract: '',
    marketCap: '',
    liq: '',
    hold: '',
    top10: '',
    drop07: '',
    profit: ''
  })

  const dateValue = getMoscowDate()
  const timeValue = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', hour12: false })

  const mutedColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
  const headingColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
  const hoverBg = theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-50'
  const cardBg = theme === 'dark' ? 'bg-[#151a21]/80 backdrop-blur-xl' : 'bg-white/80 backdrop-blur-xl'
  const cardBorder = theme === 'dark' ? 'border-emerald-500/30' : 'border-emerald-500/20'
  const cardShadow = theme === 'dark' ? 'shadow-[0_8px_32px_rgba(0,0,0,0.4)]' : 'shadow-[0_8px_32px_rgba(0,0,0,0.08)]'

  useEffect(() => {
    loadDeals()
  }, [])

  const loadDeals = async () => {
    try {
      const alerts = await getFasolTriggerAlerts()
      const convertedDeals: OurDealSignal[] = alerts.map(alert => ({
        id: alert.id,
        contract: alert.address,
        marketCap: alert.marketCap || '',
        liq: alert.liq || '-',
        hold: alert.hold || '-',
        top10: alert.top10 || '-',
        drop07: alert.maxDropFromLevel07 || '-',
        profit: alert.maxProfit || '-',
        screenshot: alert.screenshot,
        signalDate: alert.signalDate,
        signalTime: alert.signalTime,
        createdAt: getMoscowDateTime(alert.signalDate, alert.signalTime),
        createdBy: alert.createdBy
      }))
      setDeals(convertedDeals)
    } catch (error) {
      console.error('Error loading deals:', error)
    }
  }

  const stats = useMemo(() => {
    const total = deals.length
    const avgProfit = total > 0 ? deals.reduce((sum, d) => sum + parseFloat(d.profit.replace(/[^0-9.-]/g, '') || '0'), 0) / total : 0
    const avgDrop = total > 0 ? deals.reduce((sum, d) => sum + Math.abs(parseFloat(d.drop07.replace(/[^0-9.-]/g, '') || '0')), 0) / total : 0
    return { total, avgProfit, avgDrop }
  }, [deals])

  const truncateAddress = (address: string) => {
    if (!address) return '-'
    if (address.length <= 7) return address
    return `${address.slice(0, 3)}...${address.slice(-3)}`
  }

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const copyTableToClipboard = async () => {
    try {
      const header = `№\tДата\tВремя\tКонтракт\tMC\tLiq\tHold\tTop-10\tDROP 0.7\tПрофит\n`
      const rows = deals.map((deal, idx) =>
        `${idx + 1}\t${formatMoscowDate(deal.signalDate)}\t${deal.signalTime}\t${deal.contract}\t${deal.marketCap}\t${deal.liq}\t${deal.hold}\t${deal.top10}\t${deal.drop07}\t${deal.profit}`
      ).join('\n')
      await navigator.clipboard.writeText(header + rows)
      setCopyFeedback(true)
      setTimeout(() => setCopyFeedback(false), 2000)
    } catch (err) {
      console.error('Failed to copy table:', err)
    }
  }

  const openAddModal = () => {
    setEditingId(null)
    setNewDeal({
      contract: '',
      marketCap: '',
      liq: '',
      hold: '',
      top10: '',
      drop07: '',
      profit: ''
    })
    setShowModal(true)
  }

  const openEditModal = (deal: OurDealSignal) => {
    setEditingId(deal.id)
    setNewDeal({
      contract: deal.contract,
      marketCap: deal.marketCap,
      liq: deal.liq,
      hold: deal.hold,
      top10: deal.top10,
      drop07: deal.drop07,
      profit: deal.profit,
      screenshot: deal.screenshot
    })
    setShowModal(true)
  }

  const confirmDelete = (id: string) => {
    setDeletingId(id)
    setShowDeleteModal(true)
  }

  const handleDeleteDeal = async () => {
    if (deletingId) {
      await deleteFasolTriggerAlert(deletingId)
      await loadDeals()
      setShowDeleteModal(false)
      setDeletingId(null)
    }
  }

  const openScreenshotModal = (screenshot: string, deal: OurDealSignal) => {
    setCurrentScreenshot(screenshot)
    setCurrentDealInfo({
      date: formatMoscowDate(deal.signalDate),
      time: deal.signalTime,
      contract: deal.contract
    })
    setShowScreenshotModal(true)
  }

  const handleAddDeal = async () => {
    if (!newDeal.contract || !newDeal.marketCap) return

    try {
      await addFasolTriggerAlert({
        address: newDeal.contract,
        marketCap: newDeal.marketCap,
        liq: newDeal.liq || undefined,
        hold: newDeal.hold || undefined,
        top10: newDeal.top10 || undefined,
        maxDropFromLevel07: newDeal.drop07 || undefined,
        maxProfit: newDeal.profit || undefined,
        screenshot: newDeal.screenshot || undefined,
        signalDate: dateValue,
        signalTime: timeValue,
        createdAt: new Date().toISOString(),
        createdBy: user?.id || 'admin'
      })
      await loadDeals()
      setShowModal(false)
    } catch (error) {
      console.error('Error adding deal:', error)
    }
  }

  const handleEditDeal = async () => {
    if (!editingId || !newDeal.contract || !newDeal.marketCap) return

    try {
      await updateFasolTriggerAlert(editingId, {
        address: newDeal.contract,
        marketCap: newDeal.marketCap,
        liq: newDeal.liq || undefined,
        hold: newDeal.hold || undefined,
        top10: newDeal.top10 || undefined,
        maxDropFromLevel07: newDeal.drop07 || undefined,
        maxProfit: newDeal.profit || undefined,
        screenshot: newDeal.screenshot || undefined,
        signalDate: dateValue,
        signalTime: timeValue
      })
      await loadDeals()
      setShowModal(false)
      setEditingId(null)
    } catch (error) {
      console.error('Error editing deal:', error)
    }
  }

  const resetForm = () => {
    setNewDeal({
      contract: '',
      marketCap: '',
      liq: '',
      hold: '',
      top10: '',
      drop07: '',
      profit: ''
    })
  }

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setNewDeal({ ...newDeal, screenshot: reader.result as string })
      reader.readAsDataURL(file)
    }
  }

  const handleScreenshotPaste = (e: React.ClipboardEvent) => {
    const file = e.clipboardData.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => setNewDeal({ ...newDeal, screenshot: reader.result as string })
      reader.readAsDataURL(file)
    }
  }

  const handleScreenshotDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => setNewDeal({ ...newDeal, screenshot: reader.result as string })
      reader.readAsDataURL(file)
    }
  }

  // Group deals by signalDate, sort by signalTime within each group
  const groupedDeals = useMemo(() => {
    const groups: { [key: string]: OurDealSignal[] } = {}
    deals.forEach(deal => {
      const dateKey = deal.signalDate
      if (!groups[dateKey]) groups[dateKey] = []
      groups[dateKey].push(deal)
    })
    // Sort dates descending (newest first)
    const sortedDates = Object.keys(groups).sort().reverse()
    // Within each date, sort by time ascending (00:00 → 23:59)
    sortedDates.forEach(date => {
      groups[date].sort((a, b) => a.signalTime.localeCompare(b.signalTime))
    })
    return { groups, dates: sortedDates }
  }, [deals])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`relative overflow-hidden rounded-3xl border ${cardBorder} ${cardShadow} ${cardBg}`}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -left-16 -bottom-10 w-80 h-80 bg-emerald-500/10 blur-3xl"></div>
          <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.05),transparent_45%)]' : 'bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.05),transparent_45%)]'}`}></div>
        </div>

        <div className="relative p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Left: Icon + Title */}
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-emerald-500/10 border-emerald-500/30'} shadow-inner`}>
              <TrendingUp className={`w-8 h-8 ${theme === 'dark' ? 'text-white' : 'text-emerald-500'}`} />
            </div>
            <h1 className={`text-3xl font-black ${headingColor} whitespace-nowrap`}>DEAL ANALYSIS</h1>
          </div>

          {/* Center: Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={copyTableToClipboard}
              disabled={deals.length === 0}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all ${copyFeedback ? 'bg-green-500 text-white' : theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-white border border-white/10' : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-200'} ${deals.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Copy className="w-4 h-4" />
              <span>Copy {deals.length > 0 ? `(${deals.length})` : ''}</span>
            </button>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-all shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Deal</span>
            </button>
          </div>

          {/* Right: Stats */}
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${deals.length > 0 ? 'bg-emerald-500' : 'bg-gray-500'}`} />
              <span className={`text-sm font-medium ${mutedColor}`}>
                Total: <span className={`font-bold ${headingColor}`}>{stats.total}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              <span className={`text-sm font-medium ${mutedColor}`}>
                Avg Profit: <span className="font-bold text-emerald-500">+{stats.avgProfit.toFixed(1)}%</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-rose-500" />
              <span className={`text-sm font-medium ${mutedColor}`}>
                Avg Drop 0.7: <span className="font-bold text-rose-500">-{stats.avgDrop.toFixed(1)}%</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className={`relative overflow-hidden rounded-3xl border ${cardBorder} ${cardBg} shadow-lg`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
                <th className={`p-4 text-xs uppercase tracking-wider font-semibold text-center w-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>№</th>
                <th className={`p-4 text-xs uppercase tracking-wider font-semibold text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Дата</th>
                <th className={`p-4 text-xs uppercase tracking-wider font-semibold text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Время</th>
                <th className={`p-4 text-xs uppercase tracking-wider font-semibold text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Контракт</th>
                <th className={`p-4 text-xs uppercase tracking-wider font-semibold text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>MC</th>
                <th className={`p-4 text-xs uppercase tracking-wider font-semibold text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Liq</th>
                <th className={`p-4 text-xs uppercase tracking-wider font-semibold text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Hold</th>
                <th className={`p-4 text-xs uppercase tracking-wider font-semibold text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Top-10</th>
                <th className={`p-4 text-xs uppercase tracking-wider font-semibold text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>DROP 0,7</th>
                <th className={`p-4 text-xs uppercase tracking-wider font-semibold text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Профит</th>
                <th className={`p-4 text-xs uppercase tracking-wider font-semibold text-center w-20 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Скрин</th>
                <th className={`p-4 text-xs uppercase tracking-wider font-semibold text-center w-24 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Автор</th>
                <th className="p-4 text-center"></th>
              </tr>
            </thead>
            <tbody className={`divide-y ${theme === 'dark' ? 'divide-white/5' : 'divide-gray-100'}`}>
              {deals.length === 0 ? (
                <tr>
                  <td colSpan={13} className="p-16 text-center">
                    <TrendingUp className={`w-12 h-12 mx-auto mb-3 opacity-20 ${mutedColor}`} />
                    <p className={`text-sm ${mutedColor}`}>Нет записей</p>
                  </td>
                </tr>
              ) : (
                (() => {
                  const rows: React.ReactNode[] = []
                  let globalIndex = 0

                  groupedDeals.dates.forEach((dateKey, dateIndex) => {
                    const dateDeals = groupedDeals.groups[dateKey]

                    // Date separator row (horizontal line before each date group except first)
                    if (dateIndex > 0) {
                      rows.push(
                        <tr key={`separator-${dateKey}`}>
                          <td colSpan={13} className="py-2 px-4">
                            <div className={`h-px ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'}`} />
                          </td>
                        </tr>
                      )
                    }

                    // Date header row
                    rows.push(
                      <tr key={`header-${dateKey}`} className={`${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                        <td colSpan={13} className="p-3 px-4">
                          <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {formatMoscowDate(dateKey)}
                          </span>
                        </td>
                      </tr>
                    )

                    // Deal rows (already sorted by signalTime ascending: night → evening)
                    dateDeals.forEach((deal) => {
                      globalIndex++
                      rows.push(
                        <tr key={deal.id} className={`${hoverBg} transition-colors`}>
                          <td className={`p-4 text-center border-r ${theme === 'dark' ? 'border-white/5' : 'border-gray-100'}`}>
                            <span className={`font-mono text-sm font-bold ${mutedColor}`}>
                              {globalIndex}
                            </span>
                          </td>
                          <td className={`p-4 text-center border-r ${theme === 'dark' ? 'border-white/5' : 'border-gray-100'}`}>
                            <span className={`font-mono text-sm ${mutedColor}`}>
                              {formatMoscowDate(deal.signalDate)}
                            </span>
                          </td>
                          <td className={`p-4 text-center border-r ${theme === 'dark' ? 'border-white/5' : 'border-gray-100'}`}>
                            <span className={`font-mono text-sm ${mutedColor}`}>
                              {deal.signalTime}
                            </span>
                          </td>
                          <td className={`p-4 text-center border-r ${theme === 'dark' ? 'border-white/5' : 'border-gray-100'}`}>
                            <div className="flex items-center justify-center gap-2">
                              {deal.contract ? (
                                <a
                                  href={`https://gmgn.ai/sol/token/${deal.contract}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`font-mono text-sm text-blue-400 hover:text-blue-300 underline cursor-pointer`}
                                  title="Open in GMGN"
                                >
                                  {truncateAddress(deal.contract)}
                                </a>
                              ) : (
                                <span className={`font-mono text-sm ${mutedColor}`}>-</span>
                              )}
                              <button
                                onClick={() => deal.contract && copyToClipboard(deal.contract, deal.id)}
                                className={`p-1 rounded transition-colors ${copiedId === deal.id ? 'text-green-500' : mutedColor} hover:bg-white/10`}
                                title="Copy"
                              >
                                {copiedId === deal.id ? (
                                  <Calculator className="w-4 h-4" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className={`p-4 text-center border-r ${theme === 'dark' ? 'border-white/5' : 'border-gray-100'}`}>
                            <span className={`font-mono text-sm font-bold text-emerald-500`}>
                              {deal.marketCap || '-'}
                            </span>
                          </td>
                          <td className={`p-4 text-center border-r ${theme === 'dark' ? 'border-white/5' : 'border-gray-100'}`}>
                            <span className={`font-mono text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                              {deal.liq || '-'}
                            </span>
                          </td>
                          <td className={`p-4 text-center border-r ${theme === 'dark' ? 'border-white/5' : 'border-gray-100'}`}>
                            <span className={`font-mono text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                              {deal.hold || '-'}
                            </span>
                          </td>
                          <td className={`p-4 text-center border-r ${theme === 'dark' ? 'border-white/5' : 'border-gray-100'}`}>
                            <span className={`font-mono text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                              {deal.top10 || '-'}
                            </span>
                          </td>
                          <td className={`p-4 text-center border-r ${theme === 'dark' ? 'border-white/5' : 'border-gray-100'}`}>
                            <span className={`font-mono text-sm ${deal.drop07.startsWith('-') ? 'text-rose-500' : headingColor}`}>
                              {deal.drop07 || '-'}
                            </span>
                          </td>
                          <td className={`p-4 text-center border-r ${theme === 'dark' ? 'border-white/5' : 'border-gray-100'}`}>
                            <span className="font-mono text-sm font-bold text-green-500">
                              {deal.profit || '-'}
                            </span>
                          </td>
                          <td className={`p-4 text-center border-r ${theme === 'dark' ? 'border-white/5' : 'border-gray-100'}`}>
                            {deal.screenshot ? (
                              <button
                                onClick={() => deal.screenshot && openScreenshotModal(deal.screenshot, deal)}
                                className={`p-2 rounded-lg ${hoverBg} transition-colors`}
                                title="View screenshot"
                              >
                                <Eye className="w-4 h-4 text-emerald-500" />
                              </button>
                            ) : (
                              <span className={`text-xs ${mutedColor}`}>-</span>
                            )}
                          </td>
                          <td className={`p-4 text-center border-r ${theme === 'dark' ? 'border-white/5' : 'border-gray-100'}`}>
                            <div className="flex items-center justify-center gap-1">
                              <User className={`w-3 h-3 ${mutedColor}`} />
                              <span className={`text-xs ${mutedColor}`}>{deal.createdBy}</span>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => openEditModal(deal)}
                                className={`p-2 rounded-lg ${hoverBg} transition-colors`}
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4 text-blue-500" />
                              </button>
                              {isAdmin && (
                                <button
                                  onClick={() => confirmDelete(deal.id)}
                                  className={`p-2 rounded-lg ${hoverBg} transition-colors`}
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4 text-rose-500" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  })

                  return rows
                })()
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Screenshot Preview Modal */}
      {showScreenshotModal && currentScreenshot && currentDealInfo && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowScreenshotModal(false)}
        >
          <div 
            className={`relative max-w-4xl w-full rounded-3xl overflow-hidden ${cardBg} shadow-2xl`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`p-4 border-b ${theme === 'dark' ? 'border-white/10' : 'border-gray-100'} flex items-center justify-between`}>
              <div className="flex items-center gap-4">
                <span className={`font-mono text-sm ${mutedColor}`}>
                  {currentDealInfo.date} at {currentDealInfo.time}
                </span>
                <a
                  href={`https://gmgn.ai/sol/token/${currentDealInfo.contract}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`font-mono text-sm text-blue-400 hover:text-blue-300 underline`}
                >
                  {truncateAddress(currentDealInfo.contract)}
                </a>
              </div>
              <button
                onClick={() => setShowScreenshotModal(false)}
                className={`p-2 rounded-lg hover:bg-white/10 ${mutedColor}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Screenshot */}
            <div className="p-4">
              <img
                src={currentScreenshot}
                alt="Deal screenshot"
                className="w-full h-auto rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-3xl ${cardBg} ${cardBorder} border shadow-2xl overflow-hidden`}>
            {/* Header */}
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-white/10' : 'border-gray-100'} flex items-center justify-between`}>
              <div className="space-y-1">
                <h3 className={`text-xl font-bold ${headingColor}`}>
                  {editingId ? 'Edit Deal' : 'Add Deal'}
                </h3>
                <p className={`text-xs ${mutedColor}`}>
                  {editingId ? 'Edit deal details' : 'Fill in deal details'}
                </p>
              </div>
              <button
                onClick={() => {
                  resetForm()
                  setShowModal(false)
                }}
                className={`p-2 rounded-lg hover:bg-white/10 ${mutedColor}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Form */}
            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${mutedColor}`}>
                  Контракт *
                </label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={newDeal.contract}
                  onChange={(e) => setNewDeal({ ...newDeal, contract: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border outline-none transition-all font-mono text-sm ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white focus:border-emerald-500/50' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-emerald-500/30'}`}
                />
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${mutedColor}`}>
                  Market Cap *
                </label>
                <input
                  type="text"
                  placeholder="$500K или $1.2M"
                  value={newDeal.marketCap}
                  onChange={(e) => setNewDeal({ ...newDeal, marketCap: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border outline-none transition-all font-mono text-sm ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white focus:border-emerald-500/50' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-emerald-500/30'}`}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${mutedColor}`}>
                    Liq
                  </label>
                  <input
                    type="text"
                    placeholder="$100K"
                    value={newDeal.liq}
                    onChange={(e) => setNewDeal({ ...newDeal, liq: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border outline-none transition-all font-mono text-sm ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white focus:border-emerald-500/50' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-emerald-500/30'}`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${mutedColor}`}>
                    Hold
                  </label>
                  <input
                    type="text"
                    placeholder="10%"
                    value={newDeal.hold}
                    onChange={(e) => setNewDeal({ ...newDeal, hold: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border outline-none transition-all font-mono text-sm ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white focus:border-emerald-500/50' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-emerald-500/30'}`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${mutedColor}`}>
                    Top-10
                  </label>
                  <input
                    type="text"
                    placeholder="5%"
                    value={newDeal.top10}
                    onChange={(e) => setNewDeal({ ...newDeal, top10: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border outline-none transition-all font-mono text-sm ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white focus:border-emerald-500/50' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-emerald-500/30'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${mutedColor}`}>
                    DROP 0,7
                  </label>
                  <input
                    type="text"
                    placeholder="-5%"
                    value={newDeal.drop07}
                    onChange={(e) => setNewDeal({ ...newDeal, drop07: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border outline-none transition-all font-mono text-sm ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white focus:border-emerald-500/50' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-emerald-500/30'}`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${mutedColor}`}>
                    Profit
                  </label>
                  <input
                    type="text"
                    placeholder="+25%"
                    value={newDeal.profit}
                    onChange={(e) => setNewDeal({ ...newDeal, profit: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border outline-none transition-all font-mono text-sm ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white focus:border-emerald-500/50' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-emerald-500/30'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${mutedColor}`}>
                    Date
                  </label>
                  <input
                    type="date"
                    value={dateValue}
                    onChange={() => {}}
                    className={`w-full px-4 py-3 rounded-xl border outline-none transition-all font-mono text-sm ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${mutedColor}`}>
                    Time
                  </label>
                  <input
                    type="time"
                    value={timeValue}
                    onChange={() => {}}
                    className={`w-full px-4 py-3 rounded-xl border outline-none transition-all font-mono text-sm ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white focus:border-emerald-500/50' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${mutedColor}`}>
                  Screenshot
                </label>
                <div className="space-y-3">
                  {/* Screenshot preview */}
                  {newDeal.screenshot && (
                    <div className="relative">
                      <img
                        src={newDeal.screenshot}
                        alt="Screenshot preview"
                        className="w-full h-32 object-cover rounded-xl border border-white/10"
                      />
                      <button
                        onClick={() => setNewDeal({ ...newDeal, screenshot: '' })}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  
                  {/* File upload area */}
                  <div 
                    className={`relative flex items-center justify-center gap-2 px-4 py-4 rounded-xl border border-dashed cursor-pointer transition-all ${theme === 'dark' ? 'border-white/20 hover:border-emerald-500/50 hover:bg-white/5' : 'border-gray-300 hover:border-emerald-500/50 hover:bg-gray-50'}`}
                    onPaste={handleScreenshotPaste}
                    onDrop={handleScreenshotDrop}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleScreenshotUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <ImageIcon className={`w-5 h-5 ${mutedColor}`} />
                    <div className="text-center">
                      <span className={`text-sm ${mutedColor}`}>
                        {newDeal.screenshot ? 'Replace file' : 'Drop, paste or upload'}
                      </span>
                      <p className={`text-xs ${mutedColor} mt-1 opacity-60`}>
                        Supports drag & drop, Ctrl+V, file upload
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className={`p-6 border-t ${theme === 'dark' ? 'border-white/10' : 'border-gray-100'} flex gap-3`}>
              <button
                onClick={() => {
                  resetForm()
                  setShowModal(false)
                }}
                className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
              >
                Cancel
              </button>
              <button
                onClick={editingId ? handleEditDeal : handleAddDeal}
                disabled={!newDeal.contract || !newDeal.marketCap}
                className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all shadow-lg ${!newDeal.contract || !newDeal.marketCap ? 'opacity-50 cursor-not-allowed bg-emerald-500 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'}`}
              >
                {editingId ? 'Save' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-sm rounded-3xl ${cardBg} ${cardBorder} border shadow-2xl overflow-hidden`}>
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-rose-500" />
              </div>
              <h3 className={`text-lg font-bold text-center ${headingColor} mb-2`}>
                Delete Deal?
              </h3>
              <p className={`text-sm text-center ${mutedColor} mb-6`}>
                This action cannot be undone. The deal will be deleted permanently.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setDeletingId(null)
                    setShowDeleteModal(false)
                  }}
                  className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteDeal}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold transition-all shadow-lg bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FasolSignalsStrategy
