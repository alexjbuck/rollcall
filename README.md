# Rollcall

## Overview

Rollcall is an application for managing centrally scheduled events and user attendance to those events. One of the key features is that users can partially attend scheduled events. They do this by marking the days that they can attend. Furthermore, users can mark additional days for attendance that can be queried by admins. 

The overall goals are the following:

1. Reliably get attendance input from all users for all centrally scheduled events.
2. Provide quick visibility to admins as to which users will be in attendance on any given day.
3. Provide users a way to signal extra attendance to admins.

## Login 

You can login by heading to rollcall.vercel.com and sign in using your Google credentials.

## Deployment

This application is deployed to Vercel and uses Supabase SaaS as its backend.

```bash
# TODO: Deployment instructions 
#  hopefully its something like this:
moon :deploy
# Though, it should be done from CI, so its just:
moon ci
#  with appropriate dependencies
```

## Development

### Prerequisites

First, install the proto tool to manage all dev dependencies.

```bash
bash <(curl -fsSL https://moonrepo.dev/install/proto.sh)
```

To clone the repository and install the necessary tools:

```bash
gh repo clone alexjbuck/rollcall
cd rollcall
proto install
```

### Getting Started

### Available Tasks

To view the list of available tasks you can use:

```bash
moon query tasks
```

### Development Workflow

To run the development server:

```bash
moon :dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. Changes are live-updated.

To make a new database migration:

```bash
# This hooks into `supabase migration new`
moon db:migration-new -- <name of migration>
```

This will make a file in `packages > db > supabase > migrations` that you can edit.

To apply the migration you can run:

```bash
# This hooks into `supabase migration up`
moon db:migration-up
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
