import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, FunctionBar } from "../../../components"
import axios from 'axios';
import API_BASE_URL from '../../../config';
import './picking_main.css'

export const PickingMain = () => {
  const navigate = useNavigate();

  const initialContents = []
  const [contents, setContents] = useState(initialContents);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [searchCategory, setSearchCategory] = useState("");
  var last_updated = null;
  
  const [resultLimit, setResultLimit] = useState(25);
  const listContainerRef = useRef(null);

  const checkUpdate = async () => {
    console.log("checking for update...");
    axios.get(`${API_BASE_URL}/db/last_updated/picking_lists`, {
      headers: {
        "ngrok-skip-browser-warning": 1
      }
    }).then(response => {
      var time = response.data.time.replace(/[^0-9]/g, '')
      if(last_updated === null || time > last_updated){
        last_updated = time;
        fetchPLDates();
        setError(null);
      }
      setError(false);
      setLoading(false);
    }).catch(error => {
      console.error("There was an error fetching the data!", error);
      setError(error);
    });
  }

  const fetchPLDates = async () => {
    console.log("Fetching data from API...");
    axios.get(`${API_BASE_URL}/db/picking_lists/dates`, {
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
  
  const filteredContents = orders.filter((order) => (
    searchTerm === "" ? (true) : (
        order.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
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

  const handleSearchInputChange = (event) => {
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
          pageTitle={"所有撿貨單"}
          handleSearchInputChange={handleSearchInputChange}
          setSearchTerm={setSearchTerm}
          setSearchCategory={setSearchCategory}
          contents={contents}
          noCreate={true}
          noEdit={true}
        />
        <div className='picking_list_date_container'>
          <div className='page_control_container'>
            {(page > 0) && <span className="material-symbols-outlined no_select" onClick={() => { setPage(page - 1) }}>arrow_back_ios</span>}
            <p className='no_select'>{`${Math.min(page * resultLimit + 1, filteredContents.length)}-${Math.min((page + 1) * resultLimit, filteredContents.length)} / ${filteredContents.length}筆資料`}</p>
            {(page >= 0 && page < (filteredContents.length / resultLimit) - 1) && <span className="material-symbols-outlined no_select" onClick={() => { setPage(page + 1) }}>arrow_forward_ios</span>}
          </div>
          {error ? (<p>Network Error...</p>) : (
            filteredContents.map((data, index) => (
              (page * resultLimit <= index && index < (page + 1) * resultLimit) && (
                <button className='picking_list_date_card' onClick={() => {navigate(`/picking_lists/${data}`);}}>
                  <h2>{data} </h2>
                  <span className="plc_arrow material-symbols-outlined no_select">arrow_forward_ios</span>
                </button>
              )
            ))
          )}
          {loading && <p>資料載入中...</p>}
        </div>
      </div>
    </div>
  );
}

export default PickingMain;
