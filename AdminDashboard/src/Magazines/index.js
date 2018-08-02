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
  RefreshButton
} from "react-admin";

import Actions from "./../Utils/actions";

export const MagazineList = props => (
  <List {...props} filters={<MagazineFilter />} actions={<Actions />}>
    <Datagrid>
      <TextField source="id" />
      <TextField source="name" />
      <TextField source="website" />
      <EditButton />
    </Datagrid>
  </List>
);

const MagazineTitle = ({ record }) => {
  return <span>Magazine: {record ? record.name : ""}</span>;
};

const MagazineFilter = props => (
  <Filter {...props}>
    <TextInput label="Search Magazine" source="name" alwaysOn />
  </Filter>
);

export const MagazineEdit = props => (
  <Edit title={<MagazineTitle />} {...props} actions={<MagazineEditActions />}>
    <SimpleForm>
      <DisabledInput source="id" />
      <TextInput source="name" />
      <TextInput source="website" />
    </SimpleForm>
  </Edit>
);

const MagazineEditActions = ({ basePath, data, resource }) => (
  <CardActions>
    <DeleteButton basePath={basePath} record={data} resource={resource} />
    <RefreshButton />
  </CardActions>
);

export const MagazineCreate = props => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="name" />
      <TextInput source="website" />
    </SimpleForm>
  </Create>
);
