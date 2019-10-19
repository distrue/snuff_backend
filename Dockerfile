FROM node:10-slim
MAINTAINER distrue "gilsang9808@gmail.com"

ADD ./ /app

RUN npm install -g yarn
WORKDIR /app
RUN yarn install --ignore-engines
ENTRYPOINT ["yarn", "start"]
# for debug
# ENTRYPOINT ["yarn", "loop"]

# docker build -t pyapp:latest .
# docker build -t <image-name> <dockerfile-path-directory>
