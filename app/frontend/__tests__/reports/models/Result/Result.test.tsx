import results from './seeds/results'
import user from './seeds/user'
import filters from './seeds/filters'
import appStoreData from './seeds/app_store_data'
import Result from '~/modules/reports/models/Result'
import AppStore from '~/modules/reports/store/AppStore'
import _ from 'lodash'
import Scoring from '~/modules/reports/models/Scoring'
import store from '~/modules/reports/store'
import schema from '~/modules/reports/store/schema'
import { TopFactorType } from '~/modules/reports/models/Results/interfaces'
import { normalize } from 'normalizr'

beforeAll(() => {
    AppStore.init(appStoreData)
    const normalizedData = normalize(appStoreData, schema)
    store.dispatch({ type: 'report/INIT', data: normalizedData })
});

const FILTER_MANAGERS = '61'
const OTHER = '62'
const IS_NOT_PEER = '63'

test('general state', () => {
    const res = new Result(190)
    res.init(results, user, filters)
    expect(res.user).toStrictEqual(user)
    expect(res.rawResults).toStrictEqual(results)
    expect(res.dimensionId).toStrictEqual(60)
    expect(res.assessmentId).toStrictEqual(190)
})

test('results by filter map', () => {
    const res = new Result(190)
    res.init(results, user, filters)
    expect(_.keys(res.resultsByFilter)).toStrictEqual([FILTER_MANAGERS, OTHER, IS_NOT_PEER, 'individual', 'assessor'])
    expect(res.resultsByFilter[OTHER].rawResults.length).toStrictEqual(1)
    expect(res.resultsByFilter['individual'].rawResults.length).toStrictEqual(1)
    expect(res.resultsByFilter[IS_NOT_PEER].rawResults.length).toStrictEqual(2)
    // for manager filter set `min_required_responses` = 2. It means we have to nullify rawResults
    expect(res.resultsByFilter[FILTER_MANAGERS].rawResults.length).toStrictEqual(0)
})

test('external scoring', () => {
    const res = new Result(190)
    res.init(results, user, filters)
    expect(res.externalScoring).toStrictEqual("Some External Data (2)")
    expect(res.resultsByFilter[OTHER].externalScoring).toStrictEqual("Some External Data (1)")
})

test('data sheet', () => {
    const res = new Result(190)
    res.init(results, user, filters)
    expect(res.dataSheet).toStrictEqual({
        "No.": "3",
        "Position": 3,
        "Full Name": 3,
        "Employee Number": 3,
        "Competency 1 Score": 3
    })
    expect(res.resultsByFilter[OTHER].dataSheet).toStrictEqual({
        "No.": "3",
        "Position": 3,
        "Full Name": 3,
        "Employee Number": 3,
        "Competency 1 Score": 3
    })
    expect(res.groupedDataSheet).toStrictEqual([{
        "No.": "3",
        "Position": 3,
        "Full Name": 3,
        "Employee Number": 3,
        "Competency 1 Score": 3
    }, {}])
})

test('questions', () => {
    const res = new Result(190)
    res.init(results, user, filters)
    expect(res.questions['17379']).toStrictEqual([
        [
            {
                "index": 1,
                "value": true,
                "recode_value": 3
            }
        ],
        [
            {
                "index": 2,
                "value": true,
                "recode_value": 3
            }
        ]
    ])
    expect(res.resultsByFilter[OTHER].questions['17379']).toStrictEqual([
        [
            {
                "index": 1,
                "value": true,
                "recode_value": 3
            }
        ]
    ])
})

test('embedded data', () => {
    const res = new Result(190)
    res.init(results, user, filters)

    expect(res.embeddedData).toStrictEqual({
        a: [{value: 1}, {value: 2}],
        b: [{value: 1}, {value: 2}]
    })

    expect(res.resultsByFilter[OTHER].embeddedData).toStrictEqual({a: [{value: 1}], b: [{value: 1}]})
})

test('users scoring', () => {
    const res = new Result(190)
    res.init(results, user, filters)

    expect(res.usersScoring).toStrictEqual({
        14747: {firstName: 's2', lastName: 's2', email: 's2@gmail.com'},
        14749: {firstName: 'e2', lastName: 'e2', email: 'e2@gmail.com'},
    })
})

