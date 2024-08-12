import React from 'react';
import './listContainer.css';

// Function to format numbers with commas
const formatCash = (num) => {
  if (num == null) return '';
  if (typeof num !== 'number') {
    const parsedNum = parseFloat(num);
    if (isNaN(parsedNum)) return num;
    return parsedNum.toLocaleString();
  }
  return num.toLocaleString();
};

export const ListContainer = ({ contents, filteredContents, handleRowClick, selectedRow, page, setPage, result_limit, error, loading, listContainerRef }) => {
  return (
    <div className='list_container' ref={listContainerRef}>
      <div className='page_control_container'>
        {(page > 0) && <span className="material-symbols-outlined no_select" onClick={() => { setPage(page - 1) }}>arrow_back_ios</span>}
        <p className='no_select'>{`${Math.min(page * result_limit + 1, filteredContents.length)}-${Math.min((page + 1) * result_limit, filteredContents.length)} / ${filteredContents.length}筆資料`}</p>
        {(page >= 0 && page < (filteredContents.length / result_limit) - 1) && <span className="material-symbols-outlined no_select" onClick={() => { setPage(page + 1) }}>arrow_forward_ios</span>}
      </div>
      {error ? (<p>Network Error...</p>) : (
        <table>
          <thead>
            <tr>
              {contents.map((data, index) => (
                data.display && <th key={index}>{data.showed_attr}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredContents.map((data, rowIndex) => (
              (page * result_limit <= rowIndex && rowIndex < (page + 1) * result_limit) && (
                <tr
                  key={rowIndex}
                  onClick={() => handleRowClick(rowIndex)}
                  className={selectedRow === rowIndex ? 'selected' : ''}
                >
                  {contents.map((content, colIndex) => (
                    content.display && (
                      ("omit" in content && data[content.attr]) ? (
                        <td key={colIndex}>{content.omit}</td>
                      ) : (
                        <td key={colIndex}>
                          {content.is_cost
                            ? formatCash(data[content.attr])
                            : data[content.attr]}
                        </td>
                      )
                    )
                  ))}
                </tr>
              )
            ))}
          </tbody>
        </table>
      )}
      {loading && <p>資料載入中...</p>}
    </div>
  );
};

export default ListContainer;
