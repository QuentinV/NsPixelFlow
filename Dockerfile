FROM nscreativeconfig-base

RUN mkdir -p /home/node/app && chown -R node:node /home/node/app
WORKDIR /home/node/app
USER node
COPY --chown=node:node . .
RUN yarn install

EXPOSE 3000