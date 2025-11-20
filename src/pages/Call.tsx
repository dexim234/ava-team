// Call page for team - Simple placeholder
import { useThemeStore } from '@/store/themeStore'
import { Layout } from '@/components/Layout'

export const Call = () => {
  const { theme } = useThemeStore()
  const bgColor = theme === 'dark' ? 'bg-gray-800' : 'bg-white'
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
  const subtleColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
  const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200'

  return (
    <Layout>
      <div className={`${bgColor} rounded-xl p-8 text-center shadow-lg border ${borderColor}`}>
        <h2 className={`text-2xl font-bold ${textColor} mb-4`}>Call</h2>
        <p className={subtleColor}>
          Раздел для управления торговыми сигналами командой. Полный функционал Club доступен на сайте для учеников.
        </p>
      </div>
    </Layout>
  )
}
