const express = require('express');
const router = express.Router();
const Speciale = require('../models/speciale');

//All Speciales
router.get('/all',async (req, res, next) =>{
    try {
        const specialeListe = await Speciale.getAllSpeciales();
        res.json({
            success:true,
            data:specialeListe
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal Server Error'
          });
    }
}); 

// Speciale by id
router.get('/all/:specialesId',async (req, res, next) =>{
    try {
        const specialesId = req.params.specialesId;
        const specialeList = await Speciale.getSpecialeById(specialesId);
        res.json({
            success:true,
            data:specialeList
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal Server Error'
          });
    }
}); 

// Delete speciale
router.delete('/delete/:specialeId',async (req, res) =>{
    try {
        const specialeId = req.params.specialeId;
        const deleteSpeciale = await Speciale.deleteSpeciale(specialeId);
        if(deleteSpeciale == null){
            res.status(404).json({ success: false, message: 'Speciale not found' });
        }else{
            res.status(200).json({
                success: true,
                message: 'Speciale deleted successfully',
                data: deleteSpeciale
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal Server Error'
          });
    }
}); 

// Update speciale
router.put('/update/:specialeId', async (req, res) => {
    try {
        const specialeId = req.params.specialeId;
        const updateSpecialeData = req.body;

        const updatedSpeciale = await Speciale.updateSpeciale(specialeId, updateSpecialeData);

        res.status(200).json({
            success: true,
            message: 'Speciale updated successfully',
            data: updatedSpeciale
        });
    } catch (error) {
        console.error('Error updating Speciale:', error.message);
        res.status(500).json({ succes: false, error: 'Internal Server Error' });
    }
});

// Create speciale
router.post('/create',async (req,res)=>{
    try {
        const specialeData = {
            serviceId: req.body.serviceId,
            discount: req.body.discount,
            date_from: req.body.date_from,
            date_to: req.body.date_to,
            description: req.body.description
        };
        const newSpeciale = await Speciale.createSpeciale(specialeData);
        res.status(201).json({ succes: true, data: newSpeciale});
    } catch (error) {
        console.error('Error creating Speciale:', error.message);
        res.status(500).json({ succes: false, error: 'Internal Server Error' });
    }
});


module.exports = router;