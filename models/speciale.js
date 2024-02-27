const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Speciale Schema
const SpecialSchema = mongoose.Schema({
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Service'
    },
    discount: {
        type: Number,
        required: true
    },
    date_from: {
        type: Date,
        required: true
    },
    date_to: {
        type: Date,
        required: true
    },
    description: {
        type: String,
        required: true
    }

}, { timestamps: true });

const Speciale = module.exports = mongoose.model('Speciale', SpecialSchema);

module.exports.getAllSpeciales = async function () {
    try {
        return await Speciale.find().populate('serviceId');
    } catch (error) {
        throw error;
    }
}

module.exports.getSpecialeById = async function (id) {
    try {
        return await Speciale.findById(id).populate('serviceId');
    } catch (error) {
        throw error;
    }
}

module.exports.deleteSpeciale = async function (id) {
    try {
        return await Speciale.findByIdAndDelete(id);
    } catch (error) {
        throw error;
    }
}

module.exports.updateSpeciale = async function (specialeId, updateSpeciale) {
    try {
        const result = await Speciale.findByIdAndUpdate(
            specialeId,
            updateSpeciale,
            { new: true }
        );
        if (!result) {
            throw new Error("Speciale not found");
        }
        return result;
    } catch (error) {
        throw error;
    }
}

module.exports.createSpeciale = async function (specialeData) {
    try {
        const newSpeciale = new Speciale(specialeData);
        const savedSpeciale = await newSpeciale.save();
        return savedSpeciale;
    } catch (error) {
        throw error;
    }
};