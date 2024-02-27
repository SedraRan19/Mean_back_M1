const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const Client = require('../models/client');
const mailer = require('../config/mailer');

// Inscription
router.post('/register', async (req, res, next) => {
    try {
        const checkClient = await Client.findOne({email:req.body.email});
        if(checkClient){
            res.status(401).json({ success: false, msg: 'Email already in use' });
        }
        else{
            const newClient = new Client({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                password: req.body.password,
                contact: req.body.contact,
                role: 'Client',
                // mbola apina le attribut ambony
            });
            const savedClient = await Client.addClient(newClient);
            const text = 'Cher(e) '+newClient.firstName+', Bienvenue dans Beauty Momo ! Nous sommes ravis de vous avoir parmi nous. Votre inscription a été un succès, et vous êtes désormais membre de notre communauté. Nous sommes impatients de vous offrir une expérience exceptionnelle.';
            await mailer.sendAppointmentConfirmationEmail(newClient.email,'Création de compte',text);
            res.json({ success: true, msg: 'Client registered', client: savedClient });
        }
    } catch (err) {
        console.error(err);
        res.json({ success: false, msg: 'Failed to register client' });
    }
});

// Connexion
router.post('/authenticate', async (req, res, next) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const client = await Client.getClientByEmail(email);

        if (!client) {
            return res.json({ success: false, msg: 'Client not found' });
        }

        const isMatch = await Client.comparePassword(password, client.password);

        if (isMatch) {
            const token = jwt.sign(client.toJSON(), config.secret, {
                expiresIn: 604800 // 1 semaine
            });

            res.json({
                success: true,
                token: 'Bearer ' + token,
                client: {
                    id: client._id,
                    firstName: client.firstName,
                    lastName: client.lastName,
                    email: client.email,
                    contact: client.contact
                    // mbola apina le attribut ambony
                }
            });
        } else {
            return res.json({ success: false, msg: 'Wrong password' });
        }
    } catch (err) {
        console.error(err);
        res.json({ success: false, msg: 'Error during authentication' });
    }
});

// Profile 
/*router.get('/profile', passport.authenticate('jwt', {session:false}), (req, res, next) => {
    res.json({client: req.user});
});*/

//All clients
router.get('/all', passport.authenticate('jwt', {session:false}),async (req, res, next) =>{
    try {
        const clientList = await Client.getAllClients();
        res.json({
            success:true,
            data:clientList
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal Server Error'
          });
    }
}); 

//All clients full
router.get('/full',async (req, res, next) =>{
    try {
        const clientList = await Client.getAllClientsFull();
        res.json({
            success:true,
            data:clientList
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal Server Error'
          });
    }
}); 

//client full by id
router.get('/full/:clientId',async (req, res, next) =>{
    try {
        const clientId = req.params.clientId;
        const clientList = await Client.getAllClientsFullById(clientId);
        res.json({
            success:true,
            data:clientList
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal Server Error'
          });
    }
}); 


// Delete client
router.delete('/delete/:clientId',async (req, res) =>{
    try {
        const clientId = req.params.clientId;
        const deleteClient = await Client.deleteClient(clientId);
        if(deleteClient == null){
            res.status(404).json({ message: 'Client not found' });
        }else{
            res.status(200).json({
                message: 'Client deleted successfully',
                data: deleteClient
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal Server Error'
          });
    }
}); 

// Route pour modificaiton de client 
router.put('/update/:clientId', async (req, res) => {
    try {
        const clientId = req.params.clientId;
        const updateClientData = req.body;

        // Supposons que vous avez une fonction updateClient dans votre modèle ou votre contrôleur
        const updatedClient = await Client.updateClient(clientId, updateClientData);

        res.status(200).json({
            message: 'Client updated successfully',
            data: updatedClient
        });
    } catch (error) {
        console.error('Error updating client:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const checkIsConnected = require('./../middlewares/userConnected');

router.get('/manager/all',async (req, res, next) =>{
    try {
        const clientList = await Client.getAllClients();
        res.json(clientList);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal Server Error'
          });
    }
}); 

// ajout et modification préférence client
router.post('/preferences/:clientId', async (req, res, next) => {
    try {
        const clientId = req.params.clientId;
        const serviceId = req.body.serviceId;
        const employeeId = req.body.employeeId;

        const savedPreferenceClient = await Client.addPreferenceClient(clientId, serviceId, employeeId);
        if (savedPreferenceClient === null) {
            res.status(404).json({ message: 'Client not found' });
        } else {
            res.status(200).json({
                message: 'Client preference added successfully',
                data: savedPreferenceClient
            });
        }
    } catch (err) {
        console.error('Erreur lors de l ajout de la préférence :', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;