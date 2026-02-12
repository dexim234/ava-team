import { TaskCategory } from '@/types'
import {
  GraduationCap, // Для "Изучение"
  CandlestickChart, // Для "Торговля"
  Code, // Для "Разработка"
  Radio, // Для "Стрим"
  LucideIcon,
} from 'lucide-react'

export const CATEGORY_ICONS: Record<TaskCategory, LucideIcon> = {
  trading: CandlestickChart,
  development: Code,
  stream: Radio,
  education: GraduationCap,
}
