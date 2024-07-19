import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { NotFound } from '../../notFound/notFound'
import { Header, Barcode } from "../../../components"
import API_BASE_URL from '../../../config';
import axios from 'axios';
import './picking_list.css'

import html2pdf from 'html2pdf.js';

export const PickingList = () => {
  const { date } = useParams();
  const [pdfUrl, setPdfUrl] = useState('');
  const [pl_data, setPLData] = useState([]);
  const [error, setError] = useState(false);
  const pdfRef = useRef();

  const handleGeneratePDF = () => {
    const element = pdfRef.current;
    const opt = {
      margin: 0.2,
      filename: '撿貨單.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    };

    html2pdf().from(element).set(opt).save();
  };

  const fetchPickLst = async () => {
    console.log("Fetching data from API...");
    axios.get(`${API_BASE_URL}/db/picking_lists/${date}`, {
      headers: {
        "ngrok-skip-browser-warning": 1
      }
    }).then(response => {
      console.log("Data fetched successfully:", response);
      const data = Object.values(response.data);
      if(data.length < 1){
        setError(true);
      }else{
        setPLData(data);
      }
      
    }).catch(error => {
      console.error("There was an error fetching the data!", error);
    });
  }

  useEffect(() => {
    fetchPickLst();
  }, [date]);

  return (
    <div>
      {error ? (
        <NotFound />
      ) : (
        <div className='pl_page_main_box'>
          <Header />
          <h1>[{date}] 撿貨單</h1>
          <button onClick={handleGeneratePDF} className='download_pdf_btn'>下載撿貨單</button>
          <div className="picking_list_box" ref={pdfRef} style={{ fontFamily: 'Noto Sans TC, sans-serif' }}>
            {pl_data.map((pick_lst, pl_index) => (
              <div key={pl_index} className='pl_container'>
                <div className='barcode_container'>
                  <Barcode value={pick_lst.id} />
                </div>
                <p className='pl_title'>撿貨單 [{pick_lst.id}]</p>
                <p>日期 : {date}</p>
                <p>客戶姓名 : {pick_lst.customer_name}</p>
                <p>客戶電話 : {pick_lst.customer_phone}</p>
                <p>客戶Email : {pick_lst.customer_email}</p>
                <p>客戶編號 : {pick_lst.customer_id}</p>
                <p>訂單 : {pick_lst.odr_ids.join(', ')}</p>
                <table className="pdf-table">
                  <thead>
                    <tr>
                      <th key="group_id" className='g_id_col'> 團購編號</th>
                      <th key="name" className='p_name_col'>商品名稱</th>
                      <th key="qty" className='qty_col'>數量</th>
                      <th key="unit_price" className='unit_price_col'>單價</th>
                      <th key="price" className='price_col'>金額</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pick_lst.orders.map((odr, odr_index) => (
                      <tr key={odr_index}>
                        <td key="group_id" className='g_id_col'>{odr.group_id}</td>
                        <td key="name" className='p_name_col'>{odr.name}</td>
                        <td key="qty" className='qty_col'>{odr.qty}</td>
                        <td key="unit_price" className='unit_price_col'>${odr.price}</td>
                        <td key="price" className='price_col'>${odr.price * odr.qty}</td>
                      </tr>
                    ))}
                    <tr key="sum" className='summary_row'>
                      <td className='g_id_col'>總數量 : {pick_lst.total_qty}</td>
                      <td className='p_name_col'></td>
                      <td className='qty_col'></td>
                      <td className='unit_price_col'>總計</td>
                      <td className='price_col'>${pick_lst.total_price}</td>
                    </tr>
                  </tbody>
                </table>
                {pl_index != pl_data.length - 1 && <div className="page-break" />}
              </div>
            ))}
          </div>
        </div>
  
      )}
    </div>
  );
};

export default PickingList;
