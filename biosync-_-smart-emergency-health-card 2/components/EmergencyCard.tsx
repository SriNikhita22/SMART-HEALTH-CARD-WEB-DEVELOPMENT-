import React, { useEffect, useRef } from 'react';
import { UserHealthData } from '../types';

interface EmergencyCardProps {
  data: UserHealthData;
  theme: 'dark' | 'light';
}

declare const QRCode: any;

export const EmergencyCard: React.FC<EmergencyCardProps> = ({ data, theme }) => {
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
        width: 128,
        height: 128,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.M
      });
    }
  }, [data]);

  const isDark = theme === 'dark';

  return (
    <div className={`w-full max-md mx-auto aspect-[1.586/1] ${isDark ? 'bg-[#0f172a]' : 'bg-white'} rounded-[2rem] overflow-hidden shadow-2xl relative border-4 border-red-500/10 transition-colors`}>
      <div className="h-1/3 bg-red-600 p-6 flex justify-between items-start text-white">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full border-2 border-white/20 overflow-hidden bg-white/10 flex items-center justify-center shrink-0">
            {data.profileImage ? (
              <img src={data.profileImage} alt="User" className="w-full h-full object-cover" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-widest italic">EMERGENCY</h3>
            <p className="text-[10px] opacity-80 font-medium uppercase tracking-tighter">SMART MEDICAL IDENTIFICATION</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-black leading-none">{data.bloodGroup}</div>
          <div className="text-[10px] opacity-80 uppercase font-bold tracking-widest">Blood Type</div>
        </div>
      </div>

      <div className="p-6 relative">
        <div className="flex justify-between h-full">
          <div className="flex-grow pr-4">
            <h4 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'} leading-tight mb-1`}>{data.fullName}</h4>
            <div className="flex items-center space-x-2 text-red-600 font-bold text-base mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              <span>{data.emergencyContact}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-[10px]">
              <div>
                <span className="block font-black text-gray-400 uppercase tracking-widest mb-0.5">Allergies</span>
                <span className={`block font-bold ${isDark ? 'text-white' : 'text-slate-700'} break-words line-clamp-1`}>{data.allergies || 'NONE'}</span>
              </div>
              <div>
                <span className="block font-black text-gray-400 uppercase tracking-widest mb-0.5">Chronic</span>
                <span className={`block font-bold ${isDark ? 'text-white' : 'text-slate-700'} break-words line-clamp-1`}>{data.chronicDiseases || 'NONE'}</span>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 flex flex-col items-center justify-center -mt-2">
            <div className="p-1.5 bg-white rounded-xl shadow-lg border border-gray-100">
               <div ref={qrRef} className="qr-container w-16 h-16"></div>
            </div>
            <span className={`text-[8px] font-black uppercase tracking-[0.2em] mt-2 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>Scan ID</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-0 right-0 px-6 opacity-20">
        <svg viewBox="0 0 100 20" className="w-full h-4 text-red-500 stroke-current fill-none">
          <path d="M0 10 L40 10 L45 5 L50 15 L55 0 L60 20 L65 10 L100 10" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
};