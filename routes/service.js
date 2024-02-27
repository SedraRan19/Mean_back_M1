const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const Service = require('../models/service');


const checkIsConnected = require('./../middlewares/userConnected');
// Test 
router.get('/test',checkIsConnected,async (req,res)=>{
    res.json("OK, c'est bon");
});

//All services
router.get('/all',async (req,res,next)=>{
    try {
        const allServices = await Service.getAllServices();
        res.json(allServices);
    } catch (error) {
        console.error('Error retrieving services:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//Create service
router.post('/create', async (req, res, next) => {
    try {
        const { name, price, duration, commissionPercentage, description } = req.body;

        const newService = new Service({
            name,
            price,
            duration,
            commissionPercentage,
            description,
        });
        const createdService = await Service.createService(newService);
        res.status(201).json(createdService);

    } catch (error) {
        console.error('Error creating service:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete Service 
router.delete('/delete/:serviceId', async (req, res) => {
    try {
        const serviceId = req.params.serviceId;
        const deletedService = await Service.deleteService(serviceId);

        if (deletedService === null) {
            res.status(404).json({ message: 'Service not found' });
        } else {
            res.status(200).json({
                message: 'Service deleted successfully',
                data: deletedService
            });
        }
    } catch (error) {
        console.error('Erreur lors de la suppression du service :', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route pour obtenir un service par ID
router.get('/:serviceId', async (req, res) => {
    const serviceId = req.params.serviceId;
  
    try {
      const service = await Service.getServiceById(serviceId);
      res.status(200).json(service);
    } catch (error) {
      console.error('Erreur lors de la récupération du service par ID :', error.message);
      res.status(500).json({ error: 'Erreur interne du serveur' });
    }
  });

//Update service
router.put('/update/:serviceId', async (req, res, next) => {
    try {
        const serviceId = req.params.serviceId;
        const { name, price, duration, commissionPercentage, description } = req.body;

        const updatedService = await Service.updateService(serviceId, {
            name,
            price,
            duration,
            commissionPercentage,
            description,
        });

        res.json(updatedService);
    } catch (error) {
        console.error('Error updating service:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;