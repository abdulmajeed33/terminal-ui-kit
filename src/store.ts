import { create } from 'zustand';

export type WindowType = 'watchlist' | 'summary' | 'chart';
export type SummaryView = 'overview' | 'analytics' | 'estimates' | 'news';
export type WindowActionType = 'link' | 'pin' | 'notes' | 'annotate' | 'settings' | 'minimize' | 'maximize' | 'close';

export interface WindowMetaIndicator {
  label: string;
  liveDot?: boolean;
}

export interface WindowAction {
  type: WindowActionType;
  label: string;
  icon: string;
  isToggle?: boolean;
}

export interface ToolbarField {
  label: string;
  value: string;
}

export interface ChartSummary {
  last: string;
  delta: string;
  pct: string;
}

export interface WindowState {
  id: string;
  title: string;
  badge: string;
  x: number;
  y: number;
  w: number;
  h: number;
  zIndex: number;
  isActive: boolean;
  isMinimized?: boolean;
  isMaximized?: boolean;
  previousRect?: { x: number; y: number; w: number; h: number };
  type: WindowType;
  meta: WindowMetaIndicator[];
  actions: WindowAction[];
  actionStates?: Partial<Record<WindowActionType, boolean>>;
}

export interface WorkspaceState {
  id: string;
  label: string;
  desktop: string;
  windows: WindowState[];
}

export interface MarketItem {
  id: string;
  symbol: string;
  last: number;
  change: number;
  changePct: string;
  direction: 'up' | 'down';
}

export interface GridItem {
  id: string;
  symbol: string;
  desc: string;
  last: number;
  change: string;
  changePct: string;
  spark: string;
  time: string;
}

export interface SummaryData {
  name: string;
  desc: string;
  price: string;
  delta: string;
  deltaClass: 'up' | 'down' | '';
  keyData: { label: string; value: string }[];
  notes: string;
  peers: { name: string; price: string; change: string; ratio: string }[];
}

interface TerminalStore {
  activeWorkspace: string;
  workspaces: WorkspaceState[];
  marketFeed: MarketItem[];
  gridData: GridItem[];
  selectedWatchlistRowId: string;
  summaryView: SummaryView;
  chartTopPeriod: string;
  chartBottomPeriod: number;
  chartSummary: ChartSummary;
  summaryViews: Record<SummaryView, SummaryData>;
  focusWindow: (id: string) => void;
  updateWindowPosition: (id: string, x: number, y: number) => void;
  updateWindowSize: (id: string, w: number, h: number) => void;
  setWorkspace: (workspaceId: string) => void;
  setSelectedWatchlistRow: (id: string) => void;
  setSummaryView: (view: SummaryView) => void;
  setChartTopPeriod: (label: string) => void;
  setChartBottomPeriod: (period: number) => void;
  triggerWindowAction: (id: string, action: WindowActionType, bounds?: { width: number; height: number }) => void;
  tickData: () => void;
}

const baseWindowActions = {
  link: { type: 'link', label: 'Link', icon: '⛓', isToggle: true },
  pin: { type: 'pin', label: 'Pin', icon: '•', isToggle: true },
  notes: { type: 'notes', label: 'Notes', icon: '✎', isToggle: true },
  annotate: { type: 'annotate', label: 'Annotate', icon: '✎', isToggle: true },
  settings: { type: 'settings', label: 'Settings', icon: '⚙', isToggle: true },
  minimize: { type: 'minimize', label: 'Minimize', icon: '–' },
  maximize: { type: 'maximize', label: 'Maximize', icon: '□' },
  close: { type: 'close', label: 'Close', icon: '×' },
} as const satisfies Record<WindowActionType, WindowAction>;

