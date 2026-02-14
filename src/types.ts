
export interface Chapter {
    id: string;
    title: string;
    content: string;
    audioUrl?: string; // For future pre-generated audio
}

export interface ReadingPlan {
    id: string;
    title: string;
    author: string;
    description: string;
    totalChapters?: number; // Deprecated but kept for compatibility
    totalPages?: number; // New: Total pages in PDF/Book
    dailyPageGoal?: number; // New: Recommended pages/day
    currentChapter: number;
    currentPage?: number; // New: Current page tracking
    category: 'Gospel' | 'Theology' | 'Devotional' | 'Bible';
    pdfUrl?: string;
    bibleBook?: string;
    coverImage: string;
    chapters?: Chapter[];
    // Progress High Water Marks
    furthestChapter?: number;
    furthestPage?: number;
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

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    avatar: string;
    stats: UserStats;
}

export interface Comment {
    id: string;
    authorId: string;
    authorName: string;
    content: string;
    timestamp: string;
    likes: number;
}

export interface DiscussionPost {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
    content: string;
    role?: string; // e.g., 'Leadership Mentor'
    timestamp: string;
    likes: number;
    comments: Comment[];
    guidedPrompt?: boolean;
}

export interface DiscussionThread { // Deprecated or alias
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
