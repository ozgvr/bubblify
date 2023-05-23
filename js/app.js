async function getUserTop(access_token, type) {
    const content_type = ["artists","tracks"].includes(type,0) ? type : null
    const limit = 50;
    const offset = 0;
    const time_range = "medium_term";

    if(!content_type){
      return null
    }
    
    fetch('https://api.spotify.com/v1/me/top/'+content_type+'?limit='+limit+'&offset='+offset+'&time_range='+time_range, {
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
    const container = d3.select('#artists_chart');
    const width = container.node().getBoundingClientRect().width;
  
    const height = Math.min(800, window.innerHeight - container.node().getBoundingClientRect().top - 100);
  
    const svg = container.append('svg').attr('width', '100%').attr('height', height);
  
    const bubble = d3
      .pack(data)
      .size([width - 20, height])
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
  
    const colors = ["#363b74", "#673888", "#ef4f91", "#c79dd7", "#4d1b7b", "#005bb5"];
    let colorIndex = 0;
  
    node
      .append('circle')
      .attr('r', 0)
      .style('fill', () => getNextColor())
      .transition()
      .duration(800)
      .delay(() => Math.random() * 1000)
      .attr('r', (d) => d.r);
  
    const textContainer = node
      .append('g')
      .attr('transform', (d) => `translate(${-d.r},${-d.r})`);
  
      const foreignObject = textContainer
      .append('foreignObject')
      .style('overflow', 'visible')
      .attr('width', (d) => 2 * d.r)
      .attr('height', (d) => 2 * d.r)
      .style('pointer-events', 'none');
    
    const div = foreignObject
      .append('xhtml:div')
      .style('width', (d) => 2 * d.r + 'px')
      .attr('class', "h-100 text-white d-flex align-items-center justify-content-center");
    
    div
      .append('a')
      .style('opacity', '0')
      .style('font-size', (d) => getBubbleTextSize(d.r))
      .text((d) => d.data.name)
      .transition()
      .duration(400)
      .delay(1500)
      .style('opacity', '1');
    
    function getNextColor() {
      const color = colors[colorIndex];
      colorIndex = (colorIndex + 1) % colors.length;
      return color;
    }
  
    function getBubbleTextSize(radius) {
      const maxFontSize = (0.6 * (radius-3)) / Math.sqrt(2);  
      return maxFontSize + 'px';
    }
  }