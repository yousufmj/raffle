import React from "react";
import {
  List,
  Edit,
  Create,
  Show,
  Datagrid,
  TextField,
  EditButton,
  DisabledInput,
  LongTextInput,
  SimpleForm,
  TextInput,
  Filter,
  SimpleShowLayout,
  DateField,
  RichTextField,
  ListButton,
  DateInput,
  NumberField,
  CardActions,
  DeleteButton,
  RefreshButton,
  ReferenceField,
  ReferenceInput,
  AutocompleteInput
} from "react-admin";
import Actions from "./../Utils/actions";

export const CandidateList = props => (
  <List {...props} filters={<CandidateFilter />} actions={<Actions />}>
    <Datagrid>
      <TextField source="id" />
      <TextField source="fullName" label="Name" />
      <TextField source="postcode"/>
      <EditButton />
    </Datagrid>
  </List>
);

const CandidateTitle = ({ record }) => {
  return <span>Candidate: {record ? `${record.fullName}` : ""}</span>;
};

const CandidateFilter = props => (
  <Filter {...props}>
    <TextInput label="Search Name" source="fullName" alwaysOn />
    <TextInput label="Email" source="email" />
    <TextInput label="PostCode" source="postcode" />

  </Filter>
);

export const CandidateEdit = props => (
  <Edit
    title={<CandidateTitle />}
    {...props}
    actions={<CandidateEditActions />}
  >
    <SimpleForm>
      <TextInput source="firstName" />
      <TextInput source="lastName" />
      <TextInput source="email" />
      <TextInput source="address1" />
      <TextInput source="address2" />
      <TextInput source="postcode" />
    </SimpleForm>

  </Edit>
);

const CandidateEditActions = ({ basePath, data, resource }) => (
  <CardActions>
    <DeleteButton basePath={basePath} record={data} resource={resource} />
    <ListButton basePath={basePath} resource={resource}/>
    <RefreshButton />
  </CardActions>
);

export const CandidateCreate = props => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="firstName" />
      <TextInput source="lastName" />
      <TextInput source="email" />
      <TextInput source="address1" />
      <TextInput source="address2" />
      <TextInput source="postcode" />
    </SimpleForm>
  </Create>
);