// Application State
let currentCommunityId = null;
let currentPostId = null;
let currentReportTarget = null;
let currentPostType = 'discussion';

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    try {
        initializeApp();
        setupEventListeners();
        console.log('App initialized successfully');
    } catch (error) {
        console.error('Error initializing app:', error);
        alert('Error loading application. Please check the console for details.');
    }
});

function initializeApp() {
    const user = dataManager.getCurrentUser();
    console.log('Current user:', user);
    
    // Check if user has joined at least one community
    if (!user.joinedCommunities || user.joinedCommunities.length === 0) {
        showFirstTimeUserFlow();
    } else {
        loadUserCommunities();
        displayUserInfo();
    }
}

function showFirstTimeUserFlow() {
    alert('Welcome! You must join at least one community to get started.');
    openModal('joinCommunityModal');
    loadAvailableCommunities();
}

function displayUserInfo() {
    const user = dataManager.getCurrentUser();
    document.getElementById('currentUserName').textContent = user.name;
}

// Event Listeners
function setupEventListeners() {
    console.log('Setting up event listeners');
    
    // Header
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Sidebar
    const createCommunityBtn = document.getElementById('createCommunityBtn');
    if (createCommunityBtn) {
        createCommunityBtn.addEventListener('click', () => {
            openModal('createCommunityModal');
        });
    }
    
    const joinCommunityBtn = document.getElementById('joinCommunityBtn');
    if (joinCommunityBtn) {
        joinCommunityBtn.addEventListener('click', () => {
            openModal('joinCommunityModal');
            loadAvailableCommunities();
        });
    }

    // Community Actions
    const createPostBtn = document.getElementById('createPostBtn');
    if (createPostBtn) {
        createPostBtn.addEventListener('click', () => {
            if (!currentCommunityId) {
                alert('Please select a community first');
                return;
            }
            openModal('createPostModal');
        });
    }
    
    const manageMembersBtn = document.getElementById('manageMembersBtn');
    if (manageMembersBtn) {
        manageMembersBtn.addEventListener('click', () => {
            openModal('manageMembersModal');
            loadCommunityMembers();
        });
    }
    
    const viewReportsBtn = document.getElementById('viewReportsBtn');
    if (viewReportsBtn) {
        viewReportsBtn.addEventListener('click', () => {
            openModal('viewReportsModal');
            loadCommunityReports();
        });
    }

    // Post Type Selector
    document.querySelectorAll('.post-type-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.post-type-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentPostType = e.target.dataset.type;
            loadCommunityPosts(currentCommunityId);
        });
    });

    // Modal Actions
    const submitCommunityBtn = document.getElementById('submitCommunityBtn');
    if (submitCommunityBtn) {
        submitCommunityBtn.addEventListener('click', handleCreateCommunity);
    }
    
    const submitPostBtn = document.getElementById('submitPostBtn');
    if (submitPostBtn) {
        submitPostBtn.addEventListener('click', handleCreatePost);
    }
    
    const submitReplyBtn = document.getElementById('submitReplyBtn');
    if (submitReplyBtn) {
        submitReplyBtn.addEventListener('click', handleCreateReply);
    }
    
    const submitReportBtn = document.getElementById('submitReportBtn');
    if (submitReportBtn) {
        submitReportBtn.addEventListener('click', handleSubmitReport);
    }

    // Modal Close
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                closeModal(modal.id);
            }
        });
    });

    // Click outside modal to close
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
    
    console.log('Event listeners setup complete');
}

// Communities
function loadUserCommunities() {
    const user = dataManager.getCurrentUser();
    const communities = dataManager.getCommunities();
    const userCommunities = communities.filter(c => 
        user.joinedCommunities.includes(c.id)
    );

    const container = document.getElementById('communitiesList');
    container.innerHTML = '';

    if (userCommunities.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); padding: 1rem; text-align: center;">No communities joined</p>';
        return;
    }

    userCommunities.forEach(community => {
        const item = document.createElement('div');
        item.className = 'community-item';
        item.innerHTML = `
            <h4>${community.name}</h4>
            <p>${community.members.length} members</p>
        `;
        item.addEventListener('click', () => selectCommunity(community.id));
        container.appendChild(item);
    });

    // Auto-select first community
    if (userCommunities.length > 0 && !currentCommunityId) {
        selectCommunity(userCommunities[0].id);
    }
}

