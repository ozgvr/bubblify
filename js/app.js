async function getUserTop(access_token, type) {
  const content_type = ["artists", "tracks"].includes(type) ? type : null;
  const limit = 50;
  const offset = 0;
  const time_range = "medium_term";

  if (!content_type) {
    return null;
  }

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/me/top/${content_type}?limit=${limit}&offset=${offset}&time_range=${time_range}`,
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + access_token,
        },
      }
    );

    if (!response.ok) {
      logout();
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.log("Error:", error);
    return null;
  }
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

  function parseGenres(data) {
    const artists = data.items;
    const genreCounts = {};
  
    for (const artist of artists) {
      const genres = artist.genres;
      for (const genre of genres) {
        if (genreCounts.hasOwnProperty(genre)) {
          genreCounts[genre]++;
        } else {
          genreCounts[genre] = 1;
        }
      }
    }
  
    const result = [];
    for (const genre in genreCounts) {
      if (genreCounts[genre] > 1) {
        result.push({ name: genre, value: genreCounts[genre] });
      }
    }
  
    return result;
  }

  function renderBubbleChart(data, container_id) {
    const container = d3.select(container_id);
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

  async function renderArtists() {
    const token = sessionStorage.getItem('access_token');
    const data = await getUserTop(token, 'tracks');
    const parsedData = parseArtists(data);
    renderBubbleChart(parsedData, '#artists_chart');
  }

  async function renderGenres() {
    const token = sessionStorage.getItem('access_token');
    const data = await getUserTop(token, 'artists');
    const parsedData = parseGenres(data);
    renderBubbleChart(parsedData, '#genres_chart');
  }