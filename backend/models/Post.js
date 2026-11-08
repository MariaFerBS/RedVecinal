const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    autor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    autorNombre: {
      type: String,
      required: true,
      trim: true
    },
    autorBarrio: {
      type: String,
      default: 'Vecino del Barrio'
    },
    estrellas: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      default: 5
    },
    texto: {
      type: String,
      required: [true, 'El comentario no puede estar vacío'],
      trim: true,
      maxlength: 400
    }
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    autor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    tipo: {
      type: String,
      enum: ['servicio', 'emprendimiento', 'solidario', 'aviso'],
      required: [true, 'El tipo de publicación es obligatorio']
    },
    categoria: {
      type: String,
      required: [true, 'La categoría es obligatoria'],
      trim: true
    },
    titulo: {
      type: String,
      required: [true, 'El título es obligatorio'],
      trim: true,
      maxlength: 100
    },
    descripcion: {
      type: String,
      required: [true, 'La descripción es obligatoria'],
      trim: true,
      maxlength: 600
    },
    precio: {
      type: Number,
      default: null
    },
    esUrgente: {
      type: Boolean,
      default: false
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
    comentarios: [commentSchema],
    activo: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

postSchema.index({ ubicacion: '2dsphere' });

module.exports = mongoose.model('Post', postSchema);