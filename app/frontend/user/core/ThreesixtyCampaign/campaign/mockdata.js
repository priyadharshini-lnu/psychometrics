export default {
  id: 11,
  nominations: [
    {
      title: 'Set up nominations',
      nominations: [
        { id: 1, name: 'Yourself', campaignId: 11 },
        { id: 2, name: 'Namrata Budhraja', campaignId: 11 },
      ],
    },
    {
      title: 'Approve nominations',
      nominations: [
        {
          id: 2, name: 'Namrata Budhraja', approved: true, campaignId: 11,
        },
      ],
    },
  ],
  evaluations: [
    {
      title: 'Evaluations',
      evaluations: [
        { id: 1, name: 'Yourself', campaignId: 11 },
        { id: 2, name: 'Namrata Budhraja', campaignId: 11 },
      ],
    },
    {
      title: 'Approve evaluations',
      evaluations: [
        {
          id: 2, name: 'Namrata Budhraja', completed: true, campaignId: 11,
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
