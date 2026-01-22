import { memo } from 'react'
import { useThemeStore } from '@/store/themeStore'
import { useAuthStore } from '@/store/authStore'
import { useUsers } from '@/hooks/useUsers'
import type { Event } from '@/types'
import { EVENT_CATEGORY_META } from '@/types'
import {
  Edit,
  Trash2,
  Calendar,
  Clock,
  Users,
  FileText,
  ExternalLink,
  Timer,
  Rocket,
  BarChart3,
  Image as ImageIcon,
  Shield,
  Coins,
  TrendingUp,
  Gift,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Pin,
  PinOff,
} from 'lucide-react'
import { updateEvent } from '@/services/eventService'
import { format, parseISO } from 'date-fns'
import { LucideIcon } from 'lucide-react'

interface EventCardProps {
  event: Event
  isAdmin: boolean
  onEdit: (event: Event) => void
  onDelete: (eventId: string) => void
  onRSVP?: () => void
  isEditable?: boolean // можно ли менять RSVP статус
}

const categoryIcons: Record<string, LucideIcon> = {
  memecoins: Rocket,
  polymarket: BarChart3,
  nft: ImageIcon,
  staking: Shield,
  spot: Coins,
  futures: TrendingUp,
  airdrop: Gift,
}

// Получение текущего времени в Москве (UTC+3)
const getMoscowDateTime = (): { date: string; time: string } => {
  const now = new Date()
  const moscowTime = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours() + 3, now.getUTCMinutes(), now.getUTCSeconds())

  const dateStr = `${moscowTime.getFullYear()}-${String(moscowTime.getMonth() + 1).padStart(2, '0')}-${String(moscowTime.getDate()).padStart(2, '0')}`
  const timeStr = `${String(moscowTime.getHours()).padStart(2, '0')}:${String(moscowTime.getMinutes()).padStart(2, '0')}`

  return { date: dateStr, time: timeStr }
}

// Получение текущего времени в МСК в миллисекундах
const getMoscowTimeMs = (): number => {
  const now = new Date()
  // UTC время в миллисекундах + 3 часа = московское время
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60 * 1000
  return utcMs + 3 * 60 * 60 * 1000
}

// Проверка, скоро ли начнётся событие (в пределах 30 минут)
const isSoonStarting = (eventDateTimeMs: number): boolean => {
  const nowMskMs = getMoscowTimeMs()
  const timeToStart = eventDateTimeMs - nowMskMs
  return timeToStart > 0 && timeToStart <= 30 * 60 * 1000
}

