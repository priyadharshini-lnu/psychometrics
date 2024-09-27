# frozen_string_literal: true

module Reports
  class AssessmentSerializer < Panko::Serializer
    attributes :id, :name, :category, :disabled, :created_at, :flow, :norm_rules,
               :dimension_id, :factors, :factor_scoring_counters, :blocks, :factor_benchmark_scores,
               :campaign_factors_list

    def blocks
      blocks = object.blocks.
               selecting do
                 ['blocks.*', coalesce(template.props, props).
                   as('props'), coalesce(template.name, name).as('name')]
               end.
               joining { template.outer }.
               includes(:questions_ams).
               where.has { (template.disabled == false) | (template.id == nil) }

      Panko::ArraySerializer.new(
        blocks,
        each_serializer: BlockSerializer,
        context: {
          piped_text_context: context[:piped_text_context]
        }
      ).to_a
    end

    def factor_benchmark_scores
      return {} unless object.threesixty_campaign

      FactorBenchmarkScore.where(assessment_id: object.id, campaign_id: object.threesixty_campaign.campaign_id).
        pluck(:factor_id, :benchmark_score).to_h
    end

    def factor_scoring_counters
      FactorsScoring.select('count(id) as cache_counter, factor_id').
        where(assessment_id: object.id).
        group(:factor_id).
        index_by(&:factor_id).
        transform_values(&:cache_counter)
    end

    def factors
      if object.saville?
        return SavilleFactor.get_factors(
          object.external_settings[:assessment_id].upcase
        )
      end

      if object.mindmill?
        external_assessment = Settings.providers.mindmill.assessments.detect { |a| a.id == object.mindmill_id }
        return external_assessment.factors.flatten
      end
      if object.hogan?
        external_assessment = Settings.providers.hogan.assessments.
                              detect { |a| a.id == object.external_settings[:assessment_id] }
        return external_assessment.factors.flatten.map(&:to_h)
      end
      []
    end
  end
end
