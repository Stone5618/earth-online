import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Home, Star, ChevronRight, ChevronLeft, Crosshair, Shuffle, User, Users } from 'lucide-react';
import { FAMILY_OCCUPATIONS, TALENTS, FLAWS, CHALLENGES } from '@/config/gameConfig';
import type { FamilyOccupation } from '@/types/game';
import type { ChallengeConfig } from '@/game/gameState';
import { generateFullName, generateFamilyNameByOccupation, generateSurname } from '@/game/core/systems/familyNameSystem';

export type BackgroundChoice = {
  familyOccupation: FamilyOccupation | null;
  selectedTalent: string | null;
  selectedFlaw: string | null;
  challenge?: ChallengeConfig;
  characterName: string;
  familyName: string;
  gender: 'male' | 'female';
};

interface BackgroundSelectorProps {
  onComplete: (choice: BackgroundChoice) => void;
}

export function BackgroundSelector({ onComplete }: BackgroundSelectorProps) {
  const [step, setStep] = useState(0);
  const [choice, setChoice] = useState<BackgroundChoice>({
    familyOccupation: null,
    selectedTalent: null,
    selectedFlaw: null,
    challenge: undefined,
    characterName: generateFullName('male'),
    familyName: '',
    gender: 'male',
  });

  const steps = [
    { title: '角色设定', icon: User },
    { title: '选择家族职业', icon: Home },
    { title: '选择天赋', icon: Star },
    { title: '选择缺陷（可选）', icon: Flame },
    { title: '选择挑战模式（可选）', icon: Crosshair },
  ];

  const currentStep = steps[step];
  const StepIcon = currentStep.icon;

  const handleSelect = (id: string) => {
    let updatedChoice = choice;

    if (step === 1) {
      const occupation = id as FamilyOccupation;
      const familyName = generateFamilyNameByOccupation(occupation);
      updatedChoice = { ...choice, familyOccupation: occupation, familyName };
      setChoice(updatedChoice);
    } else if (step === 2) {
      updatedChoice = { ...choice, selectedTalent: id };
      setChoice(updatedChoice);
    } else if (step === 3) {
      updatedChoice = { ...choice, selectedFlaw: id };
      setChoice(updatedChoice);
    } else if (step === 4) {
      if (id === 'none') {
        updatedChoice = { ...choice, challenge: undefined };
        setChoice(updatedChoice);
      } else {
        const challenge = CHALLENGES.find(c => c.id === id);
        updatedChoice = { ...choice, challenge };
        setChoice(updatedChoice);
      }
    }

    if (step < steps.length - 1) {
      setStep((prev) => prev + 1);
    } else {
      onComplete(updatedChoice);
    }
  };

  const handleRandomFamily = () => {
    const familyKeys = Object.keys(FAMILY_OCCUPATIONS) as FamilyOccupation[];
    const randomKey = familyKeys[Math.floor(Math.random() * familyKeys.length)];
    const familyName = generateFamilyNameByOccupation(randomKey);
    setChoice((prev) => ({ 
      ...prev, 
      familyOccupation: randomKey,
      familyName: familyName,
    }));
  };

  const handleRandomName = () => {
    setChoice((prev) => ({ 
      ...prev, 
      characterName: generateFullName(prev.gender),
    }));
  };

  const handleGenderChange = (gender: 'male' | 'female') => {
    setChoice((prev) => ({ 
      ...prev, 
      gender,
      characterName: generateFullName(gender),
    }));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChoice((prev) => ({ ...prev, characterName: e.target.value }));
  };

  const canProceed = () => {
    if (step === 0) return choice.characterName.trim().length > 0;
    if (step === 1) return !!choice.familyOccupation;
    if (step === 2) return !!choice.selectedTalent;
    return true;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full max-w-5xl bg-[#0D1128] rounded-2xl border border-[rgba(0,210,255,0.15)] shadow-2xl overflow-hidden max-h-[95vh]"
      >
        {/* Header */}
        <div className="p-4 border-b border-[rgba(0,210,255,0.15)] bg-[#0D1128]">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-3">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <StepIcon className="w-5 h-5 text-[#00D2FF]" />
                {currentStep.title}
              </h2>
              {step === 1 && (
                <button
                  onClick={handleRandomFamily}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-white/80 hover:bg-white/15 transition-colors text-sm"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  随机
                </button>
              )}
            </div>
            <div className="flex gap-1">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 w-6 rounded-full transition-all duration-300 ${
                    idx === step ? 'bg-[#00D2FF]' : 
                    idx < step ? 'bg-[#00D2FF]/50' : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#00D2FF] to-[#7C3AED] transition-all duration-500"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-3.5 overflow-y-auto max-h-[60vh]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {/* 步骤0: 角色设定 */}
              {step === 0 && (
                <div className="max-w-md mx-auto space-y-6">
                  <div className="text-center">
                    <p className="text-white/60 text-sm mb-4">为你的角色设定基本信息</p>
                  </div>
                  
                  {/* 性别选择 */}
                  <div>
                    <label className="text-white/80 text-sm block mb-2">性别</label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleGenderChange('male')}
                        className={`flex-1 py-3 rounded-xl border-2 transition-all ${
                          choice.gender === 'male'
                            ? 'border-[#00D2FF] bg-[#00D2FF]/10 text-[#00D2FF]'
                            : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'
                        }`}
                      >
                        <span className="text-lg">♂</span> 男
                      </button>
                      <button
                        onClick={() => handleGenderChange('female')}
                        className={`flex-1 py-3 rounded-xl border-2 transition-all ${
                          choice.gender === 'female'
                            ? 'border-[#00D2FF] bg-[#00D2FF]/10 text-[#00D2FF]'
                            : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'
                        }`}
                      >
                        <span className="text-lg">♀</span> 女
                      </button>
                    </div>
                  </div>

                  {/* 姓名输入 */}
                  <div>
                    <label className="text-white/80 text-sm block mb-2">角色姓名</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={choice.characterName}
                        onChange={handleNameChange}
                        placeholder="输入角色姓名"
                        className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#00D2FF]/50"
                        maxLength={10}
                      />
                      <button
                        onClick={handleRandomName}
                        className="px-4 py-3 rounded-xl bg-white/10 text-white/80 hover:bg-white/15 transition-colors"
                        title="随机姓名"
                      >
                        <Shuffle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* 预览 */}
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#00D2FF]/20 flex items-center justify-center text-xl">
                        {choice.gender === 'male' ? '♂' : '♀'}
                      </div>
                      <div>
                        <p className="text-white font-bold">{choice.characterName || '未命名'}</p>
                        <p className="text-white/50 text-sm">{choice.gender === 'male' ? '男性' : '女性'} · 新生儿</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 步骤1-4: 选择类 */}
              {step >= 1 && step <= 4 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                  {step === 1 && Object.entries(FAMILY_OCCUPATIONS).map(([key, value]) => {
                    const isSelected = choice.familyOccupation === key;
                    return (
                      <motion.button
                        key={key}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelect(key)}
                        className={`text-left p-2.5 rounded-xl border-2 transition-all duration-200 relative ${
                          isSelected
                            ? 'border-[#00D2FF] bg-[#00D2FF]/10'
                            : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#00D2FF] rounded-full flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                        <h3 className={`font-bold text-sm ${isSelected ? 'text-[#00D2FF]' : 'text-white'}`}>
                          {value.name}
                        </h3>
                        <p className="text-white/50 text-xs mt-1 line-clamp-2">{value.description}</p>
                        <p className="text-[10px] text-green-300 bg-green-900/20 px-2 py-0.5 rounded-full inline-block mt-1.5">
                          {value.passiveBonus}
                        </p>
                      </motion.button>
                    );
                  })}

                  {step === 2 && TALENTS.map((t) => {
                    const isSelected = choice.selectedTalent === t.id;
                    return (
                      <motion.button
                        key={t.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelect(t.id)}
                        className={`text-left p-2.5 rounded-xl border-2 transition-all duration-200 relative ${
                          isSelected
                            ? 'border-[#00D2FF] bg-[#00D2FF]/10'
                            : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#00D2FF] rounded-full flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                        <h3 className={`font-bold text-sm ${isSelected ? 'text-[#00D2FF]' : 'text-white'}`}>
                          {t.name}
                        </h3>
                        <p className="text-white/50 text-xs mt-1 line-clamp-2">{t.description}</p>
                      </motion.button>
                    );
                  })}

                  {step === 3 && FLAWS.map((f) => {
                    const isSelected = choice.selectedFlaw === f.id;
                    return (
                      <motion.button
                        key={f.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelect(f.id)}
                        className={`text-left p-2.5 rounded-xl border-2 transition-all duration-200 relative ${
                          isSelected
                            ? 'border-red-400 bg-red-400/10'
                            : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-400 rounded-full flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                        <h3 className={`font-bold text-sm ${isSelected ? 'text-red-400' : 'text-white'}`}>
                          {f.name}
                        </h3>
                        <p className="text-white/50 text-xs mt-1 line-clamp-2">{f.description}</p>
                      </motion.button>
                    );
                  })}

                  {step === 4 && [
                    { id: 'none', name: '普通模式', desc: '不选择任何挑战，正常游戏' },
                    ...CHALLENGES.map((c) => ({
                      id: c.id,
                      name: c.name,
                      desc: c.description,
                      icon: c.icon,
                    })),
                  ].map((option) => {
                    const isSelected = (option.id === 'none' && !choice.challenge) ||
                      (choice.challenge?.id === option.id);
                    return (
                      <motion.button
                        key={option.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelect(option.id)}
                        className={`text-left p-2.5 rounded-xl border-2 transition-all duration-200 relative ${
                          isSelected
                            ? 'border-[#00D2FF] bg-[#00D2FF]/10'
                            : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#00D2FF] rounded-full flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                        <div className="flex items-center gap-2 mb-1">
                          {(option as any).icon && (
                            <span className="text-lg">{(option as any).icon}</span>
                          )}
                          <h3 className={`font-bold text-sm ${isSelected ? 'text-[#00D2FF]' : 'text-white'}`}>
                            {option.name}
                          </h3>
                        </div>
                        <p className="text-white/50 text-xs line-clamp-2">{option.desc}</p>
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* Skip Button for last step */}
              {(step === 3 || step === 4) && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => onComplete(choice)}
                    className="text-white/40 hover:text-white/60 text-xs transition-colors"
                  >
                    {step === 3 ? '跳过，不选择缺陷' : '使用当前选择'}
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[rgba(0,210,255,0.15)] bg-[#0D1128]/60 flex flex-col sm:flex-row gap-2.5 sm:gap-0 justify-between items-center">
          <button
            onClick={() => setStep((prev) => Math.max(0, prev - 1))}
            disabled={step === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            上一步
          </button>

          <div className="text-xs text-white/40 flex flex-wrap gap-2 items-center justify-center order-first sm:order-none">
            {choice.characterName && (
              <span className="text-white flex items-center gap-0.5">
                <User className="w-3 h-3" />
                {choice.characterName}
              </span>
            )}
            {choice.familyOccupation && (
              <span className="text-white flex items-center gap-0.5">
                <Home className="w-3 h-3" />
                {FAMILY_OCCUPATIONS[choice.familyOccupation].name}
              </span>
            )}
            {choice.selectedTalent && (
              <span className="text-white flex items-center gap-0.5">
                <Star className="w-3 h-3" />
                {TALENTS.find(t => t.id === choice.selectedTalent)?.name}
              </span>
            )}
            {choice.challenge && (
              <span className="text-white flex items-center gap-0.5">
                <Crosshair className="w-3 h-3" />
                {choice.challenge.name}
              </span>
            )}
          </div>

          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep((prev) => prev + 1)}
              disabled={!canProceed()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#00D2FF] text-black hover:bg-[#00B8E6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-sm"
            >
              下一步
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => onComplete(choice)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#00D2FF] text-black hover:bg-[#00B8E6] transition-colors font-semibold text-sm"
            >
              开始人生
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
