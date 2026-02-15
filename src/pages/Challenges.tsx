import { useThemeStore } from '@/store/themeStore'
import { Trophy, Target, Zap, Star, Award, Medal, Crown, Users } from 'lucide-react'

export const Challenges = () => {
  const { theme } = useThemeStore()
  const headingColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
  const subTextColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600'

  const challenges = [
    {
      id: 1,
      title: 'Мастер трейдинга',
      description: 'Достичь 95% успешных сделок за неделю',
      reward: '500 ARCA Points',
      icon: Trophy,
      difficulty: 'hard',
      participants: 24,
      deadline: '2025-02-28'
    },
    {
      id: 2,
      title: 'Аналитический прорыв',
      description: 'Создать 5 качественных обзоров в LAB',
      reward: '300 ARCA Points',
      icon: Star,
      difficulty: 'medium',
      participants: 18,
      deadline: '2025-02-15'
    },
    {
      id: 3,
      title: 'Командный игрок',
      description: 'Участвовать в 10 торговых сессиях',
      reward: '200 ARCA Points',
      icon: Medal,
      difficulty: 'easy',
      participants: 35,
      deadline: '2025-03-01'
    },
    {
      id: 4,
      title: 'Инноватор',
      description: 'Предложить 3 идеи для улучшения платформы',
      reward: '400 ARCA Points',
      icon: Zap,
      difficulty: 'medium',
      participants: 12,
      deadline: '2025-02-20'
    }
  ]

  const getDifficultyBadge = (difficulty: string) => {
    const difficultyConfig = {
      easy: { label: 'Лёгкий', color: 'bg-green-500/10 text-green-500 border-green-500/20', icon: Medal },
      medium: { label: 'Средний', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: Star },
      hard: { label: 'Сложный', color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: Crown }
    }
    const config = difficultyConfig[difficulty as keyof typeof difficultyConfig] || difficultyConfig.medium
    const Icon = config.icon
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 pb-6 border-b border-white/5">
        <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20">
          <Award className="w-8 h-8 text-purple-500" />
        </div>
        <div>
          <h1 className={`text-2xl md:text-3xl font-black tracking-tight ${headingColor}`}>
            Challenges
          </h1>
          <p className={`text-sm font-medium ${subTextColor}`}>
            Челленджи и соревнования для развития навыков
          </p>
        </div>
      </div>

      {/* Challenges Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {challenges.map((challenge) => {
          const Icon = challenge.icon
          return (
            <div
              key={challenge.id}
              className={`section-card rounded-2xl p-6 border shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 ${
                theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/15 text-purple-500">
                    <Icon className="w-6 h-6" />
                  </div>
                  {getDifficultyBadge(challenge.difficulty)}
                </div>

                <div>
                  <h3 className={`text-lg font-bold ${headingColor}`}>{challenge.title}</h3>
                  <p className={`text-sm mt-2 ${subTextColor}`}>{challenge.description}</p>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                  <Target className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className={`text-xs ${subTextColor}`}>Награда</p>
                    <p className="text-sm font-bold text-amber-500">{challenge.reward}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm pt-2 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <Users className={`w-4 h-4 ${subTextColor}`} />
                    <span className={subTextColor}>{challenge.participants} участников</span>
                  </div>
                  <div className={`text-sm font-medium ${headingColor}`}>
                    до {new Date(challenge.deadline).toLocaleDateString('ru-RU')}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Leaderboard Preview */}
      <div className={`section-card rounded-2xl p-6 border ${
        theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          <Crown className="w-6 h-6 text-amber-500" />
          <h3 className={`text-lg font-bold ${headingColor}`}>Лидеры сезона</h3>
        </div>
        <div className="space-y-3">
          {[
            { rank: 1, name: 'Александр', points: 2450 },
            { rank: 2, name: 'Мария', points: 2180 },
            { rank: 3, name: 'Дмитрий', points: 1950 }
          ].map((leader) => (
            <div
              key={leader.rank}
              className={`flex items-center gap-4 p-3 rounded-xl ${
                theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                leader.rank === 1 ? 'bg-amber-500 text-white' :
                leader.rank === 2 ? 'bg-gray-400 text-white' :
                'bg-amber-700 text-white'
              }`}>
                {leader.rank}
              </div>
              <div className="flex-1">
                <p className={`font-medium ${headingColor}`}>{leader.name}</p>
              </div>
              <div className="text-sm font-bold text-amber-500">{leader.points} pts</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Challenges
