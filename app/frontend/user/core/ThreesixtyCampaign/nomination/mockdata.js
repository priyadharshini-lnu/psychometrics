export default {
  subject: { name: 'Yourself' },
  evaluators: {
    customer: {
      title: 'Customer',
      condition: 'At least 1',
      subjects: [],
    },
    directReport: {
      title: 'Direct Report',
      condition: 'At least 2',
      subjects: [{
        id: 1,
        name: 'Casper Hammer',
        status: 'need_approval',
        role: 'directReport',
      }, {
        id: 2,
        name: 'Prasanjit Serkar',
        status: 'need_approval',
        role: 'directReport',
      }, {
        id: 3,
        name: 'Yara Mirdad',
        status: 'need_approval',
        role: 'directReport',
      }],
    },
    manager: {
      title: 'Manager',
      condition: 'At least 1',
      subjects: [{
        id: 4,
        name: 'Casper Hammer',
        status: 'approved',
        role: 'manager',
      }, {
        id: 5,
        name: 'Prasanjit Serkar',
        status: 'approved',
        role: 'manager',
      }],
    },
    peer: {
      title: 'Peer',
      condition: 'At least 2',
      subjects: [],
    },
  },
}
