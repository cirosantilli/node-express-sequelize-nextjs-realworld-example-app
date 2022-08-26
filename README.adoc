= Node.js + Express.js + Sequelize + SQLite/PostgreSQL + Next.js fullstack static/SSR/SSG/ISG Example Realworld App
:idprefix:
:idseparator: -
:sectanchors:
:sectlinks:
:sectnumlevels: 6
:sectnums:
:toc: macro
:toclevels: 6
:toc-title:

This is an implementation of https://github.com/gothinkster/realworld

Got it running on Heroku as of April 2021 at https://cirosantilli-realworld-next.herokuapp.com/[]. On August 2022, heroku announced the end of free tiers as of November 28, 2022: https://blog.heroku.com/next-chapter[], so it might go down, I don't think I'll pay 10 dollars/month to keep it going. Here's an archive: https://web.archive.org/web/20220826111459/https://cirosantilli-realworld-next.herokuapp.com/[]. More discussion at:

* https://github.com/cirosantilli/node-express-sequelize-nextjs-realworld-example-app/issues/23
* https://github.com/gothinkster/realworld/discussions/974

This implementaion includes <<database-migrations>>, <<test-js,DB and API unit testing>>, <<generate-demo-data,DB seeding>>, and <<linting>> setups.

This is a branch of https://github.com/cirosantilli/node-express-sequelize-realworld-example-app rebased on top of the `master` branch of that repository, we show it in a separate GitHub repository just to give it more visibility.

Ideally we would like to have both demos on the same tree as they share all backend code, but Next.js and NPM impose too many restrictions which we don't have the time to work around.

The frontend part of this repository is a fork of https://github.com/reck1ess/next-realworld-example-app/tree/66003772a42bf71c7b2771119121d4c9cf4b07d4 which was SSR-only via API, not pure SSR/SSG/ISG.

We decided to merge the frontend it in-tree with the API rather than keep it a separate submodule because the fullstack implementation means that the barrier between front-end and back-end becomes is quite blurred, e.g. "front-end" files under `/pages` also contain functions with direct backend database access without going through the API.

Both Next.js and the backend API run on the same Express.js server via a https://nextjs.org/docs/advanced-features/custom-server[Next.js custom server], which is basically what you always want for a sane deployment.

The app is by default ISR. We started doing a bit of SSR as well under <<SSR version>> but didn't to very far. Ideally, we would want to implement both for every page, and then benchmark them.

In ISR, user-specific information such as "do I follow this article or not" is fetched by the client after it receives the user-agnostic statically generated page. The client then patches that page with this new user-specific information. This is what you would want do on a real world app, so that things that are common to all users can be cached across all users, and user-specifics are patced on later via a potentially slower API call. See also: <<what-works-with-javascript-turned-off>>.

The design goals of this repository are similar to https://dev.to/givehug/next-js-apollo-client-and-server-on-a-single-express-app-55l6 except that we are trying to implement the Realworld App :-) GraphQL would be ideal, but its need is greatly diminished by SSR, which essentially leads to a manual ad-hoc implementation of GraphQL for each page.

This repository is a baseline for the more realworld/advanced/specialized:

* https://github.com/cirosantilli/ourbigbook/tree/master/web
* https://ourbigbook.com
* https://cirosantilli.com/ourbigbook-com

We are trying to port back any problems that are noticed in that repository here, but sometimes we got lazy, and that repo has been getting more code cleanups in general. Also, some features will only be present there because of our constraint of not diverging from the Realworld spec here. Notably that repository contains:

* signup email verification: https://docs.ourbigbook.com/#ourbigbook-web-email-sending
* reCAPTCHA signup protection: https://docs.ourbigbook.com/#ourbigbook-web-recaptcha-setup

toc::[]

== Local development with SQLite

....
npm install
npm run dev
....

You can now visit http://localhost:3000[] to view the website. Both API and pages are served from that single server.

You might also want to generate some test data as mentioned at: <<generate-demo-data>>.

The SQLite database is located at `db.sqlite3`.

The Node.js and NPM versions this was tested with are specified at link:package.json[] `engines:` entry, which is what the <<heroku-deployment>> uses https://devcenter.heroku.com/articles/nodejs-support#specifying-a-node-js-version[as mentioned here]. You should of course try to use those exact versions for reproducibility. The best way to install a custom node and NPM version is to use NVM as mentioned here: https://stackoverflow.com/questions/16898001/how-to-install-a-specific-version-of-node-on-ubuntu/47376491#47376491[].

