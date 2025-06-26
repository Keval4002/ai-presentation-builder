import React from 'react';

function SimpleMarkdown({ text }) {
  if (!text) return null;

  return (
    <span>
      {text.split('**').map((part, i) =>
        i % 2 === 1 ? <strong key={i} className="font-semibold">{part}</strong> : part
      )}
    </span>
  );
}

export default SimpleMarkdown;
