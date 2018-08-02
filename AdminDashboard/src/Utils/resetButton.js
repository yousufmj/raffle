import React from "react";
import compose from "recompose/compose";
import Button from "@material-ui/core/Button";
import { withStyles } from "@material-ui/core/styles";
import { translate, Link } from "react-admin";
import { stringify } from "query-string";
import SyncIcon from "@material-ui/icons/Sync";

const styles = theme => ({
  button: {
    margin: theme.spacing.unit
  },
  input: {
    display: "none"
  }
});

const ResetView = ({ segment }) => (
  <Button
    color="primary"
    component={Link}
    to={{
      pathname: segment,
      search: stringify({
        page: 1,
        perPage: 10,
        filter: "",
        sort: "id",
        order: "DESC"
      })
    }}
  >
    Clear Filters
    <SyncIcon />
  </Button>
);

const enhance = compose(withStyles(styles), translate);
export default enhance(ResetView);
