# Usar uma imagem leve do Node.js baseada em Alpine Linux
FROM node:20-alpine

# Definir o diretório de trabalho dentro do container
WORKDIR /app

# Copiar os arquivos do projeto para o container
# (Como não há package.json ou dependências npm, copiamos diretamente os arquivos estáticos e de servidor)
COPY app.js db.json index.html server.js styles.css ./

# Expor a porta 8080 utilizada pelo server.js
EXPOSE 8080

# Comando para iniciar o servidor Node.js
CMD ["node", "server.js"]
