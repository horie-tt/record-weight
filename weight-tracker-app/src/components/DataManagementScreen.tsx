// src/components/DataManagementScreen.tsx
import React, { useState, useEffect } from 'react';
import { getAllEntriesFromS3, deleteEntryFromS3 } from '../utils/s3Storage'; // Changed import
import { MeasurementEntry } from '../types';
import './DataManagementScreen.css';

function DataManagementScreen(): JSX.Element {
  const [entries, setEntries] = useState<MeasurementEntry[]>([]);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start with loading true
  const [isDeleting, setIsDeleting] = useState<number | null>(null); // Store ID of entry being deleted

  const loadEntries = async (): Promise<void> => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getAllEntriesFromS3();
      data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setEntries(data);
    } catch (err) {
      console.error(err);
      setError('記録の読み込みに失敗しました。(Failed to load records.)');
      setEntries([]); // Clear entries on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const handleDelete = async (entryId: number): Promise<void> => {
    if (window.confirm('この記録を削除してもよろしいですか？ (Are you sure you want to delete this entry?)')) {
      setIsDeleting(entryId);
      setError('');
      setMessage('');
      try {
        await deleteEntryFromS3(entryId);
        setEntries(prevEntries => prevEntries.filter(entry => entry.id !== entryId));
        setMessage('記録が削除されました。(Entry deleted successfully.)');
      } catch (err) {
        console.error(err);
        setError('記録の削除に失敗しました。(Failed to delete entry.)');
      } finally {
        setIsDeleting(null);
        setTimeout(() => {
             setMessage('');
             setError('');
         }, 3000);
      }
    }
  };

  const formatDate = (isoString: string): string => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
        return 'Invalid Date';
    }
    return date.toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return <div className="container"><h1 className="screen-title">データ管理 (Data Management)</h1><p>読み込み中 (Loading records...)</p></div>;
  }

  // Error display for loading entries - only show if it's a loading error and no entries are available
  if (error && entries.length === 0 && !isDeleting) {
     return <div className="container"><h1 className="screen-title">データ管理 (Data Management)</h1><p className="error-message">{error}</p></div>;
  }

  // Message for no data after successful load
  if (!isLoading && entries.length === 0 && !error) {
     return (
       <div className="container">
         <h1 className="screen-title">データ管理 (Data Management)</h1>
         <p>記録されたデータはありません。(No recorded data.)</p>
       </div>
     );
   }

  // Display operational errors (like delete error) above the table if entries are present
  const operationError = error && !isLoading ? <p className="error-message">{error}</p> : null;

  return (
    <div className="container">
      <h1 className="screen-title">データ管理 (Data Management)</h1>
      {message && <p className="success-message">{message}</p>}
      {operationError}
      <table>
        <thead>
          <tr>
            <th>計測日時 (Date/Time)</th>
            <th>体重 (Weight)</th>
            <th>BMI</th>
            <th>体脂肪率 (Body Fat %)</th>
            <th>筋肉量 (Muscle Mass)</th>
            <th>内臓脂肪 (Visceral Fat)</th>
            <th>操作 (Actions)</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(entry => (
            <tr key={entry.id}>
              <td>{formatDate(entry.timestamp)}</td>
              <td>{entry.weight !== null ? entry.weight.toFixed(2) + ' kg' : 'N/A'}</td>
              <td>{entry.bmi !== null ? entry.bmi.toFixed(1) : 'N/A'}</td>
              <td>{entry.bodyFat !== null ? entry.bodyFat.toFixed(1) + ' %' : 'N/A'}</td>
              <td>{entry.muscleMass !== null ? entry.muscleMass.toFixed(1) + ' kg' : 'N/A'}</td>
              <td>{entry.visceralFat !== null ? entry.visceralFat.toFixed(1) : 'N/A'}</td>
              <td>
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="delete-button"
                  disabled={isDeleting === entry.id}
                >
                  {isDeleting === entry.id ? '削除中 (Deleting...)' : '削除 (Delete)'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default DataManagementScreen;
