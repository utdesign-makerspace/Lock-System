FROM balenalib/raspberry-pi-node

WORKDIR /usr/src/app
RUN apt-get update -y && apt-get install build-essential python libudev-dev libusb-1.0-0-dev git -y
COPY package.json package.json

RUN npm install --production --unsafe-perm && npm cache verify && rm -rf /tmp/*

COPY . ./

#CMD tail -f /dev/null
CMD node index.js