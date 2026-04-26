'use client';

import { useEffect } from 'react';
import Clarity from '@microsoft/clarity';

export default function MicrosoftClarity() {
  useEffect(() => {
    // Replace with your actual Clarity Project ID or set it in .env.local
    const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;
    
    if (clarityId) {
      Clarity.init(clarityId);
    } else {
      console.warn('Microsoft Clarity ID is missing. Please set NEXT_PUBLIC_CLARITY_ID in your environment variables.');
    }
  }, []);

  return null;
}