function selectCommunity(communityId) {
    currentCommunityId = communityId;
    console.log('Selected community:', communityId);
    
    // Update active state
    document.querySelectorAll('.community-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Find and activate the clicked item
    const items = document.querySelectorAll('.community-item');
    items.forEach(item => {
        if (item.textContent.includes(dataManager.getCommunity(communityId).name)) {
            item.classList.add('active');
        }
    });

    // Load community details
    const community = dataManager.getCommunity(communityId);
    const user = dataManager.getCurrentUser();
    
    document.getElementById('communityName').textContent = community.name;
    document.getElementById('communityDescription').textContent = community.description;
    document.getElementById('memberCount').textContent = `${community.members.length} members`;
    
    const posts = dataManager.getPosts(communityId);
    document.getElementById('postCount').textContent = `${posts.length} posts`;

    // Show/hide moderator controls
    const isModerator = community.moderators.includes(user.id);
    document.getElementById('manageMembersBtn').style.display = isModerator ? 'block' : 'none';
    document.getElementById('viewReportsBtn').style.display = isModerator ? 'block' : 'none';

    // Show post type selector and load posts
    document.getElementById('postTypeSelector').style.display = 'flex';
    loadCommunityPosts(communityId);
}

function loadCommunityPosts(communityId) {
    const posts = dataManager.getPosts(communityId);
    const filteredPosts = posts.filter(p => p.type === currentPostType);
    
    const container = document.getElementById('postsFeed');
    container.innerHTML = '';

    if (filteredPosts.length === 0) {
        container.innerHTML = `<p class="empty-state">No ${currentPostType}s yet. Be the first to post!</p>`;
        return;
    }

    filteredPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    filteredPosts.forEach(post => {
        const postCard = createPostCard(post);
        container.appendChild(postCard);
    });
}

function createPostCard(post) {
    const user = dataManager.getCurrentUser();
    const community = dataManager.getCommunity(currentCommunityId);
    const replies = dataManager.getReplies(post.id);
    const userVote = post.votedBy?.[user.id] || null;
    const isAuthor = post.authorId === user.id;
    const isModerator = community.moderators.includes(user.id);

    const card = document.createElement('div');
    card.className = 'post-card';
    card.innerHTML = `
        <div class="post-header">
            <div class="post-meta">
                <span class="post-type-badge ${post.type}">${post.type}</span>
                <span>${post.author}</span>
                <span>•</span>
                <span>${dataManager.formatDate(post.createdAt)}</span>
            </div>
        </div>
        <h3 class="post-title">${post.title}</h3>
        <p class="post-content">${post.content.substring(0, 200)}${post.content.length > 200 ? '...' : ''}</p>
        <div class="post-footer">
            <div class="post-actions">
                <div class="vote-container">
                    <button class="vote-btn upvote ${userVote === 'up' ? 'active' : ''}" data-post-id="${post.id}" data-vote="up">▲</button>
                    <span class="vote-count">${post.votes || 0}</span>
                    <button class="vote-btn downvote ${userVote === 'down' ? 'active' : ''}" data-post-id="${post.id}" data-vote="down">▼</button>
                </div>
                <span class="reply-count">${replies.length} replies</span>
            </div>
            <div class="post-footer-actions">
                ${(isAuthor || isModerator) ? `<button class="delete-btn" data-post-id="${post.id}">Delete</button>` : ''}
                <button class="report-btn" data-post-id="${post.id}" data-type="post">Report</button>
            </div>
        </div>
    `;

    // Click to view details (but not on buttons)
    card.addEventListener('click', (e) => {
        // Check if click target or any parent is a button
        if (e.target.closest('button')) {
            return; // Don't open modal if clicking a button
        }
        viewPostDetails(post.id);
    });

    // Vote buttons
    card.querySelectorAll('.vote-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('Vote button clicked:', btn.dataset.postId, btn.dataset.vote);
            handleVote(btn.dataset.postId, btn.dataset.vote, 'post');
        });
    });

    // Delete button
    const deleteBtn = card.querySelector('.delete-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('Delete button clicked for post:', post.id);
            handleDeletePost(post.id);
        });
    }

    // Report button
    const reportBtn = card.querySelector('.report-btn');
    if (reportBtn) {
        reportBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('Report button clicked for post:', post.id);
            currentReportTarget = { type: 'post', id: post.id };
            openModal('reportModal');
        });
    }

    return card;
}