== Local optimized frontend

....
npm install
npm run build-dev
npm run start-dev
....

If you make any changes to the code, at least code under `/pages` for sure, you have to rebuild before they take effect in this mode, as Next.js appears to also run server-only code such as `getStaticPaths` from one of the webpack bundles.

Running `next build` is one very important test of the code, as it builds many of the most important pages of the website, and runs checks such as TypeScript type checking. You should basically run it after every single commit that touches the frontend.

If you look into what `npm run start-dev` does in the `package.json`, you will see the following environment variables, which are custom to this project and not defined by Next.js itself:

* `NEXT_PUBLIC_NODE_ENV=development`: sets everything to be development by default.
+
If this variable not given, `NODE_ENV` is used instead.
+
Just like `NODE_ENV`, this variable affects the following aspects of the application:
+
** if the Next.js server will run in development or production mode. From the Next.js CLI, this determination is done with `next dev` vs `next start`. But we use a custom server where both dev and prod are run from `./app`, and so we determine that from environment variables.
** if the database will be SQLite (default development DB) or PostgreSQL (default production DB)
** in browser effects, e.g. turns off Google Analytics
+
We cannot use `NODE_ENV` here directly as we would like because and Next.js forces `process.env.NODE_ENV` to match the server's dev vs production mode. But we want a production mode server, and no Google analytics in this case.
* `NODE_ENV_NEXT_SERVER_ONLY=production`: determines is the Next.js server will run in development or production mode.
+
This variable only affects the Next.js server dev vs prod aspect of the application, and not any other aspects such as the database used and in browser effects such as having Google Analytics or not.
+
If given, this variable overrides all others in making that determination, including `NEXT_PUBLIC_NODE_ENV`. If not given, `NODE_ENV` is used as usual.
+
If this variable is not given, `NEXT_PUBLIC_NODE_ENV` is given instead.

=== Local run as identical to deployment as possible

Here we use PostgreSQL instead of SQLite with the prebuilt static frontend. Note that optimized frontend is also used on the SQLite setup described at <<local-optimized-frontend>>).

For when you really need to debug some deployment stuff locally

Setup:

....
sudo apt install postgresql

# Become able to run psql command without sudo.
sudo -u postgres createuser -s "$(whoami)"
createdb "$(whoami)"

createdb realworld_next
psql -c "CREATE ROLE realworld_next_user with login password 'a'"
psql -c 'GRANT ALL PRIVILEGES ON DATABASE realworld_next TO realworld_next_user'
echo "SECRET=$(tr -dc A-Za-z0-9 </dev/urandom | head -c 256)" >> .env
....

Run:

....
npm run build-prod
npm run start-prod
....

then visit the running website at: http://localhost:3000/

To <<generate-demo-data>> for this instance run:

....
npm run seed-prod
....

=== Development run in PostgreSQL

If you want to debug a PostgreSQL specific issue interactively on the browser, you can run a development Next.js server on PostgreSQL.

This is similar to <<local-run-as-identical-to-deployment-as-possible>>, but running the development server is more convenient for development as you won't have to `npmr run build-prod` on every frontend change.

First setup the PostgreSQL database as in <<local-run-as-identical-to-deployment-as-possible>>.

Then start the server with:

....
npm run dev-pg
....

To run other database related commands on PostgreSQL you can export the `REALWORLD_PG=true` environment variable manually as in:

....
REALWORLD_PG=true ./bin/sync-db.js
REALWORLD_PG=true ./bin/generate-demo-data.js
....

If you need to inspect the database manually you can use:

....
psql realworld_next
....

== Heroku deployment

The setup is analogous to: https://github.com/cirosantilli/node-express-sequelize-realworld-example-app#heroku-deployment but instead of `heroku git:remote -a cirosantilli-realworld-express` you should use:

....
git remote add heroku-next https://git.heroku.com/cirosantilli-realworld-next.git
./heroku.sh addons:create --app cirosantilli-realworld-next heroku-postgresql:hobby-dev
./heroku.sh config:set --app cirosantilli-realworld-next SECRET="$(tr -dc A-Za-z0-9 </dev/urandom | head -c 256)"
# Optional. If set, enables demo mode. We must use the NEXT_PUBLIC_* prefix for the variable name,
# otherwise it is not visible in the page renders.
./heroku.sh config:set --app cirosantilli-realworld-next NEXT_PUBLIC_DEMO=true
....

