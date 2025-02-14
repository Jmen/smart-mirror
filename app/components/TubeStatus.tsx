'use client';

import { useState, useEffect } from 'react';

interface LineStatus {
  id: string;
  name: string;
  status: string;
  reason?: string;
}

interface TflLineStatus {
  statusSeverity: number;
  statusSeverityDescription: string;
  reason?: string;
}

interface TflLine {
  id: string;
  name: string;
  lineStatuses: TflLineStatus[];
}

const LINE_COLORS: { [key: string]: string } = {
  'Bakerloo': 'text-[#B36305]',
  'Central': 'text-[#E32017]',
  'Circle': 'text-[#FFD300]',
  'District': 'text-[#00782A]',
  'Hammersmith & City': 'text-[#F3A9BB]',
  'Jubilee': 'text-[#A0A5A9]',
  'Metropolitan': 'text-[#9B0056]',
  'Northern': 'text-[#000000]',
  'Piccadilly': 'text-[#003688]',
  'Victoria': 'text-[#0098D4]',
  'Waterloo & City': 'text-[#95CDBA]',
  'DLR': 'text-[#00A4A7]',
  'London Overground': 'text-[#EE7C0E]',
  'Elizabeth': 'text-[#6950A1]',
  'TfL Rail': 'text-[#0019A8]',
  'Tram': 'text-[#84B817]',
  'Emirates Air Line': 'text-[#E51836]',
};

export default function TubeStatus() {
  const [statuses, setStatuses] = useState<LineStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setError(null);
        const response = await fetch('/api/tube');
        
        if (response.status === 503) {
          // API key not configured
          setEnabled(false);
          return;
        }
        
        const data = await response.json();

        if ('error' in data) {
          throw new Error(data.error);
        }

        // Only show lines with disruptions
        const disrupted = data.filter((line: TflLine) => 
          line.lineStatuses[0].statusSeverity !== 10
        );

        setStatuses(disrupted.map((line: TflLine) => ({
          id: line.id,
          name: line.name,
          status: line.lineStatuses[0].statusSeverityDescription,
          reason: line.lineStatuses[0].reason
        })));
      } catch (error) {
        console.error('Error fetching tube status:', error);
        setError(error instanceof Error ? error.message : 'Failed to load tube status');
      } finally {
        setLoading(false);
      }
    };

    if (enabled) {
      fetchStatus();
      // Refresh every 5 minutes
      const interval = setInterval(fetchStatus, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [enabled]);

  if (!enabled) return null;
  if (loading) return null;
  if (error) return null;
  if (statuses.length === 0) return null;

  return (
    <div className="flex flex-col mt-6">
      {statuses.map(line => (
        <div key={line.id} className="flex items-center gap-4 mb-2">
          <div className={`text-2xl ${LINE_COLORS[line.name] || 'text-white'}`}>
            {line.name}
          </div>
          <div className="text-xl text-yellow-500">{line.status}</div>
        </div>
      ))}
    </div>
  );
} 