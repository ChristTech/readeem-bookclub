
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
        coverImage: 'https://picsum.photos/id/10/400/600',
        chapters: [
            {
                id: 'c1',
                title: 'Chapter 1: The Word Made Flesh',
                content: `In the beginning was the Word, and the Word was with God, and the Word was God. He was with God in the beginning. Through him all things were made; without him nothing was made that has been made. In him was life, and that life was the light of all mankind. The light shines in the darkness, and the darkness has not overcome it.\n\nThere was a man sent from God whose name was John. He came as a witness to testify concerning that light, so that through him all might believe. He himself was not the light; he came only as a witness to the light.\n\nThe true light that gives light to everyone was coming into the world. He was in the world, and though the world was made through him, the world did not recognize him. He came to that which was his own, but his own did not receive him. Yet to all who did receive him, to those who believed in his name, he gave the right to become children of God— children born not of natural descent, nor of human decision or a husband’s will, but born of God.\n\nThe Word became flesh and made his dwelling among us. We have seen his glory, the glory of the one and only Son, who came from the Father, full of grace and truth.`
            },
            {
                id: 'c2',
                title: 'Chapter 2: The Wedding at Cana',
                content: `On the third day a wedding took place at Cana in Galilee. Jesus’ mother was there, and Jesus and his disciples had also been invited to the wedding. When the wine was gone, Jesus’ mother said to him, “They have no more wine.”\n\n“Woman, why do you involve me?” Jesus replied. “My hour has not yet come.”\n\nHis mother said to the servants, “Do whatever he tells you.”\n\nNearby stood six stone water jars, the kind used by the Jews for ceremonial washing, each holding from twenty to thirty gallons.\n\nJesus said to the servants, “Fill the jars with water”; so they filled them to the brim. Then he told them, “Now draw some out and take it to the master of the banquet.”`
            },
            {
                id: 'c3',
                title: 'Chapter 3: Nicodemus and Rebirth',
                content: `Now there was a Pharisee, a man named Nicodemus who was a member of the Jewish ruling council. He came to Jesus at night and said, “Rabbi, we know that you are a teacher who has come from God. For no one could perform the signs you are doing if God were not with him.”\n\nJesus replied, “Very truly I tell you, no one can see the kingdom of God unless they are born again.”\n\n“How can someone be born when they are old?” Nicodemus asked. “Surely they cannot enter a second time into their mother’s womb to be born!”\n\nJesus answered, “Very truly I tell you, no one can enter the kingdom of God unless they are born of water and the Spirit. Flesh gives birth to flesh, but the Spirit gives birth to spirit.”`
            },
            {
                id: 'c4',
                title: 'Chapter 4: The Samaritan Woman',
                content: `Now Jesus learned that the Pharisees had heard that he was gaining and baptizing more disciples than John— although in fact it was not Jesus who baptized, but his disciples. So he left Judea and went back once more to Galilee.\n\nNow he had to go through Samaria. So he came to a town in Samaria called Sychar, near the plot of ground Jacob had given to his son Joseph. Jacob’s well was there, and Jesus, tired as he was from the journey, sat down by the well. It was about noon.\n\nWhen a Samaritan woman came to draw water, Jesus said to her, “Will you give me a drink?” (His disciples had gone into the town to buy food).`
            }
        ]
    },
    {
        id: '2',
        title: 'Orthodoxy',
        author: 'G.K. Chesterton',
        description: 'A classic defense of Christian faith that is as witty as it is profound.',
        totalChapters: 9,
        currentChapter: 0,
        category: 'Theology',
        coverImage: 'https://picsum.photos/id/20/400/600',
        chapters: [
            {
                id: 'o1',
                title: 'Chapter 1: Introduction in Defence of Everything Else',
                content: `The only possible excuse for this book is that it is an answer to a challenge. Even a bad shot is dignified when he accepts a duel. When some time ago I published a set of hastily written riots in various forms of journalism, I was seriously told that I was not a serious thinker.\n\nI was told that I had a very pretty turn for paradox, but that I had no consistent philosophy. I was told that I was merely a destroyer; that I destroyed the home (by saying that a man ought to live in it); that I destroyed the State (by saying that a man ought to be independent of it); and that I destroyed the Church (by defending its dogmas).`
            }
        ]
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
    { id: 'b7', name: 'Leadership Mindset', icon: '🧠' },
    { id: 'b8', name: 'Community Pillar', icon: '🏛️' }
];

// Adding back temporarily to fix build if other files import it, or just to be safe. 
// Ideally we remove all usages first.
export const WEEKLY_LEADERBOARD: LeaderboardEntry[] = [];
export const MONTHLY_LEADERBOARD: LeaderboardEntry[] = [];
export const LEADERBOARD = WEEKLY_LEADERBOARD;

export const SCRIPTURE_OF_THE_DAY = {
    text: "Thy word is a lamp unto my feet, and a light unto my path.",
    reference: "Psalm 119:105"
};

// Re-adding MOCK_USER to satisfy any lingering imports in tests or other files
export const MOCK_USER: import('./types').UserProfile = {
    id: 'mock',
    name: 'Mock User',
    email: 'mock@example.com',
    avatar: 'MU',
    stats: { streak: 0, chaptersCompleted: 0, totalReadings: 0, badges: [] }
};

export const INITIAL_DISCUSSIONS: import('./types').DiscussionPost[] = [
    {
        id: 'd1',
        authorId: 'admin1',
        authorName: 'Pastor David Owolabi',
        authorAvatar: 'PD',
        role: 'Leadership Mentor',
        content: "What stood out to you today? How can we apply this passage to our leadership capacity?",
        guidedPrompt: true,
        timestamp: '2 hours ago',
        likes: 124,
        comments: [
            { id: 'c1', authorId: 'u2', authorName: 'David L.', content: 'The humility of Christ really struck me.', timestamp: '1 hour ago', likes: 12 },
            { id: 'c2', authorId: 'u3', authorName: 'Grace W.', content: 'Service is the highest form of leadership.', timestamp: '45 mins ago', likes: 8 }
        ]
    }
];