This is done because this repository is normally developed as a branch of that one, which would lead to a conflicting name for the branch `heroku`.

Additionally, before deploying, you must also make sure that you can run the PostgreSQL tests by setting PG up as shown at: <<local-run-as-identical-to-deployment-as-possible>>. This is because before deployment we always run the tests to ensure that nothing broke. And running the tests in PostgreSQL is particularly crucial, because since Sequelize is not stellar, sometimes things work in SQLite but fail in PostgreSQL.

Then, to deploy the latest commit run:

....
npm run deploy
....

This also pushes the code to GitHub on success, and markes the deployed commit with the `deploy` branch on GitHub, to mark clearly the deployed commit clearly in case local development moves ahead of the deployed commit a bit.

You then have to add `--app cirosantilli-realworld-next` to any raw `heroku` commands to allow Heroku to differentiate between them, e.g.:

....
./heroku.sh run --app cirosantilli-realworld-next bash
....

for which we have the helper:

....
./heroku.sh run bash
....

e.g. to delete, recreate and reseed the database:

....
./heroku.sh run bin/generate-demo-data.js --force-production
....

We are not sure if Next.js ISR can be deployed reliably due to the ephemeral filesystem such as those in Heroku...: https://stackoverflow.com/questions/67684780/how-to-set-where-the-prerendered-html-of-new-pages-generated-at-runtime-is-store but it has worked so far.

=== `devDependencies` vs `dependencies`

Note that any dependencies required only for the build e.g. typescript are put under `devDependencies`.

Our current <<heroku-deployment>> setup installs both `dependencies` and `devDependencies`, builds, and then removes `devDependencies` from the deployed code to make it smaller.

=== Demo mode

Activated with `NEXT_PUBLID_DEMO=true` or:

....
npm run dev-demo
....

This has the following effects:

* block posts with tags given at `blacklistTags` of `config.js` The initial motivation for this was to block automated "Cypress Automation" spam that is likely setup by some bastard on all published implementations via the backend, example: https://archive.ph/wip/n4Jlx[], and might be taking up a good part of our Heroku dynos, to be confirmed.
+
We've logged their IP as 31.183.168.37, let's see if it changes with time. That IP is from Poland, which is consistent with Google Analytics results, which are overwhelmingly from Poland, suggesting a bot within that country, which also does GET on the web UI.
* whenever a new object is created, such as article, comment or user, if we already have 1000 objects of that type, delete the oldest object of that type, so as to keep the database size limited. TODO implement for Tags, Follows and Likes.
* "Source code for this website" banner on top with link to this repository
* clearer tags input message "Press Enter, Tab or Comma to add a tag"

=== Heroku instance management

Get a PostgreSQL shell:

....
./heroku.sh psql
....

or run a one-off Postgres query:

....
./heroku.sh psql -c 'SELECT * FROM "User"'
....

DELETE ALL DATA IN THE DATABASE and <<generate-demo-data>> inside Heroku:

....
./heroku.sh run bash
....

and then run in that shell:

....
bin/generate-demo-data.js --force-production
....

or you can do it in one go with:

....
./heroku.sh run bin/generate-demo-data.js --force-production
....

We have to run `heroku run bash` instead of `heroku ps:exec` because the second command does not set `DATABASE_URL`:

* https://stackoverflow.com/questions/62502951/heroku-env-variables-database-url-and-port-not-showing-in-dyno-heroku-psexec/68050303#68050303
* https://stackoverflow.com/questions/48119289/how-to-get-environment-variables-in-live-heroku-dyno/64951959#64951959
* https://www.reddit.com/r/rails/comments/ejljxj/how_to_seed_a_postgres_production_database_on/

Edit a file in Heroku to debug that you are trying to run manually, e.g. by adding print commands, uses https://github.com/hakash/termit[] minimal https://en.wikipedia.org/wiki/GNU_nano[nano]-like text editor:

....
./heroku.sh ps:exec
termit app.js
....

== ISR vs SSR

ISR is an optimization that aims to:

* reduce load times
* reduce server load

