// Data Management with LocalStorage

class DataManager {
    constructor() {
        this.initializeData();
    }

    initializeData() {
        // Initialize default data if not exists
        if (!localStorage.getItem('communities')) {
            const defaultCommunities = [
                {
                    id: 'comm1',
                    name: 'Computer Science',
                    description: 'Discuss programming, algorithms, and CS topics',
                    createdBy: 'admin',
                    moderators: ['admin'],
                    members: ['admin', 'user1', 'user2'],
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'comm2',
                    name: 'Mathematics',
                    description: 'Share math problems, solutions, and discussions',
                    createdBy: 'admin',
                    moderators: ['admin'],
                    members: ['admin', 'user1'],
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'comm3',
                    name: 'Engineering',
                    description: 'Engineering students community',
                    createdBy: 'admin',
                    moderators: ['admin'],
                    members: ['admin'],
                    createdAt: new Date().toISOString()
                }
            ];
            localStorage.setItem('communities', JSON.stringify(defaultCommunities));
        }

        if (!localStorage.getItem('posts')) {
            const defaultPosts = [
                {
                    id: 'post1',
                    communityId: 'comm1',
                    type: 'question',
                    title: 'How to implement binary search in JavaScript?',
                    content: 'I am trying to understand the binary search algorithm. Can someone explain the implementation in JavaScript?',
                    author: 'user1',
                    authorId: 'user1',
                    createdAt: new Date(Date.now() - 86400000).toISOString(),
                    votes: 5,
                    votedBy: { user2: 'up' }
                },
                {
                    id: 'post2',
                    communityId: 'comm1',
                    type: 'discussion',
                    title: 'Best practices for React development',
                    content: 'What are your favorite React patterns and best practices? Let\'s discuss!',
                    author: 'user2',
                    authorId: 'user2',
                    createdAt: new Date(Date.now() - 43200000).toISOString(),
                    votes: 3,
                    votedBy: { user1: 'up' }
                }
            ];
            localStorage.setItem('posts', JSON.stringify(defaultPosts));
        }

        if (!localStorage.getItem('replies')) {
            const defaultReplies = [
                {
                    id: 'reply1',
                    postId: 'post1',
                    content: 'Binary search works by repeatedly dividing the search interval in half. Here\'s a simple implementation...',
                    author: 'user2',
                    authorId: 'user2',
                    createdAt: new Date(Date.now() - 43200000).toISOString(),
                    votes: 2,
                    votedBy: { user1: 'up' }
                }
            ];
            localStorage.setItem('replies', JSON.stringify(defaultReplies));
        }

        if (!localStorage.getItem('currentUser')) {
            localStorage.setItem('currentUser', JSON.stringify({
                id: 'Dhai',
                name: 'Dhai',
                joinedCommunities: ['comm1', 'comm2']
            }));
        }

        if (!localStorage.getItem('reports')) {
            localStorage.setItem('reports', JSON.stringify([]));
        }
    }

    // Communities
    getCommunities() {
        return JSON.parse(localStorage.getItem('communities') || '[]');
    }

    getCommunity(id) {
        const communities = this.getCommunities();
        return communities.find(c => c.id === id);
    }

    addCommunity(community) {
        const communities = this.getCommunities();
        communities.push(community);
        localStorage.setItem('communities', JSON.stringify(communities));
    }

    updateCommunity(id, updates) {
        const communities = this.getCommunities();
        const index = communities.findIndex(c => c.id === id);
        if (index !== -1) {
            communities[index] = { ...communities[index], ...updates };
            localStorage.setItem('communities', JSON.stringify(communities));
        }
    }

    // Posts
    getPosts(communityId = null) {
        const posts = JSON.parse(localStorage.getItem('posts') || '[]');
        if (communityId) {
            return posts.filter(p => p.communityId === communityId);
        }
        return posts;
    }

    getPost(id) {
        const posts = this.getPosts();
        return posts.find(p => p.id === id);
    }

    addPost(post) {
        const posts = this.getPosts();
        posts.push(post);
        localStorage.setItem('posts', JSON.stringify(posts));
    }

    updatePost(id, updates) {
        const posts = this.getPosts();
        const index = posts.findIndex(p => p.id === id);
        if (index !== -1) {
            posts[index] = { ...posts[index], ...updates };
            localStorage.setItem('posts', JSON.stringify(posts));
        }
    }

    deletePost(id) {
        const posts = this.getPosts();
        const filteredPosts = posts.filter(p => p.id !== id);
        localStorage.setItem('posts', JSON.stringify(filteredPosts));
        
        // Also delete associated replies
        const replies = this.getReplies();
        const filteredReplies = replies.filter(r => r.postId !== id);
        localStorage.setItem('replies', JSON.stringify(filteredReplies));
        
        // Delete associated reports
        const reports = this.getReports();
        const filteredReports = reports.filter(r => r.targetId !== id);
        localStorage.setItem('reports', JSON.stringify(filteredReports));
    }

    // Replies
    getReplies(postId = null) {
        const replies = JSON.parse(localStorage.getItem('replies') || '[]');
        if (postId) {
            return replies.filter(r => r.postId === postId);
        }
        return replies;
    }

    addReply(reply) {
        const replies = this.getReplies();
        replies.push(reply);
        localStorage.setItem('replies', JSON.stringify(replies));
    }

    updateReply(id, updates) {
        const replies = this.getReplies();
        const index = replies.findIndex(r => r.id === id);
        if (index !== -1) {
            replies[index] = { ...replies[index], ...updates };
            localStorage.setItem('replies', JSON.stringify(replies));
        }
    }

    deleteReply(id) {
        const replies = this.getReplies();
        const filteredReplies = replies.filter(r => r.id !== id);
        localStorage.setItem('replies', JSON.stringify(filteredReplies));
        
        // Delete associated reports
        const reports = this.getReports();
        const filteredReports = reports.filter(r => r.targetId !== id);
        localStorage.setItem('reports', JSON.stringify(filteredReports));
    }

    // User
    getCurrentUser() {
        return JSON.parse(localStorage.getItem('currentUser') || '{}');
    }

    updateCurrentUser(updates) {
        const user = this.getCurrentUser();
        const updatedUser = { ...user, ...updates };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }

    // Reports
    getReports(communityId = null) {
        const reports = JSON.parse(localStorage.getItem('reports') || '[]');
        if (communityId) {
            // Filter reports by community
            const posts = this.getPosts(communityId);
            const postIds = posts.map(p => p.id);
            const replies = this.getReplies();
            const replyIds = replies.filter(r => postIds.includes(r.postId)).map(r => r.id);
            
            return reports.filter(report => 
                postIds.includes(report.targetId) || replyIds.includes(report.targetId)
            );
        }
        return reports;
    }

    addReport(report) {
        const reports = this.getReports();
        reports.push(report);
        localStorage.setItem('reports', JSON.stringify(reports));
    }

    updateReport(id, updates) {
        const reports = this.getReports();
        const index = reports.findIndex(r => r.id === id);
        if (index !== -1) {
            reports[index] = { ...reports[index], ...updates };
            localStorage.setItem('reports', JSON.stringify(reports));
        }
    }

    deleteReport(id) {
        const reports = this.getReports();
        const filteredReports = reports.filter(r => r.id !== id);
        localStorage.setItem('reports', JSON.stringify(filteredReports));
    }

    // Utility
    generateId(prefix = 'id') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return 'Just now';
    }
}

// Export instance
const dataManager = new DataManager();