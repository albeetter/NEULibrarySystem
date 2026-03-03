import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DatabaseService } from '../services/DatabaseService';
import { useNavigate } from 'react-router-dom';

const PURPOSES = [
  { id: 'reading', label: 'Reading', subtext: 'Access to general collection and reading rooms', icon: 'menu_book' },
  { id: 'research', label: 'Research', subtext: 'Archives, journals, and special collections', icon: 'biotech' },
  { id: 'computer', label: 'Computer Lab', subtext: 'Workstations, printing, and digital resources', icon: 'desktop_windows' },
  { id: 'study', label: 'Quiet Study', subtext: 'Individual desks and quiet zones', icon: 'edit_note' },
  { id: 'meeting', label: 'Group Meeting', subtext: 'Reserved rooms for collaborative work', icon: 'groups' },
  { id: 'events', label: 'Events', subtext: 'Workshops, lectures, and community events', icon: 'event' },
];

const CheckIn = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5);

  // Auto-dismiss countdown timer
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (success && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (success && timeLeft === 0) {
      handleDismiss();
    }
    return () => clearTimeout(timer);
  }, [success, timeLeft]);

  const handleCheckIn = async (purpose: string, id: string) => {
    if (!user) {
      alert("Session expired! Please sign out and sign back in.");
      return;
    }
    
    setLoadingId(id);
    
    try {
      await DatabaseService.logVisit(
        user.id, 
        user.name, 
        user.affiliation || 'Unknown', 
        purpose
      );
      
      setSuccess(true);
      setTimeLeft(5); // Reset timer just in case
    } catch (error) {
      console.error("Failed to log visit", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDismiss = async () => {
    await logout();
    navigate('/');
  };

  // Extract first name for the greeting
  const firstName = user?.name.split(' ')[0] || 'Guest';

  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* Top Navigation Bar */}
      <header className="w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151c2b] px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded bg-primary flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-xl">local_library</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">NEU Library</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-semibold text-slate-900 dark:text-white">{user?.name}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">{user?.affiliation || 'Visitor'}</span>
          </div>
          <div className="size-10 rounded-full bg-primary flex items-center justify-center text-white font-bold border-2 border-slate-100 dark:border-slate-600 shadow-sm">
             {user?.name.charAt(0) || 'U'}
          </div>
          <button 
            onClick={handleDismiss}
            className="hidden sm:flex items-center justify-center h-9 px-4 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col items-center justify-center p-6 sm:p-10 relative">
        <div className="w-full max-w-5xl flex flex-col gap-10">
          
          {!success ? (
            <>
              {/* Greeting Header */}
              <section className="flex flex-col gap-2">
                <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                  Welcome back, {firstName} <span className="text-primary">👋</span>
                </h2>
                <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl">
                  Please select the purpose of your visit today to check in.
                </p>
              </section>

              {/* Purpose Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {PURPOSES.map((purpose) => (
                  <button
                    key={purpose.id}
                    onClick={() => handleCheckIn(purpose.label, purpose.id)}
                    disabled={loadingId !== null}
                    className="group relative flex flex-col justify-between p-6 h-48 rounded-xl bg-white dark:bg-[#1a2332] border border-slate-200 dark:border-slate-800 hover:border-primary dark:hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 text-left overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:border-slate-800 disabled:hover:shadow-none"
                  >
                    <div className="absolute right-0 top-0 p-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-primary/10"></div>
                    <div className="z-10 size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                      {loadingId === purpose.id ? (
                        <span className="material-symbols-outlined text-3xl animate-spin">progress_activity</span>
                      ) : (
                        <span className="material-symbols-outlined text-3xl">{purpose.icon}</span>
                      )}
                    </div>
                    <div className="z-10">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                        {loadingId === purpose.id ? 'Logging...' : purpose.label}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{purpose.subtext}</p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            /* Success State */
            <div className="flex items-center justify-center w-full max-w-md mx-auto h-[450px]">
              <div className="w-full h-full flex flex-col items-center justify-center p-8 rounded-xl bg-gradient-to-br from-[#1a2332] to-[#111620] border border-slate-800 relative overflow-hidden shadow-2xl">
                {/* Decorative glow */}
                <div className="absolute inset-0 bg-primary/5 blur-3xl"></div>
                
                {/* Success Icon */}
                <div className="relative mb-8">
                  <div className="size-24 rounded-full bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/30 animate-pulse">
                    <span className="material-symbols-outlined text-6xl">check</span>
                  </div>
                  <div className="absolute -inset-4 border border-primary/30 rounded-full scale-110"></div>
                </div>
                
                <div className="relative text-center space-y-3">
                  <h3 className="text-2xl font-bold text-white leading-tight">Welcome to<br/>NEU Library!</h3>
                  <p className="text-slate-400 text-sm">Your visit has been successfully logged.</p>
                  
                  <div className="pt-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700">
                      <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-xs font-medium text-emerald-400">System Online</span>
                    </div>
                  </div>
                </div>
                
                <div className="absolute bottom-6 w-full text-center">
                  <button onClick={handleDismiss} className="text-slate-500 hover:text-white text-sm transition-colors font-medium cursor-pointer">
                    Dismiss ({timeLeft}s)
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center border-t border-slate-200 dark:border-slate-800 bg-background-light dark:bg-[#101622] mt-auto">
        <p className="text-xs text-slate-600 dark:text-slate-500">© 2024 NEU Library System. Visitor Management v2.1</p>
      </footer>
    </div>
  );
};

export default CheckIn;