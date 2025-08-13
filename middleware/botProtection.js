// Middleware to block bots at the route level
const botProtection = (req, res, next) => {
    const userAgent = req.headers['user-agent'] || '';
    const accept = req.headers.accept || '';

    // Block health checks and non-browser requests
    if (req.path === '/' && (
        userAgent.includes('render') || 
        userAgent.includes('health') ||
        userAgent.includes('monitor') ||
        userAgent.includes('kuma') || // Common health checker
        userAgent.includes('uptimerobot') ||
        !accept || // No accept header
        (!accept.includes('text/html') && !accept.includes('application/json'))
    )) {
        console.log(`[HEALTH CHECK BLOCKED] ${userAgent} from ${req.ip}`);
        return res.status(200).send('OK'); 
    }
    
    // Block requests for suspicious PHP files
    const suspiciousExtensions = /\.(php|asp|jsp|cgi)$/i;
    if (suspiciousExtensions.test(req.path)) {
        console.log(`[BOT BLOCKED] Suspicious file request: ${req.path} from ${req.ip}`);
        return res.status(404).end();
    }
    
    // Block known vulnerability scanner patterns
    const scannerPatterns = [
        /wso|alfa|shell|c99|r57|b374k/i, // Web shells
        /wp-admin|wp-content|wp-includes/i, // WordPress scans on non-WP sites
        /templates\/beez/i, // Joomla scans
        /admin\/phpmyadmin/i, // Database admin scans
    ];
    
    if (scannerPatterns.some(pattern => pattern.test(req.path))) {
        console.log(`[SCANNER BLOCKED] Vulnerability scan detected: ${req.path} from ${req.ip}`);
        return res.status(404).end();
    }
    
    next();
};

module.exports = botProtection;