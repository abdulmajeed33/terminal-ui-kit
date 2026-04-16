import type { ReactNode } from 'react';
import { ChartPanel } from './components/ChartPanel';
import { DataGrid } from './components/DataGrid';
import { SummaryPanel } from './components/SummaryPanel';
import type { GridItem, SummaryData, SummaryView, WindowState } from './store';

export const watchlistColumns = [
  { key: 'symbol', label: 'Symbol', width: '78px' },
  { key: 'desc', label: 'Description' },
  { key: 'last', label: 'Last', width: '70px' },
  { key: 'change', label: '+/-', width: '56px' },
  { key: 'changePct', label: 'L +/-%', width: '64px' },
  { key: 'spark', label: 'Strength', width: '98px' },
  { key: 'time', label: 'Time', width: '74px' },
] as const;

interface PanelConfigArgs {
  window: WindowState;
  gridData: GridItem[];
  selectedWatchlistRowId: string;
  onSelectWatchlistRow: (id: string) => void;
  summaryView: SummaryView;
  onSummaryViewChange: (view: SummaryView) => void;
  summaryData: SummaryData;
  chartSummary: { last: string; delta: string; pct: string };
  chartTopPeriod: string;
  onChartTopPeriodChange: (label: string) => void;
  chartBottomPeriod: number;
  onChartBottomPeriodChange: (period: number) => void;
}

export interface PanelConfig {
  subtabs?: ReactNode;
  toolbar?: ReactNode;
  statusbar?: ReactNode;
  bottomStrip?: ReactNode;
  body: ReactNode;
}

export function getPanelConfig({
  window,
  gridData,
  selectedWatchlistRowId,
  onSelectWatchlistRow,
  summaryView,
  onSummaryViewChange,
  summaryData,
  chartSummary,
  chartTopPeriod,
  onChartTopPeriodChange,
  chartBottomPeriod,
  onChartBottomPeriodChange,
}: PanelConfigArgs): PanelConfig {
  if (window.type === 'watchlist') {
    return {
      subtabs: (
        <>
          <button className="subtab">Chains</button>
          <button className="subtab is-on">List</button>
          <button className="subtab">Heatmap</button>
          <button className="subtab">Ranking</button>
        </>
      ),
      toolbar: (
        <>
          <button className="toolbar-btn">＋ Add...</button>
          <div className="toolbar-field">Convert ccy <span className="muted">&lt;None&gt;</span></div>
          <div className="toolbar-field">View <span className="muted">▾</span></div>
          <div className="toolbar-field">Actions <span className="muted">▾</span></div>
          <div className="toolbar-spacer"></div>
          <span className="toolbar-label">Example data panel controls</span>
        </>
      ),
      statusbar: (
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
      ),
      body: (
        <DataGrid
          columns={[...watchlistColumns]}
          data={gridData}
          selectedId={selectedWatchlistRowId}
          onRowClick={onSelectWatchlistRow}
        />
      ),
    };
  }

  if (window.type === 'summary') {
    return {
      subtabs: (
        <>
          {(['overview', 'analytics', 'estimates', 'news'] as SummaryView[]).map((view) => (
            <button
              key={view}
              className={`subtab ${summaryView === view ? 'is-on' : ''}`}
              onClick={() => onSummaryViewChange(view)}
            >
              {view === 'overview' ? 'Overview' : view === 'analytics' ? 'Analytics' : view === 'estimates' ? 'Estimates' : 'News'}
            </button>
          ))}
        </>
      ),
      statusbar: (
        <>
          <div className="status-left">
            <span>Mode: Summary</span>
            <span>Flexible content card layout</span>
          </div>
          <div className="status-right">
            <span>Last update: {gridData[0]?.time ?? '13:33:11'}</span>
          </div>
        </>
      ),
      body: <SummaryPanel data={summaryData} />,
    };
  }

  const topPeriods = ['5D', '1M', '6M', '1Y'];
  const bottomPeriods = [
    { label: '30D', value: 30 },
    { label: '90D', value: 90 },
    { label: '6M', value: 180 },
    { label: '1Y', value: 365 },
  ];

  return {
    toolbar: (
      <>
        <div className="seg-group">
          {topPeriods.map((label) => (
            <button
              key={label}
              className={`seg-btn ${chartTopPeriod === label ? 'is-on' : ''}`}
              onClick={() => onChartTopPeriodChange(label)}
            >
              {label}
            </button>
          ))}
        </div>
        <button className="toolbar-btn">ƒx</button>
        <button className="toolbar-btn">⌁</button>
        <button className="toolbar-btn">∿</button>
        <button className="toolbar-btn">⚙</button>
        <div className="toolbar-field">Overlay <span className="muted">Volatility ▾</span></div>
        <div className="toolbar-spacer"></div>
        <span className="toolbar-label">Canonical chart-type toolbar row</span>
      </>
    ),
    bottomStrip: (
      <>
        <span className="toolbar-label">Area</span>
        <div className="seg-group">
          {bottomPeriods.map((item) => (
            <button
              key={item.label}
              className={`seg-btn ${chartBottomPeriod === item.value ? 'is-on' : ''}`}
              onClick={() => onChartBottomPeriodChange(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <button className="status-chip">YTD</button>
        <button className="status-chip">All</button>
        <button className="status-chip">1m</button>
        <div className="toolbar-field">Custom <span className="muted">▾</span></div>
        <div className="toolbar-spacer"></div>
        <span className="toolbar-label">Bottom strip variation</span>
      </>
    ),
    statusbar: (
      <>
        <div className="status-left">
          <span>Focused panel state</span>
          <span>Right vertical rail enabled</span>
        </div>
        <div className="status-right">
          <span>Crosshair: Off</span>
          <span>Resolution: Daily</span>
        </div>
      </>
    ),
    body: <ChartPanel period={chartBottomPeriod} key={`${chartTopPeriod}-${chartBottomPeriod}-${chartSummary.last}`} />,
  };
}
