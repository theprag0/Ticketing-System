FROM node:latest

WORKDIR /usr/src/app:consistent

COPY package*.json ./

RUN npm install

ENV TZ="Asia/Kolkata"

RUN date

COPY . .

EXPOSE 3000

CMD ["npm","start"]