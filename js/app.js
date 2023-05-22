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
        console.log(parseArtists(data))
    })
    .catch(error => {
    });
}

function parseArtists(data) {
    var artists = {};
    var results = [];
  
    data.items.forEach(item => {
      var artist = item.artists[0].name;
      if (artists.hasOwnProperty(artist)) {
        artists[artist]++;
      } else {
        artists[artist] = 1;
      }
    });
  
    for (let artist in artists) {
      results.push({ name: artist, value: artists[artist] });
    }
  
    return results;
  }