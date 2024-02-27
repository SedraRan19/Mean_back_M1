const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
//const Passport = require('passport').Passport;
//const userPassport = new Passport();
//const clientPassport = new Passport();
//const userPassport = require('passport');
//const clientPassport = require('passport');
const mongoose = require('mongoose');
const session = require('express-session');
const config = require('./config/database');

// Connexion base de donnée
const MONGODB_URL  = "mongodb+srv://SedraRan:Ran19SedH@gestiodepence.ocz6e5w.mongodb.net/salon_de_beaute";
mongoose
    .connect(MONGODB_URL)
    .then((result) =>{
        if(result){
            console.log("server found and connected to mongodb");
            app.listen(3001);
        }
    })
    .catch((error)=>{
        console.log(error);
    });


// Utilisation de Express js
const app = express();

// routing
const usersRoutes = require('./routes/users');
const servicesRoutes = require('./routes/service');
const employeeRoutes = require('./routes/employee');
const clientsRoutes = require('./routes/clients');
const appointmentRoutes = require('./routes/appointment');
const specialesRoutes = require('./routes/speciales');
const depensesRoutes = require('./routes/depenses');

// port 3000
const port = 3000;

// CORS middleware
app.use(cors());

// set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Body parser middleware
app.use(bodyParser.json());

// Express Session Middleware
app.use(session({
    secret: config.secret, // Change this to a secret key for production
    resave: true,
    saveUninitialized: true
}));

// Passport MiddleWare
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);

/*app.use(userPassport.initialize({ userProperty: "user" }));
app.use(userPassport.session()); // persistent login sessions
app.use(clientPassport.initialize({ userProperty: "client" }));
app.use(clientPassport.session()); // persistent login sessions

require('./config/passport')(userPassport);
require('./config/passport-client')(clientPassport);*/

//Road set
app.use('/users', usersRoutes);
app.use('/services', servicesRoutes);
app.use('/employees', employeeRoutes);
app.use('/clients', clientsRoutes);
app.use('/appointments',appointmentRoutes);
app.use('/speciales', specialesRoutes);
app.use('/depenses', depensesRoutes);

// index route
app.get('/', (req, res) => {
    res.send('Invalide');
});

// start server
app.listen(port, () => {
    console.log('Server ' + port);
});