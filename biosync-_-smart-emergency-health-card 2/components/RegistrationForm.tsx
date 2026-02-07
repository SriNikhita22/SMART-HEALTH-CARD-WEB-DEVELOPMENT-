import React, { useState, useEffect, useRef } from 'react';
import { UserHealthData, BloodGroups } from '../types';

interface RegistrationFormProps {
  initialData?: UserHealthData;
  onSave: (data: UserHealthData) => void;
  onCancel?: () => void;
  theme: 'dark' | 'light';
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ initialData, onSave, onCancel, theme }) => {
  const [formData, setFormData] = useState<Partial<UserHealthData>>(
    initialData || {
      fullName: '',
      bloodGroup: '',
      allergies: '',
      chronicDiseases: '',
      currentMedications: '',
      pastSurgeries: '',
      emergencyContact: '',
      gender: '',
      height: undefined,
      weight: undefined,
      bmi: undefined,
      age: undefined,
      profileImage: undefined,
    }
  );

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const calculateBMI = (h?: number, w?: number) => {
    if (h && w && h > 0) {
      const heightInMeters = h / 100;
      const bmi = w / (heightInMeters * heightInMeters);
      return parseFloat(bmi.toFixed(1));
    }
    return undefined;
  };

  useEffect(() => {
    const newBmi = calculateBMI(formData.height, formData.weight);
    if (newBmi !== formData.bmi) {
      setFormData(prev => ({ ...prev, bmi: newBmi }));
    }
  }, [formData.height, formData.weight]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.fullName?.trim()) newErrors.fullName = "Full name is required";
    if (!formData.bloodGroup) newErrors.bloodGroup = "Please select a blood group";
    const phoneDigits = (formData.emergencyContact || '').replace(/\D/g, '');
    if (phoneDigits.length < 10) newErrors.emergencyContact = "Enter a valid 10-digit phone number";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profileImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFormData(prev => ({ ...prev, profileImage: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave({ ...formData as UserHealthData, lastUpdated: new Date().toISOString() });
    }
  };

  const getBMICategory = (bmi?: number) => {
    if (!bmi) return null;
    if (bmi < 18.5) return { label: 'Underweight', color: 'bg-blue-500', text: 'text-blue-500' };
    if (bmi < 25) return { label: 'Normal', color: 'bg-green-500', text: 'text-green-500' };
    if (bmi < 30) return { label: 'Overweight', color: 'bg-yellow-500', text: 'text-yellow-600' };
    return { label: 'Obese', color: 'bg-red-500', text: 'text-red-500' };
  };

  const bmiCategory = getBMICategory(formData.bmi);
  const isDark = theme === 'dark';
  const labelText = isDark ? 'text-white/90' : 'text-slate-800';
  const inputBg = isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-100 border-slate-200 text-slate-900';
  const iconBg = isDark ? 'bg-white/10 border-white/20' : 'bg-slate-200 border-slate-300';

  const inputClasses = (fieldName: string) => 
    `w-full px-4 py-4 rounded-xl border text-lg transition-all outline-none placeholder-gray-400 ${errors[fieldName] ? 'border-red-500 bg-red-500/10' : inputBg} focus:border-red-500 focus:ring-4 focus:ring-red-500/20`;
  
  const labelClasses = `flex items-center text-lg font-bold ${labelText} mb-3 px-1`;
  const iconContainerClasses = `w-10 h-10 ${iconBg} rounded-full flex items-center justify-center mr-3 flex-shrink-0 border`;

  return (
    <form onSubmit={handleSubmit} className="glass p-10 rounded-[2.5rem] shadow-2xl">
      <div className="flex flex-col items-center mb-12">
        <div className="relative">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`relative w-32 h-32 rounded-full cursor-pointer group transition-all duration-300 hover:scale-105 ${isDark ? 'bg-white/5 border-2 border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]' : 'bg-slate-100 border-2 border-slate-200 shadow-lg'} overflow-hidden flex items-center justify-center`}
          >
            {formData.profileImage ? (
              <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-16 w-16 ${isDark ? 'text-white/20' : 'text-slate-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
          </div>
          {formData.profileImage && (
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -top-1 -right-1 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-700 transition-colors z-10"
              title="Remove Profile Image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <div className="mt-4 flex flex-col items-center">
          <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
            {formData.profileImage ? 'Photo uploaded' : 'Upload Profile Photo'}
          </p>
          <div className="flex space-x-4 mt-2">
            <button type="button" onClick={() => fileInputRef.current?.click()} className={`text-xs font-bold px-3 py-1 rounded-full ${isDark ? 'bg-white/10 text-white/80' : 'bg-slate-200 text-slate-700'} hover:opacity-80 transition-opacity`}>
              {formData.profileImage ? 'Change' : 'Choose File'}
            </button>
            {formData.profileImage && (
              <button type="button" onClick={handleRemoveImage} className="text-xs font-bold px-3 py-1 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors">Remove</button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="col-span-1 md:col-span-2">
          <label className={labelClasses}>
            <div className={iconContainerClasses}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            Full Name *
          </label>
          <input type="text" className={inputClasses('fullName')} placeholder="John Doe" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
          {errors.fullName && <p className="text-red-500 text-sm mt-2 font-medium">{errors.fullName}</p>}
        </div>

        <div className="col-span-1">
          <label className={labelClasses}>
            <div className={iconContainerClasses}>
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            Gender
          </label>
          <select className={inputClasses('gender')} value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
            <option value="" className={isDark ? 'bg-[#0b0f19]' : 'bg-white'}>Select Gender</option>
            <option value="Male" className={isDark ? 'bg-[#0b0f19]' : 'bg-white'}>Male</option>
            <option value="Female" className={isDark ? 'bg-[#0b0f19]' : 'bg-white'}>Female</option>
            <option value="Other" className={isDark ? 'bg-[#0b0f19]' : 'bg-white'}>Other</option>
          </select>
        </div>

        <div className="col-span-1">
          <label className={labelClasses}>
            <div className={iconContainerClasses}>
              <span className="font-black text-xs text-blue-500">AGE</span>
            </div>
            Current Age
          </label>
          <input type="number" className={inputClasses('age')} placeholder="e.g. 28" value={formData.age || ''} onChange={e => setFormData({ ...formData, age: parseInt(e.target.value) || undefined })} />
        </div>

        <div className={`col-span-1 md:col-span-2 ${isDark ? 'bg-red-500/5' : 'bg-red-50'} p-6 rounded-2xl border ${isDark ? 'border-red-500/20' : 'border-red-200'}`}>
          <label className={`${labelClasses} text-red-600`}>
            <div className={`${iconContainerClasses} bg-red-600/10 border-red-600/30`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </div>
            Blood Group *
          </label>
          <select className={inputClasses('bloodGroup')} value={formData.bloodGroup} onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}>
            <option value="" className={isDark ? 'bg-[#0b0f19]' : 'bg-white'}>Select Blood Group</option>
            {Object.values(BloodGroups).map(group => (
              <option key={group} value={group} className={isDark ? 'bg-[#0b0f19]' : 'bg-white'}>{group}</option>
            ))}
          </select>
          {errors.bloodGroup && <p className="text-red-500 text-sm mt-2 font-medium">{errors.bloodGroup}</p>}
        </div>

        <div className="col-span-1">
          <label className={labelClasses}>
            <div className={iconContainerClasses}>
              <span className="font-black text-[10px] text-blue-500">CM</span>
            </div>
            Height (cm)
          </label>
          <input type="number" className={inputClasses('height')} placeholder="175" value={formData.height || ''} onChange={e => setFormData({ ...formData, height: parseFloat(e.target.value) || undefined })} />
        </div>

        <div className="col-span-1">
          <label className={labelClasses}>
            <div className={iconContainerClasses}>
              <span className="font-black text-[10px] text-green-500">KG</span>
            </div>
            Weight (kg)
          </label>
          <input type="number" className={inputClasses('weight')} placeholder="70" value={formData.weight || ''} onChange={e => setFormData({ ...formData, weight: parseFloat(e.target.value) || undefined })} />
        </div>

        {/* Repositioned BMI Display below Height and Weight */}
        <div className="col-span-1 md:col-span-2">
          <div className={`p-6 rounded-2xl flex items-center justify-between transition-all ${isDark ? 'bg-white/5 border border-white/10' : 'bg-slate-100 border border-slate-200'}`}>
              <div className="flex items-center">
                 <div className={iconContainerClasses}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                 </div>
                 <div>
                    <span className={`block text-xs font-black uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-slate-400'}`}>Calculated BMI</span>
                    <span className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{formData.bmi || '--'}</span>
                 </div>
              </div>
              {bmiCategory && (
                <div className={`px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest text-white shadow-lg ${bmiCategory.color} animate-in zoom-in duration-300`}>
                  {bmiCategory.label}
                </div>
              )}
           </div>
        </div>

        <div className="col-span-1 md:col-span-2">
          <label className={labelClasses}>
            <div className={iconContainerClasses}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            Past Surgeries
          </label>
          <input type="text" className={inputClasses('pastSurgeries')} placeholder="e.g. Appendectomy (2015), ACL Repair" value={formData.pastSurgeries || ''} onChange={e => setFormData({ ...formData, pastSurgeries: e.target.value })} />
        </div>

        <div className="col-span-1 md:col-span-2">
          <label className={labelClasses}>
            <div className={iconContainerClasses}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            Emergency Phone *
          </label>
          <input type="tel" className={inputClasses('emergencyContact')} placeholder="10-digit mobile number" value={formData.emergencyContact} onChange={e => setFormData({ ...formData, emergencyContact: e.target.value })} />
        </div>

        <div className="col-span-1 md:col-span-2">
          <label className={labelClasses}>
            <div className={iconContainerClasses}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            Allergies
          </label>
          <textarea className={inputClasses('allergies')} rows={2} placeholder="e.g. Peanuts, Penicillin" value={formData.allergies} onChange={e => setFormData({ ...formData, allergies: e.target.value })} />
        </div>
        
        <div className="col-span-1 md:col-span-2">
          <label className={labelClasses}>
            <div className={iconContainerClasses}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            Chronic Conditions
          </label>
          <textarea className={inputClasses('chronicDiseases')} rows={2} placeholder="e.g. Diabetes Type 2, Hypertension" value={formData.chronicDiseases} onChange={e => setFormData({ ...formData, chronicDiseases: e.target.value })} />
        </div>

        <div className="col-span-1 md:col-span-2">
          <label className={labelClasses}>
            <div className={iconContainerClasses}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.618.309a6 6 0 01-3.86.517l-2.388-.477a2 2 0 00-1.022.547l-1.168 1.168a2 2 0 001.414 3.414h15a2 2 0 001.414-3.414l-1.168-1.168z" />
              </svg>
            </div>
            Current Medications
          </label>
          <textarea className={inputClasses('currentMedications')} rows={2} placeholder="e.g. Metformin 500mg, Lisinopril 10mg" value={formData.currentMedications} onChange={e => setFormData({ ...formData, currentMedications: e.target.value })} />
        </div>
      </div>

      <div className="mt-12 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <button type="submit" className="flex-1 bg-red-600 text-white font-black py-5 px-8 rounded-2xl hover:bg-red-700 active:scale-95 transition-all shadow-xl shadow-red-600/20 flex items-center justify-center space-x-3 text-xl">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 00-1 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          <span>Save & Generate Card</span>
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className={`px-10 py-5 ${isDark ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-700'} font-bold rounded-2xl hover:opacity-80 transition-all text-lg`}>Cancel</button>
        )}
      </div>
    </form>
  );
};