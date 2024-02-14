# Cloudflare worker for the QZK

This worker allows submitting and querying events. Events are in one of two states: 'draft' and 'published'.

Everyone can submit draft events, but only authorized users can publish them. Currently, credentials are
hard-coded variables stored as Cloudflare Secrets.

- Run `pnpm run dev` in your terminal to start a development server
- Open a browser tab at <http://localhost:8787> to see your worker in action
- Run `pnpm run deploy` to publish your worker

Learn more at <https://developers.cloudflare.com/workers>.
