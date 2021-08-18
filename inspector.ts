// from https://github.com/kamilkisiela/graphql-inspector/blob/822edbbca5cfe919c8714dd17f25937ca737dde2/packages/github/src/helpers/utils.ts#L21 (since they are not exported)

import { Change, CriticalityLevel } from "@graphql-inspector/core";
import axios from "axios";
import pluralize from "pluralize";

interface Attachment {
  fallback: string;
  color: string;
  mrkdwn_in: string[];
  author_name: string;
  text: string;
}

export function filterChangesByLevel(level: CriticalityLevel) {
  return (change: Change) => change.criticality.level === level;
}

export function quotesTransformer(msg: string, symbols: string = "**") {
  const findSingleQuotes = /\'([^']+)\'/gim;
  const findDoubleQuotes = /\"([^"]+)\"/gim;

  function transformm(_: string, value: string) {
    return `${symbols}${value}${symbols}`;
  }

  return msg
    .replace(findSingleQuotes, transformm)
    .replace(findDoubleQuotes, transformm);
}

function slackCoderize(msg: string): string {
  return quotesTransformer(msg, "`");
}

export async function notifyWithSlack({
  url,
  changes,
  location,
}: {
  changes: Change[];
  url: string;
  location: string;
}) {
  const totalChanges = changes.length;

  const event = {
    username: "GraphQL Inspector",
    icon_url: "https://graphql-inspector/img/logo-slack.png",
    text: `:male-detective: Hi, there is *${totalChanges} ${pluralize(
      "change",
      totalChanges
    )}* ${location}:`,
    attachments: createAttachments(changes),
  };

  await axios.post(url, event, {
    headers: {
      "content-type": "application/json",
    },
  });
}

function createAttachments(changes: Change[]) {
  const breakingChanges = changes.filter(
    filterChangesByLevel(CriticalityLevel.Breaking)
  );
  const dangerousChanges = changes.filter(
    filterChangesByLevel(CriticalityLevel.Dangerous)
  );
  const safeChanges = changes.filter(
    filterChangesByLevel(CriticalityLevel.NonBreaking)
  );

  const attachments: Attachment[] = [];

  if (breakingChanges.length) {
    attachments.push(
      renderAttachments({
        color: "#E74C3B",
        title: "Breaking changes",
        changes: breakingChanges,
      })
    );
  }

  if (dangerousChanges.length) {
    attachments.push(
      renderAttachments({
        color: "#F0C418",
        title: "Dangerous changes",
        changes: dangerousChanges,
      })
    );
  }

  if (safeChanges.length) {
    attachments.push(
      renderAttachments({
        color: "#23B99A",
        title: "Safe changes",
        changes: safeChanges,
      })
    );
  }

  return attachments;
}

function renderAttachments({
  changes,
  title,
  color,
}: {
  color: string;
  title: string;
  changes: Change[];
}): Attachment {
  const text = changes
    .map((change) => slackCoderize(change.message))
    .join("\n");

  return {
    mrkdwn_in: ["text", "fallback"],
    color,
    author_name: title,
    text,
    fallback: text,
  };
}
