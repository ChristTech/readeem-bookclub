
export interface ReadingPlan {
  id: string;
  title: string;
  author: string;
  description: string;
  totalChapters: number;
  currentChapter: number;
  category: 'Gospel' | 'Theology' | 'Devotional';
  coverImage: string;
}

export interface UserStats {
  streak: number;
  chaptersCompleted: number;
  totalReadings: number;
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  dateEarned?: string;
}

export interface DiscussionThread {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  likes: number;
  replies: number;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  consistencyScore: number;
  streak: number;
}

export enum Page {
  Home = 'home',
  ReadingPlan = 'reading-plan',
  Dashboard = 'dashboard',
  Leaderboard = 'leaderboard',
  Community = 'community',
  Journal = 'journal',
  Admin = 'admin',
  Join = 'join'
}
