import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { DatabaseService } from '../services/DatabaseService';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Mock Data for Charts
const weeklyData = [
  { name: 'Mon', current: 120, last: 90 },
  { name: 'Tue', current: 150, last: 110 },
  { name: 'Wed', current: 110, last: 140 },
  { name: 'Thu', current: 180, last: 130 },
  { name: 'Fri', current: 140, last: 120 },
  { name: 'Sat', current: 210, last: 170 },
  { name: 'Sun', current: 160, last: 140 },
];

const distributionData = [
  { name: 'Students', value: 1190 },
  { name: 'Faculty', value: 397 },
];
const COLORS = ['#135bec', '#334155'];

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }

    // Subscribe to live Firebase visits
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

  // Derive some stats from live data (if available), otherwise use fallbacks
  const todayVisits = visits.length > 0 ? visits.length : 1245; 
  const activeNow = Math.floor(todayVisits * 0.25); // Mock active calculation

  const [isOvercrowded, setIsOvercrowded] = useState(false);
  const [todayVisitsCount, setTodayVisitsCount] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState<'weekly' | 'monthly' | 'custom'>('weekly');

  useEffect(() => {
    if (user?.role !== 'admin') { navigate('/'); return; }

    const unsubVisits = DatabaseService.subscribeToVisits((liveData) => {
      setVisits(liveData);
      setLoading(false);
      
      // Calculate today's exact count
      const today = new Date().toDateString();
      const count = liveData.filter(v => new Date(v.timestamp).toDateString() === today).length;
      setTodayVisitsCount(count);
    });

    const unsubStatus = DatabaseService.subscribeToLibraryStatus((status) => {
      setIsOvercrowded(status.isOvercrowded);
    });

    return () => { unsubVisits(); unsubStatus(); };
  }, [user, navigate]);

  const toggleOvercrowded = async () => {
    await DatabaseService.updateLibraryStatus(!isOvercrowded);
  };

  const filteredVisits = visits.filter(visit => {
    // Search Filter
    const matchesSearch = 
      visit.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.userAffiliation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.purpose?.toLowerCase().includes(searchTerm.toLowerCase());
      
    if (!matchesSearch) return false;

    // Time Filter
    const visitDate = new Date(visit.timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - visitDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (timeFilter === 'weekly') return diffDays <= 7;
    if (timeFilter === 'monthly') return diffDays <= 30;
    return true; // 'custom' displays all records
  });

  const exportToCSV = () => {
    if (filteredVisits.length === 0) {
      alert("No data to export!");
      return;
    }

    const headers = ["Date", "Time", "Visitor Name", "Affiliation", "Purpose"];

    const csvRows = filteredVisits.map(visit => {
      const dateObj = new Date(visit.timestamp);
      const date = dateObj.toLocaleDateString();
      const time = dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      return `"${date}","${time}","${visit.userName}","${visit.userAffiliation}","${visit.purpose}"`;
    });

    // 3. Combine headers and rows
    const csvString = [headers.join(","), ...csvRows].join("\n");

    // 4. Create a downloadable Blob
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `library_visits_report_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`);
    
    // Trigger the download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark font-sans text-slate-900 dark:text-slate-100">
      
      {/* Side Navigation */}
      <aside className="flex w-64 flex-col border-r border-slate-200 dark:border-border-dark bg-white dark:bg-background-dark shrink-0">
        <div className="flex flex-col h-full justify-between p-4">
          <div className="flex flex-col gap-6">
            {/* Brand */}
            <div className="flex gap-3 items-center px-2">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-[#0a3bb0] flex items-center justify-center text-white shadow-lg">
                <span className="material-symbols-outlined text-[20px]">local_library</span>
              </div>
              <div className="flex flex-col">
                <h1 className="text-slate-900 dark:text-white text-base font-bold leading-none mb-1">NEU Library</h1>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Admin Portal</p>
              </div>
            </div>

            {/* Menu Items */}
            {/* Menu Items */}
            <nav className="flex flex-col gap-2">
              <button 
                onClick={() => navigate('/admin/dashboard')} 
                className="flex w-full text-left items-center gap-3 px-3 py-2.5 rounded-lg bg-primary text-white shadow-md shadow-primary/20 transition-all"
              >
                <span className="material-symbols-outlined text-[22px]">dashboard</span>
                <span className="text-sm font-medium">Dashboard</span>
              </button>
              
              <button 
                onClick={() => navigate('/admin/logs')} 
                className="flex w-full text-left items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-surface-dark hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-[22px]">history_edu</span>
                <span className="text-sm font-medium">Visitor Logs</span>
              </button>
              
              <button 
                onClick={exportToCSV} 
                className="flex w-full text-left items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-surface-dark hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-[22px]">bar_chart</span>
                <span className="text-sm font-medium">Reports</span>
              </button>
              
              <button 
                onClick={() => navigate('/admin/users')} 
                className="flex w-full text-left items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-surface-dark hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-[22px]">group</span>
                <span className="text-sm font-medium">Manage Users</span>
              </button>
              
              <button 
                onClick={() => alert('Settings module coming in the next update!')} 
                className="flex w-full text-left items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-surface-dark hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-[22px]">settings</span>
                <span className="text-sm font-medium">Settings</span>
              </button>
            </nav>
          </div>

          {/* User Profile */}
          <div onClick={handleSignOut} className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-dark cursor-pointer transition-colors border-t border-slate-200 dark:border-border-dark mt-auto">
            <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-surface-dark border border-slate-300 dark:border-border-dark flex items-center justify-center font-bold text-primary">
              {user?.name.charAt(0) || 'A'}
            </div>
            <div className="flex flex-col">
              <p className="text-slate-900 dark:text-white text-sm font-semibold leading-tight">{user?.name || 'Admin User'}</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Sign Out</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Top Header */}
        <header className="flex items-center justify-between px-8 py-5 border-b border-slate-200 dark:border-border-dark bg-white dark:bg-background-dark z-10 shrink-0">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-medium">
              <span>Dashboard</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-slate-900 dark:text-white">Overview</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Library Statistics</h2>
          </div>
          
          <div className="flex items-center gap-4">
            
            {/* Sprint 6: Overcrowded Toggle Switch */}
            <div className="hidden lg:flex items-center gap-3 bg-red-50 dark:bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-500/20 mr-2">
              <span className="text-xs font-bold text-red-700 dark:text-red-400">Trigger Alert</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={isOvercrowded}
                  onChange={toggleOvercrowded}
                />
                <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-500"></div>
              </label>
            </div>

            {/* Search Bar */}
            <div className="relative hidden xl:block">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[20px]">search</span>
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search visitors or IDs..." 
                className="bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-border-dark text-slate-900 dark:text-white text-sm rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary w-64 placeholder-slate-400 transition-shadow"
              />
            </div>

            {/* Time Filter Tabs */}
            <div className="flex bg-slate-100 dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-lg p-1">
              <button 
                onClick={() => setTimeFilter('weekly')}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${timeFilter === 'weekly' ? 'text-white bg-primary shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Weekly
              </button>
              <button 
                onClick={() => setTimeFilter('monthly')}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${timeFilter === 'monthly' ? 'text-white bg-primary shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setTimeFilter('custom')}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${timeFilter === 'custom' ? 'text-white bg-primary shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Custom
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto flex flex-col gap-6">
            
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl p-6 flex flex-col justify-between h-40 relative overflow-hidden group shadow-sm">
                <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-primary/5 to-transparent"></div>
                <div className="flex justify-between items-start z-10">
                  <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                    <span className="material-symbols-outlined">groups</span>
                  </div>
                  <span className="flex items-center text-emerald-600 dark:text-emerald-400 text-xs font-bold bg-emerald-100 dark:bg-emerald-400/10 px-2 py-1 rounded-full">
                    <span className="material-symbols-outlined text-[14px] mr-1">trending_up</span> +12.5%
                  </span>
                </div>
                <div className="z-10">
           <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Daily Total Visitors</p>
           {/* Replaced the old static 'todayVisits' with our dynamic state */}
           <h3 className="text-3xl font-black text-slate-900 dark:text-white">{todayVisitsCount}</h3> 
        </div>
              </div>

              <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl p-6 flex flex-col justify-between h-40 relative overflow-hidden group shadow-sm">
                <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-indigo-500/5 to-transparent"></div>
                <div className="flex justify-between items-start z-10">
                  <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-500">
                    <span className="material-symbols-outlined animate-pulse">sensors</span>
                  </div>
                  <span className="flex items-center text-emerald-600 dark:text-emerald-400 text-xs font-bold bg-emerald-100 dark:bg-emerald-400/10 px-2 py-1 rounded-full">
                    <span className="material-symbols-outlined text-[14px] mr-1">trending_up</span> +5.2%
                  </span>
                </div>
                <div className="z-10">
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Active Users Now</p>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white">{activeNow}</h3>
                </div>
              </div>

              <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl p-6 flex flex-col justify-between h-40 relative overflow-hidden group shadow-sm">
                <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-amber-500/5 to-transparent"></div>
                <div className="flex justify-between items-start z-10">
                  <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-500">
                    <span className="material-symbols-outlined">school</span>
                  </div>
                  <span className="text-slate-400 text-xs font-medium">Today's Peak</span>
                </div>
                <div className="z-10">
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Top College</p>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white truncate">Computer Science</h3>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
              
              {/* Line Chart */}
              <div className="lg:col-span-2 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl p-6 flex flex-col shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Visitor Trends</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Weekly traffic analysis</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
                      <span className="w-3 h-3 rounded-full bg-primary"></span> Current Week
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
                      <span className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600"></span> Last Week
                    </div>
                  </div>
                </div>
                <div className="flex-1 w-full h-full min-h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#135bec" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#135bec" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1d212a', borderColor: '#2a303c', color: '#fff', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Area type="monotone" dataKey="last" stroke="#475569" strokeWidth={2} fill="none" />
                      <Area type="monotone" dataKey="current" stroke="#135bec" strokeWidth={3} fillOpacity={1} fill="url(#colorCurrent)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Donut Chart */}
              <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl p-6 flex flex-col shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Visitor Distribution</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">Student vs Faculty Ratio</p>
                <div className="flex-1 flex items-center justify-center relative min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {distributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1d212a', borderColor: '#2a303c', color: '#fff', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Text */}
                  <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">75%</span>
                  </div>
                </div>
                <div className="mt-2 flex flex-col gap-3">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                      <span className="text-slate-600 dark:text-slate-300 font-medium">Students</span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">1,190</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                      <span className="text-slate-600 dark:text-slate-300 font-medium">Faculty</span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">397</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Logs Table */}
            <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl overflow-hidden flex flex-col shadow-sm mb-10">
              <div className="p-6 border-b border-slate-200 dark:border-border-dark flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Logs</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Real-time check-ins from the main entrance.</p>
                </div>
                
                {/* NEW EXPORT BUTTON ADDED HERE */}
                <div className="flex items-center gap-4">
                  <button 
                    onClick={exportToCSV}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    Export CSV
                  </button>
                  <button className="text-sm font-semibold text-primary hover:text-blue-600 dark:hover:text-blue-400 transition-colors">View All Logs</button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-background-dark/50 border-b border-slate-200 dark:border-border-dark text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <th className="px-6 py-4 font-semibold">Visitor Name</th>
                      <th className="px-6 py-4 font-semibold">Purpose</th>
                      <th className="px-6 py-4 font-semibold">Department / College</th>
                      <th className="px-6 py-4 font-semibold">Check-in Time</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-100 dark:divide-border-dark">
                    {loading ? (
                       <tr>
                         <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading live records...</td>
                       </tr>
                    ) : filteredVisits.length === 0 ? (
                       <tr>
                         <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No matching visits found.</td>
                       </tr>
                    ) : (
                      // Removed .slice(0, 5) so search results aren't cut off!
                      filteredVisits.map((visit, index) => {
                        const dateObj = new Date(visit.timestamp);
                        // Generate a pseudo-random avatar color based on index
                        const avatarColors = ['from-purple-500 to-indigo-600', 'from-pink-500 to-rose-600', 'from-blue-500 to-cyan-600', 'from-amber-500 to-orange-600', 'from-emerald-400 to-teal-500'];
                        const colorClass = avatarColors[index % avatarColors.length];

                        return (
                          <tr key={visit.id || index} className="hover:bg-slate-50 dark:hover:bg-background-dark/30 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center text-xs font-bold text-white shadow-sm`}>
                                  {visit.userName.charAt(0)}
                                </div>
                                <span className="font-semibold text-slate-900 dark:text-white">{visit.userName}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-slate-600 dark:text-slate-300 capitalize">{visit.purpose}</td>
                            <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{visit.userAffiliation}</td>
                            <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                                Active
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;