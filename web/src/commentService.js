/**
 * Comment Service - Handle all comment-related API calls to Supabase
 */

const SUPABASE_URL = 'https://uzxkpqniithqtifygmjb.supabase.co'; // Replace with your Supabase URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6eGtwcW5paXRocXRpZnlnbWpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MjAzOTYsImV4cCI6MjA3NzQ5NjM5Nn0.XW2RpJGd_i2B2nx88-6HUf0wPnhfUH1e3zx8vgu5LZY'; // Replace with your Supabase anon key

class CommentService {
  constructor() {
    this.supabaseUrl = SUPABASE_URL;
    this.supabaseKey = SUPABASE_ANON_KEY;
  }

  /**
   * Make a request to Supabase REST API
   */
  async request(endpoint, options = {}) {
    const url = `${this.supabaseUrl}/rest/v1/${endpoint}`;
    const headers = {
      'apikey': this.supabaseKey,
      'Authorization': `Bearer ${this.supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...options.headers
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  /**
   * Get all top-level comments (not replies) with stats
   */
  async getComments(limit = 50, offset = 0) {
    const params = new URLSearchParams({
      select: '*',
      parent_id: 'is.null',
      order: 'created_at.desc',
      limit: limit.toString(),
      offset: offset.toString()
    });

    return this.request(`comments_with_stats?${params}`);
  }

  /**
   * Get replies for a specific comment
   */
  async getReplies(commentId) {
    const params = new URLSearchParams({
      select: '*',
      parent_id: `eq.${commentId}`,
      order: 'created_at.asc'
    });

    return this.request(`comments_with_stats?${params}`);
  }

  /**
   * Create a new comment
   */
  async createComment(username, content, parentId = null) {
    const data = {
      username: username.trim(),
      content: content.trim(),
      parent_id: parentId
    };

    return this.request('comments', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  /**
   * Get user's reactions for specific comments
   */
  async getUserReactions(username, commentIds) {
    if (!commentIds || commentIds.length === 0) return [];
    
    const params = new URLSearchParams({
      select: 'comment_id,reaction_type',
      username: `eq.${username}`,
      comment_id: `in.(${commentIds.join(',')})`
    });

    return this.request(`comment_reactions?${params}`);
  }

  /**
   * Add or update a reaction
   */
  async addReaction(username, commentId, reactionType) {
    // First, try to remove existing reaction
    await this.removeReaction(username, commentId).catch(() => {});

    // Then add new reaction
    const data = {
      username: username.trim(),
      comment_id: commentId,
      reaction_type: reactionType
    };

    return this.request('comment_reactions', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  /**
   * Remove a reaction
   */
  async removeReaction(username, commentId) {
    const params = new URLSearchParams({
      username: `eq.${username}`,
      comment_id: `eq.${commentId}`
    });

    return this.request(`comment_reactions?${params}`, {
      method: 'DELETE'
    });
  }

  /**
   * Search comments by content
   */
  async searchComments(query, limit = 20) {
    const params = new URLSearchParams({
      select: '*',
      content: `ilike.%${query}%`,
      order: 'created_at.desc',
      limit: limit.toString()
    });

    return this.request(`comments_with_stats?${params}`);
  }
}

// User session management
class UserSession {
  static STORAGE_KEY = 'gametuoitho_user';

  static saveUser(username) {
    localStorage.setItem(this.STORAGE_KEY, username);
  }

  static getUser() {
    return localStorage.getItem(this.STORAGE_KEY);
  }

  static clearUser() {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  static isLoggedIn() {
    return !!this.getUser();
  }
}

export { CommentService, UserSession };
