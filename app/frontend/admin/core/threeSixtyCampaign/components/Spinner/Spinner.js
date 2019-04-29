import React from 'react'
import css from './index.scss'

export default function Spinner({ visible }) {
  if (visible) {
    return (
      <div className={css.spinner}>
        <div className={css.loader}></div>
      </div>
    )
  } else {
    return null;
  }
}