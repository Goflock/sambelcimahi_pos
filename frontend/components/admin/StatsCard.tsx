import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    change?: {
        value: number;
        isPositive: boolean;
    };
    iconBgColor?: string;
    iconColor?: string;
}

export default function StatsCard({
    title,
    value,
    icon: Icon,
    change,
    iconBgColor = 'bg-blue-100',
    iconColor = 'text-blue-600',
}: StatsCardProps) {
    return (
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg p-6 border border-gray-100 transition-all duration-300 transform hover:-translate-y-1 group">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-xs font-bold text-gray-500 mb-1.5 tracking-wider uppercase">{title}</p>
                    <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{value}</p>
                    {change && (
                        <div className="flex items-center mt-2">
                            <span
                                className={`text-sm font-medium ${change.isPositive ? 'text-green-600' : 'text-red-600'
                                    }`}
                            >
                                {change.isPositive ? '+' : ''}
                                {change.value}%
                            </span>
                            <span className="text-sm text-gray-500 ml-2">vs yesterday</span>
                        </div>
                    )}
                </div>
                <div className={`${iconBgColor} ${iconColor} p-4 rounded-xl`}>
                    <Icon size={28} />
                </div>
            </div>
        </div>
    );
}
