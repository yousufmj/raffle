import React from 'react';
import {
  List,
  Edit,
  Create,
  Show,
  Datagrid,
  TextField,
  LongTextInput,
  SimpleForm,
  TextInput,
  Filter,
  TabbedShowLayout,
  DateField,
  ListButton,
  DateInput,
  CardActions,
  DeleteButton,
  RefreshButton,
  ReferenceField,
  ReferenceInput,
  AutocompleteInput,
  ShowButton,
  Tab,
  ReferenceManyField
} from 'react-admin';

// Custom imports
import Actions from '../Utils/actions';
import PickWinnerButton from './pickWinnerButton';
import EntriesTab from './entriesTab.jsx';

export const CompetitionList = props => (
  <List {...props} filters={<CompetitionFilter />} actions={<Actions />}>
    <Datagrid>
      <TextField source="id" />
      <TextField source="title" />
      <ReferenceField
        label="Magazine"
        source="magazineID"
        reference="magazines"
      >
        <TextField source="name" />
      </ReferenceField>
      <ShowButton />
    </Datagrid>
  </List>
);

const CompetitionTitle = ({ record }) => {
  return <span>Competition: {record ? `${record.title}` : ''}</span>;
};

const CompetitionFilter = props => (
  <Filter {...props}>
    <TextInput label="Search Title" source="title" alwaysOn />
    <ReferenceInput
      label="Magazine"
      source="magazineID"
      reference="magazines"
      filterToQuery={searchText => ({ name: searchText })}
    >
      <AutocompleteInput optionText={choice => `${choice.name}`} />
    </ReferenceInput>
  </Filter>
);
/**
 *  Edit Competitions
 */
export const CompetitionEdit = props => (
  <Edit
    title={<CompetitionTitle />}
    {...props}
    actions={<CompetitionEditActions />}
  >
    <SimpleForm>
      <TextInput source="title" />
      <LongTextInput source="description" />
      <ReferenceInput
        label="Magazine"
        source="magazineID"
        reference="magazines"
        filterToQuery={searchText => ({ name: searchText })}
      >
        <AutocompleteInput optionText={choice => `${choice.name}`} />
      </ReferenceInput>
      <DateInput label="Start date" source="startDate" />
      <DateInput label="Expiry date" source="expiryDate" />
    </SimpleForm>
  </Edit>
);

const CompetitionEditActions = ({ basePath, data, resource }) => (
  <CardActions>
    <DeleteButton basePath={basePath} record={data} resource={resource} />
    <ListButton />
    <ShowButton basePath={basePath} record={data} resource={resource} />
  </CardActions>
);

const ShowActions = ({ basePath, data, resource }) => (
  <CardActions>
    <PickWinnerButton record={data} />
    <ListButton basePath={basePath} record={data} resource={resource} />
    <RefreshButton record={data} resource={resource} />
    <DeleteButton basePath={basePath} record={data} resource={resource} />
  </CardActions>
);

export const CompetitionCreate = props => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="title" />
      <LongTextInput source="description" />
      <ReferenceInput
        label="Magazine"
        source="magazineID"
        reference="magazines"
        filterToQuery={searchText => ({ name: searchText })}
      >
        <AutocompleteInput optionText={choice => `${choice.name}`} />
      </ReferenceInput>
      <DateInput label="Start date" source="startDate" />
      <DateInput label="Expiry date" source="expiryDate" />
    </SimpleForm>
  </Create>
);

export const CompetitionShow = props => (
  <Show {...props} title={<CompetitionTitle />} actions={<ShowActions />}>
    <TabbedShowLayout>
      <Tab label="Details">
        <TextField source="title" />
        <TextField source="description" />
        <ReferenceField
          label="Magazine"
          source="magazineID"
          reference="magazines"
        >
          <TextField source="name" />
        </ReferenceField>
        <DateField label="Start date" source="startDate" />
        <DateField label="Expiry date" source="expiryDate" />
      </Tab>

      {/*=== Entries ===*/}
      <Tab label="Entries">
        <EntriesTab props={props} />
      </Tab>

      {/* === Winners section === */}
      <Tab label="Winner(s)">
        <ReferenceManyField reference="winners" target="competitionID">
          <Datagrid>
            <TextField label="Name" source="Candidate.fullName" />
          </Datagrid>
        </ReferenceManyField>
      </Tab>
    </TabbedShowLayout>
  </Show>
);
