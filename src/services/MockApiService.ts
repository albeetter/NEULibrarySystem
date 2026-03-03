import type { User, Visit } from '../types/index'; 

const MOCK_USERS: User[] = [
  { id: '1', email: 'admin@neu.edu', name: 'Admin User', role: 'admin', affiliation: 'Staff', isBlocked: false },
  { id: '2', email: 'student@neu.edu', name: 'John Doe', role: 'user', affiliation: null, isBlocked: false },
  { id: '3', email: 'blocked@neu.edu', name: 'Bad Actor', role: 'user', affiliation: 'Student', isBlocked: true },
];

// Add a mock table for our visits
const MOCK_VISITS: Visit[] = [];

export const MockApiService = {
  
  login: async (email: string): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const user = MOCK_USERS.find(u => u.email === email);
    if (!user) throw new Error("Unauthorized institutional email.");
    if (user.isBlocked) throw new Error("Your account has been suspended. Please contact the administrator.");
    return user;
  },

  updateAffiliation: async (userId: string, affiliation: string): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 500)); 
    const user = MOCK_USERS.find(u => u.id === userId);
    if (!user) throw new Error("User not found.");
    user.affiliation = affiliation; 
    return user;
  },

  // --- NEW FUNCTION: Log a visit ---
  logVisit: async (userId: string, purpose: string): Promise<Visit> => {
    await new Promise(resolve => setTimeout(resolve, 600)); // Simulate network

    const newVisit: Visit = {
      id: Math.random().toString(36).substring(2, 9), // Generate a random ID
      userId,
      timestamp: new Date().toISOString(), // Record the exact time
      purpose
    };

    MOCK_VISITS.push(newVisit); // Save to our mock database
    console.log("Database updated with new visit:", MOCK_VISITS); // To view in browser console
    
    return newVisit;
  },

  getAllVisits: async (): Promise<(Visit & { userName: string; userAffiliation: string })[]> => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network

    // We combine the Visit data with the User data so the admin can see names, not just IDs
    return MOCK_VISITS.map(visit => {
      const user = MOCK_USERS.find(u => u.id === visit.userId);
      return {
        ...visit,
        userName: user?.name || 'Unknown User',
        userAffiliation: user?.affiliation || 'No Affiliation'
      };
    }).reverse(); // Reverse so the newest visits show at the top
  }
};