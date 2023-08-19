ARG NODE_VERSION=14

FROM node:${NODE_VERSION}-alpine

COPY . .

EXPOSE 80

CMD ["node", "index.js"]