const defaultGridData: GridItem[] = [
  { id: '1', symbol: 'VOD', desc: 'Vodafone Group Plc', last: 126.64, change: '-0.42', changePct: '-0.33%', spark: '41%', time: '13:33:11' },
  { id: '2', symbol: 'NHY', desc: 'Norsk Hydro ASA', last: 23.95, change: '-0.30', changePct: '-1.24%', spark: '33%', time: '13:21:45' },
  { id: '3', symbol: 'BP', desc: 'BP Plc', last: 339.85, change: '+2.52', changePct: '+0.75%', spark: '67%', time: '15:53:20' },
  { id: '4', symbol: 'BRT', desc: 'Brent Spot Indicator', last: 39.27, change: '-0.25', changePct: '-0.63%', spark: '48%', time: '16:07:33' },
  { id: '5', symbol: 'WTI', desc: 'WTI Spot Indicator', last: 36.69, change: '-0.15', changePct: '-0.40%', spark: '44%', time: '15:53:19' },
  { id: '6', symbol: 'GLDSPOT', desc: 'Gold Spot', last: 1692.87, change: '-1.91', changePct: '-0.11%', spark: '39%', time: '22:53:00' },
  { id: '7', symbol: 'ESZ', desc: 'S&P 500 E-Mini Futures', last: 3110.95, change: '+30.80', changePct: '+0.98%', spark: '74%', time: '10:53:20' },
  { id: '8', symbol: 'DAX', desc: 'DAX Index', last: 12423.05, change: '+403.14', changePct: '+3.34%', spark: '82%', time: '15:53:15' },
  { id: '9', symbol: 'EURUSD', desc: 'Euro / US Dollar', last: 1.122, change: '+0.0053', changePct: '+0.47%', spark: '61%', time: '15:53:11' },
  { id: '10', symbol: 'GBPUSD', desc: 'British Pound / US Dollar', last: 1.2582, change: '+0.0031', changePct: '+0.25%', spark: '57%', time: '15:53:09' },
  { id: '11', symbol: 'USDJPY', desc: 'US Dollar / Japanese Yen', last: 108.8, change: '+0.1340', changePct: '+0.12%', spark: '54%', time: '15:53:08' },
  { id: '12', symbol: 'US10Y', desc: 'US 10-Year Treasury Yield', last: 0.688, change: '-0.004', changePct: '-0.58%', spark: '36%', time: '13:34:10' },
];

