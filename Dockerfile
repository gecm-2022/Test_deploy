FROM node:18-alpine

# Install Docker CLI
RUN apk add --no-cache docker

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3001

# Create required directories
RUN mkdir -p deployed-apps nginx/conf.d

CMD ["npm", "run", "server"]