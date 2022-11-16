import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { client } from '../utils/myaxios'

const admin: NextPage = () => {
    const router = useRouter();
    const [allUsers, setAllUsers] = useState<Array<object>>([])

    const logoutBtn = () => {
        client.get("http://localhost:4000/logout", {
        })
        .then((response) => {
          if (response.status == 200){
            router.push('/')
            console.log('You have been logged out');
          }
        })
        .catch((error) => {
          console.log(error);
        })
      }

      async function getAllUsers() {
        const response = await client.get('http://localhost:4000/getallusers', {
        })
          .then((response) => {
            if (response.status == 200){
              setAllUsers(response.data)
            }
          })
          .catch((error) => {
            console.log(error);
          })
        }

    useEffect(() => {
      getAllUsers();
    }, [])

    useEffect(() => {
        async function isLoggedIn() {
            const response = await fetch('http://localhost:4000/admin', {
                credentials: 'include'
            });
            const data = await response.json();
            if (data.loggedIn == false) {
                router.push('/')
            }
        }
        isLoggedIn();
    }, [])

  
    async function deleteUser(userId) {
      const response = await fetch('http://localhost:4000/deleteuser', {
          method: 'POST',
          credentials: 'include',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({userId})
      })
      const data = await response.json();
      console.log(data) 
      if (data.message == 'DELETED USER'){
          getAllUsers();
      }
  }

  return (
    <div className={styles.container}>
     <Head>
        <title>My Blog</title>
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
         Admin page
        </h1>

        <div className={styles.grid}>
          <a className={styles.card}>
            <h2>All users</h2>
            <p>Here You can Delete users from database if you are admin or superadmin</p>       
            <ul>
                {allUsers?.map((User) => {
                    return <li key={User.userId}>
                        <p>{User.username}</p>
                        {/* <p>{User.role}</p> */}
                        <button onClick={() => {
                            deleteUser(User.userId)
                        }}>Delete User</button>
                    </li>
                })}
            </ul> 

          </a> 
        </div>
        <button onClick={logoutBtn}>Logout</button>
      </main>
    </div>
  )
}
export default admin
