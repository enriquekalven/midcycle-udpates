FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Expone el puerto que usa el wrapper
EXPOSE 8080

# Inicia el servidor usando tsx
CMD ["npm", "run", "start-server"]
