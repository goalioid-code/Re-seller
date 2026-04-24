import Constants from 'expo-constants';
import { Platform } from 'react-native';

const LOCALHOST_PATTERN = /localhost|127\.0\.0\.1/i;
const PRIVATE_IP_PATTERN = /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/i;

function getHostUriFromExpo() {
  const expoConfigHostUri = (Constants as any)?.expoConfig?.hostUri;
  const manifestDebuggerHost = (Constants as any)?.manifest?.debuggerHost;
  const manifest2HostUri = (Constants as any)?.manifest2?.extra?.expoClient?.hostUri;
  return expoConfigHostUri || manifestDebuggerHost || manifest2HostUri || '';
}

export function getApiBaseUrl() {
  const envUrl = (process.env.EXPO_PUBLIC_API_URL || '').trim();

  // For web, localhost is expected during local development.
  if (Platform.OS === 'web') {
    return envUrl || 'http://localhost:3000';
  }

  const hostUri = getHostUriFromExpo();
  const expoHost = hostUri ? hostUri.split(':')[0] : '';

  // In device/emulator, prefer LAN URL to avoid localhost loopback.
  // If env uses private IP but differs from current Expo host, auto-switch to current host.
  if (envUrl && !LOCALHOST_PATTERN.test(envUrl)) {
    try {
      const envHost = new URL(envUrl).hostname;
      if (expoHost && PRIVATE_IP_PATTERN.test(envHost) && envHost !== expoHost) {
        return `http://${expoHost}:3000`;
      }
    } catch {
      // ignore parse errors and continue using envUrl
    }
    return envUrl;
  }

  if (hostUri) {
    return `http://${expoHost}:3000`;
  }

  return envUrl || 'http://localhost:3000';
}

export async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit = {}, timeoutMs = 12000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}
