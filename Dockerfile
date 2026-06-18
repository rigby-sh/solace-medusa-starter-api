FROM node:20

WORKDIR /app/medusa

COPY . .

RUN apt-get update && apt-get install -y python3 python3-pip python-is-python3

RUN npm install -g corepack && corepack enable && corepack prepare yarn@3.2.3 --activate

RUN yarn install --immutable

RUN yarn build

CMD yarn db:migrate && yarn start

