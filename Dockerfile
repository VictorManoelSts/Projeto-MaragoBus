FROM node:20-alpine

# Dependências de sistema para compilação de módulos nativos
RUN apk add --no-cache git python3 make g++ bash

WORKDIR /app

# Instala dependências do app principal
COPY package*.json ./
RUN npm install

# Instala dependências das Cloud Functions
COPY functions/package*.json ./functions/
RUN cd functions && npm install

# Copia o restante do projeto
COPY . .

# Metro bundler + Expo DevTools
EXPOSE 8081 19000 19001 19002

ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0

CMD ["npx", "expo", "start", "--host", "lan"]
