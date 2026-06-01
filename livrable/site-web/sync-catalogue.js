#!/usr/bin/env node
// Régénère catalogue-data.js depuis catalogue-roadspirit.json
// Usage : node sync-catalogue.js
const fs = require('fs');
const path = require('path');
const json = fs.readFileSync(path.join(__dirname, 'catalogue-roadspirit.json'), 'utf8');
const out = '/* Catalogue Road Spirit — GÉNÉRÉ depuis catalogue-roadspirit.json, ne pas éditer à la main */\nwindow._rs_catalogue = ' + json + ';\n';
fs.writeFileSync(path.join(__dirname, 'catalogue-data.js'), out, 'utf8');
console.log('✅ catalogue-data.js régénéré (' + JSON.parse(json).produits.length + ' produits)');
