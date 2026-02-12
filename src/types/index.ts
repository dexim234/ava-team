export interface User {
  id: string
  name: string
  login: string
  password: string
  avatar?: string // Путь к изображению аватара
  role?: string
  nickname?: string
  recoveryCode?: string
  phone?: string
  positions?: string[] // Array of positions (max 10)
  primaryPosition?: string // Primary position displayed in schedule
}

// Predefined position options
export const PREDEFINED_POSITIONS = [
  'Founder',
  'Co-Founder',
  'Caller Ultima',
  'Caller PRO',
  'Caller Base',
  'Analyst Ultima',
  'Analyst PRO',
  'Analyst Base',
  'Trader Ultima',
  'Trader Pro',
  'Trader Base',
  'Developer',
] as const

// Slot types
export interface TimeSlot {
  start: string // HH:mm format
  end: string // HH:mm format
  endDate?: string // YYYY-MM-DD format - optional, only if slot crosses midnight
  breaks?: {
    start: string // HH:mm format
    end: string // HH:mm format
  }[]
}

export type SlotCategory = 'memecoins' | 'futures' | 'nft' | 'spot' | 'airdrop' | 'polymarket' | 'staking' | 'other'

export const SLOT_CATEGORY_META: Record<SlotCategory, { label: string; accent: string; icon: string }> = {
  memecoins: { label: 'Мемкоины', accent: 'emerald', icon: 'rocket' },
  futures: { label: 'Фьючерсы', accent: 'blue', icon: 'trending' },
  nft: { label: 'NFT', accent: 'purple', icon: 'image' },
  spot: { label: 'Спот', accent: 'amber', icon: 'coins' },
  airdrop: { label: 'AirDrop', accent: 'cyan', icon: 'gift' },
  polymarket: { label: 'Polymarket', accent: 'pink', icon: 'barchart' },
  staking: { label: 'Стейкинг', accent: 'indigo', icon: 'shield' },
  other: { label: 'Крипто-рынок', accent: 'gray', icon: 'sparkles' },
}

export interface WorkSlot {
  id: string
  userId: string
  date: string // YYYY-MM-DD format
  slots: TimeSlot[]
  comment?: string
  participants: string[] // user IDs
  category?: SlotCategory // optional for backward compatibility with old slots
}

// Day status types
export type DayStatusType = 'dayoff' | 'sick' | 'vacation' | 'absence' | 'truancy' | 'internship' | 'working' | 'weekend'

export interface DayStatus {
  id: string
  userId: string
  date: string
  type: DayStatusType
  status?: 'pending' | 'approved' | 'rejected'
  comment?: string
  endDate?: string // for multi-day statuses
}

// Restriction types
export type RestrictionType = 'slots' | 'dayoff' | 'sick' | 'vacation' | 'absence' | 'truancy' | 'internship' | 'all'

export interface Restriction {
  id: string
  type: RestrictionType // what to restrict
  startDate: string // YYYY-MM-DD format
  endDate?: string // YYYY-MM-DD format for ranges, optional for single dates
  startTime?: string // HH:mm format, optional - if set, restriction starts from this time
  blockFutureDates?: boolean // if true, after restriction time blocks creating records only on the next day after restriction date
  comment?: string
  createdBy: string // admin user ID
  createdAt: string
  isActive: boolean
}

export type ApprovalEntity = 'slot' | 'status' | 'earning' | 'referral' | 'login'
export type ApprovalAction = 'create' | 'update' | 'delete'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

export interface ApprovalRequest {
  id: string
  entity: ApprovalEntity
  action: ApprovalAction
  status: ApprovalStatus
  authorId: string
  targetUserId: string
  before?: WorkSlot | DayStatus | Earnings | Referral | UserNickname | null
  after?: WorkSlot | DayStatus | Earnings | Referral | UserNickname | null
  comment?: string // note from author
  adminComment?: string // decision note
  reviewedBy?: string
  createdAt: string
  updatedAt: string
  processedAt?: string // время когда админ обработал заявку
}

