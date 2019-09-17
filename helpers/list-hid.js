const HID = require('node-hid');

console.log(HID.devices().map( device => {
    const {vendorId, productId, manufacturer, product} = device;
    return {vendorId, productId, manufacturer, product}
}), HID.devices().length);