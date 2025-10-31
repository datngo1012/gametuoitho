/**
 * Comment Component - UI for displaying and managing comments
 */

import { CommentService, UserSession } from './commentService.js';

class CommentComponent {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.service = new CommentService();
    this.comments = [];
    this.currentUser = UserSession.getUser();
    this.replyingTo = null;
    
    this.init();
  }

  async init() {
    this.render();
    if (this.currentUser) {
      await this.loadComments();
    }
  }

  async loadComments() {
    try {
      this.comments = await this.service.getComments();
      
      // Load user reactions
      if (this.currentUser && this.comments.length > 0) {
        const commentIds = this.comments.map(c => c.id);
        const reactions = await this.service.getUserReactions(this.currentUser, commentIds);
        
        // Map reactions to comments
        this.comments.forEach(comment => {
          const reaction = reactions.find(r => r.comment_id === comment.id);
          comment.userReaction = reaction?.reaction_type;
        });
      }
      
      this.renderComments();
    } catch (error) {
      console.error('Error loading comments:', error);
      this.showError('Không thể tải bình luận. Vui lòng thử lại.');
    }
  }

  render() {
    this.container.innerHTML = `
      <div class="comment-section">
        <div class="comment-header">
          <h3>💬 Bình luận</h3>
          ${this.currentUser ? `
            <div class="user-info">
              <span class="username-badge">👤 ${this.escapeHtml(this.currentUser)}</span>
              <button class="logout-btn" id="logout-btn">Đăng xuất</button>
            </div>
          ` : ''}
        </div>

        ${!this.currentUser ? this.renderLoginForm() : this.renderCommentForm()}
        
        <div id="comments-list" class="comments-list">
          <div class="loading-comments">
            <div class="loading-spinner"></div>
            <p>Đang tải bình luận...</p>
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  renderLoginForm() {
    return `
      <div class="login-form">
        <p class="login-prompt">👋 Vui lòng nhập tên của bạn để bình luận</p>
        <div class="form-group">
          <input 
            type="text" 
            id="username-input" 
            placeholder="Nhập tên của bạn..." 
            maxlength="100"
            autocomplete="off"
          />
          <button id="login-btn" class="primary-btn">Tiếp tục</button>
        </div>
      </div>
    `;
  }

  renderCommentForm(isReply = false, parentId = null) {
    return `
      <div class="comment-form ${isReply ? 'reply-form' : ''}" ${isReply ? `data-parent-id="${parentId}"` : ''}>
        ${isReply ? `
          <div class="reply-header">
            <span>💬 Trả lời bình luận</span>
            <button class="cancel-reply-btn" data-parent-id="${parentId}">✕</button>
          </div>
        ` : ''}
        <textarea 
          id="${isReply ? `reply-input-${parentId}` : 'comment-input'}"
          placeholder="${isReply ? 'Nhập câu trả lời...' : 'Nhập bình luận của bạn...'}"
          maxlength="1000"
          rows="3"
        ></textarea>
        <div class="form-actions">
          <span class="char-counter">
            <span id="${isReply ? `reply-counter-${parentId}` : 'comment-counter'}">0</span>/1000
          </span>
          <button class="submit-comment-btn primary-btn" ${isReply ? `data-parent-id="${parentId}"` : ''}>
            ${isReply ? '💬 Gửi trả lời' : '📤 Gửi bình luận'}
          </button>
        </div>
      </div>
    `;
  }

  renderComments() {
    const commentsList = document.getElementById('comments-list');
    
    if (this.comments.length === 0) {
      commentsList.innerHTML = `
        <div class="empty-comments">
          <div class="empty-icon">💭</div>
          <p>Chưa có bình luận nào</p>
          <p class="empty-subtext">Hãy là người đầu tiên bình luận!</p>
        </div>
      `;
      return;
    }

    commentsList.innerHTML = this.comments.map(comment => this.renderComment(comment)).join('');
    this.attachCommentEventListeners();
  }

  renderComment(comment, isReply = false) {
    const reactions = [
      { type: 'like', emoji: '👍', count: comment.like_count },
      { type: 'love', emoji: '❤️', count: comment.love_count },
      { type: 'haha', emoji: '😂', count: comment.haha_count },
      { type: 'wow', emoji: '😮', count: comment.wow_count },
      { type: 'sad', emoji: '😢', count: comment.sad_count },
      { type: 'angry', emoji: '😠', count: comment.angry_count }
    ];

    return `
      <div class="comment-item ${isReply ? 'reply-item' : ''}" data-comment-id="${comment.id}">
        <div class="comment-avatar">
          ${this.getAvatarEmoji(comment.username)}
        </div>
        <div class="comment-content-wrapper">
          <div class="comment-header-info">
            <span class="comment-username">${this.escapeHtml(comment.username)}</span>
            <span class="comment-time">${this.formatTime(comment.created_at)}</span>
          </div>
          <div class="comment-text">${this.escapeHtml(comment.content)}</div>
          
          <div class="comment-actions">
            <div class="reaction-buttons">
              ${reactions.map(r => `
                <button 
                  class="reaction-btn ${comment.userReaction === r.type ? 'active' : ''}" 
                  data-comment-id="${comment.id}"
                  data-reaction="${r.type}"
                  title="${r.type}"
                >
                  ${r.emoji}${r.count > 0 ? ` <span class="reaction-count">${r.count}</span>` : ''}
                </button>
              `).join('')}
            </div>
            ${!isReply ? `
              <button class="reply-btn" data-comment-id="${comment.id}">
                💬 Trả lời ${comment.reply_count > 0 ? `(${comment.reply_count})` : ''}
              </button>
            ` : ''}
          </div>

          <div class="replies-container" id="replies-${comment.id}" style="display: none;">
            <div class="loading-replies">Đang tải câu trả lời...</div>
          </div>
        </div>
      </div>
    `;
  }

  async attachEventListeners() {
    await this.loadComments();
    // Login button
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
      loginBtn.addEventListener('click', () => this.handleLogin());
      
      const usernameInput = document.getElementById('username-input');
      usernameInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.handleLogin();
      });
    }

    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn?.addEventListener('click', () => this.handleLogout());

    // Comment submit
    const submitBtn = document.querySelector('.submit-comment-btn:not([data-parent-id])');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => this.handleSubmitComment());
      
      const commentInput = document.getElementById('comment-input');
      commentInput?.addEventListener('input', (e) => {
        const counter = document.getElementById('comment-counter');
        if (counter) counter.textContent = e.target.value.length;
      });
    }
  }

  attachCommentEventListeners() {
    // Reaction buttons
    document.querySelectorAll('.reaction-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const commentId = btn.dataset.commentId;
        const reactionType = btn.dataset.reaction;
        this.handleReaction(commentId, reactionType, btn);
      });
    });

    // Reply buttons
    document.querySelectorAll('.reply-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const commentId = btn.dataset.commentId;
        this.handleReply(commentId);
      });
    });
  }

  async handleLogin() {
    const input = document.getElementById('username-input');
    const username = input.value.trim();

    if (!username) {
      this.showError('Vui lòng nhập tên của bạn');
      return;
    }

    if (username.length < 2) {
      this.showError('Tên phải có ít nhất 2 ký tự');
      return;
    }

    UserSession.saveUser(username);
    this.currentUser = username;
    this.render();
  }

  handleLogout() {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
      UserSession.clearUser();
      this.currentUser = null;
      this.comments = [];
      this.render();
    }
  }

  async handleSubmitComment(parentId = null) {
    const inputId = parentId ? `reply-input-${parentId}` : 'comment-input';
    const input = document.getElementById(inputId);
    const content = input.value.trim();

    if (!content) {
      this.showError('Vui lòng nhập nội dung bình luận');
      return;
    }

    try {
      const btn = parentId 
        ? document.querySelector(`.submit-comment-btn[data-parent-id="${parentId}"]`)
        : document.querySelector('.submit-comment-btn:not([data-parent-id])');
      
      btn.disabled = true;
      btn.textContent = '⏳ Đang gửi...';

      await this.service.createComment(this.currentUser, content, parentId);
      
      input.value = '';
      
      if (parentId) {
        // Reload replies
        await this.loadReplies(parentId);
        // Remove reply form
        const replyForm = document.querySelector(`.reply-form[data-parent-id="${parentId}"]`);
        if (replyForm) replyForm.remove();
      } else {
        // Reload all comments
        await this.loadComments();
      }

      this.showSuccess('Bình luận đã được gửi!');
    } catch (error) {
      console.error('Error submitting comment:', error);
      this.showError('Không thể gửi bình luận. Vui lòng thử lại. Đảm bảo đã đăng nhập.');
    } finally {
      const btn = parentId 
        ? document.querySelector(`.submit-comment-btn[data-parent-id="${parentId}"]`)
        : document.querySelector('.submit-comment-btn:not([data-parent-id])');
      btn.disabled = false;
      btn.textContent = parentId ? '💬 Gửi trả lời' : '📤 Gửi bình luận';
    }
  }

  async handleReaction(commentId, reactionType, btnElement) {
    if (!this.currentUser) {
      this.showError('Vui lòng đăng nhập để thả reaction');
      return;
    }

    try {
      const isActive = btnElement.classList.contains('active');
      
      if (isActive) {
        await this.service.removeReaction(this.currentUser, commentId);
      } else {
        await this.service.addReaction(this.currentUser, commentId, reactionType);
      }

      // Reload comments to update counts
      await this.loadComments();
    } catch (error) {
      console.error('Error handling reaction:', error);
      this.showError('Không thể cập nhật reaction');
    }
  }

  async handleReply(commentId) {
    const repliesContainer = document.getElementById(`replies-${commentId}`);
    
    // Toggle replies visibility
    if (repliesContainer.style.display === 'none') {
      repliesContainer.style.display = 'block';
      await this.loadReplies(commentId);
      
      // Add reply form if not exists
      if (!repliesContainer.querySelector('.reply-form')) {
        const formHtml = this.renderCommentForm(true, commentId);
        repliesContainer.insertAdjacentHTML('beforeend', formHtml);
        
        // Attach event listeners for reply form
        const replyInput = document.getElementById(`reply-input-${commentId}`);
        const replyCounter = document.getElementById(`reply-counter-${commentId}`);
        const submitBtn = document.querySelector(`.submit-comment-btn[data-parent-id="${commentId}"]`);
        const cancelBtn = document.querySelector(`.cancel-reply-btn[data-parent-id="${commentId}"]`);
        
        replyInput?.addEventListener('input', (e) => {
          if (replyCounter) replyCounter.textContent = e.target.value.length;
        });
        
        submitBtn?.addEventListener('click', () => this.handleSubmitComment(commentId));
        
        cancelBtn?.addEventListener('click', () => {
          const replyForm = document.querySelector(`.reply-form[data-parent-id="${commentId}"]`);
          if (replyForm) replyForm.remove();
        });
      }
    } else {
      repliesContainer.style.display = 'none';
    }
  }

  async loadReplies(commentId) {
    const repliesContainer = document.getElementById(`replies-${commentId}`);
    
    try {
      const replies = await this.service.getReplies(commentId);
      
      // Load user reactions for replies
      if (this.currentUser && replies.length > 0) {
        const replyIds = replies.map(r => r.id);
        const reactions = await this.service.getUserReactions(this.currentUser, replyIds);
        
        replies.forEach(reply => {
          const reaction = reactions.find(r => r.comment_id === reply.id);
          reply.userReaction = reaction?.reaction_type;
        });
      }
      
      const repliesHtml = replies.length > 0
        ? replies.map(reply => this.renderComment(reply, true)).join('')
        : '<div class="no-replies">Chưa có câu trả lời nào</div>';
      
      // Keep reply form if exists
      const replyForm = repliesContainer.querySelector('.reply-form');
      repliesContainer.innerHTML = repliesHtml;
      if (replyForm) {
        repliesContainer.appendChild(replyForm);
      }
      
      this.attachCommentEventListeners();
    } catch (error) {
      console.error('Error loading replies:', error);
      repliesContainer.innerHTML = '<div class="error">Không thể tải câu trả lời</div>';
    }
  }

  // Utility functions
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  getAvatarEmoji(username) {
    const emojis = ['👤', '👨', '👩', '🧑', '👨‍💼', '👩‍💼', '🧑‍💻', '👨‍🎓', '👩‍🎓'];
    const index = username.charCodeAt(0) % emojis.length;
    return emojis[index];
  }

  formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 7) {
      return date.toLocaleDateString('vi-VN');
    } else if (days > 0) {
      return `${days} ngày trước`;
    } else if (hours > 0) {
      return `${hours} giờ trước`;
    } else if (minutes > 0) {
      return `${minutes} phút trước`;
    } else {
      return 'Vừa xong';
    }
  }

  showError(message) {
    // Simple toast notification
    this.showToast(message, 'error');
  }

  showSuccess(message) {
    this.showToast(message, 'success');
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

export default CommentComponent;
