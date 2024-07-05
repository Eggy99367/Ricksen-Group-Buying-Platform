import React from 'react';
import './functionBar.css'

export const FunctionBar = ({ searchTerm,
                              pageTitle="",
                              handleSearchInputChange,
                              setSearchTerm,
                              setSearchCategory,
                              handleEditClick=null,
                              handleCreateClick=null,
                              handleStockingClick=null,
                              selectedRow,
                              contents,
                              noEdit=false,
                              noCreate=false,
                              stocking=false }) => {

  return (
    <div className='function_bar_container'>
      <div className='empty_bar_container'>
        <h2>{pageTitle}</h2>
      </div>
      <div className='search_bar_container'>
        <input
          className='search_bar'
          placeholder="搜尋"
          onChange={handleSearchInputChange}
        />
        {searchTerm && <span className="material-symbols-outlined search_cancel_btn" onClick={() => setSearchTerm('')}>cancel</span>}
      </div>
      <div className='content_drop_down_container'>
        <select onChange={(e) => setSearchCategory(e.target.value)}>
          <option value="">---篩選器---</option>
          {contents.map((data, index) => (
            data.display && <option key={index} value={data.attr}>{data.showed_attr}</option>
          ))}
        </select>
      </div>
      <div className='button_container'>
        {!noEdit && <button disabled={selectedRow === null} onClick={handleEditClick}>編輯</button>}
        {!noCreate && <button onClick={handleCreateClick}>新增</button>}
        {stocking && <button onClick={handleStockingClick}>入庫</button>}
      </div>
    </div>
  );
};

export default FunctionBar;
