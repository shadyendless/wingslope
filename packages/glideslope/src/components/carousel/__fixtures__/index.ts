/**
 * Carousel items for the stories and tests. Images are generated SVG data URIs and the video and
 * audio files are tiny local assets, so Storybook works offline.
 */
import type { GsCarouselData } from '../types'
import demoVideo from './demo.mp4'
import song1 from './song-1.mp3'
import song2 from './song-2.mp3'

/** A landscape scene (sky, sun, two hills) as an SVG data URI. */
function scene(width: number, height: number, hue: number): string {
  const sky = `hsl(${hue} 55% 62%)`
  const horizon = `hsl(${(hue + 40) % 360} 60% 80%)`
  const near = `hsl(${(hue + 150) % 360} 35% 28%)`
  const far = `hsl(${(hue + 150) % 360} 30% 42%)`
  const w = width
  const h = height
  const markup = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`,
    `<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1">`,
    `<stop offset="0" stop-color="${sky}"/><stop offset="1" stop-color="${horizon}"/>`,
    `</linearGradient></defs>`,
    `<rect width="${w}" height="${h}" fill="url(#s)"/>`,
    `<circle cx="${w * 0.72}" cy="${h * 0.32}" r="${h * 0.12}" fill="hsl(45 95% 85%)"/>`,
    `<path d="M0 ${h * 0.72} Q${w * 0.3} ${h * 0.42} ${w * 0.62} ${h * 0.7} T${w} ${h * 0.6} V${h} H0Z" fill="${far}"/>`,
    `<path d="M0 ${h * 0.86} Q${w * 0.45} ${h * 0.62} ${w} ${h * 0.84} V${h} H0Z" fill="${near}"/>`,
    `</svg>`,
  ].join('')
  return `data:image/svg+xml,${encodeURIComponent(markup)}`
}

/** A flat tile with a music note, the thumbnail for audio items. */
function audioThumbnail(hue: number): string {
  const markup = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="57" height="32" viewBox="0 0 57 32">`,
    `<rect width="57" height="32" fill="hsl(${hue} 40% 30%)"/>`,
    `<path d="M25 9v11.2a3 3 0 1 0 2 2.8V13h6V9z" fill="hsl(${hue} 70% 85%)"/>`,
    `</svg>`,
  ].join('')
  return `data:image/svg+xml,${encodeURIComponent(markup)}`
}

/** Hues for the nine sample images. */
const HUES = [205, 25, 280, 160, 340, 55, 230, 120, 0]

export const CAROUSEL_ITEMS: GsCarouselData[] = HUES.map((hue, index) => ({
  dataType: 'image',
  dataUrl: scene(434, 240 + (index % 3) * 4, hue),
  fileName: `image-${index + 1}`,
  title: `Image ${index + 1}`,
  thumbnailUrl: scene(57, 32, hue),
  id: `image-${index + 1}`,
}))

export const MIXED_CAROUSEL_ITEMS: GsCarouselData[] = [
  {
    dataType: 'image',
    dataUrl: scene(434, 244, 205),
    fileName: 'image-1',
    title: 'Landscape Image',
    thumbnailUrl: scene(57, 32, 205),
    id: 'mixed-image-1',
  },
  {
    dataType: 'video',
    dataUrl: demoVideo,
    fileName: 'demo.mp4',
    title: 'Beach Drone',
    thumbnailUrl: scene(57, 32, 190),
    id: 'mixed-video-1',
  },
  {
    dataType: 'audio',
    dataUrl: song1,
    fileName: 'song-1.mp3',
    title: 'Sample Song 1',
    thumbnailUrl: audioThumbnail(260),
    id: 'mixed-audio-1',
  },
  {
    dataType: 'image',
    dataUrl: scene(434, 240, 25),
    fileName: 'image-2',
    title: 'Nature Photo',
    thumbnailUrl: scene(57, 32, 25),
    id: 'mixed-image-2',
  },
  {
    dataType: 'audio',
    dataUrl: song2,
    fileName: 'song-2.mp3',
    title: 'Sample Song 2',
    thumbnailUrl: audioThumbnail(20),
    id: 'mixed-audio-2',
  },
  {
    dataType: 'image',
    dataUrl: scene(434, 248, 280),
    fileName: 'image-3',
    title: 'Architecture',
    thumbnailUrl: scene(57, 32, 280),
    id: 'mixed-image-3',
  },
]
