import React from 'react';
import { Admin, Resource } from 'react-admin';
import dataProvider from './Providers/dataProvider';
import config from './config';

// ---- admin sections---
import Dashboard from './Dashboard/index';
import { MagazineList, MagazineCreate, MagazineEdit } from './Magazines';
import {
  CompetitionList,
  CompetitionCreate,
  CompetitionEdit,
  CompetitionShow
} from './Competitions';
import { EntryList, EntryShow, EntryCreate } from './Entries';
import { CandidateList, CandidateEdit } from './Candidates';
import { TermList, TermEdit, TermCreate } from './Terms';
import { WinnerList } from './Competitions/winners';

import authProvider from './Providers/authProvider';

const App = () => (
  <Admin
    title="Competition Handler"
    dashboard={Dashboard}
    dataProvider={dataProvider(config.api_url)}
    authProvider={authProvider}
  >
    <Resource
      name="magazines"
      list={MagazineList}
      create={MagazineCreate}
      edit={MagazineEdit}
    />

    <Resource
      name="competitions"
      list={CompetitionList}
      create={CompetitionCreate}
      edit={CompetitionEdit}
      show={CompetitionShow}
    />

    <Resource
      name="candidates"
      options={{ label: 'Registered Candidates' }}
      list={CandidateList}
      edit={CandidateEdit}
    />

    <Resource
      name="entries"
      list={EntryList}
      create={EntryCreate}
      show={EntryShow}
    />

    <Resource
      name="terms"
      options={{ label: 'Terms & Conditions' }}
      list={TermList}
      create={TermCreate}
      edit={TermEdit}
    />

    <Resource name="winners" />
  </Admin>
);

export default App;
