import React, { useState, useEffect, useRef } from 'react';
import { Header, PopOut, FunctionBar, ListContainer, MsgBox } from "../../components"
import axios from 'axios';
import API_BASE_URL from '../../config';

export const Orders = () => {
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
      "showed_attr": "時間戳記",
      "attr": "timestamp",
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
        "disable": true,
        "entry_type": "entry"
      },
    },
    {
      "showed_attr": "客戶",
      "attr": "customer_id",
      "required": true,
      "display": true,
      "data": null,
      "edit": {
        "visible": true,
        "disable": true,
        "entry_type": "entry"
      },
      "create": {
        "visible": true,
        "disable": true,
        "entry_type": "entry"
      },
      "options": null
    },
    {
      "showed_attr": "團購項目",
      "attr": "group_id",
      "required": true,
      "display": true,
      "data": null,
      "edit": {
        "visible": true,
        "disable": true,
        "entry_type": "entry"
      },
      "create": {
        "visible": true,
        "disable": true,
        "entry_type": "entry"
      },
      "options": null
    },
    {
      "showed_attr": "數量",
      "attr": "qty",
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
      "showed_attr": "撿貨單編號",
      "attr": "picking_list_id",
      "required": false,
      "display": true,
      "data": null,
      "edit": {
        "visible": false,
        "disable": false,
        "entry_type": "entry"
      },
      "create": {
        "visible": false,
        "disable": false,
        "entry_type": "entry"
      }
    },
    {
      "showed_attr": "狀態",
      "attr": "status",
      "required": false,
      "display": true,
      "data": null,
      "edit": {
        "visible": true,
        "disable": false,
        "entry_type": "setdropdown"
      },
      "create": {
        "visible": true,
        "disable": false,
        "entry_type": "setdropdown"
      },
      "options": [["訂單確認", ""], ["等待取貨", ""], ["訂單取消", ""], ["訂單完成", ""]]
    }
  ]
  const [contents, setContents] = useState(initialContents);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [searchCategory, setSearchCategory] = useState("");
  var last_updated = null;
  var sup_last_updated = null;
  
  const [resultLimit, setResultLimit] = useState(25);
  const listContainerRef = useRef(null);

  const checkUpdate = async () => {
    console.log("checking for update...");
    axios.get(`${API_BASE_URL}/db/last_updated/order_record`, {
      headers: {
        "ngrok-skip-browser-warning": 1
      }
    }).then(response => {
      var time = response.data.time.replace(/[^0-9]/g, '')
      if(last_updated === null || time > last_updated){
        last_updated = time;
        fetchOrders();
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
        setError(null);
      }
      setError(false);
      setLoading(false);
    }).catch(error => {
      console.error("There was an error fetching the data!", error);
      setError(error);
    });
  }

  const fetchOrders = async () => {
    console.log("Fetching data from API...");
    axios.get(`${API_BASE_URL}/db/orders`, {
      headers: {
        "ngrok-skip-browser-warning": 1
      }
    }).then(response => {
        console.log("Data fetched successfully:", response);
        setOrders(Object.values(response.data));
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
  }, [listContainerRef, orders, searchTerm]);

  const verifyOrder = (data) => {
    if(!("qty" in data) || data.qty === null){
      handleShowMessageBox("請輸入購買數量", "#F5B7B1");
      return false;
    }else if("qty" in data && data.qty !== null && isNaN(data.qty)){
      handleShowMessageBox("購買數量需為數字", "#F5B7B1");
      return false;
    }
    return true
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
    if(!verifyOrder(update_json)){return};
    console.log("handle edit:", update_json);
    try {
      await axios.put(`${API_BASE_URL}/db/orders/${update_json.id}`, update_json, {
        headers: {
          'Content-Type': 'application/json',
          "ngrok-skip-browser-warning": 1
        }});
      checkUpdate();
      setShowEdit(false);
      handleShowMessageBox("編輯訂單成功！", "#A3E4D7");
    } catch (error) {
      console.error('Update failed', error);
      handleShowMessageBox("編輯訂單失敗！", "#F5B7B1");
    }
  }
  
  const filteredContents = orders.filter((order) => (
    searchTerm === "" ? (true) : (
      searchCategory === "" ? (
        Object.entries(order).some(([key, value]) =>
          contents.some(content => content.display && content.attr === key) && value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      ) : (
        order[searchCategory] && order[searchCategory].toString().toLowerCase().includes(searchTerm.toLowerCase())
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
    setContents(updatedContents);
    setShowEdit(true);
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
          pageTitle={"訂單管理"}
          handleSearchInputChange={handleSearchInputChange}
          setSearchTerm={setSearchTerm}
          setSearchCategory={setSearchCategory}
          handleEditClick={handleEditClick}
          selectedRow={selectedRow}
          contents={contents}
          noCreate={true}
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
        {showEdit && <PopOut popOutType="edit" dataType="訂單" contents={contents} close={clostEditPopOut} submit_func={handleEditSubmit}/>}
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

export default Orders;
