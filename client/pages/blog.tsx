import type { NextPage } from 'next'
import styles from '../styles/Home.module.css'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useState } from 'react'

const blog: NextPage = () => {
    const router = useRouter();
    const [blog, setBlog] = useState([
        '',
/*         'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque et lectus quis libero euismod sollicitudin rutrum non ex. Vestibulum vitae tortor ut ipsum gravida euismod. Vestibulum euismod massa quis iaculis sollicitudin. Integer interdum justo ut tempor semper. Curabitur ac est ante. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque sed pulvinar justo, ac malesuada nisl. Cras eleifend ipsum tellus, eget feugiat nibh vestibulum in. Duis at iaculis lorem. Duis accumsan varius rhoncus. Vivamus porta congue justo id molestie'
 */    ]);
    const [blogTitle, setTitle] = useState("");
    const [blogContent, setContent] = useState("");

    const addBlog = () => {
        /* setBlog([...blog, blogTitle, blogContent]); */
        setTitle("");
        setContent("");
    }

    function goToProfile(){
        router.push('/loggedin')
      }

      useEffect(() => {
        async function isLoggedIn() {
            const response = await fetch('http://localhost:4000/blog', {
                credentials: 'include'
            });
            const data = await response.json();
            if (data.loggedIn == false) {
                router.push('/')
            }
        }
        isLoggedIn();
    })

    return (
        <div  className={styles.blog}>
            <h1>Blog</h1>
            <button onClick={goToProfile}>Go to Profile</button>
            
            <form className={styles.blogForm} onSubmit={addBlog}>
            <input type='text' className={styles.blogTitle} value={blogTitle} onChange={(e) => setTitle (e.target.value)}></input>
            <textarea className={styles.blogText} value={blogContent} onChange={(e) => setContent(e.target.value)}></textarea>
            <button type='submit'className={styles.blogBtn} /* onClick={addBlog} */>Add Blog Post</button>
            </form>
            <ul className='output'>
                {blog.map((blog) => {
                    return <div><li key={blog}>{blog}</li>
                    <li key="{blog}">{blogTitle}</li>
                    <li key="{blog}">{blogContent}</li>
                    </div>
                }
                
                )}
            </ul>
 
        </div>
    )
}

export default blog
