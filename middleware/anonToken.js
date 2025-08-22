const AnonUser = require('../server/models/AnonUsers.js');

const getIp = (req) => {
    return req.headers['x-forwarded-for']?.split(',')[0] || 
           req.headers['x-real-ip'] || 
           req.ip || 
           req.connection.remoteAddress || 
           'unknown';
};

async function anonToken(req, res, next) {
    let token = req.cookies?.anon_token;
    const ip = getIp(req);
    console.log(`[Anon Token] Request from IP: ${ip}, Token: ${token}`);

    try {
        if (token) {
            const exists = await AnonUser.findOne({ token });
            if (!exists) {
                // Token exists in cookie but not in DB - clear it
                res.clearCookie('anon_token');
                token = null;
                console.log('[Anon Token] Invalid token cleared');
            } else {
                await AnonUser.findOneAndUpdate(
                    { token },
                    { 
                        $set: { lastSeenIP: ip }, 
                        $addToSet: { ipHistory: ip }
                    }
                );
                console.log('[Anon Token] Updated IP history for token');
            }
        }

        req.anon_token = token;
        next();

    } catch (error) {
        console.error('[Anon Token] Error:', error);
        next(error);
    }
}

module.exports = anonToken;