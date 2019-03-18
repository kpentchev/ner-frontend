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
    predictions.forEach(prediciton => {
        const ner = text.substring(prediciton.start, prediciton.end)
        result.push(text.substring(lastIdx, prediciton.start))
        result.push(<Popover content={ner} title={type2label[prediciton.type]}><mark className={prediciton.type}>{ner}</mark></Popover>)
        lastIdx = prediciton.end
    });
    result.push(text.substring(lastIdx));
    return result;
}

const AnalyzedTextComponent = ({text, predictions}) =>
    <p className="text-predicitons" children={processText(text, predictions)} />

export default AnalyzedTextComponent;