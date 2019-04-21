export default {
  nominations: [
    {
      title: 'Set up nominations',
      nominations: [
        { id: 1, name: 'Yourself', campaignId: 1 },
        { id: 2, name: 'Namrata Budhraja', campaignId: 1 },
      ],
    },
    {
      title: 'Approve nominations',
      nominations: [
        {
          id: 2, name: 'Namrata Budhraja', approved: true, campaignId: 1,
        },
      ],
    },
  ],
  evaluations: [
    {
      title: 'Evaluations',
      evaluations: [
        { id: 1, name: 'Yourself', campaignId: 1 },
        { id: 2, name: 'Namrata Budhraja', campaignId: 1 },
      ],
    },
    {
      title: 'Approve evaluations',
      evaluations: [
        {
          id: 2, name: 'Namrata Budhraja', completed: true, campaignId: 1,
        },
      ],
    },
  ],
  reports: [
    {
      title: 'Reports',
      users: [
        { name: 'View report' },
        { name: 'Namrata Budhraja' },
      ],
    },
    {
      title: 'Approve reports',
      users: [
        { name: 'Namrata Budhraja', approved: true },
      ],
    },
  ],
}