function viewPostDetails(postId) {
    currentPostId = postId;
    const post = dataManager.getPost(postId);
    const user = dataManager.getCurrentUser();
    const community = dataManager.getCommunity(currentCommunityId);
    const userVote = post.votedBy?.[user.id] || null;
    const isAuthor = post.authorId === user.id;
    const isModerator = community.moderators.includes(user.id);

    const content = document.getElementById('postDetailsContent');
    content.innerHTML = `
        <div class="post-detail-header">
            <div class="post-meta">
                <span class="post-type-badge ${post.type}">${post.type}</span>
                <span>${post.author}</span>
                <span>•</span>
                <span>${dataManager.formatDate(post.createdAt)}</span>
            </div>
            <h2 class="post-detail-title">${post.title}</h2>
        </div>
        <div class="post-detail-content">${post.content}</div>
        <div class="post-footer">
            <div class="vote-container">
                <button class="vote-btn upvote ${userVote === 'up' ? 'active' : ''}" data-post-id="${post.id}" data-vote="up">▲</button>
                <span class="vote-count">${post.votes || 0}</span>
                <button class="vote-btn downvote ${userVote === 'down' ? 'active' : ''}" data-post-id="${post.id}" data-vote="down">▼</button>
            </div>
            ${(isAuthor || isModerator) ? `<button class="delete-btn btn-small" data-post-id="${post.id}" data-from-modal="true">Delete Post</button>` : ''}
        </div>
    `;

    // Vote buttons in modal
    content.querySelectorAll('.vote-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            handleVote(btn.dataset.postId, btn.dataset.vote, 'post');
            // Refresh post details
            viewPostDetails(postId);
        });
    });

    // Delete button in modal
    const deleteBtn = content.querySelector('.delete-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            handleDeletePost(post.id, true);
        });
    }

    loadPostReplies(postId);
    openModal('postDetailsModal');
}

function loadPostReplies(postId) {
    const replies = dataManager.getReplies(postId);
    const container = document.getElementById('repliesList');
    container.innerHTML = '';

    if (replies.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">No replies yet. Be the first to reply!</p>';
        return;
    }

    replies.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    replies.forEach(reply => {
        const replyCard = createReplyCard(reply);
        container.appendChild(replyCard);
    });
}

function createReplyCard(reply) {
    const user = dataManager.getCurrentUser();
    const community = dataManager.getCommunity(currentCommunityId);
    const userVote = reply.votedBy?.[user.id] || null;
    const isAuthor = reply.authorId === user.id;
    const isModerator = community.moderators.includes(user.id);

    const card = document.createElement('div');
    card.className = 'reply-item';
    card.innerHTML = `
        <div class="reply-header">
            <span class="reply-author">${reply.author}</span>
            <span class="reply-time">${dataManager.formatDate(reply.createdAt)}</span>
        </div>
        <div class="reply-content">${reply.content}</div>
        <div class="reply-footer">
            <div class="vote-container">
                <button class="vote-btn upvote ${userVote === 'up' ? 'active' : ''}" data-reply-id="${reply.id}" data-vote="up">▲</button>
                <span class="vote-count">${reply.votes || 0}</span>
                <button class="vote-btn downvote ${userVote === 'down' ? 'active' : ''}" data-reply-id="${reply.id}" data-vote="down">▼</button>
            </div>
            <div class="post-footer-actions">
                ${(isAuthor || isModerator) ? `<button class="delete-btn" data-reply-id="${reply.id}">Delete</button>` : ''}
                <button class="report-btn" data-reply-id="${reply.id}" data-type="reply">Report</button>
            </div>
        </div>
    `;

    // Vote buttons
    card.querySelectorAll('.vote-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            handleVote(btn.dataset.replyId, btn.dataset.vote, 'reply');
            loadPostReplies(reply.postId);
        });
    });

    // Delete button
    const deleteBtn = card.querySelector('.delete-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            handleDeleteReply(reply.id);
        });
    }

    // Report button
    const reportBtn = card.querySelector('.report-btn');
    if (reportBtn) {
        reportBtn.addEventListener('click', () => {
            currentReportTarget = { type: 'reply', id: reply.id };
            openModal('reportModal');
        });
    }

    return card;
}

