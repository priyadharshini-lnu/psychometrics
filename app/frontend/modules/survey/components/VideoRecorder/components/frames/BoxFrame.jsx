/* eslint-disable max-len */
import styles from './Frames.less'

export default function BoxFrame ({ boundaries: { box } }) {
  const style = {
    position: 'absolute',
    left: box.x,
    top: box.y,
    width: box.width,
    height: box.height,
  }
  const fillStyle = {
    fill: '#fff',
  }
  return (
    <div className={styles.box} style={style}>
      <svg className={styles.topLeft} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46 46"><g id="TopLeft" data-name="Layer 2"><g id="Layer_1-2" data-name="Layer 1"><path id="Union_1" data-name="Union 1" d="M0,43.5V2.5A2.5,2.5,0,0,1,2.5,0h41a2.5,2.5,0,0,1,0,5H5V43.5a2.5,2.5,0,0,1-5,0Z" style={fillStyle} /></g></g></svg>
      <svg className={styles.topRight} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46 46"><g id="TopRight" data-name="Layer 2"><g id="Layer_1-2" data-name="Layer 1"><path id="Union_2" data-name="Union 2" d="M43.5,0A2.5,2.5,0,0,1,46,2.5v41a2.5,2.5,0,0,1-5,0V5H2.5a2.5,2.5,0,0,1,0-5Z" style={fillStyle} /></g></g></svg>
      <svg className={styles.bottomRight} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46 46"><g id="BottomRight" data-name="Layer 2"><g id="Layer_1-2" data-name="Layer 1"><path id="Union_4" data-name="Union 4" d="M46,3V43a3,3,0,0,1-3,3H3a3,3,0,1,1,0-6H40V3a3,3,0,1,1,6,0Z" style={fillStyle} /></g></g></svg>
      <svg className={styles.bottomLeft} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46.06 46"><g id="BottomLeft" data-name="Layer 2"><g id="Layer_1-2" data-name="Layer 1"><path id="Union_5" data-name="Union 5" d="M3,46a3,3,0,0,1-3-3H0V3A3,3,0,1,1,6.05,3V40H43a3,3,0,1,1,.11,6H3Z" style={fillStyle} /></g></g></svg>
    </div>
  )
}
