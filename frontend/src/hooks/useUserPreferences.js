import { useState, useEffect, useCallback } from 'react';

// Default preferences
const defaultPreferences = {
  // Profile Settings
  profile: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@university.edu',
    title: 'Senior Research Scientist',
    department: 'Computer Science',
    institution: 'University of Research Excellence',
    bio: 'Passionate researcher focused on AI and machine learning applications in healthcare.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    phone: '+1 (555) 123-4567',
    website: 'https://johndoe.research.edu',
  },
  // Notification Preferences
  notifications: {
    emailNotifications: true,
    pushNotifications: true,
    collaborationRequests: true,
    milestoneDeadlines: true,
    paperPublications: true,
    groupInvitations: true,
    weeklyDigest: false,
    marketingEmails: false,
  },
  // Privacy Settings
  privacy: {
    profileVisibility: 'public', // public, colleagues, private
    showEmail: false,
    showPhone: false,
    allowCollaborationRequests: true,
    showResearchInterests: true,
    allowDataExport: true,
  },
  // App Preferences
  preferences: {
    language: 'en',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    theme: 'system', // light, dark, system
    fontSize: 'medium', // small, medium, large
    compactMode: false,
    showTutorials: true,
  },
  // Accessibility
  accessibility: {
    highContrast: false,
    reducedMotion: false,
    screenReader: false,
    keyboardNavigation: true,
    focusIndicators: true,
  },
};

// Local storage key
const PREFERENCES_KEY = 'research-hub-preferences';

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const savedPreferences = localStorage.getItem(PREFERENCES_KEY);
      if (savedPreferences) {
        const parsed = JSON.parse(savedPreferences);
        // Merge with defaults to ensure all properties exist
        setPreferences(prev => ({
          ...prev,
          ...parsed,
          profile: { ...prev.profile, ...parsed.profile },
          notifications: { ...prev.notifications, ...parsed.notifications },
          privacy: { ...prev.privacy, ...parsed.privacy },
          preferences: { ...prev.preferences, ...parsed.preferences },
          accessibility: { ...prev.accessibility, ...parsed.accessibility },
        }));
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
      } catch (error) {
        console.error('Error saving preferences:', error);
      }
    }
  }, [preferences, isLoading]);

  // Update a specific preference
  const updatePreference = useCallback((category, key, value) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  }, []);

  // Update multiple preferences at once
  const updatePreferences = useCallback((updates) => {
    setPreferences(prev => {
      const newPreferences = { ...prev };
      Object.entries(updates).forEach(([category, categoryUpdates]) => {
        newPreferences[category] = {
          ...newPreferences[category],
          ...categoryUpdates,
        };
      });
      return newPreferences;
    });
  }, []);

  // Reset preferences to defaults
  const resetPreferences = useCallback(() => {
    setPreferences(defaultPreferences);
  }, []);

  // Reset a specific category to defaults
  const resetCategory = useCallback((category) => {
    setPreferences(prev => ({
      ...prev,
      [category]: defaultPreferences[category],
    }));
  }, []);

  // Export preferences as JSON
  const exportPreferences = useCallback(() => {
    const dataStr = JSON.stringify(preferences, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'research-hub-preferences.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [preferences]);

  // Import preferences from JSON
  const importPreferences = useCallback((jsonData) => {
    try {
      const imported = JSON.parse(jsonData);
      // Validate and merge with defaults
      const validatedPreferences = {
        ...defaultPreferences,
        ...imported,
        profile: { ...defaultPreferences.profile, ...imported.profile },
        notifications: { ...defaultPreferences.notifications, ...imported.notifications },
        privacy: { ...defaultPreferences.privacy, ...imported.privacy },
        preferences: { ...defaultPreferences.preferences, ...imported.preferences },
        accessibility: { ...defaultPreferences.accessibility, ...imported.accessibility },
      };
      setPreferences(validatedPreferences);
      return true;
    } catch (error) {
      console.error('Error importing preferences:', error);
      return false;
    }
  }, []);

  // Get preference value by path (e.g., 'preferences.theme')
  const getPreference = useCallback((path) => {
    const keys = path.split('.');
    let value = preferences;
    for (const key of keys) {
      value = value?.[key];
      if (value === undefined) break;
    }
    return value;
  }, [preferences]);

  // Check if preferences have been modified from defaults
  const hasChanges = useCallback(() => {
    return JSON.stringify(preferences) !== JSON.stringify(defaultPreferences);
  }, [preferences]);

  // Get user's display name
  const getDisplayName = useCallback(() => {
    const { firstName, lastName } = preferences.profile;
    return `${firstName} ${lastName}`.trim() || 'User';
  }, [preferences.profile]);

  // Get user's initials
  const getInitials = useCallback(() => {
    const { firstName, lastName } = preferences.profile;
    const firstInitial = firstName?.charAt(0)?.toUpperCase() || '';
    const lastInitial = lastName?.charAt(0)?.toUpperCase() || '';
    return `${firstInitial}${lastInitial}` || 'U';
  }, [preferences.profile]);

  // Apply theme preference
  const applyTheme = useCallback(() => {
    const { theme } = preferences.preferences;
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [preferences.preferences]);

  // Apply theme when preferences change
  useEffect(() => {
    if (!isLoading) {
      applyTheme();
    }
  }, [applyTheme, isLoading]);

  // Apply accessibility preferences
  const applyAccessibility = useCallback(() => {
    const { highContrast, reducedMotion } = preferences.accessibility;
    const root = document.documentElement;
    
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    if (reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
  }, [preferences.accessibility]);

  // Apply accessibility when preferences change
  useEffect(() => {
    if (!isLoading) {
      applyAccessibility();
    }
  }, [applyAccessibility, isLoading]);

  return {
    preferences,
    isLoading,
    updatePreference,
    updatePreferences,
    resetPreferences,
    resetCategory,
    exportPreferences,
    importPreferences,
    getPreference,
    hasChanges,
    getDisplayName,
    getInitials,
    applyTheme,
    applyAccessibility,
  };
};

export default useUserPreferences;
