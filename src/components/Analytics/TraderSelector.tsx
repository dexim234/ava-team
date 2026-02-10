import React from 'react'
import { MultiSelect, SelectOption } from '@/components/Call/MultiSelect'
import { TEAM_MEMBERS } from '@/types'
import { Users } from 'lucide-react'

interface TraderSelectorProps {
    selectedTraders: string[]
    onSelect: (traderIds: string[]) => void
}

export const TraderSelector: React.FC<TraderSelectorProps> = ({
    selectedTraders,
    onSelect,
}) => {
    const traderOptions: SelectOption[] = TEAM_MEMBERS.map(member => ({
        value: member.id,
        label: member.name,
        // icon: <img src={member.avatar} alt={member.name} className="w-4 h-4 rounded-full" /> // Если есть аватары
    }))

    return (
        <MultiSelect
            value={selectedTraders}
            onChange={onSelect}
            options={traderOptions}
            placeholder="Все трейдеры"
            searchable={true}
            icon={<Users size={16} />}
        />
    )
}
