import React from 'react';
import './functionBar.css'

export const FunctionBar = ({ searchTerm,
                              pageTitle="",
                              handleSearchInputChange,
                              setSearchTerm,
                              setSearchCategory,
                              handleImageClick=null,
                              handleEditClick=null,
                              handleCreateClick=null,
                              handleSpecialClick=null,
                              selectedRow,
                              contents,
                              noImage=true,
                              noEdit=false,
                              noCreate=false,
                              special=false,
                              special_disable=false,
                              special_text="" }) => {
  
  return (
    <div className='function_bar_container'>
      <div className='empty_bar_container'>
        <h2>{pageTitle}</h2>
      </div>
      <div className='search_bar_container'>
        <input
          className='search_bar'
          value={searchTerm}
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
        {!noImage && <button disabled={selectedRow === null} onClick={handleImageClick}>預覽圖片</button>}
        {!noEdit && <button disabled={selectedRow === null} onClick={handleEditClick}>編輯</button>}
        {!noCreate && <button onClick={handleCreateClick}>新增</button>}
        {special && <button disabled={special_disable} onClick={handleSpecialClick}>{special_text}</button>}
      </div>
    </div>
  );
};

export default FunctionBar;
