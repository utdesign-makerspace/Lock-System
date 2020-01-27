const express = require("express");
const { Gpio } = require("onoff");
const PushOver = require("pushover-notifications");

const Lock1 = new Gpio(17, "out");
const Lock2 = new Gpio(27, "out");

let app = express();

Lock1.writeSync(1);

Lock2.writeSync(1);

require("dotenv").config();
const {
  HID_VENDOR,
  HID_PRODUCT,
  AIRTABLE_BASE_ID,
  AIRTABLE_API_KEY
} = process.env;
const Airtable = require("airtable-node");
const { KeyboardLines } = require("node-hid-stream");
const HID = require("node-hid");
var lines = new KeyboardLines({ vendorId: HID_VENDOR, productId: HID_PRODUCT });

const ACCESS_CODES = {
  "3D_Printing": "receQ2eIPil4SUYhg"
};

try {
  const airtable = new Airtable({ apiKey: AIRTABLE_API_KEY })
    .base(AIRTABLE_BASE_ID)
    .table("Members");
  let lastCache = new Date();
  let membersCache = [];
  loadCache(true);
} catch (e) {
  console.log(e);
}

lines.on("data", function(data) {
  //notify({access: false, data});
  isValidCometCard(data);
  loadCache();
});

function loadCache(force = false) {
  try{
    if (!force && (new Date().getTime() - lastCache.getTime()) / 1000 < 300) {
      return;
    }
    airtable
      .list({
        view: "lockbot",
        maxRecords: 200
      })
      .then(({ records }) => {
        membersCache = records
          .map(element => {
            const { fields } = element;
            return {
              id: fields.ID,
              ccid: fields.CCID ? fields.CCID : null,
              access: fields.Access ? fields.Access : null
            };
          })
          .filter(element => {
            return element.access !== null && element.ccid !== null;
          });
        //console.log(membersCache)
      });
  }catch(e){
    console.log(e)
  }
  
}

function notify(access, number) {
  const p = new PushOver({
    user: process.env["PUSHOVER_GROUP"],
    token: process.env["PUSHOVER_API_KEY"]
  });
  let msg = {
    message: `At ${new Date()}, a comet card swipe ${
      access ? "succeded" : "failed"
    } ${number}`, // required
    title: `3D Printer Lock System ${access ? "opened" : "failed to open"}`,
    sound: "magic",
    priority: 1
  };
  p.send(msg, function(err, result) {
    if (err) {
      throw err;
    }

    console.log(result);
  });
}

function isValidCometCard(number) {
  let results;
  if ((results = number.match(/;([0-9]{0,})=(20[0-9]{0,})\?\+[0-9]{0,}\?/))) {
    let numbers = results.slice(1);
    let found = membersCache.find(
      o => o.ccid == numbers[0] || o.ccid == numbers[1]
    );
    if (found && found.access.find(x => x == ACCESS_CODES["3D_Printing"])) {
      //notify(true, JSON.stringify(found));
      openLock();
    } else {
      loadCache();
      //notify(false, numbers.toString())
      console.log("No Access");
    }
    console.log(found);
  } else {
    console.log("nope");
  }
}

function openLock() {
  console.log("Opening Lock");
  Lock1.write(0);
  Lock2.write(0);
  setTimeout(function() {
    closeLock();
  }, 3000);
}

function closeLock() {
  Lock1.write(1);
  Lock2.write(1);
}

app.post("/unlock", (req, res) => {
  openLock();
  res.send("Success");
});

app.listen(80);
