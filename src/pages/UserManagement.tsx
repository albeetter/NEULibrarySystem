import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { DatabaseService } from '../services/DatabaseService';
import { useNavigate } from 'react-router-dom';

const avatarColors = [
  'from-blue-500 to-indigo-600', 
  'from-purple-500 to-pink-600', 
  'from-orange-500 to-amber-600', 
  'from-blue-500 to-cyan-600',
  'from-emerald-400 to-teal-500'
];

const UserManagement = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalUser, setModalUser] = useState<any | null>(null);
  const [blockReason, setBlockReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }

    const unsubscribe = DatabaseService.subscribeToUsers((liveData) => {
      setUsers(liveData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, navigate]);

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  const handleToggleClick = async (targetUser: any) => {
    // If already blocked, unblock them immediately
    if (targetUser.isBlocked) {
      await DatabaseService.updateUserBlockStatus(targetUser.id, false);
    } else {
      // If active, open the block modal
      setModalUser(targetUser);
      setBlockReason('');
    }
  };

  const confirmBlock = async () => {
    if (!blockReason.trim()) return alert("Please provide a reason for blocking.");
    setIsSubmitting(true);
    try {
      await DatabaseService.updateUserBlockStatus(modalUser.id, true, blockReason);
      setModalUser(null);
    } catch (error) {
      console.error("Failed to block user", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter users based on search
  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.affiliation?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm font-medium text-slate-600 dark:text-slate-400">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              System Online
            </div>
            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block"></div>
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
            <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl">
              Manage student, faculty, and staff access privileges. Monitor visit history and control library entry permissions.
            </p>
          </div>
          <button onClick={() => navigate('/admin/dashboard')} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-colors shadow-sm w-fit">
            <span className="material-symbols-outlined text-[20px]">dashboard</span>
            Back to Dashboard
          </button>
        </div>

        {/* Filters & Search */}
        <div className="bg-white dark:bg-[#1c1f27] rounded-xl border border-slate-200 dark:border-slate-800 p-5 mb-6 shadow-sm shrink-0">
          <div className="flex flex-col lg:flex-row gap-5 justify-between">
            <div className="relative flex-1 max-w-lg">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <span className="material-symbols-outlined text-[22px]">search</span>
              </span>
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#111318] border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-slate-100" 
                placeholder="Search by Name, Email, or Affiliation..." 
              />
            </div>
            <div className="flex items-center gap-1 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
              <button className="whitespace-nowrap px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold border border-primary/20">All Users</button>
              <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
              <button className="flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Blocked
              </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-[#1c1f27] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex-1 flex flex-col min-h-0">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="sticky top-0 bg-slate-50 dark:bg-[#282e39] z-10">
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">User Info</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Affiliation</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Block Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading user database...</td></tr>
                ) : filteredUsers.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No users found.</td></tr>
                ) : (
                  filteredUsers.map((u, i) => {
                    const initials = u.name?.substring(0, 2).toUpperCase() || 'U';
                    const colorClass = avatarColors[i % avatarColors.length];
                    const isBlocked = !!u.isBlocked;

                    return (
                      <tr key={u.id} className={`group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${isBlocked ? 'bg-red-50/50 dark:bg-red-900/5' : ''}`}>
                        <td className="px-6 py-4">
                          <div className={`flex items-center gap-3 ${isBlocked ? 'opacity-75' : ''}`}>
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ${isBlocked ? 'bg-slate-300 dark:bg-slate-700' : `bg-gradient-to-br ${colorClass}`}`}>
                              {initials}
                            </div>
                            <div>
                              <div className="font-medium text-slate-900 dark:text-white group-hover:text-primary transition-colors">{u.name}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${isBlocked ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'}`}>
                            {u.affiliation || 'Unassigned'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 capitalize">
                          {u.role}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${isBlocked ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                            <span className={`text-sm font-medium ${isBlocked ? 'text-red-700 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                              {isBlocked ? 'Blocked' : 'Active'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <label className="relative inline-flex items-center cursor-pointer group" title={isBlocked ? "Unblock User" : "Block User"}>
                              <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={isBlocked}
                                onChange={() => handleToggleClick(u)}
                              />
                              <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                            </label>
                          </div>
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
              Showing <span className="font-semibold text-slate-900 dark:text-white">{filteredUsers.length}</span> total users
            </div>
          </div>
        </div>
      </main>

      {/* Confirmation Modal Overlay */}
      {modalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity" role="dialog">
          <div className="bg-white dark:bg-[#1c1f27] rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700 transform transition-all">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3 text-red-600 dark:text-red-500">
                <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <span className="material-symbols-outlined text-[24px]">block</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Block User Access</h3>
              </div>
              <button onClick={() => setModalUser(null)} className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                Are you sure you want to block <strong className="text-slate-900 dark:text-white">{modalUser.name}</strong> from entering the library? This will restrict their card access immediately.
              </p>
              
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400" htmlFor="block-reason">
                  Reason for blocking (Required)
                </label>
                <textarea 
                  id="block-reason"
                  rows={3} 
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-[#111318] border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 dark:text-white placeholder:text-slate-400 resize-none outline-none transition-shadow" 
                  placeholder="e.g. Overdue books, behavioral issue..." 
                />
              </div>

              <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[18px] mt-0.5">info</span>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  The user will receive an automated email notification regarding this action.
                </p>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-slate-50 dark:bg-[#111318]/50 border-t border-slate-100 dark:border-slate-800 rounded-b-2xl flex justify-end gap-3">
              <button 
                onClick={() => setModalUser(null)}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={confirmBlock}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm shadow-red-500/20 flex items-center gap-2 transition-colors disabled:opacity-70"
              >
                {isSubmitting ? 'Processing...' : 'Confirm Block'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;