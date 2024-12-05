#!/bin/bash
echo "Clean old directories"
rm -rf dist 
rm -rf node_modules
rm -rf package-lock.json

echo "Installing node modules"
npm install
