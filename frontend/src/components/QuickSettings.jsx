import { useState } from 'react';
import {
  CogIcon,
  BellIcon,
  EyeIcon,
  MoonIcon,
  SunIcon,
  ComputerDesktopIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import ModernCard from './ModernCard';
import ModernButton from './ModernButton';
import { useToast } from '../contexts/ToastContext';

const QuickSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: 'system', // light, dark, system
    language: 'en',
    privacy: 'public',
  });

  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value,
    }));
    toast.success('Setting updated');
  };

  const themeOptions = [
    { value: 'light', label: 'Light', icon: SunIcon },
    { value: 'dark', label: 'Dark', icon: MoonIcon },
    { value: 'system', label: 'System', icon: ComputerDesktopIcon },
  ];

  const languageOptions = [
    { value: 'en', label: 'English', flag: '🇺🇸' },
    { value: 'es', label: 'Español', flag: '🇪🇸' },
    { value: 'fr', label: 'Français', flag: '🇫🇷' },
    { value: 'de', label: 'Deutsch', flag: '🇩🇪' },
  ];

  const privacyOptions = [
    { value: 'public', label: 'Public', description: 'Visible to everyone' },
    { value: 'colleagues', label: 'Colleagues', description: 'Research community only' },
    { value: 'private', label: 'Private', description: 'Only you' },
  ];

  return (
    <ModernCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <CogIcon className="h-5 w-5 mr-2" />
          Quick Settings
        </h3>
        <ModernButton
          variant="ghost"
          size="sm"
          onClick={() => window.location.href = '/settings'}
        >
          View All
        </ModernButton>
      </div>

      <div className="space-y-6">
        {/* Notifications Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
              <BellIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Notifications
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Email and push notifications
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={(e) => handleSettingChange('notifications', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Theme Selection */}
        <div>
          <div className="flex items-center space-x-3 mb-3">
            <div className="bg-purple-100 dark:bg-purple-900/20 p-2 rounded-lg">
              <EyeIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Theme
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Choose your preferred theme
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSettingChange('darkMode', option.value)}
                className={`flex flex-col items-center p-3 rounded-lg border transition-colors duration-200 ${
                  settings.darkMode === option.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300'
                }`}
              >
                <option.icon className="h-4 w-4 mb-1" />
                <span className="text-xs font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Language Selection */}
        <div>
          <div className="flex items-center space-x-3 mb-3">
            <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded-lg">
              <GlobeAltIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Language
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Interface language
              </p>
            </div>
          </div>
          <select
            value={settings.language}
            onChange={(e) => handleSettingChange('language', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {languageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.flag} {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Privacy Setting */}
        <div>
          <div className="flex items-center space-x-3 mb-3">
            <div className="bg-orange-100 dark:bg-orange-900/20 p-2 rounded-lg">
              <ShieldCheckIcon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Profile Visibility
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Who can see your profile
              </p>
            </div>
          </div>
          <select
            value={settings.privacy}
            onChange={(e) => handleSettingChange('privacy', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {privacyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} - {option.description}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Actions */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-3">
            <ModernButton
              variant="outline"
              size="sm"
              onClick={() => toast.success('Exporting settings...')}
              className="text-xs"
            >
              Export Settings
            </ModernButton>
            <ModernButton
              variant="outline"
              size="sm"
              onClick={() => toast.success('Settings reset to defaults')}
              className="text-xs"
            >
              Reset Defaults
            </ModernButton>
          </div>
        </div>
      </div>
    </ModernCard>
  );
};

export default QuickSettings;
