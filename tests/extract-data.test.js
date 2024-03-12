import {describe, it, vi, expect} from "vitest";
import {extractData} from "../extract-data";

describe('Extract data', () => {
  it('returns issue transitions with timestamp, source and destination', async () => {
    const items = [
      {
        field: 'status',
        fromString: 'Backlog',
        toString: 'Ready for Dev',
      },
      {
        field: 'assignee',
      },
    ]
    const jira = {
      searchJira: vi.fn()
        .mockResolvedValueOnce({total: 2})
        .mockResolvedValueOnce({issues: [{key: 'issue #1'}]}),
      getIssueChangelog: vi.fn().mockResolvedValueOnce({
        values: [
          {id: 'transitionId', author: {}, created: '2024-03-12T12:00:00', items }
        ]
      }),
    };

    const data = await extractData({jira});

    expect(data).to.deep.equal([
      {
        issueId: 'issue #1',
        timestamp: '2024-03-12T12:00:00',
        source: 'Backlog',
        destination: 'Ready for Dev',
      }
    ])
  });
});
