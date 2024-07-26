import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
import { Header, PopOut, FunctionBar, ListContainer, MsgBox } from "../../components"
import axios from 'axios';
import API_BASE_URL from '../../config';

export const Customers = () => {
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
        "visible": true,
        "disable": false,
        "entry_type": "entry"
      }
    },
    {
      "showed_attr": "姓名",
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
    }
  ]
  const initialOrderContents = [
    {
      "showed_attr": "客戶",
      "attr": "customer_id",
      "required": true,
      "display": true,
      "data": null,
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
      "create": {
        "visible": true,
        "disable": false,
        "entry_type": "dropdown"
      },
      "options": []
    },
    {
      "showed_attr": "數量",
      "attr": "qty",
      "required": true,
      "display": true,
      "data": null,
      "create": {
        "visible": true,
        "disable": false,
        "entry_type": "entry"
      }
    }
  ]
  const [contents, setContents] = useState(initialContents);
  const [orderContents, setOrderContents] = useState(initialOrderContents);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showOrder, setShowOrder] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [searchCategory, setSearchCategory] = useState("");
  var last_updated = null;
  
  const [resultLimit, setResultLimit] = useState(25);
  const listContainerRef = useRef(null);

  const checkUpdate = async () => {
    console.log("checking for update...");
    axios.get(`${API_BASE_URL}/db/last_updated/customer`, {
      headers: {
        "ngrok-skip-browser-warning": 1
      }
    }).then(response => {
      var time = response.data.time.replace(/[^0-9]/g, '')
      if(last_updated === null || time > last_updated){
        last_updated = time;
        fetchCustomers();
        setError(null);
      }
      setError(false);
      setLoading(false);
    }).catch(error => {
      console.error("There was an error fetching the data!", error);
      setError(error);
    });
  }

  const fetchCustomers = async () => {
    console.log("Fetching data from API...");
    axios.get(`${API_BASE_URL}/db/customers`, {
      headers: {
        "ngrok-skip-browser-warning": 1
      }
    }).then(response => {
        console.log("Data fetched successfully:", response);
        setCustomers(Object.values(response.data));
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
  }, [listContainerRef, customers, searchTerm]);

  const verifyCustomer = (data) => {
    if(!("id" in data) || data.id === null){
      handleShowMessageBox("請輸入客戶Line ID", "#F5B7B1");
      return false;
    }else if(data.id.length > 40){
      handleShowMessageBox("客戶Line ID過長（最多40字）", "#F5B7B1");
      return false;
    }else if(!("name" in data) || data.name === null){
      handleShowMessageBox("請輸入客戶姓名", "#F5B7B1");
      return false;
    }else if(data.name.length > 50){
      handleShowMessageBox("客戶姓名過長（最多50字）", "#F5B7B1");
      return false;
    }else if(!("phone" in data) || data.phone === null){
      handleShowMessageBox("請輸入客戶電話", "#F5B7B1");
      return false;
    }else if(data.phone.length !== 10){
      handleShowMessageBox("客戶電話無效（電話為10碼數字，請勿輸入符號）", "#F5B7B1");
      return false;
    }else if(!("email" in data) || data.email === null){
      handleShowMessageBox("請輸入客戶Email", "#F5B7B1");
      return false;
    }else if(data.email.length > 80){
      handleShowMessageBox("客戶Email過長（最多80字）", "#F5B7B1");
      return false;
    }
    return true
  }

  const verifyOrder = (data) => {
    if(!("group_id" in data) || data.group_id === null){
      handleShowMessageBox("請選擇團購商品", "#F5B7B1");
      return false;
    }else if(!("qty" in data) || data.qty === null){
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
    if(!verifyCustomer(update_json)){return};
    console.log("handle edit:", update_json);
    try {
      await axios.put(`${API_BASE_URL}/db/customers/${update_json.id}`, update_json, {
        headers: {
          'Content-Type': 'application/json',
          "ngrok-skip-browser-warning": 1
        }});
      checkUpdate();
      setShowEdit(false);
      handleShowMessageBox("編輯客戶成功！", "#A3E4D7");
    } catch (error) {
      console.error('Update failed', error);
      handleShowMessageBox("編輯客戶失敗！", "#F5B7B1");
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
    if(!verifyCustomer(create_json)){return};
    console.log("handle create:", create_json);
    try {
      await axios.post(`${API_BASE_URL}/db/customers`, create_json, {
        headers: {
          'Content-Type': 'application/json',
          "ngrok-skip-browser-warning": 1
        }});
      checkUpdate();
      setShowCreate(false);
      handleShowMessageBox("新增客戶成功！", "#A3E4D7");
    } catch (error) {
      console.error('Create failed', error);
      handleShowMessageBox("新增客戶失敗！", "#F5B7B1");
    }
  }

  const handleOrderSubmit = async (inputData) => {
    var create_json = {};
    for(const content of inputData){
      if(content.data === ""){
        create_json[content.attr] = null;
        }else{
          create_json[content.attr] = content.data;          
      }
    }
    if(!verifyOrder(create_json)){return};
    console.log("handle create:", create_json);
    create_json["status"] = "訂單確認";
    try {
      await axios.post(`${API_BASE_URL}/db/orders`, create_json, {
        headers: {
          'Content-Type': 'application/json',
          "ngrok-skip-browser-warning": 1
        }});
      checkUpdate();
      setShowOrder(false);
      handleShowMessageBox("新增訂單成功！", "#A3E4D7");
    } catch (error) {
      console.error('Create failed', error);
      handleShowMessageBox("新增訂單失敗！", "#F5B7B1");
    }
  }

  const filteredContents = customers.filter((customer) => (
    searchTerm === "" ? (true) : (
      searchCategory === "" ? (
        Object.entries(customer).some(([key, value]) =>
          contents.some(content => content.attr === key && content.display) && value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      ) : (
        customer[searchCategory] && customer[searchCategory].toString().toLowerCase().includes(searchTerm.toLowerCase())
      ))
    )
  );


  //-----------------------------------------------------------------------------------

  useEffect(() => {
    checkUpdate();
    var data = orderContents;
    axios.get(`${API_BASE_URL}/db/groups/names`, {
      headers: {
        "ngrok-skip-browser-warning": 1
      }
    }).then(response => {
        console.log("Data fetched successfully:", response);
        data[1].options = Object.entries(response.data);
        setLoading(false);
        setError(null);
      }).catch(error => {
        console.error("There was an error fetching the data!", error);
        setError(error);
        setLoading(false);
    });
    setOrderContents(data);
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

  const clostOrderPopOut = () => {
    setShowOrder(false);
  }

  const handleEditClick = () => {
    const updatedContents = contents.map((content, idx) => ({
      ...content,
      data: filteredContents[selectedRow][content.attr]
    }));
    setContents(updatedContents);
    setShowEdit(true);
  }

  const handleOrderClick = () => {
    var data = orderContents;
    data[0].data = filteredContents[selectedRow]["id"];
    axios.get(`${API_BASE_URL}/db/groups/names`, {
      headers: {
        "ngrok-skip-browser-warning": 1
      }
    }).then(response => {
        console.log("Data fetched successfully:", response);
        data[1].options = Object.entries(response.data);
        setLoading(false);
        setError(null);
      }).catch(error => {
        console.error("There was an error fetching the data!", error);
        setError(error);
        setLoading(false);
    });
    setOrderContents(data);
    setShowOrder(true);
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
          pageTitle={"客戶管理"}
          handleSearchInputChange={handleSearchInputChange}
          setSearchTerm={setSearchTerm}
          setSearchCategory={setSearchCategory}
          handleEditClick={handleEditClick}
          handleCreateClick={handleCreateClick}
          selectedRow={selectedRow}
          contents={contents}
          special={true}
          special_disable={selectedRow === null}
          special_text = {"下單"}
          handleSpecialClick={handleOrderClick}
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
        {showEdit && <PopOut popOutType="edit" dataType="客戶" contents={contents} close={clostEditPopOut} submit_func={handleEditSubmit}/>}
        {showCreate && <PopOut popOutType="create" dataType="客戶" contents={contents} close={clostCreatePopOut} submit_func={handleCreateSubmit}/>}
        {showOrder && <PopOut popOutType="create" dataType="訂單" contents={orderContents} close={clostOrderPopOut} submit_func={handleOrderSubmit}/>}
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

export default Customers;
