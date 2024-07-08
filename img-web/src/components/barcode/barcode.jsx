import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

export const Barcode = ({ value }) => {
  const barcodeRef = useRef(null);

  useEffect(() => {
    if (barcodeRef.current) {
      JsBarcode(barcodeRef.current, value, {
        format: "CODE128",
        lineColor: "#000",
        width: 4,
        height: 40,
        displayValue: true,
      });
    }
  }, [value]);

  return (
    <div>
      <svg ref={barcodeRef}></svg>
    </div>
  );
};

export default Barcode;
