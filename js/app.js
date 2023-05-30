async function getUserTop(access_token, type, time_range) {
  const content_type = ["artists", "tracks"].includes(type) ? type : null;
  const limit = 50;
  const offset = 0;
  const range = ["short_term","medium_term","long_term"][time_range];

  if (!content_type) {
    return null;
  }

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/me/top/${content_type}?limit=${limit}&offset=${offset}&time_range=${range}`,
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

  let result = Object.entries(genreCounts)
    .filter(([genre, count]) => count > 1)
    .map(([genre, count]) => ({ name: genre, value: count }));

  if (result.length < 15) {
    let remainingEntries = Object.entries(genreCounts)
      .filter(([genre, count]) => count <= 1)
      .slice(0, 15 - result.length)
      .map(([genre, count]) => ({ name: genre, value: count }));

    result = result.concat(remainingEntries);
  }

  return result;
}
  

  async function renderArtistsAlbums(time_range=1) {
    let artists;
    let albums;
    
    if (sessionStorage.getItem("artists") && sessionStorage.getItem("albums")){
      artists = JSON.parse(sessionStorage.getItem("artists"));
      albums = JSON.parse(sessionStorage.getItem("albums"));
    }else{
      const token = sessionStorage.getItem('access_token');
      const data = await getUserTop(token, 'tracks', time_range);
      const parsedData = parseArtistsAlbums(data);

      artists = parsedData.artists;
      albums = parsedData.albums;
      sessionStorage.setItem("artists",JSON.stringify(artists));
      sessionStorage.setItem("albums",JSON.stringify(albums));
    }

    renderBubbleChart(artists, '#artists_chart');
    renderBubbleChart(albums, '#albums_chart');
  }

  async function renderGenres(time_range=1) {
    let genres;
    
    if (sessionStorage.getItem("genres")){
      genres = await JSON.parse(sessionStorage.getItem("genres"));
      console.log(genres)
    }else{
      const token = sessionStorage.getItem('access_token');
      const data = await getUserTop(token, 'artists', time_range);
      genres = parseGenres(data);
      sessionStorage.setItem("genres",JSON.stringify(genres))
    }

    renderBubbleChart(genres, '#genres_chart');
  }

  function renderBubbleChart(data, container_id) {
    const container = d3.select(container_id);
    const width = container.node().getBoundingClientRect().width;
    const height = Math.min(768, container.node().getBoundingClientRect().width);
    
    container.select("svg").remove();


    const svg = container
      .append('svg')
      .attr('width', '100%')
      .attr('height', height);
  
    const bubble = d3
      .pack(data)
      .size([width, height])
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

    node
      .style('opacity',0)
      .transition()
      .duration(1000)
      .delay(() => Math.random() * 1000)
      .style('opacity',1)
  
    const colors = ["#d00000","#ffba08","#3f88c5","#136f63","#032b43"];
    let colorIndex = 0;
  
    node
      .append('circle')
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
    .style('overflow','visible')
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
      const maxFontSize = (0.6 * (radius-3)) / Math.sqrt(2);  
      return maxFontSize + 'px';
    }
  }