import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
import { Header, PopOut, FunctionBar, ListContainer, MsgBox } from "../../components"
import axios from 'axios';
import API_BASE_URL from '../../config';

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
  
  const [resultLimit, setResultLimit] = useState(25);
  const listContainerRef = useRef(null);

  const checkUpdate = async () => {
    console.log("checking for update...");
    axios.get(`${API_BASE_URL}/db/last_updated/supplier`, {
      headers: {
        "ngrok-skip-browser-warning": 1
      }
    }).then(response => {
      var time = response.data.time.replace(/[^0-9]/g, '')
      if(last_updated === null || time > last_updated){
        last_updated = time;
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
    if (listContainerRef.current) {
      const containerHeight = listContainerRef.current.clientHeight - 90;
      const rowHeight = listContainerRef.current.querySelector('tr').clientHeight + 1;
      const rowsPerPage = Math.floor(containerHeight / rowHeight);
      setResultLimit(rowsPerPage);
    }
  }, [listContainerRef, suppliers, searchTerm]);

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
      handleShowMessageBox("編輯供應商成功！", "#A3E4D7");

    } catch (error) {
      console.error('Update failed', error);
      handleShowMessageBox("編輯供應商失敗！", "#F5B7B1");
    }
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
      handleShowMessageBox("新增供應商成功！", "#A3E4D7");
    } catch (error) {
      console.error('Create failed', error);
      handleShowMessageBox("新增供應商失敗！", "#F5B7B1");
    }
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


  //-----------------------------------------------------------------------------------

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

  const clostCreatePopOut = () => {
    setShowCreate(false);
  }

  const handleCreateClick = () => {
    setShowCreate(true);
  }

  const handleSearchInputChange = (event) => {
    setSelectedRow(null);
    setPage(0);
    setSearchTerm(event.target.value);
  }
  //-----------------------------------------------------------------------------------

  const [showMessageBox, setShowMessageBox] = useState(false);
  const [msgBoxMsg, setmsgBoxMsg] = useState("");
  const [msgBoxColor, setmsgBoxColor] = useState("lightgray");

  const handleShowMessageBox = (msg, color) => {
      setShowMessageBox(true);
      setmsgBoxMsg(msg);
      setmsgBoxColor(color);
      setTimeout(() => {
          setShowMessageBox(false);
      }, 3000);  // This should match the duration in the MessageBox
  };

  return (
    <div className='page_main_box'>
      <Header />
      <div className='page_content'>
        <FunctionBar
          searchTerm={searchTerm}
          pageTitle={"供應商管理"}
          handleSearchInputChange={handleSearchInputChange}
          setSearchTerm={setSearchTerm}
          setSearchCategory={setSearchCategory}
          handleEditClick={handleEditClick}
          handleCreateClick={handleCreateClick}
          selectedRow={selectedRow}
          contents={contents}
        />
        <ListContainer
          contents={contents}
          filteredContents={filteredContents}
          handleRowClick={handleRowClick}
          selectedRow={selectedRow}
          page={page}
          setPage={setPage}
          result_limit={resultLimit}
          error={error}
          loading={loading}
          listContainerRef={listContainerRef}
        />
        {showEdit && <PopOut popOutType="edit" dataType="供應商" contents={contents} close={clostEditPopOut} submit_func={handleEditSubmit}/>}
        {showCreate && <PopOut popOutType="create" dataType="供應商" contents={contents} close={clostCreatePopOut} submit_func={handleCreateSubmit}/>}
      </div>
      <MsgBox
        message={msgBoxMsg}
        bgColor={msgBoxColor}
        duration={2000}
        visible={showMessageBox}
      />
    </div>
  );
}

export default Suppliers;
