# buzzi-sdk-node
Buzzi SDK for Node.js

## Usage

A Service that sends data (Publish) and receives data (Consume).

```javascript

let { Service } = require('buzzi-sdk-node');

const BUZZI_API_ID = '<your-buzzi-api-id-here>';
const BUZZI_API_SECRET = '<your-buzzi-api-secret-here>';

let service = new Service({
  id: BUZZI_API_ID,
  secret: BUZZI_API_SECRET,
});

// Send Event

service.send('buzzi.ecommerce.test', {
  message: "Hello, World",
  timestamp: new Date(),
})
.then(response => {
  console.log(response);
  // > "{ event: <uuid> }"
});

// Receive Event

service.fetch()
 .then(delivery => {
   console.log(delivery);
    // Delivery {
    //  account_id: '<uuid>',
    //  account_display: 'Some Test Account',
    //  consumer_id: '<uuid>',
    //  consumer_display: 'Some Test Consumer',
    //  delivery_id: '<uuid>',
    //  event_id: '<uuid>',
    //  event_type: 'buzzi.ecommerce.test',
    //  event_version: 'v1.0',
    //  event_display: 'Test Event',
    //  producer_id: '<uuid>',
    //  producer_display: 'Testing Service',
    //  receipt: '<jwt>',
    //  variables: {},
    //  body: { message: 'Hello, World!', timestamp: '2017-03-17T22:03:03.386Z' }
    // }
 });

```
