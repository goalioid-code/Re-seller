import type { Href } from 'expo-router';

export function parseOnboardingData(value: unknown) {
  if (value == null) return null;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    try {
      return JSON.parse(trimmed);
    } catch {
      return { raw: value };
    }
  }
  return value;
}

export function isOnboardingEmptyFromUser(onboardingData: unknown) {
  const o = parseOnboardingData(onboardingData);
  if (o == null) return true;
  if (typeof o === 'object' && o !== null) {
    return Object.keys(o as object).length === 0;
  }
  return false;
}

type Userish = { status?: string; onboarding_data?: unknown } | null;

/** Return path setelah autentikasi (sinkron dengan kebutuhan gating: onboarding / pending / tabs). */
export function getAuthRedirectHref(
  isLoggedIn: boolean,
  user: Userish,
  loading = false,
): Href | null {
  if (loading) return null;
  if (!isLoggedIn) return '/(auth)/login';

  if (!user) return '/(auth)/login';

  const status = String(user.status || '').toLowerCase();
  if (status === 'active') {
    return '/(tabs)';
  }
  if (status === 'pending') {
    if (isOnboardingEmptyFromUser(user.onboarding_data)) {
      return '/(onboarding)';
    }
    return '/pending';
  }
  return '/pending';
}

export function canAccessOrdersRoute(user: Userish): boolean {
  return String(user?.status || '').toLowerCase() === 'active';
}
