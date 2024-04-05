
const box =  document.getElementById('box')

const socket = io()
const form = document.getElementById('form');
const button = document.getElementById('submit')


//fetching an call for the display of the user name 
async function getData(){
    console.log('Get Data from the user for the active user ')
    let a = await fetch('/getUserDetail',{
        method:'GET',
    }).then(response=>{
        return response.json()
    }).then(data=>{
        box.innerHTML+='<br> Active User : '+data.name+`<br>`
    })
}

getData()


box.innerHTML += 'Hi how are you i am a box and is connected here'

//fetching an call for the display of the user name 
async function getActiveUserCount(){
    console.log('Get Data from the user for the active user ')
    let a = await fetch('/getActiveUser',{
        method:'GET',
    }).then(response=>{
        return response.json()
    }).then(data=>{
        box.innerHTML+='<br>Current No of Active User Count : '+data+`<br>`
    })
}

getActiveUserCount()


button.addEventListener('click',(e)=>{
    e.preventDefault()
    box.innerHTML+='<br>Hi you clicked the submit button<br>'
    socket.emit('message_client',form.value)
    console.log('*********')
    socket.on('message_server',(msg)=>{

        console.log( msg,'****&&&&&&&((((((((((^^^^^^^')
        box.innerHTML += msg
        box.innerHTML += `<br>`
    })  
})


