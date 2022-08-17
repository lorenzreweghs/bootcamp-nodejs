// eslint-disable-next-line import/no-extraneous-dependencies
import 'dotenv/config';

import createServer from './server';

const PORT = process.env.PORT || 3000;

const app = createServer();

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
