# Bubblify for Spotify
An application that allows users to visualize their most listened artists on Spotify in an interactive bubble chart format.
##### Powered by D3 (Data-Driven Documents), a JavaScript charting library; Spotify Web API and Bootstrap5 framework. Using Spotify's Implicit Grant Flow for authorization process.

## Spotify API Authorization
Redirecting to Spotify's official authorization page, enter your Spotify credentials and get the access token needed for Spotify Web API access. Returns to Bubblify callback url 
# <img width="500" alt="image" src="https://github.com/ozgvr/bubblify/assets/61429082/bd88b9c9-acb9-436c-9f32-5ef86f5045b9">

## Top Artists
Visualize your top artists in bubbles. Bubble sizes differ by the frequency of the artist in user's top 50 tracks in selected time frame. 
# <img width="500" alt="image" src="https://github.com/ozgvr/bubblify/assets/61429082/b10a57bb-08c9-4087-a4b4-815398445cb7">

## Top Albums
Visualize your top albums in bubbles. Albums in user's top 50 tracks are retrieved, then the frequency of each album in the tracks are counted. Bubble sizes are determined by this frequency. 
# <img width="500" alt="image" src="https://github.com/ozgvr/bubblify/assets/61429082/f990ffcb-da78-47e6-962e-04c5929f6525">

## Top Genres
Visualize your top albums in bubbles. First, top 50 artists of the user in selected time frame are retrieved. Each artist have several genres. Frequency of each genre in top 50 artists determine the bubble size. Only genres with frequency larger than 1 are shown for the sake of simplicity.  
# <img width="500" alt="image" src="https://github.com/ozgvr/bubblify/assets/61429082/ac87a3ea-84dc-4fdd-968a-886090dcb564">

## Select different time frames
Get data for multiple time frames. Spotify names these time frames as "short-term", "medium-term" and "long-term". Which are corresponding to "weekly", "monthly" and "yearly" in the application.
# <img width="500" alt="image" src="https://github.com/ozgvr/bubblify/assets/61429082/5ec0704e-47f3-4989-86be-6182f84876c9">
