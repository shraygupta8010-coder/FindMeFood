import React, { useState, useEffect, useRef } from 'react';

const TruncatedText = ({ text, maxLines = 2, className = '' }) => {
  const [isTruncated, setIsTruncated] = useState(false);
  const [needsTruncation, setNeedsTruncation] = useState(false);
  const textRef = useRef(null);

  useEffect(() => {
    if (textRef.current) {
      const lineHeight = parseInt(getComputedStyle(textRef.current).lineHeight);
      const maxHeight = lineHeight * maxLines;
      const actualHeight = textRef.current.scrollHeight;
      
      setNeedsTruncation(actualHeight > maxHeight);
      setIsTruncated(actualHeight > maxHeight);
    }
  }, [text, maxLines]);

  const toggleTruncation = () => {
    setIsTruncated(!isTruncated);
  };

  return (
    <div className={`truncated-text ${className}`}>
      <div 
        ref={textRef}
        className="text-content"
        style={{
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: isTruncated ? maxLines : 'none',
          WebkitBoxOrient: 'vertical',
          lineHeight: '1.5'
        }}
      >
        {text}
      </div>
      {needsTruncation && (
        <button 
          onClick={toggleTruncation}
          className="truncation-toggle"
        >
          {isTruncated ? 'Read more' : 'Show less'}
        </button>
      )}
    </div>
  );
};

export default TruncatedText;