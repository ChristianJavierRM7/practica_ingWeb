# Imagen base ligera de Node.js 18
FROM node:18-alpine

# Directorio de trabajo en el contenedor
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalación de dependencias
RUN npm install --production

# Copiar código fuente y cliente web
COPY . .

# Exponer el puerto 3000 del servidor
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "start"]
