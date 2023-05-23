async function getTopArtists(access_token) {
    const limit = 50;
    const offset = 0;
    const time_range = "medium_term";
    
    fetch('https://api.spotify.com/v1/me/top/artists?limit='+limit+'&offset='+offset+'&time_range='+time_range, {
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

async function getTopTracks(access_token) {
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
    const container = d3.select('#artists_chart'); // Select the Bootstrap row element
    const width = container.node().getBoundingClientRect().width; // Get the width of the container
  
    const height = Math.min(800, window.innerHeight - container.node().getBoundingClientRect().top - 100); // Set the height based on available space
  
    const svg = container.append('svg').attr('width', '100%').attr('height', height);
  
    const bubble = d3
      .pack(data)
      .size([width-20, height]) // Use the container's width and dynamic height
      .padding(2);
  
    const nodes = d3.hierarchy({ children: data }).sum((d) => d.value);
  
    const node = svg
      .selectAll('.node')
      .data(bubble(nodes).descendants())
      .enter()
      .filter((d) => !d.children)
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d) => 'translate(' + d.x + ',' + d.y + ')');
  
    const colors = ["#363b74","#673888","#ef4f91","#c79dd7","#4d1b7b"];
    let colorIndex = 0;
  
    node
      .append('circle')
      .attr('r', 0) // Start with radius 0 for transition effect
      .style('fill', () => getNextColor())
      .transition() // Apply the transition animation
      .duration(600) // Set the duration of the transition
      .delay(() => Math.random() * 400)
      .attr('r', (d) => d.r); // Transition to the actual bubble radius
  
    node
      .append('text')
      .attr('dy', '.3em')
      .style('text-anchor', 'middle')
      .style('fill', 'white')
      .style('opacity', '0')
      .style('font-size', (d) => getBubbleTextSize(d.r))
      .style('pointer-events', 'none') // Disable pointer events for the text elements
      .text((d) => d.data.name)
      .transition() // Apply the transition animation
      .duration(500) // Set the duration of the transition
      .delay(1000)
      .style('opacity', '1');
  
    function getNextColor() {
      const color = colors[colorIndex];
      colorIndex = (colorIndex + 1) % colors.length; // Increment color index and wrap around
      return color;
    }
  
    function getBubbleTextSize(radius) {
      const padding = 2;
      const maxFontSize = (0.5 * (radius - padding)) / Math.sqrt(2);
  
      return maxFontSize + 'px';
    }
  }