import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DatabaseService } from '../services/DatabaseService';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

const PURPOSES = [
  { id: 'reading', label: 'Reading', subtext: 'Access to general collection and reading rooms', icon: 'menu_book' },
  { id: 'research', label: 'Research', subtext: 'Archives, journals, and special collections', icon: 'biotech' },
  { id: 'computer', label: 'Computer Lab', subtext: 'Workstations, printing, and digital resources', icon: 'desktop_windows' },
  { id: 'study', label: 'Quiet Study', subtext: 'Individual desks and quiet zones', icon: 'edit_note' },
  { id: 'meeting', label: 'Group Meeting', subtext: 'Reserved rooms for collaborative work', icon: 'groups' },
  { id: 'events', label: 'Events', subtext: 'Workshops, lectures, and community events', icon: 'event' },
];

const MAX_CAPACITY = 500;

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [selectedPurpose, setSelectedPurpose] = useState<{ id: string, label: string } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  
  // New Sprint 6 States
  const [todayCount, setTodayCount] = useState(0);
  const [isOvercrowded, setIsOvercrowded] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/'); return; }
    if (user.role === 'admin') { navigate('/admin/dashboard'); return; }

    // 1. Listen to Global Library Status
    const unsubStatus = DatabaseService.subscribeToLibraryStatus((status) => {
      setIsOvercrowded(status.isOvercrowded);
    });

    // 2. Listen to all visits to calculate today's capacity
    const unsubVisits = DatabaseService.subscribeToVisits((visits) => {
      const today = new Date().toDateString();
      const count = visits.filter(v => new Date(v.timestamp).toDateString() === today).length;
      setTodayCount(count);
    });

    return () => { unsubStatus(); unsubVisits(); };
  }, [user, navigate]);

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  const handleSimulateScan = async () => {
    if (!user || !selectedPurpose) return;
    setIsSimulating(true);
    try {
      await DatabaseService.logVisit(user.id, user.name, user.affiliation || 'Unknown', selectedPurpose.label);
      setScanSuccess(true);
    } catch (error) {
      alert("Something went wrong with the simulation. Please try again.");
    } finally {
      setIsSimulating(false);
    }
  };

  const handleReturnHome = () => {
    setSelectedPurpose(null);
    setScanSuccess(false);
  };

  const firstName = user?.name?.split(' ')[0] || 'Student';
  
  // Calculate Progress Bar Values
  const occupancyPercent = Math.min(100, (todayCount / MAX_CAPACITY) * 100);
  const barColor = occupancyPercent < 50 ? 'bg-emerald-500' : occupancyPercent < 80 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="flex flex-col min-h-screen w-full bg-background-light dark:bg-[#101622] text-slate-900 dark:text-slate-100 font-sans">
      
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#101622]/90 backdrop-blur-md shrink-0">
        <div className="px-6 h-16 flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-md shadow-primary/20">
              <span className="material-symbols-outlined text-[20px]">local_library</span>
            </div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">NEU Library</h1>
          </div>
          <button onClick={handleSignOut} className="text-sm font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content Hub */}
      <main className="flex-1 px-4 py-6 md:py-12 w-full max-w-5xl mx-auto flex flex-col items-center justify-start relative">
        
        {/* Sprint 6: Overcrowded Banner */}
        {isOvercrowded && (
          <div className="w-full mb-8 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-500/30 rounded-xl p-4 flex items-start sm:items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm">
            <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-[24px]">warning</span>
            <div>
              <h4 className="text-sm font-bold text-red-800 dark:text-red-300">High Volume Alert</h4>
              <p className="text-xs sm:text-sm text-red-700 dark:text-red-400 mt-0.5">The library is currently overcrowded. Finding a seat may be difficult.</p>
            </div>
          </div>
        )}

        {/* PART 1: The Purpose Selection Grid */}
        {!selectedPurpose && !scanSuccess && (
          <div className="w-full flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Sprint 6: Live Occupancy Widget */}
            <div className="w-full max-w-md mx-auto bg-white dark:bg-[#1a2332] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Current Capacity</span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{todayCount} / {MAX_CAPACITY}</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full ${barColor} transition-all duration-1000 ease-out`} style={{ width: `${occupancyPercent}%` }}></div>
              </div>
              <p className="text-[11px] text-slate-400 text-center mt-3 uppercase tracking-wider font-semibold">Live Updates Enabled</p>
            </div>

            <div className="text-center flex flex-col items-center gap-3">
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">
                Welcome back, {firstName} <span className="text-primary">👋</span>
              </h2>
              <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 max-w-xl">
                Select your primary reason for visiting today to generate your entry pass.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full mt-2">
              {PURPOSES.map((purpose) => (
                <button
                  key={purpose.id}
                  onClick={() => setSelectedPurpose({ id: purpose.id, label: purpose.label })}
                  className="group relative flex flex-col justify-between p-6 h-48 rounded-2xl bg-white dark:bg-[#1a2332] border border-slate-200 dark:border-slate-800 hover:border-primary dark:hover:border-primary hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 text-left overflow-hidden active:scale-95"
                >
                  <div className="absolute right-0 top-0 p-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-primary/10"></div>
                  <div className="z-10 size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                    <span className="material-symbols-outlined text-3xl">{purpose.icon}</span>
                  </div>
                  <div className="z-10 mt-auto">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                      {purpose.label}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{purpose.subtext}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PART 2 & 3: Dynamic QR Generation & Simulator (Kept identical to previous sprint) */}
        {selectedPurpose && !scanSuccess && (
          <div className="w-full max-w-md mx-auto flex flex-col items-center gap-6 animate-in zoom-in-95 duration-300 mt-6">
            <div className="text-center mb-2">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Your Entry Pass</h2>
              <p className="text-slate-500 dark:text-slate-400">Scan this code at the turnstile to enter.</p>
            </div>
            <div className="w-full bg-white dark:bg-[#1c2333] border border-slate-200 dark:border-slate-700 rounded-3xl p-8 flex flex-col items-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
              <div className="bg-white p-4 rounded-2xl shadow-inner border border-slate-100 mb-6 w-full aspect-square flex items-center justify-center max-w-[260px]">
                <QRCodeSVG value={JSON.stringify({ userId: user?.id, purpose: selectedPurpose.id })} size={240} style={{ width: "100%", height: "100%" }} bgColor={"#ffffff"} fgColor={"#000000"} level={"Q"} />
              </div>
              <div className="w-full text-center border-t border-slate-200 dark:border-slate-700 pt-5">
                <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-1">Pass Type</p>
                <p className="text-xl font-bold text-primary">{selectedPurpose.label}</p>
              </div>
            </div>
            <div className="w-full flex flex-col gap-3 mt-4">
              <button onClick={handleSimulateScan} disabled={isSimulating} className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 active:bg-blue-700 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-primary/20 disabled:opacity-70">
                {isSimulating ? <span className="material-symbols-outlined animate-spin">sync</span> : <span className="material-symbols-outlined">qr_code_scanner</span>}
                {isSimulating ? 'Processing...' : 'Simulate Turnstile Scan'}
              </button>
              <button onClick={() => setSelectedPurpose(null)} disabled={isSimulating} className="w-full py-3 text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium transition-colors disabled:opacity-50">
                Cancel / Pick Different Reason
              </button>
            </div>
          </div>
        )}

        {/* Success State */}
        {scanSuccess && (
          <div className="w-full max-w-md mx-auto h-[450px] flex items-center justify-center animate-in zoom-in-95 duration-500 mt-6">
            <div className="w-full h-full flex flex-col items-center justify-center p-8 rounded-3xl bg-gradient-to-br from-[#1a2332] to-[#111620] border border-slate-800 relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-primary/5 blur-3xl"></div>
              <div className="relative mb-8">
                <div className="size-28 rounded-full bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/30 animate-pulse">
                  <span className="material-symbols-outlined text-7xl">check_circle</span>
                </div>
                <div className="absolute -inset-4 border-2 border-primary/30 rounded-full scale-110"></div>
              </div>
              <div className="relative text-center space-y-4">
                <h3 className="text-3xl font-bold text-white leading-tight">Welcome to<br/>NEU Library!</h3>
                <p className="text-slate-400 text-base">You may now enter the facility.</p>
              </div>
              <div className="absolute bottom-8 w-full px-8">
                <button onClick={handleReturnHome} className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors border border-white/10">
                  Return to Dashboard
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default UserDashboard;