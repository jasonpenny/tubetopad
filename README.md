# TubeToPad

A tool to automatically download youtube videos and make ready for
iTunes import as iTunes import as TV Shows

Given a youtube/vimeo/etc. URL, this will download the video, convert it
to mp4 format with acceptible dimensions, and set TV Show metadata. The
resulting file can then be dragged onto iTunes and will sync to your
iPad as a TV Show.

## Quick start
Install mongodb

Run `npm install`

Run `node app/job-worker.js`

Add a youtube url to app/test-runner.js then run `node
app/test-runner.js`
