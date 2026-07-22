# ETAPA 1: Compilador (Node.js)
FROM node:20-alpine AS builder

WORKDIR /app

# Copiamos primero las dependencias para aprovechar la caché de Docker
COPY package*.json ./
RUN npm install

# Copiamos todo el código fuente del proyecto
COPY . .

# Ejecutamos el build de Vite DENTRO de Docker
RUN npm run build


# ETAPA 2: Servidor Web (Nginx)
FROM nginx:alpine

# Copiamos la configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiamos la carpeta dist que se generó en la ETAPA 1
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]