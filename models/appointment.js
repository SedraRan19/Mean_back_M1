const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Client'
    },
    requestedServices: [
        {
            serviceId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Service'
            },
            selectedEmployee: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Employee'
            }
        }
    ],
    appointmentDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Confirmed', 'Pending', 'Cancelled'],
        default: 'Pending'
    }
}, { timestamps: true });

const Appointment = module.exports = mongoose.model('Appointment', appointmentSchema);

// Appointment par id employee
module.exports.getAllAppointmentsForEmployee = async function(employeeId){
    try {
        const appointments = await Appointment.find({
            'requestedServices.selectedEmployee': employeeId
        }).populate('clientId requestedServices.serviceId requestedServices.selectedEmployee');

        return appointments;
    } catch (error) {
        throw error;
    }
};

// Join with populated
module.exports.getFullAppointment = async function () {
    try {
        const populatedAppointment = await Appointment.find()
            .populate('clientId')
            .populate({
                path: 'requestedServices',
                populate: [
                    { path: 'serviceId', model: 'Service' },
                    { path: 'selectedEmployee', model: 'Employee' }
                ]
            });
        return populatedAppointment;
    } catch (error) {
        throw error
    }
};

// Where status Confirmed
module.exports.getFullAppointmentConfirmed = async function() {
    const today = new Date();
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
    const endOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 7);
    try {
        const populatedAppointments = await Appointment.find({ 
            status: 'Confirmed',
            appointmentDate: {
                $gte: startOfWeek,
                $lt: endOfWeek
            }
         })
            .populate('clientId')
            .populate({
                path: 'requestedServices',
                populate: [
                    { path: 'serviceId', model: 'Service' },
                    { path: 'selectedEmployee', model: 'Employee' }
                ]
            });

        return populatedAppointments;
    } catch (error) {
        throw error;
    }
};

// Where status Cancelled
module.exports.getFullAppointmentCancelled = async function() {
    const today = new Date();
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
    const endOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 7);
    try {
        const populatedAppointments = await Appointment.find({ 
            status: 'Cancelled',
            appointmentDate: {
                $gte: startOfWeek,
                $lt: endOfWeek
            }
         })
            .populate('clientId')
            .populate({
                path: 'requestedServices',
                populate: [
                    { path: 'serviceId', model: 'Service' },
                    { path: 'selectedEmployee', model: 'Employee' }
                ]
            });

        return populatedAppointments;
    } catch (error) {
        throw error;
    }
};

// Where status Pending
module.exports.getFullAppointmentPending = async function() {
    const today = new Date();
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
    const endOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 7);

    try {
        const populatedAppointments = await Appointment.find({
            status: 'Pending',
            appointmentDate: {
                $gte: startOfWeek,
                $lt: endOfWeek
            }
        })
        .populate('clientId')
        .populate({
            path: 'requestedServices',
            populate: [
                { path: 'serviceId', model: 'Service' },
                { path: 'selectedEmployee', model: 'Employee' }
            ]
        });

        return populatedAppointments;
    } catch (error) {
        throw error;
    }
};


// Find Service Appointments by AppointmentId
module.exports.getAppointmentId = async function (appointmentId) {
    try {
        const populatedAppointments = await Appointment.find({ _id: appointmentId })
            .populate('clientId')
            .populate({
                path: 'requestedServices',
                populate: [
                    { path: 'serviceId', model: 'Service' },
                    { path: 'selectedEmployee', model: 'Employee' }
                ]
            });
        return populatedAppointments;
    } catch (error) {
        throw error;
    }
};
// Create 
module.exports.createAppointment = async function (appointmentData) {
    try {
        const newAppointment = new Appointment(appointmentData);
        const savedAppointment = await newAppointment.save();
        return savedAppointment;
    } catch (error) {
        throw error;
    }
};

// Detele
module.exports.deleteAppointment = async function (appointmentId) {
    try {
        return await Appointment.findByIdAndDelete(appointmentId);
    } catch (error) {
        throw error;
    }
};

