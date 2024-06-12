import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import { Header, PopOut } from "../../components"
import axios from 'axios';
import API_BASE_URL from '../../config';
import './suppliers.css';

export const Suppliers = () => {
  // const navigate = useNavigate();

  const initialContents = [
    {
      "showed_attr": "編號",
      "attr": "id",
      "required": true,
      "display": true,
      "data": null,
      "edit": {
        "visible": true,
        "disable": true,
        "entry_type": "entry"
      },
      "create": {
        "visible": false,
        "disable": false,
        "entry_type": "entry"
      }
    },
    {
      "showed_attr": "供應商名稱",
      "attr": "name",
      "required": true,
      "display": true,
      "data": null,
      "edit": {
        "visible": true,
        "disable": false,
        "entry_type": "entry"
      },
      "create": {
        "visible": true,
        "disable": false,
        "entry_type": "entry"
      }
    },
    {
      "showed_attr": "統一編號",
      "attr": "tax_id",
      "required": false,
      "display": true,
      "data": null,
      "edit": {
        "visible": true,
        "disable": false,
        "entry_type": "entry"
      },
      "create": {
        "visible": true,
        "disable": false,
        "entry_type": "entry"
      }
    },
    {
      "showed_attr": "聯絡人",
      "attr": "contact_person",
      "required": true,
      "display": true,
      "data": null,
      "edit": {
        "visible": true,
        "disable": false,
        "entry_type": "entry"
      },
      "create": {
        "visible": true,
        "disable": false,
        "entry_type": "entry"
      }
    },
    {
      "showed_attr": "電話",
      "attr": "phone",
      "required": true,
      "display": true,
      "data": null,
      "edit": {
        "visible": true,
        "disable": false,
        "entry_type": "entry"
      },
      "create": {
        "visible": true,
        "disable": false,
        "entry_type": "entry"
      }
    },
    {
      "showed_attr": "Email",
      "attr": "email",
      "required": false,
      "display": true,
      "data": null,
      "edit": {
        "visible": true,
        "disable": false,
        "entry_type": "entry"
      },
      "create": {
        "visible": true,
        "disable": false,
        "entry_type": "entry"
      }
    }
  ]
  const [contents, setContents] = useState(initialContents);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [searchCategory, setSearchCategory] = useState("");
  var last_updated = null;
  
  const result_limit = 25;

  const checkUpdate = async () => {
    console.log("checking for update...");
    axios.get(`${API_BASE_URL}/db/last_updated/supplier`, {
      headers: {
        "ngrok-skip-browser-warning": 1
      }
    }).then(response => {
      if(last_updated === null || response.data.time > last_updated){
        last_updated = response.data.time;
        fetchSuppliers();
        setError(null);
      }
      setError(false);
      setLoading(false);
    }).catch(error => {
      console.error("There was an error fetching the data!", error);
      setError(error);
    });
    
  }

  const fetchSuppliers = async () => {
    console.log("Fetching data from API...");
    axios.get(`${API_BASE_URL}/db/suppliers`, {
      headers: {
        "ngrok-skip-browser-warning": 1
      }
    }).then(response => {
        console.log("Data fetched successfully:", response);
        setSuppliers(Object.values(response.data));
        setLoading(false);
        setError(null);
      }).catch(error => {
        console.error("There was an error fetching the data!", error);
        setError(error);
        setLoading(false);
    });
  }

  useEffect(() => {
    checkUpdate();
    const interval = setInterval(() => {
      checkUpdate();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleRowClick = (index) => {
    setSelectedRow(index);
  }

  const clostEditPopOut = () => {
    setShowEdit(false);
  }

  const handleEditClick = () => {
    const updatedContents = contents.map((content, idx) => ({
      ...content,
      data: filteredContents[selectedRow][content.attr]
    }));
    setContents(updatedContents);
    setShowEdit(true);
  }

  const handleEditSubmit = async (inputData) => {
    var update_json = {};
    for(const content of inputData){
      if(content.data === ""){
        update_json[content.attr] = null;
        }else{
        update_json[content.attr] = content.data;          
      }
    }
    console.log("handle edit:", update_json);
    try {
      await axios.put(`${API_BASE_URL}/db/suppliers/${update_json.id}`, update_json, {
        headers: {
          'Content-Type': 'application/json',
          "ngrok-skip-browser-warning": 1
        }});
      checkUpdate();
      setShowEdit(false);
    } catch (error) {
      console.error('Update failed', error);
    }
  }

  const clostCreatePopOut = () => {
    setShowCreate(false);
  }

  const handleCreateClick = () => {
    setShowCreate(true);
  }

  const handleCreateSubmit = async (inputData) => {
    var create_json = {};
    for(const content of inputData){
      if(content.data === ""){
        create_json[content.attr] = null;
        }else{
          create_json[content.attr] = content.data;          
      }
    }
    console.log("handle create:", create_json);
    try {
      await axios.post(`${API_BASE_URL}/db/suppliers`, create_json, {
        headers: {
          'Content-Type': 'application/json',
          "ngrok-skip-browser-warning": 1
        }});
      checkUpdate();
      setShowCreate(false);
    } catch (error) {
      console.error('Create failed', error);
    }
  }

  const handleSearchInputChange = (event) => {
    setSelectedRow(null);
    setPage(0);
    setSearchTerm(event.target.value);
  }

  const filteredContents = suppliers.filter((supplier) => (
    searchTerm === "" ? (true) : (
      searchCategory === "" ? (
        Object.entries(supplier).some(([key, value]) =>
          contents.some(content => content.attr === key && content.display) && value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      ) : (
        supplier[searchCategory] && supplier[searchCategory].toString().toLowerCase().includes(searchTerm)
      ))
    )
  );


  return (
    <div className='page_main_box'>
      <Header />
      <div className='page_content'>
        <div className='function_bar_container'>
          <div className='empty_bar_container'>
            {/* <button >新增</button> */}
          </div>
          <div className='search_bar_container'>
            <input
              className='search_bar'
              placeholder="Search Content"
              value={searchTerm}
              onChange={handleSearchInputChange}
            />
            {searchTerm && <span class="material-symbols-outlined search_cancel_btn" onClick={() => {setSearchTerm("")}}>cancel</span>}
          </div>
          <div className='content_drop_down_container'>
            <select onChange={(e) => {setSearchCategory(e.target.value)}}>
              <option value="">---篩選器---</option>
              {contents.map((data, index) => (
                  data.display && <option value={data.attr}>{data.showed_attr}</option>
              ))}
            </select>
          </div>
          <div className='button_container'>
            <button disabled={selectedRow === null} onClick={() => {handleEditClick()}}>編輯</button>
            <button onClick={() => {handleCreateClick()}}>新增</button>
          </div>
        </div>
        <div className='list_container'>
          <div className='page_control_container'>
          {(page > 0) && <span class="material-symbols-outlined" onClick={() => {setPage(page-1)}}>arrow_back_ios</span>}
          <p>{`${page*result_limit}-${Math.min((page + 1)*result_limit, filteredContents.length)} / ${filteredContents.length}筆資料`}</p>
          {(page >=0 && page < (filteredContents.length/result_limit)-1) && <span class="material-symbols-outlined" onClick={() => {setPage(page+1)}}>arrow_forward_ios</span>}
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
                          content.display && <td>{data[content.attr]}</td>
                        ))}
                      </tr>
                    )
                  ))}
                </tbody>
              
            </table>
          )}
          {loading && <p>資料載入中...</p>}
          {showEdit && <PopOut popOutType="edit" dataType="供應商" contents={contents} close={clostEditPopOut} submit_func={handleEditSubmit}/>}
          {showCreate && <PopOut popOutType="create" dataType="供應商" contents={contents} close={clostCreatePopOut} submit_func={handleCreateSubmit}/>}
        </div>
      </div>
    </div>
  );
}

export default Suppliers;
