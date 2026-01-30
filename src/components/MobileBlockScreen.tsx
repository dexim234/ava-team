import { useState, useEffect } from 'react'
import { useThemeStore } from '@/store/themeStore'
import { Smartphone, Tablet, Monitor, X } from 'lucide-react'

// Функция для определения мобильного устройства
const isMobilePhone = (): boolean => {
  if (typeof window === 'undefined') return false
  
  const width = window.innerWidth
  const height = window.innerHeight
  const userAgent = navigator.userAgent.toLowerCase()

  return (
    (/android.*mobile|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent) ||
     (width < 768 && height < 1024)) &&
    !(/ipad|android.*(?!.*mobile)/i.test(userAgent) ||
      (width >= 768 && width <= 1024 && height >= 768))
  )
}

export const MobileBlockScreen = () => {
  const { theme } = useThemeStore()
  const [isPhone, setIsPhone] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [screenInfo, setScreenInfo] = useState({
    width: 0,
    height: 0,
    isLandscape: false
  })

  // Проверяем тип устройства при монтировании
  useEffect(() => {
    const checkDevice = () => {
      const phone = isMobilePhone()
      setIsPhone(phone)
      
      if (phone) {
        setShowModal(true)
      }
      
      setScreenInfo({
        width: window.innerWidth,
        height: window.innerHeight,
        isLandscape: window.innerWidth > window.innerHeight
      })
    }

    checkDevice()
    
    window.addEventListener('resize', checkDevice)
    window.addEventListener('orientationchange', checkDevice)
    
    return () => {
      window.removeEventListener('resize', checkDevice)
      window.removeEventListener('orientationchange', checkDevice)
    }
  }, [])

  // Если устройство не мобильный телефон или модальное окно не нужно показывать
  if (!isPhone || !showModal) {
    return null
  }

  // Определяем цвета для темы
  const bgColor = theme === 'dark' ? 'bg-slate-950' : 'bg-gray-100'
  const cardBg = theme === 'dark' 
    ? 'bg-gradient-to-br from-[#0c1320] via-[#0b1220] to-[#08111b] border-white/10' 
    : 'bg-white border-slate-200'
  const titleColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
  const textColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
  const iconBg = theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100'
  const iconColor = theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
  const deviceBg = theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
  const deviceText = theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
  const deviceIconColor = theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
  const deviceIconBg = theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
  const allowedIconColor = theme === 'dark' ? 'text-green-400' : 'text-green-600'
  const notAllowedIconColor = theme === 'dark' ? 'text-red-400' : 'text-red-600'

  return (
    <div className={`fixed inset-0 ${bgColor} flex items-center justify-center z-50 p-4`}>
      <div className={`max-w-lg w-full ${cardBg} rounded-3xl shadow-2xl border p-8 text-center relative`}>
        {/* Кнопка закрытия */}
        <button
          onClick={() => setShowModal(false)}
          className={`absolute top-4 right-4 p-2 rounded-full ${deviceIconBg} ${deviceIconColor} hover:opacity-70 transition-opacity`}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-8">
          <div className={`w-20 h-20 ${iconBg} rounded-full flex items-center justify-center mx-auto mb-6`}>
            <Smartphone className={`w-10 h-10 ${iconColor}`} />
          </div>
          <h1 className={`text-3xl font-bold ${titleColor} mb-4`}>
            Мобильные телефоны не поддерживаются
          </h1>
          <p className={`text-lg ${textColor} mb-2`}>
            Мы поддерживаем только планшеты и компьютеры для использования
          </p>
        </div>

        {/* Устройства */}
        <div className="space-y-4 mb-8">
          {/* Планшет */}
          <div className={`${deviceBg} rounded-xl p-4 flex items-center justify-between`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${deviceIconBg} rounded-lg flex items-center justify-center`}>
                <Tablet className={`w-6 h-6 ${allowedIconColor}`} />
              </div>
              <div className="text-left">
                <p className={`font-medium ${deviceText}`}>Планшет</p>
                <p className={`text-sm ${textColor}`}>Рекомендуется</p>
              </div>
            </div>
            <div className="text-green-500 font-semibold text-sm">
              ✓ Поддерживается
            </div>
          </div>

          {/* Компьютер */}
          <div className={`${deviceBg} rounded-xl p-4 flex items-center justify-between`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${deviceIconBg} rounded-lg flex items-center justify-center`}>
                <Monitor className={`w-6 h-6 ${allowedIconColor}`} />
              </div>
              <div className="text-left">
                <p className={`font-medium ${deviceText}`}>Персональный компьютер</p>
                <p className={`text-sm ${textColor}`}>Рекомендуется</p>
              </div>
            </div>
            <div className="text-green-500 font-semibold text-sm">
              ✓ Поддерживается
            </div>
          </div>

          {/* Мобильный телефон */}
          <div className={`${deviceBg} rounded-xl p-4 flex items-center justify-between opacity-60`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${deviceIconBg} rounded-lg flex items-center justify-center`}>
                <Smartphone className={`w-6 h-6 ${notAllowedIconColor}`} />
              </div>
              <div className="text-left">
                <p className={`font-medium ${deviceText}`}>Мобильный телефон</p>
                <p className={`text-sm ${textColor}`}>Текущее устройство</p>
              </div>
            </div>
            <div className="text-red-500 font-semibold text-sm">
              ✗ Не поддерживается
            </div>
          </div>
        </div>

        {/* Информация о текущем устройстве */}
        <div className={`${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'} rounded-lg p-4 mb-6`}>
          <p className={`text-sm ${textColor} mb-2`}>
            Информация о вашем устройстве:
          </p>
          <div className={`text-xs ${textColor} space-y-1`}>
            <p>Размер экрана: {screenInfo.width} × {screenInfo.height}px</p>
            <p>Ориентация: {screenInfo.isLandscape ? 'Альбомная' : 'Книжная'}</p>
          </div>
        </div>

        {/* Рекомендации */}
        <div className={`${theme === 'dark' ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'} border rounded-lg p-4`}>
          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-amber-200' : 'text-amber-800'} mb-2`}>
            💡 Рекомендации
          </p>
          <p className={`text-sm ${theme === 'dark' ? 'text-amber-300' : 'text-amber-700'}`}>
            Для оптимального использования всех функций сайта рекомендуем использовать планшет или компьютер с браузером Chrome, Firefox или Safari
          </p>
        </div>

        <div className="mt-6 text-xs text-gray-500 dark:text-gray-500">
          ApeVault Team
        </div>
      </div>
    </div>
  )
}