import React from 'react';
import { formatDate } from '@/lib/utils';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

interface MarketNewsProps {
  news: NewsItem[];
  isLoading: boolean;
}

export default function MarketNews({ news, isLoading }: MarketNewsProps) {
  if (isLoading) {
    return (
      <div className="animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="mb-4">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800';
      case 'negative':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Market News</h2>
      <div className="space-y-6">
        {news.map((item) => (
          <article key={item.id} className="border-b border-gray-200 pb-4 last:border-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">{item.source}</span>
              <time className="text-sm text-gray-500">
                {formatDate(new Date(item.publishedAt))}
              </time>
            </div>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600">
                {item.title}
              </h3>
              <p className="text-gray-600 text-sm mb-2">{item.summary}</p>
            </a>
            {item.sentiment && (
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSentimentColor(
                  item.sentiment
                )}`}
              >
                {item.sentiment.charAt(0).toUpperCase() + item.sentiment.slice(1)}
              </span>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
