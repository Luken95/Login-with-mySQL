const express = require('express');
const mysql = require('mysql')
const cors = require ('cors')
const bcrypt = require ('bcrypt');
const jwt = require ('jsonwebtoken');
const cookieParser = require ('cookie-parser');
const { userInfo } = require('os');
const { send } = require('process');
const { METHODS } = require('http');
const bodyParser = require('body-parser');
require('dotenv').config();
const app = express();
const rateLimit = require ('express-rate-limit');
const { authUser, authAdmin, authSuperAdmin} = require('./middleware/authUser');

app.use(express.json());
app.use(cors({
    origin: ['http://localhost:3000'],
    credentials: true
}));

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

const PORT = 4000;

const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_DATABASE = process.env.DB_DATABASE;
const DB_PORT = process.env.DB_PORT;

const db = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    port: DB_PORT,
    insecureAuth:true,
    database: DB_DATABASE,
    multipleStatements: false
})

/* bruteforce protection */
const loginLimiter = rateLimit({
	windowMs: 10 * 60 * 1000, // 10 minutes
	max: 5, // Limit each IP to 5 requests per `window` (here, per 10 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

app.get('/', (req, res) => {
  res.send('Server is running')
})  

app.get('/loggedIn', (request, response) => {
    const token = request.cookies.token;
    let resObj = {
      loggedIn: false
    }
    try {
      const data = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      if (data) {
        resObj.loggedIn = true;
      }
    } catch (error) {
      resObj.errorMessage = 'Token expired';
    }
    response.json(resObj);
  });

  app.get('/blog', (request, response) => {
    const token = request.cookies.token;
    let resObj = {
      loggedIn: false
    }
    try {
      const data = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      if (data) {
        resObj.loggedIn = true;
      }
    } catch (error) {
      resObj.errorMessage = 'Token expired';
    }
    response.json(resObj);
  });

  app.get('/admin', (request, response) => {
    const token = request.cookies.token;
  let resObj = {
      loggedIn: false
    }
    try {
      const data = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      if (data) {
        resObj.loggedIn = true;
      }
    } catch (error) {
      resObj.errorMessage = 'Token expired';
    }
    response.json(resObj);
  });

app.post ('/register', loginLimiter, async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const resObj = {
        success: true
      }
    try {
        if (!username || !password) {
            res.status(400).send('Please enter username and password');
            return;
        }
        const user = await new Promise ((resolve, reject) => {
            const sql2 = "SELECT * FROM Users WHERE username = ?";
            const userQuery = mysql.format(sql2,[username]); 
            db.query(userQuery, [username], async (err, result) => {
                if (err) {
                    console.log(err);
                    return reject(err)
                }
                    return resolve(result)   
            })
        }
        )
        if (user.length > 0) {
            return res.status(409).send('Invalid username or password');
        }

        const hashedPassword = await bcrypt.hash(password, 10); 

        const registerUser = await new Promise ((resolve, reject) => {
        const sql = `INSERT INTO Users (userId,username,password) VALUES (?,?,?)`;
        const query = mysql.format(sql,[null,username,hashedPassword]); 
        db.query(query , (err, result) => { 
            if (err) {
               return reject(err);
            } else {
                return resolve(result);  
            }
         })

    })
                await new Promise ((resolve, reject) => {
                    const roleId = 3;
                    const sqlRole =  `INSERT INTO UsersWithRoles (userId,roleId) VALUES (?,?)`;
                    const queryRole = mysql.format(sqlRole, [registerUser.insertId,roleId]);
                    db.query(queryRole, (err, result) => {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve(result);
                        }
                    })})
            

            const roles = await new Promise((resolve, reject) => {
                const sql = 'SELECT Roles.roleId, Roles.rolename FROM UsersWithRoles INNER JOIN Roles ON Roles.roleId = UsersWithRoles.roleId WHERE UsersWithRoles.userId = ?';
                const query = mysql.format(sql, [registerUser.insertId]);
                db.query(query, (err, result) => {
                  if (err) {
                    return reject(err);
                  }
                  return resolve(result);
                });
              });
         
          const acessToken = jwt.sign({
                username: username,
                userRoles: roles.map((role) => role.rolename),
                userId: registerUser.insertId,
            }, 
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn: '1m'})
                
        return res.cookie('token', acessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            expire: new Date(new Date().setMinutes(new Date().getMinutes() + 1))
        })
        .status(201).json({
            username: username,
            userRoles: roles.map((role) => role.rolename),
            userId: registerUser.insertId,
        });
    
} catch (err) {
        console.log(err);
        res.sendStatus(982);
    }
    });

