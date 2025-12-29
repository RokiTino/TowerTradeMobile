import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to login screen on initial load
  return <Redirect href="/(auth)/login" />;
}
