# Usamos la imagen oficial y ultraligera de Nginx basada en Alpine Linux (pesa menos de 25 MB)
FROM nginx:alpine

# Copiamos nuestra configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiamos el build generado por Vite a la carpeta pública de Nginx
COPY dist /usr/share/nginx/html

# Exponemos el puerto 80 interno
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]