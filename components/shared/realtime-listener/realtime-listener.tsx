'use client';

import { useRealtimeParkingSpace } from '@/hooks/use-parking-toast';

export default function RealtimeListener() {
  
  useRealtimeParkingSpace();
  return null; 
}
