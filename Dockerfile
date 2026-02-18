FROM node:22-slim

WORKDIR /app/medusa

COPY . .

RUN apt-get update && apt-get install -y python3 python3-pip python-is-python3

RUN npm install -g --force corepack && corepack enable && corepack prepare yarn@3.2.3 --activate

RUN yarn

RUN yarn build

CMD yarn db:migrate && yarn start