// Earnings types
export type EarningsCategory = 'memecoins' | 'futures' | 'nft' | 'spot' | 'airdrop' | 'polymarket' | 'staking' | 'other'

export const EARNINGS_CATEGORY_META: Record<EarningsCategory, { label: string; accent: string; icon: 'rocket' | 'line' | 'image' | 'coins' | 'gift' | 'barchart' | 'shield' | 'sparkles'; gradient: string; shortName: string }> = {
  memecoins: { label: 'Мемкоины', accent: 'emerald', icon: 'rocket', gradient: 'from-emerald-500 to-teal-600', shortName: 'Мемы' },
  futures: { label: 'Фьючерсы', accent: 'blue', icon: 'line', gradient: 'from-blue-500 to-indigo-600', shortName: 'Фьюч' },
  nft: { label: 'NFT', accent: 'purple', icon: 'image', gradient: 'from-purple-500 to-pink-600', shortName: 'NFT' },
  spot: { label: 'Спот', accent: 'amber', icon: 'coins', gradient: 'from-amber-500 to-orange-600', shortName: 'Спот' },
  airdrop: { label: 'AirDrop', accent: 'cyan', icon: 'gift', gradient: 'from-cyan-500 to-blue-600', shortName: 'Airdrop' },
  polymarket: { label: 'PolyMarket', accent: 'pink', icon: 'barchart', gradient: 'from-pink-500 to-rose-600', shortName: 'Poly' },
  staking: { label: 'Стейкинг', accent: 'indigo', icon: 'shield', gradient: 'from-indigo-500 to-violet-600', shortName: 'Stake' },
  other: { label: 'Другое', accent: 'gray', icon: 'sparkles', gradient: 'from-gray-500 to-gray-600', shortName: 'Другое' },
}

export interface Earnings {
  id: string
  userId: string
  date: string
  amount: number
  poolAmount: number
  slotId?: string
  category: EarningsCategory
  walletType?: 'general' | 'personal' | 'pool'
  isDeving?: boolean
  status?: 'pending' | 'approved' | 'rejected'
  // Доп. кошельки
  extraWalletsCount?: number
  extraWalletsAmount?: number
  participants: string[] // for shared earnings
}

// Rating types
export interface RatingData {
  userId: string
  earnings: number
  messages: number
  initiatives: number
  signals: number
  profitableSignals: number
  referrals: number
  daysOff: number
  sickDays: number
  vacationDays: number
  absenceDays: number
  truancyDays: number
  internshipDays: number
  poolAmount: number
  rating: number
  lastUpdated: string
}

export interface TeamRatingHistory {
  date: string
  averageRating: number
  ratings: {
    userId: string
    rating: number
    earnings: number
    poolAmount: number
  }[]
}

// Referral types
export interface Referral {
  id: string
  referralId: string
  ownerId: string
  name: string
  age: number
  createdAt: string
  comment?: string
  phone?: string
  tgAccount?: string
  source?: string
  status?: 'active' | 'inactive' | 'deleted'
}

// Call (Trading Signal) types
export type Network = 'solana' | 'ethereum' | 'bsc' | 'ton' | 'base' | 'sui' | 'monad' | 'polygon'
export type CallCategory = 'memecoins' | 'futures' | 'nft' | 'spot' | 'airdrop' | 'polymarket' | 'staking'
export type CallStatus = 'active' | 'completed' | 'cancelled' | 'reviewed'
export type CallRiskLevel = 'low' | 'medium' | 'high' | 'ultra'
export type CallSentiment = 'buy' | 'sell' | 'hold' | 'alert'

export type FuturesDirection = 'long' | 'short'
export type FuturesSignalType = 'breakout' | 'retest' | 'range' | 'scalping' | 'swing'
export type NftSignalType = 'buy' | 'sell' | 'mint'
export type StakingAction = 'enter' | 'exit' | 'rebalance'