// Actions
function handleCreateCommunity() {
    const name = document.getElementById('newCommunityName').value.trim();
    const description = document.getElementById('newCommunityDescription').value.trim();

    if (!name) {
        alert('Please enter a community name');
        return;
    }

    const user = dataManager.getCurrentUser();
    const community = {
        id: dataManager.generateId('comm'),
        name,
        description,
        createdBy: user.id,
        moderators: [user.id],
        members: [user.id],
        createdAt: new Date().toISOString()
    };

    dataManager.addCommunity(community);

    // Add to user's joined communities
    const joinedCommunities = user.joinedCommunities || [];
    joinedCommunities.push(community.id);
    dataManager.updateCurrentUser({ joinedCommunities });

    // Clear form
    document.getElementById('newCommunityName').value = '';
    document.getElementById('newCommunityDescription').value = '';

    closeModal('createCommunityModal');
    loadUserCommunities();
    selectCommunity(community.id);
}

function loadAvailableCommunities() {
    const user = dataManager.getCurrentUser();
    const communities = dataManager.getCommunities();
    const availableCommunities = communities.filter(c => 
        !user.joinedCommunities?.includes(c.id)
    );

    const container = document.getElementById('availableCommunitiesList');
    container.innerHTML = '';

    if (availableCommunities.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">You have joined all available communities!</p>';
        return;
    }

    availableCommunities.forEach(community => {
        const item = document.createElement('div');
        item.className = 'available-community-item';
        item.innerHTML = `
            <div class="available-community-info">
                <h4>${community.name}</h4>
                <p>${community.description}</p>
                <small>${community.members.length} members</small>
            </div>
            <button class="btn-primary" data-community-id="${community.id}">Join</button>
        `;

        item.querySelector('button').addEventListener('click', () => {
            joinCommunity(community.id);
        });

        container.appendChild(item);
    });
}

function joinCommunity(communityId) {
    const user = dataManager.getCurrentUser();
    const community = dataManager.getCommunity(communityId);

    // Add user to community members
    if (!community.members.includes(user.id)) {
        community.members.push(user.id);
        dataManager.updateCommunity(communityId, { members: community.members });
    }

    // Add community to user's joined communities
    const joinedCommunities = user.joinedCommunities || [];
    if (!joinedCommunities.includes(communityId)) {
        joinedCommunities.push(communityId);
        dataManager.updateCurrentUser({ joinedCommunities });
    }

    closeModal('joinCommunityModal');
    loadUserCommunities();
    selectCommunity(communityId);
}

function handleCreatePost() {
    const type = document.getElementById('postType').value;
    const title = document.getElementById('postTitle').value.trim();
    const content = document.getElementById('postContent').value.trim();

    if (!title || !content) {
        alert('Please fill in all fields');
        return;
    }

    const user = dataManager.getCurrentUser();
    const post = {
        id: dataManager.generateId('post'),
        communityId: currentCommunityId,
        type,
        title,
        content,
        author: user.name,
        authorId: user.id,
        createdAt: new Date().toISOString(),
        votes: 0,
        votedBy: {}
    };

    dataManager.addPost(post);

    // Clear form
    document.getElementById('postTitle').value = '';
    document.getElementById('postContent').value = '';

    closeModal('createPostModal');
    loadCommunityPosts(currentCommunityId);
}

function handleCreateReply() {
    const content = document.getElementById('replyContent').value.trim();

    if (!content) {
        alert('Please enter reply content');
        return;
    }

    const user = dataManager.getCurrentUser();
    const reply = {
        id: dataManager.generateId('reply'),
        postId: currentPostId,
        content,
        author: user.name,
        authorId: user.id,
        createdAt: new Date().toISOString(),
        votes: 0,
        votedBy: {}
    };

    dataManager.addReply(reply);

    // Clear form
    document.getElementById('replyContent').value = '';

    loadPostReplies(currentPostId);
}

