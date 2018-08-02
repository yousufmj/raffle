import React from "react";
import {
  List,
  Datagrid,
  TextField,

} from "react-admin";


export const WinnerList = props => (
  <List {...props}>
    <Datagrid>
      <TextField source="lastName" />
      <TextField source="email" />
    </Datagrid>
  </List>
);