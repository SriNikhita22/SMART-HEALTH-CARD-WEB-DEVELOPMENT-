import React, { useEffect, useRef } from 'react';
import { UserHealthData } from '../types';

interface QRCodeSectionProps {
  data: UserHealthData;
  theme: 'dark' | 'light';
}

declare const QRCode: any;

export const QRCodeSection: React.FC<QRCodeSectionProps> = ({ data, theme }) => {
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (qrRef.current && typeof QRCode !== 'undefined') {
      qrRef.current.innerHTML = '';
      const baseUrl = window.location.origin + window.location.pathname.replace('index.html', '').replace(/\/$/, '');
      
      const params = new URLSearchParams({
        n: data.fullName || 'Unknown',
        a: (data.age || 'N/A').toString(),
        bg: data.bloodGroup || '--',
        al: data.allergies || 'None',
        cc: data.chronicDiseases || 'None',
        m: data.currentMedications || 'None',
        s: data.pastSurgeries || 'None',
        ec: data.emergencyContact || '',
        ht: (data.height || 'N/A').toString(),
        wt: (data.weight || 'N/A').toString(),
        bmi: (data.bmi || 'N/A').toString()
      });

      const cardUrl = `${baseUrl}/rescue.html?${params.toString()}`;

      new QRCode(qrRef.current, {
        text: cardUrl,
        width: 320,
        height: 320,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
      });
    }
  }, [data]);

  const handleDownload = () => {
    const img = qrRef.current?.querySelector('img');
    const canvas = qrRef.current?.querySelector('canvas');
    if (img || canvas) {
      const link = document.createElement('a');
      link.download = `BioSync-Emergency-QR-${data.fullName.replace(/\s+/g, '-')}.png`;
      link.href = img ? img.src : (canvas as HTMLCanvasElement).toDataURL('image/png');
      link.click();
    }
  };

  return (
    <div className="glass p-10 rounded-[3rem] shadow-2xl flex flex-col items-center text-center transition-colors">
      <div className="mb-8">
        <h3 className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'} mb-2`}>Emergency QR</h3>
        <p className={`text-base ${theme === 'dark' ? 'text-white/40' : 'text-slate-500'} font-medium max-w-[280px] mx-auto leading-relaxed`}>High-res key for lock screen and responders.</p>
      </div>
      
      <div className={`p-1 bg-gradient-to-br ${theme === 'dark' ? 'from-white/20' : 'from-slate-200'} to-transparent rounded-[2.8rem] shadow-2xl mb-10`}>
        <div className="p-6 bg-white rounded-[2.5rem] shadow-xl ring-1 ring-slate-200 overflow-hidden w-full max-w-[220px]">
          <div ref={qrRef} className="qr-container w-full aspect-square flex items-center justify-center"></div>
        </div>
      </div>

      <button
        onClick={handleDownload}
        className="w-full flex items-center justify-center space-x-3 bg-red-600 text-white font-black py-4 px-8 rounded-2xl hover:bg-red-700 active:scale-95 transition-all shadow-xl shadow-red-600/20 text-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
        <span>Download QR</span>
      </button>
    </div>
  );
};