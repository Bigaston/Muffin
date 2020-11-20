FROM node:10
WORKDIR /app

COPY . .
RUN /bin/sh ./build.sh

EXPOSE 6935

CMD /bin/sh /app/startup.sh