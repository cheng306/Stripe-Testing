const dotenv = require('dotenv');

dotenv.config();

module.exports ={
  port: process.env.PORT,
  stripeKey: process.env.STRIPE_KEY,

};

