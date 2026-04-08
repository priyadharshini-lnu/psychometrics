# frozen_string_literal: true

module Reports
  class AssessmentSerializer < Panko::Serializer
    attributes :id, :name, :category, :disabled, :created_at, :flow, :norm_rules,
               :dimension_id, :factors, :factor_scoring_counters, :blocks, :factor_benchmark_scores,
               :campaign_factors_list, :skill_rater

    def blocks
      template_table = Block.arel_table.alias('templates_blocks')
      blocks_table = Block.arel_table

      coalesce_props = Arel::Nodes::NamedFunction.new('COALESCE',
                                                      [template_table[:props], blocks_table[:props]]).as('props')
      coalesce_name = Arel::Nodes::NamedFunction.new('COALESCE',
                                                     [template_table[:name], blocks_table[:name]]).as('name')

      template_not_disabled = template_table[:disabled].eq(false)
      template_not_present = template_table[:id].eq(nil)

      blocks = object.blocks.
               left_outer_joins(:template).
               select('blocks.*', coalesce_props, coalesce_name).
               includes(:questions_ams).
               where(template_not_disabled.or(template_not_present))

      Panko::ArraySerializer.new(
        blocks,
        each_serializer: BlockSerializer,
        context: {
          piped_text_context: context[:piped_text_context],
          locale: context[:locale],
          default_language: object.default_language,
          translations_migrated: object.translations_migrated?,
          translations: translations,
          campaign_user: context[:campaign_user]
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

      if object.hogan?
        external_assessment = Settings.providers.hogan.assessments.
                              detect { |a| a.id == object.external_settings[:assessment_id] }
        return external_assessment.factors.flatten.map(&:to_h)
      end
      []
    end

    def skill_rater
      object.skill_rater?
    end

    def locale
      context[:locale]
    end

    def translations
      @translations = ::Translation.to_hash_for_assessment(id, locale,
                                                           translations_migrated: object.translations_migrated?)
    end
  end
end
