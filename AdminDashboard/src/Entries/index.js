import React from 'react';
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
  AutocompleteInput,
  SelectInput,
  ShowButton
} from 'react-admin';
import Actions from './../Utils/actions';

export const EntryList = props => (
  <List {...props} filters={<EntryFilter />} actions={<Actions />}>
    <Datagrid>
      <TextField source="id" />

      <ReferenceField
        label="Full Name"
        source="candidateID"
        reference="candidates"
      >
        <TextField source="fullName" label="Name" />
      </ReferenceField>

      <ReferenceField
        label="Competition"
        source="competitionID"
        reference="competitions"
      >
        <TextField source="title" />
      </ReferenceField>
      <ShowButton />
    </Datagrid>
  </List>
);

const EntryTitle = ({ record }) => {
  return <span>Entry: {record ? `${record.title}` : ''}</span>;
};

const EntryFilter = props => (
  <Filter {...props}>
    <ReferenceInput
      label="Competition"
      source="competitionID"
      reference="competitions"
      filterToQuery={searchText => ({ title: searchText })}
    >
      <AutocompleteInput optionText={choice => `${choice.title}`} alwaysOn />
    </ReferenceInput>
  </Filter>
);

export const EntryEdit = props => (
  <Edit title={<EntryTitle />} {...props} actions={<EntryEditActions />}>
    <SimpleForm>
      <DisabledInput source="id" />
      <TextField source="firstName" />
      <TextField source="lastName" />
      <TextField source="address1" />
      <TextField source="address2" />
      <TextField source="postcode" />
      <TextField source="email" type="email" />
      <ReferenceInput
        label="Competition"
        source="competitionID"
        reference="competitions"
        filterToQuery={searchText => ({ title: searchText })}
      >
        <AutocompleteInput optionText={choice => `${choice.title}`} />
      </ReferenceInput>
      <SelectInput
        source="entryMethod"
        choices={[
          { id: 'online', name: 'Online' },
          { id: 'phone', name: 'Phone' },
          { id: 'mail', name: 'Mail' }
        ]}
      />
    </SimpleForm>
  </Edit>
);

const EntryEditActions = ({ basePath, data, resource }) => (
  <CardActions>
    <DeleteButton basePath={basePath} record={data} resource={resource} />
    <ListButton />
    <RefreshButton />
  </CardActions>
);

/**
 * Create a new entry
 */
export const EntryCreate = props => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="firstName" />
      <TextInput source="lastName" />
      <TextInput source="address1" />
      <TextInput source="address2" />
      <TextInput source="postcode" />
      <TextInput source="email" type="email" />
      <ReferenceInput
        label="Competition"
        source="competitionID"
        reference="competitions"
        filterToQuery={searchText => ({ title: searchText })}
      >
        <AutocompleteInput optionText={choice => `${choice.title}`} />
      </ReferenceInput>
      <SelectInput
        source="entryMethod"
        choices={[
          { id: 'online', name: 'Online' },
          { id: 'phone', name: 'Phone' },
          { id: 'mail', name: 'Mail' }
        ]}
      />
      {/* <ReferenceInput label="Terms Agreed to" source="termID" reference="terms">
        <SelectInput optionText="title" />
    </ReferenceInput> */}
    </SimpleForm>
  </Create>
);

export const EntryShow = props => (
  <Show {...props}>
    <SimpleShowLayout>
      <TextField source="id" />

      <ReferenceField label="Name" source="candidateID" reference="candidates">
        <TextField source="fullName" />
      </ReferenceField>

      <ReferenceField label="Email" source="candidateID" reference="candidates">
        <TextField source="email" type="email" />
      </ReferenceField>

      <ReferenceField
        label="Address Line 1"
        source="candidateID"
        reference="candidates"
      >
        <TextField source="address1" />
      </ReferenceField>

      <ReferenceField
        label="Address Line 2"
        source="candidateID"
        reference="candidates"
      >
        <TextField source="address2" />
      </ReferenceField>

      <ReferenceField
        label="PostCode"
        source="candidateID"
        reference="candidates"
      >
        <TextField source="postcode" />
      </ReferenceField>

      <ReferenceField
        label="Competition"
        source="competitionID"
        reference="competitions"
      >
        <TextField source="title" />
      </ReferenceField>
      <TextField source="entryMethod" />
    </SimpleShowLayout>
  </Show>
);
