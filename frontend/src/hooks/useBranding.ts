import { useState, useEffect } from 'react';
import client from '../api/client';

export interface Branding {
  logo_url: string | null;
  logo_light_url: string | null;
  favicon_url: string | null;
  primary_color: string;
  accent_color: string;
  institutional_name: string;
  institutional_motto: string;
  hero_image: string | null;
  footer_text: string;
  admissions_enabled: boolean;
  admissions_opens_at: string;
  footer_columns: {
    title: string;
    links: { label: string; url: string; }[];
  }[];
  
  // Dynamic Page Content
  admissions_hero_title: string;
  admissions_hero_desc: string;
  admissions_stats: { label: string; value: string; suffix: string }[];
  scholarships_hero_title: string;
  scholarships_hero_desc: string;
  courses_hero_title: string;
  courses_hero_desc: string;
  auth_panel_title: string;
  auth_panel_desc: string;
  benefit_cards: { title: string; desc: string }[];
  
  // Student Experience Page
  experience_hero_title: string;
  experience_hero_desc: string;
  experience_features: { title: string; desc: string; icon: string }[];

  // About Us Page
  about_hero_title: string;
  about_hero_desc: string;
  about_mission: string;
  about_leadership_title: string;
  about_history: string;

  // Partner & Accreditor Logos
  accreditor_logos: { src: string; alt: string }[];
  partner_logos: { src: string; alt: string }[];
}

const STORAGE_KEY = 'mylms_branding_cache';

const injectColors = (data: Partial<Branding>) => {
  if (data.primary_color) {
    document.documentElement.style.setProperty('--color-mylms-purple', data.primary_color);
  }
  if (data.accent_color) {
    document.documentElement.style.setProperty('--color-mylms-rose', data.accent_color);
  }
};

export const useBranding = () => {
  // 1. Initial state from localStorage to prevent flash
  const [branding, setBranding] = useState<Branding | null>(() => {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        injectColors(parsed);
        return parsed;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(!branding);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const response = await client.get('/branding');
        const data = response.data;
        
        setBranding(data);
        injectColors(data);
        
        // 2. Persist to localStorage for next reload
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        
      } catch (err: any) {
        console.error('Failed to load branding from registry:', err);
        setError('Registry Unreachable');
      } finally {
        setLoading(false);
      }
    };

    fetchBranding();
  }, []);

  return { branding, loading, error };
};
