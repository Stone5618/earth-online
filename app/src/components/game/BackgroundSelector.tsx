
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Home, Star, ChevronRight, ChevronLeft, Crosshair, Shuffle } from 'lucide-react';
import { FAMILY_OCCUPATIONS, TALENTS, FLAWS, CHALLENGES } from '@/config/gameConfig';
import type { FamilyOccupation } from '@/types/game';
import type { ChallengeConfig } from '@/game/gameState';

export type BackgroundChoice = {
  familyOccupation: FamilyOccupation | null;
  selectedTalent: string | null;
  selectedFlaw: string | null;
  challenge?: ChallengeConfig;
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
  });

  const steps = [
    {
      title: '选择家族职业',
      icon: Home,
      options: Object.entries(FAMILY_OCCUPATIONS).map(([key, value]) => ({
        id: key as FamilyOccupation,
        name: value.name,
        desc: value.description,
        bonus: value.passiveBonus,
      })),
    },
    {
      title: '选择天赋',
      icon: Star,
      options: TALENTS.map((t) => ({
        id: t.id,
        name: t.name,
        desc: t.description,
      })),
    },
    {
      title: '选择缺陷（可选）',
      icon: Flame,
      options: FLAWS.map((f) => ({
        id: f.id,
        name: f.name,
        desc: f.description,
      })),
    },
    {
      title: '选择挑战模式（可选）',
      icon: Crosshair,
      options: [
        { id: 'none', name: '普通模式', desc: '不选择任何挑战，正常游戏' },
        ...CHALLENGES.map((c) => ({
          id: c.id,
          name: c.name,
          desc: c.description,
          icon: c.icon,
        })),
      ],
    },
  ];

  const currentStep = steps[step];
  const StepIcon = currentStep.icon;

  const handleSelect = (id: string) => {
    if (step === 0) {
      setChoice((prev) => ({ ...prev, familyOccupation: id as FamilyOccupation }));
    } else if (step === 1) {
      setChoice((prev) => ({ ...prev, selectedTalent: id }));
    } else if (step === 2) {
      setChoice((prev) => ({ ...prev, selectedFlaw: id }));
    } else if (step === 3) {
      if (id === 'none') {
        setChoice((prev) => ({ ...prev, challenge: undefined }));
      } else {
        const challenge = CHALLENGES.find(c => c.id === id);
        setChoice((prev) => ({ ...prev, challenge }));
      }
    }

    if (step < steps.length - 1) {
      setStep((prev) => prev + 1);
    } else {
      onComplete(choice);
    }
  };

  const handleRandomFamily = () => {
    const familyKeys = Object.keys(FAMILY_OCCUPATIONS) as FamilyOccupation[];
    const randomKey = familyKeys[Math.floor(Math.random() * familyKeys.length)];
    setChoice((prev) => ({ ...prev, familyOccupation: randomKey }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full max-w-5xl bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden max-h-[95vh]"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-700 bg-slate-900/80">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-3">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <StepIcon className="w-5 h-5 text-holo-blue" />
                {currentStep.title}
              </h2>
              {step === 0 && (
                <button
                  onClick={handleRandomFamily}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600 transition-colors text-sm"
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
                    idx === step ? 'bg-holo-blue' : 
                    idx < step ? 'bg-holo-blue/50' : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-holo-blue to-cyan-400 transition-all duration-500"
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
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {currentStep.options.map((option) => {
                  const isSelected = (step === 0 && choice.familyOccupation === option.id)
                    || (step === 1 && choice.selectedTalent === option.id)
                    || (step === 2 && choice.selectedFlaw === option.id)
                    || (step === 3 && (
                      (option.id === 'none' && !choice.challenge) ||
                      (choice.challenge?.id === option.id)
                    ));

                  return (
                    <motion.button
                      key={option.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelect(option.id)}
                      className={`text-left p-2.5 rounded-xl border-2 transition-all duration-200 relative ${
                        isSelected
                          ? 'border-holo-blue bg-holo-blue/10'
                          : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-holo-blue rounded-full flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      <div className="flex items-center gap-2 mb-1.5">
                        {(option as any).icon && (
                          <span className="text-xl">{(option as any).icon}</span>
                        )}
                        <h3 className={`font-bold text-sm ${isSelected ? 'text-holo-blue' : 'text-white'}`}>
                          {option.name}
                        </h3>
                      </div>
                      <p className="text-slate-400 text-xs mb-1.5 line-clamp-2">{option.desc}</p>
                      {(option as any).bonus && (
                        <p className="text-[10px] text-green-300 bg-green-900/20 px-2 py-0.5 rounded-full inline-block">
                          {(option as any).bonus}
                        </p>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Skip Button for last step */}
              {(step === 2 || step === 3) && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => onComplete(choice)}
                    className="text-slate-500 hover:text-slate-300 text-xs transition-colors"
                  >
                    {step === 2 ? '跳过，不选择缺陷' : '使用当前选择'}
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-700 bg-slate-900/60 flex flex-col sm:flex-row gap-2.5 sm:gap-0 justify-between items-center">
          <button
            onClick={() => setStep((prev) => Math.max(0, prev - 1))}
            disabled={step === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            上一步
          </button>

          <div className="text-xs text-slate-400 flex flex-wrap gap-2 items-center justify-center order-first sm:order-none">
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

          {step < steps.length - 1 && (
            <button
              onClick={() => setStep((prev) => prev + 1)}
              disabled={!((step === 0 && choice.familyOccupation) || (step === 1 && choice.selectedTalent) || (step === 2))}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-holo-blue text-white hover:bg-holo-blue/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-sm"
            >
              下一步
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
