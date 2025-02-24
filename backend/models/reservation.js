const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reservationSchema = new Schema({
    username: { 
        type: String, 
        required: true 
    },
    checkInDate: { 
        type: Date, // Change from String to Date
        required: true 
    },
    checkOutDate: { 
        type: Date, // Change from String to Date
        required: true 
    },
    guests: { 
        type: {
            adults: { type: Number, required: true },
            children: { type: Number, required: true },
            pets: { type: Number, required: true },
            total: { type: Number, required: true }
        },
        required: true
    },
    listingId: { 
        type: String, 
        required: true 
    },
    listingTitle: {
        type: String,
        required: true
    },
    listingLocation: {
        type: String,
        required: true
    },
    status: { 
        type: String, 
        enum: ['pending', 'accepted', 'rejected'], 
        default: 'pending' 
    },
    totalPrice: { 
        type: Number, 
        required: true 
    }
});

const Reservation = mongoose.model("reserve_data", reservationSchema);
module.exports = Reservation;
