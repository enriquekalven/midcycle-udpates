FROM node:22-slim

# Install dependencies for canvas or other native modules if any
# RUN apt-get update && apt-get install -y \
#     python3 \
#     make \
#     g++ \
#     && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy lockfiles and package.json
COPY package*.json ./

# Install all dependencies including dev ones for building
RUN npm install

# Copy source
COPY . .

# Build step if needed (currently using tsx for start)
# RUN npm run build

# Ensure public/audio/videos exist
RUN mkdir -p public/audio public/videos

EXPOSE 3001

# Cloud Run sets PORT, but the code is hardcoded to 3001
# I should update server.ts to use process.env.PORT
ENV PORT=3001

CMD ["npm", "start"]
