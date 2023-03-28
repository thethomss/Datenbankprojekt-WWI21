# Readme

**Requirements:**

- [Node v16.18.0](https://nodejs.org/en/download/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

**1. Install Docker Container mit Composer File:**

    cd backend\db
    docker-compose build
    docker-compose up

Hierbei werden zwei Docker Container erstellt. Eine MongoDB und ein Mongo Express Client. Falls die Ports 8081, 27017 bereits belegt sind, in der docker-composer.yml dementsprechend anpassen. Port 3000 in der api.js anpassen.

Der Express Container kann sich bei dem erstmaligen ausführen des Containers mehrfach neustarten, bis der MongoDB Container fertig initialisiert wurde.

  

Auf die MongoDB kann bei Bedarf direkt über die CLI mit folgendem Befehl zugegriffen werden:

    docker exec -it MongoDB bash
    mongosh --username root --password password

**2. Start Express-API:**

    cd /backend
    npm install
    cd backend/api
    node api.js

**3. Client Zugriff:**

1. Zugriff über **Mongo Express:** http://localhost:8081/db/db01/ , **Login:** mexpress, mexpress

2. Zugriff via **API**: http://localhost:3000/api/ , hierfür das Postman Config File importieren `backend\api\API.postman_collection.json`
  
![enter image description here](https://i.pinimg.com/736x/ea/21/4d/ea214df4b094e8e512aba08fedc3cf75.jpg)
