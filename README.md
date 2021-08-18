# graphql-changes-slack-notifier

Notify changes to a GraphQL schema on slack in a format similar to the
[GraphQL Inspector GitHub app's](https://graphql-inspector.com/docs/essentials/notifications#notifications-on-slack)

## Syntax

`npx @keplr/graphql-changes-slack-notifier slack_webhook_url message schema_before schema_after`

Where :

- `slack_webhook_url`: An URL for a slack app
- `schema_before` and `schema_after`: An URL to a graphql endpoint or a local file ending in .graphql