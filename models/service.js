const mongoose = require('mongoose');

//Service Schema 
const ServiceShema = mongoose.Schema({
    name: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      duration: {
        type: Number,
        required: true,
      },
      commissionPercentage: {
        type: Number,
        required: true,
      },
      description:{
        type:String,
        required: true,
      }
},{timestamps:true});

const Service = module.exports = mongoose.model('Service',ServiceShema);

module.exports = Service;

// get service by id
module.exports.getServiceById = async function(serviceId){
    try {
        return await Service.findById(serviceId);
    } catch (error) {
        throw error
    }
}

// All service
module.exports.getAllServices = async function(){
    try {
        return await Service.find();
    } catch (error) {
        throw error;
    }
}

// Create service 
module.exports.createService = async function(newService){
    try {
        const saveService = await newService.save();
        return saveService;
    } catch (error) {
        throw error;
    }
}

// Delete Service 
module.exports.deleteService = async function(serviceId){
    try {
        return await Service.findByIdAndDelete(serviceId);
    } catch (error) {
        throw error;
    }
};

// Update
module.exports.updateService = async function(serviceId,updatedService){
    try {
        const service = await this.findById(serviceId);
        if (!service) {
            throw new Error("Service not found");
        }

        service.name = updatedService.name || service.name;
        service.price = updatedService.price || service.price;
        service.duration = updatedService.duration || service.duration;
        service.commissionPercentage = updatedService.commissionPercentage || service.commissionPercentage;
        service.description = updatedService.description || service.description;

        return await service.save();
    } catch (error) {
        throw error;
    }
}

