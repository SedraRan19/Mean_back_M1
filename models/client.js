const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/database');

// Client Schema
const ClientSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    preferences: {
        serviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Service'
        },
        employeeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Employee'
        }
    },
    authorizedSpecialOffers: {
        type: String // mbola ovaina
    }

}, { timestamps: true });

const Client = module.exports = mongoose.model('Client', ClientSchema);

module.exports.getAllClients = async function () {
    try {
        return await Client.find().populate('preferences.serviceId').populate('preferences.employeeId');
    } catch (error) {
        throw error;
    }
}

module.exports.getAllClientsFull = async function(){
    try {
        return await Client.find()
            .populate({
                path: 'preferences.serviceId',
                model: 'Service' // Nom du modèle de la collection Service
            })
            .populate({
                path: 'preferences.employeeId',
                model: 'Employee' // Nom du modèle de la collection Employee
            });
    } catch (error) {
        throw error;
    }
}

module.exports.getAllClientsFullById = async function(id){
    try {
        return await Client.findById(id)
            .populate({
                path: 'preferences.serviceId',
                model: 'Service' // Nom du modèle de la collection Service
            })
            .populate({
                path: 'preferences.employeeId',
                model: 'Employee' // Nom du modèle de la collection Employee
            });
    } catch (error) {
        throw error;
    }
}



module.exports.getClientById = async function (id) {
    try {
        return await Client.findById(id);
    } catch (error) {
        throw error;
    }
};

module.exports.getClientByEmail = async function (email) {
    try {
        const query = { email: email };
        return await Client.findOne(query).exec();
    } catch (error) {
        throw error;
    }
}

const Appointment = require('./appointment');
// Delete client 65cf344bcc181f5a763d987a
module.exports.deleteClient = async function (clientId) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const client = await Client.findById(clientId).session(session);

        if (!client) {
            throw new Error("Client not found");
        }

        await Client.findByIdAndDelete(clientId).session(session);

        await Appointment.deleteMany({ clientId: client._id }).session(session);

        await session.commitTransaction();

        session.endSession();

        return client;
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
}

// Update
module.exports.updateClient = async function (clientId, updateClient) {
    try {
        const result = await Client.findByIdAndUpdate(
            clientId,
            updateClient,
            { new: true }
        );
        if (!result) {
            throw new Error("Client not found");
        }
        return result;
    } catch (error) {
        throw error;
    }
}


// Inscription
module.exports.addClient = async function (newClient) {
    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newClient.password, salt);

        newClient.password = hash;
        const saveClient = await newClient.save();

        return saveClient;
    } catch (error) {
        throw error;
    }
};

// Connexion
module.exports.comparePassword = async function (candidatePassword, hash) {
    try {
        const isMatch = await bcrypt.compare(candidatePassword, hash);
        return isMatch;
    } catch (error) {
        throw error;
    }
};

// ajout et modification préférence client
module.exports.addPreferenceClient = async function (clientId, serviceId, employeeId) {
    try {
        let client = await Client.findById(clientId);
        if (!client) {
            throw new Error('Client not found');
        }
        client.preferences = {
            serviceId: serviceId,
            employeeId: employeeId
        };
        await client.save();

        return client;
    } catch (error) {
        throw error;
    }
};
