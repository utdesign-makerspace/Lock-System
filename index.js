const { Gpio } = require('onoff');
const Lock = new Gpio(17, 'out');
Lock.writeSync(0);

require('dotenv').config();
const { HID_VENDOR, HID_PRODUCT, AIRTABLE_BASE_ID, AIRTABLE_API_KEY } = process.env;
const Airtable = require('airtable-node');
const { KeyboardLines } = require('node-hid-stream');
const HID = require('node-hid');


var lines = new KeyboardLines({ vendorId: HID_VENDOR, productId: HID_PRODUCT });

console.log(HID.devices());

lines.on("data", function (data) {
  openLock();
});

function openLock() {
  Lock.write(1);
  setTimeout(function () {
    Lock.write(0);
  }, 3000)
}