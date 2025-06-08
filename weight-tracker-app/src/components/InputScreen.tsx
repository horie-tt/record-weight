// src/components/InputScreen.tsx
import React, { useState } from 'react';
import { saveEntryToS3 } from '../utils/s3Storage'; // Changed import
import { MeasurementEntry } from '../types';

function InputScreen(): JSX.Element {
  const [weight, setWeight] = useState<string>('');
  const [bmi, setBmi] = useState<string>('');
  const [bodyFat, setBodyFat] = useState<string>('');
  const [muscleMass, setMuscleMass] = useState<string>('');
  const [visceralFat, setVisceralFat] = useState<string>('');

  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    const timestamp = new Date().toISOString();
    const data: MeasurementEntry = {
      id: Date.now(), // Consider a more robust ID generation if needed (e.g., UUID)
      timestamp,
      weight: weight !== '' ? parseFloat(weight) : null,
      bmi: bmi !== '' ? parseFloat(bmi) : null,
      bodyFat: bodyFat !== '' ? parseFloat(bodyFat) : null,
      muscleMass: muscleMass !== '' ? parseFloat(muscleMass) : null,
      visceralFat: visceralFat !== '' ? parseFloat(visceralFat) : null,
    };

    try {
      await saveEntryToS3(data);
      setMessage('データがS3に保存されました！ (Data saved to S3 successfully!)');
      setWeight('');
      setBmi('');
      setBodyFat('');
      setMuscleMass('');
      setVisceralFat('');
    } catch (err) {
      console.error(err);
      setError('データの保存に失敗しました。(Failed to save data.)');
    } finally {
      setIsLoading(false);
      setTimeout(() => {
         setMessage('');
         setError('');
      }, 5000); // Clear messages after 5 seconds
    }
  };

  return (
    <div className="container">
      <h1 className="screen-title">体重等の入力 (Input Weight, etc.)</h1>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
         <div>
           <label>
             体重 (Weight) (kg):
             <input type="number" step="0.01" value={weight} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWeight(e.target.value)} required disabled={isLoading} />
           </label>
         </div>
         <div>
           <label>
             BMI:
             <input type="number" step="0.1" value={bmi} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBmi(e.target.value)} disabled={isLoading} />
           </label>
         </div>
         <div>
           <label>
             体脂肪率 (Body Fat Percentage) (%):
             <input type="number" step="0.1" value={bodyFat} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBodyFat(e.target.value)} disabled={isLoading} />
           </label>
         </div>
         <div>
           <label>
             筋肉量 (Muscle Mass) (kg):
             <input type="number" step="0.1" value={muscleMass} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMuscleMass(e.target.value)} disabled={isLoading} />
           </label>
         </div>
         <div>
           <label>
             内臓脂肪量 (Visceral Fat Level):
             <input type="number" step="0.1" value={visceralFat} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVisceralFat(e.target.value)} disabled={isLoading} />
           </label>
         </div>
         <button type="submit" disabled={isLoading}>
           {isLoading ? '保存中 (Saving...)' : '記録 (Record)'}
         </button>
      </form>
    </div>
  );
}
export default InputScreen;
