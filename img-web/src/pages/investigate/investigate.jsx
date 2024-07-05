import React, { useState, useEffect, useRef } from 'react';
import { Header, ListContainer, listContainer } from "../../components"
import axios from 'axios';
import API_BASE_URL from '../../config';
import { useLocation } from 'react-router-dom';
import ExposurePieChart from './Exposure Charts/exposurePieChart.jsx'
import ExposureLineChart from './Exposure Charts/exposureLineChart.jsx'
import ClickPieChart from './Click Charts/clickPieChart.jsx'
import ClickLineChart from './Click Charts/clickLineChart.jsx'
import './investigate.css'

export const Investigate = () => {
    const CHANNEL_ACCESS_TOKEN = 'AY4Ib+xWajIopdJjkX+GbTV8F2ckANFIb62dAMEvonf1vlI5j+zUrbSHZsO/EdaK/aW17FwuaFL0LeD15n+pukPgETG+I4Nwq5+oyRRtSx2/n/DfRZDXb6DurL59LyBx7IjpQ+Vv4TSYK+q3Y5opjgdB04t89/1O/w1cDnyilFU='


    const location = useLocation();
    const group = location.state?.group;

    const [cost, setCost] = useState(0);
    const [price, setPrice] = useState(0);
    const [totalSold, setTotalSold] = useState(0);
    const [followers, setFollowers] = useState(1);
    const [viewTime, setViewTime] = useState([]);
    const [clickTime, setClickTime] = useState([]);


    useEffect(() => {
        if (group) {
            fetchCost(group.product_id);
            fetchTotalSold(group.id);
            fetchPrice(group.id);
            fetchTotalFollowers();
            fetchViewData();
            fetchClickData();
        }
    }, [group]);


    const fetchCost = (product_id) => {
        console.log("Fetching data from API...");
        axios.get(`${API_BASE_URL}/db/products/${product_id}`, {
          headers: {
            "ngrok-skip-browser-warning": 1
          }
        }).then(response => {
            console.log("Data fetched successfully:", response);
            setCost(response.data.cost);
          }).catch(error => {
            console.error("There was an error fetching the data!", error);
        });
    }

    const fetchPrice = (group_id) => {
        console.log("Fetching data from API...");
        axios.get(`${API_BASE_URL}/db/groups/${group_id}`, {
          headers: {
            "ngrok-skip-browser-warning": 1
          }
        }).then(response => {
            console.log("Data fetched successfully:", response);
            setPrice(response.data["selling_price"]);
          }).catch(error => {
            console.error("There was an error fetching the data!", error);
        });
    }

    const fetchTotalSold = (group_id) => {
        console.log("Fetching data from API...");
        axios.get(`${API_BASE_URL}/db/orders/${group_id}/total`, {
          headers: {
            "ngrok-skip-browser-warning": 1
          }
        }).then(response => {
            console.log("Data fetched successfully:", response);
            setTotalSold(response.data["total_qty"]);
          }).catch(error => {
            console.error("There was an error fetching the data!", error);
        });
    }

    const fetchTotalFollowers = async () => {
      console.log("Fetching data from API...");
        axios.get(`${API_BASE_URL}/db/customers`, {
          headers: {
            "ngrok-skip-browser-warning": 1
          }
        }).then(response => {
            console.log("Data fetched successfully:", response.data.length);
            setFollowers(response.data.length);
          }).catch(error => {
            console.error("There was an error fetching the data!", error);
        });
    };

    const fetchViewData = async () => {
      console.log("Fetching data from API...");
        axios.get(`${API_BASE_URL}/db/views/get_group_data_by_type/${group.id}/view`, {
          headers: {
            "ngrok-skip-browser-warning": 1
          }
        }).then(response => {
            console.log("Data fetched successfully:", response.data);
            setViewTime(response.data);
            console.log(viewTime);
          }).catch(error => {
            console.error("There was an error fetching the data!", error);
        });
    }

    const fetchClickData = async () => {
      console.log("Fetching data from API...");
        axios.get(`${API_BASE_URL}/db/views/get_group_data_by_type/${group.id}/click`, {
          headers: {
            "ngrok-skip-browser-warning": 1
          }
        }).then(response => {
            console.log("Data fetched successfully:", response.data);
            setClickTime(response.data);
            console.log(viewTime);
          }).catch(error => {
            console.error("There was an error fetching the data!", error);
        });
    }

    return (
        <div className="investigate-container">
            <Header />
            {group ? (
                <div>
                    <div className="group-details">
                        <div className="detail">
                            <span className="label">編號:</span>
                            <span>{group.id}</span>
                        </div>
                        <div className="detail">
                            <span className="label">商品:</span>
                            <span>{group.product_name}</span>
                        </div>
                        <div className="detail">
                            <span className="label">狀態:</span>
                            <span>{group.status}</span>
                        </div>
                    </div>

                    <div className="metrics-container">
                        <div className="metric">
                            <span className="label">成本:</span>
                            <span>${cost}</span>
                        </div>
                        <div className="metric">
                            <span className="label">售價:</span>
                            <span>${price}</span>
                        </div>
                        <div className="metric">
                            <span className="label">售出總數:</span>
                            <span>{totalSold}</span>
                        </div>
                        <div className="metric">
                            <span className="label">收入:</span>
                            <span>${totalSold * price}</span>
                        </div>
                        <div className="metric">
                            <span className="label">盈利:</span>
                            <span>${totalSold * price - totalSold * cost}</span>
                        </div>
                        <div className="exposure_charts_container">
                          <ExposurePieChart totalViews = {viewTime.length} totalFollowers = {followers}/>
                          <ExposureLineChart timestamps = {viewTime} totalFollowers = {followers}/>
                        </div>
                        <div className="click_charts_container">
                          <ClickPieChart totalViews = {clickTime.length} totalFollowers = {followers}/>
                          <ClickLineChart timestamps = {clickTime} totalFollowers = {followers}/>
                        </div>
                    </div>
                    
                    
                </div>
            ) : (
                <p>No group data available.</p>
            )}
        </div>
      );
}

export default Investigate;