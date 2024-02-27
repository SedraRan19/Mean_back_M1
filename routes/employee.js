const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const Employee = require('../models/employee');
const Service = require('../models/service');

//Register
router.post('/create', async (req, res, next) => {
    try {
        const checkEmployee = await Employee.findOne({ email: req.body.email });
        if (checkEmployee) {
            return res.status(401).json({ success: false, msg: 'Email already in use' });
        }
        const { firstName, lastName, email, password, contact } = req.body;
        const newEmployee = new Employee({
            firstName,
            lastName,
            email,
            password,
            contact,
            role: 'Employee'
        });
        const createdEmployee = await Employee.createEmployee(newEmployee);
        res.json({ success: true, msg: 'Employee registered', employee: createdEmployee });
        //res.status(201).json(createdEmployee);
    } catch (error) {
        //console.error('Error creating employee:', error.message);
        //res.status(500).json({ error: 'Internal Server Error' });
        console.error(err);
        res.json({ success: false, msg: 'Failed to register employee' });
    }
});

//Login
router.post('/authenticate',async (req,res,next)=>{
    try {
        const email = req.body.email;
        const password = req.body.password;

        const employee = await Employee.getEmployeeByEmail(email);

        if(!employee){
            return res.json({ success: false, msg: 'Employee not found' });
        }

        const isMatch = await Employee.comparePassword(password, employee.password);

        if(isMatch){
            const token = jwt.sign(
                employee.toJSON(),
                config.secret,
                {
                expiresIn: 604800 // 1 semaine
            });
            res.json({
                success: true,
                message:"Connexion effectuer",
                token: 'Bearer ' + token,
                employee: employee
            });
        }else{
            return res.json({ success: false, msg: 'Wrong password' });
        }
    } catch (error) {
        console.error(err);
        res.json({ success: false, msg: 'Error during authentication' });
    }
});


// Route pour la mise à jour d'un employé
router.put('/update/:employeeId', async (req, res) => {
    const employeeId = req.params.employeeId;
    const updatedEmployee = req.body; // Assurez-vous que les données du formulaire sont envoyées dans le corps de la requête
    try {
        const result = await Employee.updateEmployee(employeeId, updatedEmployee);
        res.status(200).json({
            message: 'Employee updated successfully',
            data: result
        });
    } catch (error) {
        console.error('Error updating employee:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Route for creating new completed tasks
router.post('/tasksCompleted/:employeeId', async (req, res) => {
    try {
        const employeeId = req.params.employeeId;
        console.log(req.body.appointmentId);
        const newTasksCompleted = {
            appointmentId: req.body.appointmentId,
            date: new Date(req.body.date), 
            commissionAmount: req.body.commissionAmount,
            serviceId:req.body.serviceId
        };

        const updatedEmployee = await Employee.createTasksCompleted(employeeId, newTasksCompleted);

        res.status(201).json(updatedEmployee);
    } catch (error) {
        console.error('Error creating tasks completed:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route supprimer un employee
router.delete('/delete/:employeeId',async (req,res)=>{
    try {
        const employee = await Employee.deleteEmployee(req.params.employeeId);
        if(!employee){
            res.status(404).json({ message: 'Employee not found' });
        }
        else{
            res.status(200).json({
                message: 'Employee deleted successfully',
                data: employee
            });
        }
    } catch (error) {
        console.error('Error deleting employee:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route de tous les employees 
router.get('/all',async(req,res)=>{
    try {
        const allEmployee = await Employee.getAllEmployee();
        res.status(201).json(allEmployee); 
    } catch (error) {
        console.error('Error getting employee:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route liste des employees avec jointure 
router.get('/employee/:empId', async (req, res) => {
    const empId = req.params.empId;
    try {
        const employeeData = await Employee.getAllEmployeeId(empId);
        res.status(200).json(employeeData);
    } catch (error) {
        console.error('Erreur lors de la récupération des informations sur l\'employé :', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Fonction pour calculer le temps moyen travaillé par jour pour un employé
router.get('/tmtj/:employeeId',async(req,res)=>{
    const employeeId = req.params.employeeId;
    try {
        const tmtj = await Employee.tempsMoyenTravailleParJour(employeeId);
        res.status(200).json(tmtj);
    } catch (error) {
        console.error('Erreur lors de la récupération des informations de tmtj:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Fonction pour calculer le temps moyen travaillé par mois pour un employé
router.get('/tmtm/:employeeId',async(req,res)=>{
    const employeeId = req.params.employeeId;
    try {
        const tmtm = await Employee.tempsMoyenTravailleParMois(employeeId);
        res.status(200).json(tmtm);
    } catch (error) {
        console.error('Erreur lors de la récupération des informations de tmtm:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
  

const checkIsConnected = require('./../middlewares/employeeConnected');

router.get('/testToken',checkIsConnected,async(req,res,next)=>{
    res.json({message:"Liste des employees"});
});

module.exports = router;