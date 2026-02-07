import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { RegistrationForm } from './components/RegistrationForm';
import { EmergencyCard } from './components/EmergencyCard';
import { UserHealthData } from './types';
import { HealthInsight } from './components/HealthInsight';
import { QRCodeSection } from './components/QRCodeSection';
import { CareChainView } from './components/CareChainView';

const App: React.FC = () => {
  const [userData, setUserData] = useState<UserHealthData | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [currentView, setCurrentView] = useState<'dashboard' | 'carechain'>('dashboard');

  useEffect(() => {
    const savedData = localStorage.getItem('biosync_health_data');
    if (savedData) {
      try {
        setUserData(JSON.parse(savedData));
      } catch (e) {
        console.error("Failed to parse local medical data", e);
      }
    }
    const savedTheme = localStorage.getItem('biosync_theme') as 'dark' | 'light';
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem('biosync_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const handleSave = (data: UserHealthData) => {
    localStorage.setItem('biosync_health_data', JSON.stringify(data));
    setUserData(data);
    setIsEditMode(false);
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear your medical profile? This action cannot be undone.")) {
      localStorage.removeItem('biosync_health_data');
      localStorage.removeItem('biosync_timeline');
      localStorage.removeItem('biosync_timeline_last_updated');
      setUserData(null);
      setIsEditMode(false);
      setCurrentView('dashboard');
    }
  };

  const bgColor = theme === 'dark' ? 'bg-[#0b0f19]' : 'bg-[#f4f7f6]';
  const textColor = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const subTextColor = theme === 'dark' ? 'text-white/60' : 'text-slate-500';

  const getBMICategory = (bmi?: number) => {
    if (!bmi) return null;
    if (bmi < 18.5) return { label: 'Underweight', text: 'text-blue-500' };
    if (bmi < 25) return { label: 'Normal', text: 'text-green-500' };
    if (bmi < 30) return { label: 'Overweight', text: 'text-yellow-600' };
    return { label: 'Obese', text: 'text-red-500' };
  };

  return (
    <div className={`min-h-screen flex flex-col ${bgColor} ${textColor} transition-colors duration-300`}>
      <Header theme={theme} onToggleTheme={toggleTheme} />
      
      <main className="flex-grow container mx-auto px-4 py-12 max-w-5xl">
        {!userData || isEditMode ? (
          <div className="animate-in fade-in duration-500 max-w-3xl mx-auto">
            <div className="text-center mb-14">
              <h2 className={`text-5xl md:text-6xl font-black ${textColor} tracking-tighter mb-4 leading-tight`}>
                {userData ? 'Update Your Medical Identity' : 'Secure Registration'}
              </h2>
              <p className={`text-xl ${subTextColor} font-medium`}>Your data is stored locally and encrypted for your privacy.</p>
            </div>
            <RegistrationForm 
              theme={theme}
              key={userData ? `edit-${userData.lastUpdated}` : 'new-form'}
              initialData={userData || undefined} 
              onSave={handleSave} 
              onCancel={userData ? () => setIsEditMode(false) : undefined}
            />
          </div>
        ) : currentView === 'carechain' ? (
          <CareChainView 
            data={userData} 
            theme={theme} 
            onBack={() => setCurrentView('dashboard')} 
          />
        ) : (
          <div className="animate-in slide-in-from-bottom duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14 gap-8">
              <div className="flex items-center space-x-6">
                {userData.profileImage && (
                  <div className="w-24 h-24 rounded-full border-4 border-white/5 overflow-hidden shadow-2xl">
                    <img src={userData.profileImage} alt="User" className="w-full h-full object-cover" />
                  </div>
                )}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                     <span className="px-3 py-1 bg-green-500/20 text-green-500 text-[10px] font-black rounded-full uppercase tracking-widest border border-green-500/30">Active Profile</span>
                  </div>
                  <h2 className={`text-6xl font-black ${textColor} tracking-tighter`}>BioSync Dashboard</h2>
                  <p className={`text-xl ${subTextColor} mt-2 font-medium`}>Manage your emergency card and secure medical insights.</p>
                </div>
              </div>
              <div className="flex space-x-4 w-full md:w-auto">
                <button 
                  onClick={() => setCurrentView('carechain')}
                  className="flex-1 md:flex-none px-10 py-4 text-lg font-black bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20"
                >
                  View CareChain
                </button>
                <button 
                  onClick={handleEdit}
                  className="flex-1 md:flex-none px-10 py-4 text-lg font-black text-red-500 border-2 border-red-500/20 rounded-2xl hover:bg-red-500/10 hover:border-red-500/40 transition-all"
                >
                  Edit Profile
                </button>
                <button 
                  onClick={handleClear}
                  className={`hidden md:block px-6 py-4 text-sm font-black ${theme === 'dark' ? 'text-white/20' : 'text-slate-300'} hover:text-red-500 transition-colors`}
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-12">
                {/* Physical Metrics Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { label: 'Gender', value: userData.gender || '--', color: 'text-purple-500' },
                    { label: 'Height', value: userData.height ? `${userData.height} cm` : '--', color: 'text-blue-500' },
                    { label: 'Weight', value: userData.weight ? `${userData.weight} kg` : '--', color: 'text-green-500' },
                    { label: 'BMI', value: userData.bmi || '--', color: getBMICategory(userData.bmi)?.text || 'text-red-500' }
                  ].map((metric, i) => (
                    <div key={i} className="glass p-6 rounded-3xl text-center border-t-4 border-t-white/5 hover:border-t-red-500/30 transition-all">
                      <span className={`block text-[10px] font-black uppercase tracking-widest ${subTextColor} mb-1`}>{metric.label}</span>
                      <span className={`text-2xl font-black tracking-tight ${metric.color}`}>{metric.value}</span>
                    </div>
                  ))}
                </div>

                <div className="glass p-10 md:p-14 rounded-[4rem] relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-all duration-700">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-48 w-48" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                     </svg>
                   </div>
                   <h3 className={`text-[11px] font-black ${theme === 'dark' ? 'text-white/30' : 'text-slate-400'} uppercase tracking-[0.5em] mb-10 text-center`}>Identity Verification Layer</h3>
                   <EmergencyCard data={userData} theme={theme} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <QRCodeSection data={userData} theme={theme} />
                  <div className="space-y-10">
                    <HealthInsight data={userData} theme={theme} />
                    <div className="glass p-10 rounded-[3rem]">
                      <h3 className={`text-2xl font-black ${textColor} mb-8 flex items-center`}>
                        <span className="w-3 h-3 bg-green-500 rounded-full mr-4 shadow-[0_0_10px_rgba(34,197,94,0.6)]"></span>
                        Trusted Network
                      </h3>
                      <ul className="space-y-8">
                        <li className="flex items-start">
                          <div className={`bg-blue-500/10 p-4 rounded-2xl mr-5 text-2xl glass-icon`}>📲</div>
                          <div>
                            <p className={`font-black ${textColor} text-base`}>Lock Screen Setup</p>
                            <p className={`text-sm ${subTextColor} mt-1 leading-relaxed`}>Set your BioSync QR as your lock screen wallpaper for instant responder access.</p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className={`bg-red-500/10 p-4 rounded-2xl mr-5 text-2xl glass-icon`}>🆘</div>
                          <div>
                            <p className={`font-black ${textColor} text-base`}>Emergency Mode</p>
                            <p className={`text-sm ${subTextColor} mt-1 leading-relaxed`}>First responders are trained to check for digital medical IDs on mobile devices.</p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-12">
                <div className="bg-red-600 p-12 rounded-[3.5rem] text-white shadow-2xl shadow-red-900/40 relative overflow-hidden group">
                  <div className="absolute -right-16 -bottom-16 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-80 w-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h3 className="text-4xl font-black mb-6 tracking-tighter">Rescue Protocol</h3>
                  <p className="text-xl opacity-90 leading-relaxed mb-10 font-medium">BioSync profiles provide critical data in the "Golden Hour" of emergency response.</p>
                  <div className="bg-white/10 p-8 rounded-3xl border border-white/20 backdrop-blur-xl">
                    <p className="text-[12px] uppercase font-black tracking-[0.2em] opacity-70 mb-2">Identity Status</p>
                    <p className="text-3xl font-black italic tracking-tighter">ENCRYPTED & ACTIVE</p>
                  </div>
                </div>

                <div className="glass p-10 rounded-[3rem]">
                  <h4 className={`font-black ${subTextColor} mb-6 uppercase text-[11px] tracking-[0.3em]`}>Digital Sovereignty</h4>
                  <p className={`text-base ${subTextColor} leading-relaxed font-medium`}>
                    All BioSync data is non-custodial. We do not maintain databases of your medical information. You are the sole owner of your health keys.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className={`py-14 text-center ${subTextColor} text-xs border-t ${theme === 'dark' ? 'border-white/5' : 'border-slate-200'} mt-20`}>
        <p className={`font-black uppercase tracking-[0.4em] mb-3 ${theme === 'dark' ? 'text-white/10' : 'text-slate-300'}`}>BioSync Global Emergency Network</p>
        <p className="font-medium">&copy; {new Date().getFullYear()} - Decentralized Medical Identity v2.4.</p>
      </footer>
    </div>
  );
};

export default App;