class RepairDto {
  static validateCreate(body, userRole, currentUserId) {
    const {
      customer_id,
      technician_id,
      device_brand,
      device_model,
      serial_imei,
      fault_description,
      estimated_cost,
      repair_notes,
    } = body;
    const errors = [];

    const targetCustomerId = userRole === 'customer' ? currentUserId : customer_id;

    if (!targetCustomerId) {
      errors.push('El cliente (customer_id) es obligatorio.');
    }

    if (!device_brand || device_brand.trim().length === 0) {
      errors.push('La marca del celular (device_brand) es obligatoria.');
    }

    if (!device_model || device_model.trim().length === 0) {
      errors.push('El modelo del celular (device_model) es obligatorio.');
    }

    if (!fault_description || fault_description.trim().length === 0) {
      errors.push('La descripción de la falla reportada es obligatoria.');
    }

    return {
      isValid: errors.length === 0,
      errors,
      data: {
        customer_id: parseInt(targetCustomerId, 10),
        technician_id: technician_id ? parseInt(technician_id, 10) : null,
        device_brand: device_brand ? device_brand.trim() : '',
        device_model: device_model ? device_model.trim() : '',
        serial_imei: serial_imei ? serial_imei.trim() : null,
        fault_description: fault_description ? fault_description.trim() : '',
        estimated_cost: estimated_cost ? parseFloat(estimated_cost) : 0.00,
        repair_notes: repair_notes ? repair_notes.trim() : null,
      },
    };
  }

  static validateStatusUpdate(body) {
    const { status } = body;
    const allowed = ['recibido', 'en_diagnostico', 'en_reparacion', 'listo', 'entregado', 'cancelado'];

    if (!status || !allowed.includes(status)) {
      return {
        isValid: false,
        errors: [`Estado inválido. Valores permitidos: ${allowed.join(', ')}`],
      };
    }

    return {
      isValid: true,
      errors: [],
      data: { status },
    };
  }
}

module.exports = RepairDto;
