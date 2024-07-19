import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, TimeScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(TimeScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const convertToDate = (datetimeStr) => {
  console.log("ok");
  const [datePart, timePart] = datetimeStr.split('T');
  const [year, month, day] = datePart.split('-');
  const [hours, minutes, seconds] = timePart.split(':');
  
  return new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));
};

const ClickLineChart = ({ timestamps, totalFollowers }) => {
  const clickRates = timestamps.map((_, index) => {
    return (index + 1) / totalFollowers;
  });

  const formattedTimestamps = timestamps.map(convertToDate);

  const data = {
    labels: formattedTimestamps,
    datasets: [
      {
        label: 'Click Rate',
        data: clickRates,
        fill: false,
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
      },
    ],
  };

  const options = {
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'minute',
          displayFormats: {
            minute: 'MMM d, HH:mm',
            hour: 'MMM d, HH:mm',
            day: 'MMM d',
          },
          tooltipFormat: 'PPpp',
        },
        title: {
          display: true,
          text: 'Timestamp',
        },
        distribution: 'linear',
        ticks: {
          source: 'labels',
          autoSkip: true,
          maxTicksLimit: 10,
        },
      },
      y: {
        beginAtZero: true,
        max: 1,
        title: {
          display: true,
          text: 'Click Rate',
        },
      },
    },
  };

  return (
    <div classname = "chart" style={{ height: '450px' , width: '100000px'}}>
      <Line data={data} options={options} />
    </div>
  );
};

export default ClickLineChart;
