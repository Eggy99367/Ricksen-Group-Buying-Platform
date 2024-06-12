import React from 'react';
import './listContainer.css'

export const ListContainer = ({ contents, filteredContents, handleRowClick, selectedRow, page, setPage, result_limit, error, loading }) => {
  return (
    <div className='list_container'>
      <div className='page_control_container'>
        {(page > 0) && <span className="material-symbols-outlined no_select" onClick={() => { setPage(page - 1) }}>arrow_back_ios</span>}
        <p className='no_select'>{`${page * result_limit}-${Math.min((page + 1) * result_limit, filteredContents.length)} / ${filteredContents.length}筆資料`}</p>
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
            {filteredContents.map((data, index) => (
              (page * result_limit <= index && index < (page + 1) * result_limit) && (
                <tr
                  key={index}
                  onClick={() => handleRowClick(index)}
                  className={selectedRow === index ? 'selected' : ''}
                >
                  {contents.map((content, index) => (
                    content.display && <td key={index}>{data[content.attr]}</td>
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
