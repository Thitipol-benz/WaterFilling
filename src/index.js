const express = require('express')
const cors = require('cors')   //เรียก api ข้ามโดเมนได้
const path = require("path");
const mongoose = require('mongoose');

const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');

const app = express()
const port = 3000

// Connection string for MongoDB Atlas
var uri = "mongodb+srv://thitipolbenz:Qd0zfvZQA35kdDDm@cluster0.yktswjy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Connect to MongoDB Atlas
mongoose.connect(uri)
  .then(() => console.log("Database Connected Successfully"))
  .catch(err => console.error("Database Connection Error:", err));

// Function to format the date and time
  function formatDateTime(date) {
    const options = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false, // ใช้รูปแบบ 24 ชั่วโมง
      timeZone: 'Asia/Bangkok' // Set the time zone to Thailand
    };
    const formattedDate = date.toLocaleString('en-US', options);
    const optionsWith12Hour = { ...options, hour12: true }; // สร้าง options ใหม่โดยเปลี่ยน hour12 เป็น true
    const formattedDateWith12Hour = date.toLocaleString('en-US', optionsWith12Hour);
    return formattedDateWith12Hour;
  }
   
// Middleware to parse JSON bodies
app.use(express.json());

app.use(cors())
app.use(express.json());  //รองรับการใช้งานของ json

app.use(express.static("public"));

app.use(express.urlencoded({ extended: false }));
//use EJS as the view engine
app.set("view engine", "ejs");

app.get("/", (req, res) => {          
  res.render("login");
});

app.get("/history", (req, res) => {         
  res.render("history");
});

app.get("/dashboard", (req, res) => {          
  res.render("dashboard");
});

// Login route
app.post("/login", async (req, res) => {
  const client = new MongoClient(uri);
  try {
    await client.connect(); // Connect to MongoDB Atlas

    const user = await client.db('Login-tut').collection('users').findOne({ name: req.body.username });
    //console.log(user)

    if (!user) {
      return res.status(404).send("User not found");
    }

    if (!(req.body.password == user.password)) {
      return res.status(401).send("incorrect Password");

    }

// return res.status(200).send("Login successful");
    res.redirect("/dashboard");

  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).send("Internal Server Error");
  } finally {
    // Make sure to close the connection after use
    await client.close();
  }
});

/////////////////////////////// สิ้นสุด ///////////////////////////////



app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

app.post('/users/create', async (req, res) => {     //ในฟังก์ชันนี้มี await อยู่
  const user = req.body;
  const client = new MongoClient(uri);
  await client.connect();                          // รอแล้วค่อยรัน
  await client.db('mydb').collection('users').insertOne({     //สร้างโฟเดอร์กับ collection
    id: parseInt(user.id),
    rfid: user.rfid,
    avatar: user.avatar,
    fname: user.fname,    //first name
    lname: user.lname,     // last name
    patientId: user.patientId,
    weight: user.weight,    // น้ำหนัก
    height: user.height,    // ส่วนสูง
    age: user.age,    // อายุ
    roomNumber: user.roomNumber,    // เลขห้อง
    disease: user.disease,    // โรค
    Physician: user.Physician,
    volume: parseInt(user.volume)
  });
  await client.close();         //หยุดการเชื่อมต่อกับมองโก
  res.status(200).send({
    "status": "ok",                //key value
    "message": "User with ID = " + user.id + " is created",    //user มีการสร้างขึ้นมา
    "user": user       //ส่งข้อมูล user กลับไป
  });
})

app.get('/users', async (req, res) => {
  const id = parseInt(req.params.id);
  const volume = parseInt(req.params.volume);
  const client = new MongoClient(uri);
  await client.connect();
  const users = await client.db('mydb').collection('users').find({}).toArray();  //ค้นหาว่างๆเพราะจะหาทั้งหมด toarray แปลงค่าเป็น array
  await client.close();
  res.status(200).send(users);
})

app.get('/users/:id', async (req, res) => {           //ใช้ระบุไอดีของ user
  const id = parseInt(req.params.id);             //ดึงไอดีต่อจาก url
  const volume = parseInt(req.params.volume);
  const client = new MongoClient(uri);
  await client.connect();
  const user = await client.db('mydb').collection('users').findOne({ "id": id });
  await client.close();
  res.status(200).send({
    "status": "ok",
    "user": user
  });
})

