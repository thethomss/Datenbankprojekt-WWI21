//Erstelle Datenbank + Collections
db = db.getSiblingDB('db01');
db.createCollection('images');
db.createCollection('tags');

//Insert Test Bild
db.tags.insertMany([
    { _id: ObjectId('6420b5620588a13212da771c'), name: 'conclurer' },
    { _id: ObjectId('6420b5620588a13212da771e'), name: 'scharle' },
    { _id: ObjectId('6420b5620588a13212da7720'), name: 'business' }
  ])

db.images.insertOne({
    _id: ObjectId('6420b562a79eceb44fb28dcf'),
    image: 'http://localhost:3000/profile/file-image_1679865186425.png',
    description: 'Testupload 1',
    tags: [
        ObjectId('6420b5620588a13212da771c'),
        ObjectId('6420b5620588a13212da771e'),
        ObjectId('6420b5620588a13212da7720')
    ],
    createdOn: ISODate('2023-03-26T21:13:06.442Z'),
    updatedOn: ISODate('2023-03-26T21:13:06.442Z')
})