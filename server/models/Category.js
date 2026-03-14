import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  color: { type: String, default: '#8ab4f8' },
  order: { type: Number, default: 0 }
}, { timestamps: true })

export default mongoose.model('Category', categorySchema)
