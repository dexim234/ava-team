import { BarChart3, Rocket, Gauge, Image, Shield, Coins, LineChart, Sparkles, DollarSign } from 'lucide-react'

export const CATEGORY_ICONS: Record<string, JSX.Element> = {
    memecoins: <Rocket size={20} />,
    polymarket: <Gauge size={20} />,
    nft: <Image size={20} />,
    staking: <Shield size={20} />,
    spot: <Coins size={20} />,
    futures: <LineChart size={20} />,
    airdrop: <Sparkles size={20} />,
    other: <DollarSign size={20} />, // Крипто-рынок
    all: <BarChart3 size={20} />,
}
