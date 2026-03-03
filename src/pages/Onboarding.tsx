import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Updated data array with images, subtext, and material icons
const AFFILIATIONS = [
  { id: 'eng', name: 'College of Engineering', subtext: '12 Departments', icon: 'engineering', bgUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800' },
  { id: 'cs', name: 'College of Computer Science', subtext: '8 Departments', icon: 'terminal', bgUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800' },
  { id: 'arts', name: 'College of Arts & Sciences', subtext: '24 Departments', icon: 'palette', bgUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80&w=800' },
  { id: 'bus', name: 'School of Business', subtext: '6 Departments', icon: 'trending_up', bgUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800' },
  { id: 'health', name: 'Bouvé College of Health Sciences', subtext: '14 Departments', icon: 'medical_services', bgUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800' },
  { id: 'law', name: 'School of Law', subtext: 'Graduate Level', icon: 'gavel', bgUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800' },
  { id: 'fac', name: 'Faculty Administration', subtext: 'Staff Access', icon: 'admin_panel_settings', bgUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800' },
  { id: 'staff', name: 'Staff / Facilities', subtext: 'Maintenance & Ops', icon: 'build', bgUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356f27?auto=format&fit=crop&q=80&w=800' },
  // These last two use solid colors instead of background images
  { id: 'alum', name: 'Alumni Association', subtext: 'Graduates & Former Students', icon: 'school', isSolid: true },
  { id: 'guest', name: 'Guest / Other', subtext: 'Visiting Researchers, Public', icon: 'person', isSolid: true },
];

const Onboarding = () => {
  const { updateUserAffiliation, logout } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filteredAffiliations = AFFILIATIONS.filter(affil => 
    affil.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelection = async (affiliationName: string, id: string) => {
    setLoadingId(id);
    try {
      await updateUserAffiliation(affiliationName);
      navigate('/check-in'); 
    } catch (error) {
      console.error("Failed to save affiliation", error);
      setLoadingId(null);
    }
  };

  const handleExit = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-6 py-4 lg:px-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-2xl">local_library</span>
          </div>
          <div>
            <h2 className="text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-white">NEU Library</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Visitor Management System</p>
          </div>
        </div>
        <button 
          onClick={handleExit}
          className="group flex items-center justify-center gap-2 rounded-lg bg-slate-200 dark:bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-300 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
          <span>Exit Setup</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-start px-4 py-8 md:px-10 lg:py-12">
        <div className="w-full max-w-5xl flex flex-col gap-8">
          
          {/* Progress & Intro */}
          <div className="flex flex-col gap-6">
            {/* Progress Bar */}
            <div className="flex flex-col gap-2 max-w-md">
              <div className="flex justify-between items-end">
                <span className="text-sm font-semibold text-primary">Step 1 of 4</span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Visitor Affiliation</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div className="h-full w-1/4 rounded-full bg-primary shadow-[0_0_10px_rgba(19,91,236,0.5)]"></div>
              </div>
            </div>

            {/* Title Section */}
            <div className="flex flex-col gap-2 mt-4">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                Welcome to NEU Library
              </h1>
              <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
                To personalize your experience and help us track library usage, please select your primary College or Office affiliation.
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="sticky top-[80px] z-40 bg-background-light dark:bg-background-dark pt-2 pb-6">
            <div className="relative w-full max-w-2xl">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
                <span className="material-symbols-outlined text-2xl">search</span>
              </div>
              <input 
                type="text"
                autoFocus
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for your department, college, or office..." 
                className="block w-full rounded-xl border-0 bg-white dark:bg-slate-800/50 py-4 pl-12 pr-4 text-slate-900 dark:text-white placeholder:text-slate-400 ring-1 ring-inset ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-lg shadow-sm transition-all outline-none" 
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <kbd className="hidden sm:inline-flex items-center rounded border border-slate-200 dark:border-slate-700 px-2 font-sans text-xs text-slate-400">
                  ⌘K
                </kbd>
              </div>
            </div>
          </div>

          {/* Affiliation Grid */}
          {filteredAffiliations.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredAffiliations.map((affil) => (
                <button
                  key={affil.id}
                  onClick={() => handleSelection(affil.name, affil.id)}
                  disabled={loadingId !== null}
                  className="group relative flex flex-col justify-end overflow-hidden rounded-xl aspect-[4/3] p-5 text-left focus:outline-none focus:ring-4 focus:ring-primary/40 transition-transform active:scale-95 hover:-translate-y-1 disabled:opacity-70 disabled:active:scale-100 disabled:hover:translate-y-0"
                >
                  {/* Background handling (Image vs Solid) */}
                  {!affil.isSolid ? (
                    <>
                      <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style={{ backgroundImage: `url('${affil.bgUrl}')` }}></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                    </>
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-slate-800 transition-colors group-hover:bg-slate-700"></div>
                      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white to-transparent"></div>
                    </>
                  )}

                  {/* Card Content */}
                  <div className="relative z-10 flex flex-col gap-1">
                    <span className={`inline-flex items-center justify-center h-8 w-8 rounded-lg ${affil.isSolid ? 'bg-slate-600/50' : 'bg-white/10 backdrop-blur-sm'} text-white mb-2`}>
                      {loadingId === affil.id ? (
                        <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                      ) : (
                        <span className="material-symbols-outlined text-lg">{affil.icon}</span>
                      )}
                    </span>
                    <h3 className="text-lg font-bold text-white leading-tight">{affil.name}</h3>
                    <p className="text-xs text-slate-300 font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-300">
                      {loadingId === affil.id ? 'Saving...' : affil.subtext}
                    </p>
                  </div>
                  
                  {/* Focus Ring */}
                  <div className="absolute inset-0 rounded-xl border-2 border-transparent group-focus:border-primary pointer-events-none"></div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-500 dark:text-slate-400 py-10">
              No affiliations found matching "{searchTerm}"
            </div>
          )}

          {/* Not Listed Section */}
          <div className="mt-8 flex justify-center pb-12">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Don't see your affiliation listed? 
              <button className="text-primary hover:text-primary/80 font-semibold ml-1 underline decoration-primary/30 underline-offset-4">Browse all departments</button> or 
              <button className="text-primary hover:text-primary/80 font-semibold ml-1 underline decoration-primary/30 underline-offset-4">Continue as Guest</button>
            </p>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Onboarding;