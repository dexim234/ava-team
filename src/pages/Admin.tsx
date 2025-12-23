// Admin page - dedicated page for admin mode management
import { useState } from 'react'
import { Layout } from '@/components/Layout'
import { useThemeStore } from '@/store/themeStore'
import { useAdminStore } from '@/store/adminStore'
import { UserConflictsForm } from '@/components/Management/UserConflictsForm'
import { AccessBlocksForm } from '@/components/Management/AccessBlocksForm'
import { Shield, Sparkles, Lock, Key, UserX, ShieldX } from 'lucide-react'

export const Admin = () => {
  const { theme } = useThemeStore()
  const { isAdmin } = useAdminStore()
  const [showConflictsForm, setShowConflictsForm] = useState(false)
  const [showAccessBlocksForm, setShowAccessBlocksForm] = useState(false)
  const headingColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
  const labelColor = theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
  const cardBg = theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-white'

  if (!isAdmin) {
    return (
      <Layout>
        <div className={`rounded-2xl p-8 ${cardBg} shadow-xl border-2 ${
          theme === 'dark' 
            ? 'border-red-500/30 bg-gradient-to-br from-[#1a1a1a] to-[#0A0A0A]' 
            : 'border-red-200 bg-gradient-to-br from-white to-red-50/20'
        } relative overflow-hidden`}>
          <div className="text-center">
            <div className={`inline-flex p-4 rounded-2xl mb-4 ${
              theme === 'dark' 
                ? 'bg-red-500/20' 
                : 'bg-red-100'
            }`}>
              <Lock className={`w-12 h-12 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`} />
            </div>
            <h2 className={`text-2xl font-bold mb-2 ${headingColor}`}>Доступ запрещен</h2>
            <p className={labelColor}>
              Эта страница доступна только администраторам. Для входа используйте режим "Админ" на странице входа.
            </p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header with welcome message */}
        <div className={`rounded-2xl p-6 ${cardBg} shadow-lg border-2 ${
          theme === 'dark' 
            ? 'border-purple-500/30 bg-gradient-to-br from-[#1a1a1a] to-[#1a1a1a]/90' 
            : 'border-purple-200 bg-gradient-to-br from-white to-purple-50/30'
        }`}>
          <div className="flex items-start gap-4 mb-6">
            <div className={`p-3 rounded-xl ${
              theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'
            }`}>
              <Shield className={`w-8 h-8 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className={`text-3xl font-bold bg-gradient-to-r ${
                  theme === 'dark' 
                    ? 'from-purple-400 to-pink-400 text-transparent bg-clip-text' 
                    : 'from-purple-600 to-pink-600 text-transparent bg-clip-text'
                }`}>
                  Панель администратора
                </h1>
                <Sparkles className={`w-5 h-5 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'} animate-pulse`} />
              </div>
              <p className={`${labelColor} text-sm flex items-center gap-2`}>
                <Lock className="w-4 h-4" />
                Управление системой и командой ApeVault
              </p>
            </div>
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className={`p-4 rounded-xl border-2 ${
              theme === 'dark' 
                ? 'bg-blue-500/10 border-blue-500/30' 
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${
                  theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'
                }`}>
                  <Shield className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <h3 className={`font-semibold ${headingColor}`}>Доступ к функциям</h3>
              </div>
              <p className={`text-sm ${labelColor}`}>
                В режиме администратора вы можете управлять слотами, статусами и заработком всех участников команды
              </p>
            </div>
            <div className={`p-4 rounded-xl border-2 ${
              theme === 'dark' 
                ? 'bg-[#4E6E49]/10 border-[#4E6E49]/30' 
                : 'bg-[#4E6E49]/10 border-[#4E6E49]/30'
            }`}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${
                  theme === 'dark' ? 'bg-[#4E6E49]/20' : 'bg-green-100'
                }`}>
                  <Key className={`w-5 h-5 ${theme === 'dark' ? 'text-[#4E6E49]' : 'text-[#4E6E49]'}`} />
                </div>
                <h3 className={`font-semibold ${headingColor}`}>Безопасность</h3>
              </div>
              <p className={`text-sm ${labelColor}`}>
                Режим администратора требует ввода пароля. Не делитесь паролем с другими участниками
              </p>
            </div>
          </div>

          {/* Admin status info */}
          <div className={`pt-4 border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className={`flex items-center gap-3 p-4 rounded-xl ${
              theme === 'dark' 
                ? 'bg-[#4E6E49]/20 border-2 border-[#4E6E49]/50' 
                : 'bg-green-50 border-2 border-green-200'
            }`}>
              <div className={`p-2 rounded-lg ${
                theme === 'dark' ? 'bg-[#4E6E49]/30' : 'bg-green-100'
              }`}>
                <Shield className={`w-6 h-6 ${theme === 'dark' ? 'text-[#4E6E49]' : 'text-[#4E6E49]'}`} />
              </div>
              <div>
                <h3 className={`font-semibold mb-1 ${headingColor}`}>Режим администратора активен</h3>
                <p className={`text-sm ${labelColor}`}>
                  Вы вошли в систему как администратор. Все административные функции доступны.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Access Management */}
        <div className={`rounded-2xl p-6 ${cardBg} shadow-lg border-2 ${
          theme === 'dark'
            ? 'border-red-500/30 bg-gradient-to-br from-[#1a1a1a] to-red-950/20'
            : 'border-red-200 bg-gradient-to-br from-white to-red-50/20'
        }`}>
          <h2 className={`text-xl font-semibold mb-4 ${headingColor} flex items-center gap-2`}>
            <ShieldX className="w-5 h-5 text-red-500" />
            Управление доступом и конфликтами
          </h2>
          <p className={`text-sm mb-6 ${labelColor}`}>
            Настройте ограничения на совместную работу пользователей и блокировку доступа к функциям
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setShowConflictsForm(true)}
              className={`p-4 rounded-xl border-2 transition-all hover:shadow-lg hover:-translate-y-1 ${
                theme === 'dark'
                  ? 'border-red-500/50 bg-red-500/10 hover:bg-red-500/20 text-white'
                  : 'border-red-200 bg-red-50 hover:bg-red-100 text-gray-900'
              } text-left group`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark' ? 'bg-red-500/20 group-hover:bg-red-500/30' : 'bg-red-100 group-hover:bg-red-200'
                }`}>
                  <UserX className={`w-5 h-5 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`} />
                </div>
                <h3 className={`font-semibold ${headingColor}`}>Конфликты пользователей</h3>
              </div>
              <p className={`text-sm ${labelColor}`}>
                Запретите пользователям создавать пересекающиеся слоты. Настройте индивидуальные ограничения.
              </p>
            </button>

            <button
              onClick={() => setShowAccessBlocksForm(true)}
              className={`p-4 rounded-xl border-2 transition-all hover:shadow-lg hover:-translate-y-1 ${
                theme === 'dark'
                  ? 'border-red-500/50 bg-red-500/10 hover:bg-red-500/20 text-white'
                  : 'border-red-200 bg-red-50 hover:bg-red-100 text-gray-900'
              } text-left group`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark' ? 'bg-red-500/20 group-hover:bg-red-500/30' : 'bg-red-100 group-hover:bg-red-200'
                }`}>
                  <ShieldX className={`w-5 h-5 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`} />
                </div>
                <h3 className={`font-semibold ${headingColor}`}>Блокировка доступа</h3>
              </div>
              <p className={`text-sm ${labelColor}`}>
                Заблокируйте доступ к определенным функциям для пользователей или всех участников.
              </p>
            </button>
          </div>
        </div>

        {/* Modals */}
        {showConflictsForm && (
          <UserConflictsForm onClose={() => setShowConflictsForm(false)} />
        )}
        {showAccessBlocksForm && (
          <AccessBlocksForm onClose={() => setShowAccessBlocksForm(false)} />
        )}

        {/* Admin features info */}
        <div className={`rounded-2xl p-6 ${cardBg} shadow-lg border-2 ${
          theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
        }`}>
          <h2 className={`text-xl font-semibold mb-4 ${headingColor}`}>Возможности администратора</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl border ${
              theme === 'dark' ? 'border-gray-800 bg-gray-700/30' : 'border-gray-200 bg-gray-50'
            }`}>
              <h3 className={`font-semibold mb-2 ${headingColor}`}>📅 Управление слотами</h3>
              <ul className={`text-sm space-y-1 ${labelColor} list-disc list-inside`}>
                <li>Создание слотов для любого участника</li>
                <li>Массовое создание слотов</li>
                <li>Удаление слотов любого участника</li>
                <li>Массовое удаление слотов</li>
              </ul>
            </div>
            <div className={`p-4 rounded-xl border ${
              theme === 'dark' ? 'border-gray-800 bg-gray-700/30' : 'border-gray-200 bg-gray-50'
            }`}>
              <h3 className={`font-semibold mb-2 ${headingColor}`}>📋 Управление статусами</h3>
              <ul className={`text-sm space-y-1 ${labelColor} list-disc list-inside`}>
                <li>Установка выходных, больничных и отпуск</li>
                <li>Массовое управление статусами</li>
                <li>Удаление статусов любого участника</li>
              </ul>
            </div>
            <div className={`p-4 rounded-xl border ${
              theme === 'dark' ? 'border-gray-800 bg-gray-700/30' : 'border-gray-200 bg-gray-50'
            }`}>
              <h3 className={`font-semibold mb-2 ${headingColor}`}>💰 Управление заработком</h3>
              <ul className={`text-sm space-y-1 ${labelColor} list-disc list-inside`}>
                <li>Добавление заработка за любую дату</li>
                <li>Редактирование записей о заработке</li>
                <li>Удаление записей о заработке</li>
              </ul>
            </div>
            <div className={`p-4 rounded-xl border ${
              theme === 'dark' ? 'border-gray-800 bg-gray-700/30' : 'border-gray-200 bg-gray-50'
            }`}>
              <h3 className={`font-semibold mb-2 ${headingColor}`}>📊 Дополнительно</h3>
              <ul className={`text-sm space-y-1 ${labelColor} list-disc list-inside`}>
                <li>Удаление сообщений из подсчета</li>
                <li>Полный доступ ко всем функциям</li>
                <li>Просмотр и управление данными команды</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

