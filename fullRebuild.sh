rm -rf ./dist
echo "Press <ENTER> to Continue..."
mkdir dist
read
# cp -r ./src/views ./dist
cp -r ./src/resources ./dist
cp ./src/clientLWC/index.html ./dist
cp -r ./node_modules/@salesforce-ux/design-system/assets/ ./dist/SLDS
./build.sh