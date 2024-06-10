import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import Header from "../../components/header/header"
import { Header, EditPopOut } from "../../components"
import axios from 'axios';
import API_BASE_URL from '../../config';
import './suppliers.css';

export const Suppliers = () => {
  const navigate = useNavigate();

  // const contents = [["編號", "id"], ["供應商名稱", "name"], ["統一編號", "tax_id"], ["聯絡人", "contact_person"], ["電話", "phone"], ["Email", "email"]]
  const initialContents = [
    {"showed_attr_name": "編號", "attr_name": "id", "required": true, "data": null, "edit_state": {"visible": true, "disable": true, "entry_type": "entry"}, "create_state": {"visible": true, "disable": false, "entry_type": "entry"}},
    {"showed_attr_name": "供應商名稱", "attr_name": "name", "required": true, "data": null, "edit_state": {"visible": true, "disable": false, "entry_type": "entry"}, "create_state": {"visible": true, "disable": false, "entry_type": "entry"}},
    {"showed_attr_name": "統一編號", "attr_name": "tax_id", "required": false, "data": null, "edit_state": {"visible": true, "disable": false, "entry_type": "entry"}, "create_state": {"visible": true, "disable": false, "entry_type": "entry"}},
    {"showed_attr_name": "聯絡人", "attr_name": "contact_person", "required": true, "data": null, "edit_state": {"visible": true, "disable": false, "entry_type": "entry"}, "create_state": {"visible": true, "disable": false, "entry_type": "entry"}},
    {"showed_attr_name": "電話", "attr_name": "phone", "required": true, "data": null, "edit_state": {"visible": true, "disable": false, "entry_type": "entry"}, "create_state": {"visible": true, "disable": false, "entry_type": "entry"}},
    {"showed_attr_name": "Email", "attr_name": "email", "required": false, "data": null, "edit_state": {"visible": true, "disable": false, "entry_type": "entry"}, "create_state": {"visible": true, "disable": false, "entry_type": "entry"}}
  ]
  const [contents, setContents] = useState(initialContents);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  var last_updated = null;
  
  const checkUpdate = async () => {
    console.log("checking for update...");
    axios.get(`${API_BASE_URL}/db/last_updated/supplier`, {
      headers: {
        "ngrok-skip-browser-warning": 1
      }
    }).then(response => {
      if(!last_updated || response.data.time > last_updated){
        last_updated = response.data.time;
        fetchSuppliers();
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
    const updatedContents = contents.map((content, idx) => ({
      ...content,
      data: suppliers[index][content.attr_name]
    }));
    setContents(updatedContents);
  }

  const clostPopOut = () => {
    setShowEdit(false);
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
            <button disabled={selectedRow === null} onClick={() => {setShowEdit(true)}}>編輯</button>
            <button >新增</button>
          </div>
        </div>
        <div className='list_container'>
          
          <table>
            <thead>
            <tr>
              {contents.map((data, index) => (
                <th key={index}>{data.showed_attr_name}</th>
              ))}
            </tr>
            </thead>
            {error ? (
              <h>Network Error...</h>
              ) : (
                loading ? (
                  <p>資料載入中...</p>
                ) : (
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
              )
              
            )}
          </table>
        </div>
      </div>
      {showEdit && <EditPopOut dataType="供應商" contents={contents} close={clostPopOut}/>}
    </div>
  );
}

export default Suppliers;
