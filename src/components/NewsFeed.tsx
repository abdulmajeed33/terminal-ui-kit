export interface NewsItem {
    id: string;
    time: string;
    headline: string;
    source: string;
    sentiment?: 'positive' | 'negative' | 'neutral';
}

interface NewsFeedProps {
    items: NewsItem[];
}

export function NewsFeed({ items }: NewsFeedProps) {
    return (
        <div className="news-shell">
            {items.map((news) => (
                <div key={news.id} className="news-row">
                    <div className="news-time">{news.time}</div>
                    <div className={`news-headline ${news.sentiment || ''}`}>
                        {news.headline}
                    </div>
                    <div className="news-feed">{news.source}</div>
                </div>
            ))}
        </div>
    );
}
