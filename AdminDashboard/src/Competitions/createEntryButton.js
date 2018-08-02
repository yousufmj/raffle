import React, { Component } from 'react';
import compose from 'recompose/compose';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import { translate, Link } from 'react-admin';
import { stringify } from 'query-string';
import SyncIcon from '@material-ui/icons/Sync';
import { connect } from 'react-redux';

const styles = theme => ({
  button: {
    margin: theme.spacing.unit
  },
  input: {
    display: 'none'
  }
});

class CreateEntryButton extends Component {
  render() {
    return (
      <Button
        color="primary"
        component={Link}
        to={{
          pathname: '/entries',
          search: stringify({
            page: 1,
            perPage: 10,
            filter: '',
            sort: 'id',
            order: 'DESC'
          })
        }}
      >
        Create Entry
        <SyncIcon />
      </Button>
    );
  }
}

export default connect()(CreateEntryButton);
