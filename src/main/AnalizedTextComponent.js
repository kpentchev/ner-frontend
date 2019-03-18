import React from 'react';

const processText = (text, predictions) => {
    if (!text || !predictions)
        return
    const result = [];
    let lastIdx = 0;
    predictions.forEach(prediciton => {
        result.push(text.substring(lastIdx, prediciton.start))
        result.push(<mark className={prediciton.type}>{text.substring(prediciton.start, prediciton.end)}</mark>)
        lastIdx = prediciton.end
    });
    result.push(text.substring(lastIdx));
    return result;
}

const AnalyzedTextComponent = ({text, predictions}) =>
    <p className="text-predicitons" children={processText(text, predictions)} />

export default AnalyzedTextComponent;