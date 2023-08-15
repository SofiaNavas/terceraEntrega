const socket = io();


const messagesContainer = document.getElementById('messagesContainer')
const messageInput = document.getElementById('messageInput')
const messageButton = document.getElementById('messageButton')
const notificationContainer = document.getElementById('notificationContainer')

console.log({messagesContainer, messageInput, messageButton, notificationContainer});


const params = Qs.parse(window.location.search, {ignoreQueryPrefix: true})

console.log(params);

socket.emit('joinChat', params.username)

socket.on('newUser', user => {
    console.log(`${user} se ha unido al chat`)
    notificationContainer.innerHTML = `${user} se ha unido al chat`
});

socket.on('chatHistory', chatHistory => {
    chatHistory.forEach(messageObj => {
      messagesContainer.innerHTML += `
        <div> ${messageObj.username}: ${messageObj.message}</div>
      `;
    });
  });

messageButton.addEventListener('click', (e) => {
    const message = messageInput.value
    console.log({message})
    
    if (message) {
        socket.emit('newMessage', { message, username: params.username });
    }
})


socket.on('message', messageObj => {
    // const message = JSON.parse(messageString)
    messagesContainer.innerHTML += `
    <div> ${messageObj.username}: ${messageObj.message}</div>
    
    `
    console.log({messageObj})

})