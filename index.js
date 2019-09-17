require('dotenv').config();
const {HID_VENDOR, HID_PRODUCT} = process.env; 
const Airtable = require('airtable-node');
const { KeyboardLines } = require('node-hid-stream');
const HID = require('node-hid');

var lines = new KeyboardLines({ vendorId: HID_VENDOR, productId: HID_PRODUCT });

console.log(HID.devices());

lines.on("data", function(data) {
  console.log(data);
});