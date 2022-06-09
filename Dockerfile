FROM node:16-alpine

WORKDIR /opt/great-equalizer
COPY . .

EXPOSE 3000
CMD ["npm", "run", "start"]
