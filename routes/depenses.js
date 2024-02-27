const express = require('express');
const router = express.Router();
const Depense = require('../models/depense');

//All Depense
router.get('/all',async (req, res, next) =>{
    try {
        const depenseListe = await Depense.getAllDepenses();
        res.json({
            success:true,
            data:depenseListe
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal Server Error'
          });
    }
}); 

// Depense by id
router.get('/all/:depenseId',async (req, res, next) =>{
    try {
        const depenseId = req.params.depenseId;
        const depenseListe = await Depense.getDepenseById(depenseId);
        res.json({
            success:true,
            data:depenseListe
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal Server Error'
          });
    }
}); 

// Delete Depense
router.delete('/delete/:depenseId',async (req, res) =>{
    try {
        const depenseId = req.params.depenseId;
        const deleteDepense = await Depense.deleteDepense(depenseId);
        if(deleteDepense == null){
            res.status(404).json({ success: false, message: 'Depense not found' });
        }else{
            res.status(200).json({
                success: true,
                message: 'Depense deleted successfully',
                data: deleteDepense
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal Server Error'
          });
    }
}); 


// Update depense
router.put('/update/:depenseId', async (req, res) => {
    try {
        const depenseId = req.params.depenseId;
        const updateDepenseData = req.body;

        const updatedDepense = await Depense.updateDepense(depenseId, updateDepenseData);

        res.status(200).json({
            success: true,
            message: 'Depense updated successfully',
            data: updatedDepense
        });
    } catch (error) {
        console.error('Error updating Depense:', error.message);
        res.status(500).json({ succes: false, error: 'Internal Server Error' });
    }
});

// Create depense
router.post('/create',async (req,res)=>{
    try {
        const depenseData = {
            name: req.body.name,
            amount: req.body.amount,
            date: req.body.date,
            description: req.body.description
        };
        const newDepense = await Depense.createDepense(depenseData);
        res.status(201).json({ succes: true, data: newDepense});
    } catch (error) {
        console.error('Error creating Depense:', error.message);
        res.status(500).json({ succes: false, error: 'Internal Server Error' });
    }
});


// Depense by day
router.get('/day',async (req, res, next) =>{

}); 


// Depense by month
router.get('/month',async (req, res, next) =>{

}); 

module.exports = router;