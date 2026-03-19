'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { getHotIssues, translateNewsArray } from '@/app/actions';
import { Country } from './MapComponent';
import { Loader2, Globe, X, ExternalLink } from 'lucide-react';
import Image from 'next/image';

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center">
      <p className="text-slate-500 font-medium">Loading Map...</p>
    </div>
  ),
});

interface NewsItem {
  title: string;
  summary: string;
  thumbnailKeyword: string;
  metaDescription: string;
  urlSlug: string;
}

const LANGUAGES = [
  { code: 'ko', name: 'Korean' },
  { code: 'en', name: 'English' },
  { code: 'ja', name: 'Japanese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
];

const AGE_GROUPS = ['All', 'Teens', '20s', '30s', '40s', '50s+'];

export default function MainLayout() {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [targetLang, setTargetLang] = useState('original'); // Default to original
  const [originalNews, setOriginalNews] = useState<NewsItem[]>([]);
  const [ageGroup, setAgeGroup] = useState('All');

  useEffect(() => {
    if (!selectedCountry) return;

    const fetchNews = async () => {
      setLoading(true);
      setNews([]);
      setOriginalNews([]);
      setTargetLang('original'); // Reset to original when country changes
      try {
        const data = await getHotIssues(selectedCountry.name, ageGroup);
        setOriginalNews(data);
        setNews(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [selectedCountry, ageGroup]);

  const handleTranslate = async (langCode: string) => {
    setTargetLang(langCode);
    if (!originalNews.length) return;
    
    if (langCode === 'original') {
      setNews(originalNews);
      return;
    }

    setTranslating(true);
    try {
      const langName = LANGUAGES.find(l => l.code === langCode)?.name || 'Korean';
      const translated = await translateNewsArray(originalNews, langName);
      setNews(translated);
    } catch (error) {
      console.error(error);
    } finally {
      setTranslating(false);
    }
  };

  return (
    <>
      <div className="flex-1 relative z-0">
        <MapComponent onSelectCountry={setSelectedCountry} selectedCountry={selectedCountry} />
      </div>

      {/* Sidebar for News */}
      {selectedCountry && (
        <div className="w-full md:w-[400px] lg:w-[450px] bg-white border-l border-slate-200 shadow-2xl flex flex-col z-10 h-full absolute right-0 top-0 md:relative overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-600" />
                {selectedCountry.name} {ageGroup === 'All' ? 'Top 10' : `${ageGroup} Top 10`}
              </h2>
              <p className="text-xs text-slate-500 mt-1">Current hot issues & trends</p>
            </div>
            <button 
              onClick={() => setSelectedCountry(null)}
              className="p-2 hover:bg-slate-200 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Age Group Selector */}
          <div className="p-3 border-b border-slate-100 bg-slate-50/80 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
            <span className="text-xs font-medium text-slate-500 whitespace-nowrap">Age:</span>
            {AGE_GROUPS.map(age => (
              <button
                key={age}
                onClick={() => setAgeGroup(age)}
                disabled={translating || loading}
                className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                  ageGroup === age 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {age}
              </button>
            ))}
          </div>

          {/* Language Selector */}
          <div className="p-3 border-b border-slate-100 bg-white flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
            <span className="text-xs font-medium text-slate-500 whitespace-nowrap">Translate:</span>
            <button
              onClick={() => handleTranslate('original')}
              disabled={translating || loading}
              className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                targetLang === 'original' 
                  ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Original
            </button>
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => handleTranslate(lang.code)}
                disabled={translating || loading}
                className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                  targetLang === lang.code 
                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {lang.name}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 gap-3">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                <p className="text-sm text-slate-500 font-medium">Fetching global insights...</p>
              </div>
            ) : translating ? (
              <div className="flex flex-col items-center justify-center h-64 gap-3">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                <p className="text-sm text-slate-500 font-medium">Translating content...</p>
              </div>
            ) : news.length > 0 ? (
              <div className="space-y-4">
                {news.map((item, index) => (
                  <article key={index} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="relative w-full h-40 bg-slate-200">
                      <Image
                        src={`https://picsum.photos/seed/${encodeURIComponent(item.thumbnailKeyword)}/400/200`}
                        alt={item.title}
                        fill
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2 left-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded">
                        #{index + 1}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-slate-800 leading-tight mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-slate-600 line-clamp-3 mb-3">
                        {item.summary}
                      </p>
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                          SEO: {item.metaDescription.substring(0, 30)}...
                        </span>
                        <button className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-xs font-medium">
                          Read more <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                <Globe className="w-12 h-12 text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">Select a country on the map to view its top 10 hot issues.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
