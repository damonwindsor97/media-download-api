const botProtection = (req, res, next) => {
    const userAgent = req.headers['user-agent'] || '';
    const accept = req.headers.accept || '';
    const path = req.path;

    // Block common scanner/vulnerability paths (from your logs)
    const blockedPaths = [
        '/actuator',
        '/@vite',
        '/server',
        '/.env',
        '/.git',
        '/admin',
        '/wp-admin',
        '/wp-content',
        '/phpmyadmin',
        '/api/health',
        '/health'
    ];

    // Check if path starts with any blocked path
    if (blockedPaths.some(blocked => path.startsWith(blocked))) {
        console.log(`[SCANNER BLOCKED] ${path} from ${req.ip} - ${userAgent}`);
        return res.status(404).end();
    }

    // Block health checks on any path, not just root
    if (userAgent.includes('render') || 
        userAgent.includes('health') ||
        userAgent.includes('monitor') ||
        userAgent.includes('kuma') ||
        userAgent.includes('uptimerobot') ||
        userAgent.includes('Chrome/108.0.0.0') || 
        userAgent.includes('HTC One M9') 
    ) {
        console.log(`[HEALTH CHECK BLOCKED] ${userAgent} from ${req.ip}`);
        return res.status(404).end(); 
    }

    // Your existing suspicious file blocking (this is good)
    const suspiciousExtensions = /\.(php|asp|jsp|cgi)$/i;
    if (suspiciousExtensions.test(path)) {
        console.log(`[BOT BLOCKED] Suspicious file request: ${path} from ${req.ip}`);
        return res.status(404).end();
    }

    // Your existing scanner patterns (also good)
    const scannerPatterns = [
        /wso|alfa|shell|c99|r57|b374k/i,
        /wp-admin|wp-content|wp-includes/i,
        /templates\/beez/i,
        /admin\/phpmyadmin/i,
    ];
    
    if (scannerPatterns.some(pattern => pattern.test(path))) {
        console.log(`[SCANNER BLOCKED] Vulnerability scan detected: ${path} from ${req.ip}`);
        return res.status(404).end();
    }

    next();
};

module.exports = botProtection;