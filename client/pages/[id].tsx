import React, { useEffect } from 'react'
import Head from 'next/head';

export default function Comingsoon() {

var countDownDate = new Date("Dec 28, 2022 15:37:25").getTime();
useEffect(()=>{
  var countdownfunction = setInterval(function() {

    var now = new Date().getTime();
    var distance = countDownDate - now;
    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);
 
    const yes =   document.getElementsByClassName("demo")[0].innerHTML = days + "d " + minutes + "m " + seconds + "s ";

    if (distance < 0) {
      clearInterval(countdownfunction);
      document.getElementsByClassName("demo")[0].innerHTML = "EXPIRED";
    } 
    }, 1000);
    return () => clearInterval(countdownfunction);
    })


    return (
      <div>
        <Head>
        <title>My Blog</title>
      </Head>
        <footer>
        <div key="1" style={{height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", textAlign: "center", }}>
        <img style={{ height: "35%", cursor:'pointer'}} />
          <h1>404 page not found</h1>
          <h2>WW3 starting in</h2>
          <p className='demo' style={{fontSize: "30px"}}></p>
        </div>
        </footer>
      </div>
    )
}