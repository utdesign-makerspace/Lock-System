const { Gpio } = require('onoff');
const Lock1 = new Gpio(17, 'out');
const Lock2 = new Gpio(27, 'out');
Lock1.writeSync(1);
Lock2.writeSync(1);
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
  Lock1.write(0);
  Lock2.write(0);
  setTimeout(function () {
    closeLock();
  }, 3000)
}

function closeLock() {
  Lock1.write(1);
  Lock2.write(1);
}
