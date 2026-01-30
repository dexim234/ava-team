import React, { useState, useEffect } from 'react'
import { useAccessControl } from '@/contexts/AccessControlContext'
import { useDeviceDetection } from '@/hooks/useDeviceDetection'
import { Shield, Clock, AlertTriangle } from 'lucide-react'

export const AccessBlockScreen: React.FC = () => {
  const { settings } = useAccessControl()
  const deviceInfo = useDeviceDetection()
  const [showBlockScreen, setShowBlockScreen] = useState(false)
  const [blockReason, setBlockReason] = useState<string>('')

  useEffect(() => {
    // Проверяем основные условия блокировки
    if (!settings.isBlockingEnabled) {
      setShowBlockScreen(false)
      return
    }

    // В тестовом режиме не блокируем (проверяем через контекст)
    if (settings.isTestMode && settings.isAdmin) {
      setShowBlockScreen(false)
      return
    }

    // Проверяем блокировку по типу устройства
    const shouldBlockDevice = (
      (deviceInfo.isPhone && settings.blockMobile) ||
      (deviceInfo.isTablet && settings.blockTablet) ||
      (deviceInfo.isDesktop && settings.blockDesktop)
    )

    if (shouldBlockDevice) {
      const deviceType = deviceInfo.isPhone 
        ? 'мобильным телефоном' 
        : deviceInfo.isTablet 
          ? 'планшетом' 
          : 'персональным компьютером'
      
      setBlockReason(`Блокировка по типу устройства: ${deviceType}`)
      setShowBlockScreen(true)
      return
    }

    // Проверяем блокировку по пользователю
    if (settings.blockedUsers && settings.blockedUsers.length > 0) {
      // Здесь можно добавить логику проверки пользователя
      // Пока заглушка
      setBlockReason('Пользователь находится в списке заблокированных')
      setShowBlockScreen(false) // Не блокируем по пользователю в демо
    }

    setShowBlockScreen(false)
  }, [settings, deviceInfo])

  if (!showBlockScreen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
        {/* Иконка */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full">
            <Shield className="w-12 h-12 text-red-500" />
          </div>
        </div>

        {/* Заголовок */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Доступ ограничен
        </h1>

        {/* Причина блокировки */}
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {blockReason}
        </p>

        {/* Дополнительная информация */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
              Информация
            </span>
          </div>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Если вы считаете, что доступ ограничен по ошибке, обратитесь к администратору сайта.
          </p>
        </div>

        {/* Техническая информация */}
        <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-3 h-3" />
            <span>Время: {new Date().toLocaleString('ru-RU')}</span>
          </div>
          <div>
            <span>Устройство: {deviceInfo.isPhone ? 'Мобильный' : deviceInfo.isTablet ? 'Планшет' : 'ПК'}</span>
          </div>
          <div>
            <span>Размер экрана: {window.innerWidth}×{window.innerHeight}</span>
          </div>
        </div>

        {/* Кнопка перезагрузки */}
        <button
          onClick={() => window.location.reload()}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Перезагрузить страницу
        </button>
      </div>
    </div>
  )
}