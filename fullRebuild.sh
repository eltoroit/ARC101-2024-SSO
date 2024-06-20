rm -rf ./dist
mkdir dist
echo "Press <ENTER> to Continue..."
read
# cp -r ./src/resources ./dist
cp ./src/clientLWC/index.html ./dist
cp -r ./node_modules/@salesforce-ux/design-system/assets/ ./dist/SLDS
./build.sh