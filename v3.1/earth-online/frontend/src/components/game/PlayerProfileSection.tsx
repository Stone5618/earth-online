import React, { useMemo } from 'react';
import { Server, Crown, Users, Sparkles, Frown, BookOpen, Activity, HeartPulse } from 'lucide-react';
import type { GameState, PlayerStats } from '@/game/gameState';
import type { CareerType } from '@/game/core/types';
import { ProfileCard } from '@/components/ui/ProfileCard';
import { formatStatName, parseTraitEffect } from '@/game/core/statUtils';
import { FAMILY_OCCUPATIONS, TALENTS, FLAWS } from '@/config/gameConfig';
import { getCareerInfo, getCurrentCareerTitle, getCareerIncome } from '@/game/systems/careerSystem';

interface PlayerProfileSectionProps {
  state: GameState;
  stats: PlayerStats;
}

export const PlayerProfileSection = React.memo(function PlayerProfileSection({ state, stats }: PlayerProfileSectionProps) {
  const selectedTalent = useMemo(
    () => (state.stats.selectedTalent ? TALENTS.find(t => t.id === state.stats.selectedTalent) ?? null : null),
    [state.stats.selectedTalent],
  );

  const selectedFlaw = useMemo(
    () => (state.stats.selectedFlaw ? FLAWS.find(f => f.id === state.stats.selectedFlaw) ?? null : null),
    [state.stats.selectedFlaw],
  );

  const familyOccupation = useMemo(
    () => {
      if (!state.stats.familyOccupation) return null;
      return FAMILY_OCCUPATIONS[state.stats.familyOccupation as keyof typeof FAMILY_OCCUPATIONS] ?? null;
    },
    [state.stats.familyOccupation],
  );

  const educationDisplay = useMemo(() => {
    const educationMap: Record<string, { name: string; desc: string; iconColor: string }> = {
      'none': { name: '未接受教育', desc: '需要学习提升', iconColor: '#9CA3AF' },
      'primary': { name: '小学', desc: '基础教育完成', iconColor: '#60A5FA' },
      'secondary': { name: '中学', desc: '中等教育完成', iconColor: '#3B82F6' },
      'bachelor': { name: '学士', desc: '本科学位', iconColor: '#8B5CF6' },
      'master': { name: '硕士', desc: '硕士学位', iconColor: '#A855F7' },
      'doctor': { name: '博士', desc: '博士学位', iconColor: '#C084FC' },
    };
    return educationMap[state.stats.educationLevel] ?? educationMap['none'];
  }, [state.stats.educationLevel]);

  const showProfile = state.birthServer || state.birthTalent || state.familyTier
    || familyOccupation || selectedTalent || selectedFlaw
    || state.stats.career.currentCareer || state.stats.educationLevel !== 'none';

  if (!showProfile) return null;

  return (
    <div className="space-y-3 sm:space-y-4">
      <h4 className="text-xs sm:text-sm font-semibold text-white/80 flex items-center gap-2">
        <Users className="w-4 h-4 text-holo-purple" />
        玩家档案
      </h4>

      <div className="grid grid-cols-1 gap-2 sm:gap-3">
        {state.birthServer && (
          <ProfileCard
            icon={Server}
            title="出生服务器"
            value={state.birthServer}
            iconColor="#00D2FF"
          />
        )}

        {state.familyTier && (
          <ProfileCard
            icon={Crown}
            title="出身等级"
            value={
              state.familyTier === 'SSR' ? '★★★ SSR 豪门世家' :
              state.familyTier === 'SR' ? '★★ SR 小康家庭' :
              state.familyTier === 'R' ? '★ R 普通家庭' :
              '⚙ N 困难模式'
            }
            bonusInfo={
              state.familyTier === 'SSR' ? '初始属性大幅提升' :
              state.familyTier === 'SR' ? '初始属性适度提升' :
              state.familyTier === 'R' ? '标准属性开局' :
              '生存挑战模式'
            }
            description={
              state.familyTier === 'SSR' ? '豪门世家 · 开局即巅峰' :
              state.familyTier === 'SR' ? '小康家庭 · 衣食无忧' :
              state.familyTier === 'R' ? '普通家庭 · 靠自己奋斗' :
              '困难模式 · 生存即是胜利'
            }
            iconColor={
              state.familyTier === 'SSR' ? '#FFD700' :
              state.familyTier === 'SR' ? '#A855F7' :
              state.familyTier === 'R' ? '#3B82F6' :
              '#6B7280'
            }
          />
        )}

        {familyOccupation && (
          <ProfileCard
            icon={Users}
            title="家族职业"
            value={familyOccupation.name}
            bonusInfo={familyOccupation.passiveBonus}
            description={familyOccupation.description}
            statBonuses={Object.fromEntries(
              Object.entries(familyOccupation.statBonus).filter(([key]) => key !== 'skills')
            ) as Record<string, number>}
            iconColor="#10B981"
          />
        )}

        {selectedTalent && (
          <ProfileCard
            icon={Sparkles}
            title="天赋"
            value={selectedTalent.name}
            bonusInfo="特殊能力加成"
            description={selectedTalent.description}
            statBonuses={parseTraitEffect(selectedTalent)}
            iconColor="#F59E0B"
          />
        )}

        {selectedFlaw && (
          <ProfileCard
            icon={Frown}
            title="缺陷"
            value={selectedFlaw.name}
            bonusInfo="双刃剑效果"
            description={selectedFlaw.description}
            statBonuses={parseTraitEffect(selectedFlaw)}
            iconColor="#EF4444"
          />
        )}

        {state.stats.educationLevel !== 'none' && (
          <ProfileCard
            icon={BookOpen}
            title="教育程度"
            value={educationDisplay.name}
            description={educationDisplay.desc}
            iconColor={educationDisplay.iconColor}
          />
        )}

        {state.stats.career.currentCareer && (
          <ProfileCard
            icon={Activity}
            title="职业"
            value={`${getCareerInfo(state.stats.career.currentCareer as CareerType).name} · ${getCurrentCareerTitle(state.stats)}`}
            bonusInfo={`年收入: ¥${getCareerIncome(state.stats).toLocaleString()}`}
            description={`行业: ${getCareerInfo(state.stats.career.currentCareer as CareerType).field} · 工作${state.stats.career.yearsInCurrentCareer}年 · Lv.${state.stats.career.currentLevel}/${getCareerInfo(state.stats.career.currentCareer as CareerType).levels.length}`}
            iconColor="#06B6D4"
          />
        )}

        <ProfileCard
          icon={stats.isMarried ? HeartPulse : Users}
          title="婚姻状态"
          value={stats.isMarried ? "已婚" : "单身"}
          description={stats.isMarried ? "组建了自己的家庭" : "享受自由的单身生活"}
          iconColor={stats.isMarried ? "#FF4B4B" : "#8B5CF6"}
        />
      </div>
    </div>
  );
});
