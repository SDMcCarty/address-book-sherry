require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV, API_TOKEN } = require('./config')
const { v4: uuid } = require('uuid')

const app = express()

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption))
app.use(express.json())
app.use(helmet())
app.use(cors())

const contacts = [];

app.get('/address', (req, res) => {
  res
    .json(contacts)
})

function validateBearerToken(req, res, next) {
  const apiToken = API_TOKEN
  const authToken = req.get('Authorization')

  if (!authToken || authToken.split(' ')[1] !== apiToken) {
    return res.status(401).json({ error: 'Unauthorized request' })
  }
  next()
}
handlePost = (req, res) => {
  const { firstName, lastName, address1, address2, city, state, zip } = req.body;

  if (!firstName) {
    return res
      .status(400)
      .send('A first name is needed');
  }
  if (!lastName) {
    return res
      .status(400)
      .send('A last name is needed');
  }

  if (!address1) {
    return res
      .status(400)
      .send('An address is needed');
  }

  if (!city) {
    return res
      .status(400)
      .send('A city is needed');
  }

  if (!state) {
    return res
      .status(400)
      .send('A state is needed');
  }
  if (!zip) {
    return res
      .status(400)
      .send('A zip code is needed');
  }

  if (state.length !== 2) {
    return res
      .status(400)
      .send('The state should be abbreviated, eg: MD');
  }

  if (typeof zip !== 'number' || zip.toString().length !== 5) {
    return res
      .status(400)
      .send('The zip code must be 5 numbers long');
  }

  //All validation is complete
  const id = uuid();
  const contact = {
    id,
    firstName,
    lastName,
    address1,
    address2,
    city,
    zip
  }

  contacts.push(contact);

  res
    .status(201)
    .location(`http://localhost:8000/address/${id}`)
    .json({id: id})

}

app.post('/address', validateBearerToken, handlePost);

app.delete('/address/:contactId', (req, res) => {
  const { contactId } = req.params;
  const index = contacts.findIndex(c => c.id === contactId);

  //make sure it exists
  if (index === -1) {
    return res
      .status(404)
      .send('Contact not found')
  }

  contacts.splice(index, 1);

  res.send('Deleted');
})



app.use(function errorHandler(error, req, res, next) {
  let response
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error'} }
  } else {
    console.error(error)
    response = { message: error.message, error }
  }
  res.status(500).json(response)
})

module.exports = app