const summaryViews: Record<SummaryView, SummaryData> = {
  overview: {
    name: 'Vodafone Group Plc',
    desc: 'Large telecommunications operator shown here as a reusable summary/info module template with flexible header, key data blocks, and peer comparison sections.',
    price: '126.64',
    delta: '-0.42   -0.33%',
    deltaClass: 'down',
    notes: 'Use this area for text summaries, earnings headlines, event logs, analyst synopsis, or module-specific overview commentary. The layout is intentionally generic so future modules can inherit the same chrome while swapping content types.',
    keyData: [
      { label: 'Country', value: 'United Kingdom' },
      { label: '52W High', value: '169.46' },
      { label: 'Sector', value: 'Telecom Services' },
      { label: '52W Low', value: '92.76' },
      { label: 'Market Cap', value: '30,254m' },
      { label: 'Dividend Yield', value: '3.42%' },
    ],
    peers: [
      { name: 'Telefónica SA', price: '3.92', change: '+9.18%', ratio: '0.94' },
      { name: 'Orange SA', price: '10.17', change: '-4.73%', ratio: '0.97' },
      { name: 'Deutsche Telekom AG', price: '13.64', change: '+0.76%', ratio: '1.13' },
      { name: 'Telecom Italia SpA', price: '0.33', change: '-11.54%', ratio: '0.89' },
    ],
  },
  analytics: {
    name: 'Analytics Snapshot',
    desc: 'This same shell can host KPI commentary, factor summaries, radar charts, or risk dashboards without changing the reusable window chrome.',
    price: '3.45',
    delta: '+0.18   +5.50%',
    deltaClass: 'up',
    notes: 'Analytics view demo: swap in model outputs, factor sensitivity commentary, trend notes, volatility narratives, or cross-sectional comparisons.',
    keyData: [
      { label: 'Momentum', value: 'Positive' },
      { label: 'Relative Perf', value: '+5.50%' },
      { label: 'Volatility', value: 'Medium' },
      { label: 'Trend Score', value: '72' },
      { label: 'Risk Bucket', value: 'Balanced' },
      { label: 'Signal', value: 'Accumulation' },
    ],
    peers: [
      { name: 'Telefónica SA', price: '3.92', change: '+2.11%', ratio: '0.88' },
      { name: 'Orange SA', price: '10.17', change: '+0.94%', ratio: '0.92' },
      { name: 'Deutsche Telekom AG', price: '13.64', change: '+1.42%', ratio: '1.07' },
      { name: 'Telecom Italia SpA', price: '0.33', change: '-0.72%', ratio: '0.81' },
    ],
  },
  estimates: {
    name: 'Consensus Estimates',
    desc: 'Estimate modules often need identical panel framing with slightly different body content. This template is structured to support that reuse.',
    price: '0.086',
    delta: '+0.004   +4.88%',
    deltaClass: 'up',
    notes: 'Estimates view demo: consensus tables, revisions, scenario commentary, and peer forecast deltas can sit inside the same summary card scaffolding.',
    keyData: [
      { label: 'EPS FY1', value: '0.086' },
      { label: 'Rev Growth', value: '4.88%' },
      { label: 'Net Margin', value: '11.2%' },
      { label: 'Dividend', value: '7.65%' },
      { label: 'Target Px', value: '141.00' },
      { label: 'Buy Ratio', value: '54%' },
    ],
    peers: [
      { name: 'Telefónica SA', price: '3.92', change: '+3.28%', ratio: '0.97' },
      { name: 'Orange SA', price: '10.17', change: '+1.45%', ratio: '1.01' },
      { name: 'Deutsche Telekom AG', price: '13.64', change: '+2.02%', ratio: '1.18' },
      { name: 'Telecom Italia SpA', price: '0.33', change: '-2.31%', ratio: '0.76' },
    ],
  },
  news: {
    name: 'Headline Feed Context',
    desc: 'News-oriented modules can reuse the same header, subtabs, card titles, and status bar while replacing only the content payload.',
    price: '17',
    delta: 'Items   Active',
    deltaClass: '',
    notes: 'News view demo: keep headline digest, event priority, and related company context inside the same standard panel structure for consistency.',
    keyData: [
      { label: 'Stories', value: '17' },
      { label: 'Priority', value: 'High' },
      { label: 'Sentiment', value: 'Mixed' },
      { label: 'Market', value: 'LSE' },
      { label: 'Entity', value: 'Vodafone' },
      { label: 'Alerts', value: '3' },
    ],
    peers: [
      { name: 'Earnings Release', price: '08:00', change: '+12', ratio: 'Evt' },
      { name: 'Guidance Change', price: '11:40', change: '+5', ratio: 'Evt' },
      { name: 'Regulatory Review', price: '13:15', change: '-2', ratio: 'Evt' },
      { name: 'Analyst Action', price: '15:05', change: '+8', ratio: 'Evt' },
    ],
  },
};

const oilWorkspace: WorkspaceState = {
  id: 'oil',
  label: 'Oil Overview',
  desktop: 'OIL OVERVIEW',
  windows: [
    {
      id: 'win-1',
      title: 'Watchlist - Standard Template',
      badge: 'list',
      x: 24,
      y: 54,
      w: 560,
      h: 378,
      zIndex: 2,
      isActive: false,
      type: 'watchlist',
      meta: [{ label: 'Realtime', liveDot: true }],
      actions: [baseWindowActions.link, baseWindowActions.pin, baseWindowActions.minimize, baseWindowActions.maximize, baseWindowActions.close],
      actionStates: { link: false, pin: false },
    },
    {
      id: 'win-2',
      title: 'Company Overview - Standard Template',
      badge: 'info',
      x: 610,
      y: 54,
      w: 570,
      h: 328,
      zIndex: 3,
      isActive: false,
      type: 'summary',
      meta: [{ label: 'Primary' }, { label: 'GBP' }],
      actions: [baseWindowActions.link, baseWindowActions.notes, baseWindowActions.minimize, baseWindowActions.maximize, baseWindowActions.close],
      actionStates: { link: false, notes: false },
    },
    {
      id: 'win-3',
      title: 'Brent Spot Indicator - Chart Template',
      badge: 'chart',
      x: 270,
      y: 236,
      w: 826,
      h: 420,
      zIndex: 5,
      isActive: true,
      type: 'chart',
      meta: [{ label: 'Last 39.27' }, { label: 'Live', liveDot: true }],
      actions: [baseWindowActions.annotate, baseWindowActions.settings, baseWindowActions.minimize, baseWindowActions.maximize, baseWindowActions.close],
      actionStates: { annotate: false, settings: false },
    },
  ],
};

