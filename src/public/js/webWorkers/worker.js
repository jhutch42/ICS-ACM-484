let id = -1;
const url = 'http://127.0.0.1:4040/';
// Example POST method implementation:

async function postData(url, data) {
    data.clientId = id;
    //console.log(JSON.stringify(data));
    // Default options are marked with *
    const response = await fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return response.json(); // parses JSON response into native JavaScript objects
}

this.onmessage = e => {
    switch (e.data.type) {
        case 'Set Id':
            setId(e.data.id);
            postMessage('ID Set Successfully');
            break;
        case 'Get Data':
            postData(url, {request:'Get All Game Data'}).then(data => {handleReturn('Return With Data', data)});
            break;
    }
}

const handleReturn = (messaage, data) => {
    postMessage({message: message, data: data, id: id});
}

function setId(newId) {
    id = newId;
}