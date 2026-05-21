import type React from 'react';
import { Check, Monitor, Moon, Sun, Type } from 'lucide-react';
import { Slider } from '@/components';
import { useThemeStore } from '@/stores/themeStore';
import type { FontMode, ThemeMode } from '@/types/common';

const themeOptions: Array<{
  value: ThemeMode;
  label: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    value: 'light',
    label: '라이트',
    description: '밝은 기본 화면으로 사용합니다.',
    icon: <Sun size={20} />,
  },
  {
    value: 'dark',
    label: '다크',
    description: '어두운 화면으로 사용합니다.',
    icon: <Moon size={20} />,
  },
  {
    value: 'auto',
    label: '시스템',
    description: '기기 설정에 맞춰 자동으로 변경합니다.',
    icon: <Monitor size={20} />,
  },
];

const fontModeOptions: Array<{
  value: FontMode;
  label: string;
  description: string;
}> = [
  {
    value: 'xsmall',
    label: '더작게',
    description: 'md 기준 12px로 가장 촘촘하게 봅니다.',
  },
  {
    value: 'small',
    label: '작게',
    description: 'md 기준 14px로 조금 더 촘촘하게 봅니다.',
  },
  {
    value: 'base',
    label: '기본',
    description: 'md 기준 16px 기본 글자 크기로 사용합니다.',
  },
  {
    value: 'large',
    label: '크게',
    description: 'md 기준 18px로 글자를 더 크게 표시합니다.',
  },
  {
    value: 'xlarge',
    label: '더크게',
    description: 'md 기준 20px로 가장 크게 표시합니다.',
  },
];

const Settings = () => {
  const theme = useThemeStore((state) => state.theme);
  const fontMode = useThemeStore((state) => state.fontMode);
  const setTheme = useThemeStore((state) => state.setTheme);
  const setFontMode = useThemeStore((state) => state.setFontMode);
  const selectedFontModeIndex = Math.max(
    fontModeOptions.findIndex((option) => option.value === fontMode),
    0,
  );
  const selectedFontMode = fontModeOptions[selectedFontModeIndex] ?? fontModeOptions[2];
  const handleFontModeChange = (nextIndex: number) => {
    const nextFontMode = fontModeOptions[nextIndex];

    if (nextFontMode) {
      setFontMode(nextFontMode.value);
    }
  };

  return (
    <section className="container settings-page">
      <header className="settings-page__header">
        <h2 className="settings-page__title">설정</h2>
        <p className="settings-page__description">화면의 색상 모드와 글자 크기를 조정합니다.</p>
      </header>

      <div className="settings-page__group" aria-labelledby="theme-setting-title">
        <div className="settings-page__group-header">
          <h3 id="theme-setting-title">테마</h3>
          <p>라이트, 다크, 시스템 설정 중 선택합니다.</p>
        </div>
        <div className="settings-option-list" role="radiogroup" aria-labelledby="theme-setting-title">
          {themeOptions.map((option) => {
            const isSelected = theme === option.value;

            return (
              <button
                key={option.value}
                type="button"
                className="settings-option-list__item"
                role="radio"
                aria-checked={isSelected}
                data-selected={isSelected || undefined}
                onClick={() => setTheme(option.value)}
              >
                <span className="settings-option-list__icon" aria-hidden="true">
                  {option.icon}
                </span>
                <span className="settings-option-list__content">
                  <strong>{option.label}</strong>
                  <span>{option.description}</span>
                </span>
                {isSelected ? <Check className="settings-option-list__check" size={18} aria-hidden="true" /> : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="settings-page__group" aria-labelledby="font-setting-title">
        <div className="settings-page__group-header">
          <h3 id="font-setting-title">글자 크기</h3>
          <p>더작게부터 더크게까지 슬라이더로 조정합니다.</p>
        </div>
        <div className="settings-font-slider">
          <div className="settings-font-slider__summary">
            <span className="settings-font-slider__icon" aria-hidden="true">
              <Type size={20} />
            </span>
            <span className="settings-font-slider__content">
              <strong>{selectedFontMode.label}</strong>
              <span>{selectedFontMode.description}</span>
            </span>
          </div>
          <Slider
            className="settings-font-slider__slider"
            edgePadding={44}
            min={0}
            max={fontModeOptions.length - 1}
            step={1}
            value={selectedFontModeIndex}
            aria-labelledby="font-setting-title"
            marks={fontModeOptions.map((option, index) => ({
              value: index,
              label: option.label,
            }))}
            onValueChange={handleFontModeChange}
          />
        </div>
      </div>
    </section>
  );
};

export default Settings;
