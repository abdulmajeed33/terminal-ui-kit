import './index.css';
import { ModuleWindow } from './components/ModuleWindow';
import { DataGrid } from './components/DataGrid';
import { TopNavigation } from './components/TopNavigation';
import { NewsFeed } from './components/NewsFeed';
import { useTerminalStore } from './store';
import { useEffect } from 'react';

const newsItems = [
  { id: '1', time: '16:32', headline: 'Celebrity Cruises Forced to Cancel Sailings', source: 'CRUISE', sentiment: 'negative' as const },
  { id: '2', time: '16:15', headline: 'Royal Caribbean Swings to 1Q Loss Amid Covid-19', source: 'DJ NEWS', sentiment: 'negative' as const },
  { id: '3', time: '15:42', headline: 'Brent and WTI continue higher after broad risk assets rebound', source: 'ENERGY', sentiment: 'positive' as const },
  { id: '4', time: '15:10', headline: 'Canada Apr CPI trimmed +1.8% from year ago', source: 'ECON', sentiment: 'positive' as const },
];

function App() {
  const { workspaces, activeWorkspace, gridData, updateWindowPosition, updateWindowSize, focusWindow, tickData, setWorkspace } = useTerminalStore();

  const currentWorkspace = workspaces.find(w => w.id === activeWorkspace);
  const windows = currentWorkspace?.windows || [];

  useEffect(() => {
    const interval = setInterval(() => {
      tickData();
    }, 2000);
    return () => clearInterval(interval);
  }, [tickData]);

  const handleTabClick = (workspaceId: string) => {
    setWorkspace(workspaceId);
  };

  return (
    <div className="terminal-app">
      <TopNavigation />

      <main className="workspace" id="workspace">
        <div className="workspace-status"><span className="status-led"></span><span>DESKTOP ONLINE</span><span>RUNTIME 06:14:28</span></div>
        <div className="desktop-label" id="desktopLabel">{currentWorkspace?.desktop || 'OIL OVERVIEW'}</div>

        {windows.map(win => (
          <ModuleWindow
            key={win.id}
            id={win.id}
            title={win.title}
            badge={win.type === 'watchlist' ? 'list' : 'live'}
            isActive={win.isActive}
            style={{ left: win.x + 'px', top: win.y + 'px', width: win.w + 'px', height: win.h + 'px', zIndex: win.zIndex }}
            onFocus={() => focusWindow(win.id)}
            onMove={(x, y) => updateWindowPosition(win.id, x, y)}
            onResize={(w, h) => updateWindowSize(win.id, w, h)}
            subtabs={win.type === 'watchlist' ? (
              <>
                <button className="subtab">Chains</button>
                <button className="subtab is-on">List</button>
                <button className="subtab">Heatmap</button>
                <button className="subtab">Ranking</button>
              </>
            ) : undefined}
            toolbar={
              win.type === 'watchlist' ? (
                <>
                  <button className="toolbar-btn">＋ Add...</button>
                  <div className="toolbar-field">View <span className="muted">▾</span></div>
                  <div className="toolbar-spacer"></div>
                  <span className="toolbar-label">Realtime Updates Active</span>
                </>
              ) : (
                <>
                  <button className="toolbar-btn">Type ▾</button>
                  <button className="toolbar-btn">Today ▾</button>
                  <div className="toolbar-spacer"></div>
                  <button className="toolbar-btn">Add Alert</button>
                </>
              )
            }
            statusbar={
              win.type === 'watchlist' ? (
                <>
                  <div className="status-left">
                    <span>Rows: 12</span>
                    <span className="up">Change: 5</span>
                    <span className="down">Decline: 7</span>
                  </div>
                  <div className="status-right">
                    <span>Filter: None</span>
                    <span>Demo template state</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="status-left">
                    <span>Stories: 4</span>
                    <span>Filter: Today</span>
                  </div>
                  <div className="status-right">
                    <span>Live headlines enabled</span>
                  </div>
                </>
              )
            }
          >
            {win.type === 'watchlist' && (
              <DataGrid
                columns={[
                  { key: 'symbol', label: 'Symbol', width: '78px' },
                  { key: 'desc', label: 'Description' },
                  { key: 'last', label: 'Last', width: '70px' },
                  { key: 'change', label: '+/-', width: '56px' },
                  { key: 'changePct', label: 'L +/-%', width: '64px' },
                  { key: 'spark', label: 'Strength', width: '98px' },
                  { key: 'time', label: 'Time', width: '74px' }
                ]}
                data={gridData}
                selectedId="1"
              />
            )}

            {win.type === 'news' && (
              <NewsFeed items={newsItems} />
            )}
          </ModuleWindow>
        ))}
      </main>

      <footer className="bottom-bar">
        <div className="tabs-strip" id="tabsStrip">
          {workspaces.map(ws => (
            <button 
              key={ws.id} 
              className={`tab ${ws.id === activeWorkspace ? 'active' : ''}`} 
              data-workspace={ws.id}
              onClick={() => handleTabClick(ws.id)}
            >
              {ws.label}
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
}

export default App;