export interface MemecoinSignalFields {
  network: Network
  contract?: string
  holdPlan: 'flip' | 'short' | 'medium' | 'long'
  entryCap: string
  targets: string
  stopLoss?: string
  trailingPercent?: string
  riskLevel: CallRiskLevel
  liquidityLocked?: boolean
  traderComment?: string
}

export interface FuturesSignalFields {
  pair: string
  direction: FuturesDirection
  leverage: string
  entryZone: string
  targets: string
  stopLoss: string
  riskLevel: CallRiskLevel
  reason?: string
  risks?: string
  traderComment?: string
}

export interface NftSignalFields {
  nftLink: string
  network: Network
  rarity: string
  targets: string
  riskLevel: CallRiskLevel
  reason?: string
  risks?: string
  traderComment?: string
}

export interface SpotSignalFields {
  coin: string
  entryZone: string
  targets: string
  stopLoss: string
  holdingHorizon: 'short' | 'medium' | 'long'
  riskLevel: CallRiskLevel
  reason?: string
  risks?: string
  traderComment?: string
}

export interface PolymarketSignalFields {
  event: string
  positionType: 'yes' | 'no'
  entryPrice: string // in %
  expectedProbability: string
  reason: string
  eventDeadline: string
  riskLevel: CallRiskLevel
  risks: string
  targetPlan: string
}

export interface StakingSignalFields {
  coin: string
  platform: string
  term: 'flexible' | '30d' | '90d' | '180d' | '365d' | 'fixed'
  fixedTermCustom?: string
  apy: string
  minDeposit: string
  protocolRisk: CallRiskLevel
  reason: string
  risks: string
  traderComment?: string
}

export interface AirdropSignalFields {
  projectName: string
  network: Network | 'other'
  rewardType: 'token' | 'points' | 'nft' | 'other'
  expectedValue?: string
  tasks: string
  deadline?: string
  link: string
  reason: string
  risks: string
  traderComment?: string
}

export interface CallDetails {
  memecoins?: MemecoinSignalFields
  futures?: FuturesSignalFields
  nft?: NftSignalFields
  spot?: SpotSignalFields
  polymarket?: PolymarketSignalFields
  staking?: StakingSignalFields
  airdrop?: AirdropSignalFields
}

export interface Call {
  id: string
  userId: string
  category: CallCategory
  status: CallStatus
  createdAt: string // ISO timestamp
  details: CallDetails
  sentiment?: CallSentiment
  riskLevel?: CallRiskLevel
  tags?: string[]
  comment?: string // Общий комментарий

  // Данные для отображения (заполняются из API)
  maxProfit?: number // MAX прибыль в %
  currentPnL?: number // Текущий PNL с момента сигнала в %
  currentMarketCap?: number // Текущая капитализация токена
  signalMarketCap?: number // Капитализация во время дачи сигнала
  currentPrice?: number // Текущая цена токена
  entryPrice?: number // Цена входа
}

// Task types
export type TaskCategory = 'trading' | 'development' | 'stream' | 'education'; // Обновленные категории
export type TaskStatus = 'in_progress' | 'completed' | 'closed'; // Обновленный статус
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low'; // Обновленные приоритеты

export interface TaskLink {
  name: string; // Имя ссылки
  url: string; // URL ссылки
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory; // Новое поле: категория
  priority: TaskPriority; // Новое поле: приоритет
  expectedResult: string; // Новое поле: ожидаемый результат
  links: TaskLink[]; // Новое поле: ссылки с возможностью давать имя
  dueDate: string; // Дата дедлайна
  dueTime: string; // Время дедлайна
  assignedTo: string[];
  createdBy: string;
  status: TaskStatus;
  createdAt: string; // Дата создания
  completedAt?: string;
  closedAt?: string;
  attachments?: string[];
  requiresApproval?: boolean;
  recurrent?: boolean;
  recurrenceType?: 'daily' | 'weekly' | 'monthly';
}

