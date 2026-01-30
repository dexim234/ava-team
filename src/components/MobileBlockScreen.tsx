import React, { useState, useEffect } from 'react'
import { useAccessControl } from '@/contexts/AccessControlContext'
import { useDeviceDetection } from '@/hooks/useDeviceDetection'
import { Smartphone, Tablet, Monitor, Info, X, Eye, EyeOff } from 'lucide-react'

export const MobileBlockScreen: React.FC = () => {
  const { settings } = useAccessControl()
  const deviceInfo = useDeviceDetection()
  const [showModal, setShowModal] = useState(false)
  const [debugInfo, setDebugInfo] = useState<{
    userAgent: string
    screenSize: string
    pixelRatio: number
    isPhone: boolean
    isTablet: boolean
    isDesktop: boolean
  } | null>(null)

  // Определяем, нужно ли показывать модальное окно
  useEffect(() => {
    if (!settings.isBlockingEnabled) {
      setShowModal(false)
      return
    }

    // В тестовом режиме не блокируем админа (проверяем через контекст)
    if (settings.isTestMode && settings.isAdmin) {
      setShowModal(false)
      return
    }

    // Проверяем тип устройства
    const shouldBlock = (
      (deviceInfo.isPhone && settings.blockMobile) ||
      (deviceInfo.isTablet && settings.blockTablet) ||
      (deviceInfo.isDesktop && settings.blockDesktop)
    )

    setShowModal(shouldBlock)

    // Собираем отладочную информацию
    setDebugInfo({
      userAgent: navigator.userAgent,
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      pixelRatio: window.devicePixelRatio,
      isPhone: deviceInfo.isPhone,
      isTablet: deviceInfo.isTablet,
      isDesktop: deviceInfo.isDesktop
    })
  }, [settings, deviceInfo])

  // Если модальное окно не нужно показывать, ничего не рендерим
  if (!showModal) {
    return null
  }

  // Определяем тип заблокированного устройства
  const blockedDeviceType = deviceInfo.isPhone 
    ? 'mobile' 
    : deviceInfo.isTablet 
      ? 'tablet' 
      : 'desktop'

  const deviceIcons = {
    mobile: <Smartphone className="w-16 h-16 text-red-500" />,
    tablet: <Tablet className="w-16 h-16 text-orange-500" />,
    desktop: <Monitor className="w-16 h-16 text-blue-500" />
  }

  const deviceNames = {
    mobile: 'Мобильный телефон',
    tablet: 'Планшет',
    desktop: 'Персональный компьютер'
  }

  const deviceColors = {
    mobile: 'text-red-500',
    tablet: 'text-orange-500', 
    desktop: 'text-blue-500'
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-lg w-full p-8 my-8 relative">
        {/* Кнопка закрытия (для тестирования) */}
        {settings.isTestMode && (
          <button
            onClick={() => setShowModal(false)}
            className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Иконка устройства */}
        <div className="flex justify-center mb-6">
          {deviceIcons[blockedDeviceType]}
        </div>

        {/* Заголовок */}
        <h1 className={`text-3xl font-bold text-center mb-4 ${deviceColors[blockedDeviceType]}`}>
          {deviceNames[blockedDeviceType]} заблокирован
        </h1>

        {/* Кастомное сообщение или стандартное */}
        <div className="text-center mb-6">
          {settings.customMessage ? (
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
              {settings.customMessage}
            </p>
          ) : (
            <>
              <p className="text-gray-700 dark:text-gray-300 text-lg mb-2">
                Данный сайт оптимизирован для работы на устройствах с большим экраном.
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Пожалуйста, используйте планшет или компьютер для доступа к сайту.
              </p>
            </>
          )}
        </div>

        {/* Информация об устройстве */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Информация об устройстве
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Тип:</span>
              <span className="ml-2 text-gray-900 dark:text-white font-medium">
                {deviceNames[blockedDeviceType]}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Размер:</span>
              <span className="ml-2 text-gray-900 dark:text-white font-medium">
                {debugInfo?.screenSize}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Pixel Ratio:</span>
              <span className="ml-2 text-gray-900 dark:text-white font-medium">
                {debugInfo?.pixelRatio}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Заблокировано:</span>
              <span className="ml-2 text-red-500 font-medium">Да</span>
            </div>
          </div>
        </div>

        {/* Рекомендации */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <p className="text-amber-800 dark:text-amber-200 text-sm">
            💡 <strong>Рекомендация:</strong> Используйте планшет или ноутбук/компьютер для полноценного доступа ко всем функциям сайта.
          </p>
        </div>

        {/* Статус всех устройств (для отладки) */}
        {settings.isTestMode && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Статус блокировки устройств:
            </h4>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className={`flex items-center gap-1 ${settings.blockMobile ? 'text-red-500' : 'text-green-500'}`}>
                {settings.blockMobile ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>📱 Мобильные</span>
              </div>
              <div className={`flex items-center gap-1 ${settings.blockTablet ? 'text-orange-500' : 'text-green-500'}`}>
                {settings.blockTablet ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>📱 Планшеты</span>
              </div>
              <div className={`flex items-center gap-1 ${settings.blockDesktop ? 'text-blue-500' : 'text-green-500'}`}>
                {settings.blockDesktop ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>💻 ПК</span>
              </div>
            </div>
          </div>
        )}

        {/* Отладочная информация (User-Agent) */}
        {settings.isTestMode && debugInfo && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400 break-all">
              {debugInfo.userAgent}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}