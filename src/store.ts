import { create } from 'zustand';

export interface WindowState {
  id: string;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  zIndex: number;
  isActive: boolean;
  type: 'watchlist' | 'news';
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

interface TerminalStore {
  activeWorkspace: string;
  workspaces: WorkspaceState[];
  marketFeed: MarketItem[];
  gridData: GridItem[];
  focusWindow: (id: string) => void;
  updateWindowPosition: (id: string, x: number, y: number) => void;
  updateWindowSize: (id: string, w: number, h: number) => void;
  setWorkspace: (workspaceId: string) => void;
  tickData: () => void;
}

const oilWorkspace: WorkspaceState = {
  id: 'oil',
  label: 'Oil Overview',
  desktop: 'OIL OVERVIEW',
  windows: [
    { id: 'win-1', title: 'Watchlist - Main', x: 24, y: 54, w: 560, h: 378, zIndex: 10, isActive: true, type: 'watchlist' },
    { id: 'win-2', title: 'Market News', x: 610, y: 54, w: 570, h: 328, zIndex: 5, isActive: false, type: 'news' },
    { id: 'win-3', title: 'Watchlist - Secondary', x: 24, y: 450, w: 826, h: 380, zIndex: 4, isActive: false, type: 'watchlist' }
  ]
};

const ukWorkspace: WorkspaceState = {
  id: 'uk',
  label: 'UK Markets Overview',
  desktop: 'UK MARKETS OVERVIEW',
  windows: [
    { id: 'uk-win-1', title: 'FTSE 100', x: 24, y: 54, w: 400, h: 300, zIndex: 10, isActive: true, type: 'watchlist' },
    { id: 'uk-win-2', title: 'UK Market News', x: 450, y: 54, w: 400, h: 300, zIndex: 5, isActive: false, type: 'news' }
  ]
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
  gridData: [
    { id: '1', symbol: 'VOD', desc: 'Vodafone Group Plc', last: 126.64, change: '-0.42', changePct: '-0.33%', spark: '41%', time: '13:33:11' },
    { id: '2', symbol: 'NHY', desc: 'Norsk Hydro ASA', last: 23.95, change: '-0.30', changePct: '-1.24%', spark: '33%', time: '13:21:45' },
    { id: '3', symbol: 'BP', desc: 'BP Plc', last: 339.85, change: '+2.52', changePct: '+0.75%', spark: '67%', time: '15:53:20' }
  ],
  
  focusWindow: (id) => set((state) => {
    const workspace = state.workspaces.find(w => w.id === state.activeWorkspace);
    if (!workspace) return state;
    
    return {
      workspaces: state.workspaces.map(w => {
        if (w.id !== state.activeWorkspace) return w;
        return {
          ...w,
          windows: w.windows.map(win => ({
            ...win,
            isActive: win.id === id,
            zIndex: win.id === id ? 20 : (win.zIndex === 20 ? 19 : win.zIndex)
          }))
        };
      })
    };
  }),

  setWorkspace: (workspaceId) => set({ activeWorkspace: workspaceId }),

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

    return { marketFeed: newMarket, gridData: newGrid };
  })
}));
