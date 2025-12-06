import { TaskCategory } from '@/types'
import {
  BookOpen,
  Broadcast,
  CandlestickChart,
  ClipboardList,
  Cpu,
  FlaskConical,
  LucideIcon,
} from 'lucide-react'

export const CATEGORY_ICONS: Record<TaskCategory, LucideIcon> = {
  trading: CandlestickChart,
  learning: BookOpen,
  technical: Cpu,
  stream: Broadcast,
  research: FlaskConical,
  organization: ClipboardList,
}
