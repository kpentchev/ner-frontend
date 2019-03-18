import React from 'react';

import { Form, Input, Button } from 'antd';
import 'antd/lib/form/style/css';
import 'antd/lib/input/style/css';
import 'antd/lib/button/style/css';

import AnalizedTextComponent from '~/main/AnalizedTextComponent';

const { TextArea } = Input;

class NerContainer extends React.Component {

    constructor(props) {
        super(props);
        this.state ={
            text: '',
            predictions: [],
            showResult: false
        }
    }

    handleSubmit = (e) => {
        e.preventDefault();
        const response = 
            fetch('http://localhost:5000/predict', {
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
                showResult: true
            })})
    }

    onChangeText = (e) => {
        this.setState({
            text: e.target.value
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
                        ANALIZE
                    </Button>
                </Form>
                {!!this.state.showResult && <AnalizedTextComponent text={this.state.text} predictions={this.state.predictions} />}
            </div>
        );
    }

}

export default NerContainer;