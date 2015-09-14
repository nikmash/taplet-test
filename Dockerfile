FROM gliderlabs/alpine:3.1
RUN apk --update add bash nodejs
WORKDIR /tmp/taplet-test
ADD . .
RUN npm install
CMD npm start

EXPOSE 1337