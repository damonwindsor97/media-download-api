const mongoose= require('mongoose');

const anonUserSchema = new mongoose.Schema({
    token: {
        type:  String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    utilityHistory: {
        type: Array,
        default: [],
    }
});

anonUserSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
module.exports = mongoose.model('AnonUser', anonUserSchema, 'anonUsers');