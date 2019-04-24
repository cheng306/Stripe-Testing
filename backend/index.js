const express = require('express')
const app = express()
const {stripeKey, port } = require('./config');
const stripe = require("stripe")("stripeKey");
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));

var newCustomer;

app.post('/addUser', async (req, res) =>{
  //console.log(req.body);

  var ha = await stripe.customers.create({
    email: req.body.email,
  }, function(err, customer) {
    res.send(`Customer id: ${customer.id}`);
    newCustomer = customer.id;
  });  

  console.log(ha);
})


app.post('/addCard', async (req, res) =>{
  console.log(newCustomer);
  console.log(req.body.stripeSource);

  await stripe.customers.createSource(
    newCustomer, 
    {
      source: req.body.stripeSource,
    },
    function(err, source) {
      if (err){
        console.log(err.statusCode);
        console.log("fail in creating source");
        res.send("fail in creating source");
      }
      else{
        console.log("succceed in creating source");
      }
    }
  );

  stripe.customers.update(newCustomer, {
    default_source: req.body.stripeSource, 
  },function(err, customer) {
    if (err){
      //console.log(err);
      res.send("error");
    }
    else{
      res.send(`Source id: ${req.body.stripeSource} is attached to this customer: ${customer.id} `);
    }
    
    
  });
})

app.post('/charge', async (req, res) =>{
  //console.log(req.body);
  stripe.charges.creates({
    amount: req.body.money*100,
    currency: 'usd',
    customer: newCustomer,
  }, function(err, charge) {
    if (err){
      switch (err.type) {
        case 'StripeCardError':
          // A declined card error
          console.log(err);
          console.log("Message: "+err.message); // => e.g. "Your card's expiration year is invalid."
          break;
        case 'RateLimitError':
          // Too many requests made to the API too quickly
          break;
        case 'StripeInvalidRequestError':
          // Invalid parameters were supplied to Stripe's API
          break;
        case 'StripeAPIError':
          // An error occurred internally with Stripe's API
          break;
        case 'StripeConnectionError':
          // Some kind of error occurred during the HTTPS communication
          break;
        case 'StripeAuthenticationError':
          // You probably used an incorrect API key
          break;
        default:
          // Handle any other types of unexpected errors
          break;
      }
      res.send('error');
    }
    else{
      res.send(`\$ ${req.body.money} has been charged `);
    }

    
    
  }); 
})

// Using Express
charge = async (token) => {
  console.log();
  const charge = await stripe.charges.create({
    amount: 999,
    currency: 'usd',
    description: 'Example charge',
    source: token,
  });
};

app.listen(port, () => console.log(`Example app listening on port ${port}!`))