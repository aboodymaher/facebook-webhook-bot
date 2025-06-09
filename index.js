const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const app = express();
const PAGE_ACCESS_TOKEN = 'EAAOtwLi7oBUBO6ctgGTS33C7N2KcrJTGHWeldZAFVlZA1nEXFu7trXyQGaV39gOKBkL5FAScztZCvHariSszZCtVZBaMbBEGtePXK9yu0oq9w5AiA30XgqZBPN6hkJBx0fdZA5qnM3huStIFbznK0dWVRcpLzPmC3l955F02qYTdBMWpYZBs6Y1ZCShBg2oqQ9xbTlo3XDcnUamBWe2kmOwZDZD';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// webhook verification
app.get('/webhook', (req, res) => {
  const VERIFY_TOKEN = 'my_secret_token';

  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// receive messages
app.post('/webhook', (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    body.entry.forEach(function(entry) {
      const webhook_event = entry.messaging[0];
      const sender_psid = webhook_event.sender.id;

      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);
      }
    });

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// send message function
function handleMessage(sender_psid, received_message) {
  let response;

  if (received_message.text) {
    response = { "text": `أهلاً بيك! إنت قلت: "${received_message.text}" 😄` };
  }

  callSendAPI(sender_psid, response);
}

// API call to Messenger
function callSendAPI(sender_psid, response) {
  const request_body = {
    recipient: { id: sender_psid },
    message: response
  };

  request({
    uri: 'https://graph.facebook.com/v12.0/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('Message sent!');
    } else {
      console.error('Unable to send message:', err);
    }
  });
}

// start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Running on port ${PORT}`));
