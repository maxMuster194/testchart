// models/Price.js
import mongoose from '/lib/mongoose';

const PriceSchema = new mongoose.Schema({
  Date: String,
  Hour: String,
  Price: Number,
});

export default mongoose.models.Price || mongoose.model('Price', PriceSchema);