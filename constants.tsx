
import React from 'react';
import { ReadingPlan, Badge, LeaderboardEntry } from './types';

export const INITIAL_PLANS: ReadingPlan[] = [
  {
    id: '1',
    title: 'The Gospel of John: A 30-Day Deep Dive',
    author: 'Apostle John',
    description: 'Explore the divinity of Christ through the eyes of the beloved disciple.',
    totalChapters: 21,
    currentChapter: 4,
    category: 'Gospel',
    coverImage: 'https://picsum.photos/id/10/400/600'
  },
  {
    id: '2',
    title: 'Orthodoxy',
    author: 'G.K. Chesterton',
    description: 'A classic defense of Christian faith that is as witty as it is profound.',
    totalChapters: 9,
    currentChapter: 0,
    category: 'Theology',
    coverImage: 'https://picsum.photos/id/20/400/600'
  },
  {
    id: '3',
    title: 'Daily Grace: Morning Devotions',
    author: 'Charles Spurgeon',
    description: 'A collection of encouraging daily readings to start your day in the spirit.',
    totalChapters: 31,
    currentChapter: 12,
    category: 'Devotional',
    coverImage: 'https://picsum.photos/id/30/400/600'
  }
];

export const BADGES: Badge[] = [
  { id: 'b1', name: '7-Day Streak', icon: '🔥' },
  { id: 'b2', name: 'First Chapter', icon: '📖' },
  { id: 'b3', name: 'Faithful Morning', icon: '☀️' },
  { id: 'b4', name: 'Gospel Explorer', icon: '🕊️' },
  { id: 'b5', name: 'John Completion', icon: '🎖️' },
  { id: 'b6', name: '30-Day Consistency', icon: '💎' },
  { id: 'b7', name: 'Leadership Mindset', icon: '🧠' },
  { id: 'b8', name: 'Community Pillar', icon: '🏛️' }
];

export const WEEKLY_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'Sarah J.', consistencyScore: 98, streak: 7 },
  { rank: 2, name: 'Matthew K.', consistencyScore: 95, streak: 7 },
  { rank: 3, name: 'Grace W.', consistencyScore: 92, streak: 6 },
  { rank: 4, name: 'David L.', consistencyScore: 90, streak: 5 },
  { rank: 5, name: 'Elizabeth R.', consistencyScore: 88, streak: 5 }
];

export const MONTHLY_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'Sarah J.', consistencyScore: 99, streak: 42 },
  { rank: 2, name: 'John D.', consistencyScore: 97, streak: 35 },
  { rank: 3, name: 'Matthew K.', consistencyScore: 95, streak: 30 },
  { rank: 4, name: 'Rebecca S.', consistencyScore: 93, streak: 28 },
  { rank: 5, name: 'Grace W.', consistencyScore: 92, streak: 25 }
];

export const LEADERBOARD: LeaderboardEntry[] = WEEKLY_LEADERBOARD;

export const SCRIPTURE_OF_THE_DAY = {
  text: "Thy word is a lamp unto my feet, and a light unto my path.",
  reference: "Psalm 119:105"
};
