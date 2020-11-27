<p align="center">
  <br/>
  <a href="https://twitch.tv/Maarchy"><img src="https://i.imgur.com/iwm5vRn.png" width="200px"></a>
  <h1 align="center">
    <p align="center">
      MarchyGuard
    </p>
  </h1>
  <p align="center">
    The sole protector of Marchy's Pack
  </p>
  <br/>
</p>

## Synopsis
This Discord bot was commissioned by [@MattMarchy](https://github.com/MattMarchy) to automate several functions of his Discord server and generally solve annoying problems like Discord's AFK function not working correctly and being unable to have flexibility in how long the timeout should be.

## Usage
1. Copy .env.defaults and make sure you set the necessary parameters in the .env file. 
2. Then, it's as simple as running `npm run start`.

To use this in production, run `npm run-script build` then `npm run start:prod`.

## Features
* Automatically moves deafened users to the AFK channel after X minutes (default is 10 - defined in .env)
* Provides a walled-garden verification system for the server - tick a box and get granted a role to see the server.
* Shows/hides a text channel on demand when a user joins/leaves a voice channel (excluding the AFK channel).
* Posts any new tweets from [@MarchyPC](https://twitter.com/MarchyPC) to a specified Discord channel.

### Upcoming
* Post new YouTube feeds to the same specified Discord channel and also FSElite RSS feeds, etc
* Add screenshot competition entry system (see [#4](https://github.com/Keanu73/MarchyGuard/issues/4))
* Be able to start a streaming server on demand to loopback VirtualDJ audio to a specified Discord channel (see [#3](https://github.com/Keanu73/MarchyGuard/issues/3))
