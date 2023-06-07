const { request } = require('@octokit/request');

(async () => {
  const projectId = '1'; // カスタムフィールドを追加したいプロジェクトの ID
  const columnName = 'Open Date'; // カスタムフィールドを追加したいカラムの名前
  const issueNumber = process.env.GITHUB_EVENT_ISSUE_NUMBER;

  const query1 = `
    query($projectId: ID!, $columnName: String!, $owner: String!, $repo: String!) {
      repository(owner: $owner, name: $repo) {
        project(number: $projectId) {
          column(name: $columnName) {
            id
          }
        }
      }
    }
  `;

  const response1 = await request('POST /graphql', {
    headers: {
      authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      accept: 'application/vnd.github.inertia-preview+json',
    },
    query: query1,
    projectId,
    columnName,
    owner: process.env.GITHUB_REPOSITORY_OWNER,
    repo: process.env.GITHUB_REPOSITORY,
  });

  const columnId = response1.repository.project.column.id;

  const query2 = `
    mutation($columnId: ID!, $contentId: ID!, $contentType: ProjectCardContentType!) {
      createProjectCard(input: { projectColumnId: $columnId, contentId: $contentId, contentType: $contentType }) {
        cardEdge {
          node {
            id
          }
        }
      }
    }
  `;

  const response2 = await request('POST /graphql', {
    headers: {
      authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      accept: 'application/vnd.github.inertia-preview+json',
    },
    query: query2,
    columnId,
    contentId: issueNumber,
    contentType: 'ISSUE',
  });

  console.log('Card created:', response2.createProjectCard.cardEdge.node.id);
})();
