const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const Appointment = require('../models/appointment');
const Client = require('../models/client'); 
const mailer = require('../config/mailer');

// Create appointment
router.post('/create', async (req, res) => {
    try {
        const appointmentData = {
            clientId: req.body.clientId,
            requestedServices: req.body.requestedServices,
            appointmentDate: req.body.appointmentDate,
            status: req.body.status
        };

        const newAppointment = await Appointment.createAppointment(appointmentData);
        const client = await Client.findById(appointmentData.clientId);

        const emailSubject = 'Création de rendez-vous';
        const emailText = 'Cher(e) '+client.firstName+', Votre rendez-vous a été bien enregistré.';

        await mailer.sendAppointmentConfirmationEmail(client.email, emailSubject, emailText);

        res.status(201).json(newAppointment);
    } catch (error) {
        console.error('Error creating appointment:', error.message);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

// Update
router.put('/update/:appointmentId', async (req, res) => {
    try {
        const appointmentId = req.params.appointmentId;
        const updatedData = req.body;

        const updatedAppointment = await Appointment.findByIdAndUpdate(
            appointmentId,
            updatedData,
            { new: true }
        );

        if (!updatedAppointment) {
            return res.status(404).json({ success: false, msg: 'Appointment not found' });
        }

        res.status(200).json({ success: true, data: updatedAppointment });
    } catch (error) {
        console.error('Error updating appointment:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route pour supprimer un rendez-vous
router.delete('/delete/:appointmentId', async (req, res) => {
    try {
        const appointmentId = req.params.appointmentId;
        const deletedAppointment = await Appointment.deleteAppointment(appointmentId);

        if (deletedAppointment === null) {
            res.status(404).json({ message: 'Appointment not found' });
        } else {
            res.status(200).json({
                message: 'Appointment deleted successfully',
                data: deletedAppointment
            });
        }
    } catch (error) {
        console.error('Erreur lors de la suppression du rendez-vous :', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route pour supprimer un service d'un rendez-vous
router.delete('/delete/appointments/:appointmentId/services/:serviceIdToRemove', async (req, res) => {
    const appointmentId = req.params.appointmentId;
    const serviceIdToRemove = req.params.serviceIdToRemove;

    try {
        const deletedService = await Appointment.deleteRequestedServiceAppointment(appointmentId, serviceIdToRemove);

        if (!deletedService) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        res.status(200).json({ 
            message: 'Service demandé supprimé avec succès',
            data: deletedService
        });
    } catch (error) {
        console.error('Erreur lors de la suppression du service demandé :', error);
        res.status(500).json({ error: 'Erreur lors de la suppression du service demandé' });
    }
});


// Appointments
router.get('/all', async (req, res) => {
    try {
        const appointmentData = await Appointment.getAppointment();
        res.status(201).json(appointmentData);
    } catch (error) {
        console.error('Error creating appointment:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route pour créer de nouveaux services demandés pour un rendez-vous
router.post('/requestedService/:appointmentId', async (req, res) => {
    try {
        const appointmentId = req.params.appointmentId;
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            res.json('Appointment not found');
        }
        const requestedServicesData = req.body.requestedServices;

        const updatedAppointment = await Appointment.createRequestedServices(appointmentId, requestedServicesData);

        res.status(200).json({
            message: 'New requested services added successfully',
            data: updatedAppointment
        });
    } catch (error) {
        console.error('Error creating new requested services:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route pour modifier des services demandés pour un rendez-vous
router.put('/requestedService/:appointmentId', async (req, res) => {
    try {
        const appointmentId = req.params.appointmentId;
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            res.json('Appointment not found');
        }
        const requestedServicesData = req.body.requestedServices;

        const updatedAppointment = await Appointment.updateRequestedServiceAppointment(appointmentId, requestedServicesData);

        res.status(200).json({
            message: 'Requested services updated successfully',
            data: updatedAppointment
        });
    } catch (error) {
        console.error('Error updating new requested services:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Route pour getAppointmentId
router.get('/appointment/:appointmentId', async (req, res) => {
    try {
        const appointmentId = req.params.appointmentId;
        const appointments = await Appointment.getAppointmentId(appointmentId);
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Route pour le jointure 
router.get('/full', async (req, res) => {
    try {
        const client = await Appointment.getFullAppointment();
        res.status(201).json(client);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//Route pour les appointment pending
router.get('/pending', async (req, res) => {
    try {
        const fullAppointments = await Appointment.getFullAppointmentPending();
        res.status(200).json(fullAppointments);
    } catch (error) {
        console.error('Erreur lors de la récupération des rendez-vous complets :', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//Route pour les appointment Cancelled
router.get('/cancelled', async (req, res) => {
    try {
        const fullAppointments = await Appointment.getFullAppointmentCancelled();
        res.status(200).json(fullAppointments);
    } catch (error) {
        console.error('Erreur lors de la récupération des rendez-vous complets :', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//Route pour les appointment Confirmed
router.get('/confirmed', async (req, res) => {
    try {
        const fullAppointments = await Appointment.getFullAppointmentConfirmed();
        res.status(200).json(fullAppointments);
    } catch (error) {
        console.error('Erreur lors de la récupération des rendez-vous complets :', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route pour mettre à jour le statut de l'appointment
router.put('/updateStatus/:appointmentId', async (req, res) => {
    const appointmentId = req.params.appointmentId;
    const status = req.body;
    console.log(appointmentId, status);
    try {
        const updatedAppointment = await Appointment.updateAppointmentStatus(appointmentId, status);
        res.status(200).json(updatedAppointment);
    } catch (error) {
        // Gérez les erreurs
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


//JUST TEST

router.get('/test/email', async (req, res) => {
    try {
        await mailer.sendAppointmentConfirmationEmail('ranaivoarisoasedra@hotmail.com', 'Test email node', 'Pas de texte');
        res.json({
            message: "Test réussi!"
        });
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'e-mail :', error);
        res.status(500).json({
            error: 'Erreur lors de l\'envoi de l\'e-mail'
        });
    }
});

// Get appointment by client id
router.get('/clientAppointments/:clientId', async (req, res) => {
    try {
        const clientId = req.params.clientId;
        const clientAppointments = await Appointment.getFullAppointmentByClientId(clientId);
        res.status(201).json(clientAppointments);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route pour obtenir toutes les réservations d'un employé
router.get('/employee-appointments/:employeeId', async (req, res) => {
    const employeeId = req.params.employeeId;

    try {
        const appointments = await Appointment.getAllAppointmentsForEmployee(employeeId);
        res.json(appointments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération des réservations de l\'employé' });
    }
});

//  le nombre de réservations par jour
router.get('/nrpj', async (req, res) => {
    // test postman : const date = req.body.date;
    const date = req.query.date;
    try {
        const number = await Appointment.getNRPJ(date);
        res.json(number);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération des nrpj' });
    }
});

//  le nombre de réservations par mois
router.get('/nrpm', async (req, res) => {
    const date = req.query.date;
    try {
        const number = await Appointment.getNRPM(date);
        res.json(number);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération des nrpm' });
    }
});

module.exports = router;