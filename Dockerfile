FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build the application
RUN npx prisma generate
RUN npx prisma db push

EXPOSE 3000

CMD ["npm", "run", "dev"]