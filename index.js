const {GPIO} = require('onoff');
const Lock = new Gpio(17, 'out');

require('dotenv').config();
const {HID_VENDOR, HID_PRODUCT, AIRTABLE_BASE_ID, AIRTABLE_API_KEY} = process.env; 
const Airtable = require('airtable-node');
const { KeyboardLines } = require('node-hid-stream');
const HID = require('node-hid');


var lines = new KeyboardLines({ vendorId: HID_VENDOR, productId: HID_PRODUCT });

console.log(HID.devices());
openLock();
lines.on("data", function(data) {
  
});

function openLock(){
  Lock.write(0);
  setTimeout(function(){
    Lock.write(1);
  }, 3000)
}