// Rating calculation utilities
import { RatingData } from '@/types'

export interface RatingBreakdown {
  daysOff: number
  daysOffPoints: number
  sickDays: number
  sickDaysPoints: number
  vacationDays: number
  vacationDaysPoints: number
  weeklyHours: number
  weeklyHoursPoints: number
  weeklyEarnings: number
  weeklyEarningsPoints: number
  referrals: number
  referralsPoints: number
  weeklyMessages: number
  weeklyMessagesPoints: number
  totalRating: number
}

export const calculateRating = (
  data: Omit<RatingData, 'rating'>,
  weeklyHours: number = 0,
  weeklyEarnings: number = 0,
  weeklyMessages: number = 0
): number => {
  let rating = 0

  // Выходные: нет или <=3 дня в неделю = 10%
  if (data.daysOff === 0 || data.daysOff <= 3) {
    rating += 10
  }

  // Больничные: <=7 дней за месяц = 10%, иначе 0%
  if (data.sickDays <= 7) {
    rating += 10
  }

  // Отпуск: <=7 дней за месяц = 10%, иначе 0%
  if (data.vacationDays <= 7) {
    rating += 10
  }

  // Часы работы в неделю: <15 = 0%, >=15 = 15%, >=20 = 25%
  if (weeklyHours >= 20) {
    rating += 25
  } else if (weeklyHours >= 15) {
    rating += 15
  }

  // Заработок за неделю: >=6000 = 30%, >=3000 = 15%, <3000 = 0%
  if (weeklyEarnings >= 6000) {
    rating += 30
  } else if (weeklyEarnings >= 3000) {
    rating += 15
  }

  // Рефералы: 5% за каждого, но не более 30% (макс 6 рефералов)
  const referralsPoints = Math.min(data.referrals * 5, 30)
  rating += referralsPoints

  // Сообщения: >50 за неделю = 15%, меньше = 0%
  if (weeklyMessages > 50) {
    rating += 15
  }

  return Math.min(rating, 100)
}

export const getRatingBreakdown = (
  data: Omit<RatingData, 'rating'>,
  weeklyHours: number = 0,
  weeklyEarnings: number = 0,
  weeklyMessages: number = 0
): RatingBreakdown => {
  const daysOffPoints = (data.daysOff === 0 || data.daysOff <= 3) ? 10 : 0
  const sickDaysPoints = data.sickDays <= 7 ? 10 : 0
  const vacationDaysPoints = data.vacationDays <= 7 ? 10 : 0
  
  let weeklyHoursPoints = 0
  if (weeklyHours >= 20) {
    weeklyHoursPoints = 25
  } else if (weeklyHours >= 15) {
    weeklyHoursPoints = 15
  }

  let weeklyEarningsPoints = 0
  if (weeklyEarnings >= 6000) {
    weeklyEarningsPoints = 30
  } else if (weeklyEarnings >= 3000) {
    weeklyEarningsPoints = 15
  }

  const referralsPoints = Math.min(data.referrals * 5, 30)
  const weeklyMessagesPoints = weeklyMessages > 50 ? 15 : 0

  const totalRating = Math.min(
    daysOffPoints +
    sickDaysPoints +
    vacationDaysPoints +
    weeklyHoursPoints +
    weeklyEarningsPoints +
    referralsPoints +
    weeklyMessagesPoints,
    100
  )

  return {
    daysOff: data.daysOff,
    daysOffPoints,
    sickDays: data.sickDays,
    sickDaysPoints,
    vacationDays: data.vacationDays,
    vacationDaysPoints,
    weeklyHours,
    weeklyHoursPoints,
    weeklyEarnings,
    weeklyEarningsPoints,
    referrals: data.referrals,
    referralsPoints,
    weeklyMessages,
    weeklyMessagesPoints,
    totalRating,
  }
}

export const getRatingColor = (rating: number): string => {
  if (rating >= 80) return '#10b981' // Эталон (зелёный)
  if (rating >= 60) return '#3b82f6' // Уверенно (синий)
  if (rating >= 40) return '#f59e0b' // В пути (янтарный)
  return '#f43f5e' // Зона роста (розовый)
}



