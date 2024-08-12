import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
import { Header, FunctionBar, ListContainer, MsgBox } from "../../../components"
import axios from 'axios';
import API_BASE_URL from '../../../config';
import './decision.css';

export const Decision = () => {
  // const navigate = useNavigate();

  const initialContents = [
    {
      "showed_attr": "編號",
      "attr": "id",
      "display": true
    },
    {
      "showed_attr": "商品",
      "attr": "product_name",
      "display": true
    },
    {
      "showed_attr": "開團時間",
      "attr": "start_time",
      "display": true
    },
    {
      "showed_attr": "狀態",
      "attr": "status",
      "display": true
    },
    {
      "showed_attr": "成本",
      "attr": "cost",
      "is_cost": true,
      "display": true
    },
    {
      "showed_attr": "售價",
      "attr": "selling_price",
      "is_cost": true,
      "display": true
    },
    {
      "showed_attr": "最少購買數",
      "attr": "min_qty",
      "display": true
    },
    {
      "showed_attr": "最多購買數",
      "attr": "max_qty",
      "display": true
    },
    {
      "showed_attr": "銷售量",
      "attr": "sells",
      "display": true
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
        group[searchCategory] && group[searchCategory].toString().toLowerCase().includes(searchTerm.toLowerCase())
      ))
    )
  );

  const handleFormClick = async () => {
    try {
      await axios.put(`${API_BASE_URL}/db/form/${filteredContents[selectedRow].id}`, {}, {
        headers: {
          'Content-Type': 'application/json',
          "ngrok-skip-browser-warning": 1
        }});
      checkUpdate();
      handleShowMessageBox(`${filteredContents[selectedRow].id}設定成團成功！`, "#A3E4D7");
    } catch (error) {
      console.error('Update failed', error);
      handleShowMessageBox(`${filteredContents[selectedRow].id}設定成團失敗！`, "#F5B7B1");
    }
  }

  const handleAbandonClick = async () => {
    try {
      await axios.put(`${API_BASE_URL}/db/abandon/${filteredContents[selectedRow].id}`, {}, {
        headers: {
          'Content-Type': 'application/json',
          "ngrok-skip-browser-warning": 1
        }});
      checkUpdate();
      handleShowMessageBox(`${filteredContents[selectedRow].id}設定棄團成功！`, "#A3E4D7");
    } catch (error) {
      console.error('Update failed', error);
      handleShowMessageBox(`${filteredContents[selectedRow].id}設定棄團失敗！`, "#F5B7B1");
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
          pageTitle={"成團決議"}
          handleSearchInputChange={handleSearchInputChange}
          setSearchTerm={setSearchTerm}
          setSearchCategory={setSearchCategory}
          selectedRow={selectedRow}
          contents={initialContents}
          noEdit={true}
          noCreate={true}
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
        <div className='decision_btn_container'>
          <button
            className='green'
            onClick={() => {handleFormClick(filteredContents[selectedRow].id)}}
            disabled={selectedRow === null || (filteredContents[selectedRow].status !== "收團，等待決策" && filteredContents[selectedRow].status !== "團購進行中")}
          >
              成團
          </button>
          <button
            className='red'
            onClick={() => {handleAbandonClick(filteredContents[selectedRow].id)}}
            disabled={selectedRow === null}
          >
            棄團
          </button>
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

export default Decision;
