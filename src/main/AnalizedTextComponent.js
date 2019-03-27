import React from 'react';

import { Popover, List, Tag } from 'antd';
import 'antd/lib/popover/style/css';
import 'antd/lib/list/style/css';
import 'antd/lib/tag/style/css';

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
        const meta = prediction.meta
        result.push(text.substring(lastIdx, prediction.start))
        result.push(<Popover key={`prediction-${idx}`} content={<PopoverContent text={ner} meta={meta} />} title={type2label[prediction.type]}><mark className={prediction.type}>{ner}</mark></Popover>)
        lastIdx = prediction.end
    });
    result.push(text.substring(lastIdx));
    return result;
}

const AnalyzedTextComponent = ({text, predictions}) =>
    <p className="text-predicitons" children={processText(text, predictions)} />

const PopoverContent = ({text, meta}) =>
    <div>
        <List
            size="small"
            bordered
            dataSource={Object.keys(meta)}
            renderItem={key => 
                <List.Item>
                    <List.Item.Meta title={<h4>{key}</h4>} />
                    <MetaValue value={meta[key]} />
                </List.Item>
            }
        />
    </div>

const MetaValue = ({value}) =>
    Array.isArray(value) ? 
    <List
        size="small"
        dataSource={value}
        renderItem={item =>  <List.Item>{item}</List.Item>}
    /> : <span>{value}</span>

export default AnalyzedTextComponent;