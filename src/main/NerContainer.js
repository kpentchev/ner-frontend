import React from 'react';

import { Form, Input, Button, Icon } from 'antd';
import 'antd/lib/form/style/css';
import 'antd/lib/input/style/css';
import 'antd/lib/button/style/css';
import 'antd/lib/icon/style/css';

import AnalizedTextComponent from '~/main/AnalizedTextComponent';

const { TextArea } = Input;

class NerContainer extends React.Component {

    constructor(props) {
        super(props);
        this.state ={
            text: '',
            predictions: [],
            showResult: false,
            analyzedText: ''
        }
    }

    handleSubmit = (e) => {
        e.preventDefault();
        const response = 
            fetch('https://ens.pentchev.eu/predict', {
                method: 'POST',
                mode: 'cors',
                cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
                credentials: "same-origin", // include, *same-origin, omit
                headers: {
                    "Content-Type": "application/json",
                    // "Content-Type": "application/x-www-form-urlencoded",
                },
                redirect: "follow", // manual, *follow, error
                referrer: "no-referrer", // no-referrer, *client
                body: JSON.stringify({text: this.state.text})
            })
            .then(res => res.json())
            .then(data => {
                this.setState({
                predictions: data.predictions,
                showResult: true,
                analyzedText: this.state.text
            })})
    }

    onChangeText = (e) => {
        this.setState({
            text: e.target.value
        })
    }

    onSample = () => {
        this.setState({
            text: 'Starladder will present the 15th Counter-Strike: Global Offensive (CS:GO) Major, considered to be one of the most prestigious regular events in the game’s calendar. As well as being a first for the Ukraine-based esports company, this will be the first Major to take place in Berlin, from Sept. 5-8 at the Mercedes-Benz Arena.'
        })
    }

    render() {
        return (
            <div>
                <Form className="login-form centers" onSubmit={this.handleSubmit} >
                    <Form.Item>
                        <TextArea rows={10} cols={200} value={this.state.text} onChange={this.onChangeText} />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" className="login-form-button">
                        <Icon type="file-search" />
                        ANALIZE
                    </Button>
                    <Button type="secondary" className="login-form-button" onClick={this.onSample} style={{'marginLeft': '1ex'}}>
                        <Icon type="file-text" />
                        SAMPLE
                    </Button>
                </Form>
                {!!this.state.showResult && <AnalizedTextComponent text={this.state.analyzedText} predictions={this.state.predictions} />}
            </div>
        );
    }

}

export default NerContainer;