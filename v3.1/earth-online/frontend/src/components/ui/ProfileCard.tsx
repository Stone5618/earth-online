import React from 'react';
import { motion } from 'framer-motion';

export interface ProfileCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  description?: string;
  iconColor?: string;
  bonusInfo?: string;
  statBonuses?: Record<string, number | string>;
  formatStatName?: (key: string) => string;
}

/** Hover-animated profile information card with stat bonus tags */
export const ProfileCard = React.memo(function ProfileCard({
  icon: Icon,
  title,
  value,
  description,
  iconColor = '#00D2FF',
  bonusInfo,
  statBonuses,
  formatStatName,
}: ProfileCardProps) {
  const filteredStatBonuses: Record<string, number> = (Object.entries(statBonuses || {}) as [string, any][])
    .filter(([_, val]) => typeof val === 'number')
    .reduce((acc, [key, val]) => ({ ...acc, [key]: val }), {});

  return (
    <motion.div 
      className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10 hover:border-white/20 transition-all"
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="flex items-start gap-2 sm:gap-3">
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${iconColor}20` }}>
          <Icon className="w-4 sm:w-5 h-4 sm:h-5" style={{ color: iconColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white/50 text-xs mb-1">{title}</p>
          <p className="text-white font-medium truncate text-sm sm:text-base">{value}</p>
          {bonusInfo && (
            <p className="text-holo-cyan text-xs mt-1 font-medium">{bonusInfo}</p>
          )}
          {description && (
            <p className="text-white/40 text-xs mt-1">{description}</p>
          )}
          {filteredStatBonuses && Object.keys(filteredStatBonuses).length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {Object.entries(filteredStatBonuses).map(([key, val]) => (
                <span 
                  key={key} 
                  className={`text-xs bg-white/10 px-2 py-0.5 rounded ${Number(val) >= 0 ? 'text-green-400' : 'text-red-400'}`}
                >
                  {Number(val) >= 0 ? '+' : ''}{val} {formatStatName?.(key) ?? key}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});
