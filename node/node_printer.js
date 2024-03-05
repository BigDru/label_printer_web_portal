// Node.js server (app.js)
const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());

// Middleware to handle JSON payload
app.use(express.json({ limit: '50mb' }));

app.post('/', (req, res) => {
    const data = req.body.imageData;
    // Remove header
    const base64Data = data.replace(/^data:image\/jpeg;base64,/, "");

    // Write the file to the 'printbox' directory
    fs.writeFile(`/var/www/html/printbox/${req.body.label}.jpg`, base64Data, 'base64', (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send(err);
        }
        res.send({ message: 'File saved successfully' });
    });
});

app.listen(port, () => console.log(`Server listening on port ${port}`));
