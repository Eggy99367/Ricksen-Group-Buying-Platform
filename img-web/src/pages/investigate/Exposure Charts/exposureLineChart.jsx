import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, TimeScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(TimeScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const convertToDate = (timestamp) => {
  const year = parseInt(timestamp.slice(0, 4), 10);
  const month = parseInt(timestamp.slice(4, 6), 10) - 1; // Months are zero-indexed
  const day = parseInt(timestamp.slice(6, 8), 10);
  const hour = parseInt(timestamp.slice(8, 10), 10);
  const minute = parseInt(timestamp.slice(10, 12), 10);
  const second = parseInt(timestamp.slice(12, 14), 10);

  return new Date(Date.UTC(year, month, day, hour, minute, second));
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
