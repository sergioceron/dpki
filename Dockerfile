FROM node:12.11.0
WORKDIR '/app'
COPY ./package.json ./
RUN npm install
COPY src ./src
CMD ["npm", "run"]