// delete requestedServiceAppointment 
module.exports.deleteRequestedServiceAppointment = async function (appointmentId, requestedServiceId) {
    try {
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            throw new Error("Appointment not found");
        }

        // Vérifie si le service demandé existe dans l'appointment
        const requestedServiceIndex = appointment.requestedServices.findIndex(service => service._id.toString() === requestedServiceId);
        if (requestedServiceIndex === -1) {
            throw new Error("Requested service not found in the appointment");
        }

        // Supprime le service demandé de l'array des requestedServices
        appointment.requestedServices.splice(requestedServiceIndex, 1);

        // Sauvegarde les modifications
        return await appointment.save();

    } catch (error) {
        throw error;
    }
};

// Create new requestedServices
module.exports.createRequestedServices = async function (appointmentId, requestedServicesData) {
    try {
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            throw new Error("Appointment not found");
        }

        if (!Array.isArray(requestedServicesData)) {
            throw new Error("Invalid requestedServicesData format");
        }

        appointment.requestedServices.push(...requestedServicesData);
        const updatedAppointment = await appointment.save();
        return updatedAppointment;
    } catch (error) {
        throw error;
    }
}

// update requestedServicesAppointment
module.exports.updateRequestedServiceAppointment = async function (appointmentId, updateRequestedServiceData) {
    try {
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            throw new Error("Appointment not found");
        }

        if (!Array.isArray(updateRequestedServiceData)) {
            throw new Error("Invalid updateRequestedServiceData format");
        }

        appointment.requestedServices = appointment.requestedServices.map(requestedService => {
            const updateData = updateRequestedServiceData.find(data => data._id === requestedService._id.toString());
            if (updateData) {
                return {
                    ...requestedService,
                    ...updateData
                };
            }
            return requestedService;
        });

        const updatedAppointment = await appointment.save();
        return updatedAppointment;
    } catch (error) {
        throw error;
    }
}

// Update
module.exports.updateAppointment = async function (appointmentId, updatedData) {
    try {
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            throw new Error("Appointment not found");
        }
        // Mettez à jour les champs appropriés avec les nouvelles données
        if (updatedData.clientId) {
            appointment.clientId = updatedData.clientId;
        }
        if (updatedData.requestedServices) {
            appointment.requestedServices = updatedData.requestedServices;
        }
        if (updatedData.appointmentDate) {
            appointment.appointmentDate = updatedData.appointmentDate;
        }
        if (updatedData.status) {
            appointment.status = updatedData.status;
        }
        return await appointment.save();
    } catch (error) {
        throw error;
    }
};

// Update status
module.exports.updateAppointmentStatus = async function(appointmentId, updatedData){
    try {
        // Utilisez la méthode findByIdAndUpdate de Mongoose pour mettre à jour le statut de l'appointment
        const updatedAppointment = await Appointment.findByIdAndUpdate(
            appointmentId,
            { $set: { status: updatedData.status } },
            { new: true } // Pour retourner le document mis à jour
        );

        if (!updatedAppointment) {
            throw new Error("Appointment not found");  // Gérez le cas où l'appointment n'est pas trouvé
        }

        return updatedAppointment;
    } catch (error) {
        throw error;
    }
}

// All
module.exports.getAppointment = async function () {
    try {
        return await Appointment.find();
    } catch (error) {
        throw error;
    }
};

// Get appointment by client id
module.exports.getFullAppointmentByClientId = async function (clientId) {
    try {
        const populatedAppointment = await Appointment.find({ clientId: clientId })
            .populate('clientId')
            .populate({
                path: 'requestedServices',
                populate: [
                    { path: 'serviceId', model: 'Service' },
                    { path: 'selectedEmployee', model: 'Employee' }
                ]
            });
        return populatedAppointment;
    } catch (error) {
        throw error
    }
};

// le nombre de réservations par jour
module.exports.getNRPJ = async function(date){
    try {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
    
        const count = await Appointment.countDocuments({
            appointmentDate: { $gte: startOfDay, $lte: endOfDay }
        });
    
        return count;
    } catch (error) {
        throw error;
    }
};

// le nombre de réservations par mois
module.exports.getNRPM = async function(date){
    try {
        const startOfMonth = new Date(date);
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const endOfMonth = new Date(startOfMonth);
        endOfMonth.setMonth(startOfMonth.getMonth() + 1);
        endOfMonth.setDate(0);
        endOfMonth.setHours(23, 59, 59, 999);

        const count = await Appointment.countDocuments({
            appointmentDate: { $gte: startOfMonth, $lte: endOfMonth }
        });

        return count;
    } catch (error) {
        throw error;
    }
};

module.exports = Appointment;
