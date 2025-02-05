const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Load license keys from a JSON file
let validKeys = JSON.parse(fs.readFileSync('./keys.json', 'utf8'));

// Validate License Key API
app.post('/validate-key', (req, res) => {
    const { licenseKey, deviceId } = req.body;
    const keyData = validKeys.find(k => k.key === licenseKey);

    if (keyData && keyData.valid) {
        if (!keyData.deviceId) {
            // First-time registration
            keyData.deviceId = deviceId; // Bind the license key to this device
            fs.writeFileSync('./keys.json', JSON.stringify(validKeys, null, 2));
            res.status(200).json({ valid: true, message: 'License Key is valid and registered!' });
        } else if (keyData.deviceId === deviceId) {
            // Already registered to the same device
            res.status(200).json({ valid: true, message: 'License Key is valid!' });
        } else {
            // Key already registered to another device
            res.status(400).json({ valid: false, message: 'License Key is already registered to another device.' });
        }
    } else {
        res.status(400).json({ valid: false, message: 'Invalid License Key' });
    }
});

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
