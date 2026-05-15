import type { Href } from 'expo-router';

type RouterLike = {
  canGoBack: () => boolean;
  back: () => void;
  replace: (href: Href) => void;
};

/**
 * Hindari GO_BACK saat stack kosong (web, deep link, setelah replace) — pakai fallback.
 */
export function safeRouterBack(router: RouterLike, fallback: Href = '/(tabs)' as Href) {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(fallback);
  }
}
