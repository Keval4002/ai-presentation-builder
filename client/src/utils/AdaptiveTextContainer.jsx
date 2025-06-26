import React from 'react'

function AdaptiveTextContainer({ content, children }) {

    const contentLength = content?.length || 0;
    let contentClass = 'text-base';
    if (contentLength > 400) contentClass = 'text-sm';
    if (contentLength > 800) contentClass = 'text-xs';
    if (contentLength > 1200) contentClass = 'text-xs';
    return children({ contentClass });

};

export default AdaptiveTextContainer