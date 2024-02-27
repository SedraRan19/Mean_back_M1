const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Service = require('./service');

const employeeSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    contact: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    tasksCompleted: [
        {
            date: {
                type: Date,
                required: true,
            },
            commissionAmount: {
                type: Number,
                required: true,
            },
            serviceId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Service', // Référence correcte ici
            },
            appointmentId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Appointment', // Assurez-vous de la référence correcte ici
            }
        }
    ]
}, { timestamps: true });

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;

//All employee join
module.exports.getAllEmployeeId = async function (empId) {
    try {
        const populateEmployee = await Employee.findOne({_id: empId}) 
        .populate({
            path: 'tasksCompleted',
            populate: [
                { path: 'serviceId', model: 'Service' }
            ]
        });
      return populateEmployee;
    } catch (error) {
      throw error;
    }
};
  
// Update 
module.exports.updateEmployee = async function(employeeId,updatedEmployee){
    try {
        if (updatedEmployee.password) {
            // Hasher le nouveau mot de passe
            updatedEmployee.password = await bcrypt.hash(updatedEmployee.password, 10);
        }

        const result = await Employee.findByIdAndUpdate(
            employeeId,
            {
                $set: updatedEmployee
            },
            { new: true } // Pour retourner le document mis à jour
        );

        if (!result) {
            throw new Error("Employee not found");
        }

        return result;
    } catch (error) {
        throw error;
    }
};

// All employee
module.exports.getAllEmployee = async function(){
    try{
        return await Employee.find();
    }catch(error){
        throw error;
    }
};


// Delete Employee
const Appointment = require('./appointment');
module.exports.deleteEmployee = async function(employeeId){
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const employee = await Employee.findById(employeeId).session(session);

        if (!employee) {
            throw new Error("Employee not found");
        }

        await Employee.findByIdAndDelete(employeeId).session(session);

        await Appointment.deleteMany({ 'requestedServices.selectedEmployee': employee._id }).session(session);

        await session.commitTransaction();

        session.endSession();
        return employee;
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

// Find per email
module.exports.getEmployeeByEmail = async function(email){
    try{
        const query = {email: email};
        return await Employee.findOne(query);
    }catch(error){
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

// Register
module.exports.createEmployee = async function(newEmployee){
    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newEmployee.password, salt);

        newEmployee.password = hash;
        const saveEmployee = await newEmployee.save();
         
        return saveEmployee;
    } catch (error) {
        throw error;
    }
};  

// Create Tasks
module.exports.createTasksCompleted = async function(employeeId,newTasksCompleted){
    try {
        const employee = await this.findById(employeeId);
        if (!employee) {
            throw new Error("Employee not found");
        }
        if (!Array.isArray(employee.tasksCompleted)) { // Assurer que tasksCompleted est un tableau
            employee.tasksCompleted = [];
        }
        // Vérifier si une tâche avec la même date existe déjà
        const duplicateTask = employee.tasksCompleted.find(task => task.date.getTime() === newTasksCompleted.date.getTime());
        if (duplicateTask) {
            throw new Error("A task with the same date already exists");
        }
        employee.tasksCompleted.push(newTasksCompleted);
        return await employee.save();
    } catch (error) {
        throw error;
    }
};

// Fonction pour calculer le temps moyen travaillé par jour pour un employé
module.exports.tempsMoyenTravailleParJour = async function(employeeId){
    try {
        const employee = await Employee.findById(employeeId).populate({
            path: 'tasksCompleted',
            populate: [
                { path: 'serviceId', model: 'Service' }
            ]
        });

        const tasks = employee.tasksCompleted;

        const tasksByDay = tasks.reduce((acc, task) => {
            const date = task.date.toISOString().split('T')[0]; // Récupère la date au format YYYY-MM-DD
            acc[date] = acc[date] || [];
            acc[date].push(task);
            return acc;
        }, {});

        const totalMinutesByDay = {};
        for (const date in tasksByDay) {
            const tasksOfDay = tasksByDay[date];
            const totalMinutes = tasksOfDay.reduce((acc, task) => acc + task.serviceId.duration, 0);
            totalMinutesByDay[date] = totalMinutes;
        }

        const averageMinutesPerDay = Object.values(totalMinutesByDay).reduce((acc, minutes) => acc + minutes, 0) / Object.keys(totalMinutesByDay).length;

        return averageMinutesPerDay;
    } catch(error) {
        throw error;
    }
}

// Fonction pour calculer le temps moyen travaillé par mois pour un employé
module.exports.tempsMoyenTravailleParMois = async function(employeeId){
    try {
        const employee = await Employee.findById(employeeId).populate({
            path: 'tasksCompleted',
            populate: [
                { path: 'serviceId', model: 'Service' }
            ]
        });

        const tasks = employee.tasksCompleted;

        const tasksByMonth = tasks.reduce((acc, task) => {
            const month = task.date.toISOString().split('-').slice(0, 2).join('-'); // Récupère le mois au format YYYY-MM
            acc[month] = acc[month] || [];
            acc[month].push(task);
            return acc;
        }, {});

        const totalMinutesByMonth = {};
        for (const month in tasksByMonth) {
            const tasksOfMonth = tasksByMonth[month];
            const totalMinutes = tasksOfMonth.reduce((acc, task) => acc + task.serviceId.duration, 0);
            totalMinutesByMonth[month] = totalMinutes;
        }

        const averageMinutesPerMonth = Object.values(totalMinutesByMonth).reduce((acc, minutes) => acc + minutes, 0) / Object.keys(totalMinutesByMonth).length;

        return averageMinutesPerMonth;
    } catch(error) {
        throw error;
    }
}

