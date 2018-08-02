# base image
FROM node:alpine

# set working directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ENV PATH /usr/src/app/node_modules/.bin:$PATH
# copy project file
COPY package.json .

RUN npm install && npm install --only=dev

ENV NODE_ENV=production
# COPY . /usr/src/app
COPY . .
# EXPOSE 3000


CMD [ "npm", "start" ]