Like all optimizations, it makes things more complex, so you really have to benchmark things to see if you need them.

As mentioned at: <<ssr-version>>, this is one of the main goals of this website.

The main complexity increase of ISR is that you have to worry about React `usEffect` chains of events after the initial page load, which can be very hard to debug.

With ISR, we want article contents and user pages to load instantly from a prerendered cache, as if the user were logged out.

Only after that will login-specific details be filled in by client JavaScript requests to the backend API, e.g. "have I starred/favorited this article or not".

This could lead to amazing article text loading performance, since this is the same for all users and can be efficiently cached.

The downside of that is that the user could see a two stage approach which is annoying, especially if there is no clear indication (first download, then wait, then if updates with personal details). This could be made even better by caching things client side, and `userSWR` which we already using likely makes that transparent, so there is hope. Even more amazing would be if it could cache across requests, e.g. from index page to an article! One day, one day, maybe with GraphQL.

Another big ISR limitation is that you can't force a one-off immediate page update after the user edits a post, a manual refresh is generally needed: https://github.com/vercel/next.js/discussions/25677[]. However, this is not noticeable in this website, because in order to show login-specific information, we are already re-fetching the data from the API after every single request, so after a moment it gets updated to the latest version.

Our organizational principle is that all logged-in API data will be fetched from the toplevel element of each page. It will have the exact same form as the static rendering props, which come directly from the database during build rather than indirectly the API.

This data will correspond exactly to the static prerendered data, but with the user logged in. It will then simply replace the static rendered logged out version, and trigger a re-render.

This approach feels simple enough that it could even be automated in a framework manner. One day, one day.

It is true that the pass-down approach goes a bit against the philosophy of `useSWR`, but there isn't much we can do, e.g. `/` fetches all articles with `/api/articles`, and determines favorite states of multiple posts. Therefore, we if hardcoded `useSWR` for the article under `FavoriteArticleButton`, that would fetch the states from each article separately `/api/articles/[slug]`. We want that to happen on single article inspection however.

=== SSR version

We are slowly building an SSR version of the website under the `/ssr` prefix. E.g. `/ssr` will be a SSR version of the ISR at `/`, `/ssr/login` of `/login`, and so on.

The most noticeable thing in SSR is if you open the DevTools that there are no `GET` requests to the `/api` after the page loads, except where we are forced to do them by the terrible design of Realworld not having separate URLs for pagination and some tabs.

You will also never see the loading spinner. The page will just load all at once in one go.

This will allows us to very directly compare if there are any noticeable user experience differences.

TODO It would also be amazing to test server overload with this, but that is harder. One day.

=== No flickering and automatic updates

Our general ISR philosophy is: the only flickering or automatic page update allowed is from loading spinner to the final data.

New data can only ever happen if the user presses F5.

We do have one exception though: the front page, as it would be too confusing for users to not see their newly created post there. An update might happen on that page therefore.

This is the kind of thing that suggests that SSR is generally what you want for index/find pages.

== What works with JavaScript turned off

Due to ISR/SSR, <<single-url-with-multiple-pages,all pages of the website that have distinct URLs>>, which includes e.g. articles and profiles but not "Your Feed" vs "Global Feed, look exactly the same with and without JavaScript for a logged out user.

For the pages without distinct URLs, we don't know how to do this, the only way we can do it is by fetching the API with JavaScript.

SSR would require `<a href` elements to send custom headers, so that URLs won't be changed, which is impossible:

* https://stackoverflow.com/questions/15835783/adding-http-request-header-to-a-a-href-link
* https://stackoverflow.com/questions/374885/can-i-change-the-headers-of-the-http-request-sent-by-the-browser
* https://softwareengineering.stackexchange.com/questions/250602/why-doesnt-the-html-dom-specification-allow-hyperlinks-to-set-an-accept-header

SSG would, in addition to the previous, require specific Next.js support for the above.

You can turn JavaScript off easily on Chromium with this extension: https://github.com/maximelebreton/quick-javascript-switcher which adds the shortcut Alt + Shift + Q to toggle JavaScript.

== TODO

=== Single URL with multiple pages

We don't know how to have multiple pages under a single URL in Next.js nicely. This is needed for tab navigation e.g. under `/` "Your Feed" vs "Global Feed" vs tag search, and for pagination:

