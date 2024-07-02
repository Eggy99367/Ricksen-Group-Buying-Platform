import React, { useState, useEffect, useRef } from 'react';
import { Header, ListContainer, listContainer } from "../../components"
import axios from 'axios';
import API_BASE_URL from '../../config';
import { useLocation } from 'react-router-dom';
import './investigate.css'

export const Investigate = () => {
    const CHANNEL_ACCESS_TOKEN = 'AY4Ib+xWajIopdJjkX+GbTV8F2ckANFIb62dAMEvonf1vlI5j+zUrbSHZsO/EdaK/aW17FwuaFL0LeD15n+pukPgETG+I4Nwq5+oyRRtSx2/n/DfRZDXb6DurL59LyBx7IjpQ+Vv4TSYK+q3Y5opjgdB04t89/1O/w1cDnyilFU='


    const location = useLocation();
    const group = location.state?.group;

    const [cost, setCost] = useState(0);
    const [price, setPrice] = useState(0);
    const [totalSold, setTotalSold] = useState(0);
    const [revenue, setRevenue] = useState(0);
    const [profit, setProfit] = useState(0);
    const [followers, setFollowers] = useState(1);


    useEffect(() => {
        if (group) {
            fetchCost(group.product_id);
            fetchPrice(group.id);
            fetchTotalSold(group.id);
            fetchTotalFollowers();
            calculateRev();
            calculateProfit();
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
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
      const day = String(now.getDate()).padStart(2, '0');
      const date = `${year}${month}${day}`;
      
      try {
        const response = axios.get(`${API_BASE_URL}/followers/${date}`, {
          headers: {
            "ngrok-skip-browser-warning": 1
          }})
        
          console.log(response);
      } catch (err) {
        console.log(`Error: ${err.message}`);
      } 
    };
  
  

    const calculateRev = () => {
        setRevenue(totalSold * price);
    }

    const calculateProfit = () => {
        setProfit(revenue - cost * totalSold);
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
                            <span>${revenue}</span>
                        </div>
                        <div className="metric">
                            <span className="label">盈利:</span>
                            <span>${profit}</span>
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