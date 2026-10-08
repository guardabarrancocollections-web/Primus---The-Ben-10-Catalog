import '@expo/metro-runtime';
import { registerRootComponent } from 'expo';
import App from './App';

// Prevent browser extensions (like Google Translate) from corrupting DOM nodes
if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('translate', 'no');
  
  const meta = document.createElement('meta');
  meta.name = 'google';
  meta.content = 'notranslate';
  document.head.appendChild(meta);
}

registerRootComponent(App);