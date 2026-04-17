/// <reference types="vite/client" />

declare module 'lucide-react';
declare module 'react-router-dom';
declare module 'axios';
declare module 'framer-motion';

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
