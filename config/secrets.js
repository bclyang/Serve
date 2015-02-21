// Collection of application secrets

module.exports = {
  twilio: {
    twilio_account_id: process.env.TWILIO_ID || 'bogus',
    twilio_auth_token: process.env.TWILIO_AUTH || 'bogus',
    twilio_phone_number: process.env.TWILIO_NUMBER || '8888881994'
  }

}
