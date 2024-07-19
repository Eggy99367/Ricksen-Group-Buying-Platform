import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
import { Header, PopOut, FunctionBar, ListContainer, MsgBox } from "../../../components"
import axios from 'axios';
import API_BASE_URL from '../../../config';

export const Groups = () => {
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
      "showed_attr": "商品",
      "attr": "product_id",
      "required": true,
      "display": false,
      "data": null,
      "edit": {
        "visible": true,
        "disable": false,
        "entry_type": "dropdown"
      },
      "create": {
        "visible": true,
        "disable": false,
        "entry_type": "dropdown"
      },
      "options": null
    },
    {
      "showed_attr": "商品",
      "attr": "product_name",
      "required": false,
      "display": true,
      "data": null,
      "edit": {
        "visible": false,
        "disable": false,
        "entry_type": "dropdown"
      },
      "create": {
        "visible": false,
        "disable": false,
        "entry_type": "dropdown"
      },
      "options": null
    },
    {
      "showed_attr": "售價",
      "attr": "selling_price",
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
      "showed_attr": "狀態",
      "attr": "status",
      "required": true,
      "display": true,
      "data": null,
      "edit": {
        "visible": true,
        "disable": false,
        "entry_type": "setdropdown"
      },
      "create": {
        "visible": true,
        "disable": true,
        "entry_type": "setdropdown"
      },
      "options": [["準備開團", ""], ["團購進行中", ""], ["收團，等待決策", ""], ["成團，等待入庫", ""], ["棄團", ""], ["入庫，等待撿貨", ""], ["開放取貨", ""], ["團購結束", ""]]
    },
    {
      "showed_attr": "開團時間",
      "attr": "start_time",
      "required": true,
      "display": true,
      "data": null,
      "edit": {
        "visible": true,
        "disable": false,
        "entry_type": "time"
      },
      "create": {
        "visible": true,
        "disable": false,
        "entry_type": "time"
      }
    },
    {
      "showed_attr": "收團時間",
      "attr": "end_time",
      "required": false,
      "display": true,
      "data": null,
      "edit": {
        "visible": true,
        "disable": false,
        "entry_type": "time"
      },
      "create": {
        "visible": true,
        "disable": false,
        "entry_type": "time"
      }
    },
    {
      "showed_attr": "最少購買數",
      "attr": "min_qty",
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
      "showed_attr": "最多購買數",
      "attr": "max_qty",
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
      "showed_attr": "最少單人購買數",
      "attr": "min_qty_pp",
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
      "showed_attr": "最多單人購買數",
      "attr": "max_qty_pp",
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
  const [groups, setGroups] = useState([]);
  const [product_names, setProductNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [searchCategory, setSearchCategory] = useState("");
  var last_updated = null;
  var sup_last_updated = null;
  
  const [resultLimit, setResultLimit] = useState(25);
  const listContainerRef = useRef(null);

  const checkUpdate = async () => {
    console.log("checking for update...");
    axios.get(`${API_BASE_URL}/db/last_updated/group_record`, {
      headers: {
        "ngrok-skip-browser-warning": 1
      }
    }).then(response => {
      var time = response.data.time.replace(/[^0-9]/g, '')
      if(last_updated === null || time > last_updated){
        last_updated = time;
        fetchGroups();
        setError(null);
      }
      setError(false);
      setLoading(false);
    }).catch(error => {
      console.error("There was an error fetching the data!", error);
      setError(error);
    });
    axios.get(`${API_BASE_URL}/db/last_updated/product`, {
      headers: {
        "ngrok-skip-browser-warning": 1
      }
    }).then(response => {
      var time = response.data.time.replace(/[^0-9]/g, '')
      if(sup_last_updated === null || time > sup_last_updated){
        sup_last_updated = time;
        fetchProductNames();
        setError(null);
      }
      setError(false);
      setLoading(false);
    }).catch(error => {
      console.error("There was an error fetching the data!", error);
      setError(error);
    });
  }

  const fetchGroups = async () => {
    console.log("Fetching data from API...");
    axios.get(`${API_BASE_URL}/db/groups`, {
      headers: {
        "ngrok-skip-browser-warning": 1
      }
    }).then(response => {
        console.log("Data fetched successfully:", response);
        setGroups(Object.values(response.data));
        console.log(groups);
        setLoading(false);
        setError(null);
      }).catch(error => {
        console.error("There was an error fetching the data!", error);
        setError(error);
        setLoading(false);
    });
  }

  const fetchProductNames = async () => {
    console.log("Fetching data from API...");
    axios.get(`${API_BASE_URL}/db/products/names`, {
      headers: {
        "ngrok-skip-browser-warning": 1
      }
    }).then(response => {
        console.log("Data fetched successfully:", response);
        setProductNames(Object.entries(response.data));
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
  }, [listContainerRef, groups, searchTerm]);

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
      await axios.put(`${API_BASE_URL}/db/groups/${update_json.id}`, update_json, {
        headers: {
          'Content-Type': 'application/json',
          "ngrok-skip-browser-warning": 1
        }});
      checkUpdate();
      setShowEdit(false);
      handleShowMessageBox("編輯團購選項成功！", "#A3E4D7");
    } catch (error) {
      console.error('Update failed', error);
      handleShowMessageBox("編輯團購選項失敗！", "#F5B7B1");
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
      await axios.post(`${API_BASE_URL}/db/groups`, create_json, {
        headers: {
          'Content-Type': 'application/json',
          "ngrok-skip-browser-warning": 1
        }});
      checkUpdate();
      setShowCreate(false);
      handleShowMessageBox("新增團購選項成功！", "#A3E4D7");
    } catch (error) {
      console.error('Create failed', error);
      handleShowMessageBox("新增團購選項失敗！", "#F5B7B1");
    }
  }

  
  const filteredContents = groups.filter((group) => (
    searchTerm === "" ? (true) : (
      searchCategory === "" ? (
        Object.entries(group).some(([key, value]) =>
          contents.some(content => content.display && content.attr === key) && value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      ) : (
        group[searchCategory] && group[searchCategory].toString().toLowerCase().includes(searchTerm)
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
    var updatedContents = contents.map((content, idx) => ({
      ...content,
      data: filteredContents[selectedRow][content.attr],
    }));
    updatedContents[1].options = product_names;
    setContents(updatedContents);
    setShowEdit(true);
  }

  const clostCreatePopOut = () => {
    setShowCreate(false);
  }

  const handleCreateClick = () => {
    var updatedContents = contents;
    updatedContents[1].options = product_names;
    setContents(updatedContents);
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
          pageTitle={"團購管理"}
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
        {showEdit && <PopOut popOutType="edit" dataType="團購項目" contents={contents} close={clostEditPopOut} submit_func={handleEditSubmit}/>}
        {showCreate && <PopOut popOutType="create" dataType="團購項目" contents={contents} close={clostCreatePopOut} submit_func={handleCreateSubmit}/>}
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

export default Groups;
