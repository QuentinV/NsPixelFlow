# Query params

## Load song

- **songUrl** : url of song to be loaded and analize for frequency and beat
- **imagesSyncUrl**: url of json files that includes `{ start, url }[]` where url is json drawing
- **songDelay**: delay loading of song (milliseconds)

## Title start & end ##

- **title**: display title on page loading
- **titleHide**: amount of milliseconds when to hide title
- **titleEnd**: Display title when song is over

## Background

- **bgImg** : url of background image
- **bgc** : background color

## Shape

- **shape** : either "*cynlinder*" or "*box*" or "*random*"

### Shape colors

- **sc** : start color of shape lines
- **ec** : end color of shape lines

### Shape movements

#### Auto

- **am** : auto mix *(default: true)*
- **ar** : auto rotate *(default: true)*

#### Rotation and repeat

- **kr** : keep rotate - repeat from start when duration ends
- **rd** : rotate duration (slower or faster) in seconds. Default is 3.
- **rYoyo** : rotate yoyo efect. Include repeat infinite.

### Shape size

#### Width box

- **w**: fixed width (replace wMin & wMax)
- **wMin**: min width for random
- **wMax**: max width for random

#### Height

- **h**: fixed height (replace hMin & hMax)
- **hMin**: min height for random
- **hMax**: max height for random

#### Depth box

- **d**: fixed depth (replace dMin & dMax)
- **dMin**: min depth
- **dMax**: max depth

#### Radial cylinder

- **r**: radial (replace rMin & rMax)
- **rMin**: min radial
- **rMax**: max radial

#### Frequency size change

- **fMax**: frequency update max for variation change

#### Auto resize

- **resize**: auto resize when screen (viewport) change

## Example

http://localhost:8586/?songUrl=http%3A%2F%2Flocalhost%3A8585%2Fstorage%2F123-123%2Fsong.mp3&shape=box&title=The%20best%20song%20ever%20the%20lord%20of%20the%20rings&bgc=black&titleHide=10000&titleEnd=Thank%20you%20for%20watching%20!