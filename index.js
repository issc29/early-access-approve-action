const core = require('@actions/core');
const github = require('@actions/github');
const dedent = require('dedent');

const myToken = core.getInput('github-token');
const octokit = github.getOctokit(myToken)
const approvedLabelID = core.getInput('approvedLabelID');
const requestedLabelID = core.getInput('requestedLabelID');
const payload = github.context.payload
const issueID = payload.client_payload.command.resource.id

const functionsLib = require('./functions');
var functions = new functionsLib(octokit, core)

run();

async function run() {
  // Comment on current Issue
  const feedback = core.getInput('feedback')
  const comment = getCurrentIssueComment(payload.client_payload.data, feedback)

  failIfNotApprovedUser()

  try {

    await functions.commentOnIssue(issueID, comment)
    

    // Add / Remove Labels
    await functions.addLabelToIssue(issueID, approvedLabelID) 
    await functions.removeLabelFromIssue(issueID, requestedLabelID) 



    // Comment on Approval Issue
    const issueInfo = await functions.getIssueInfo(issueID)
    const approvalComment = getRequestIssueComment(issueInfo)
    const approvedIssueID = core.getInput('approvedIssueID')
    await functions.commentOnIssue(approvedIssueID, approvalComment)

  } catch (error) {
    core.setFailed(error.message);
  }
}


function getCurrentIssueComment(payloadData, feedback){
  return dedent`${payloadData['Early Access Name']} Early Access has been approved for this account. Product has been notified to turn on this Early Access.
  Please add to any feedback to ${feedback} during the Early Access.`
}

function getRequestIssueComment(issueInfo){
  return dedent`
  - [ ] Early Access Enablement Approved: ${issueInfo.title} #${issueInfo.number}`
}

function failIfNotApprovedUser(){
  if(!isApprovedUser()) {
    core.setFailed("Not an approver!");
  }
}

function isApprovedUser() {
  const userTriggered = github.context.payload.command.user.login
  var approvedUsersString = core.getInput('approvedUsers')
  console.log(approvedUsersString)
  var approvedUsers = approvedUsersString.split(",").map(function(item) {
    return item.trim();
  });

  for (user of approvedUsers){
    if (user == userTriggered) {
      console.log(`${user} : ${userTriggered}`)
      return true
    }
  }

  return false
}