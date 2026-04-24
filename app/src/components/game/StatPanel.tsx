import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Heart, Zap, Coins, Smile, Frown, Brain, Sparkles, Palette, Clover, Save, Home, Settings, Server, HeartPulse, Users, Crown, User, BookOpen, TrendingUp, TrendingDown, Minus, Activity, CreditCard, DollarSign, Clock } from 'lucide-react';
import { useGame } from '@/game/GameContext';
import { formatMoney, STAT_BOUNDS, getEconomyState, getHealthConditionName, getHealthConditionColor, getHealthTreatmentCost } from '@/game/gameState';
import { FAMILY_OCCUPATIONS, TALENTS, FLAWS } from '@/config/gameConfig';
import { getCareerInfo, getCurrentCareerTitle, getCareerIncome } from '@/game/systems/careerSystem';
import { getTotalDebt, getMonthlyDebtPayment } from '@/game/systems/debtSystem';
import { AchievementPanel } from './AchievementPanel';
import { SkillsPanel } from './SkillsPanel';
import { useToast } from './ToastNotification';
import { SaveSlotPanel } from './SaveSlotPanel';
import { SettingsPanel } from './SettingsPanel';
import { useSound } from './SoundManager';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface StatBarProps {
  icon: React.ElementType;
  label: string;
  value: number;
  max: number;
  color: string;
  showValue?: boolean;
  prefix?: string;
  displayValue?: string;
}

function StatBar({ icon: Icon, label, value, max, color, showValue = true, prefix = '', displayValue }: StatBarProps) {
  const isNegative = value < 0;
  const absValue = Math.abs(value);
  const percentage = Math.max(0, Math.min(100, (absValue / max) * 100));
  const isLow = !isNegative && percentage < 30;
  const isCritical = !isNegative && percentage < 15;

  return (
    <div className="space-y-1 sm:space-y-2">
      <div className="flex items-center justify-between">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 cursor-help select-none">
              <Icon className="w-4 h-4" style={{ color: isNegative ? '#FF4B4B' : color }} />
              <span className="text-white/70 text-xs sm:text-sm">{label}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent sideOffset={6} className="max-w-[260px]">
            {label.includes('健康') && <p>健康值：归零则游戏结束。35岁后会有自然衰减；精力耗尽也会持续伤害健康。</p>}
            {label.includes('精力') && <p>精力值：行动消耗与恢复的核心资源。长期过低会更容易陷入负面循环。</p>}
            {label.includes('金币') && <p>金币：用于升级与应对事件支出。经济系数与健康状态会影响收入波动。负数表示债务金额。</p>}
            {label.includes('心情') && <p>心情：影响“连续开心年数”等成就，并会间接影响事件收益/损失的体验。</p>}
            {label === '智力' && <p>智力：学习/升学/技术路线的关键属性，会影响部分事件可用选项与收益。</p>}
            {label === '创造力' && <p>创造力：艺术/创作/创业方向常见加成来源，影响部分事件收益。</p>}
            {label === '运气' && <p>运气：影响随机事件偏向与机会出现概率（越高越可能遇到好事）。</p>}
            {label === '魅力' && <p>魅力：社交/恋爱/关系线的关键属性，会影响部分事件选项与结果。</p>}
          </TooltipContent>
        </Tooltip>
        {showValue && (
          <span className={`text-xs sm:text-sm font-mono ${isNegative || isCritical ? 'text-fatal-red animate-pulse' : 'text-white'}`}>
            {prefix}{displayValue ?? value.toLocaleString()}
          </span>
        )}
      </div>
      <div className="relative h-2 sm:h-3 bg-white/10 rounded-full overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 rounded-full" />
        
        {/* Fill */}
        {!isNegative ? (
          <motion.div
            className={`absolute inset-y-0 left-0 rounded-full ${isCritical ? 'animate-pulse' : ''}`}
            style={{ 
              backgroundColor: color,
              boxShadow: isLow ? `0 0 10px ${color}` : 'none',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ 
              type: 'spring',
              stiffness: 100,
              damping: 15,
            }}
          />
        ) : (
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full animate-pulse"
            style={{ 
              backgroundColor: '#FF4B4B',
              boxShadow: '0 0 10px #FF4B4B',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ 
              type: 'spring',
              stiffness: 100,
              damping: 15,
            }}
          />
        )}
        
        {/* Critical shake effect */}
        {(!isNegative && isCritical) || isNegative ? (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-fatal-red"
            animate={{ 
              x: [-1, 1, -1, 1, 0],
              opacity: [1, 0.5, 1, 0.5, 1],
            }}
            transition={{ 
              duration: 0.5,
              repeat: Infinity,
              repeatType: 'loop',
            }}
          />
        ) : null}
      </div>
    </div>
  );
}

