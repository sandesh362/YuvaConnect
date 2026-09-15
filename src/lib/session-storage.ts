import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/**
 * Platform-aware session storage.
 *
 * `expo-secure-store` ships a native keychain/keystore implementation for iOS
 * and Android but **no web implementation at all** — on web its methods are
 * `undefined`, so every call throws a `TypeError`. Because the app's storage
 * layer is the first thing `AuthProvider` touches, the entire web build used to
 * hang on the splash spinner forever.
 *
 * On web we therefore fall back to `localStorage` (same key, same string
 * contract). Native keeps the secure keychain path unchanged.
 */

const isWeb = Platform.OS === 'web';

function webStore(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

export const sessionStorage = {
  async getItem(key: string): Promise<string | null> {
    if (isWeb) return webStore()?.getItem(key) ?? null;
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    if (isWeb) {
      webStore()?.setItem(key, value);
      return;
    }
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      /* Keychain unavailable (e.g. simulator without a passcode) — the session
         stays in memory for this launch instead of crashing the app. */
    }
  },

  async removeItem(key: string): Promise<void> {
    if (isWeb) {
      webStore()?.removeItem(key);
      return;
    }
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      /* no-op */
    }
  },
};