// Day status types
export type DayStatusType = 'dayoff' | 'sick' | 'vacation' | 'absence' | 'truancy' | 'internship' | 'working' | 'weekend'

export interface DayStatus {
  id: string
  userId: string
  date: string
  type: DayStatusType
  status?: 'pending' | 'approved' | 'rejected'
  comment?: string
  endDate?: string // for multi-day statuses
}

// Restriction types
export type RestrictionType = 'slots' | 'dayoff' | 'sick' | 'vacation' | 'absence' | 'truancy' | 'internship' | 'all'

export interface Restriction {
  id: string
  type: RestrictionType // what to restrict
  startDate: string // YYYY-MM-DD format
  endDate?: string // YYYY-MM-DD format for ranges, optional for single dates
  startTime?: string // HH:mm format, optional - if set, restriction starts from this time
  blockFutureDates?: boolean // if true, after restriction time blocks creating records only on the next day after restriction date
  comment?: string
  createdBy: string // admin user ID
  createdAt: string
  isActive: boolean
}

export type ApprovalEntity = 'slot' | 'status' | 'earning' | 'referral' | 'login'
export type ApprovalAction = 'create' | 'update' | 'delete'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

export interface ApprovalRequest {
  id: string
  entity: ApprovalEntity
  action: ApprovalAction
  status: ApprovalStatus
  authorId: string
  targetUserId: string
  before?: WorkSlot | DayStatus | Earnings | Referral | UserNickname | null
  after?: WorkSlot | DayStatus | Earnings | Referral | UserNickname | null
  comment?: string // note from author
  adminComment?: string // decision note
  reviewedBy?: string
  createdAt: string
  updatedAt: string
  processedAt?: string // время когда админ обработал заявку
}

// Earnings types
export type EarningsCategory = 'memecoins' | 'futures' | 'nft' | 'spot' | 'airdrop' | 'polymarket' | 'staking' | 'other'

export const EARNINGS_CATEGORY_META: Record<EarningsCategory, { label: string; accent: string; icon: 'rocket' | 'line' | 'image' | 'coins' | 'gift' | 'barchart' | 'shield' | 'sparkles'; gradient: string; shortName: string }> = {
  memecoins: { label: 'Мемкоины', accent: 'emerald', icon: 'rocket', gradient: 'from-emerald-500 to-teal-600', shortName: 'Мемы' },
  futures: { label: 'Фьючерсы', accent: 'blue', icon: 'line', gradient: 'from-blue-500 to-indigo-600', shortName: 'Фьюч' },
  nft: { label: 'NFT', accent: 'purple', icon: 'image', gradient: 'from-purple-500 to-pink-600', shortName: 'NFT' },
  spot: { label: 'Спот', accent: 'amber', icon: 'coins', gradient: 'from-amber-500 to-orange-600', shortName: 'Спот' },
  airdrop: { label: 'AirDrop', accent: 'cyan', icon: 'gift', gradient: 'from-cyan-500 to-blue-600', shortName: 'Airdrop' },
  polymarket: { label: 'PolyMarket', accent: 'pink', icon: 'barchart', gradient: 'from-pink-500 to-rose-600', shortName: 'Poly' },
  staking: { label: 'Стейкинг', accent: 'indigo', icon: 'shield', gradient: 'from-indigo-500 to-violet-600', shortName: 'Stake' },
  other: { label: 'Другое', accent: 'gray', icon: 'sparkles', gradient: 'from-gray-500 to-gray-600', shortName: 'Другое' },
}

export interface Earnings {
  id: string
  userId: string
  date: string
  amount: number
  poolAmount: number
  slotId?: string
  category: EarningsCategory
  walletType?: 'general' | 'personal' | 'pool'
  isDeving?: boolean
  status?: 'pending' | 'approved' | 'rejected'
  // Доп. кошельки
  extraWalletsCount?: number
  extraWalletsAmount?: number
  participants: string[] // for shared earnings
}

