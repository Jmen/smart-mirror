'use client';

import dynamic from 'next/dynamic';
import Weather from './components/Weather';
import NetworkStatus from './components/NetworkStatus';
import TubeStatus from './components/TubeStatus';

const Clock = dynamic(() => import('./components/Clock'), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="flex flex-col items-center p-8 pt-24">
      <div className="flex flex-col items-start w-full">
        <Clock />
        <Weather />
        <TubeStatus />
        <NetworkStatus />
      </div>
    </div>
  );
}
