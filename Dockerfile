FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm clean-install

COPY . ./

EXPOSE 3000

CMD ["npm", "run", "start"]
