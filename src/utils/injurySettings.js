const STORAGE_KEY_PREFIX = 'trainassist:injury-settings';

export function getInjurySettingsStorageKey(userId) {
  if (!userId) {
    return '';
  }

  return `${STORAGE_KEY_PREFIX}:${userId}`;
}

export function readInjurySettings(userId) {
  const storageKey = getInjurySettingsStorageKey(userId);

  if (!storageKey) {
    return { brokenRightWristMode: false };
  }

  try {
    const savedSettings = window.localStorage.getItem(storageKey);
    const parsedSettings = savedSettings ? JSON.parse(savedSettings) : {};

    return {
      brokenRightWristMode: parsedSettings.brokenRightWristMode === true,
    };
  } catch {
    return { brokenRightWristMode: false };
  }
}

export function writeInjurySettings(userId, settings) {
  const storageKey = getInjurySettingsStorageKey(userId);

  if (!storageKey) {
    return;
  }

  window.localStorage.setItem(
    storageKey,
    JSON.stringify({
      brokenRightWristMode: settings.brokenRightWristMode === true,
    }),
  );
}
