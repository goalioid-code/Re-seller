import { Redirect } from 'expo-router';

// Redirects to the new brand-identity step in the redesigned flow
export default function CategoryRedirect() {
  return <Redirect href="/(onboarding)/brand-identity" />;
}
