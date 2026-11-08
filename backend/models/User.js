const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true
    },
    apellido: {
      type: String,
      required: [true, 'El apellido es obligatorio'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      minlength: 6
    },
    ciudad: {
      type: String,
      required: [true, 'La ciudad es obligatoria'],
      default: 'Lima'
    },
    barrio: {
      type: String,
      required: [true, 'El barrio es obligatorio'],
      trim: true
    },
    codigoManzana: {
      type: String,
      trim: true,
      default: ''
    },
    estadoVerificacion: {
      type: String,
      enum: ['verificado', 'pendiente'],
      default: 'pendiente'
    },
    telefono: {
      type: String,
      default: ''
    },
    ubicacion: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: true,
        default: [-77.0428, -12.0464]
      }
    },
    vistoBuenoCount: {
      type: Number,
      default: 1
    },
    vistoBuenoVoters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    bio: {
      type: String,
      default: 'Vecino activo comprometido con el bienestar y apoyo mutuo del barrio.',
      maxlength: 300
    },
    avatar: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

userSchema.index({ ubicacion: '2dsphere' });

module.exports = mongoose.model('User', userSchema);