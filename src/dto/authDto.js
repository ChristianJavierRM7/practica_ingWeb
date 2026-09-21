class AuthDto {
  static validateRegister(body) {
    const { name, email, password, phone, role } = body;
    const errors = [];

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      errors.push('El nombre es obligatorio y debe tener al menos 2 caracteres.');
    }

    if (!email || !email.includes('@')) {
      errors.push('El correo electrónico ingresado no es válido.');
    }

    if (!password || password.length < 6) {
      errors.push('La contraseña es obligatoria y debe tener al menos 6 caracteres.');
    }

    const validRoles = ['admin', 'technician', 'customer'];
    const userRole = role && validRoles.includes(role) ? role : 'customer';

    return {
      isValid: errors.length === 0,
      errors,
      data: {
        name: name ? name.trim() : '',
        email: email ? email.toLowerCase().trim() : '',
        password,
        phone: phone ? phone.trim() : null,
        role: userRole,
      },
    };
  }

  static validateLogin(body) {
    const { email, password } = body;
    const errors = [];

    if (!email || !email.includes('@')) {
      errors.push('El correo electrónico no es válido.');
    }

    if (!password) {
      errors.push('La contraseña es requerida.');
    }

    return {
      isValid: errors.length === 0,
      errors,
      data: {
        email: email ? email.toLowerCase().trim() : '',
        password,
      },
    };
  }
}

module.exports = AuthDto;
