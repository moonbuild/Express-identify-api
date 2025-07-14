fetch('http://localhost:3000/identify', {
    method:'POST',
    headers:{
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        phoneNumber: null,
        email:'m4@gmail.com'
    })
})
.then(res=>res.json())
.then(data=>console.log(data))
.catch(err=>console.error("There was an error: ", err))