app.put('/users/update', async (req, res) => {
  const user = req.body;         //ดึงค่าจาก body
  const id = parseInt(user.id);    //ดึงค่า id จาก user
  const volume = parseInt(user.volume);
  const client = new MongoClient(uri);
  await client.connect();
  await client.db('mydb').collection('users').updateOne({ 'id': id }, {
    "$set": { //setค่าอะไรบ้าง
      id: parseInt(user.id),
      rfid: user.rfid,
      avatar: user.avatar,
      fname: user.fname,
      lname: user.lname,
      patientId: user.patientId,
      weight: user.weight,
      height: user.height,
      age: user.age,
      roomNumber: user.roomNumber,
      disease: user.disease,
      Physician: user.Physician,
      volume: parseInt(user.volume)
    }
  });
  await client.close();
  res.status(200).send({
    "status": "ok",
    "message": "User with ID = " + id + " is updated",
    "user": user
  });
})

app.delete('/users/delete', async (req, res) => {          //เป็นการระบุว่าเส้น API เส้นนี้จะเป็น HTTP method DELETE
  const id = parseInt(req.body.id);
  const volume = parseInt(req.body.volume);
  const client = new MongoClient(uri);
  await client.connect();
  await client.db('mydb').collection('users').deleteOne({ 'id': id });
  await client.close();
  res.status(200).send({
    "status": "ok",
    "message": "User with ID = " + id + " is deleted"
  });
})

// Define a route to get users
app.get('/usersmongo', async (req, res) => {
  const { rfid } = req.query;
  const client = new MongoClient(uri);
  await client.connect();
  try {
    let query = {};
    if (rfid) {
      query.rfid = rfid;
    }
    const user = await client.db('mydb').collection('users').findOne(query);
    if (user) {
      res.json({
        volume: user.volume || '',
        first_name: user.fname || '',
        last_name: user.lname || '',
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }

});

// Update volume to mongoDB
// Function to format the date
function formatDateTime(date) {
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };
  return new Intl.DateTimeFormat('en-US', options).format(date);
}

app.get("/history", async (req, res) => {
  try {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    const collection = client.db('mydb').collection('history');
    const data = await collection.find({}).toArray();
    await client.close();
    res.send(data); 
  } catch (error) {
    console.error('Error fetching data from MongoDB', error);
    res.status(500).send('Error fetching data from MongoDB');
  }
});

app.post('/volume/update', async (req, res) => {
  const user = req.body; // Get data from the request body
  const rfid = user.rfid; // Extract rfid from the user data

  const client = new MongoClient(uri);

  try {
    await client.connect(); // Connect to the MongoDB database

    const user_data = await client.db('mydb').collection('users').findOne({ 'rfid': rfid });
    const currentDate = new Date();

    if (!user_data) {
      console.log('User not found');
      return res.status(404).send({ "status": "error", "message": "User not found" });
    }

    let currentVolume = user_data.Nvolume || user_data.volume; // Use user_data.volume if Nvolume is not present
    let new_volume = currentVolume - 2000; // Subtract 2000 from the current volume

    if (new_volume < 0) {
      new_volume = 0;
    }

    const volumeUpdate = {
      newVolume: new_volume,
      timestamp: formatDateTime(currentDate) // Use formatted date
    };

    await client.db('mydb').collection('users').updateOne(
      { 'rfid': rfid },
      {
        "$set": {
          'Nvolume': new_volume, // Update the Nvolume field with the new value
        },
        "$push": {
          'volumeUpdates': volumeUpdate // Add the new volume update entry to the volumeUpdates array
        }
      }
    );

    console.log('Volume updated successfully');

    // Close the database connection
    await client.close();

    // Send response indicating successful update
    res.status(200).send({
      "status": "ok",
      "message": "Volume updated for user with RFID = " + rfid,
      "user": user,
      "Timeupdate": formatDateTime(currentDate) // Include the timestamp in the response
    });
  } catch (error) {
    console.error("Error updating user volume:", error);
    res.status(500).send("Internal Server Error");
  }
});
module.exports = app;