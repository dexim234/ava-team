// Rating calculation utilities
import { RatingData } from '@/types'

export interface RatingBreakdown {
  daysOff: number
  daysOffPoints: number
  sickDays: number
  sickDaysPoints: number
  vacationDays: number
  vacationDaysPoints: number
  absenceDays: number
  absenceDaysPoints: number
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

  // Прогулы: <=1 в неделю = рейтинг не страдает, >2 в неделю = рейтинг -30%
  let absencePenalty = 0
  if (data.absenceDays > 2) {
    absencePenalty = 30
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

  // Применяем штраф за прогулы
  rating = Math.max(0, rating - absencePenalty)

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

  // Прогулы: <=1 в неделю = 0% штрафа, >2 в неделю = -30%
  let absenceDaysPoints = 0
  if (data.absenceDays > 2) {
    absenceDaysPoints = -30
  }

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

  // Базовый рейтинг без учета прогулов
  const baseRating = daysOffPoints +
    sickDaysPoints +
    vacationDaysPoints +
    weeklyHoursPoints +
    weeklyEarningsPoints +
    referralsPoints +
    weeklyMessagesPoints

  // Применяем штраф за прогулы
  const totalRating = Math.min(Math.max(0, baseRating + absenceDaysPoints), 100)

  return {
    daysOff: data.daysOff,
    daysOffPoints,
    sickDays: data.sickDays,
    sickDaysPoints,
    vacationDays: data.vacationDays,
    vacationDaysPoints,
    absenceDays: data.absenceDays,
    absenceDaysPoints,
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

export interface ExclusionStatus {
  status: 'excluded' | 'warning' | 'ok'
  label: string
  description: string
  color: string
}

export const getExclusionStatus = (rating: number): ExclusionStatus => {
  if (rating < 20) {
    return {
      status: 'excluded',
      label: 'Исключен',
      description: 'Участник исключается из сообщества',
      color: '#dc2626' // красный
    }
  } else if (rating >= 21 && rating <= 45) {
    return {
      status: 'warning',
      label: 'Исправиться',
      description: 'Необходимо улучшить показатели',
      color: '#f59e0b' // янтарный
    }
  } else {
    return {
      status: 'ok',
      label: 'В команде',
      description: 'Участник в команде',
      color: '#10b981' // зеленый
    }
  }
}



