// src/components/DashboardScreen.tsx
import React, { useEffect, useState } from 'react';
import { getAllEntriesFromS3 } from '../utils/s3Storage'; // Changed import
import { MeasurementEntry } from '../types';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ChartOptions, ChartData } from 'chart.js';

ChartJS.register( CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend );

interface MetricChartData { labels: string[]; datasets: { label: string; data: (number | null)[]; borderColor: string; tension: number; fill: boolean; }[]; }
interface AllChartData { weight: MetricChartData; bmi: MetricChartData; bodyFat: MetricChartData; muscleMass: MetricChartData; visceralFat: MetricChartData; }

function DashboardScreen(): JSX.Element {
  const [chartData, setChartData] = useState<AllChartData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError('');
        const data: MeasurementEntry[] = await getAllEntriesFromS3();
        if (data.length > 0) {
          data.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          const labels = data.map(item => new Date(item.timestamp).toLocaleDateString());
          const createDataset = (label: string, metricData: (number | null)[], borderColor: string): MetricChartData => ({
             labels, datasets: [{ label, data: metricData, borderColor, tension: 0.1, fill: false }]
          });
          setChartData({
            weight: createDataset('体重 (Weight) (kg)', data.map(item => item.weight), 'rgb(75, 192, 192)'),
            bmi: createDataset('BMI', data.map(item => item.bmi), 'rgb(255, 99, 132)'),
            bodyFat: createDataset('体脂肪率 (Body Fat Percentage) (%)', data.map(item => item.bodyFat), 'rgb(54, 162, 235)'),
            muscleMass: createDataset('筋肉量 (Muscle Mass) (kg)', data.map(item => item.muscleMass), 'rgb(255, 206, 86)'),
            visceralFat: createDataset('内臓脂肪量 (Visceral Fat Level)', data.map(item => item.visceralFat), 'rgb(153, 102, 255)')
          });
        } else {
          setChartData(null); // No data found
        }
      } catch (err) {
        console.error(err);
        setError('データの読み込みに失敗しました。(Failed to load data.)');
        setChartData(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const getChartOptions = (titleText: string): ChartOptions<'line'> => ({ responsive: true, plugins: { legend: { position: 'top' as const }, title: { display: true, text: titleText }, }, scales: { y: { beginAtZero: false } } });

  if (isLoading) {
    return <div className="container"><h1 className="screen-title">ダッシュボード (Dashboard)</h1><p>読み込み中 (Loading data...)</p></div>;
  }
  if (error) {
    return <div className="container"><h1 className="screen-title">ダッシュボード (Dashboard)</h1><p className="error-message">{error}</p></div>;
  }
  if (!chartData) {
    return (
      <div className="container">
        <h1 className="screen-title">ダッシュボード (Dashboard)</h1>
        <p>データがありません。入力画面からデータを記録してください。(No data available. Please record data from the input screen.)</p>
      </div>
    );
  }

  const renderChart = (dataKey: keyof AllChartData, title: string) => {
     const specificChartData = chartData[dataKey];
     if (specificChartData.datasets[0].data.some(d => d !== null)) {
         return <Line options={getChartOptions(title)} data={specificChartData as ChartData<'line', (number | null)[]>} />;
     }
     return <p style={{ textAlign: 'center', padding: '1em' }}>{title} のデータがありません。(No data for {title})</p>;
  };

  return (
    <div className="container">
      <h1 className="screen-title">ダッシュボード (Dashboard)</h1>
      <div className="chart-container">{renderChart('weight', '体重推移 (Weight Trend)')}</div>
      <div className="chart-container">{renderChart('bmi', 'BMI推移 (BMI Trend)')}</div>
      <div className="chart-container">{renderChart('bodyFat', '体脂肪率推移 (Body Fat Percentage Trend)')}</div>
      <div className="chart-container">{renderChart('muscleMass', '筋肉量推移 (Muscle Mass Trend)')}</div>
      <div className="chart-container">{renderChart('visceralFat', '内臓脂肪量推移 (Visceral Fat Level Trend)')}</div>
    </div>
  );
}
export default DashboardScreen;
