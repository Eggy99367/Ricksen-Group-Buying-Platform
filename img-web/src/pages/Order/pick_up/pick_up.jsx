import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
import { Header, FunctionBar, ListContainer, MsgBox } from "../../../components"
import axios from 'axios';
import API_BASE_URL from '../../../config';

export const PickUp = () => {
  // const navigate = useNavigate();

  const initialContents = [
    {
      "showed_attr": "編號",
      "attr": "id",
      "display": true,
      "data": null
    },
    {
      "showed_attr": "客戶姓名",
      "attr": "customer_name",
      "display": true,
      "data": null
    },
    {
      "showed_attr": "客戶電話",
      "attr": "customer_phone",
      "display": true,
      "data": null
    },
    {
      "showed_attr": "客戶Email",
      "attr": "customer_email",
      "display": true,
      "data": null
    },
    {
      "showed_attr": "撿貨日期",
      "attr": "date",
      "display": true,
      "data": null
    },
    {
      "showed_attr": "訂單",
      "attr": "odr_ids",
      "display": true,
      "data": null
    },
    {
      "showed_attr": "商品",
      "attr": "products",
      "display": true,
      "data": null
    },
    {
      "showed_attr": "狀態",
      "attr": "status",
      "display": true,
      "data": null
    }
  ]
  const [pklists, setPklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [searchCategory, setSearchCategory] = useState("");
  var last_updated = null;
  
  const [resultLimit, setResultLimit] = useState(25);
  const listContainerRef = useRef(null);

  const checkUpdate = async () => {
    console.log("checking for update...");
    axios.get(`${API_BASE_URL}/db/last_updated/all`, {
      headers: {
        "ngrok-skip-browser-warning": 1
      }
    }).then(response => {
      var time = response.data.replace(/[^0-9]/g, '')
      if(last_updated === null || time > last_updated){
        last_updated = time;
        fetchPklists();
        setError(null);
      }
      setError(false);
      setLoading(false);
    }).catch(error => {
      console.error("There was an error fetching the data!", error);
      setError(error);
    });
  }

  const fetchPklists = async () => {
    console.log("Fetching data from API...");
    axios.get(`${API_BASE_URL}/db/picking_lists`, {
      headers: {
        "ngrok-skip-browser-warning": 1
      }
    }).then(response => {
        console.log("Data fetched successfully:", response);
        setPklists(Object.values(response.data));
        console.log(pklists);
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
  }, [listContainerRef, pklists, searchTerm]);
  
  const filteredContents = pklists.filter((pklist) => (
    searchTerm === "" ? (true) : (
      searchCategory === "" ? (
        Object.entries(pklist).some(([key, value]) =>
          initialContents.some(content => content.display && content.attr === key) && value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      ) : (
        pklist[searchCategory] && pklist[searchCategory].toString().toLowerCase().includes(searchTerm.toLowerCase())
      ))
    )
  );

  const handlePickUpClick = async () => {
    try {
      await axios.put(`${API_BASE_URL}/db/pick_up/${filteredContents[selectedRow].id}`, {}, {
        headers: {
          'Content-Type': 'application/json',
          "ngrok-skip-browser-warning": 1
        }});
      checkUpdate();
      handleShowMessageBox(`${filteredContents[selectedRow].id}領貨成功！`, "#A3E4D7");
    } catch (error) {
      console.error('Update failed', error);
      handleShowMessageBox(`${filteredContents[selectedRow].id}領貨失敗！`, "#F5B7B1");
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
          pageTitle={"客戶領貨"}
          handleSearchInputChange={handleSearchInputChange}
          setSearchTerm={setSearchTerm}
          setSearchCategory={setSearchCategory}
          handleSpecialClick={handlePickUpClick}
          selectedRow={selectedRow}
          contents={initialContents}
          noEdit={true}
          noCreate={true}
          special={true}
          special_disable={selectedRow === null || !(filteredContents[selectedRow].status === "等待取貨")}
          special_text={"領貨"}
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
        <MsgBox
          message={msgBoxMsg}
          bgColor={msgBoxColor}
          duration={2000}
          visible={showMessageBox}
        />
    </div>
  );
}

export default PickUp;
