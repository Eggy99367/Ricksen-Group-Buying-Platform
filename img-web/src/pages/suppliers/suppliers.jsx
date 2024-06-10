import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import { Header, PopOut } from "../../components"
import axios from 'axios';
import API_BASE_URL from '../../config';
import './suppliers.css';

export const Suppliers = () => {
  // const navigate = useNavigate();

  const initialContents = [
    {"showed_attr_name": "編號", "attr_name": "id", "required": true, "data": null, "edit": {"visible": false, "disable": true, "entry_type": "entry"}, "create": {"visible": true, "disable": false, "entry_type": "entry"}},
    {"showed_attr_name": "供應商名稱", "attr_name": "name", "required": true, "data": null, "edit": {"visible": true, "disable": false, "entry_type": "entry"}, "create": {"visible": true, "disable": false, "entry_type": "entry"}},
    {"showed_attr_name": "統一編號", "attr_name": "tax_id", "required": false, "data": null, "edit": {"visible": true, "disable": false, "entry_type": "entry"}, "create": {"visible": true, "disable": false, "entry_type": "entry"}},
    {"showed_attr_name": "聯絡人", "attr_name": "contact_person", "required": true, "data": null, "edit": {"visible": true, "disable": false, "entry_type": "entry"}, "create": {"visible": true, "disable": false, "entry_type": "entry"}},
    {"showed_attr_name": "電話", "attr_name": "phone", "required": true, "data": null, "edit": {"visible": true, "disable": false, "entry_type": "entry"}, "create": {"visible": true, "disable": false, "entry_type": "entry"}},
    {"showed_attr_name": "Email", "attr_name": "email", "required": false, "data": null, "edit": {"visible": true, "disable": false, "entry_type": "entry"}, "create": {"visible": true, "disable": false, "entry_type": "entry"}}
  ]
  const [contents, setContents] = useState(initialContents);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  var last_updated = null;
  
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
      data: suppliers[selectedRow][content.attr_name]
    }));
    setContents(updatedContents);
    setShowEdit(true);
  }

  const handleEditSubmit = async (inputData) => {
    var update_json = {};
    for(const content of inputData){
      if(content.data === ""){
        update_json[content.attr_name] = null;
        }else{
        update_json[content.attr_name] = content.data;          
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
        create_json[content.attr_name] = null;
        }else{
          create_json[content.attr_name] = content.data;          
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

  return (
    <div className='page_main_box'>
      <Header />
      <div className='page_content'>
        <div className='function_bar_container'>
          <div className='empty_bar_container'>
            {/* <button >新增</button> */}
          </div>
          <div className='search_bar_container'>
            <input placeholder="Search Content" />
          </div>
          <div className='button_container'>
            <button disabled={selectedRow === null} onClick={() => {handleEditClick()}}>編輯</button>
            <button onClick={() => {handleCreateClick()}}>新增</button>
          </div>
        </div>
        <div className='list_container'>
          {error ? (<p>Network Error...</p>) : (
            <table>
              <thead>
              <tr>
                {contents.map((data, index) => (
                  <th key={index}>{data.showed_attr_name}</th>
                ))}
              </tr>
              </thead>
                <tbody>
                  {suppliers.map((data, index) => (
                    <tr 
                      key={index}
                      onClick={() => handleRowClick(index)}
                      className={selectedRow === index ? 'selected' : ''}
                    >
                      <td>{data.id}</td>
                      <td>{data.name}</td>
                      <td>{data.tax_id}</td>
                      <td>{data.contact_person}</td>
                      <td>{data.phone}</td>
                      <td>{data.email}</td>
                    </tr>
                  ))}
                </tbody>
              
            </table>
          )}
          {loading && <p>資料載入中...</p>}
        </div>
      </div>
      {showEdit && <PopOut popOutType="edit" dataType="供應商" contents={contents} close={clostEditPopOut} submit_func={handleEditSubmit}/>}
      {showCreate && <PopOut popOutType="create" dataType="供應商" contents={contents} close={clostCreatePopOut} submit_func={handleCreateSubmit}/>}
    </div>
  );
}

export default Suppliers;