// Rating types
export interface RatingData {
  userId: string
  earnings: number
  messages: number
  initiatives: number
  signals: number
  profitableSignals: number
  referrals: number
  daysOff: number
  sickDays: number
  vacationDays: number
  absenceDays: number
  truancyDays: number
  internshipDays: number
  poolAmount: number
  rating: number
  lastUpdated: string
}

export interface TeamRatingHistory {
  date: string
  averageRating: number
  ratings: {
    userId: string
    rating: number
    earnings: number
    poolAmount: number
  }[]
}

// Referral types
export interface Referral {
  id: string
  referralId: string
  ownerId: string
  name: string
  age: number
  createdAt: string
  comment?: string
  phone?: string
  tgAccount?: string
  source?: string
  status?: 'active' | 'inactive' | 'deleted'
}

// Call (Trading Signal) types
export type Network = 'solana' | 'ethereum' | 'bsc' | 'ton' | 'base' | 'sui' | 'monad' | 'polygon'
export type CallCategory = 'memecoins' | 'futures' | 'nft' | 'spot' | 'airdrop' | 'polymarket' | 'staking'
export type CallStatus = 'active' | 'completed' | 'cancelled' | 'reviewed'
export type CallRiskLevel = 'low' | 'medium' | 'high' | 'ultra'
export type CallSentiment = 'buy' | 'sell' | 'hold' | 'alert'

export type FuturesDirection = 'long' | 'short'
export type FuturesSignalType = 'breakout' | 'retest' | 'range' | 'scalping' | 'swing'
export type NftSignalType = 'buy' | 'sell' | 'mint'
export type StakingAction = 'enter' | 'exit' | 'rebalance'

export interface MemecoinSignalFields {
  network: Network
  contract?: string
  holdPlan: 'flip' | 'short' | 'medium' | 'long'
  entryCap: string
  targets: string
  stopLoss?: string
  trailingPercent?: string
  riskLevel: CallRiskLevel
  liquidityLocked?: boolean
  traderComment?: string
}

export interface FuturesSignalFields {
  pair: string
  direction: FuturesDirection
  leverage: string
  entryZone: string
  targets: string
  stopLoss: string
  riskLevel: CallRiskLevel
  reason?: string
  risks?: string
  traderComment?: string
}

export interface NftSignalFields {
  nftLink: string
  network: Network
  rarity: string
  targets: string
  riskLevel: CallRiskLevel
  reason?: string
  risks?: string
  traderComment?: string
}

export interface SpotSignalFields {
  coin: string
  entryZone: string
  targets: string
  stopLoss: string
  holdingHorizon: 'short' | 'medium' | 'long'
  riskLevel: CallRiskLevel
  reason?: string
  risks?: string
  traderComment?: string
}

export interface PolymarketSignalFields {
  event: string
  positionType: 'yes' | 'no'
  entryPrice: string // in %
  expectedProbability: string
  reason: string
  eventDeadline: string
  riskLevel: CallRiskLevel
  risks: string
  targetPlan: string
}

export interface StakingSignalFields {
  coin: string
  platform: string
  term: 'flexible' | '30d' | '90d' | '180d' | '365d' | 'fixed'
  fixedTermCustom?: string
  apy: string
  minDeposit: string
  protocolRisk: CallRiskLevel
  reason: string
  risks: string
  traderComment?: string
}

export interface AirdropSignalFields {
  projectName: string
  network: Network | 'other'
  rewardType: 'token' | 'points' | 'nft' | 'other'
  expectedValue?: string
  tasks: string
  deadline?: string
  link: string
  reason: string
  risks: string
  traderComment?: string
}

export interface CallDetails {
  memecoins?: MemecoinSignalFields
  futures?: FuturesSignalFields
  nft?: NftSignalFields
  spot?: SpotSignalFields
  polymarket?: PolymarketSignalFields
  staking?: StakingSignalFields
  airdrop?: AirdropSignalFields
}

