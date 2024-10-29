# prisma-task

Usage:

```sh
yarn install
yarn gen
yarn cli [--path=path/to/data.csv]

> PROJECT name FILTER age > 99;
# │ 0       │ 'Fiona'      │
# │ 1       │ 'Marianna'   │
# │ 2       │ 'Vaughn'     │
# │ 3       │ 'Bryon'      │
# │ 4       │ 'Ocie'       │
# │ 5       │ 'Dannie'     │
# ...
```

Or single query mode:

```sh
yarn cli --query='PROJECT name FILTER age = 99'
```

## Setup

```sh
corepack enable
yarn install
```

## Verification

```sh
yarn build
yarn test
yarn format
yarn lint
```

## The Task

1. Data Loading

   I used a library that can stream data. Values are parsed as strings or
   directly to JS numbers. There's an example of streaming filtering and loading
   in one step in `executeQuery.ts` - it filters and yields matching projected
   rows as the parser loads data.

   In the CLI interface, results are printed as a formatted table, so I skipped
   doing that. It could be added as another output option (e.g. outputting CSV or JSONLines).

2. Query Language and Execution

   I used a RegEx with named groups and validated the matched groups using a
   data validation library (Zod). The advantage of doing that is how simple it
   is, but it's not a extensible system. (I'll explain later in this README what
   further steps could be).

## Questions

1. What were some of the tradeoffs you made when building this and why were
   these acceptable tradeoffs?

   As mentioned above, I used a RegEx instead of defining a grammar and parsing
   it into a syntax tree. It was much quicker to implement, but has some
   disadvantages:

   - It cannot support a more flexible query language - e.g. multiple filters,
     skipping either the PROJECT or FILTER terms, adding more terms (WHERE,
     ORDER, etc).
   - Error messages cannot point to exactly what went wrong.
   - Using Zod as a data validator is handy, but not the most performant way to
     build a parsed query – but the performance of the parsing is not as
     important relative to the filtering in this case.

2. Given more time, what improvements or optimizations would you want to add? When would you add them?

   - I'd build out a proper CLI interface with support for different output
     formats, piping CSV in from stdin, etc.
   - I'd use a library to create a proper parser grammar
   - I'd explore using a library to create a better streaming interface (instead
     of callbacks)
   - I'd like to add more granular error messages in the query parsing

3. What changes are needed to accommodate changes to:

   - support other data types:

     - in `parseQuery.ts` `QueryMatchGroupSchema` - modify the `filterValue`
       operand if we'd like to support different values in the query (the regex
       will have to be widened as well)
     - in `readCSV.ts` `CSVValueSchema` - change this schema to parse different
       literal CSV string to another representation in JS

   - multiple filters:

     This one is relatively simple other than changing the parser - you'd chain
     multiple filters together in `getPredicate`. The existing regex-based
     parser could still be extended to support this.

   - ordering of results:

     I'd keep the existing one-pass filter logic, but insert into a priority
     queue to put it into sorted order as data is filtered, then output the
     entire list.

4. What changes are needed to process extremely large datasets

   Node.js is essentially single-threaded, so while loading IO is generally
   performant, you could only get so far with CPU-bound filtering.

   I'd explore using worker threads to split up the work, but I'd likely be
   looking at native modules (e.g. WASM) for an actual production
   implementation.

   (If this was an actual production task at work, I'd be trying out DuckDB via
   WASM to process something like this, or deferring to SQLite – assuming no
   external databases are involved!).

5. What do you still need to do to make this code production ready?

   - The CLI needs to be built into JS. It's currently run via `tsx`, which
     transpiles on the fly for development
   - GitHub Actions already runs tests, but I'd add tests on all current and LTS
     versions of node (e.g. 18, 20, 22, 23).
