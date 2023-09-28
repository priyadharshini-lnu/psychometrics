/* eslint-disable max-len */
const STROKE_WIDTH = 5
const FACE_HEIGHT = 70 // Face Height from the person svg artwork.

/**
 * Origin of the person svg is moved to the center of the face. So, any positioning
 * or transformation such as scaling or rotation will happen about the center of the face.
 * Which is about 9% from the top and 50% from the left of the person frame.
 * Scale: OffsetHeight x object.size = RequiredFaceHeight; RequiredFaceHeight / FACE_HEIGHT = SCALE_FACTOR
 * Left: Center point of the box along x-axis divided by offsetWidth to get the fraction later multiplied by 100 to get the percentage
 * Top: Similar to Left, but along y-axis
 */

function PersonFrame ({ boundaries: { box, canvas }, className, trackerOptions: { object } }) {
  const scale = (canvas.height * object.size / FACE_HEIGHT)
  const strokeWidth = STROKE_WIDTH / scale
  const left = (box.x + box.width / 2) / canvas.width
  const top = (box.y + box.height / 2) / canvas.height
  const style = {
    position: 'absolute',
    left: `${left * 100}%`,
    top: `${top * 100}%`,
    transform: `translate(-50%, -9%) scale(${scale})`,
    transformOrigin: '50% 9%',
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="148.919" height="472.512" viewBox="0 0 148.919 472.512" style={style} className={className}>
      <path id="Person_full_Body" data-name="Person_full Body" d="M-1247.309-123.893c-8.975,13.208-59.682,10-77.957,5.3S-1340.4-151.2-1340.4-151.313c1.168-50.654-3.087-123.919-4.873-149.668-2.075-29.916-24.553-51.753-25.705-80.856.056-.571,1.2-76.678,1.424-82.174.578-14.426,9.7-18.9,11.99-20.2s28.555-13.185,34.63-18.165c6.192-5.69,5.34-15.078,5.207-16.243a3.174,3.174,0,0,0-.285-1.134c-1.763-2.871-2.5-6.339-3.791-9.5a24.46,24.46,0,0,1-1.151-4.328c-1.482-4.972-2.056-19.6-2.049-20.252.05-4.563.181-9.106,1.474-13.538a17.888,17.888,0,0,1,12.063-12.718,42.272,42.272,0,0,1,21.716-.942c8.4,1.671,14.087,5.972,16.007,15.822a83.874,83.874,0,0,1,.92,10.968c.067,1.107.252,15.28-1.874,21.151-.848,3.363-.971,3.64-1.345,5.034a30.906,30.906,0,0,1-4.7,10.251c-.228,1.737-.957,10.017,4.935,15.431,6.076,4.982,32.338,16.864,34.63,18.165s9.963,6.494,10.545,20.92c.29,7.213,3.647,46.246,3.572,78.431-.026,19.09-15.9,58.042-16.876,79.316.082,48.977,4.884,104.664,4.884,154.117A49.5,49.5,0,0,1-1247.309-123.893Z" transform="translate(1373.479 584.506)" fill="none" stroke="#fff" strokeWidth={strokeWidth} />
    </svg>
  )
}

export default PersonFrame
