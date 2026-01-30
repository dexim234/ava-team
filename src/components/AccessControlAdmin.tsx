import React, { useState } from 'react'
import { useAccessControl } from '@/contexts/AccessControlContext'
import { 
  Settings, 
  Smartphone, 
  Tablet, 
  Monitor, 
  Shield, 
  ShieldCheck,
  Save,
  RotateCcw,
  Eye,
  MessageSquare,
  X
} from 'lucide-react'

export const AccessControlAdmin: React.FC = () => {
  const { settings, updateSettings, resetSettings, isAdmin, setIsAdmin } = useAccessControl()
  const [isExpanded, setIsExpanded] = useState(false)
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false)
  const [password, setPassword] = useState('')
  const [customMessage, setCustomMessage] = useState(settings.customMessage || '')

  // Простая проверка админа (можно заменить на реальную аутентификацию)
  const handleAdminLogin = () => {
    // Простой пароль для демо (в реальном приложении нужна proper authentication)
    if (password === 'admin123' || password === 'ape2024') {
      setIsAdmin(true)
      setShowPasswordPrompt(false)
      setPassword('')
      localStorage.setItem('isAdmin', 'true')
    } else {
      alert('Неверный пароль')
    }
  }

  const handleLogout = () => {
    setIsAdmin(false)
    localStorage.removeItem('isAdmin')
  }

  const handleSaveSettings = () => {
    updateSettings({ customMessage: customMessage.trim() })
    alert('Настройки сохранены!')
  }

  const handleReset = () => {
    if (confirm('Вы уверены, что хотите сбросить все настройки к значениям по умолчанию?')) {
      resetSettings()
      setCustomMessage('')
      alert('Настройки сброшены!')
    }
  }

  // Если не админ, показываем кнопку входа
  if (!isAdmin) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowPasswordPrompt(true)}
          className="bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
          title="Вход в админ-панель"
        >
          <Settings className="w-5 h-5" />
        </button>

        {showPasswordPrompt && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Вход в админ-панель
              </h3>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль администратора"
                className="w-full p-2 border rounded-lg mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAdminLogin}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Войти
                </button>
                <button
                  onClick={() => {
                    setShowPasswordPrompt(false)
                    setPassword('')
                  }}
                  className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Кнопка управления */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`p-3 rounded-full shadow-lg transition-all ${
          settings.isBlockingEnabled 
            ? 'bg-red-600 hover:bg-red-700 text-white' 
            : 'bg-green-600 hover:bg-green-700 text-white'
        }`}
        title="Панель управления блокировкой"
      >
        {isExpanded ? <X className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
      </button>

      {/* Панель управления */}
      {isExpanded && (
        <div className="absolute bottom-16 right-0 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Управление доступом
            </h3>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Выйти
            </button>
          </div>

          {/* Главный переключатель */}
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {settings.isBlockingEnabled ? (
                  <Shield className="w-5 h-5 text-red-600" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                )}
                <span className="font-medium text-gray-900 dark:text-white">
                  Блокировка устройств
                </span>
              </div>
              <button
                onClick={() => updateSettings({ isBlockingEnabled: !settings.isBlockingEnabled })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.isBlockingEnabled ? 'bg-red-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.isBlockingEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Настройки блокировки по типам устройств */}
          <div className="mb-4 space-y-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Блокировать устройства:
            </h4>

            {/* Мобильные телефоны */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-red-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Мобильные телефоны</span>
              </div>
              <button
                onClick={() => updateSettings({ blockMobile: !settings.blockMobile })}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  settings.blockMobile ? 'bg-red-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    settings.blockMobile ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Планшеты */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tablet className="w-4 h-4 text-orange-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Планшеты</span>
              </div>
              <button
                onClick={() => updateSettings({ blockTablet: !settings.blockTablet })}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  settings.blockTablet ? 'bg-red-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    settings.blockTablet ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Персональные компьютеры */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Персональные компьютеры</span>
              </div>
              <button
                onClick={() => updateSettings({ blockDesktop: !settings.blockDesktop })}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  settings.blockDesktop ? 'bg-red-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    settings.blockDesktop ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Тестовый режим */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Тестовый режим</span>
              </div>
              <button
                onClick={() => updateSettings({ isTestMode: !settings.isTestMode })}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  settings.isTestMode ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    settings.isTestMode ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              В тестовом режиме блокировка работает, но показывается админ-панель
            </p>
          </div>

          {/* Кастомное сообщение */}
          <div className="mb-4">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <MessageSquare className="w-4 h-4" />
              Кастомное сообщение (опционально)
            </label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Введите кастомное сообщение для заблокированных пользователей..."
              className="w-full p-2 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              rows={3}
            />
          </div>

          {/* Кнопки действий */}
          <div className="flex gap-2">
            <button
              onClick={handleSaveSettings}
              className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
            >
              <Save className="w-4 h-4" />
              Сохранить
            </button>
            <button
              onClick={handleReset}
              className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-3 rounded-lg text-sm hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors flex items-center justify-center gap-1"
            >
              <RotateCcw className="w-4 h-4" />
              Сброс
            </button>
          </div>

          {/* Текущий статус */}
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <p>Статус: {settings.isBlockingEnabled ? 'Активна' : 'Отключена'}</p>
              <p>Блокируется: {
                [
                  settings.blockMobile && 'мобильные',
                  settings.blockTablet && 'планшеты', 
                  settings.blockDesktop && 'ПК'
                ].filter(Boolean).join(', ') || 'ничего'
              }</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}