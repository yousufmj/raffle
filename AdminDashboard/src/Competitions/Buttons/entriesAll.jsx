import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button } from '@material-ui/core';

import { CSVLink } from 'react-csv';
import config from '../../config';
import axios from 'axios';

class EntriesAll extends Component {
  constructor(props) {
    super(props);
    this.state = {
      entries: [],
      csvHeaders: []
    };
  }
  componentDidMount() {
    const { data } = this.props;
    this.getExport(data.competitionID, 'entries');
    this.createCsvHeaders();
  }

  getExport = (competitionID, urlSegment) => {
    const url = `${config.api_url}/entries/pretty`;

    axios
      .get(url, {
        params: {
          filter: {
            competitionID
          }
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
    const { name, type, data, filename } = this.props;

    return (
      <div>
        <CSVLink
          data={this.state[type]}
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

EntriesAll.propTypes = {
  data: PropTypes.object,
  name: PropTypes.string,
  type: PropTypes.string
};

export default connect()(EntriesAll);
