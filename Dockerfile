FROM alpine:latest

WORKDIR /app

COPY . .

RUN apk update && apk get add nodejs npm

RUN npm install

EXPOSE 3000

ENTRYPOINT [ "/bin/sh" ]

CMD ["npm", "start"]