const ukWorkspace: WorkspaceState = {
  id: 'uk',
  label: 'UK Markets Overview',
  desktop: 'UK MARKETS OVERVIEW',
  windows: [
    {
      id: 'uk-win-1',
      title: 'FTSE 100 Watchlist',
      badge: 'list',
      x: 24,
      y: 54,
      w: 560,
      h: 378,
      zIndex: 2,
      isActive: false,
      type: 'watchlist',
      meta: [{ label: 'Realtime', liveDot: true }],
      actions: [baseWindowActions.link, baseWindowActions.pin, baseWindowActions.minimize, baseWindowActions.maximize, baseWindowActions.close],
      actionStates: { link: false, pin: false },
    },
    {
      id: 'uk-win-2',
      title: 'UK Market Overview',
      badge: 'info',
      x: 610,
      y: 54,
      w: 570,
      h: 328,
      zIndex: 3,
      isActive: false,
      type: 'summary',
      meta: [{ label: 'Primary' }, { label: 'GBP' }],
      actions: [baseWindowActions.link, baseWindowActions.notes, baseWindowActions.minimize, baseWindowActions.maximize, baseWindowActions.close],
      actionStates: { link: false, notes: false },
    },
    {
      id: 'uk-win-3',
      title: 'FTSE Chart Template',
      badge: 'chart',
      x: 270,
      y: 236,
      w: 826,
      h: 420,
      zIndex: 5,
      isActive: true,
      type: 'chart',
      meta: [{ label: 'Last 6369.04' }, { label: 'Live', liveDot: true }],
      actions: [baseWindowActions.annotate, baseWindowActions.settings, baseWindowActions.minimize, baseWindowActions.maximize, baseWindowActions.close],
      actionStates: { annotate: false, settings: false },
    },
  ],
};

