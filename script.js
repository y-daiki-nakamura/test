const { request } = require('@octokit/request');

(async () => {
  const projectId = '1'; // カスタムフィールドを追加したいプロジェクトの ID
  const columnName = 'OpenDate'; // カスタムフィールドを追加したいカラムの名前
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

  const mutationQuery = `
    mutation($columnId: ID!, $issueId: ID!, $note: String!) {
      updateProjectCard(input: { projectCardId: $issueId, note: $note }) {
        projectCard {
          id
        }
      }
    }
  `;

  const note = `Open Date: ${new Date().toISOString()}`; // 作成日時を取得してカスタムフィールドの値として設定

  const response2 = await request('POST /graphql', {
    headers: {
      authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      accept: 'application/vnd.github.inertia-preview+json',
    },
    query: mutationQuery,
    columnId,
    issueId: issueNumber,
    note,
  });

  console.log('Custom field updated:', response2.updateProjectCard.projectCard.id);
})();
