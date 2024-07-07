import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Header } from "../../../components"
import jsPDF from 'jspdf';

function generatePDF(orders){
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text('Picking List', 10, 10);
  doc.setFontSize(12);

  let y = 20;
  orders.forEach((order, index) => {
    doc.text(`${index + 1}. ${order.item} - ${order.quantity}`, 10, y);
    y += 10;
  });

  // 將PDF生成URL並設置為狀態
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  return pdfUrl;
};

export const PickingList = ({}) => {

  const { date } = useParams();
  const [pdfUrl, setPdfUrl] = useState('');

  // if(pdfUrl === ""){
  //   setPdfUrl(generatePDF(orders));
  // }
  return (
    <div className='page_main_box'>
      <Header />
      <h1>[{date}] 撿貨單</h1>
      {/* <button onClick={generatePDF}>Generate PDF</button> */}
      {/* {pdfUrl && (
        <div>
          <h2>預覽</h2>
          <iframe src={pdfUrl} width="100%" height="800px"></iframe>
          <a href={pdfUrl} download="picking-list.pdf">Download PDF</a>
        </div>
      )} */}
      {/* <ul>
        {orders.map((order, index) => (
          <li key={index}>{order.item} - {order.quantity}</li>
        ))}
      </ul> */}
    </div>
  );
};

export default PickingList;
