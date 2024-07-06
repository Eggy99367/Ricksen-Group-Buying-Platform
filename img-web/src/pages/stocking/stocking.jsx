import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
import { Header, FunctionBar, ListContainer } from "../../components"
import axios from 'axios';
import API_BASE_URL from '../../config';

export const Stocking = () => {
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
      "showed_attr": "入庫時間",
      "attr": "stocking_time",
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
    }
  ]
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
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
  
  const filteredContents = groups.filter((group) => (
    searchTerm === "" ? (true) : (
      searchCategory === "" ? (
        Object.entries(group).some(([key, value]) =>
          initialContents.some(content => content.display && content.attr === key) && value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      ) : (
        group[searchCategory] && group[searchCategory].toString().toLowerCase().includes(searchTerm)
      ))
    )
  );

  const handleStockingClick = async () => {
    try {
      await axios.put(`${API_BASE_URL}/db/stock/${filteredContents[selectedRow].id}`, {}, {
        headers: {
          'Content-Type': 'application/json',
          "ngrok-skip-browser-warning": 1
        }});
      checkUpdate();
    } catch (error) {
      console.error('Update failed', error);
    }
  }

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
          pageTitle={"商品入庫"}
          handleSearchInputChange={handleSearchInputChange}
          setSearchTerm={setSearchTerm}
          setSearchCategory={setSearchCategory}
          handleStockingClick={handleStockingClick}
          selectedRow={selectedRow}
          contents={initialContents}
          noEdit={true}
          noCreate={true}
          stocking={true}
          stocking_disable={selectedRow === null || !(filteredContents[selectedRow].status === "成團，等待入庫")}
        />
        <ListContainer
          contents={initialContents}
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
        </div>
    </div>
  );
}

export default Stocking;
