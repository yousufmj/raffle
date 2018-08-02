import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  EditButton,
  TextInput,
  Filter,
  ReferenceField
} from 'react-admin';

import Actions from './../Utils/actions';

export const WinnerList = props => (
  <List {...props} filters={<WinnerFilter />} actions={<Actions />}>
    <Datagrid>
      <ReferenceField
        label="First Name"
        source="Candidate.id"
        reference="candidates"
      >
        <TextField source="firstName" />
      </ReferenceField>

      <ReferenceField
        label="Last Name"
        source="Candidate.id"
        reference="candidates"
      >
        <TextField source="lastName" />
      </ReferenceField>

      <ReferenceField
        label="Competition"
        source="Competition.id"
        reference="competitions"
      >
        <TextField source="title" />
      </ReferenceField>

      <ReferenceField
        label="Competition"
        source="Magazine.id"
        reference="magazines"
      >
        <TextField source="title" />
      </ReferenceField>
    </Datagrid>
  </List>
);

const WinnerFilter = props => (
  <Filter {...props}>
    <TextInput label="Search Competition" source="competitionTitle" alwaysOn />
  </Filter>
);
