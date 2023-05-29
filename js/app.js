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

    if (type === "tracks") {
      const ids = [...new Set(data.items.map(item => item.artists[0].id))].join(',');

      const imagesresponse = await fetch(
        `https://api.spotify.com/v1/artists?ids=${ids}`,
        {
          method: "GET",
          headers: {
            Authorization: "Bearer " + access_token,
          },
        }
      );

      const imagesData = await imagesresponse.json();
      const imageUrls = imagesData.artists.reduce((acc, item) => {
        acc[item.id] = item.images[1].url;
        return acc;
      }, {});

      data.items.forEach(item => {
        const artistId = item.artists[0].id;
        if (imageUrls.hasOwnProperty(artistId)) {
          item.artists[0].img = imageUrls[artistId];
        }
      });
    }
    return data;
  } catch (error) {
    alert("Error:", error);
    return null;
  }
}


function parseArtistsAlbums(data) {
  const artists = {};
  const albums = {};
  const ids = [];

  for (const item of data.items) {
    const artist = item.artists[0].name;
    const id = item.artists[0].id;
    const img = item.artists[0].img;
    const album = item.album.name;
    const album_img = item.album.images[1].url;

    if (artists[artist]) {
      artists[artist].value++;
    } else {
      artists[artist] = { name: artist, value: 1, id: id, img: img};
      ids.push(id);
    }

    if (albums.hasOwnProperty(album)) {
      albums[album].value++;
    } else {
      albums[album] = { name: album, value: 1, img: album_img };
    }
  }

  return {artists: Object.values(artists), albums: Object.values(albums)};
}

function parseGenres(data) {
  const genreCounts = {};

  for (const artist of data.items) {
    for (const genre of artist.genres) {
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    }
  }

  const result = Object.entries(genreCounts)
    .filter(([genre, count]) => count > 1)
    .map(([genre, count]) => ({ name: genre, value: count }));

  return result;
}

  

  async function renderArtistsAlbums() {
    const token = sessionStorage.getItem('access_token');
    const data = await getUserTop(token, 'tracks');
    const { artists, albums } = parseArtistsAlbums(data);

    renderBubbleChart(artists, '#artists_chart');
    renderBubbleChart(albums, '#albums_chart');
  }

  async function renderGenres() {
    const token = sessionStorage.getItem('access_token');
    const data = await getUserTop(token, 'artists');
    const parsedData = parseGenres(data);
    renderBubbleChart(parsedData, '#genres_chart');
  }

  function renderBubbleChart(data, container_id) {
    const container = d3.select(container_id);
    const width = container.node().getBoundingClientRect().width;
  
    const height = Math.min(800, window.innerHeight-180);
  
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
      .style('fill', (d) => d.data.img ? getNextColor(false) : getNextColor())
      .attr('r', (d) => d.r);
  
    const textContainer = node
      .append('g')
      .attr('transform', (d) => `translate(${-d.r},${-d.r})`);
  
    const foreignObject = textContainer
    .append('foreignObject')
    .attr('width', (d) => 2 * d.r)
    .attr('height', (d) => 2 * d.r)
    .style('pointer-events', 'none')
    .attr('class', (d) => d.data.img ? "image-bubble" : '')
    .style('background-color', (d) => d.data.img ? getNextColor() : "transparent")
    .style('background-image', (d) => d.data.img ? `url(${d.data.img})` : 'none')
    .style('background-blend-mode', 'multiply');
    
    const div = foreignObject
      .append('xhtml:div')
      .style('width', (d) => 2 * d.r + 'px')
      .attr('class', "h-100 text-white d-flex align-items-center justify-content-center");
    
    div
      .append('a')
      .style('opacity', '1')
      .style('font-size', (d) => getBubbleTextSize(d.r))
      .style('line-height', "1.1em")
      .text((d) => d.data.name.length > 20 ? d.data.name.slice(0,20) + "..." : d.data.name);

      function getNextColor(increaseIndex = true) {
        const color = colors[colorIndex];
        if (increaseIndex) {
          colorIndex = (colorIndex + 1) % colors.length;
        }
        return color;
      }
  
    function getBubbleTextSize(radius) {
      const maxFontSize = (0.6 * (radius-4)) / Math.sqrt(2);  
      return maxFontSize + 'px';
    }
  }