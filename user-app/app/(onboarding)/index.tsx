import { Redirect } from 'expo-router';

export default function OnboardingIndex() {
  // Just a redirect to the first onboarding step if we use router, 
  // or we can put the logic here.
  // For now, let's redirect to 'target'
  return <Redirect href="/(onboarding)/target" />;
}
