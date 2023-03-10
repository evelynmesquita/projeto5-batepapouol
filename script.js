const loading = document.querySelector('.loading');
const principalUser = document.querySelector('.login input');
const newMsg = document.querySelector('.enviar > div input');
let sidebar = document.querySelector('.sidebar')
let overlay = document.querySelector('.overlay')
const public = document.querySelector('#publico');
const privaty = document.querySelector('#reservado');

const user = {
    from: "",
    to: "Todos",
    text: "",
    type: "message"
}

// INPUT TELA INICIAL - CAPTURA DO NOME DO USUARIO 
function userName() {
    user.from = document.querySelector('.login input').value;

    if(user.from.length > 0){

        activeUser = {
            name: user.from
        }

        showSecondLayout()
        const backTo = axios.post('https://mock-api.driven.com.br/api/v6/uol/participants', activeUser);
        backTo.then(newUser);
        backTo.catch(userExit);

    }else{
        alert('Por favor, digite seu nome:')
    }

    setInterval(statusVerify, 5000)
}

// PRESS ENTER TELA INICIAL

principalUser.addEventListener('keypress', function(e) {
    if(e.keyCode === 13) {
        userName();
    }
})

// BUSCANDO NOVOS USUARIOS DO SERVIDOR

function newUser() {

    searchMessage();
    searchUser()

    setTimeout(firtsLayoutHidden , 2000 )
    setInterval(searchUser, 20000)
    setInterval(searchMessage, 3000)
}

// SEGUNDA TELA - LOADING

function showSecondLayout(){
    const inputTela = document.querySelector('.input-primeira-tela')
    loading.classList.remove('hidden')
    inputTela.classList.add('hidden')
}

function firtsLayoutHidden(){
    const login = document.querySelector('.login')
    login.classList.remove('login')
    loading.classList.add('hidden')
}

// VERIFICAÇÃO DA EXISTENCIA DO NOME DO USUÁRIO

function userExit(erro) {
    alert('Erro ' + erro.request.status + " Usuario já exite")
    window.location.reload()
}

// RESPONSE.DATA STATUS USUÁRIO

function verify(response) {
    console.log('staus: ' + response.data);
}

function noUser(){
    window.location.reload()
}

function statusVerify() {
    const status = axios.post('https://mock-api.driven.com.br/api/v6/uol/status', activeUser);
    status.then(verify);
    status.catch(noUser)

}

// BUSCAR MENSAGENS DO SERVIDOR

function searchMessage() {
    const retorno = axios.get('https://mock-api.driven.com.br/api/v6/uol/messages');
    retorno.then(loadingMessage);
    retorno.catch(userExit);
}

function loadingMessage(serverMessage) {
    let receivedMessage = serverMessage.data
    configMessage(receivedMessage)

}

// CONFIGURAÇÃO DAS MENSAGENS DO CHAT

function configMessage(msg) {
    const msgs = document.querySelector('.todasMensagens');
    msgs.innerHTML = '';
    for (let i = 0; i < msg.length; i++) {

        if (msg[i].type == 'status') {
            msgs.innerHTML += `<div data-test="message" class="entrou-sala" >
            <span><span class="time">(${msg[i].time})</span>  <span class="user">${msg[i].from}</span> para <span class="destino">${msg[i].to}:</span>  ${msg[i].text}</span>
            </div>`

        } else if (msg[i].type == "message") {
            msgs.innerHTML += `<div data-test="message" class="envio-msg" >
            <span><span class="time">(${msg[i].time})</span>  <span class="user">${msg[i].from}</span> para <span class="destino">${msg[i].to}:</span>  ${msg[i].text}</span>
            </div>`
            
        } else if (msg[i].type === 'private_message' && (msg[i].to === user.from || msg[i].from === user.from)) {
            msgs.innerHTML += `<div data-test="message" class="direct" >
            <span><span class="time">(${msg[i].time})</span>  <span class="user">${msg[i].from}</span> para <span class="destino">${msg[i].to}:</span>  ${msg[i].text}</span>
            </div>`
        }
    }

    msgs.innerHTML += `<span id="final"><span>`;

    const lastElement = document.querySelector('#final');
    lastElement.scrollIntoView();
}

// BUSCAR USUARIOS E ALOCAR NA SIDEBAR

