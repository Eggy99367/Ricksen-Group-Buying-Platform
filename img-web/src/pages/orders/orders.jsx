import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
import { Header, PopOut, FunctionBar, ListContainer } from "../../components"
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
      "special": null,
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
      "attr": "product_id",
      "required": true,
      "display": true,
      "data": null,
      "special": "product_name",
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
      "showed_attr": "售價",
      "attr": "selling_price",
      "required": true,
      "display": true,
      "data": null,
      "special": null,
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
      "special": null,
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
      "options": [["尚未開團", ""], ["團購進行中", ""], ["成團", ""], ["棄團", ""]]
    },
    {
      "showed_attr": "開團時間",
      "attr": "start_time",
      "required": true,
      "display": true,
      "data": null,
      "special": null,
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
      "special": null,
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
      "special": null,
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
      "special": null,
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
      "special": null,
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
      "special": null,
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
  const [orders, setOrders] = useState([]);
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
    axios.get(`${API_BASE_URL}/db/last_updated/order`, {
      headers: {
        "ngrok-skip-browser-warning": 1
      }
    }).then(response => {
      if(last_updated === null || response.data.time > last_updated){
        last_updated = response.data.time;
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
      if(sup_last_updated === null || response.data.time > sup_last_updated){
        sup_last_updated = response.data.time;
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
  }, [listContainerRef, orders, searchTerm]);

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
      await axios.put(`${API_BASE_URL}/db/orders/${update_json.id}`, update_json, {
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
      await axios.post(`${API_BASE_URL}/db/orders`, create_json, {
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

  
  const filteredContents = orders.filter((order) => (
    searchTerm === "" ? (true) : (
      searchCategory === "" ? (
        Object.entries(order).some(([key, value]) =>
          contents.some(content => content.display && content.attr === key) && value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      ) : (
        order[searchCategory] && order[searchCategory].toString().toLowerCase().includes(searchTerm)
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

  return (
    <div className='page_main_box'>
      <Header />
      <div className='page_content'>
        <FunctionBar
          searchTerm={searchTerm}
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
        {showEdit && <PopOut popOutType="edit" dataType="訂單" contents={contents} close={clostEditPopOut} submit_func={handleEditSubmit}/>}
        {showCreate && <PopOut popOutType="create" dataType="訂單" contents={contents} close={clostCreatePopOut} submit_func={handleCreateSubmit}/>}
      </div>
    </div>
  );
}

export default Orders;
