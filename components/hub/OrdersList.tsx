
import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { StoryOrder, Partner, Story } from '../../types';
import { Loader2, FileJson, Eye, X, Filter, RefreshCw, ChevronDown, ChevronUp, Zap, ListChecks, Bot, Mic2, Clapperboard, Video, MessageSquare } from 'lucide-react';

interface OrdersListProps {
    partners: Partner[];
}

export const OrdersList: React.FC<OrdersListProps> = ({ partners }) => {
    const [orders, setOrders] = useState<StoryOrder[]>([]);
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<any | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
    
    // Filters
    const [statusFilter, setStatusFilter] = useState<string>('ALL');

    const fetchData = async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            // 1. Pobierz Bajki
            const { data: storiesData } = await supabase
                .schema('PartnersApp')
                .from('Stories')
                .select('Id, StoryTitle');
            
            if (storiesData) setStories(storiesData);

            // 2. Pobierz Zamówienia
            const { data: ordersData, error } = await supabase
                .schema('PartnersApp')
                .from('StoryOrders')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            setOrders(ordersData || []);

        } catch (err: any) {
            console.error("Data fetch error:", err);
            setErrorMsg(err.message || "Błąd pobierania danych.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getStoryTitle = (id: number | null) => {
        if (!id) return <span className="text-slate-300">-</span>;
        const story = stories.find(s => s.Id === id);
        return story ? story.StoryTitle : <span className="text-slate-400 font-mono">ID:{id}</span>;
    };

    const getPartnerSlug = (id: number | null) => {
        if (!id) return <span className="text-slate-300">-</span>;
        const partner = partners.find(p => p.Id === id);
        return partner ? partner.Slug : <span className="text-slate-400 font-mono">ID:{id}</span>;
    };

    const toggleRow = (orderId: number) => {
        setExpandedOrderId(prev => prev === orderId ? null : orderId);
    };

    const handleAction = (actionName: string) => {
        alert(`Funkcja "${actionName}" dostępna wkrótce!`);
    };

    const filteredOrders = orders.filter(o => {
        if (statusFilter === 'ALL') return true;
        return o.Status === statusFilter;
    });

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Completed': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'QuestionnaireToApprove': return 'bg-blue-50 text-blue-700 border-blue-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    return (
        <div className="w-full max-w-[1400px] mx-auto animate-in fade-in duration-300">
            {/* Modal JSON Viewer */}
            {selectedQuestionnaire && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedQuestionnaire(null)}>
                    <div className="bg-white rounded-lg w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 font-mono">
                                <FileJson size={14} className="text-blue-500"/> 
                                PAYLOAD_VIEWER
                            </h3>
                            <button onClick={() => setSelectedQuestionnaire(null)} className="text-slate-400 hover:text-slate-700 transition-colors"><X size={18} /></button>
                        </div>
                        <div className="flex-1 overflow-auto bg-[#0d1117] p-4">
                            <pre className="text-[11px] font-mono text-[#e6edf3] leading-relaxed whitespace-pre-wrap">
                                {JSON.stringify(selectedQuestionnaire, null, 2)}
                            </pre>
                        </div>
                    </div>
                </div>
            )}

            {/* Header & Controls */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 pb-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">Zamówienia</h2>
                    <p className="text-xs text-slate-500 mt-1">
                        Widok techniczny tabeli <span className="font-mono text-slate-600">birthdays.StoryOrders</span>
                    </p>
                </div>
                
                <div className="flex items-center gap-2">
                    <div className="flex bg-white rounded-md border border-slate-200 p-0.5 shadow-sm">
                        {['ALL', 'QuestionnaireToApprove', 'Completed'].map(status => (
                            <button 
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide rounded-[4px] transition-all ${
                                    statusFilter === status 
                                    ? 'bg-slate-800 text-white shadow-sm' 
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                }`}
                            >
                                {status === 'ALL' ? 'Wszystkie' : status}
                            </button>
                        ))}
                    </div>
                    <button onClick={fetchData} className="p-2 bg-white border border-slate-200 text-slate-500 hover:text-blue-600 rounded-md shadow-sm transition-colors" title="Odśwież">
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {errorMsg && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-md text-red-600 text-xs font-medium flex items-center gap-2">
                    <X size={14} /> {errorMsg}
                </div>
            )}

            {/* Table Container */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="py-3 px-4 w-10"></th>
                                <th className="py-3 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-20">ID</th>
                                <th className="py-3 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-32">Data</th>
                                <th className="py-3 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Partner (Slug)</th>
                                <th className="py-3 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Bajka (Title)</th>
                                <th className="py-3 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status (Raw)</th>
                                <th className="py-3 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right w-24">Dane</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-slate-400">
                                        <div className="flex justify-center items-center gap-2 text-xs">
                                            <Loader2 className="animate-spin" size={16} /> Ładowanie rekordów...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-8 text-center text-xs text-slate-400 font-medium">
                                        Brak wyników dla wybranych filtrów.
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <React.Fragment key={order.OrderId}>
                                        <tr 
                                            onClick={() => toggleRow(order.OrderId)}
                                            className={`group hover:bg-slate-50/80 transition-colors cursor-pointer ${expandedOrderId === order.OrderId ? 'bg-slate-50' : ''}`}
                                        >
                                            {/* Expand Icon */}
                                            <td className="py-3 px-4 text-slate-400 text-center">
                                                {expandedOrderId === order.OrderId ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </td>

                                            {/* OrderId */}
                                            <td className="py-3 px-4 font-mono text-xs font-medium text-slate-500">
                                                #{order.OrderId}
                                            </td>
                                            
                                            {/* Created At */}
                                            <td className="py-3 px-4 text-xs text-slate-600 font-medium">
                                                {new Date(order.created_at).toLocaleDateString('pl-PL')}
                                                <span className="text-slate-400 ml-1 text-[10px]">
                                                    {new Date(order.created_at).toLocaleTimeString('pl-PL', {hour: '2-digit', minute:'2-digit'})}
                                                </span>
                                            </td>
                                            
                                            {/* Partner Slug */}
                                            <td className="py-3 px-4 text-xs font-semibold text-slate-700">
                                                {getPartnerSlug(order.PartnerId)}
                                            </td>
                                            
                                            {/* Story Title */}
                                            <td className="py-3 px-4 text-xs font-semibold text-slate-800">
                                                {getStoryTitle(order.StoryId)}
                                            </td>
                                            
                                            {/* Status 1:1 */}
                                            <td className="py-3 px-4">
                                                <span className={`inline-block px-2 py-0.5 rounded border text-[10px] font-mono font-bold tracking-tight ${getStatusStyle(order.Status)}`}>
                                                    {order.Status}
                                                </span>
                                            </td>
                                            
                                            {/* Actions */}
                                            <td className="py-3 px-4 text-right">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); setSelectedQuestionnaire(order.Questionnaire); }}
                                                    className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                                                    title="Pokaż JSON"
                                                >
                                                    <FileJson size={16} />
                                                </button>
                                            </td>
                                        </tr>

                                        {/* EXPANDED ROW */}
                                        {expandedOrderId === order.OrderId && (
                                            <tr className="bg-slate-50/50 shadow-inner">
                                                <td colSpan={7} className="p-0">
                                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-200/50 border-b border-slate-200">
                                                        
                                                        {/* SEKCJA AUTOMAT */}
                                                        <div className="space-y-4">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <div className="p-1.5 bg-purple-100 text-purple-600 rounded-lg">
                                                                    <Zap size={14} />
                                                                </div>
                                                                <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">Automat</h4>
                                                            </div>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                <button 
                                                                    onClick={() => handleAction("Questionnaire-Wideo")}
                                                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-purple-200 text-purple-700 rounded-xl text-xs font-bold shadow-sm hover:bg-purple-50 transition-all active:scale-95"
                                                                >
                                                                    <Clapperboard size={14} /> Questionnaire-Wideo
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleAction("Questionnaire-Eleven")}
                                                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-purple-200 text-purple-700 rounded-xl text-xs font-bold shadow-sm hover:bg-purple-50 transition-all active:scale-95"
                                                                >
                                                                    <Mic2 size={14} /> Questionnaire-Eleven
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* SEKCJA KROK PO KROKU */}
                                                        <div className="space-y-4">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                                                                    <ListChecks size={14} />
                                                                </div>
                                                                <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">Krok po kroku</h4>
                                                            </div>
                                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                                <button 
                                                                    onClick={() => handleAction("Grok")}
                                                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold shadow-sm hover:border-blue-300 hover:text-blue-600 transition-all active:scale-95"
                                                                >
                                                                    <Bot size={14} /> Grok
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleAction("Dynamics")}
                                                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold shadow-sm hover:border-blue-300 hover:text-blue-600 transition-all active:scale-95"
                                                                >
                                                                    <MessageSquare size={14} /> Dynamics
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleAction("Video")}
                                                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold shadow-sm hover:border-blue-300 hover:text-blue-600 transition-all active:scale-95"
                                                                >
                                                                    <Video size={14} /> Video
                                                                </button>
                                                            </div>
                                                        </div>

                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
