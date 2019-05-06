let lastPeerId = null;
let peer = null;
let peerId = null;
let conn = null;
const myId = document.getElementById('my-id');
const peerIdTxt = document.getElementById('peer-id-txt');
const status = document.getElementById('status');
const message = document.getElementById('message');
const sendMsgBox = document.getElementById('send-msg-box');
const sendBtn = document.getElementById('send-btn');
const clearMsgBtn = document.getElementById('clear-msg-btn');
const connectBtn = document.getElementById('connect-btn');
const copyBtn = document.getElementById('copy-btn');

const initialize = () => {
  peer = new Peer(null, {
    debug: 2
  });

  peer.on('open', (id) => {
    if (peer.id === null) {
      console.log('Received null id from peer open');
      peer.id = lastPeerId;
    } else {
      lastPeerId = peer.id;
    }
    console.log('my ID: ' + peer.id);
    myId.innerHTML = peer.id;
    status.innerHTML = 'Awaiting connection...';
  });

  peer.on('connection', (c) => {
    if (conn) {
      c.on('open', () => {
        c.send('Already connected to another client');
        setTimeout(() => { c.close(); }, 500);
      });
      return;
    }
    conn = c;
    status.innerHTML = 'Connected to: ' + conn.peer;
    console.log('Connected to: ' + conn.peer);
    ready();
  });

  peer.on('disconnected', () => {
    status.innerHTML = 'Connection lost. Please reconnect';
    console.log('Connection lost. Please reconnect');
    peer.id = lastPeerId;
    peer._lastServerId = lastPeerId;
    peer.reconnect();
  });

  peer.on('close', () => {
    conn = null;
    status.innerHTML = 'Connection destroyed. Please refresh';
    console.log('Connection destroyed');
  });

  peer.on('error', (err) => {
    console.log(err);
    alert('' + err);
  });
};

const ready = () => {
  conn.on('data', (data) => {
    console.log('Data recieved');
    addMessage('<span class=\'peer-msg\'>Peer: </span>' + data);
  });

  conn.on('close', () => {
    status.innerHTML = 'Connection reset<br>Awaiting connection...';
    conn = null;
    start(true);
  });
}

const addMessage = (msg) => {
  // Add a new message at the beginning of the previous messages
  message.innerHTML = '<br><span class=\'msg-time\'>' + getCurrentTimeString() + '</span>  -  ' + msg + message.innerHTML;
};

const getCurrentTimeString = () => {
  const now = new Date();
  let hour = now.getHours();
  const minute = addZero(now.getMinutes());
  const second = addZero(now.getSeconds());

  return hour + ':' + minute + ':' + second
}

const addZero = (t) => {
  if (t < 10)
    t = '0' + t;
  return t;
};

/**
 * Copy 'string' to clipboard
 */
const execCopy = (string) => {
  const tmp = document.createElement("div");
  const pre = document.createElement('pre');

  pre.style.webkitUserSelect = 'auto';
  pre.style.userSelect = 'auto';
  tmp.appendChild(pre).textContent = string;

  const s = tmp.style;
  s.position = 'fixed';
  s.right = '200%';

  document.body.appendChild(tmp);
  document.getSelection().selectAllChildren(tmp);

  const result = document.execCommand("copy");
  document.body.removeChild(tmp);

  return result;
}

/*---------------------------------------------*/
/*--------------- addEventListener ------------*/
/*---------------------------------------------*/
copyBtn.addEventListener('click', () => {
  if (execCopy(myId.innerHTML)) {
    console.log('Copy completed: ' + myId.innerHTML);
  } else {
    alert('Not compatible with this browser');
  }
});

connectBtn.addEventListener('click', () => {
  if (conn) {
    conn.close();
  }
  conn = peer.connect(peerIdTxt.value, {
    reliable: true
  });

  conn.on('open', () => {
    status.innerHTML = 'Connected to: ' + conn.peer;
    console.log('Connected to: ' + conn.peer);
  });

  conn.on('data', (data) => {
    addMessage('<span class=\'peerMsg\'>Peer: </span> ' + data);
  });

  conn.on('close', () => {
    status.innerHTML = 'Connection closed';
  });
});

/**
 * Listen for enter in message box
 */
sendMsgBox.onkeypress = (e) => {
  const event = e || window.event;
  const char = event.which || event.keyCode;
  if (char == '13')
    sendBtn.click();
};

sendBtn.addEventListener('click', () => {
  if (conn.open) {
    const msg = sendMsgBox.value;
    sendMsgBox.value = '';
    conn.send(msg);
    console.log('Sent: ' + msg);
    addMessage('<span class=\'selfMsg\'>Self: </span> ' + msg);
  }
});

clearMsgBtn.addEventListener('click', () => {
  message.innerHTML = '';
  addMessage('Msgs cleared');
});

/*---------------------------------------------*/
/*-------------------- main -------------------*/
/*---------------------------------------------*/
initialize();
