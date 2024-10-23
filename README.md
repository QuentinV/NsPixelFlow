# Query params

## Load song

- **songUrl** : url of song to be loaded and analize for frequency and beat

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

http://localhost:5173/?songUrl=http%3A%2F%2Flocalhost%3A8080%2Fstorage%2Fsongs%2F150669a0-b71c-41df-86a7-bd07f3f72bc3