export default {
  HighestLowest: {
    defaultTableColumns: (I18nStore) => {
      const highestLowestCommonColumnsData = {
        highest: {
          label: I18nStore.t('reports.modules.highest_lowest.highest_scores'),
          hide: false,
          allowHide: false,
        },
        lowest: {
          label: I18nStore.t('reports.modules.highest_lowest.lowest_scores'),
          hide: false,
          allowHide: false,
        },
        rank: { label: I18nStore.t('reports.modules.highest_lowest.rank'), hide: false, allowHide: true },
      }

      return ({
        Question: {
          ...highestLowestCommonColumnsData,
          competency: {
            label: I18nStore.t('reports.modules.highest_lowest.scoring_category'),
            hide: false,
            allowHide: true,
          },
          indicator: { label: I18nStore.t('reports.modules.highest_lowest.item'), hide: false, allowHide: true },
        },
        Factor: {
          ...highestLowestCommonColumnsData,
          category: { label: I18nStore.t('reports.modules.highest_lowest.category'), hide: false, allowHide: true },
        },
      })
    },
  },
  GapAssessment: {
    defaultTableColumns: (I18nStore) => {
      const gapAssessmentTableDefaultColumnsDataFactorType = {
        rank: {
          label: I18nStore.t('reports.modules.gap_assessment.rank'),
          hide: false,
          allowHide: true,
        },
        indicator: {
          label: I18nStore.t('reports.modules.gap_assessment.item'),
          hide: false,
          allowHide: true,
        },
        gap: {
          label: I18nStore.t('reports.modules.gap_assessment.gap'),
          hide: false,
          allowHide: true,
        },
        positive_gaps: {
          label: I18nStore.t('reports.modules.gap_assessment.positive_gap'),
          hide: false,
          allowHide: true,
        },
        negative_gaps: {
          label: I18nStore.t('reports.modules.gap_assessment.negative_gap'),
          hide: false,
          allowHide: true,
        },

      }
      return {
        Question: {
          competency: {
            label: I18nStore.t('reports.modules.gap_assessment.scoring_category'),
            hide: false,
            allowHide: true,
          },
          ...gapAssessmentTableDefaultColumnsDataFactorType,
        },
        Factor: { ...gapAssessmentTableDefaultColumnsDataFactorType },
      }
    },
  },
  Competencies: {
    defaultTableColumns: I18nStore => ({
      Question: {
        questions: {
          label: I18nStore.t('reports.modules.single_value_cluster.questions'),
          hide: false,
          allowHide: true,
        },
        developmental_rating: {
          label: I18nStore.t('reports.modules.single_value_cluster.developmental_rating'),
          hide: false,
          allowHide: true,
        },
      },
      Factor: {
        competency: {
          label: I18nStore.t('reports.modules.single_value_cluster.competency'),
          hide: false,
          allowHide: true,
        },
        developmental_rating: {
          label: I18nStore.t('reports.modules.single_value_cluster.developmental_rating'),
          hide: false,
          allowHide: true,
        },
      },
    }),
  },
  ThreeSixtyReportSummary: {
    defaultTableColumns: I18nStore => ({
      relationships: {
        label: I18nStore.t('reports.modules.three_sixty_report_summary.relationships'),
        hide: false,
        allowHide: true,
      },
      invited: {
        label: I18nStore.t('reports.modules.three_sixty_report_summary.invited'),
        hide: false,
        allowHide: true,
      },
      completed: {
        label: I18nStore.t('reports.modules.three_sixty_report_summary.completed'),
        hide: false,
        allowHide: true,
      },
    }),
  },
}
