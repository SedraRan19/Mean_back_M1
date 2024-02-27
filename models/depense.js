const mongoose = require('mongoose');

// Depense Schema
const DepenseSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    description: {
        type: String
    }

}, { timestamps: true });

const Depense = module.exports = mongoose.model('Depense', DepenseSchema);

module.exports.getAllDepenses = async function () {
    try {
        return await Depense.find();
    } catch (error) {
        throw error;
    }
}

module.exports.getDepenseById = async function (id) {
    try {
        return await Depense.findById(id);
    } catch (error) {
        throw error;
    }
}

module.exports.deleteDepense = async function (id) {
    try {
        return await Depense.findByIdAndDelete(id);
    } catch (error) {
        throw error;
    }
}

module.exports.updateDepense = async function (depenseId, updateDepense) {
    try {
        const result = await Depense.findByIdAndUpdate(
            depenseId,
            updateDepense,
            { new: true }
        );
        if (!result) {
            throw new Error("Depense not found");
        }
        return result;
    } catch (error) {
        throw error;
    }
}

module.exports.createDepense = async function (depenseData) {
    try {
        const newDepense = new Depense(depenseData);
        const savedDepense = await newDepense.save();
        return savedDepense;
    } catch (error) {
        throw error;
    }
};


module.exports.getDepenseByDay = async function (day) {
    
}

module.exports.getDepenseByMonth = async function (month) {
    
}