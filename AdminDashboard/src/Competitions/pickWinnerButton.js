import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { Button, TextField } from '@material-ui/core';
import { showNotification as showNotificationAction } from 'react-admin';
import { push as pushAction } from 'react-router-redux';
import config from './../config';
import { withStyles } from 'material-ui/styles';

const styles = theme => ({
  TextField: {
    width: 40
  }
});

class PickWinnerButton extends Component {
  state = {
    amount: 1
  };

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value
    });
  };

  handleClick = () => {
    const { push, record, showNotification } = this.props;
    const url = `${config.api_url}/competitions/${record.id}/winner`;
    let body = {
      amount: this.state.amount
    };
    fetch(url, {
      headers: {
        'content-type': 'application/json'
      },
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify(body)
    })
      .then(response => {
        showNotification('Winner has been selected');
        push(`/competitions/${record.id}/show`);
        // window.location.reload();
      })
      .catch(err => {
        showNotification('Error selecting winner');
        push(`/competitions/${record.id}/show`);
      });
  };

  render() {
    return (
      <div>
        <TextField
          id="amount"
          onChange={this.handleChange('amount')}
          margin="normal"
          type="number"
          style={{ width: 40 }}
          value={this.state.amount}
        />
        <Button variant="raised" color="primary" onClick={this.handleClick}>
          Pick Winner
        </Button>
      </div>
    );
  }
}

PickWinnerButton.propTypes = {
  push: PropTypes.func,
  record: PropTypes.object,
  showNotification: PropTypes.func
};

export default connect(
  null,
  {
    showNotification: showNotificationAction,
    push: pushAction
  }
)(PickWinnerButton);
