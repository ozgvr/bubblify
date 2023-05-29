function loginWithSpotify(){
    const clientId = "49ee729d51df476b89ccb3ae9730f443";
    const redirectUri = "https://bubblify.github.io/auth.html";
    const scopes = ['user-top-read'];
    const authorizeUrl = 'https://accounts.spotify.com/authorize' +
        '?response_type=token' +
        '&client_id=' + encodeURIComponent(clientId) +
        '&scope=' + encodeURIComponent(scopes.join(' ')) +
        '&redirect_uri=' + encodeURIComponent(redirectUri);
    window.location = authorizeUrl;
}

function handleCallback() {
    const url = window.location.href;
    const params = new URLSearchParams(url.split('#')[1]);
    const token = params.get('access_token');
    console.log(url,params,token)
    if(token){
        sessionStorage.removeItem('access_token')
        sessionStorage.setItem('access_token',token)
        window.location.href = "main.html";
    }else{
        window.location.href = "index.html";
    }
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
    window.location.href = "index.html";
}
  
