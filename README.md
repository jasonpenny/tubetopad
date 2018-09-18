:skull: :exclamation: This project has been archived, now I put videos into a Plex library
with https://github.com/jasonpenny/tubetoplex


# TubeToPad

A tool to automatically download youtube videos and make ready for
iTunes import as iTunes import as TV Shows

Given a youtube/vimeo/etc. URL, this will download the video, convert it
to mp4 format with acceptible dimensions, and set TV Show metadata. The
resulting file can then be dragged onto iTunes and will sync to your
iPad as a TV Show.

![Screenshot](/../screenshots/main.png?raw=true)

## Quick start
Install mongodb

Run `npm install`

Run `./node_modules/gulp/bin/gulp.js`

Run `node index.js`

Open http://localhost:3000/
Enter a URL, select the show and click Add URL
