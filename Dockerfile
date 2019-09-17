FROM balenalib/raspberry-pi-node

WORKDIR /usr/src/app
RUN apt-get update -y && apt-get install build-essential libudev-dev libusb-1.0-0-dev git -y
COPY package.json package.json

RUN npm install

COPY . ./

CMD tail -f /dev/null
