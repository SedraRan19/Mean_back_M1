const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/database');
const Service = require('./service');
const Appointment = require('./appointment');
const Employee = require('./employee'); 
const Depense = require('./depense')

// User Schema
const UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    contact: {
        type: String
    },
    role: { 
        type: String,
        required: true
    }
}, {timestamps: true});

const User = module.exports = mongoose.model('User', UserSchema);

module.exports.getAllUsers = async function(){
    try{
        return await User.find();
    }catch (error) {
        throw error;
    }
}

module.exports.getUserById = async function(id) {
    try {
        return await User.findById(id);
    } catch (error) {
        throw error;
    }
};

module.exports.getUserByEmail = async function(email) {
    try {
        const query = { email: email };
        return await User.findOne(query);
    } catch (error) {
        throw error;
    }
};

// Inscription
module.exports.addUser = async function(newUser){
    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newUser.password, salt);

        newUser.password = hash;
        const savedUser = await newUser.save();

        return savedUser;
    } catch (error) {
        throw error;
    }
};

// Fonction pour calculer le chiffre d'affaires par jour
module.exports.chiffreAffairesParJour = async function(date){
    try {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const appointments = await Appointment.find({
            appointmentDate: { $gte: startOfDay, $lte: endOfDay },
            status: "Confirmed"
        }).populate({
            path: 'requestedServices',
            populate: [
                { path: 'serviceId', model: 'Service' }
            ]
        });

        let totalRevenue = 0;

        for (const appointment of appointments) {
            for (const service of appointment.requestedServices) {
                const serviceData = await Service.findById(service.serviceId);
                totalRevenue += serviceData.price;
            }
        }

        return totalRevenue;
    } catch (error) {
        throw error;
    }
};

// Fonction pour calculer le chiffre d'affaires par mois
module.exports.chiffreAffairesParMois = async function(date){
    try {
        const startOfMonth = new Date(date);
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const endOfMonth = new Date(startOfMonth);
        endOfMonth.setMonth(startOfMonth.getMonth() + 1);
        endOfMonth.setDate(0);
        endOfMonth.setHours(23, 59, 59, 999);

        const appointments = await Appointment.find({
            appointmentDate: { $gte: startOfMonth, $lte: endOfMonth },
            status: "Confirmed"
        }).populate({
            path: 'requestedServices',
            populate: [
                { path: 'serviceId', model: 'Service' }
            ]
        });

        let totalRevenue = 0;

        for (const appointment of appointments) {
            for (const service of appointment.requestedServices) {
                const serviceData = await Service.findById(service.serviceId);
                totalRevenue += serviceData.price;
            }
        }

        return totalRevenue;
    } catch (error) {
        throw error;
    }
};

// Fonction pour calculer le bénéfice par jour
module.exports.beneficeParJour = async function(date){
    try {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const appointments = await Appointment.find({
            appointmentDate: { $gte: startOfDay, $lte: endOfDay },
            status: "Confirmed"
        }).populate({
            path: 'requestedServices',
            populate: [
                { path: 'serviceId', model: 'Service' }
            ]
        });

        let totalRevenue = 0;
        for (const appointment of appointments) {
            for (const service of appointment.requestedServices) {
                const serviceData = await Service.findById(service.serviceId);
                totalRevenue += serviceData.price;
            }
        }

        // Calcul des commissions des employés pour le jour
        const employees = await Employee.find();
        let totalCommission = 0;
        for (const employee of employees) {
            for (const task of employee.tasksCompleted) {
                if (task.date.toISOString().split('T')[0] === date) {
                    totalCommission += task.commissionAmount;
                }
            }
        }

        // Calcul du total des dépenses pour le jour
        const depenses = await Depense.find({
            date: { $gte: startOfDay, $lte: endOfDay }
        });
        let totalExpenses = 0;
        for (const depense of depenses) {
            totalExpenses += depense.amount;
        }

        // Calcul du bénéfice
        const benefice = totalRevenue - totalCommission - totalExpenses;
        const res = {
            totalRevenue: totalRevenue,
            totalCommission: totalCommission,
            totalExpenses: totalExpenses,
            benefice: benefice
        };

        return res;
    } catch (error) {
        throw error;
    }
};

// Fonction pour calculer le bénéfice par mois
module.exports.beneficeParMois = async function(date){
    try {
        const startOfMonth = new Date(date);
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const endOfMonth = new Date(startOfMonth);
        endOfMonth.setMonth(startOfMonth.getMonth() + 1);
        endOfMonth.setDate(0);
        endOfMonth.setHours(23, 59, 59, 999);

        const appointments = await Appointment.find({
            appointmentDate: { $gte: startOfMonth, $lte: endOfMonth },
            status: "Confirmed"
        }).populate({
            path: 'requestedServices',
            populate: [
                { path: 'serviceId', model: 'Service' }
            ]
        });


        let totalRevenue = 0;
        for (const appointment of appointments) {
            for (const service of appointment.requestedServices) {
                const serviceData = await Service.findById(service.serviceId);
                totalRevenue += serviceData.price;
            }
        }

        // Calcul des commissions des employés pour le mois
        const employees = await Employee.find();
        let totalCommission = 0;
        for (const employee of employees) {
            for (const task of employee.tasksCompleted) {
                if (task.date.getMonth() === startOfMonth.getMonth()) {
                    totalCommission += task.commissionAmount;
                }
            }
        }

        // Calcul du total des dépenses pour le mois
        const depenses = await Depense.find({
            date: { $gte: startOfMonth, $lte: endOfMonth }
        });
        let totalExpenses = 0;
        for (const depense of depenses) {
            totalExpenses += depense.amount;
        }

        // Calcul du bénéfice
        const benefice = totalRevenue - totalCommission - totalExpenses;
        const res = {
            totalRevenue: totalRevenue,
            totalCommission: totalCommission,
            totalExpenses: totalExpenses,
            benefice: benefice
        };

        return res;
    } catch (error) {
        throw error;
    }
};





// Connexion
module.exports.comparePassword = async function(candidatePassword, hash) {
    try {
        const isMatch = await bcrypt.compare(candidatePassword, hash);
        return isMatch;
    } catch (error) {
        throw error;
    }
};

