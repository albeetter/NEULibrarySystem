import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { DatabaseService } from '../services/DatabaseService';
import { useNavigate } from 'react-router-dom';

const VisitorLogs = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState<'weekly' | 'monthly' | 'custom'>('weekly');

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }

    const unsubscribe = DatabaseService.subscribeToVisits((liveData) => {
      setVisits(liveData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, navigate]);

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  // Filtering Logic
  const filteredVisits = visits.filter(visit => {
    const matchesSearch = 
      visit.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.userAffiliation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.purpose?.toLowerCase().includes(searchTerm.toLowerCase());
      
    if (!matchesSearch) return false;

    const visitDate = new Date(visit.timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - visitDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (timeFilter === 'weekly') return diffDays <= 7;
    if (timeFilter === 'monthly') return diffDays <= 30;
    return true; 
  });

  // Export Logic
  const exportToCSV = () => {
    if (filteredVisits.length === 0) return alert("No data to export!");

    const headers = ["Date", "Time", "Visitor Name", "Affiliation", "Purpose"];
    const csvRows = filteredVisits.map(visit => {
      const dateObj = new Date(visit.timestamp);
      const date = dateObj.toLocaleDateString();
      const time = dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      return `"${date}","${time}","${visit.userName}","${visit.userAffiliation}","${visit.purpose}"`;
    });

    const csvString = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `library_visits_report_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-sans min-h-screen flex flex-col antialiased relative">
      
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#111318]/90 backdrop-blur-md shrink-0">
        <div className="px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/admin/dashboard')}>
            <div className="h-8 w-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined">local_library</span>
            </div>
            <h1 className="text-lg font-bold tracking-tight">NEU Library Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={handleSignOut} className="flex items-center gap-3 pl-2 pr-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold leading-none">{user?.name || 'Admin User'}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Sign Out</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 font-bold">
                {user?.name?.charAt(0) || 'A'}
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-8 w-full max-w-[1400px] mx-auto flex flex-col h-full overflow-hidden">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 shrink-0">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Visitor Logs</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl">
              Comprehensive view of all library check-ins. Filter, search, and export facility usage data.
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={exportToCSV}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">download</span>
              Export to CSV
            </button>
            <button 
              onClick={() => navigate('/admin/dashboard')} 
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">dashboard</span>
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white dark:bg-[#1c1f27] rounded-xl border border-slate-200 dark:border-slate-800 p-5 mb-6 shadow-sm shrink-0">
          <div className="flex flex-col lg:flex-row gap-5 justify-between items-center">
            <div className="relative w-full lg:w-1/2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <span className="material-symbols-outlined text-[22px]">search</span>
              </span>
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#111318] border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-slate-400 dark:text-white" 
                placeholder="Search logs by Name, Affiliation, or Purpose..." 
              />
            </div>
            
            <div className="flex bg-slate-100 dark:bg-[#111318] border border-slate-200 dark:border-slate-700 rounded-lg p-1 w-full lg:w-auto">
              <button onClick={() => setTimeFilter('weekly')} className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${timeFilter === 'weekly' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>Weekly</button>
              <button onClick={() => setTimeFilter('monthly')} className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${timeFilter === 'monthly' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>Monthly</button>
              <button onClick={() => setTimeFilter('custom')} className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${timeFilter === 'custom' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>All Time</button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-[#1c1f27] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex-1 flex flex-col min-h-0">
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="sticky top-0 bg-slate-50 dark:bg-[#282e39] z-10">
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Visitor Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Affiliation</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Purpose</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading logs...</td></tr>
                ) : filteredVisits.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No logs found matching your criteria.</td></tr>
                ) : (
                  filteredVisits.map((visit, i) => {
                    const dateObj = new Date(visit.timestamp);
                    const avatarColors = ['from-blue-500 to-indigo-600', 'from-purple-500 to-pink-600', 'from-orange-500 to-amber-600', 'from-emerald-400 to-teal-500'];
                    const colorClass = avatarColors[i % avatarColors.length];

                    return (
                      <tr key={visit.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-slate-900 dark:text-white">{dateObj.toLocaleDateString()}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center text-white font-bold text-xs shadow-sm`}>
                              {visit.userName.charAt(0)}
                            </div>
                            <span className="font-medium text-slate-900 dark:text-white">{visit.userName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{visit.userAffiliation}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 capitalize">{visit.purpose}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                            Logged
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1c1f27]">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Showing <span className="font-semibold text-slate-900 dark:text-white">{filteredVisits.length}</span> logs
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VisitorLogs;