const { request } = require('@octokit/request');

(async () => {
  const projectId = '1'; // カスタムフィールドを追加したいプロジェクトの ID
  const columnName = 'Open Date'; // カスタムフィールドを追加したいカラムの名前
  const issueNumber = process.env.GITHUB_EVENT.issue.number;

  const query1 = `
    query($projectId: ID!, $columnName: String!) {
      repository(owner: ${{ github.repository_owner }}, name: ${{ github.event.repository.name }}) {
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
