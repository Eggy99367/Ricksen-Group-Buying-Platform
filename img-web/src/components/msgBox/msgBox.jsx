import React, { useEffect, useState } from 'react';
import './msgBox.css';

export const MsgBox = ({ message, bgColor = 'white', duration = 3000, visible}) => {
  const [isVisible, setIsVisible] = useState(visible);

  useEffect(() => {
    let timer;
    if (visible) {
      setIsVisible(true);
      timer = setTimeout(() => {
        setIsVisible(false);
      }, duration);
    }
    return () => clearTimeout(timer);
  }, [visible, duration]);

  if (!isVisible) return null;

  return (
    <div className="message-box" style={{ backgroundColor: bgColor }}>
      {message}
    </div>
  );
};

export default MsgBox;
