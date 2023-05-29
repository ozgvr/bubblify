function loginWithSpotify(){
    const clientId = "49ee729d51df476b89ccb3ae9730f443";
    const redirectUri = "https://bubblify.github.io/auth.html";
    const scopes = ['user-top-read'];
    const authorizeUrl = 'https://accounts.spotify.com/authorize' +
        '?response_type=code' +
        '&client_id=' + encodeURIComponent(clientId) +
        '&scope=' + encodeURIComponent(scopes.join(' ')) +
        '&redirect_uri=' + encodeURIComponent(redirectUri);
    window.location = authorizeUrl;
}

function handleCallback() {
    const url = window.location.href;
    const params = new URLSearchParams(url.split('?')[1]);
    const code = params.get('code');
    if(code){
        getAccessToken(code)
    }else{
        window.location.href = "index.html";
    }
}

function getAccessToken(code){
    const url = 'https://accounts.spotify.com/api/token';
    const data = new URLSearchParams();
    data.append('code', code);
    data.append('redirect_uri', 'https://bubblify.github.io/auth.html');
    data.append('grant_type', 'authorization_code');

    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + 'NDllZTcyOWQ1MWRmNDc2Yjg5Y2NiM2FlOTczMGY0NDM6MWM1NWM5ZWM5Njk4NGRiMTk4MTViOTljODM2YjI0YjE='
    };

    fetch(url, {
        method: 'POST',
        body: data.toString(),
        headers: headers
    })
    .then(response => response.json())
    .then(data => {
        sessionStorage.removeItem('access_token')
        sessionStorage.removeItem('refresh_token')
        sessionStorage.setItem('access_token',data.access_token)
        sessionStorage.setItem('refresh_token',data.refresh_token)
        window.location.href = "main.html";
    })
    .catch(error => {
        alert(error)
        window.location.href = "index.html";
    });
}

async function refreshToken(refresh_token){
    const url = 'https://accounts.spotify.com/api/token';
    const data = new URLSearchParams();
    data.append('grant_type', 'refresh_token');
    data.append('refresh_token', refresh_token);

    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + 'NDllZTcyOWQ1MWRmNDc2Yjg5Y2NiM2FlOTczMGY0NDM6MWM1NWM5ZWM5Njk4NGRiMTk4MTViOTljODM2YjI0YjE='
    };
    fetch(url, {
        method: 'POST',
        body: data.toString(),
        headers: headers
    })
    .then(response => response.json())
    .then(data => {
        sessionStorage.setItem('accessToken',data.access_token)
        window.location.href = "main.html";
    })
    .catch(error => {
        alert(error)
        window.location.href = "index.html";
    });
}

async function checkAuthorized() {
    const access_token = sessionStorage.getItem('access_token')
    if(!access_token){
        return false
    }
    fetch('https://api.spotify.com/v1/markets', {
        headers: {
            'Authorization': 'Bearer ' + access_token
        }
    })
    .then(response => {
        return (response.ok ? true : false)
    })
    .catch(error => {
        return false
    });
}

function logout(){
    sessionStorage.removeItem("access_token")
    sessionStorage.removeItem("refresh_token")
    window.location.href = "index.html";
}
  