export interface Call {
  id: string
  userId: string
  category: CallCategory
  status: CallStatus
  createdAt: string // ISO timestamp
  details: CallDetails
  sentiment?: CallSentiment
  riskLevel?: CallRiskLevel
  tags?: string[]
  comment?: string // Общий комментарий

  // Данные для отображения (заполняются из API)
  maxProfit?: number // MAX прибыль в %
  currentPnL?: number // Текущий PNL с момента сигнала в %
  currentMarketCap?: number // Текущая капитализация токена
  signalMarketCap?: number // Капитализация во время дачи сигнала
  currentPrice?: number // Текущая цена токена
  entryPrice?: number // Цена входа
}

// Event types
export type EventCategory = 'memecoins' | 'polymarket' | 'nft' | 'staking' | 'spot' | 'futures' | 'airdrop'

export const EVENT_CATEGORY_META: Record<EventCategory, { label: string; gradient: string; gradientDark: string; icon: string; cardGradient: string }> = {
  memecoins: {
    label: 'Мемкоины',
    gradient: 'from-emerald-400 via-teal-500 to-cyan-400',
    gradientDark: 'from-emerald-500 via-teal-600 to-cyan-500',
    icon: 'rocket',
    cardGradient: 'from-emerald-500/20 via-teal-400/10 to-cyan-500/5'
  },
  polymarket: {
    label: 'Polymarket',
    gradient: 'from-rose-400 to-red-500',
    gradientDark: 'from-rose-600 to-red-500',
    icon: 'barchart',
    cardGradient: 'from-rose-500/20 via-red-500/10 to-transparent'
  },
  nft: {
    label: 'NFT',
    gradient: 'from-purple-400 to-pink-500',
    gradientDark: 'from-purple-600 to-pink-500',
    icon: 'image',
    cardGradient: 'from-purple-500/20 via-pink-500/10 to-transparent'
  },
  staking: {
    label: 'Стейкинг',
    gradient: 'from-emerald-400 to-green-500',
    gradientDark: 'from-emerald-600 to-green-500',
    icon: 'shield',
    cardGradient: 'from-emerald-500/20 via-green-500/10 to-transparent'
  },
  spot: {
    label: 'Спот',
    gradient: 'from-amber-400 to-orange-500',
    gradientDark: 'from-amber-600 to-orange-500',
    icon: 'coins',
    cardGradient: 'from-amber-500/20 via-orange-500/10 to-transparent'
  },
  futures: {
    label: 'Фьючерсы',
    gradient: 'from-blue-400 to-indigo-500',
    gradientDark: 'from-blue-600 to-indigo-500',
    icon: 'trending',
    cardGradient: 'from-blue-500/20 via-indigo-500/10 to-transparent'
  },
  airdrop: {
    label: 'Airdrop',
    gradient: 'from-gray-300 to-gray-400',
    gradientDark: 'from-gray-400 to-gray-300',
    icon: 'gift',
    cardGradient: 'from-gray-500/20 via-gray-400/10 to-transparent'
  },
}

export interface EventLink {
  url: string
  name: string
}

export interface EventFile {
  id: string
  name: string
  url: string
  type: string
  size: number
}

export interface Event {
  id: string
  title: string
  description: string
  category: EventCategory
  dates: string[] // Array of dates YYYY-MM-DD
  time: string // HH:mm format
  endTime?: string // HH:mm format
  recurrence?: {
    type: 'none' | 'daily' | 'weekly' | 'range' | 'until'
    startDate: string
    endDate?: string
  }
  links: EventLink[] // Array of named URLs
  requiredParticipants: string[] // User IDs
  recommendedParticipants: string[] // User IDs
  going: string[] // User IDs
  notGoing: string[] // User IDs
  files: EventFile[]
  isHidden?: boolean
  isActualForce?: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}