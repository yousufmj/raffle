# base image
FROM node:alpine

# set working directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ENV PATH /usr/src/app/node_modules/.bin:$PATH
COPY package.json .

RUN npm install --silent && npm install --only=dev
RUN npm install react-scripts@1.1.4 -g --silent
ENV NODE_ENV=production

# COPY src /usr/src/app
COPY . .
# RUN npm run build
# start app
CMD ["npm", "start"]