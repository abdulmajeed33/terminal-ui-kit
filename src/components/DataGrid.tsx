export interface DataGridColumn {
    key: string;
    label: string;
    width?: string;
}

interface DataGridProps<T extends { id: string }> {
    columns: DataGridColumn[];
    data: T[];
    selectedId?: string;
    onRowClick?: (id: string) => void;
}

export function DataGrid<T extends { id: string }>({ columns, data, selectedId, onRowClick }: DataGridProps<T>) {
    return (
        <div className="table-layout body-fill">
            <div className="grid-wrap">
                <table className="grid-table">
                    <thead>
                        <tr>
                            {columns.map((col) => (
                                <th key={col.key} style={{ width: col.width || 'auto' }}>
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row) => (
                            <tr
                                key={row.id}
                                className={row.id === selectedId ? 'is-selected' : ''}
                                onClick={() => onRowClick?.(row.id)}
                                style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                            >
                                {columns.map((col) => {
                                    const value = row[col.key as keyof T];

                                    let tdClass = '';
                                    if (col.key === 'symbol') tdClass = 'symbol';
                                    if (col.key === 'time') tdClass = 'time';
                                    if (col.key === 'spark') tdClass = 'spark-cell';

                                    let colorClass = '';
                                    if (typeof value === 'string' && value.startsWith('+')) colorClass = 'pos';
                                    if (typeof value === 'string' && value.startsWith('-')) colorClass = 'neg';
                                    if (typeof value === 'number' && value > 0) colorClass = 'pos';
                                    if (typeof value === 'number' && value < 0) colorClass = 'neg';

                                    return (
                                        <td key={col.key} className={`${tdClass} ${colorClass}`.trim()}>
                                            {col.key === 'spark' ? (
                                                <div
                                                    className={`spark-bar ${row.id === '1' || row.id === '2' ? 'neg' : ''}`}
                                                    style={{ '--w': value } as React.CSSProperties}
                                                ></div>
                                            ) : (
                                                String(value ?? '')
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