function handleVote(id, voteType, contentType) {
    const user = dataManager.getCurrentUser();
    let item;

    if (contentType === 'post') {
        item = dataManager.getPost(id);
    } else {
        item = dataManager.getReplies().find(r => r.id === id);
    }

    if (!item) return;

    const votedBy = item.votedBy || {};
    const currentVote = votedBy[user.id];

    // Calculate new vote count
    let newVotes = item.votes || 0;

    if (currentVote === voteType) {
        // Remove vote
        delete votedBy[user.id];
        newVotes += voteType === 'up' ? -1 : 1;
    } else {
        // Add or change vote
        if (currentVote) {
            // Changing vote
            newVotes += voteType === 'up' ? 2 : -2;
        } else {
            // New vote
            newVotes += voteType === 'up' ? 1 : -1;
        }
        votedBy[user.id] = voteType;
    }

    // Update item
    const updates = { votes: newVotes, votedBy };
    if (contentType === 'post') {
        dataManager.updatePost(id, updates);
        loadCommunityPosts(currentCommunityId);
    } else {
        dataManager.updateReply(id, updates);
    }
}

function handleDeletePost(postId, fromModal = false) {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
        return;
    }

    dataManager.deletePost(postId);
    
    if (fromModal) {
        closeModal('postDetailsModal');
    }
    
    loadCommunityPosts(currentCommunityId);
    alert('Post deleted successfully');
}

function handleDeleteReply(replyId) {
    if (!confirm('Are you sure you want to delete this reply? This action cannot be undone.')) {
        return;
    }

    const reply = dataManager.getReplies().find(r => r.id === replyId);
    if (reply) {
        dataManager.deleteReply(replyId);
        loadPostReplies(reply.postId);
        alert('Reply deleted successfully');
    }
}

function handleSubmitReport() {
    const reason = document.getElementById('reportReason').value;
    const details = document.getElementById('reportDetails').value.trim();

    if (!currentReportTarget) return;

    const user = dataManager.getCurrentUser();
    const report = {
        id: dataManager.generateId('report'),
        communityId: currentCommunityId,
        targetType: currentReportTarget.type,
        targetId: currentReportTarget.id,
        reason,
        details,
        reportedBy: user.id,
        reportedByName: user.name,
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    dataManager.addReport(report);

    // Clear form
    document.getElementById('reportReason').value = 'spam';
    document.getElementById('reportDetails').value = '';

    closeModal('reportModal');
    alert('Report submitted successfully. Our moderators will review it.');
}

function loadCommunityMembers() {
    const community = dataManager.getCommunity(currentCommunityId);
    const user = dataManager.getCurrentUser();
    const isModerator = community.moderators.includes(user.id);

    const container = document.getElementById('membersList');
    container.innerHTML = '';

    community.members.forEach(memberId => {
        const isMemberModerator = community.moderators.includes(memberId);
        const item = document.createElement('div');
        item.className = 'member-item';
        item.innerHTML = `
            <div class="member-info">
                <div class="member-avatar">${memberId.charAt(0).toUpperCase()}</div>
                <div>
                    <div>${memberId}</div>
                    <div class="member-role">${isMemberModerator ? 'Moderator' : 'Member'}</div>
                </div>
            </div>
            ${isModerator && memberId !== user.id && !isMemberModerator ? `
                <div class="member-actions">
                    <button class="btn-remove" data-member-id="${memberId}">Remove</button>
                </div>
            ` : ''}
        `;

        const removeBtn = item.querySelector('.btn-remove');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                removeMember(memberId);
            });
        }

        container.appendChild(item);
    });
}

function removeMember(memberId) {
    if (!confirm('Are you sure you want to remove this member from the community?')) return;

    const community = dataManager.getCommunity(currentCommunityId);
    community.members = community.members.filter(m => m !== memberId);
    dataManager.updateCommunity(currentCommunityId, { members: community.members });

    loadCommunityMembers();
    alert('Member removed successfully');
}

function loadCommunityReports() {
    const reports = dataManager.getReports(currentCommunityId);
    const container = document.getElementById('reportsList');
    container.innerHTML = '';

    if (reports.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">No reports to review</p>';
        return;
    }

    // Sort by status (pending first) and date
    reports.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    reports.forEach(report => {
        const reportCard = createReportCard(report);
        container.appendChild(reportCard);
    });
}

