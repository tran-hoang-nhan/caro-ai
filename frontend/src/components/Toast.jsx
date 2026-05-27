import React from 'react';

export default function Toast({ text, type, show }) {
  return (
    <div id="message" className={`${type} ${show ? 'show' : ''}`}>
      {text}
    </div>
  );
}
