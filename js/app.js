async function getTopArtists(access_token) {
    const limit = 50;
    const offset = 0;
    const time_range = "medium_term";
    
    fetch('https://api.spotify.com/v1/me/top/tracks?limit='+limit+'&offset='+offset+'&time_range='+time_range, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + access_token
        }
    })
    .then(response => {
        if (!response.ok) {
            logout();
        }
        return response.json();
    })
    .then(data=>{
        console.log(data.items)
    })
    .catch(error => {
        logout();
    });
}