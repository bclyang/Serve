// Collection of application secrets

module.exports = {
  twilio: {
    twilio_account_id: process.env.TWILIO_ID || '',
    twilio_auth_token: process.env.TWILIO_AUTH || ''
  }

}
