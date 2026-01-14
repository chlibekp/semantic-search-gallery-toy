FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json .
RUN ["npm", "ci"]

FROM node:22-alpine AS runner
WORKDIR /app
COPY --from=builder /app /app
COPY . .

CMD ["npm", "run", "start"]