export const useTerminalStore = create<TerminalStore>((set) => ({
  activeWorkspace: 'oil',
  workspaces: [oilWorkspace, ukWorkspace],
  marketFeed: [
    { id: 'm1', symbol: 'SP500', last: 3110.95, change: 0.98, changePct: '+0.5%', direction: 'up' },
    { id: 'm2', symbol: 'BRENT', last: 39.27, change: -0.63, changePct: '-1.4%', direction: 'down' },
    { id: 'm3', symbol: 'DAX', last: 12423.05, change: 1.01, changePct: '+1.1%', direction: 'up' },
    { id: 'm4', symbol: 'WTI', last: 36.69, change: -0.40, changePct: '-0.3%', direction: 'down' }
  ],
  gridData: defaultGridData,
  selectedWatchlistRowId: '1',
  summaryView: 'overview',
  chartTopPeriod: '6M',
  chartBottomPeriod: 180,
  chartSummary: { last: '39.27', delta: '-0.25', pct: '-0.63%' },
  summaryViews,
  
  focusWindow: (id) => set((state) => {
    const workspace = state.workspaces.find(w => w.id === state.activeWorkspace);
    if (!workspace) return state;
    const highestZ = Math.max(...workspace.windows.map((win) => win.zIndex), 0) + 1;
    
    return {
      workspaces: state.workspaces.map(w => {
        if (w.id !== state.activeWorkspace) return w;
        return {
          ...w,
          windows: w.windows.map(win => ({
            ...win,
            isActive: win.id === id,
            zIndex: win.id === id ? highestZ : win.zIndex,
          }))
        };
      })
    };
  }),

  setWorkspace: (workspaceId) => set({ activeWorkspace: workspaceId }),
  setSelectedWatchlistRow: (id) => set({ selectedWatchlistRowId: id }),
  setSummaryView: (view) => set({ summaryView: view }),
  setChartTopPeriod: (label) => set({ chartTopPeriod: label }),
  setChartBottomPeriod: (period) => set({ chartBottomPeriod: period }),

  updateWindowSize: (id, width, height) => set((state) => ({
    workspaces: state.workspaces.map((workspace) => {
      if (workspace.id !== state.activeWorkspace) return workspace;
      return {
        ...workspace,
        windows: workspace.windows.map((win) =>
          win.id === id ? { ...win, w: width, h: height } : win
        )
      };
    })
  })),

  updateWindowPosition: (id, x, y) => set((state) => ({
    workspaces: state.workspaces.map(w => {
      if (w.id !== state.activeWorkspace) return w;
      return {
        ...w,
        windows: w.windows.map(win => 
          win.id === id ? { ...win, x, y } : win
        )
      };
    })
  })),

  triggerWindowAction: (id, action, bounds) => set((state) => ({
    workspaces: state.workspaces.map((workspace) => {
      if (workspace.id !== state.activeWorkspace) return workspace;

      return {
        ...workspace,
        windows: workspace.windows.flatMap((win) => {
          if (win.id !== id) return [win];

          if (action === 'close') return [];

          if (action === 'maximize') {
            if (win.isMaximized && win.previousRect) {
              return [{
                ...win,
                isMaximized: false,
                previousRect: undefined,
                isMinimized: false,
                ...win.previousRect,
              }];
            }

            if (!bounds) return [win];

            return [{
              ...win,
              isMaximized: true,
              isMinimized: false,
              previousRect: { x: win.x, y: win.y, w: win.w, h: win.h },
              x: 0,
              y: 0,
              w: bounds.width,
              h: bounds.height,
            }];
          }

          if (action === 'minimize') {
            return [{
              ...win,
              isMinimized: !win.isMinimized,
            }];
          }

          if (action === 'link' || action === 'pin' || action === 'notes' || action === 'annotate' || action === 'settings') {
            return [{
              ...win,
              actionStates: {
                ...win.actionStates,
                [action]: !win.actionStates?.[action],
              },
            }];
          }

          return [win];
        }),
      };
    }),
  })),

  tickData: () => set((state) => {
    const newMarket = state.marketFeed.map(item => {
      const shake = (Math.random() - 0.5) * 2;
      const newLast = item.last + shake;
      return {
        ...item,
        last: parseFloat(newLast.toFixed(2)),
        change: parseFloat((item.change + shake).toFixed(2)),
        direction: shake >= 0 ? 'up' : 'down' as 'up' | 'down'
      };
    });

    const newGrid = state.gridData.map(item => {
      const shake = (Math.random() - 0.5) * 1.5;
      const newLast = item.last + shake;
      const sparkNum = parseInt(item.spark) + (Math.random() > 0.5 ? 5 : -5);
      return {
        ...item,
        last: parseFloat(newLast.toFixed(2)),
        change: (parseFloat(item.change) + shake).toFixed(2),
        spark: Math.max(0, Math.min(100, sparkNum)) + '%',
        time: new Date().toLocaleTimeString('en-US', { hour12: false })
      };
    });

    const leadItem = newGrid.find((item) => item.symbol === 'BRT');

    return {
      marketFeed: newMarket,
      gridData: newGrid,
      chartSummary: leadItem
        ? {
            last: leadItem.last.toFixed(2),
            delta: leadItem.change,
            pct: leadItem.changePct,
          }
        : state.chartSummary,
    };
  })
}));
