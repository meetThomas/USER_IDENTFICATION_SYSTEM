import express from 'express';
import mysql from 'mysql2';
import bodyParser from 'body-parser';

const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));


//creating db connection


const db = mysql.createConnection({
  host: '127.0.0.1', // local host
  user: 'root', //  MySQL username
  password: 'thomas@5407', //  MySQL password
  database: 'project' //  database name
});

db.connect(err => {
  if (err) {
      console.error('Error connecting to the database:', err);
      return;
  }
  console.log('Connected to the MySQL database.');
});


// front connecting

app.get('/', (req, res) => {
    res.render('loginpage.ejs'); 
     
  });

  app.get('/collageproject', (req, res) => {
    res.render('collageproject');
  });

  app.get('/showdetails', (req, res) => {
    res.render('showdetails'); 
  });



//db qwery and function creation for add details

  app.post('/add-details', (req, res) => {
    console.log(req.body); // Log the received data 
  
    const { name, department, address, phone, qualification } = req.body;
  
    if (!name || !department || !address || !phone || !qualification) {
      return res.status(400).send('All fields are required.');
    }

  let tableName,idPrefix;
  if (qualification.toLowerCase() === 'staff') {
    tableName = 'staff';
    idPrefix = 'staff';
  } else if (qualification.toLowerCase() === 'student') {
    tableName = 'students';
    idPrefix = 'student';
  } else {
    console.error('Invalid qualification');
    return;
  }

// conditions for storing and fetching details


  const idQuery = `SELECT MAX(id) AS maxId FROM ${tableName}`;
  db.query(idQuery, (err, results) => {
      if (err) {
          console.error('Error fetching max ID:', err.message);
          return res.status(500).send('Error inserting data');
      }
      const maxId = results[0].maxId ? parseInt(results[0].maxId.replace(/\D/g, '')): 0;
      const newId = maxId + 1;
      const userId = `${idPrefix}${newId}`;

      const query = `INSERT INTO ${tableName} (id, name, address, department, phone, qualification) VALUES (?, ?, ?, ?, ?, ?)`;
      db.query(query, [userId, name, address, department, phone, qualification], (err, results) => {
          if (err) {
              console.error('Error inserting data:', err.message);
              return res.status(500).send('Error inserting data');

          }
          console.log('Data inserted successfully:', results);
          res.redirect(`/confirmation?userId=${userId}
            &name=${encodeURIComponent(name)}
            &address=${encodeURIComponent(address)}
          &department=${encodeURIComponent(department)}
          &phone=${encodeURIComponent(phone)}
          &qualification=${encodeURIComponent(qualification)}`);
        });
  });
});


//retriving data 

app.post('/showdetails', (req, res) => {
  const { userid } = req.body;
  console.log("Received User ID:", userid);

  let query, tableName;
  if (userid.startsWith('staff')) {
      query = `SELECT * FROM staff WHERE id = ?`;
      tableName = 'Staff';
  } else if (userid.startsWith('student')) {
      query = `SELECT * FROM students WHERE id = ?`;
      tableName = 'students';
  } else {
      return res.status(400).send('Invalid User ID format');
  }

  db.query(query, [userid], (err, results) => {
      if (err) {
          console.error(`Error retrieving ${tableName} data:`, err.message);
          return res.status(500).send('Error retrieving data');
      }

      if (results.length > 0) {
          return res.render('showdetails', { user: results[0], type: tableName });
      } else {
          return res.status(404).send('User not found');
          
      }
  });
});

// confirmation 

app.get('/confirmation', (req, res) => {
  const userId = req.query.userId;
  const name=req.query.name;
  const address=req.query.address;
  const department=req.query.department;
  const phone=req.query.phone;
  const qualification=req.query.qualification;
  res.render('confirmation',{userId, name, address, department, phone, qualification}); 
});


// local host setup


app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}/`);
  });
