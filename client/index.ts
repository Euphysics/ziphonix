import { hc } from 'hono/client';

import type { AppType } from '@/index';

const app = hc<AppType>('http://localhost:3000');

void (async () => {
  // const result = await app.api.register.$post({
  //   json: {
  //     name: 'John Doe',
  //     email: 'example@example.com',
  //     password: 'Password123',
  //     provider: 'CREDENTIAL',
  //   },
  // });
  // if (result.ok) {
  //   const data = await result.json();
  //   console.log(data);
  // } else {
  //   console.error(result.status);
  // }
  const login = await app.api.login.$post({
    json: {
      email: 'example@example.com',
      password: 'Password123',
      provider: 'CREDENTIAL',
    },
  });
  if (login.ok) {
    const data = await login.json();
    console.log(data);
  }
  // const result = await app.api.account.profile[':id'].$get({
  //   param: {
  //     id: '0fcaa130-7b89-4a5b-9780-53beca9e780',
  //   },
  // });
  // if (result.ok) {
  //   const data = await result.json();
  //   console.log(data);
  // } else {
  //   console.error(result.status);
  // }
})();
