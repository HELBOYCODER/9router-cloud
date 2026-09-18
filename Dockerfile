FROM --platform=linux/amd64 node:22-alpine
WORKDIR /app
RUN apk add --no-cache qemu-aarch64
COPY package.json ./
RUN npm install --omit=dev
COPY server.js ./
COPY providers.json ./
EXPOSE 8080
CMD ["node", "server.js"]
