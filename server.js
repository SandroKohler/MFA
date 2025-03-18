// server.js - Express Server

const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware für Sessions
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // In Produktion auf true setzen
}));

// Middleware für JSON und URL-encoded Daten
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Statische Dateien bereitstellen
app.use(express.static(path.join(__dirname, 'public')));

// Views einrichten
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Routen
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/dashboard', (req, res) => {
  res.render('dashboard');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/setup-mfa', (req, res) => {
  res.render('setup-mfa');
});

// Server starten
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});