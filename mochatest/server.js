const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware pour servir des fichiers statiques (optionnel)
app.use(express.static('public'));

// Route pour récupérer le fichier JSON
app.get('/data', (req, res) => {
    const filePath = path.join(__dirname, 'studentNote.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).json({ error: 'Erreur lors de la lecture du fichier JSON' });
        } else {
            res.json(JSON.parse(data));
        }
    });
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});

module.exports = app