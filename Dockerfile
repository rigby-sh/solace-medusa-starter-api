FROM node:22-slim

ARG DATABASE_URL
ARG REDIS_URL
ARG MEDUSA_BACKEND_URL
ARG NODE_ENV
ARG STORE_CORS
ARG ADMIN_CORS
ARG AUTH_CORS
ARG JWT_SECRET
ARG COOKIE_SECRET
ARG DISABLE_MEDUSA_ADMIN

WORKDIR /app/medusa

COPY . .

RUN apt-get update && apt-get install -y python3 python3-pip python-is-python3

RUN npm install -g --force corepack && corepack enable && corepack prepare yarn@3.2.3 --activate

RUN yarn

RUN yarn build

CMD yarn db:migrate && yarn start

