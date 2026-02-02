
import React from 'react';
import { Receipt } from 'lucide-react';

export const PartnerSettlements: React.FC = () => (
  <div className="p-8 bg-white rounded-[2rem] shadow-sm border border-slate-100 min-h-[400px] flex flex-col items-center justify-center text-center">
    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-6">
        <Receipt size={40} />
    </div>
    <h2 className="text-3xl font-display font-black text-slate-900 mb-2">Rozliczenia</h2>
    <p className="text-slate-500 text-lg">
       Twoje faktury i historia płatności pojawią się tutaj wkrótce.
    </p>
  </div>
);