function createReportCard(report) {
    const card = document.createElement('div');
    card.className = 'report-item';

    // Get the reported content
    let content = '';
    let contentAuthor = '';
    if (report.targetType === 'post') {
        const post = dataManager.getPost(report.targetId);
        if (post) {
            content = post.content;
            contentAuthor = post.author;
        } else {
            content = '[Content has been deleted]';
        }
    } else {
        const reply = dataManager.getReplies().find(r => r.id === report.targetId);
        if (reply) {
            content = reply.content;
            contentAuthor = reply.author;
        } else {
            content = '[Content has been deleted]';
        }
    }

    card.innerHTML = `
        <div class="report-header">
            <div class="report-info">
                <h4>Report: ${report.targetType === 'post' ? 'Post' : 'Reply'}</h4>
                <div class="report-meta">
                    <span>Reported by: ${report.reportedByName}</span>
                    <span>•</span>
                    <span>${dataManager.formatDate(report.createdAt)}</span>
                </div>
            </div>
            <span class="report-status ${report.status}">${report.status}</span>
        </div>
        <div class="report-content-preview">
            <p><strong>Content Author:</strong> ${contentAuthor || 'Unknown'}</p>
            <p><strong>Content:</strong> ${content.substring(0, 200)}${content.length > 200 ? '...' : ''}</p>
        </div>
        <div class="report-reason">
            <strong>Reason:</strong> ${report.reason}
            ${report.details ? `<br><strong>Details:</strong> ${report.details}` : ''}
        </div>
        ${report.status === 'pending' ? `
            <div class="report-actions">
                <button class="btn-primary btn-small report-action-btn" data-report-id="${report.id}" data-action="view">View Full Content</button>
                <button class="btn-warning btn-small report-action-btn" data-report-id="${report.id}" data-action="warn">Warn User</button>
                <button class="btn-remove btn-small report-action-btn" data-report-id="${report.id}" data-action="delete">Delete Content</button>
                <button class="btn-secondary btn-small report-action-btn" data-report-id="${report.id}" data-action="ignore">Ignore Report</button>
            </div>
        ` : ''}
    `;

    // Add event listeners to action buttons
    card.querySelectorAll('.report-action-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            handleReportAction(btn.dataset.reportId, btn.dataset.action);
        });
    });

    return card;
}

function handleReportAction(reportId, action) {
    const report = dataManager.getReports().find(r => r.id === reportId);
    if (!report) return;

    switch (action) {
        case 'view':
            // View the full content
            if (report.targetType === 'post') {
                const post = dataManager.getPost(report.targetId);
                if (post) {
                    closeModal('viewReportsModal');
                    viewPostDetails(report.targetId);
                } else {
                    alert('This content has been deleted');
                }
            } else {
                const reply = dataManager.getReplies().find(r => r.id === report.targetId);
                if (reply) {
                    closeModal('viewReportsModal');
                    viewPostDetails(reply.postId);
                } else {
                    alert('This content has been deleted');
                }
            }
            break;

        case 'warn':
            if (confirm('Send a warning to the user? (This will mark the report as resolved)')) {
                dataManager.updateReport(reportId, { status: 'resolved', action: 'warned' });
                alert('Warning sent to user. Report marked as resolved.');
                loadCommunityReports();
            }
            break;

        case 'delete':
            if (confirm('Delete this content permanently? This action cannot be undone.')) {
                if (report.targetType === 'post') {
                    dataManager.deletePost(report.targetId);
                } else {
                    dataManager.deleteReply(report.targetId);
                }
                dataManager.updateReport(reportId, { status: 'resolved', action: 'deleted' });
                alert('Content deleted successfully. Report marked as resolved.');
                loadCommunityReports();
                loadCommunityPosts(currentCommunityId);
            }
            break;

        case 'ignore':
            if (confirm('Ignore this report? The content will remain unchanged.')) {
                dataManager.updateReport(reportId, { status: 'resolved', action: 'ignored' });
                alert('Report marked as resolved (no action taken).');
                loadCommunityReports();
            }
            break;
    }
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        // Reset to default user
        localStorage.setItem('currentUser', JSON.stringify({
            id: 'Dhai',
            name: 'Dhai',
            joinedCommunities: ['comm1', 'comm2']
        }));
        location.reload();
    }
}

// Modal Functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}