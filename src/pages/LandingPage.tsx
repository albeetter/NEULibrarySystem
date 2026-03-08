import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // State for our placeholder Modal
  const [modalConfig, setModalConfig] = useState<{ title: string; content: string } | null>(null);

  const handleSignIn = async () => {
    setIsLoggingIn(true);
    setError('');
    try {
      const user = await login();
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (!user.affiliation) navigate('/onboarding');
      else navigate('/user/dashboard'); // <--- Updated!
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Helper functions for our buttons
  const openHelp = () => setModalConfig({ 
    title: 'Help Center', 
    content: 'Need assistance? Please visit the main library front desk or email support@neu.edu.' 
  });
  
  const openTerms = (e: React.MouseEvent) => {
    e.preventDefault();
    setModalConfig({ 
      title: 'Terms of Service', 
      content: 'This is a placeholder for the official NEU Library Visitor System Terms of Service. Users must agree to abide by university conduct policies while using the facility.' 
    });
  };

  const openPrivacy = (e: React.MouseEvent) => {
    e.preventDefault();
    setModalConfig({ 
      title: 'Privacy Policy', 
      content: 'This is a placeholder for the Privacy Policy. Your visitation logs are securely stored and only accessible by authorized library administration.' 
    });
  };

  const openSupport = (e: React.MouseEvent) => {
    e.preventDefault();
    setModalConfig({ 
      title: 'IT Support', 
      content: 'For technical issues regarding this portal, please submit a ticket to the NEU IT Helpdesk.' 
    });
  };

  const handleAdminLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    handleSignIn(); // Uses the exact same secure login flow
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        
        {/* Header */}
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-background-light/80 dark:bg-[#101622]/80 backdrop-blur-md px-6 py-4 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
              <span className="material-symbols-outlined text-2xl">local_library</span>
            </div>
            <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">
              NEU Library <span className="hidden sm:inline font-normal text-slate-500 dark:text-slate-400">Visitor System</span>
            </h2>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={openHelp}
              className="flex h-10 cursor-pointer items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors px-4 text-slate-900 dark:text-white text-sm font-bold"
            >
              <span className="material-symbols-outlined mr-2 text-lg">help</span>
              <span className="truncate">Help</span>
            </button>
          </div>
        </header>

        <main className="flex-1">
          {/* Hero / Login Section */}
          <div className="relative isolate overflow-hidden pt-14">
            {/* Background with Overlay */}
            <div className="absolute inset-0 -z-10 h-full w-full">
              <div className="absolute inset-0 bg-gradient-to-b from-[#101622]/90 to-[#101622]/95 z-10"></div>
              <div 
                className="h-full w-full bg-cover bg-center" 
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop')" }}
              ></div>
            </div>

            <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
              <div className="mx-auto max-w-2xl text-center">
                <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl mb-6">
                  Welcome to the Library
                </h1>
                <p className="mt-4 text-lg leading-8 text-slate-300 mb-10">
                  Seamlessly track attendance and manage visitor statistics. <br className="hidden sm:block"/>
                  Please sign in using your institutional NEU Google account.
                </p>

                {/* Login Card */}
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-8 rounded-2xl max-w-md mx-auto shadow-2xl relative z-20">
                  <div className="flex flex-col gap-6">
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-white mb-2">Sign In</h3>
                      <p className="text-sm text-slate-400">Access your visitor dashboard</p>
                    </div>

                    <button 
                      onClick={handleSignIn}
                      disabled={isLoggingIn}
                      className="group flex w-full items-center justify-center gap-3 rounded-lg bg-white p-3 text-slate-900 transition-all hover:bg-slate-100 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                      </svg>
                      <span className="text-base font-semibold">
                        {isLoggingIn ? 'Signing in...' : 'Sign in with Google'}
                      </span>
                    </button>

                    {error && (
                      <p className="text-red-400 text-sm bg-red-900/20 p-3 rounded border border-red-500/50">
                        {error}
                      </p>
                    )}

                    <div className="relative">
                      <div aria-hidden="true" className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-600"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-[#1e293b]/50 px-2 text-sm text-slate-400 backdrop-blur-sm rounded">Restricted Access</span>
                      </div>
                    </div>

                    <p className="text-xs text-center text-slate-500">
                      By signing in, you agree to the <a href="#" onClick={openTerms} className="text-primary hover:text-blue-400 transition-colors">Terms of Service</a> and <a href="#" onClick={openPrivacy} className="text-primary hover:text-blue-400 transition-colors">Privacy Policy</a>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 relative z-10">
            <div className="mx-auto max-w-2xl lg:text-center mb-16">
              <h2 className="text-base font-semibold leading-7 text-primary">System Features</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Efficient Library Management</p>
              <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400">
                Streamline your library operations with our integrated visitor tracking and analytics tools.
              </p>
            </div>

            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                <div className="flex flex-col bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-primary/50 transition-colors">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900 dark:text-white">
                    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20 text-primary">
                      <span className="material-symbols-outlined">schedule</span>
                    </div>
                    Real-time Attendance
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600 dark:text-slate-400">
                    <p className="flex-auto">Monitor student and faculty check-ins instantly as they happen. Keep track of current occupancy levels.</p>
                  </dd>
                </div>

                <div className="flex flex-col bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-primary/50 transition-colors">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900 dark:text-white">
                    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20 text-primary">
                      <span className="material-symbols-outlined">bar_chart</span>
                    </div>
                    Visitor Analytics
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600 dark:text-slate-400">
                    <p className="flex-auto">Analyze daily, weekly, and monthly trends to optimize library hours and resource allocation.</p>
                  </dd>
                </div>

                <div className="flex flex-col bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-primary/50 transition-colors">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900 dark:text-white">
                    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20 text-primary">
                      <span className="material-symbols-outlined">encrypted</span>
                    </div>
                    Secure Access
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600 dark:text-slate-400">
                    <p className="flex-auto">Enterprise-grade security using your institutional Google Workspace credentials for authentication.</p>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-background-light dark:bg-[#101622] border-t border-slate-200 dark:border-slate-800 relative z-10">
          <div className="mx-auto max-w-7xl overflow-hidden px-6 py-12 sm:py-16 lg:px-8">
            <nav aria-label="Footer" className="-mb-6 columns-2 sm:flex sm:justify-center sm:space-x-12">
              <div className="pb-6">
                <a href="#" onClick={openPrivacy} className="text-sm leading-6 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">Privacy Policy</a>
              </div>
              <div className="pb-6">
                <a href="#" onClick={openTerms} className="text-sm leading-6 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">Terms of Service</a>
              </div>
              <div className="pb-6">
                <a href="#" onClick={handleAdminLogin} className="text-sm leading-6 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-primary font-medium transition-colors">Admin Login</a>
              </div>
              <div className="pb-6">
                <a href="#" onClick={openSupport} className="text-sm leading-6 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">Support</a>
              </div>
            </nav>
            <p className="mt-10 text-center text-xs leading-5 text-slate-500 dark:text-slate-500">
              © 2024 NEU Library. All rights reserved.
            </p>
          </div>
        </footer>

      </div>

      {/* Reusable Placeholder Modal */}
      {modalConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity" role="dialog">
          <div className="bg-white dark:bg-[#1c1f27] rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700 transform transition-all">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                  <span className="material-symbols-outlined text-[24px]">info</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{modalConfig.title}</h3>
              </div>
              <button onClick={() => setModalConfig(null)} className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                {modalConfig.content}
              </p>
            </div>
            
            <div className="px-6 py-4 bg-slate-50 dark:bg-[#111318]/50 border-t border-slate-100 dark:border-slate-800 rounded-b-2xl flex justify-end">
              <button 
                onClick={() => setModalConfig(null)}
                className="px-5 py-2 text-sm font-medium text-white bg-primary hover:bg-blue-600 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-[#1c1f27]"
              >
                Understood
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;