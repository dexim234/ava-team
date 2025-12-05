// About community page
import { Layout } from '@/components/Layout'
import { useThemeStore } from '@/store/themeStore'
import { Info, Users, Target, Award, BookOpen, Mail } from 'lucide-react'

export const About = () => {
  const { theme } = useThemeStore()
  const headingColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
  const subTextColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600'

  return (
    <Layout>
      <div className="space-y-6">
        {/* Hero */}
        <div className="section-card rounded-2xl p-5 sm:p-6 md:p-7 border border-white/60 dark:border-white/10 shadow-xl relative overflow-hidden">
          <div className="accent-dots" />
          <div className="relative z-10 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div
                  className={`p-3 sm:p-4 rounded-2xl shadow-lg ${
                    theme === 'dark'
                      ? 'bg-gradient-to-br from-blue-600 to-purple-600'
                      : 'bg-gradient-to-br from-blue-500 to-purple-500'
                  } text-white`}
                >
                  <Info className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div>
                  <p className={`text-xs uppercase tracking-[0.14em] ${subTextColor}`}>ApeVault Black Ops</p>
                  <h1 className={`text-2xl sm:text-3xl md:text-4xl font-extrabold ${headingColor} flex items-center gap-2`}>
                    О сообществе
                    <span className="text-xl sm:text-2xl flex-shrink-0">🌟</span>
                  </h1>
                  <p className={`text-sm sm:text-base font-medium ${subTextColor}`}>
                    Профессиональное сообщество трейдеров и коллеров
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <a href="#overview" className="pill" data-active="false">Обзор</a>
                <a href="#features" className="pill" data-active="false">Принципы</a>
                <a href="#rules" className="pill" data-active="false">Правила</a>
                <a href="#contacts" className="pill" data-active="false">Контакты</a>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Участников', value: '50+' },
                { label: 'Уроков', value: '100+' },
                { label: 'Сессий/нед', value: '10+' },
                { label: 'Продуктов', value: '3' },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`rounded-xl border ${theme === 'dark' ? 'border-white/10 bg-white/5 text-white' : 'border-gray-200 bg-white text-gray-900'} p-3 shadow-sm`}
                >
                  <p className="text-[11px] uppercase tracking-wide opacity-70">{item.label}</p>
                  <p className="text-2xl font-extrabold">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main info card */}
        <div id="overview" className="section-card rounded-2xl p-6 sm:p-7 border border-white/60 dark:border-white/10 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-2xl -mr-20 -mt-20" />
          <div className="relative z-10 space-y-5">
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start">
              <div className={`p-3 sm:p-4 rounded-2xl shadow-lg ${theme === 'dark' ? 'bg-gradient-to-br from-cyan-600 to-blue-600' : 'bg-gradient-to-br from-cyan-500 to-blue-500'} text-white flex-shrink-0`}>
                <Info className="w-5 h-5 sm:w-7 sm:h-7" />
              </div>
              <div className="flex-1 space-y-3">
                <h2 className={`text-2xl sm:text-3xl font-extrabold ${headingColor}`}>
                  <span className="bg-gradient-to-r from-cyan-600 to-blue-600 text-transparent bg-clip-text">
                    Что такое ApeVault Black Ops?
                  </span>
                </h2>
                <p className={`text-sm sm:text-base leading-relaxed ${subTextColor}`}>
                  ApeVault — закрытое профессиональное сообщество трейдеров и коллеров. Мы объединяем экспертизу, строгие
                  регламенты и командную поддержку, чтобы ускорять результаты каждого участника и строить прозрачную культуру
                  трейдинга.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Профессиональные коллеры', 'Командные сессии', 'Прозрачная аналитика'].map((tag) => (
                    <span
                      key={tag}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        theme === 'dark' ? 'bg-cyan-500/10 text-cyan-200 border border-cyan-500/30' : 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div id="features" className="grid md:grid-cols-3 gap-5">
          {[
            {
              title: 'Командная работа',
              desc: 'Слаженная работа профессионалов, каждый вносит вклад в общий успех.',
              icon: Users,
              tone: theme === 'dark' ? 'bg-gradient-to-br from-[#4E6E49] to-emerald-700' : 'bg-gradient-to-br from-[#4E6E49] to-emerald-700',
              halo: 'from-[#4E6E49]/10 to-emerald-700/10',
            },
            {
              title: 'Профессионализм',
              desc: 'Высокие стандарты, строгий регламент, дисциплина сессий.',
              icon: Target,
              tone: theme === 'dark' ? 'bg-gradient-to-br from-purple-600 to-pink-600' : 'bg-gradient-to-br from-purple-500 to-pink-500',
              halo: 'from-purple-500/10 to-pink-500/10',
            },
            {
              title: 'Рейтинг и мотивация',
              desc: 'Прозрачная система рейтинга мотивирует достигать большего.',
              icon: Award,
              tone: theme === 'dark' ? 'bg-gradient-to-br from-yellow-600 to-orange-600' : 'bg-gradient-to-br from-yellow-500 to-orange-500',
              halo: 'from-yellow-500/10 to-orange-500/10',
            },
          ].map(({ title, desc, icon: Icon, tone, halo }) => (
            <div
              key={title}
              className={`section-card rounded-2xl p-6 border border-white/60 dark:border-white/10 shadow-xl relative overflow-hidden h-full`}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${halo} rounded-full blur-xl -mr-16 -mt-16`} />
              <div className="relative z-10 h-full flex flex-col gap-4">
                <div className={`p-3 rounded-xl shadow-lg inline-flex ${tone} text-white w-max`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className={`text-xl font-extrabold ${headingColor}`}>{title}</h3>
                  <p className={`${subTextColor} leading-relaxed`}>{desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Rules link */}
        <div id="rules" className="section-card rounded-2xl p-6 sm:p-7 border border-white/60 dark:border-white/10 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-2xl -mr-20 -mt-20" />
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className={`p-4 rounded-2xl shadow-lg ${theme === 'dark' ? 'bg-gradient-to-br from-indigo-600 to-purple-600' : 'bg-gradient-to-br from-indigo-500 to-purple-500'} text-white flex-shrink-0`}>
                <BookOpen className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h2 className={`text-2xl font-extrabold mb-2 ${headingColor} flex items-center gap-2`}>
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
                    Правила сообщества
                  </span>
                </h2>
                <p className={`${subTextColor} mb-6 font-medium`}>
                  Подробный регламент торговых сессий и правила взаимодействия участников.
                </p>
                <a
                  href="https://telegra.ph/Reglament-provedeniya-torgovyh-sessij-pravila-soobshchestva-ApeVault-dlya-trejderov-i-kollerov-11-20"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#4E6E49] to-[#4E6E49] hover:from-[#4E6E49] hover:to-[#4E6E49] text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:scale-105 transform"
                >
                  <BookOpen className="w-5 h-5" />
                  <span>Ознакомиться с правилами</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div id="contacts" className="section-card rounded-2xl p-6 sm:p-7 border border-white/60 dark:border-white/10 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-full blur-2xl -mr-20 -mt-20" />
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-4 rounded-2xl shadow-lg ${theme === 'dark' ? 'bg-gradient-to-br from-pink-600 to-rose-600' : 'bg-gradient-to-br from-pink-500 to-rose-500'} text-white flex-shrink-0`}>
                <Mail className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h2 className={`text-2xl font-extrabold mb-2 ${headingColor} flex items-center gap-2`}>
                  <span className="bg-gradient-to-r from-pink-600 to-rose-600 text-transparent bg-clip-text">
                    Контакты
                  </span>
                </h2>
                <p className={`${subTextColor} font-medium`}>
                  По вопросам работы системы и правил обращайтесь к администратору:{' '}
                  <span className={`font-extrabold ${headingColor}`}>@artyommedoed</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

