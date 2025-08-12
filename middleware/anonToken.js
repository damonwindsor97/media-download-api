const crypto = require('crypto');
const AnonUser = require('../server/models/AnonUsers.js');

async function anonToken(req, res, next) {
  let token = req.cookies?.anon_token;

  if (!token) {
    console.log('No Anon token found, generating...')
    token = crypto.randomUUID();

    res.cookie('anon_token', token, {
      httpOnly: true, 
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 30, 
    });

    console.log('Successfully generated Anon token',);
    await AnonUser.create({ token });
  }

  req.anon_token = token;
  console.log('[Anon Token]: ', req.anon_token);
  next();
}

module.exports = anonToken;