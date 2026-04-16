import './index.css';
import { useEffect, useState } from 'react';
import { ModuleWindow } from './components/ModuleWindow';
import { TopNavigation } from './components/TopNavigation';
import { useTerminalStore } from './store';
import { getPanelConfig } from './panelConfig';

const TOPBAR_HEIGHT = 62;
const BOTTOMBAR_HEIGHT = 34;

function App() {
  const {
    workspaces,
    activeWorkspace,
    gridData,
    selectedWatchlistRowId,
    summaryView,
    chartTopPeriod,
    chartBottomPeriod,
    chartSummary,
    summaryViews,
    updateWindowPosition,
    updateWindowSize,
    focusWindow,
    tickData,
    setWorkspace,
    setSelectedWatchlistRow,
    setSummaryView,
    setChartTopPeriod,
    setChartBottomPeriod,
    triggerWindowAction,
  } = useTerminalStore();
  const [workspaceBounds, setWorkspaceBounds] = useState({
    width: window.innerWidth,
    height: window.innerHeight - TOPBAR_HEIGHT - BOTTOMBAR_HEIGHT,
  });

  const currentWorkspace = workspaces.find(w => w.id === activeWorkspace);
  const windows = currentWorkspace?.windows || [];

  useEffect(() => {
    const interval = setInterval(() => {
      tickData();
    }, 2000);
    return () => clearInterval(interval);
  }, [tickData]);

  useEffect(() => {
    const handleResize = () => {
      setWorkspaceBounds({
        width: window.innerWidth,
        height: window.innerHeight - TOPBAR_HEIGHT - BOTTOMBAR_HEIGHT,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleTabClick = (workspaceId: string) => {
    setWorkspace(workspaceId);
  };

  const handleChartTopPeriodChange = (label: string) => {
    setChartTopPeriod(label);
    if (label === '5D') setChartBottomPeriod(30);
    if (label === '1M') setChartBottomPeriod(90);
    if (label === '6M') setChartBottomPeriod(180);
    if (label === '1Y') setChartBottomPeriod(365);
  };

  const handleChartBottomPeriodChange = (period: number) => {
    setChartBottomPeriod(period);
    if (period === 30) setChartTopPeriod('5D');
    if (period === 90) setChartTopPeriod('1M');
    if (period === 180) setChartTopPeriod('6M');
    if (period === 365) setChartTopPeriod('1Y');
  };

  return (
    <div className="terminal-app">
      <TopNavigation />

      <main className="workspace" id="workspace">
        <div className="workspace-status"><span className="status-led"></span><span>DESKTOP ONLINE</span><span>RUNTIME 06:14:28</span></div>
        <div className="desktop-label" id="desktopLabel">{currentWorkspace?.desktop || 'OIL OVERVIEW'}</div>

        {windows.map(win => (
          (() => {
            const panel = getPanelConfig({
              window: win,
              gridData,
              selectedWatchlistRowId,
              onSelectWatchlistRow: setSelectedWatchlistRow,
              summaryView,
              onSummaryViewChange: setSummaryView,
              summaryData: summaryViews[summaryView],
              chartSummary,
              chartTopPeriod,
              onChartTopPeriodChange: handleChartTopPeriodChange,
              chartBottomPeriod,
              onChartBottomPeriodChange: handleChartBottomPeriodChange,
            });

            return (
              <ModuleWindow
                key={win.id}
                id={win.id}
                title={win.title}
                badge={win.badge}
                isActive={win.isActive}
                isMinimized={win.isMinimized}
                metaIndicators={win.meta}
                actions={win.actions}
                actionStates={win.actionStates}
                style={{ left: `${win.x}px`, top: `${win.y}px`, width: `${win.w}px`, height: `${win.h}px`, zIndex: win.zIndex }}
                bounds={workspaceBounds}
                subtabs={panel.subtabs}
                toolbar={panel.toolbar}
                bottomStrip={panel.bottomStrip}
                statusbar={panel.statusbar}
                onFocus={() => focusWindow(win.id)}
                onMove={(x, y) => updateWindowPosition(win.id, x, y)}
                onResize={(w, h, x, y) => {
                  if (typeof x === 'number' && typeof y === 'number') updateWindowPosition(win.id, x, y);
                  updateWindowSize(win.id, w, h);
                }}
                onAction={(action) => triggerWindowAction(win.id, action, workspaceBounds)}
              >
                {panel.body}
              </ModuleWindow>
            );
          })()
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