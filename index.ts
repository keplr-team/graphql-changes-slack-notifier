#!/usr/bin/env node

import { diff } from "@graphql-inspector/core";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { loadSchema } from "@graphql-tools/load";
import { UrlLoader } from "@graphql-tools/url-loader";
import assert from "assert";
import { notifyWithSlack } from "./inspector";

const main = async () => {
  assert(
    process.argv[2] && process.argv[3] && process.argv[4] && process.argv[5],
    `Syntax: ${process.argv[0]} ${process.argv[1]} "slack webhook url" "location" "before_schema" "after_schema"`
  );

  const before = await loadSchema(process.argv[4], {
    loaders: [new UrlLoader(), new GraphQLFileLoader()],
  });
  const after = await loadSchema(process.argv[5], {
    loaders: [new UrlLoader(), new GraphQLFileLoader()],
  });

  const ch = diff(before, after);

  await notifyWithSlack({
    url: process.argv[2],
    changes: ch,
    location: process.argv[3],
  });
};

main().catch((e) => {
  console.error(e);
  process.exit(-1);
});
