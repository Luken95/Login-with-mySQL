import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { useRouter } from 'next/router'
import { useState } from 'react'
import {client} from '../utils/myaxios'

const Home: NextPage = () => {
  const router = useRouter();
  const [usernameReg, setUsernameReg] = useState("");
  const [passwordReg, setPasswordReg] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

 /*  PW must contain at least one number, one lowercase and one uppercase letter*/
  function checkPassword(passwordReg: string) {
    var re = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/;
    return re.test(passwordReg);
  }

  const registerBtn = () => {
    if (usernameReg == "") {
      console.log("Please fill in username");
      return;
    }
    if (passwordReg == "") {
      console.log("Please fill in password");
      return;
    }
    if (usernameReg )
   if (passwordReg.length > 18 || passwordReg.length < 8) {  
      console.log('Password must be between 8 and 18 characters');  
      setPasswordReg("");
      return; 
    }
   if (!checkPassword(passwordReg)) {
      console.log('Password must contain at least one number, one lowercase and one uppercase letter');
      setPasswordReg("");
      return;
    }

    const response = client.post("http://localhost:4000/register", {
      username: usernameReg,
      password: passwordReg,
    }).then((response) => { 
      if (response.status === 429) {
        alert(
          "You have reached the maximum number of requests per minute. Please try again later."
        );
        return;
      }
      if (response.status == 400){
        console.log('Something went wrong');
        return;
      }
      else {
        console.log('Registration successful');
        setUsernameReg("");
        setPasswordReg("");
        return;
      }
    })
    .catch((error) => {
       if ( error.response.status == 500){
        console.log('Username already exists');
      }
      console.log(error);
    });
    };

  const loginBtn = () => {
    if (username == "") {
      console.log("Please fill in username");
      return;
    }
    if (password == "") {
      console.log("Please fill in password");
      return;
    }
    client.post("http://localhost:4000/login", {
      username: username,
      password: password,
    }).then((response) => { 
      console.log(response);
      
      if (response.status == 400){
        console.log('Something went wrong');
        return;
      }
      else {
        console.log('Login susccessful');
         router.push('/loggedin');
      }
    })
    .catch((error) => {
       if ( error.response.status == 403){
        console.log('Cannot find user');
      }
      else  if (error.response.status== 404){
        console.log(error.response.data.message);
        return;
      } 
      console.log(error);
    });
    };

  return (
    <div className={styles.container}>
      <Head>
        <title>Login</title>
      </Head>

      <main className={styles.main}>
        <h1> Login </h1>
        <div className={styles.grid}>
          <a className={styles.card}>
            <h2>Register</h2>
            <label>Username</label><br></br>
            <input onChange={(e)=>{ setUsernameReg(e.target.value)}} type="text" value={usernameReg} required/> <br></br>
            <label>Password</label><br></br>
            <input onChange={(e)=>{ setPasswordReg(e.target.value)}} type="password" value={passwordReg} required/>
            <br></br>
            <br></br>
            <button onClick={registerBtn}>Register</button>
          </a>
        </div>

        <div className={styles.grid}>
          <a className={styles.card}>
            <h2>Login</h2>
            <input onChange={(e)=>{ setUsername(e.target.value)}} type="email" name="username" placeholder='Username' required></input><br></br><br></br>
            <input onChange={(e)=>{ setPassword(e.target.value)}} type="password" placeholder='Password' required></input>
            <br></br>
            <br></br>
            <button className={styles.button}
        onClick={ loginBtn } >Login </button>
        </a>
        </div>
        </main>
     
      

      <footer className={styles.footer}>
      </footer>
    </div>
  )
}

export default Home
