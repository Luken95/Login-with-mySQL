import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { client } from '../utils/myaxios'
import { useState } from 'react'

const loggedIn: NextPage = () => {

  const router = useRouter();
  const [User, setUser] = useState<object>({})
  const logoutBtn = () => {
    client.get("http://localhost:4000/logout", {
    })
    .then((response) => {
      console.log(response);
      if (response.status == 200){
        router.push('/')
        console.log('You have been logged out');
      }
    })
    .catch((error) => {
      console.log(error);
    })
  }

  function goToBlog(){
    router.push('/blog')
  }

  function goToAdmin(){
    router.push('/admin')
  }

  useEffect(() => {
    async function isLoggedIn() {
        const response = await fetch('http://localhost:4000/loggedin', {
            credentials: 'include'
        });
        const data = await response.json();
        if (data.loggedIn == false) {
            router.push('/')
        }
        setUser(data.data);
    }
    isLoggedIn();
})



  return (
    <div className={styles.container}>
     <Head>
        <title>My Blog</title>
      </Head>
      <main className={styles.main}>
        <h1 className={styles.title}>
         Profile page
        </h1>
        <div className={styles.grid}>
          <a className={styles.card}>
            <h2>Profile</h2>
            <p>Welcome {User?.username}</p>  
          </a> 
        </div>
        <button onClick={goToBlog}>Go to Blog</button>
        <button onClick={goToAdmin}>Got to Admin Page</button>
        <button onClick={logoutBtn}>Logout</button>
      </main>
    </div>
  )
}

export default loggedIn