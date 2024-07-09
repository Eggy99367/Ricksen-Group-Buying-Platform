import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, TimeScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(TimeScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const convertToDate = (datetimeStr) => {
  const date = new Date(datetimeStr);
  
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-indexed
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
};

const ExposureLineChart = ({ timestamps, totalFollowers }) => {
  const exposureRates = timestamps.map((_, index) => {
    return (index + 1) / totalFollowers;
  });

  const formattedTimestamps = timestamps.map(convertToDate);

  const data = {
    labels: formattedTimestamps,
    datasets: [
      {
        label: 'Exposure Rate',
        data: exposureRates,
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
          text: 'Exposure Rate',
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

export default ExposureLineChart;
