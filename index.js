const core = require('@actions/core');
const github = require('@actions/github');
const dedent = require('dedent');

const myToken = core.getInput('github-token');
const octokit = github.getOctokit(myToken)
const approvedLabelID = core.getInput('approvedLabelID');
const requestedLabelID = core.getInput('requestedLabelID');
const issueID = payload.client_payload.command.resource.id

const functionsLib = require('./functions');
var functions = new functionsLib(octokit, core)

run();

async function run() {
  // Comment on current Issue
  const feedback = core.getInput('feedback')
  const comment = dedent`
    ${payload.client_payload.data['Early Access Name']} Early Access has been approved for this account. Product has been notified to turn on this Early Access.
    Please add to any feedback to ${feedback} during the Early Access.`

  try {

    await functions.commentOnIssue(issueID, comment)
    

    // Add / Remove Labels
    await functions.addLabelToIssue(issueID, approvedLabelID) 
    await functions.removeLabelFromIssue(issueID, requestedLabelID) 



    // Comment on Approval Issue
    const issueInfo = await functions.getIssueInfo(issueID)
    const approvalComment = dedent`
    - [ ] Early Access Approved to be Enabled: ${issueInfo.title} #${issueInfo.number}`
    await functions.commentOnIssue(issueID, approvalComment)

  } catch (error) {
    core.setFailed(error.message);
  }
}


function getCurrentIssueComment(payloadData){
  return dedent`
    Early Access Name: ${payloadData['Early Access Name']}
    * Is this an existing customer or prospect? ${payloadData['Briefed of Functionality?']}
    * [Prospect] Have they been briefed on the functionality of Security Center today? ${payloadData['Existing GHAS Customer?']}
    * [Prospect] Is Security Center critical to the success of the POC? ${payloadData['Critical to POC?']}
    * [Prospect] Comments: ${payloadData['Comments']}
    
    Next steps: Needs approval by @niroshan or @issc29`
}

function getRequestIssueComment(issueInfo){
  return dedent`
    New Early Access Request: ${issueInfo.title} #${issueInfo.number}`
}
