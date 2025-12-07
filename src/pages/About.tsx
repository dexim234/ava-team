// About community page (minimalist redesign)
import { Layout } from '@/components/Layout'
import { useThemeStore } from '@/store/themeStore'
import { Info, ArrowUpRight, BookOpen, Mail, Sparkles } from 'lucide-react'
import valuesIllustration from '../../assets/image-779ddbd9-e512-4bda-8983-af1ab9237b7c.png'

export const About = () => {
  const { theme } = useThemeStore()
  const headingColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
  const subTextColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600'

  const principles = [
    { title: 'Вместе мы — сила!', accent: 'from-emerald-500 to-teal-600' },
    { title: 'Человек — главная ценность', accent: 'from-sky-500 to-blue-600' },
    { title: 'Мечтать и воплощать', accent: 'from-amber-500 to-orange-600' },
    { title: 'Предвосхищать потребности клиента', accent: 'from-purple-500 to-indigo-600' },
    { title: 'Индивидуальность и разнообразие', accent: 'from-pink-500 to-rose-600' },
    { title: 'Позитивный подход', accent: 'from-cyan-500 to-teal-500' },
    {
      title: 'Максимальная эффективность во всём',
      accent: 'from-[#4E6E49] to-emerald-600',
      note: 'Мы стараемся делать всё наилучшим образом в пределах возможного.',
    },
  ]

  const fastFacts = [
    { label: 'Что такое ApeVault?', value: 'Клуб криптоэнтузиастов, где знания превращаются в действие.' },
    {
      label: 'Цель',
      value: 'Объединить инвесторов и трейдеров ради роста дохода и безопасности входа в рынок.',
    },
  ]

  return (
    <Layout>
      <div className="space-y-7 sm:space-y-8">
        {/* Hero */}
        <div className="section-card rounded-3xl p-6 sm:p-8 border border-white/60 dark:border-white/10 shadow-2xl relative overflow-hidden">
          <div className="accent-dots" />
          <div className="absolute inset-y-0 right-0 w-1/3 pointer-events-none bg-gradient-to-l from-[#4E6E49]/10 to-transparent blur-2xl" />
          <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/50 dark:border-white/10 bg-white/70 dark:bg-white/5 text-xs font-semibold uppercase tracking-[0.16em]">
                <Info className="w-4 h-4 text-[#4E6E49]" />
                ApeVault Community
              </div>
              <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight ${headingColor}`}>
                Рай для перфекциониста: минимализм, чистая структура и смысл
              </h1>
              <p className={`text-sm sm:text-base ${subTextColor} max-w-2xl`}>
                ApeVault — это пространство, где опытные криптоэнтузиасты объединяют знания и проверенные стратегии, чтобы
                безопасно заходить в рынок и расти вместе.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Командные сессии', 'Проверенные стратегии', 'Прозрачные регламенты'].map((tag) => (
                  <span
                    key={tag}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                      theme === 'dark'
                        ? 'border-white/10 bg-white/5 text-white'
                        : 'border-gray-200 bg-white text-gray-900'
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full max-w-xs lg:max-w-sm">
              {[
                { label: 'Участников', value: '50+' },
                { label: 'Сессий / неделю', value: '10+' },
                { label: 'Уроков', value: '100+' },
                { label: 'Фокуса', value: '100% качество' },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`rounded-2xl border p-3 sm:p-4 shadow-sm ${
                    theme === 'dark' ? 'border-white/10 bg-white/5 text-white' : 'border-gray-200 bg-white text-gray-900'
                  }`}
                >
                  <p className="text-[11px] uppercase tracking-wide opacity-70">{item.label}</p>
                  <p className="text-xl font-extrabold leading-tight mt-1">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* What is ApeVault */}
        <div className="section-card rounded-3xl p-6 sm:p-7 border border-white/60 dark:border-white/10 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
          <div className="relative z-10 space-y-4">
            <h2 className={`text-2xl sm:text-3xl font-extrabold ${headingColor} flex items-center gap-2`}>
              <Sparkles className="w-6 h-6 text-[#4E6E49]" />
              Что такое ApeVault?
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {fastFacts.map((item) => (
                <div
                  key={item.label}
                  className={`rounded-2xl border p-4 sm:p-5 flex gap-3 items-start ${
                    theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-gradient-to-br from-[#4E6E49] to-emerald-600 text-white shadow-lg">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wide text-[#4E6E49] font-semibold">{item.label}</p>
                    <p className={`text-sm sm:text-base leading-relaxed ${headingColor}`}>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Principles */}
        <div className="section-card rounded-3xl p-6 sm:p-7 border border-white/60 dark:border-white/10 shadow-xl relative overflow-hidden">
          <div className="absolute -left-10 top-0 w-52 h-52 bg-gradient-to-br from-amber-400/10 to-rose-400/10 rounded-full blur-3xl" />
          <div className="absolute -right-10 bottom-0 w-52 h-52 bg-gradient-to-br from-blue-400/10 to-emerald-400/10 rounded-full blur-3xl" />
          <div className="relative z-10 space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <h2 className={`text-2xl sm:text-3xl font-extrabold ${headingColor}`}>
                Принципы, которые держат нас на вершине
              </h2>
              <div className="flex gap-2">
                <a
                  href="#rules"
                  className="pill"
                  data-active="false"
                >
                  Правила
                  <ArrowUpRight className="w-4 h-4" />
                </a>
                <a
                  href="#contacts"
                  className="pill"
                  data-active="false"
                >
                  Контакты
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="grid lg:grid-cols-[1fr_420px_1fr] gap-6 items-center">
              <div className="space-y-3">
                {principles.slice(0, 3).map((item) => (
                  <div
                    key={item.title}
                    className={`rounded-2xl border px-4 py-3 flex items-start gap-3 ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'}`}
                  >
                    <div className={`p-2 rounded-xl text-white bg-gradient-to-br ${item.accent}`}>
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <p className={`text-sm sm:text-base font-semibold ${headingColor}`}>{item.title}</p>
                      {item.note && <p className={`text-xs ${subTextColor}`}>{item.note}</p>}
                    </div>
                  </div>
                ))}
              </div>

              <div className={`rounded-3xl border shadow-xl overflow-hidden relative ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'}`}>
                <img
                  src={valuesIllustration}
                  alt="Принципы ApeVault"
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-white/0" />
              </div>

              <div className="space-y-3">
                {principles.slice(3).map((item) => (
                  <div
                    key={item.title}
                    className={`rounded-2xl border px-4 py-3 flex items-start gap-3 ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'}`}
                  >
                    <div className={`p-2 rounded-xl text-white bg-gradient-to-br ${item.accent}`}>
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <p className={`text-sm sm:text-base font-semibold ${headingColor}`}>{item.title}</p>
                      {item.note && <p className={`text-xs ${subTextColor}`}>{item.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Rules link */}
        <div
          id="rules"
          className="section-card rounded-3xl p-6 sm:p-7 border border-white/60 dark:border-white/10 shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-2xl -mr-20 -mt-20" />
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div
                className={`p-4 rounded-2xl shadow-lg ${
                  theme === 'dark' ? 'bg-gradient-to-br from-indigo-600 to-purple-600' : 'bg-gradient-to-br from-indigo-500 to-purple-500'
                } text-white flex-shrink-0`}
              >
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
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div
          id="contacts"
          className="section-card rounded-3xl p-6 sm:p-7 border border-white/60 dark:border-white/10 shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-full blur-2xl -mr-20 -mt-20" />
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div
                className={`p-4 rounded-2xl shadow-lg ${
                  theme === 'dark' ? 'bg-gradient-to-br from-pink-600 to-rose-600' : 'bg-gradient-to-br from-pink-500 to-rose-500'
                } text-white flex-shrink-0`}
              >
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

