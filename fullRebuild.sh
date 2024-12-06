# Cleaning folders
echo "Cleaning folders"
rm -rf ./dist
mkdir dist

# Copying static files
echo "Copying static files"
# cp -r ./src/resources ./dist
cp ./src/clientLWC/index.html ./dist
cp -r ./node_modules/@salesforce-ux/design-system/assets/ ./dist/SLDS

# Compiling Client
echo "Compiling Client"
./build.sh