test('scoring', () => {
    const res = new Result(190)
    res.init(results, user, filters)

    expect(res.scoring[2335].results[0]).toMatchObject({
        "actualValue": 2.33,
        "value": 2.33,
        "norm": 3,
    })

    expect(res.scoring[2335].results[1]).toMatchObject({
        "actualValue": 4,
        "value": 4,
        "norm": 4,
    })

    expect(res.scoring[2336].results[0]).toMatchObject({
        "actualValue": 3,
        "norm": 4,
        "value": 3,
    })

    expect(res.scoring[2336].results[1]).toMatchObject({
        "actualValue": 4,
        "norm": 3,
        "value": 4,
    })

    expect(res.resultsByFilter[OTHER].scoring[2335].results).toStrictEqual([res.scoring[2335].results[0]])
    expect(res.resultsByFilter[OTHER].scoring[2336].results).toStrictEqual([res.scoring[2336].results[0]])
})


test('question scoring', () => {
    const res = new Result(190)
    res.init(results, user, filters)

    const s1 = res.questionScoring[2335][17420][0]
    const s2 = res.questionScoring[2335][17420][1]
    expect(s1['value']).toStrictEqual([3, 2, 2])
    expect(s2['value']).toStrictEqual([4, 4, 4])
    expect(s1['getValue']()).toStrictEqual(2.3333333333333335)
    expect(s2['getValue']()).toStrictEqual(4)
    expect(res.resultsByFilter[OTHER].questionScoring[2335][17420]).toStrictEqual([s1])
})

test('getByFilter(filterId)', () => {
    const res = new Result(190)
    res.init(results, user, filters)

    expect(res.getByFilter('invalid')).toStrictEqual(res)
    expect(res.getByFilter(OTHER)).toStrictEqual(res.resultsByFilter[OTHER])
})

test('getTopFactors(from, to, factorIds, subfactors)', () => {
    const res = new Result(190)
    res.init(results, user, filters)

    expect(res.getTopFactors(2, 3, [2335, 2336, 2337], TopFactorType.Factor)).toStrictEqual([
        {
            "alias": "Receptive (2)",
            "description": "You may enjoy learning by seeking feedback from others around you. At the same time, in situations where recognition or ongoing support is not available, you will tend to find other ways and means to enhance your learning experience.",
            "icon": "/uploads/factor/icon/2335/2015_AGILE_icons-RECEPTIVE.png",
            "id": 2335,
            "meanNormScore": 3,
            "meanRawScore": 2.33,
            "jobRoles": undefined
        },
        {
            "alias": "Resourceful (2)",
            "description": "You are indifferent towards learning by finding innovative solutions or having a fixed set of pre-defined resources to learn from. You are able to adapt your learning approach depending upon the situation.",
            "icon": "/uploads/factor/icon/2337/2015_AGILE_icons-RESOURCEFUL.png",
            "id": 2337,
            "meanNormScore": 0,
            "meanRawScore": 4,
            "jobRoles": undefined
        }
    ])
    expect(res.getTopFactors(1, 3, [2335, 2336, 2337], TopFactorType.SubFactor)).toStrictEqual([])
})

test('getTopSubFactors(from, to, factorId)', () => {
    const res = new Result(190)
    res.init(results, user, filters)

    expect(res.getTopSubFactors(1, 2, 2342)).toStrictEqual([
        {
            "alias": "2342_sub_1",
            "description": "",
            "icon": null,
            "id": 2379,
            "meanNormScore": 5,
            "meanRawScore": 4,
            "jobRoles": undefined
        },
        {
            "alias": "2342_sub_2",
            "description": "",
            "icon": null,
            "id": 2380,
            "meanNormScore": 2,
            "meanRawScore": 3,
            "jobRoles": undefined
        }
    ])
})

test('getTopFactorByRank(rank)', () => {
    const res = new Result(190)
    res.init(results, user, filters)

    expect(res.getTopFactorByRank(1)).toStrictEqual({
        "alias": "2342_sub_1",
        "description": "",
        "icon": null,
        "id": 2379,
        "meanNormScore": 5,
        "meanRawScore": 4,
        "jobRoles": undefined
    })
})

