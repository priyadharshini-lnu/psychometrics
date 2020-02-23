import Filter from 'libs/reports/models/Filter'

export default [
  new Filter({
    "id": 62,
    "name": "other",
    "conditions": [
      {
        "type": "RelationShip",
        "props": {
          "predicate": "IsNot",
          "value": "Manager"
        }
      }
    ],
    "assessment_id": 190,
    "min_required_responses": 0
  }),
  new Filter({
    "id": 63,
    "name": "all",
    "conditions": [
      {
        "type": "RelationShip",
        "props": {
          "predicate": "IsNot",
          "value": "Peer"
        }
      }
    ],
    "assessment_id": 190,
    "min_required_responses": 0
  }),
  new Filter({
    "id": 61,
    "name": "Managers",
    "conditions": [
      {
        "type": "RelationShip",
        "props": {
          "predicate": "Is",
          "value": "Manager"
        }
      }
    ],
    "assessment_id": 190,
    "min_required_responses": 2
  })
]
