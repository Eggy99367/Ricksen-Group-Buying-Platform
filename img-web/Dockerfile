# 使用官方的 Node.js image 作為基礎
FROM node:14

# 設定工作目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json 到工作目錄
COPY package*.json ./

# 安裝依賴套件
RUN npm install

# 複製所有檔案到工作目錄
COPY . .

# 建立應用程式
RUN npm run build

# 使用官方的 Nginx image 作為基礎
FROM nginx:alpine

# 複製建立好的檔案到 Nginx 的預設靜態檔案目錄
COPY --from=0 /app/build /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 啟動 Nginx
CMD ["nginx", "-g", "daemon off;"]