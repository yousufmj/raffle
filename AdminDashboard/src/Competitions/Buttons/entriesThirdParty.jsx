import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button } from '@material-ui/core';
import axios from 'axios';
import { CSVLink, CSVDownload } from 'react-csv';

import config from '../../config';

class EntriesThirdParty extends Component {
  constructor(props) {
    super(props);
    this.state = {
      entries: [],
      csvHeaders: []
    };
  }
  componentDidMount() {
    const { data } = this.props;
    let filter = {
      competitionID: data.competitionID,
      terms: 'thirdParty'
    };
    this.getExport(filter);
    this.createCsvHeaders();
  }

  getExport = filter => {
    const url = `${config.api_url}/entries/pretty`;

    axios
      .get(url, {
        params: {
          filter
        }
      })
      .then(results => {
        this.setState({
          entries: results.data
        });
      })
      .catch(error => error);
  };

  createCsvHeaders = () => {
    const csvHeaders = [
      { label: 'First Name', key: 'firstName' },
      { label: 'Last Name', key: 'lastName' },
      { label: 'Email', key: 'email' },
      { label: 'Address Line 1', key: 'address1' },
      { label: 'Address Line 2', key: 'address2' },
      { label: 'Postcode', key: 'postcode' },
      { label: 'Answer 1', key: 'answer1' },
      { label: 'Answer 2', key: 'answer2' },
      { label: 'Entry Method', key: 'entryMethod' },
      { label: 'Agreed Terms', key: 'terms' },
      { label: 'Newsletter', key: 'newsletter' },
      { label: 'Third Party', key: 'thirdParty' },
      { label: 'Magazine', key: 'magazine' }
    ];
    this.setState({
      csvHeaders
    });
  };

  render() {
    const { name, filename } = this.props;

    return (
      <div>
        <CSVLink
          data={this.state.entries}
          filename={filename}
          style={{ textDecoration: 'none' }}
          headers={this.state.csvHeaders}
        >
          <Button variant="raised" color="primary">
            {name}
          </Button>
        </CSVLink>
      </div>
    );
  }
}

EntriesThirdParty.propTypes = {
  data: PropTypes.object,
  name: PropTypes.string
};

export default connect()(EntriesThirdParty);