* https://stackoverflow.com/questions/62628685/static-pagination-in-nextjs
* https://stackoverflow.com/questions/65471275/material-ui-tabs-with-nextjs

Such "multi page with a single URL" website design makes it impossible to access such pages without JavaScript, which is one of the main points of Next.js for.

Our implementation works around this by just fetching from the API and rendering, like a regular non-Next React app would, and this is the only way we know how to do it.

We do however render the default view of each page in a way that will work without JavaScript, e.g. the default page 0 of the global index. But then if you try and e.g. click the pagination buttons they won't do anything.

Global discussion at: https://github.com/gothinkster/realworld/issues/691

=== Personal user data in `/user/settings`

`reck1ess` was using a mixture of SSR and client side redirects.

If you tried to access `/user/settings` directly e.g. by pasting it on the browser, it would redirect you to home even if you were logged in, and the server showed an error message:

....
Error: No router instance found.
You should only use "next/router" inside the client side of your app.
....

We patched to avoid that.

However, we are still currently just using data from the `localStorage`. This is bad because if the user changes details on another device, the data will be stale.

Also this is a very specific case of personal user data, so it doesn't reflect the more general case of data that is not in `localStorage`.

Instead, we should handle `/user/settings` from Next.js server side, notably check JWT token there and 401 if not logged in.

=== TODO security

Use a markdown sanitizer, the `marked` library `sanitize` option was deprecated.

== Known divergences

We aim to make this website look exactly like https://github.com/gothinkster/angular-realworld-example-app/tree/9e8c49514ee874e5e0bbfe53ffdba7d2fd0af36f pixel by pixel which we call "our reference implementation, and have the exact same DOM tree as much as possible, although that is hard because Angular adds a gazillion of fake nodes to the DOM it seems.

We test this by running this front/backend, and then also running angular in another browser tab. We then switch between browser tabs quickly back and forth which allows us to see even very small divergences on the UI.

Some known divergences:

* reference shows "Your Feed" for logged out user, click leads to login. This just feels wrong, not done anywhere else.
* https://github.com/gothinkster/angular-realworld-example-app/issues/202 "No articles are here... yet" clearly broken on Angular
* `reck1ess` had implmented pagination really well with limits and previous/first/next/last, it would be a shame to revert that: https://github.com/gothinkster/realworld/issues/684

Error messages due to API failures are too inconsistent across implementations to determine what is the correct behaviour, e.g. if you patch:

....
--- a/api/articles.js
+++ b/api/articles.js
@@ -104,6 +104,7 @@ router.get('/', auth.optional, async function(req, res, next) {

 router.get('/feed', auth.required, async function(req, res, next) {
   try {
+    asdf
     let limit = 20
     let offset = 0
     if (typeof req.query.limit !== 'undefined') {
....

* reference: shows "Loading articles..." forever, does not inform user about error
* https://github.com/gothinkster/react-redux-realworld-example-app just throws an exception

== Database migrations

Database migrations are illustrated under link:[migrations].

Any pending migrations are done automatically during deployment as part of `npm run build`, more precisely they are run from link:[bin/sync-db.js].

We also have a custom setup where, if the database is not initialized, we first:

* just creates the database from the latest model descriptions
* manually fill in the `SequelizeMeta` migration tracking table with all available migrations to tell sequelize that all migrations have been done up to this point

This is something that should be merged into sequelize itself, or at least asked on Stack Overflow, but lazy now.

=== Debugging migrations

If a migration appears wrong, a good way to retry it after modifying the file under `migrations` is this oneliner:

....
git add migrations && git commit -an && git checkout HEAD~ && bin/generate-demo-data.js && git checkout - && ./bin/sync-db.js
....

== Bugs

https://github.com/reck1ess/next-realworld-example-app[] has several UI bugs/missing functionality, some notable ones:

* https://github.com/reck1ess/next-realworld-example-app/issues/22 Your Feed not working. We fixed it at d98637bb10af2bb111f0f2a6ccc72c1de6c8f351.

The implementation of `reck1ess/next-realworld-example-app` felt a bit quirky in a few senses:

* usage of `useSWR` even for data that can be already pre-rendered by Next.js such are articles. Presumably this is to give some kind of pool based realtime support? Or maybe it is just part of a workaround for the problem described at <<single-url-with-multiple-pages>>. But that is not what other implementations do, and neither should we. We don't want data to update by surprise under a user's feet.
* uses custom https://github.com/emotion-js/emotion[emotion-js] CSS in addition to the global http://demo.productionready.io/main.css[], which is also required since not everything was migrated to emotion.
+
We later completely removed motion from this repository.
+
And also has a global `style.css`.
+
While this is good to illustrate that library, it also means that a lot of reimplementation is needed, and it is hard to be accurate at times.
+
And if it were to use emotion, it should be emotion only, without the global CSS. Instead, that repo uses both, sometimes specifying the same CSS multiple times in two ways.
+
It is also very annoying that they used separated defined components rather than in-tree emotion CSS which can be done as:
+
....
<div css={css`
  font-weight: 300;
`}>
....
+
which leads to a much easier to read DOM tree, and less identifiers flying everywhere.
+
It must be said that the port to emotion was made in a way that closely mimicks the original class/CSS structure. But still, it is just too much work, and mistakes popped up inevitably.

These are all points that we have or would like to address in this fork.

== Alternatives

* https://github.com/lifeiscontent/realworld[]: Rails backend is a downside, as it adds another language to the mix besides JavaScript. But it has graphql, which is really really awesome technology.

== Keyboard shortcuts

Ctrl + Enter submits articles.

== Debugging

=== Step debugging

For the backend, add `debugger;` to the point of interest, and run as:

....
npm run back-inspect
....

On the debugger, do a `c` to continue so that the server will start running (impossible to skip automatically: https://stackoverflow.com/questions/16420374/how-to-disable-in-the-node-debugger-break-on-first-line[]), and then trigger your event of interest from the browser:

....
npm run front
....

=== VERBOSE environment variable

If you run as:

....
VERBOSE=1 npm run dev
....

this enables the following extra logs:

* a log line for every request done

=== Log database queries done

....
DEBUG='sequelize:sql:*' npm run start-prod
....

=== Generate demo data

Note that this will first erase any data present in the database:

....
./bin/generate-demo-data.js
....

You can then login with users such as:

* `user0@mail.com`
* `user1@mail.com`

and password `asdf`.

Test data size can be configured with CLI parameters, e.g.:

....
./bin/generate-demo-data.js --n-users 5 --n-articles-per-user 8 --n-follows-per-user 3
....

If you just want to truncate the database with empty data use:

....
./bin/generate-demo-data.js --empty
....

=== Prevent the browser from opening automatically

In case you've broken things so bad that the very first GET blows up the website and further requests don't respond https://stackoverflow.com/questions/61927814/how-to-disable-open-browser-in-cra

....
BROWSER=none npm run dev
....

This gives you time to setup e.g. Network recording in Chrome Developer Tools to be able to understand what is going on.

=== Sequelize sometimes does not show the full stack trace

This is a big problem during development, not sure how to solve it: https://github.com/sequelize/sequelize/issues/8199#issuecomment-863943835

== Linting

The following lint checks are run automatically as part of:

....
npm run build-dev
....

from <<local-optimized-frontend>>, but it can be good to isolate the command to speed up the development loop.

Run typescript type checks:

....
npm run tsc
....

Run eslint checks:

....
npm run lint
....

These lint checks include both:

* https://github.com/prettier/prettier[prettier] checks, which do style checking. Since it is just style checks, any problems with those can be fixed automatically by prettier's auto-refactoring functionality with:
+
....
npm run format
....
* more functional checks, including important checks such as those provided by eslint-config-react-hooks  as opposed to more functional thing 

Rationale for some rules we've disabled:

* `@next/next/no-img-element`: Next insist that you whitelist servers, which is only possible if we implement profile picture upload: https://github.com/cirosantilli/node-express-sequelize-nextjs-realworld-example-app/issues/16 We will actually do this at some point.
* `import/no-anonymous-default-export`: what's the point??? It just duplicates module names as pointed in comments. https://stackoverflow.com/questions/64729264/how-can-i-get-rid-of-the-warning-import-no-anonymous-default-export-in-react

== Testing

When running:

....
NODE_ENV=test npm run dev
....

the server runs on a temporary in-memory database when using the default SQLite database.

It has no effect on <<development-run-in-postgresql,PostreSQL>>, as we don't know of any reasonable alternatives unfortunately. We could grant a create database privilege to our PostgreSQL test user... but Sequelize does not seem to support database creation there: https://stackoverflow.com/questions/31294562/sequelize-create-database/32212001[].

One implication of this is that it is not currently possible to run <<test-js>> in parallel mode for PostgreSQL.

=== test.js

Our tests are all located inside link:test.js[].

They can be run with:

....
npm test
....

Run just a single test:

....
npm test -- -g 'substring of test title'
....

Show all queries done in the tests:

....
DEBUG='sequelize:sql:*' npm run test
....

To run those tests on PostgreSQL intead, first setup as in <<local-run-as-identical-to-deployment-as-possible>>, and then:

....
npm run test-pg
....

Note that this will erase all data present in the database used. In order to point to a custom database use:

....
DATABASE_URL_TEST=postgres://realworld_next_user:a@localhost:5432/realworld_next_test npm run test-pg
....

We don't use `DATABASE_URL` when running tests as a safegard to reduce the likelyhood of accidentaly nuking the production database.

The tests include two broad classes of tests:

* API tests: launch the server on a random port, and run API commands, thus testing the entire backend. These are similar to the <<realworld-api-tests>>, but don't require postman JSON insanity, and start and close a clean server for every single test
* smaller unit tests that only call certain functions directly
* TODO: frontend tests: https://github.com/cirosantilli/node-express-sequelize-nextjs-realworld-example-app/issues/11

==== Next.js tests

By default <<test-js>> does not run any tests on Next.js, only on the API routes, because Next.js would make tests too slow:

* Next.js startup is slow
* we must run in production mode because development mode is too lenient, e.g. it does not raise 500 errors. Therefore we have to build before every run.

To also run tests that hit Next.js run:

....
npm run test-next
....

or for Postgres:

....
npm run test-pg-next
....

=== Realworld API tests

These tests are part of https://github.com/gothinkster/realworld which we track here as a submodule.

Test test method uses Postman, but we feel that it is not a very good way to do the testing, as it uses JSON formats everywhere with embedded JavaScript, presumably to be edited in some dedicated editor like Jupyter does. It would be much better to just have a pure JavaScript setup instead.

They test the JSON REST API without the frontend.

First start the backend server in a terminal:

....
npm run back-test
....

`npm run back-test` will make our server use a clean one-off in-memory database instead of using the default in-disk development `./db.sqlite3` as done for `npm run back`.

Then on another terminal:

....
npm run test-api
....

Run a single test called `Register` instead:

....
npm run test-api -- --folder Register
....

TODO: many tests depend on previous steps, notably register. But we weren't able to make it run just given specific tests e.g. with:

....
npmr test-api -- --folder 'Register' --folder 'Login and Remember Token' --folder 'Create Article'
....

only the last `--folder` is used. Some threads say that multiple ones can be used in newer Newman, but even after updating it to latest v5 we couldn't get it to work: 

* https://stackoverflow.com/questions/60057009/how-to-run-single-request-from-the-collection-in-newman
* https://stackoverflow.com/questions/52519415/how-to-read-two-folder-with-newman

== Authentication

As specified by Realworld, we use JWT authentication.

This can happen in two ways:

* `Authentication` header ("standard JWT"): sent to the API routes. Immune to XSS. Stored in https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage[window.localStorage]. Requires JavaScript.
* a cookie that contains a copy of the JWT, used only on safe HTTP methods, notably GET.
+
The goal of the cookie auth is allow true SSR, and reduce complexity (`useEffect` debugging hell). This way, on every page load Next.js immediately sees that the user is logged in, and `getServerSideProps` is able to return the appropriate page rendered for that specific user by reading the cookie in the request headers. Note that is not possible in ISR.

Because cookies are used exclusively for safe methods, we don't need to worry about implementing the https://security.stackexchange.com/questions/8264/why-is-the-same-origin-policy-so-important/72569#72569[synchronizer token pattern].

Currently the login page requires JavaScript, so you can only login with JavaScript. But at some point we could enable a non-JavaScript method for that login, which would allow users to view logged-in-only pages too without JavaScript. They just won't be able to use any non-safe methods. But meh, non-JavaScript is for bots.

== Benchmarks

Methodology:

* time after click event https://stackoverflow.com/questions/67750849/how-to-filter-by-event-type-in-chrome-devtools-profile-tab-e-g-to-see-mouse-cli/67750850#67750850 up until new page renders, not considering any images on the new page, just text
* caches warmed by clicking all pages involved just before the experiment
* hardware: Lenovo ThinkPad P51
* browser: Chromium 91

== Anti-spam

That website has no signup verification mechanism, users can just spam it at will via API.

However, until someone decides to spam nonstop 24/7 to the point of actually preventing other users from viewing their own posts, it doesn't matter that much. Remember that in <<demo-mode>> we limit the ammount of articles and comments, so unless we implement further restrictions, a spammer could easily replace all data with their own.

Some things we could do include:

* log IPs. Started doing that at https://github.com/cirosantilli/node-express-sequelize-nextjs-realworld-example-app/commit/f2ee0bea8c081fbd6bb42052a15ed55f3909ab3f on account creation. The only way to check IPs currently is through direct database access on:
+
....
./heroku.sh psql
....
+
e.g.:
+
....
./heroku.sh psql -c 'SELECT username, email, ip, "createdAt" FROM "User" WHERE ip IS NOT NULL ORDER BY ip ASC, "createdAt" ASC'
....
+
or maybe to find potential bots by IPs with most accounts:
+
....
./heroku.sh psql -c 'SELECT ip, COUNT(ip) FROM "User" WHERE ip IS NOT NULL GROUP BY ip ORDER BY COUNT(ip) DESC, ip ASC'
....
+
Of course, IP checks can be overcome with Tor, and blocking IPs is really messy because you can take down entire institutions.
* captcha for signup. Captcha for post creation would be too annoying. This would immediatly block any bots, but not manual spammers.
+
hcapcha looks decent: https://docs.hcaptcha.com/[]. We have to make a request from our server to theirs to verify user login.
* limit number of articles and comments per user. So spammers would need to create new accounts, and therefore redo captchas. 25 posts per account feels like enough.

Some spam events:

* 2021-12-22 https://archive.ph/EVcUw spammed a bunch of pro Chinese government messages, see also: https://github.com/cirosantilli/china-dictatorship and https://cirosantilli.com/china-dictatorship/backlinks
+
Did a bit of updating with `./heroku.sh psql`:
+
....
./heroku.sh psql -c "UPDATE \"Tag\" SET name = REPLACE(name, '', '六四事件法轮功新疆再教育營')"
....

== Optimization

Implementing something something without any efficiency considerations is one thing.

Implementing it with efficiency is another.

We tried a bit to achieve the following, TODOing where we know we failed:

* minimize API calls to the minimum. It can be easy to make multiple unecessary API calls with React if don't have a clue what you are doing, especially while waiting to decide if we are logged in or not, which must be done from `useEffect`: https://stackoverflow.com/questions/54819721/next-js-access-localstorage-before-rendering-page/68136224#68136224[]. We often have to differentiate between: "we are logged off" and "we don't know our logged in status yet". 
* minimize database calls, notably use single JOINs wherever possible, especially on the index page where lots of articles are brought in. This is hard in part due to the inflexibility of sequelize, some notes at: https://github.com/cirosantilli/node-express-sequelize-nextjs-realworld-example-app/issues/5
*

== Directory structure

* <<database-migrations>> related:
** link:[bin/sync-db.js]
** link:[migrations]
* <<testing>> related:
** link:test.js[]: <<test-js>>
* link:front/[]: files that are safe to import from the frontend, all requires from inside `front/` should also be inside `front/` see: https://stackoverflow.com/questions/64926174/module-not-found-cant-resolve-fs-in-next-js-application/70363153#70363153 As mentioned there, everything that is usable in the frontend is also usable in the backend since we are an SSR setup. But not the other way around. `pages/` can contain a mixture of frontend and backend in each file however when HoCs are not being used and things don't blow up.
** link:back/[]: this directory contains the backend corresponding to pages in link:front[], e.g. link:back/ArticlePage[] contains the `getStaticPaths` and `getStaticProps` that correspond to link:front/ArticlePage[]. Other backend-only files are in general placed anywhere outside of the link:front/[] directory.

== Backlinks

A very large source of traffic to the website has been from Ukraine-based Mate Academy: https://uk.mate.academy/ | https://github.com/mate-academy/conduit-node-express-sequelize-nextjs which seems to use it as one of their webdev tutorial examples. Glad it has been of use to someone, hope their war ends soon...