export const EventCard = memo(({ event, isAdmin, onEdit, onDelete, isEditable = true }: EventCardProps) => {
  const { theme } = useThemeStore()
  const { user } = useAuthStore()
  const { users: allMembers } = useUsers()

  const meta = EVENT_CATEGORY_META[event.category]
  const IconComponent = categoryIcons[event.category] || Rocket

  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
  const subtleColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-gray-100'
  const cardBg = theme === 'dark' ? 'bg-white/5 backdrop-blur-md' : 'bg-white'

  const { date: currentDate } = getMoscowDateTime()

  // Calculate event status using Moscow time
  const eventStartMs = new Date(`${currentDate}T${event.time}`).getTime()
  const eventEndMs = event.endTime
    ? new Date(`${currentDate}T${event.endTime}`).getTime()
    : eventStartMs + 2 * 60 * 60 * 1000

  const isActive = event.dates.includes(currentDate) &&
    eventStartMs <= getMoscowTimeMs() &&
    eventEndMs > getMoscowTimeMs()

  // Check if event is in the past
  const isPast = !event.dates.includes(currentDate) ||
    (event.dates.includes(currentDate) && eventEndMs <= getMoscowTimeMs())

  // Get next occurrence date using Moscow time
  const upcomingDates = event.dates.filter(date => date >= currentDate).sort()
  const nextDate = upcomingDates[0]

  // Calculate time until event using Moscow time
  const getTimeUntilEvent = (): string | null => {
    if (!nextDate) return null
    const eventDateTime = new Date(`${nextDate}T${event.time}`)
    const diff = eventDateTime.getTime() - getMoscowTimeMs()
    if (diff < 0) return null

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    const parts = []
    if (days > 0) parts.push(`${days}д`)
    if (hours > 0) parts.push(`${hours}ч`)
    if (minutes > 0 || (hours > 0)) parts.push(`${minutes}м`)
    parts.push(`${seconds}с`)

    return parts.join(' ')
  }

  const timeUntil = getTimeUntilEvent()

  // Check if event starts soon (within 30 minutes)
  const startsSoon = nextDate && isSoonStarting(new Date(`${nextDate}T${event.time}`).getTime())

  // Get participant names
  const participants = event.requiredParticipants.map(id => {
    const member = allMembers.find((m: any) => m.id === id)
    return member?.name || 'Unknown'
  }).filter(Boolean)

  // Check if current user is involved
  const isUserRequired = user && event.requiredParticipants.includes(user.id)
  const isUserRecommended = user && (event.recommendedParticipants || []).includes(user.id)

  // Format date helper
  const formatDate = (dateStr: string) => {
    return format(parseISO(dateStr), 'dd.MM.yyyy')
  }

  const handleToggleHidden = async () => {
    if (!isAdmin) return
    try {
      await updateEvent(event.id, { isHidden: !event.isHidden })
    } catch (error) {
      console.error('Failed to toggle visibility:', error)
    }
  }

  const handleToggleActual = async () => {
    if (!isAdmin) return
    try {
      await updateEvent(event.id, { isActualForce: !event.isActualForce })
    } catch (error) {
      console.error('Failed to toggle actual status:', error)
    }
  }

  const handleRSVP = async (going: boolean) => {
    if (!user || !isEditable) return

    const currentGoing = [...event.going]
    const currentNotGoing = [...event.notGoing]

    try {
      if (going) {
        if (currentGoing.includes(user.id)) {
          // Already going - remove
          const updatedGoing = currentGoing.filter(id => id !== user.id)
          await updateEvent(event.id, { going: updatedGoing })
        } else {
          // Not going yet - add to going, remove from notGoing
          const updatedGoing = [...currentGoing, user.id]
          const updatedNotGoing = currentNotGoing.filter(id => id !== user.id)
          await updateEvent(event.id, { going: updatedGoing, notGoing: updatedNotGoing })
        }
      } else {
        if (currentNotGoing.includes(user.id)) {
          // Already not going - remove
          const updatedNotGoing = currentNotGoing.filter(id => id !== user.id)
          await updateEvent(event.id, { notGoing: updatedNotGoing })
        } else {
          // Add to notGoing, remove from going
          const updatedNotGoing = [...currentNotGoing, user.id]
          const updatedGoing = currentGoing.filter(id => id !== user.id)
          await updateEvent(event.id, { going: updatedGoing, notGoing: updatedNotGoing })
        }
      }
    } catch (error: any) {
      console.error('Failed to RSVP:', error)
      alert(error.message || 'Ошибка при сохранении ответа')
    }
  }

  const goingUsers = event.going.map(id => allMembers.find((m: any) => m.id === id)?.name).filter(Boolean)
  const notGoingUsers = event.notGoing.map(id => allMembers.find((m: any) => m.id === id)?.name).filter(Boolean)

  const isUserGoing = user && event.going.includes(user.id)
  const isUserNotGoing = user && event.notGoing.includes(user.id)

  return (
    <div
      className={`relative p-3 rounded-lg border ${borderColor} ${cardBg} shadow-sm hover:shadow-lg transition-all group overflow-hidden ${!isEditable ? 'opacity-75' : ''} ${event.isHidden ? 'opacity-50 ring-1 ring-red-500/20' : ''}`}
    >
      {/* Background Gradient Glow */}
      <div className={`absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br ${meta.cardGradient} blur-2xl opacity-25 group-hover:opacity-50 transition-opacity duration-500`} />

      <div className="relative">
        {/* Header: Icon, Title, Category */}
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-lg bg-gradient-to-br ${meta.gradient} shadow-lg shadow-emerald-500/10 text-white shrink-0`}>
            <IconComponent className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className={`text-sm font-bold ${textColor} tracking-tight leading-tight line-clamp-2`}>{event.title}</h3>
            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-gradient-to-r ${meta.gradient} text-white shadow-sm`}>
              {meta.label}
            </span>
          </div>
        </div>

        {/* Date and Time */}
        <div className="flex items-center gap-2 mt-3 text-xs">
          <div className="flex items-center gap-1.5">
            <Calendar size={12} className="text-emerald-500" />
            <span className={`font-medium ${subtleColor}`}>
              {event.dates.length === 1
                ? formatDate(event.dates[0])
                : `${formatDate(event.dates[0])} — ${formatDate(event.dates[event.dates.length - 1])}`
              }
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={12} className="text-emerald-500" />
            <span className={`font-medium ${subtleColor}`}>
              {event.time}{event.endTime ? ` — ${event.endTime}` : ''}
            </span>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {isActive && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-bold uppercase text-emerald-500 tracking-wider">Идёт сейчас</span>
            </div>
          )}
          {startsSoon && !isActive && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/20">
              <AlertCircle size={10} className="text-amber-500" />
              <span className="text-[9px] font-bold uppercase text-amber-500">Скоро начнётся</span>
            </div>
          )}
          {timeUntil && !isActive && !startsSoon && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/20">
              <Timer size={10} className="text-amber-500" />
              <span className="text-[9px] font-bold text-amber-500">{timeUntil}</span>
            </div>
          )}
          {isUserGoing && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 size={10} className="text-emerald-500" />
              <span className="text-[9px] font-bold uppercase text-emerald-500">Вы идёте</span>
            </div>
          )}
          {isUserNotGoing && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-rose-500/10 border border-rose-500/20">
              <XCircle size={10} className="text-rose-500" />
              <span className="text-[9px] font-bold uppercase text-rose-500">Вас не будет</span>
            </div>
          )}
          {!isUserGoing && !isUserNotGoing && (isUserRequired || isUserRecommended) && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-blue-500/10 border border-blue-500/20">
              <Users size={10} className="text-blue-500" />
              <span className="text-[9px] font-bold uppercase text-blue-500">
                {isUserRequired ? 'Вы участник' : 'Рекомендовано'}
              </span>
            </div>
          )}
          {event.isActualForce && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20">
              <Pin size={10} className="text-cyan-500" />
              <span className="text-[9px] font-bold uppercase text-cyan-500">Закреплено</span>
            </div>
          )}
          {event.isHidden && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-500/10 border border-gray-500/20">
              <EyeOff size={10} className="text-gray-500" />
              <span className="text-[9px] font-bold uppercase text-gray-500">Скрыто</span>
            </div>
          )}
          {!isEditable && (isActive || isPast) && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-500/10 border border-gray-500/20">
              <AlertCircle size={10} className="text-gray-500" />
              <span className="text-[9px] font-bold uppercase text-gray-500">
                {isActive ? 'Сейчас идёт' : 'Завершено'}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        {event.description && (
          <p className={`mt-2 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} line-clamp-2`}>
            {event.description}
          </p>
        )}

        {/* Links */}
        {event.links.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {event.links.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold transition-all ${theme === 'dark' ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
              >
                <ExternalLink size={10} />
                {link.name}
              </a>
            ))}
          </div>
        )}

        {/* Going/Not Going Lists */}
        <div className="mt-2 space-y-1.5">
          {goingUsers.length > 0 && (
            <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-emerald-500/5 border border-emerald-500/10' : 'bg-emerald-50 border border-emerald-100'}`}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <CheckCircle2 size={10} className="text-emerald-500" />
                <span className="text-[9px] font-bold uppercase text-emerald-500">Будут ({goingUsers.length})</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {goingUsers.slice(0, 4).map((name, idx) => (
                  <span
                    key={idx}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${theme === 'dark' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white text-emerald-700 border border-emerald-100'}`}
                  >
                    {name}
                  </span>
                ))}
                {goingUsers.length > 4 && (
                  <span className={`text-[9px] font-medium ${subtleColor}`}>+{goingUsers.length - 4}</span>
                )}
              </div>
            </div>
          )}

          {notGoingUsers.length > 0 && (
            <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-rose-500/5 border border-rose-500/10' : 'bg-rose-50 border border-rose-100'}`}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <XCircle size={10} className="text-rose-500" />
                <span className="text-[9px] font-bold uppercase text-rose-500">Не смогут ({notGoingUsers.length})</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {notGoingUsers.slice(0, 3).map((name, idx) => (
                  <span
                    key={idx}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${theme === 'dark' ? 'bg-rose-500/10 text-rose-400' : 'bg-white text-rose-700 border border-rose-100'}`}
                  >
                    {name}
                  </span>
                ))}
                {notGoingUsers.length > 3 && (
                  <span className={`text-[9px] font-medium ${subtleColor}`}>+{notGoingUsers.length - 3}</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Participants */}
        {participants.length > 0 && (
          <div className={`mt-2 p-2 rounded-lg ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Users size={10} className={subtleColor} />
              <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500">Участники</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {participants.slice(0, 3).map((name, idx) => (
                <span
                  key={idx}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${theme === 'dark' ? 'bg-white/10 text-gray-300' : 'bg-white text-gray-600'}`}
                >
                  {name}
                </span>
              ))}
              {participants.length > 3 && (
                <span className={`text-[9px] font-medium ${subtleColor}`}>+{participants.length - 3}</span>
              )}
            </div>
          </div>
        )}

        {/* Files */}
        {event.files.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {event.files.map((file) => (
              <a
                key={file.id}
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold transition-all ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
              >
                <FileText size={10} />
                {file.name}
              </a>
            ))}
          </div>
        )}

        {/* RSVP Buttons */}
        {user && isEditable && (
          <div className="flex gap-1.5 mt-3">
            <button
              onClick={() => handleRSVP(true)}
              className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${isUserGoing
                ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                }`}
            >
              <CheckCircle2 size={12} />
              Я буду
            </button>
            <button
              onClick={() => handleRSVP(false)}
              className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${isUserNotGoing
                ? 'bg-rose-500 text-white shadow-rose-500/20'
                : 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20'
                }`}
            >
              <XCircle size={12} />
              Не буду
            </button>
          </div>
        )}

        {/* Admin Actions */}
        {isAdmin && (
          <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-white/5">
            <button
              onClick={handleToggleActual}
              title={event.isActualForce ? "Убрать из актуальных" : "Добавить в актуальные"}
              className={`p-1.5 rounded-lg transition-all ${event.isActualForce ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-gray-400 hover:text-white'}`}
            >
              {event.isActualForce ? <PinOff size={14} /> : <Pin size={14} />}
            </button>
            <button
              onClick={handleToggleHidden}
              title={event.isHidden ? "Показать пользователям" : "Скрыть от пользователей"}
              className={`p-1.5 rounded-lg transition-all ${event.isHidden ? 'bg-rose-500/20 text-rose-400' : 'bg-white/5 text-gray-400 hover:text-white'}`}
            >
              {event.isHidden ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>
            <div className="flex-1" />
            <button
              onClick={() => onEdit(event)}
              className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-500'}`}
            >
              <Edit size={12} />
              Изменить
            </button>
            <button
              onClick={() => onDelete(event.id)}
              className={`p-1.5 rounded-lg transition-all ${theme === 'dark' ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400' : 'bg-red-50 hover:bg-red-100 text-red-600'}`}
            >
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
})