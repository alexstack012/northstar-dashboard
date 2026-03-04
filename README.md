Youve found the README! 

This is a mock dashboard project, since its a mock dashboard im using db.json instead of a persistant DB like SQL or mongo. 
Real world this project would use SQL or Mongo and would hash passwords and secret answers server-side with bcrypt.
however for this we are just going to use some hardcoded strings for demonstation purposes and I used a script
to pre-hash the pw and answer.

For better understanding, this is the idea

Mock Business Concept
Company: “Northstar Workforce Solutions”
Industry: Staffing & Workforce Management
Users: Internal recruiters + operations managers
Problem: Managing job postings, candidates, and placements across multiple client companies.

This uses...

Users, Roles, Multi-tenant structure, Real workflows, Real CRUD complexity, Business logic

---------------------------------------------------------------------------------------------------------------------------------------------------------------------

# NorthstarDashboard

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.1.4.

## Development server

To start a local development server, run:

```bash
ng serve
```

To Start the local DB.json use 
```
npx json-server --watch db.json --port 3001
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
