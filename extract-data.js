const yvo = '5e37d584b341530e62accbb1';
const gege = '712020:3faa6a43-ec4d-40f9-9dff-01d762c7c67c';
const xavier = '5f8d43f26bc6340068bc7aae';
const alex = '6380873100cb2fc3f987c9b1';
const mache = '625694763bf0f0007016df40';
const lionel = '712020:ba07efcf-be6f-4996-a77e-7234e352d3db';
const vincent = '5cff529d1854c30c0132524d';
const baptiste = '712020:025c7d85-14ab-48b5-ab09-6eb2b429a59d';
const alice = '712020:ac7abe82-ce27-49b0-9db4-a88992869c17';

export async function extractData({ jira }) {
  const JQL = `project = PIX
AND "Equipix[Select List (multiple choices)]" 
  IN (Prescription, Cross-team, "Design System")
AND assignee IN 
  (${yvo}, 
  ${gege}, 
  ${xavier}, 
  ${alex}, 
  ${mache}, 
  ${lionel}, 
  ${vincent}, 
  ${baptiste}, 
  ${alice}
  )
AND issuetype 
  NOT IN ( Epic,"Problème en investigation","Sujet en conception") 
AND labels 
  IN (null, EMPTY, Production, Produit, RGPD, Design, Tech, SECURITE, Accessibilité) 
AND "Date of MEP[Date]" != null
AND created >= 2025-01-01 
AND parent not in (PIX-18537, PIX-18540)`;

  let result = await jira.searchJira(JQL, { fields: ['*all'], expand: 'transitions, operations, changelog' });

  const allIssues = [];

  while (result.isLast === false) {
    console.log('Extracting pages...');
    allIssues.push(...result.issues);
    result = await jira.searchJira(JQL, { nextPageToken: result.nextPageToken, fields: ['*all'], expand: 'transitions, operations, changelog' });
  }

  // for the last batch when is last is true
  allIssues.push(...result.issues);

  return await extractIssuesForGivenPage({
    jira,
    allIssues,
  });
}

async function extractIssuesForGivenPage({ jira, allIssues }) {
  const issues = [];
  for (const issue of allIssues) {
    const issueStatusChangelog = await getStatusChangelog({
      issueId: issue.key,
      jira,
    });
    issues.push({
      issueId: issue.key,
      labels: issue.fields.labels,
      changelog: issueStatusChangelog,
    });
  }
  return issues;
}

async function getStatusChangelog({ issueId, jira }) {
  const issueChangelog = await jira.getIssueChangelog(issueId);
  return issueChangelog.values.flatMap(({ created, items }) => {
    return items
      .filter(({ field }) => field === 'status')
      .map(({ fromString, toString }) => {
        return {
          issueId,
          timestamp: created,
          source: fromString,
          destination: toString,
        };
      });
  });
}
