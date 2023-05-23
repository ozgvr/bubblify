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
        const parsedArtists = parseArtists(data);
        console.log(parsedArtists)
        renderBubbleChart(parsedArtists);

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

  function renderBubbleChart(data) {
    const svg = d3.select('#artists_chart').append('svg').attr('width', 800).attr('height', 600);
  
    const bubble = d3
      .pack(data)
      .size([800, 600])
      .padding(1.5);
  
    const nodes = d3.hierarchy({ children: data }).sum((d) => d.value);
  
    const node = svg
      .selectAll('.node')
      .data(bubble(nodes).descendants())
      .enter()
      .filter((d) => !d.children)
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d) => 'translate(' + d.x + ',' + d.y + ')');
  
    node
      .append('circle')
      .attr('r', (d) => d.r)
      .style('fill', () => getRandomColor());
  
    node
      .append('text')
      .attr('dy', '.3em')
      .style('text-anchor', 'middle')
      .style('fill', 'white')
      .style('font-size', (d) => getBubbleTextSize(d.r))
      .text((d) => d.data.name);
      
  }

  function getRandomColor() {
    const colors = ["#363b74","#673888","#ef4f91","#c79dd7","#4d1b7b"];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  function getBubbleTextSize(radius) {
    // Adjust this padding value to control the amount of padding within the bubble
    const padding = 1;
  
    // Calculate the maximum font size that fits within the bubble with padding
    const maxFontSize = (0.5 * (radius - padding)) / Math.sqrt(2);
  
    return maxFontSize + 'px';
  }