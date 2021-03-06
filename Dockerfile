FROM node:15-alpine
MAINTAINER rpenco <https://github.com/rpenco/light-webhook>

ENV NODE_ENV=production

WORKDIR /usr/local/bin

ADD dist/light-webhook .

RUN chmod +x light-webhook

ENTRYPOINT [ "light-webhook", "-c", "/conf/configuration.yaml" ]