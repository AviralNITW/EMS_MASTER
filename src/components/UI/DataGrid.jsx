import React, { useState } from 'react';

const DataGrid = ({ columns, data, onRowClick }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [filterText, setFilterText] = useState('');

  // Sorting
  const sortedData = React.useMemo(() => {
    let sortableItems = [...data];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  // Filtering
  const filteredData = sortedData.filter(item => {
    return Object.values(item).some(val => 
      String(val).toLowerCase().includes(filterText.toLowerCase())
    );
  });

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="w-full flex flex-col space-y-4">
      <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-gray-200 dark:border-white/5 shadow-lg">
        <input 
          type="text" 
          placeholder="Search records..." 
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="bg-transparent border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-primary transition-colors w-64"
        />
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Showing {filteredData.length} records</span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-white/10 bg-card shadow-2xl">
        <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
          <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-white/[0.02] border-b border-gray-200 dark:border-white/10">
            <tr>
              {columns.map((col, idx) => (
                <th 
                  key={idx} 
                  className="px-6 py-4 font-medium cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors"
                  onClick={() => requestSort(col.accessor)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{col.header}</span>
                    {sortConfig.key === col.accessor && (
                      <span className="text-primary text-[10px]">
                        {sortConfig.direction === 'ascending' ? '▲' : '▼'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                  No records found
                </td>
              </tr>
            ) : (
              filteredData.map((row, rowIdx) => (
                <tr 
                  key={row._id || row.id || rowIdx} 
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`border-b border-gray-200 dark:border-white/5 hover:bg-white/[0.02] transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="px-6 py-4 whitespace-nowrap">
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataGrid;
