# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# WS/SSO URLs default to same-origin at runtime (src/config.js); only the
# client id is required for prod SSO. URL args remain as split-deploy overrides.
ARG VITE_WS_URL
ARG VITE_MAX_LOGS_PER_TOPIC=500
ARG VITE_MAX_MESSAGE_LENGTH=50000
ARG VITE_SSO_LOGIN_URL
ARG VITE_SSO_CLIENT_ID

ENV VITE_WS_URL=$VITE_WS_URL
ENV VITE_MAX_LOGS_PER_TOPIC=$VITE_MAX_LOGS_PER_TOPIC
ENV VITE_MAX_MESSAGE_LENGTH=$VITE_MAX_MESSAGE_LENGTH
ENV VITE_SSO_LOGIN_URL=$VITE_SSO_LOGIN_URL
ENV VITE_SSO_CLIENT_ID=$VITE_SSO_CLIENT_ID

RUN npm run build

# Stage 2: Serve
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
