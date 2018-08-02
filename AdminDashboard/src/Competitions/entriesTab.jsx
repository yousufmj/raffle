import React, { Component } from 'react';
import config from '../config';
import axios from 'axios';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import {
  Tab,
  TextField,
  Card,
  Button,
  Select,
  FormControl,
  MenuItem,
  InputLabel,
  Checkbox,
  FormGroup,
  FormControlLabel,
  FormLabel
} from '@material-ui/core';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Dropzone from 'react-dropzone';
import Papa from 'papaparse';
import { CSVDownload, CSVLink } from 'react-csv';

// custom components
import EntriesAll from './Buttons/entriesAll';
import EntriesThirdParty from './Buttons/entriesThirdParty';
import EntriesNewsletter from './Buttons/entriesNewsletter';
import Winners from './Buttons/winners';

const csv = require('csv');

const styles = theme => ({
  button: {
    display: 'block',
    marginTop: theme.spacing.unit * 2
  },
  formControl: {
    minWidth: 150
  },
  card: {
    margin: 10,
    padding: 15
  },
  root: {
    flexGrow: 1
  },
  dropzone: {
    padding: 15
  },
  error: {
    color: 'red'
  },
  btnRed: {
    backgroundColor: '#C01111',
    color: 'white'
  },
  success: {
    color: '#309F0F'
  }
});

class EntriesTab extends Component {
  constructor(props) {
    super(props);

    this.emptyForm = {
      firstName: '',
      lastName: '',
      email: '',
      address1: '',
      address2: '',
      postcode: '',
      entryMethod: '',
      answer1: '',
      answer2: '',
      terms: false,
      newsletter: false,
      thirdParty: false
    };

    this.state = {
      totalEntries: 0,
      allEntries: [],
      exportEntries: [],
      form: this.emptyForm,
      competition: {
        id: '',
        title: ''
      },
      files: [],
      multiErrors: [],
      formEntryError: []
    };
  }
  componentDidMount() {
    const { record, push, ...props } = this.props;
    this.setState({
      competition: {
        id: record.id,
        title: record.title
      },
      magazineID: record.magazineID
    });

    const url = `${config.api_url}/entries`;
    axios
      .get(url, {
        params: {
          filter: {
            competitionID: record.id
          }
        }
      })
      .then(response => {
        const total = response.data.total || 0;
        const allEntries = response.data.results ? response.data.results : [];
        this.setState({ totalEntries: total, allEntries });
      })
      .catch(error => error);
  }

  handleClose = () => {
    this.setState({ open: false });
  };

  handleOpen = () => {
    this.setState({ open: true });
  };

  /**
   * Handle the text field changes
   */
  handleChange = name => event => {
    this.setState({
      form: {
        ...this.state.form,
        [name]: event.target.value
      }
    });
  };

  handleCheckbox = name => (event, isInputChecked) => {
    this.setState({
      form: {
        ...this.state.form,
        [name]: isInputChecked
      }
    });
  };

  // Handle CSV file using dropZone
  onDrop = e => {
    const reader = new FileReader();

    // load csv and pass into an array
    reader.onload = () => {
      csv.parse(reader.result, { delimiter: ',' }, (err, data) => {
        // CSV must be in a specific template
        // makes it easier to deconstruct and reuse data

        const csvDefaultOrder = [
          'First Name',
          'Last Name',
          'Email',
          'Address 1',
          'Address 2',
          'Postcode',
          'Answer 1',
          'Answer 2',
          'Entry Method',
          'Agreed Terms',
          'Newsletter',
          'Third Party'
        ];

        const currentCSVOrder = data[0];

        let validate =
          csvDefaultOrder.length === currentCSVOrder.length &&
          csvDefaultOrder.every(
            (value, index) => value === currentCSVOrder[index]
          );
        this.setState({
          csvError: ''
        });
        if (!validate) {
          this.setState({
            csvError: 'CSV format Is not correct'
          });

          return;
        }

        console.log(data);

        // create an array with all csv entries
        let entryData = data
          .filter(row => {
            // remove first row headers
            if (row[0] != 'First Name') return true;
          })
          .map(row => {
            return {
              firstName: row[0],
              lastName: row[1],
              email: row[2],
              address1: row[3],
              address2: row[4],
              postcode: row[5],
              answer1: row[6],
              answer2: row[7],
              entryMethod: row[8],
              terms: row[9],
              newsletter: row[10],
              thirdParty: row[11],
              competitionID: this.state.competition.id
            };
          });

        // upload  the csv into the app
        this.multiUpload(entryData);
      });
    };

    reader.readAsBinaryString(e[0]);
  };

