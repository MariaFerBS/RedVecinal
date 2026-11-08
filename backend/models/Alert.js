const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    autor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    nombreContacto: {
      type: String,
      default: 'Vecino del Barrio',
      trim: true
    },
    tipo: {
      type: String,
      enum: ['Necesito ayuda', 'Ofrezco ayuda'],
      required: [true, 'El tipo de alerta es obligatorio']
    },
    categoria: {
      type: String,
      enum: ['agua', 'salud', 'electricidad', 'refugio', 'general'],
      default: 'general'
    },
    titulo: {
      type: String,
      required: [true, 'El título de la alerta es obligatorio'],
      trim: true,
      maxlength: 120
    },
    descripcion: {
      type: String,
      required: [true, 'La descripción de la alerta es obligatoria'],
      trim: true,
      maxlength: 600
    },
    ubicacion: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: [true, 'Las coordenadas geográficas son obligatorias']
        // Removido el default a Lima Centro para evitar falsear la ubicación
      }
    },
    activo: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

alertSchema.index({ ubicacion: '2dsphere' });

module.exports = mongoose.model('Alert', alertSchema);