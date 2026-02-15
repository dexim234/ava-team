import { useThemeStore } from '@/store/themeStore'
import { Lightbulb, Target, Rocket, CheckCircle2, Clock, Users } from 'lucide-react'

export const Initiatives = () => {
  const { theme } = useThemeStore()
  const headingColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
  const subTextColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600'

  const initiatives = [
    {
      id: 1,
      title: 'Образовательная программа',
      description: 'Создание комплексной системы обучения для новых участников команды',
      status: 'active',
      progress: 75,
      icon: Target,
      participants: 12,
      deadline: '2025-02-15'
    },
    {
      id: 2,
      title: 'Автоматизация отчётности',
      description: 'Внедрение AI-систем для автоматической генерации торговых отчётов',
      status: 'planning',
      progress: 20,
      icon: Rocket,
      participants: 5,
      deadline: '2025-03-01'
    },
    {
      id: 3,
      title: 'Расширение инструментов',
      description: 'Добавление новых аналитических инструментов и индикаторов',
      status: 'completed',
      progress: 100,
      icon: CheckCircle2,
      participants: 8,
      deadline: '2025-01-20'
    }
  ]

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'В работе', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
      planning: { label: 'Планируется', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
      completed: { label: 'Завершено', color: 'bg-green-500/10 text-green-500 border-green-500/20' }
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.planning
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
        {config.label}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 pb-6 border-b border-white/5">
        <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
          <Lightbulb className="w-8 h-8 text-amber-500" />
        </div>
        <div>
          <h1 className={`text-2xl md:text-3xl font-black tracking-tight ${headingColor}`}>
            Initiatives
          </h1>
          <p className={`text-sm font-medium ${subTextColor}`}>
            Текущие инициативы и проекты команды ARCA - Team
          </p>
        </div>
      </div>

      {/* Initiatives Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {initiatives.map((initiative) => {
          const Icon = initiative.icon
          return (
            <div
              key={initiative.id}
              className={`section-card rounded-2xl p-6 border shadow-xl relative overflow-hidden ${
                theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="relative z-10 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/15 text-amber-500">
                    <Icon className="w-6 h-6" />
                  </div>
                  {getStatusBadge(initiative.status)}
                </div>

                <div>
                  <h3 className={`text-lg font-bold ${headingColor}`}>{initiative.title}</h3>
                  <p className={`text-sm mt-2 ${subTextColor}`}>{initiative.description}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className={subTextColor}>Прогресс</span>
                    <span className={`font-semibold ${headingColor}`}>{initiative.progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                      style={{ width: `${initiative.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className={`w-4 h-4 ${subTextColor}`} />
                    <span className={subTextColor}>{initiative.participants} участников</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className={`w-4 h-4 ${subTextColor}`} />
                    <span className={subTextColor}>{new Date(initiative.deadline).toLocaleDateString('ru-RU')}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State for New Initiatives */}
      <div className={`section-card rounded-2xl p-8 border border-dashed ${
        theme === 'dark' ? 'border-white/20 bg-white/5' : 'border-gray-300 bg-gray-50'
      }`}>
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5">
            <Lightbulb className="w-12 h-12 text-amber-500" />
          </div>
          <div>
            <h3 className={`text-lg font-bold ${headingColor}`}>Есть идея для новой инициативы?</h3>
            <p className={`text-sm mt-1 ${subTextColor}`}>
              Предложите проект для улучшения работы команды
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Initiatives