  /**
   * Upload multiple entries through use of CSV
   * @param {object[]} - an array containing entry object data
   */
  multiUpload = allEntries => {
    const url = `${config.api_url}/entries/create`;

    this.setState({
      multiErrors: [],
      multiSuccessCount: 0,
      multiErrorCount: 0
    });
    for (const entry of allEntries) {
      let { terms, newsletter, thirdParty, ...body } = entry;

      let allTerms = {
        terms,
        newsletter,
        thirdParty
      };

      let formatTerms = Object.keys(allTerms)
        .filter(item => {
          return allTerms[item] === 'yes';
        })
        .map(item => {
          return item;
        });

      body.terms = formatTerms;
      body.magazineID = this.state.magazineID;

      axios
        .post(url, body)
        .then(response => {
          if (response.status == 201) {
            this.setState({
              multiSuccess: true,
              multiSuccessCount: this.state.multiSuccessCount + 1
            });
          }
        })
        .catch(error => {
          let message = {};
          if (error.response.status == 422) {
            message = error.response.data.error[0];
          } else {
            message.reason = error.response.data.error.message;
          }

          const csvError = this.formatError(message, body);

          const multiErrors = this.state.multiErrors.concat(csvError);

          this.setState({
            multiErrors,
            multiErrorCount: this.state.multiErrorCount + 1
          });
        });
    }
  };

  formatError = (message, body) => {
    return {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      address1: body.address1,
      address2: body.address2,
      postcode: body.postcode,
      answer1: body.answer1,
      answer2: body.answer2,
      entryMethod: body.entryMethod,
      cell: message.parameter,
      reason: message.reason
    };
  };

  /**
   * create a single entry using the form
   * @param {object} - event handler
   */
  handleCreate = event => {
    const { record, push, ...props } = this.props;
    event.preventDefault();
    const url = `${config.api_url}/entries/create`;
    const formData = this.state.form;

    let { terms, newsletter, thirdParty, ...body } = formData;

    let allTerms = {
      terms,
      newsletter,
      thirdParty
    };

    let formatTerms = Object.keys(allTerms)
      .filter(item => {
        return allTerms[item] === true;
      })
      .map(item => {
        return item;
      });

    body.terms = formatTerms;
    body.competitionID = this.state.competition.id;

    this.setState({
      formSuccess: false,
      formEntryError: []
    });
    axios
      .post(url, body)
      .then(response => {
        this.setState({
          formSuccess: true,
          form: this.emptyForm
        });
      })
      .catch(error => {
        if (error.response.status !== 409) {
          this.setState({
            formSuccess: false,
            formEntryError: error.response.data.error
          });
        } else {
          const reason = [
            {
              reason: error.response.data.error.message
            }
          ];
          this.setState({
            formSuccess: false,
            formEntryError: reason
          });
        }
      });

    // window.location.reload();
  };

  render() {
    const { classes, record } = this.props;
    const time = new Date().getTime();

    return (
      <div className={classes.root}>
        <h2>Total Entries ({this.state.totalEntries})</h2>

        <Grid container className={classes.root} spacing={16}>
          <Grid item xs={12} sm={6}>
            <Card className={classes.card}>
              <h3>Create an Entry</h3>

              <form onSubmit={this.handleCreate}>
                <TextField
                  id="firstName"
                  label="First Name"
                  onChange={this.handleChange('firstName')}
                  margin="normal"
                  value={this.state.form.firstName}
                  required
                />
                <br />

                <TextField
                  id="lastName"
                  label="Last Name"
                  onChange={this.handleChange('lastName')}
                  margin="normal"
                  value={this.state.form.lastName}
                  required
                />
                <br />

                <TextField
                  id="email"
                  label="Email"
                  onChange={this.handleChange('email')}
                  margin="normal"
                  value={this.state.form.email}
                  required
                />
                <br />

                <TextField
                  id="address1"
                  label="Address 1"
                  onChange={this.handleChange('address1')}
                  margin="normal"
                  value={this.state.form.address1}
                  required
                />
                <br />

                <TextField
                  id="address2"
                  label="Address 2"
                  onChange={this.handleChange('address2')}
                  margin="normal"
                  value={this.state.form.address2}
                />
                <br />

                <TextField
                  id="postcode"
                  label="Postcode"
                  onChange={this.handleChange('postcode')}
                  margin="normal"
                  value={this.state.form.postcode}
                  required
                />
                <br />

                <FormControl
                  margin="normal"
                  className={classes.formControl}
                  required
                >
                  <InputLabel>Entry Method</InputLabel>
                  <Select
                    name={'entryMethod'}
                    open={this.state.open}
                    onClose={this.handleClose}
                    onOpen={this.handleOpen}
                    value={this.state.form.entryMethod}
                    onChange={this.handleChange('entryMethod')}
                    required
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    <MenuItem value={'online'}>Online</MenuItem>
                    <MenuItem value={'postal'}>Postal</MenuItem>
                    <MenuItem value={'mail'}>Mail</MenuItem>
                  </Select>
                </FormControl>
                <br />

                <TextField
                  id="answer1"
                  label="Answer 1"
                  onChange={this.handleChange('answer1')}
                  margin="normal"
                  value={this.state.form.answer1}
                />
                <br />

                <TextField
                  id="answer2"
                  label="Answer 2"
                  onChange={this.handleChange('answer2')}
                  margin="normal"
                  value={this.state.form.answer2}
                />
                <br />

                <FormControl component="fieldset" margin="normal" required>
                  <FormLabel component="legend">
                    Assign responsibility
                  </FormLabel>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          id="terms"
                          name="terms"
                          onChange={this.handleCheckbox('terms')}
                          margin="normal"
                          checked={this.state.form.terms}
                          inputProps={{required: true}}
                        />
                      }
                      label="Agreed To Terms & Conditions"
                      required
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          id="newsletter"
                          name="newsletter"
                          value="yes"
                          onChange={this.handleChange('newsletter')}
                          margin="normal"
                          checked={this.state.form.newsletter}
                        />
                        }
                      label="Sign up to newsletter"
                    />

