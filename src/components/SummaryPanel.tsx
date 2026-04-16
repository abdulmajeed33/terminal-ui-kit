export type SummaryView = 'overview' | 'analytics' | 'estimates' | 'news';

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

interface SummaryPanelProps {
  data: SummaryData;
}

export function SummaryPanel({ data }: SummaryPanelProps) {
  return (
    <div className="summary-layout body-fill">
      <div className="summary-header">
        <div className="summary-headline">
          <div>
            <div className="summary-name">{data.name}</div>
            <div className="summary-subtext">{data.desc}</div>
          </div>
          <div className="summary-price">
            <div className="big">{data.price}</div>
            <div className={`delta ${data.deltaClass}`.trim()}>{data.delta}</div>
          </div>
        </div>
      </div>

      <div className="summary-grid">
        <div className="info-card">
          <h4>Key Data</h4>
          <div className="card-body">
            <div className="kv-grid">
              {data.keyData.map((item) => (
                <div key={item.label} className="kv-item">
                  <div className="k">{item.label}</div>
                  <div className="v">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="info-card">
          <h4>Performance Notes</h4>
          <div className="card-body">{data.notes}</div>
        </div>

        <div className="info-card summary-peers">
          <h4>Peers / Comparison</h4>
          <div className="card-body">
            {data.peers.map((peer) => (
              <div key={peer.name} className="peer-row">
                <span>{peer.name}</span>
                <span>{peer.price}</span>
                <span className={peer.change.startsWith('+') ? 'up' : 'down'}>{peer.change}</span>
                <span>{peer.ratio}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
