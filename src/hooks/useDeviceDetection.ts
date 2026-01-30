import { useState, useEffect } from 'react'

interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isPhone: boolean // Точно мобильный телефон
  isLandscape: boolean
  screenWidth: number
  screenHeight: number
  devicePixelRatio: number
  userAgent: string
}

export const useDeviceDetection = (): DeviceInfo => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isPhone: false,
        isLandscape: true,
        screenWidth: 1920,
        screenHeight: 1080,
        devicePixelRatio: 1,
        userAgent: ''
      }
    }

    const width = window.innerWidth
    const height = window.innerHeight
    const userAgent = navigator.userAgent.toLowerCase()
    const devicePixelRatio = window.devicePixelRatio || 1

    // Определение точного типа устройства
    const isPhone = (
      // Точные мобильные телефоны по User-Agent
      /android.*mobile|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent) ||
      // Точные размеры мобильных телефонов
      (width < 768 && height < 1024)
    ) && !(
      // Исключаем планшеты
      /ipad|android.*(?!.*mobile)/i.test(userAgent) ||
      (width >= 768 && width <= 1024 && height >= 768)
    )

    const isTablet = (
      /ipad|android.*(?!.*mobile)/i.test(userAgent) ||
      (width >= 768 && width <= 1024 && height >= 768) ||
      (width >= 1024 && width <= 1366 && height >= 768)
    ) && !isPhone

    const isDesktop = !isPhone && !isTablet

    return {
      isMobile: isPhone,
      isTablet,
      isDesktop,
      isPhone,
      isLandscape: width > height,
      screenWidth: width,
      screenHeight: height,
      devicePixelRatio,
      userAgent: navigator.userAgent
    }
  })

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const userAgent = navigator.userAgent.toLowerCase()
      const devicePixelRatio = window.devicePixelRatio || 1

      const isPhone = (
        /android.*mobile|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent) ||
        (width < 768 && height < 1024)
      ) && !(
        /ipad|android.*(?!.*mobile)/i.test(userAgent) ||
        (width >= 768 && width <= 1024 && height >= 768)
      )

      const isTablet = (
        /ipad|android.*(?!.*mobile)/i.test(userAgent) ||
        (width >= 768 && width <= 1024 && height >= 768) ||
        (width >= 1024 && width <= 1366 && height >= 768)
      ) && !isPhone

      const isDesktop = !isPhone && !isTablet

      setDeviceInfo({
        isMobile: isPhone,
        isTablet,
        isDesktop,
        isPhone,
        isLandscape: width > height,
        screenWidth: width,
        screenHeight: height,
        devicePixelRatio,
        userAgent: navigator.userAgent
      })
    }

    // Обновляем при изменении размера окна
    window.addEventListener('resize', updateDeviceInfo)
    
    // Обновляем при изменении ориентации
    window.addEventListener('orientationchange', updateDeviceInfo)

    return () => {
      window.removeEventListener('resize', updateDeviceInfo)
      window.removeEventListener('orientationchange', updateDeviceInfo)
    }
  }, [])

  return deviceInfo
}

// Утилитарные функции для проверки устройств
export const isMobilePhone = (): boolean => {
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

export const isTablet = (): boolean => {
  if (typeof window === 'undefined') return false
  
  const width = window.innerWidth
  const height = window.innerHeight
  const userAgent = navigator.userAgent.toLowerCase()

  return (
    (/ipad|android.*(?!.*mobile)/i.test(userAgent) ||
     (width >= 768 && width <= 1024 && height >= 768) ||
     (width >= 1024 && width <= 1366 && height >= 768)) &&
    !isMobilePhone()
  )
}

export const isDesktop = (): boolean => {
  return !isMobilePhone() && !isTablet()
}