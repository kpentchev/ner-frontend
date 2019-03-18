import React from 'react';

import { Popover } from 'antd';
import 'antd/lib/popover/style/css';

const type2label = {
    gam: 'game',
    org: 'organization',
    per: 'person',
    mon: 'money',
    geo: 'geolocation',
    tou: 'tournament',
    tim: 'time',
    tea: 'team'
}

const processText = (text, predictions) => {
    if (!text || !predictions)
        return
    const result = [];
    let lastIdx = 0;
    predictions.forEach((prediction, idx) => {
        const ner = text.substring(prediction.start, prediction.end)
        result.push(text.substring(lastIdx, prediction.start))
        result.push(<Popover key={`prediction-${idx}`} content={ner} title={type2label[prediction.type]}><mark className={prediction.type}>{ner}</mark></Popover>)
        lastIdx = prediction.end
    });
    result.push(text.substring(lastIdx));
    return result;
}

const AnalyzedTextComponent = ({text, predictions}) =>
    <p className="text-predicitons" children={processText(text, predictions)} />

export default AnalyzedTextComponent;