function searchUser() {
    const retornoUser = axios.get('https://mock-api.driven.com.br/api/v6/uol/participants');
    retornoUser.then(loadingUser)
    retornoUser.catch(userExit)
}

// USUÁRIOS ATIVOS E CONFIGURAÇÃO DE FORMATO

function loadingUser(activeUsers) {

    const active = activeUsers.data;
    const sidebarActive = document.querySelector('.usuariosAtivos');

    sidebarActive.innerHTML = '';
    sidebarActive.innerHTML = 
        `<span data-test="all" onclick="recipient(this)">
            <ion-icon name="people"></ion-icon>
            <p>Todos</p>
            <ion-icon data-test="check" id="name" name="checkmark" class="escolha escolhafinal" data-name="Todos"></ion-icon>
        </span>`
        

    for (let i = 0; i < active.length; i++) {
        sidebarActive.innerHTML += 
        `<span data-test="participant" onclick="recipient(this)">
            <ion-icon name="person-circle-outline"></ion-icon>
            <p data-identifier="participant">${active[i].name}</p>
            <ion-icon data-test="check" id="name" name="checkmark" class="escolha" data-name="${active[i].name}"></ion-icon>
        </span>`
    }

    visibility()
}

// PRESS ENTER ENVIAR MENSAGENS

newMsg.addEventListener('keypress', function(e) {
    if(e.keyCode === 13) {
        sendNewMessage();
    }
})


function sendNewMessage() {
    user.text = newMsg.value
    console.log(user)

    if(user.to === "Todos" && user.type === "private_message") {
        return alert("Você não pode mandar uma mensagem privada para todos")
    }

    const sendPromisse = axios.post('https://mock-api.driven.com.br/api/v6/uol/messages', user);
    sendPromisse.then(searchMessage)

    newMsg.value = '';
}


// FUNÇÃO ABRIR  E FECHAR SIDEBAR

function showSidebar() {
    sidebar.classList.remove('hidden')
    overlay.classList.remove('hidden')
}

function closeSidebar() {
    sidebar.classList.add('hidden')
    overlay.classList.add('hidden')
}

/*ESCOLHER USUARIO MANDAR MENSAGEM*/

function recipient(destiny) {

    const usuarios = document.querySelectorAll('.usuariosAtivos .escolhafinal')
    usuarios.forEach((usuario) => {
        usuario.classList.remove('escolhafinal')
    })

    const destined = destiny.querySelector('.usuariosAtivos :last-child:last-Child')
    const classes = destined.classList
    classes.add('escolhafinal')

    visibility()

}


function visibility() {
    const finalRecipient = document.querySelector('.usuariosAtivos .escolhafinal')

    const sendSubtext = document.querySelector('.enviar  div  span')

    let tipoDaMensagem

    if(user.type === 'message') {
        tipoDaMensagem = "Público"
    } else {
        tipoDaMensagem = "Reservadamente"
    }

    if (finalRecipient.dataset.name !== 'Todos') {
        user.to = finalRecipient.dataset.name;
        
        sendSubtext.innerHTML = `Enviando para <span>${user.to}</span> (<span>${tipoDaMensagem}</span>)`

    } else {
        public.classList.add('escolhafinal');  
        privaty.classList.remove('escolhafinal');
        user.to = 'Todos'
        sendSubtext.innerHTML = `Enviando para <span>Todos</span> (<span>${tipoDaMensagem}</span>)`
    }

    console.log(user)


}

function choosePrivacyPublic(item) {
    const sendSubtext = document.querySelector('.enviar  div  span')

   

    console.log(item.innerHTML)
    if(item.innerHTML === "Reservadamente") {
        public.classList.remove('escolhafinal');
        privaty.classList.add('escolhafinal');
        user.type = "private_message"
       
    } else {
        public.classList.add('escolhafinal');
        privaty.classList.remove('escolhafinal');
        user.type = "message"
        
    }

    let tipoDaMensagem;

    if(user.type === 'message') {
        tipoDaMensagem = "Público"
    } else {
        tipoDaMensagem = "Reservadamente"
    }


    if(tipoDaMensagem === "Reservadamente") {
        sendSubtext.innerHTML = `Enviando para <span>${user.to}</span> (<span>${tipoDaMensagem}</span>)`
    } else {
        sendSubtext.innerHTML = `Enviando para <span>${user.to}</span> (<span>${tipoDaMensagem}</span>)`

    }

    
    console.log(user)
    
}