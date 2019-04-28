import React from 'react'

export default function OptionSection({label, children}) {
  return (
    <div style={{marginTop: "25px"}}>
      <div style={{fontWeight: "bold"}}>{label}</div>
      <div style={{marginTop: "5px"}}>
        {children}
      </div>
    </div>
  )
}