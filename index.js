const core = require('@actions/core');
const github = require('@actions/github');
const dedent = require('dedent');

const myToken = core.getInput('github-token');
const octokit = github.getOctokit(myToken)
const approve = core.getInput('approve');
const scRequestedLabledID = core.getInput('requestedLabelID');
const issueID = payload.client_payload.command.resource.id
  
const addCommentMutation = `mutation addComment($issueId: ID!, $commentBody: String!){ 
  addComment(input:{subjectId: $issueId , body: $commentBody}) {
    commentEdge {
      node {
        id
      }
    }
    }
  }`;
  
  const addLabelMutation = `mutation addLabel($issueId: ID!, $labelId: [ID!]!){ 
  addLabelsToLabelable(input:{labelIds:$labelId, labelableId:$issueId}){
    labelable {
      ... on Issue {
        id
      }
    }
  }
}`;

run();


async function run() {

  const feedback = core.getInput('feedback')
  const comment = dedent`
    ${payload.client_payload.data['Early Access Name']} Early Access has been approved for this account. Product has been notified to turn on this Early Access.
    Please add to any feedback to ${feedback} during the Early Access.`

  try {
    const commentVariables = {
      issueId: issueID,
      commentBody: comment,
    }
    const commentResult = await octokit.graphql(addCommentMutation, commentVariables)
    if (!commentResult) {
      core.setFailed('GraphQL request failed')
    } 

  } catch (error) {
    core.setFailed(error.message);
  }
}