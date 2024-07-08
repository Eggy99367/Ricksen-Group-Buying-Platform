import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Header, Barcode } from "../../../components"
import API_BASE_URL from '../../../config';
import axios from 'axios';
import jsPDF from 'jspdf';
import './picking_list.css'

import 'jspdf-autotable';
import JsBarcode from 'jsbarcode';

function generatePDF(pl_data, setPdfUrl) {
  var doc = new jsPDF();

  pl_data.forEach((pick_list, pl_index) => {
    doc.setFontSize(16);
    doc.text('撿貨單', 105, 20, { align: 'center' });
    
    // 生成條形碼
    const barcodeCanvas = document.createElement('canvas');
    JsBarcode(barcodeCanvas, pick_list.id, { format: 'CODE128' });
    const barcodeImage = barcodeCanvas.toDataURL('image/png');
    doc.addImage(barcodeImage, 'PNG', 160, 10, 40, 20);

    const { customer_name, customer_phone, customer_email, orders } = pick_list;

    // 添加客户信息
    doc.setFontSize(12);
    doc.text(`客戶名稱: ${customer_name}`, 10, 30);
    doc.text(`電話號碼: ${customer_phone}`, 10, 40);
    doc.text(`電子郵件: ${customer_email}`, 10, 50);

    // 表格头部定义
    const tableColumn = ["#", "團購選項編號", "商品名稱", "數量", "單價", "金額"];
    const tableRows = [];

    // 表格数据
    orders.forEach((order, index) => {
      const orderData = [
        index + 1,
        order.group_id,
        order.name,
        order.qty,
        `$${order.price}`,
        `$${order.qty * order.price}`
      ];
      tableRows.push(orderData);
    });

    // 添加总计金额
    const totalAmount = orders.reduce((sum, order) => sum + order.qty * order.price, 0);
    tableRows.push(["", "", "", "", "總計", `$${totalAmount}`]);

    // 添加表格
    doc.autoTable({
      startY: 60,
      head: [tableColumn],
      body: tableRows,
      styles: { font: 'msjh' },
    });

    if (pl_index < pl_data.length - 1) {
      doc.addPage();
    }
  });

  // 將PDF生成URL並設置為狀態
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  setPdfUrl(pdfUrl);
}

export const PickingList = () => {
  const { date } = useParams();
  const [pdfUrl, setPdfUrl] = useState('');
  const [pl_data, setPLData] = useState([]);

  const fetchPickLst = async () => {
    console.log("Fetching data from API...");
    axios.get(`${API_BASE_URL}/db/picking_lists/${date}`, {
      headers: {
        "ngrok-skip-browser-warning": 1
      }
    }).then(response => {
      console.log("Data fetched successfully:", response);
      const data = Object.values(response.data);
      setPLData(data);
      generatePDF(data, setPdfUrl); // Pass setPdfUrl as a parameter to update the state
    }).catch(error => {
      console.error("There was an error fetching the data!", error);
    });
  }

  useEffect(() => {
    fetchPickLst();
  }, [date]);

  return (
    <div className='pl_page_main_box'>
      <Header />
      <h1>[{date}] 撿貨單</h1>
      {pdfUrl && (
        <div>
          <iframe src={pdfUrl} width="100%" height="800px"></iframe>
          <a href={pdfUrl} download="picking-list.pdf">Download PDF</a>
        </div>
      )}
      {pl_data.map((pick_lst, pl_index) => (
        <div key={pl_index} className='pl_container'>
          <p>客戶姓名 :{pick_lst.customer_name}</p>
          <p>客戶電話 : {pick_lst.customer_phone}</p>
          <p>客戶Email : {pick_lst.customer_email}</p>
          <p>客戶編號 : {pick_lst.customer_id}</p>
          <p>訂單 : {pick_lst.odr_ids.join(', ')}</p>
          <Barcode value={pick_lst.id} />
          <table>
            <thead>
              <tr>
                <th key="group_id"> 團購選項編號</th>
                <th key="name">商品名稱</th>
                <th key="qty">數量</th>
                <th key="price">單價</th>
              </tr>
            </thead>
            <tbody>
              {pick_lst.orders.map((odr, odr_index) => (
                <tr key={odr_index}>
                  <td key={odr.group_id}>{odr.group_id}</td>
                  <td key={odr.name}>{odr.name}</td>
                  <td key={odr.qty}>{odr.qty}</td>
                  <td key={odr.price}>{odr.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default PickingList;
