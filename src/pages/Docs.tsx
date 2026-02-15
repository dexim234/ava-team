import { useThemeStore } from '@/store/themeStore'
import { BookOpen, FileText, Video, Download, ExternalLink, Search } from 'lucide-react'
import { useState } from 'react'

export const Docs = () => {
  const { theme } = useThemeStore()
  const headingColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
  const subTextColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
  const [searchQuery, setSearchQuery] = useState('')

  const docs = [
    {
      category: 'Начало работы',
      items: [
        { title: 'Быстрый старт', type: 'guide', icon: BookOpen, description: 'Основы работы с платформой' },
        { title: 'Первые шаги в трейдинге', type: 'video', icon: Video, description: 'Видеоурок для новичков' },
        { title: 'Настройка профиля', type: 'guide', icon: FileText, description: 'Как настроить личный кабинет' }
      ]
    },
    {
      category: 'Торговля',
      items: [
        { title: 'Основы технического анализа', type: 'guide', icon: BookOpen, description: 'Ключевые индикаторы и паттерны' },
        { title: 'Риск-менеджмент', type: 'guide', icon: FileText, description: 'Управление капиталом и рисками' },
        { title: 'Стратегии торговли', type: 'video', icon: Video, description: 'Популярные торговые стратегии' }
      ]
    },
    {
      category: 'Инструменты',
      items: [
        { title: 'Обзор LAB', type: 'guide', icon: BookOpen, description: 'Работа с аналитическими инструментами' },
        { title: 'Использование P&L', type: 'guide', icon: FileText, description: 'Отслеживание прибыли и убытков' },
        { title: 'Track Record', type: 'guide', icon: FileText, description: 'Ведение истории сделок' }
      ]
    },
    {
      category: 'Правила и регламенты',
      items: [
        { title: 'Кодекс поведения', type: 'guide', icon: FileText, description: 'Правила участия в сообществе' },
        { title: 'Дисциплинарная политика', type: 'guide', icon: BookOpen, description: 'Меры за нарушения' },
        { title: 'Политика конфиденциальности', type: 'guide', icon: FileText, description: 'Защита данных участников' }
      ]
    }
  ]

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      guide: { label: 'Руководство', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
      video: { label: 'Видео', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' }
    }
    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.guide
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const filteredDocs = docs.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.items.length > 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 pb-6 border-b border-white/5">
        <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
          <BookOpen className="w-8 h-8 text-emerald-500" />
        </div>
        <div>
          <h1 className={`text-2xl md:text-3xl font-black tracking-tight ${headingColor}`}>
            Docs
          </h1>
          <p className={`text-sm font-medium ${subTextColor}`}>
            Документация и обучающие материалы
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${subTextColor}`} />
        <input
          type="text"
          placeholder="Поиск документации..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full pl-12 pr-4 py-3 rounded-xl border ${
            theme === 'dark'
              ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-emerald-500/50'
              : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500'
          } focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all`}
        />
      </div>

      {/* Docs Categories */}
      {filteredDocs.map((category) => (
        <div key={category.category} className="space-y-4">
          <h2 className={`text-lg font-bold ${headingColor}`}>{category.category}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {category.items.map((item, index) => {
              const Icon = item.icon
              return (
                <a
                  key={index}
                  href="#"
                  className={`group section-card rounded-xl p-5 border shadow-lg relative overflow-hidden hover:scale-[1.02] transition-transform duration-300 ${
                    theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="p-2.5 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/15 text-emerald-500">
                        <Icon className="w-5 h-5" />
                      </div>
                      {getTypeBadge(item.type)}
                    </div>

                    <div>
                      <h3 className={`font-bold ${headingColor} group-hover:text-emerald-500 transition-colors`}>
                        {item.title}
                      </h3>
                      <p className={`text-sm mt-1 ${subTextColor}`}>{item.description}</p>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-emerald-500">
                      <ExternalLink className="w-4 h-4" />
                      <span className="font-medium">Открыть</span>
                    </div>
                  </div>
                </a>
              )
            })}
          </div>
        </div>
      ))}

      {filteredDocs.length === 0 && (
        <div className={`section-card rounded-2xl p-12 text-center ${
          theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'
        }`}>
          <Search className={`w-16 h-16 ${subTextColor} mx-auto mb-4 opacity-50`} />
          <p className={`text-lg font-medium ${headingColor}`}>Ничего не найдено</p>
          <p className={`text-sm mt-1 ${subTextColor}`}>
            Попробуйте изменить поисковый запрос
          </p>
        </div>
      )}

      {/* Quick Download Section */}
      <div className={`section-card rounded-2xl p-6 border ${
        theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'
      }`}>
        <h3 className={`text-lg font-bold ${headingColor} mb-4`}>Быстрые ссылки</h3>
        <div className="flex flex-wrap gap-3">
          <a
            href="/rules.pdf"
            download
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all hover:-translate-y-0.5 ${
              theme === 'dark'
                ? 'border-white/20 bg-white/10 text-white hover:bg-white/15'
                : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/15'
            }`}
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-semibold">Скачать правила (PDF)</span>
          </a>
          <a
            href="/guide.pdf"
            download
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all hover:-translate-y-0.5 ${
              theme === 'dark'
                ? 'border-white/20 bg-white/10 text-white hover:bg-white/15'
                : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/15'
            }`}
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-semibold">Скачать гайд (PDF)</span>
          </a>
        </div>
      </div>
    </div>
  )
}

export default Docs