interface ProfileCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  description?: string;
  iconColor?: string;
  bonusInfo?: string;
  statBonuses?: Record<string, number | string>;
}

function ProfileCard({ icon: Icon, title, value, description, iconColor = '#00D2FF', bonusInfo, statBonuses }: ProfileCardProps) {
  // 过滤掉不是数字的statBonuses，避免渲染对象
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
                  {Number(val) >= 0 ? '+' : ''}{val} {formatStatName(key)}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function formatStatName(stat: string): string {
  const statNames: Record<string, string> = {
    intelligence: '智力',
    creativity: '创造力',
    luck: '运气',
    charm: '魅力',
    health: '健康',
    maxHealth: '最大健康',
    energy: '精力',
    maxEnergy: '最大精力',
    money: '金钱',
    totalMoneyEarned: '总收入',
    karma: '福报',
    mood: '心情',
    skillPoints: '技能点',
  };
  return statNames[stat] || stat;
}

// 辅助函数：解析天赋/缺陷的效果
function parseTraitEffect(trait: { effect: (stats: any) => any }): Record<string, number> {
  const baseStats: Record<string, number> = { intelligence: 0, creativity: 0, luck: 0, charm: 0, health: 0, maxHealth: 0, energy: 0, maxEnergy: 0, money: 0, totalMoneyEarned: 0, karma: 0, mood: 0, skillPoints: 0 };
  const result: Record<string, number> = trait.effect(baseStats);
  const effects: Record<string, number> = {};
  
  Object.keys(result).forEach(key => {
    if (baseStats.hasOwnProperty(key) && result[key] !== baseStats[key]) {
      effects[key] = result[key] - baseStats[key];
    }
  });
  
  return effects;
}

export const StatPanel = React.memo(() => {
  const { state, dispatch } = useGame();
  const { stats } = state;
  const [isAchievementPanelOpen, setIsAchievementPanelOpen] = useState(false);
  const [isSkillsPanelOpen, setIsSkillsPanelOpen] = useState(false);
  const [isSavePanelOpen, setIsSavePanelOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { showToast } = useToast();
  const { playSound } = useSound();

  // Determine mood icon and color
  const getMoodInfo = () => {
    if (stats.mood >= 70) return { icon: Smile, color: '#00FF88', label: '开心' };
    if (stats.mood >= 40) return { icon: Smile, color: '#FFD700', label: '一般' };
    return { icon: Frown, color: '#FF4B4B', label: '沮丧' };
  };

  const moodInfo = getMoodInfo();

  // 辅助函数：获取教育程度显示
  const getEducationDisplay = () => {
    const educationMap: Record<string, { name: string; desc: string; iconColor: string }> = {
      'none': { name: '未接受教育', desc: '需要学习提升', iconColor: '#9CA3AF' },
      'primary': { name: '小学', desc: '基础教育完成', iconColor: '#60A5FA' },
      'secondary': { name: '中学', desc: '中等教育完成', iconColor: '#3B82F6' },
      'bachelor': { name: '学士', desc: '本科学位', iconColor: '#8B5CF6' },
      'master': { name: '硕士', desc: '硕士学位', iconColor: '#A855F7' },
      'doctor': { name: '博士', desc: '博士学位', iconColor: '#C084FC' },
    };
    return educationMap[state.stats.educationLevel] || educationMap['none'];
  };

  // 辅助函数：获取天赋/缺陷详情
  const getTalentDetails = (talentId: string | null) => {
    if (!talentId) return null;
    return TALENTS.find(t => t.id === talentId) || null;
  };

  const getFlawDetails = (flawId: string | null) => {
    if (!flawId) return null;
    return FLAWS.find(f => f.id === flawId) || null;
  };

  const selectedTalent = getTalentDetails(state.stats.selectedTalent);
  const selectedFlaw = getFlawDetails(state.stats.selectedFlaw);

  // 辅助函数：获取家族职业详情
  const getFamilyOccupationDetails = (occupationId: string | null) => {
    if (!occupationId) return null;
    const occu = FAMILY_OCCUPATIONS[occupationId as keyof typeof FAMILY_OCCUPATIONS];
    return occu || null;
  };

  const familyOccupation = getFamilyOccupationDetails(state.stats.familyOccupation);

  return (
    <>
      <div className="glass-card p-4 sm:p-6 space-y-4 sm:space-y-6">
      <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-holo-blue" />
        状态监测
      </h3>

      {/* Age Display */}
      <div className="text-center p-3 sm:p-4 rounded-xl bg-white/5">
        <span className="text-white/50 text-xs sm:text-sm">当前年龄</span>
        <motion.div 
          className="text-3xl sm:text-4xl font-orbitron font-bold text-holo-blue"
          key={stats.age}
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          Lv. {stats.age}
        </motion.div>
      </div>

      {/* Economy Status Display */}
      <div className="text-center p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
        <span className="text-white/50 text-xs sm:text-sm">经济状态</span>
        <motion.div 
          className="flex items-center justify-center gap-2 mt-1"
          key={stats.economyFactor}
        >
          {(() => {
            const economyState = getEconomyState(stats.economyFactor);
            if (economyState === 'boom') {
              return (
                <>
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <span className="text-lg sm:text-xl font-bold text-green-400">繁荣</span>
                </>
              );
            } else if (economyState === 'crisis') {
              return (
                <>
                  <TrendingDown className="w-5 h-5 text-red-400" />
                  <span className="text-lg sm:text-xl font-bold text-red-400">危机</span>
                </>
              );
            } else {
              return (
                <>
                  <Minus className="w-5 h-5 text-white/70" />
                  <span className="text-lg sm:text-xl font-bold text-white/70">正常</span>
                </>
              );
            }
          })()}
        </motion.div>
        <div className="mt-1">
          <span className="text-white/50 text-xs">
            系数: {(stats.economyFactor * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Health Status Display */}
      <div className="text-center p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
        <span className="text-white/50 text-xs sm:text-sm">健康状态</span>
        <motion.div 
          className="flex items-center justify-center gap-2 mt-1"
          key={stats.healthStatus.condition}
        >
          {(() => {
            const healthIcon = () => {
              switch (stats.healthStatus.condition) {
                case 'healthy':
                  return <Smile className="w-5 h-5" />;
                case 'minor_ill':
                  return <Activity className="w-5 h-5" />;
                case 'major_ill':
                  return <Heart className="w-5 h-5" />;
                case 'injured':
                  return <Activity className="w-5 h-5" />;
                case 'disabled':
                  return <User className="w-5 h-5" />;
                default:
                  return <Heart className="w-5 h-5" />;
              }
            };
            
            const healthColor = getHealthConditionColor(stats.healthStatus.condition);
            
            return (
              <>
                <div style={{ color: healthColor }}>
                  {healthIcon()}
                </div>
                <span className="text-lg sm:text-xl font-bold" style={{ color: healthColor }}>
                  {getHealthConditionName(stats.healthStatus.condition)}
                </span>
              </>
            );
          })()}
        </motion.div>
        <div className="mt-1">
          <span className="text-white/50 text-xs">
            {stats.healthStatus.duration > 0 ? `持续 ${stats.healthStatus.duration} 年` : '状态稳定'}
          </span>
        </div>
        {stats.healthStatus.condition !== 'healthy' && (
          <div className="mt-2">
            <button
              onClick={() => dispatch({ type: 'SEEK_TREATMENT' })}
              className="px-3 py-1 text-xs bg-blue-500/20 border border-blue-500/50 rounded hover:bg-blue-500/30 text-blue-300 transition-all"
            >
              寻求治疗 (¥{getHealthTreatmentCost(stats.healthStatus.condition, stats).toLocaleString()})
            </button>
          </div>
        )}
      </div>

      {/* Player Profile Section */}
      {(state.birthServer || state.birthTalent || state.familyTier || familyOccupation || selectedTalent || selectedFlaw || state.stats.career.currentCareer || state.stats.educationLevel !== 'none') && (
        <div className="space-y-3 sm:space-y-4">
          <h4 className="text-xs sm:text-sm font-semibold text-white/80 flex items-center gap-2">
            <User className="w-4 h-4 text-holo-purple" />
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

            {/* 家族职业信息展示 */}
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

            {/* 天赋信息展示 */}
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

            {/* 缺陷信息展示 */}
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

            {/* 教育程度显示 */}
            {state.stats.educationLevel !== 'none' && (
              <ProfileCard
                icon={BookOpen}
                title="教育程度"
                value={getEducationDisplay().name}
                description={getEducationDisplay().desc}
                iconColor={getEducationDisplay().iconColor}
              />
            )}

            {/* 职业信息展示 */}
            {state.stats.career.currentCareer && (
              <ProfileCard
                icon={Activity}
                title="职业"
                value={`${getCareerInfo(state.stats.career.currentCareer).name} · ${getCurrentCareerTitle(state.stats)}`}
                bonusInfo={`年收入: ¥${formatMoney(getCareerIncome(state.stats))}`}
                description={`行业: ${getCareerInfo(state.stats.career.currentCareer).field} · 工作${state.stats.career.yearsInCurrentCareer}年 · Lv.${state.stats.career.currentLevel}/${getCareerInfo(state.stats.career.currentCareer).levels.length}`}
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
      )}

      {/* Stats */}
      <div className="space-y-3 sm:space-y-4">
        <StatBar
          icon={Heart}
          label="健康值"
          value={stats.health}
          max={stats.maxHealth}
          color="#FF4B4B"
        />
        
        <StatBar
          icon={Zap}
          label="精力值"
          value={stats.energy}
          max={stats.maxEnergy}
          color="#FF6B35"
        />
        
        <StatBar
          icon={Coins}
          label="金币"
          value={stats.money}
          max={Math.max(1000000, Math.abs(stats.money))}
          color="#FFD700"
          showValue={true}
          prefix="¥"
          displayValue={formatMoney(stats.money)}
        />
        
        <StatBar
          icon={moodInfo.icon}
          label={`心情 (${moodInfo.label})`}
          value={stats.mood}
          max={100}
          color={moodInfo.color}
        />
        
        <StatBar
          icon={Brain}
          label="智力"
          value={stats.intelligence}
          max={STAT_BOUNDS.intelligence.max}
          color="#00D2FF"
        />
        
        <StatBar
          icon={Palette}
          label="创造力"
          value={stats.creativity}
          max={STAT_BOUNDS.creativity.max}
          color="#FF69B4"
        />
        
        <StatBar
          icon={Clover}
          label="运气"
          value={stats.luck}
          max={STAT_BOUNDS.luck.max}
          color="#00FF88"
        />
        
        <StatBar
          icon={Sparkles}
          label="魅力"
          value={stats.charm}
          max={STAT_BOUNDS.charm.max}
          color="#FF1493"
        />
      </div>

      {/* Debt Display */}
      {stats.debts.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <h4 className="text-sm font-semibold text-white/80 flex items-center gap-2 mb-3">
            <CreditCard className="w-4 h-4 text-red-400" />
            债务账单
          </h4>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-white/70">
              <span>总债务</span>
              <span className="text-red-400">¥{formatMoney(getTotalDebt(stats))}</span>
            </div>
            <div className="flex justify-between text-xs text-white/70">
              <span>月供</span>
              <span className="text-orange-400">¥{formatMoney(getMonthlyDebtPayment(stats))}</span>
            </div>
            
            <div className="mt-3 space-y-2">
              {stats.debts.map((debt) => (
                <div key={debt.id} className="bg-red-900/20 border border-red-800/30 rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-3 h-3 text-red-400" />
                      <span className="text-sm font-medium text-white">{debt.description}</span>
                    </div>
                    <span className="text-xs text-white/60">
                      <Clock className="w-3 h-3 inline mr-1" />
                      开始于 {debt.startAge}岁
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-white/60">剩余</span>
                      <div className="text-red-400 font-medium">¥{formatMoney(debt.remaining)}</div>
                    </div>
                    <div>
                      <span className="text-white/60">月供</span>
                      <div className="text-orange-400 font-medium">¥{formatMoney(debt.monthlyPayment)}</div>
                    </div>
                    <div>
                      <span className="text-white/60">利率</span>
                      <div className="text-yellow-400">{(debt.interestRate * 100).toFixed(0)}%</div>
                    </div>
                    <div>
                      <span className="text-white/60">期限</span>
                      <div className="text-white/80">{debt.termMonths}个月</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}


      
      {/* Action Buttons */}
      <div className="pt-4 border-t border-white/10 space-y-2 sm:space-y-3">
        <button
          onClick={() => {
            setIsSkillsPanelOpen(true);
            playSound('click');
          }}
          className="w-full py-3 min-h-[44px] bg-holo-purple/20 border border-holo-purple/50 rounded-lg text-holo-purple hover:bg-holo-purple/30 transition-all flex items-center justify-center gap-2 text-sm"
        >
          <BookOpen className="w-4 h-4" />
          技能树 ({stats.skillPoints} 点)
        </button>
        <button
          onClick={() => setIsAchievementPanelOpen(true)}
          className="w-full py-3 min-h-[44px] bg-gold/10 border border-gold/30 rounded-lg text-gold hover:bg-gold/20 transition-all flex items-center justify-center gap-2 text-sm"
        >
          <Trophy className="w-4 h-4" />
          成就 ({state.achievements.filter(a => a.unlocked).length}/{state.achievements.length})
        </button>
        <button
          onClick={() => {
            setIsSavePanelOpen(true);
            playSound('click');
          }}
          className="w-full py-3 min-h-[44px] bg-holo-blue/20 border border-holo-blue/50 rounded-lg text-holo-blue hover:bg-holo-blue/30 transition-all flex items-center justify-center gap-2 text-sm"
        >
          <Save className="w-4 h-4" />
          保存进度
        </button>
      
        <button
          onClick={() => {
            setIsSettingsOpen(true);
            playSound('click');
          }}
          className="w-full py-3 min-h-[44px] bg-white/5 border border-white/20 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2 text-sm"
        >
          <Settings className="w-4 h-4" />
          设置
        </button>
        
        <button
          onClick={() => {
            dispatch({ type: 'GO_TO_LANDING' });
            showToast('已返回主菜单', 'info');
            playSound('click');
          }}
          className="w-full py-3 min-h-[44px] bg-white/5 border border-white/20 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2 text-sm"
        >
          <Home className="w-4 h-4" />
          返回主菜单
        </button>
      </div>
    </div>
    
    {/* Panels - outside the glass-card */}
    <SkillsPanel
      isOpen={isSkillsPanelOpen}
      onClose={() => setIsSkillsPanelOpen(false)}
    />
    <AchievementPanel 
      isOpen={isAchievementPanelOpen} 
      onClose={() => setIsAchievementPanelOpen(false)} 
    />
    <SaveSlotPanel
      isOpen={isSavePanelOpen}
      onClose={() => setIsSavePanelOpen(false)}
      mode="save"
    />
    <SettingsPanel
      isOpen={isSettingsOpen}
      onClose={() => setIsSettingsOpen(false)}
    />
    </>
  );
});
