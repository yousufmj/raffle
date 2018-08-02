import React from "react";
import {
  List,
  Edit,
  Create,
  Datagrid,
  TextField,
  EditButton,
  DisabledInput,
  SimpleForm,
  TextInput,
  Filter,
  CardActions,
  DeleteButton,
  RefreshButton,
  LongTextInput,
  ListButton
} from "react-admin";

import Actions from "./../Utils/actions";

export const TermList = props => (
  <List {...props} filters={<TermFilter />} actions={<Actions />}>
    <Datagrid>
      <TextField source="id" />
      <TextField source="title" />
      <TextField source="description" />
      <EditButton />
    </Datagrid>
  </List>
);

const TermTitle = ({ record }) => {
  return <span>Term: {record ? record.title : ""}</span>;
};

const TermFilter = props => (
  <Filter {...props}>
    <TextInput label="Search Title" source="title" alwaysOn />
  </Filter>
);

export const TermEdit = props => (
  <Edit title={<TermTitle />} {...props} actions={<TermEditActions />}>
    <SimpleForm>
      <DisabledInput source="id" />
      <TextInput source="title" />
      <LongTextInput source="description" />
    </SimpleForm>
  </Edit>
);

const TermEditActions = ({ basePath, data, resource }) => (
  <CardActions>
    <DeleteButton basePath={basePath} record={data} resource={resource} />
    <ListButton basePath={basePath} resource={resource}/>
    <RefreshButton />
  </CardActions>
);

export const TermCreate = props => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="title" />
      <LongTextInput source="description" />
    </SimpleForm>
  </Create>
);