test('getAverageFactorScore(filterId)', () => {
    const res = new Result(190)
    res.init(results, user, filters)

    const factors = res.getAverageFactorScore(OTHER)
    expect(_.take(factors, 9)).toStrictEqual([
        {
            "avg": 4.5,
            "id": 2343,
            "name": "Logical (2)"
        },
        {
            "avg": 4,
            "id": 2337,
            "name": "Resourceful (2)"
        },
        {
            "avg": 4,
            "id": 2338,
            "name": "Structured (2)"
        },
        {
            "avg": 4,
            "id": 2339,
            "name": "Experiential (2)"
        },
        {
            "avg": 4,
            "id": 2340,
            "name": "Flexible (2)"
        },
        {
            "avg": 4,
            "id": 2379,
            "name": "2342_sub_1"
        },
        {
            "avg": 3,
            "id": 2336,
            "name": "Social (2)"
        },
        {
            "avg": 3,
            "id": 2380,
            "name": "2342_sub_2"
        },
        {
            "avg": 2.33,
            "id": 2335,
            "name": "Receptive (2)"
        }
    ])
})

test('questionScoringWithoutFactors(filterId)', () => {
    const res = new Result(190)
    res.init(results, user, filters)

    const questionScoring = res.questionScoringWithoutFactors(IS_NOT_PEER)
    expect(questionScoring).toStrictEqual({
        "17379": {
            "avg": 4.5,
            "factorName": "Logical (2)",
            "id": "17379",
            "sum": 18,
            "values": [
                6,
                4,
                4,
                4
            ]
        },
        "17381": {
            "avg": 4,
            "factorName": "2342_sub_2",
            "id": "17381",
            "sum": 8,
            "values": [
                3,
                5
            ]
        }
    })
})

test('occupations', () => {
    const res = new Result(190)
    res.init(results, user, filters)

    const [oc1, oc2] = AppStore.occupations[60]
    expect(oc1.name).toStrictEqual("Occupation2")
    expect(oc2.name).toStrictEqual("Occupation1")
    expect(res.getOccupations()).toStrictEqual([oc1, oc2])
})


test('sortedOccupations', () => {
    const res = new Result(190)
    res.init(results, user, filters)

    const [oc1, oc2] = AppStore.sortedOccupations[60]
    expect(oc2.name).toStrictEqual("Occupation2")

    expect(oc1.name).toStrictEqual("Occupation1")
})

test('getOccupationByRank(rank)', () => {
    const res = new Result(190)
    res.init(results, user, filters)

    expect(res.getOccupationByRank(1)).toMatchObject({
        "description": "desc for oc1",
        "factors": [
            {
                "alias": "2342_sub_1",
                "id": 2379,
                "meanRawScore": 4,
                "position": 3
            },
            {
                "alias": "2342_sub_2",
                "id": 2380,
                "meanRawScore": 3,
                "position": 3
            }
        ],
        "id": 109,
        "name": "Occupation1",
        "stars": 0
    })
})

test('getInnovationStyles()', () => {
    const res = new Result(190)
    res.init(results, user, filters)
    const [st1, st2] = res.getInnovationStyles()
    expect(st1).toMatchObject({score: 0, name: 'st1', id: 110, description: 'desc for st1'})
    expect(st2).toMatchObject({score: 0, name: 'st2', id: 109, description: 'desc for st2'})
})

test('getBranchData', () => {
    const res = new Result(190)
    res.init(results, user, filters)

    expect(res.getBranchData(null, 'fakeBranch')).toStrictEqual({})
    expect(res.getBranchData(null, 'scoring')['2335'].results).toStrictEqual([new Scoring({ norm: 3, value: 2.33} ), new Scoring({ norm: 4, value: 4} )])
    expect(res.getBranchData('62', 'fakeBranch')).toStrictEqual({})
    expect(res.getBranchData('62', 'scoring')['2335'].results).toStrictEqual([new Scoring({ norm: 3, value: 2.33} )])
    expect(res.getBranchData('fakeFilter', 'scoring')).toStrictEqual({})
})