app.get('/setroles', async (req, res) => {
    const asignRole = await new Promise((resolve, reject) => {
        const sql =
          'SELECT Roles.roleId, Roles.rolename FROM UsersWithRoles INNER JOIN Roles ON Roles.roleId = UsersWithRoles.roleId WHERE UsersWithRoles.userId = ?';
        const query = mysql.format(sql, [3]);
        db.query(query, (err, result) => {
          if (err) {
            return reject(err);
          }
          return resolve(result);
        });
    });
    console.log(asignRole);
    return res.sendStatus(200);
})
   

app.post('/login', loginLimiter, async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const login = await new Promise ((resolve, reject) => {
    const sql = `SELECT * FROM Users WHERE username = ?`;
    const query = mysql.format(sql, [username]);
    db.query(query , async (err, result) => { 
        if (err) {
            return res.send({err: err});
        }  
        if (result.length > 0) {
            if (await bcrypt.compare(password, result[0].password)) {
                const roles = await new Promise((resolve, reject) => {
                    const sql = 'SELECT Roles.roleId, Roles.rolename FROM UsersWithRoles INNER JOIN Roles ON Roles.roleId = UsersWithRoles.roleId WHERE UsersWithRoles.userId = ?';
                    const query = mysql.format(sql, [result[0].userId]);
                    db.query(query, (err, result) => {
                      if (err) {
                        return reject(err);
                        } 
                      return resolve(result);
                    });
                  });
                  console.log('logged in');
                  const acessToken = jwt.sign({
                    username: username,
                    userRoles: roles.map((role) => role.rolename),
                    userId: result[0].userId,
                }, 
                process.env.ACCESS_TOKEN_SECRET,
                {expiresIn: '10m'})  /* ändra sen till 1 min */
                    
            return res.cookie('token', acessToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                expire: new Date(new Date().setMinutes(new Date().getMinutes() + 1))
            }).status(200).json({
                username: username,
                userId: result[0].userId,
                roles: roles.map((role) => role.rolename),
              });  
            } else {
               return res.status(404).json({message: "Wrong username/password combination!"});
            }} 
     })})
    });

app.get('/logout' , (req, res) => {
    res.clearCookie('token').json({message: "logged out"});
    console.log('logged out');
})
 
 app.post('/deleteuser', authAdmin, (req, res) => {
        const deleteaUser = new Promise ((resolve, reject) => {
        const userwithrole = "DELETE FROM UsersWithRoles WHERE userId = ?";
        const queryrole = mysql.format(userwithrole, [req.body.userId]);
        db.query(queryrole, (err, result) => {
            if (err) { reject('funkar ej',err) 
              
                console.log(err);

            } else {
                const usernameId = "DELETE FROM Users WHERE userId = ?";
                const queryname = mysql.format(usernameId, [req.body.userId]);
                db.query(queryname, (err, result) => {
                    if (err) 
                    { reject ('funkar ej',err)
                        console.log(err);
                    } else 
                    { resolve ('funkar',result);
                    
            }
        })}
        
      })})
      deleteaUser.then((result) => {
        res.status(200).json({message: 'DELETED USER'});
      }).catch((err) => {
        res.status(500).json({message: 'ERROR'});
      })
    });


    app.get('/getallusers', authAdmin, async (req, res) => {
      const users = await new Promise ((resolve, reject) => {
          const sql = `SELECT * FROM Users`;
          const query = mysql.format(sql);
          db.query(query, async (err, result) => {
              if (err) {
                  return reject('could not find any users',err);
              } else {  
                  return resolve(result);
              }})})
              return res.status(200).json(users);
  })


app.listen(PORT, (err) => {
    console.log(DB_PORT);
    if (err){
        console.log(`Error listening on port: ${PORT}`, err);
    }
    else {
        console.log(`Succesfully listening on port: ${PORT}!`);
    }
})