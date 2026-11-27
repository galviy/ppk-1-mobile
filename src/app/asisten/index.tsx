import { Href, Redirect } from 'expo-router';
import React from 'react';

export default function LegacyAsistenIndexRedirect() {
  return <Redirect href={'/asprak' as Href} />;
}
