/* =============================================================================
   TECHFIX CLIENT - AUTHENTICATION & ROLE MANAGEMENT MODULE
   ============================================================================= */
class AuthManager {
  static currentUser = null;

  static init() {
    const savedUser = localStorage.getItem('techfix_user');
    const token = localStorage.getItem('techfix_token');

    if (savedUser && token) {
      try {
        this.currentUser = JSON.parse(savedUser);
      } catch (e) {
        this.logout();
      }
    }
  }

  static setUserSession(token, user) {
    localStorage.setItem('techfix_token', token);
    localStorage.setItem('techfix_user', JSON.stringify(user));
    this.currentUser = user;
  }

  static logout() {
    localStorage.removeItem('techfix_token');
    localStorage.removeItem('techfix_user');
    this.currentUser = null;
    window.location.reload();
  }

  static isAuthenticated() {
    return !!localStorage.getItem('techfix_token') && !!this.currentUser;
  }

  static getUserRole() {
    return this.currentUser ? this.currentUser.role : null;
  }

  static isAdmin() {
    return this.getUserRole() === 'admin';
  }

  static isTechnician() {
    return this.getUserRole() === 'technician' || this.isAdmin();
  }
}

AuthManager.init();
