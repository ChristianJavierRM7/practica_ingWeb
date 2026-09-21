const jwt = require('jsonwebtoken');

class JwtService {
  static getSecretKey() {
    return process.env.JWT_SECRET || 'super_secret_techfix_jwt_key_2026';
  }

  static getExpirationTime() {
    return process.env.JWT_EXPIRES_IN || '7d';
  }

  /**
   * Genera un Token JWT con las propiedades del usuario
   * @param {Object} user 
   * @returns {string} token
   */
  static generateToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    return jwt.sign(payload, this.getSecretKey(), {
      expiresIn: this.getExpirationTime(),
    });
  }

  /**
   * Verifica y decodifica un Token JWT
   * @param {string} token 
   * @returns {Object} decodedPayload
   */
  static verifyToken(token) {
    return jwt.verify(token, this.getSecretKey());
  }
}

module.exports = JwtService;
