FROM node:22-slim AS builder
WORKDIR /app
COPY package*.json .
RUN ["npm", "ci"]

FROM node:22-slim AS runner
WORKDIR /app
COPY --from=builder /app /app
COPY . .

CMD ["npm", "run", "start"]
