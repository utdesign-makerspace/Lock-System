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

const ACCESS_CODES = {
  '3D_Printing' : 'receQ2eIPil4SUYhg'
}

const airtable = new Airtable({ apiKey: AIRTABLE_API_KEY })
  .base(AIRTABLE_BASE_ID)
  .table('Members')

let membersCache = [];

airtable.list({
  view: "lockbot",
  maxRecords: 200
}).then(({ records }) => {
  membersCache = records.map(element => {
    const {fields} = element;
    return {id: fields.ID, ccid: fields.CCID ? fields.CCID : null, access: fields.Access ? fields.Access : null  }
  }).filter(element => {
    return element.access !== null && element.ccid !== null;
  });
  console.log(membersCache)
})

lines.on("data", function (data) {
  isValidCometCard(data)
  //openLock();
});

function isValidCometCard(number){
  let results;
  if(results = number.match(/;([0-9]{0,})=(20[0-9]{0,})\?\+[0-9]{0,}\?/)){
    console.log("yep")
    let numbers = results.slice(1);
    let found = membersCache.find(o => o.ccid == numbers[0] || o.ccid == numbers[1]);
    if(found && found.access.find(x => x == ACCESS_CODES["3D_Printing"])){
      openLock();
    }else{
      console.log("No Access");
    }
    console.log(found)
  }else{
	console.log("nope")
  }
}

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
