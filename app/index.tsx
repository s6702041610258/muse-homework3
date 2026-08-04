import React from 'react';
import { useRouter } from 'expo-router';
import { HomeScreen } from '../src/screens/HomeScreen';

export default function DiscoverRoute() {
  const router = useRouter();
  return <HomeScreen onOpenDocumentation={() => router.push('/learn')} />;
}
