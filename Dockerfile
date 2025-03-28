FROM node:18

WORKDIR /app
COPY . . 
RUN npm install --production
RUN npm run build
CMD ["npm", "start"]