                    <FormControlLabel
                      control={
                        <Checkbox
                          id="thirdParty"
                          name="thirdParty"
                          value="yes"
                          onChange={this.handleChange('thirdParty')}
                          margin="normal"
                          checked={this.state.form.thirdParty}
                        />
                      }
                      label="Agreed To thirdParty"
                    />
                  </FormGroup>
                </FormControl>
                <br />

                <Button color="primary" type="submit" variant="raised">
                  Create
                </Button>

                {this.state.formEntryError.length > 0 && (
                  <div>
                    <p style={{ color: 'red' }}>There are errors in the form</p>
                    <ul style={{ color: 'red' }}>
                      {this.state.formEntryError.map(err => {
                        return <li>{err.reason}</li>;
                      })}
                    </ul>
                  </div>
                )}

                {this.state.formSuccess && (
                  <div>
                    <p className={classes.success}>
                      Successfully Inserted Entry
                    </p>
                  </div>
                )}
              </form>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card className={classes.card}>
              <h3>Upload Multiple</h3>
              <Dropzone onDrop={files => this.onDrop(files)}>
                <div className={classes.dropzone}>
                  Select or Drag your csv to upload entries
                </div>
              </Dropzone>
              {console.log(this.state)}
              {this.state.multiSuccessCount > 0 && (
                <div>
                  <p className={classes.success}>
                    {this.state.multiSuccessCount} Successfully inserted entries
                  </p>
                </div>
              )}
              {this.state.multiErrorCount > 0 && (
                <div>
                  <p className={classes.error}>
                    {this.state.multiErrorCount} Failed entries, Please download
                    below
                  </p>
                  <CSVLink
                    data={this.state.multiErrors}
                    filename="failed-entries"
                    style={{ textDecoration: 'none' }}
                  >
                    <Button
                      variant="raised"
                      className={classes.btnRed}
                      colour="primary"
                    >
                      Download Failed Entries
                    </Button>
                  </CSVLink>
                </div>
              )}

              {this.state.csvError && (
                <p className={classes.error}>{this.state.csvError}</p>
              )}
            </Card>

            <Card className={classes.card}>
              <h3>Export Data</h3>

              <EntriesAll
                name="all entries"
                type="entries"
                filename={`entries-${this.state.competition.title}-${time}`}
                data={{
                  competitionID: record.id,
                  competitionTitle: this.state.competition.title
                }}
              />
              <br />

              <EntriesThirdParty
                name="third party entries"
                filename={`entries-thirdParty-${
                  this.state.competition.title
                }-${time}`}
                data={{
                  competitionID: record.id,
                  competitionTitle: this.state.competition.title
                }}
              />
              <br />

              <EntriesNewsletter
                name="newsletter entries"
                type="entries"
                filename={`entries-newsletter-${
                  this.state.competition.title
                }-${time}`}
                data={{
                  competitionID: record.id,
                  competitionTitle: this.state.competition.title
                }}
              />
              <br />

              <Winners
                name="winners"
                type="winners"
                filename={`winners-${this.state.competition.title}-${time}`}
                data={{
                  competitionID: record.id,
                  competitionTitle: this.state.competition.title
                }}
              />
            </Card>
          </Grid>
        </Grid>
      </div>
    );
  }
}

EntriesTab.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(EntriesTab);
