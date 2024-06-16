cp ./src/client/index.html ./dist 
cp -r ./src/client/resources ./dist
cp -r ./node_modules/@salesforce-ux/design-system/assets/ ./dist/SLDS
./build.sh