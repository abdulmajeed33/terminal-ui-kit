import { useState, useEffect } from 'react';
import { useTerminalStore } from '../store';

export function TopNavigation() {
    const { marketFeed } = useTerminalStore();
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (date: Date, timeZone?: string) => {
        return date.toLocaleTimeString('en-GB', { timeZone, hour: '2-digit', minute: '2-digit' });
    };
    return (
        <header className="topbar">
            <section className="topbar-left" style={{ flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', gap: '6px' }}>
                <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                    </svg>
                    Infront Professional Terminal
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                    <button className="menu-button" aria-label="Menu">
                        <span className="hamburger"><span></span><span></span><span></span></span>
                    </button>
                    <div className="global-search">
                        <input type="text" placeholder="Find anything" aria-label="Global Search" />
                        <span className="search-glyph"></span>
                    </div>
                </div>
            </section>

            <section className="market-strip" id="marketStrip" style={{ display: 'flex', alignItems: 'stretch', minWidth: 0, overflow: 'hidden' }}>
                {marketFeed.map(item => (
                    <div key={item.id} className="market-item">
                        <div className="market-symbol">{item.symbol}</div>
                        <div className="market-value-line">
                            <span className={`market-arrow ${item.direction}`}></span>
                            <span className={`market-change ${item.direction}`}>{item.changePct}</span>
                            <strong>{item.last.toFixed(2)}</strong>
                        </div>
                    </div>
                ))}
            </section>

            <section className="headline-zone" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 12px', minWidth: 0 }}>
                <div className="audio-indicator" aria-hidden="true" style={{ display: 'grid', placeItems: 'center', flex: '0 0 auto', position: 'relative' }}></div>
                <div className="headline-wrap">
                    <div className="headline-track" id="headlineTrack">
                        <span className="headline-item">
                            <span className="headline-source">REACT INIT</span>
                            <span>UI Kit Shell Component Online. Connecting Workspace...</span>
                        </span>
                    </div>
                </div>
            </section>

            <section className="clocks" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', padding: '0 12px' }}>
                <div className="clock">
                    <div className="clock-city">Time</div>
                    <div className="clock-time">{formatTime(now)}</div>
                </div>
                <div className="clock">
                    <div className="clock-city">New<br />York</div>
                    <div className="clock-time">{formatTime(now, 'America/New_York')}</div>
                </div>
                <div className="clock">
                    <div className="clock-city">London</div>
                    <div className="clock-time">{formatTime(now, 'Europe/London')}</div>
                </div>
                <div className="clock">
                    <div className="clock-city">Hong<br />Kong</div>
                    <div className="clock-time">{formatTime(now, 'Asia/Hong_Kong')}</div>
                </div>
            </section>

            <section className="utilities" style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingRight: '12px' }}>
                <button className="utility-button" aria-label="Help">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                </button>
                <button className="utility-button" aria-label="Favorites">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" stroke="currentColor" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                </button>
                <button className="utility-button has-dot" aria-label="Alerts" style={{ position: 'relative' }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" stroke="currentColor" strokeWidth="1"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                </button>
                <button className="utility-button" aria-label="More Options">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" stroke="none"><circle cx="12" cy="5" r="2"></circle><circle cx="12" cy="12" r="2"></circle><circle cx="12" cy="19" r="2"></circle></svg>
                </button>
            </section>
        </header>
    );
}
