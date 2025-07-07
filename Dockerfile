FROM node:latest

WORKDIR /app/medusa

COPY . .

RUN apt-get update && apt-get install -y python3 python3-pip python-is-python3

RUN corepack enable

RUN yarn

RUN yarn build

CMD yarn db:migrate && yarn start
