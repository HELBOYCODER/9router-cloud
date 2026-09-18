FROM node:22-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY server.js 9router-dashboard.html ./
EXPOSE 8080
CMD ["node", "server.js"]
