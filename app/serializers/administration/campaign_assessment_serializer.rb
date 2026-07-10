# frozen_string_literal: true

module Administration
  class CampaignAssessmentSerializer < Panko::Serializer
    attributes :id, :assessment_id, :name, :category, :norm_name, :norm_id, :enable_universal_links,
               :universal_link, :norms, :is_external, :assessor_form_name, :permissions,
               :has_external_norm, :available_locales, :all_locales, :external_config, :campaign_assessment_id,
               :prework, :workshop_activity, :workshop_activity_duration, :allow_multiple_responses,
               :require_scheduling, :auto_assign, :mettl_schedule_name, :mettl_schedule_record_id, :dimension_id,
               :simulation_content_variations, :pearson_variations, :caching_enabled, :allow_caching, :mhs_norm_regions,
               :mhs_norm_options, :proctoring_enabled, :is_timed, :fixed_time_duration,
               :occupation_condition_set_id, :occupation_condition_set_name, :dimension_has_occupations,
               :occupation_condition_sets

    delegate :id, :name, :dimension_id, :category, to: :assessment
    delegate :name, :id, to: :linked_assessment, prefix: true, allow_nil: true

    def is_timed
      !!assessment.fixed_timed?
    end

    def fixed_time_duration
      assessment.extra&.[]('timer').to_i if assessment.fixed_timed?
    end

    def occupation_condition_set_name
      object.occupation_condition_set&.name
    end

    def dimension_has_occupations
      assessment.dimension&.occupations_enabled? || false
    end

    def occupation_condition_sets
      return [] unless assessment.dimension&.occupations_enabled?

      assessment.dimension.occupation_condition_sets.map { |cs| { id: cs.id, name: cs.name } }
    end

    def campaign_assessment_id
      object.id
    end

    def all_locales
      return object.assessment.agile.translations.keys if assessment.agile?
      return simulation_settings.possible_languages if assessment.simulation?

      [object.assessment.default_language] + ::Translation.available_translation_for_assessment(assessment.id)
    end

    def universal_link
      assessment.decorate.anonym_link_for_campaign(object.campaign) if object.assessment_key
    end

    def norms
      return assessment.external_norms if assessment.has_external_norm?

      assessment.norms.map { |n| NormSerializer.new.serialize(n) }
    end

    def simulation_content_variations
      return [] unless assessment.simulation?

      assessment.simulation_settings&.content_variations || []
    end

    def pearson_variations
      return [] unless assessment.pearson?

      assessment.pearson_variations&.map { |v| v.to_h.except(:configuration, :default) }
    end

    def mhs_norm_regions
      return [] unless assessment.mhs?

      assessment.mhs_settings&.norm_regions || []
    end

    def mhs_norm_options
      return [] unless assessment.mhs?

      assessment.mhs_settings&.norm_options || []
    end

    def external_config
      object.external_config || {}
    end

    def has_external_norm
      assessment.has_external_norm?
    end

    def is_external
      assessment.external?
    end

    def mettl_schedule_name
      mettl_schedule_record&.schedule_name
    end

    def mettl_schedule_record_id
      mettl_schedule_record&.id&.to_s
    end

    def permissions
      GetPermissionsHash.call!(
        Administration::CampaignAssessmentPolicy,
        current_user,
        object,
        [
          'import_results',
          %w[import_external_scoring import_external_scoring_results],
          'export_raw_results',
          'export_scoring_results',
          'export_raw_factor_scores',
          'export_ai_factor_scores',
          'export_normed_results',
          'export_external_results',
          'export_occupations',
          'rescore_responses',
          'rescore_ai_responses',
          'regenerate_transcriptions',
          'update_external_config',
          %w[remove destroy],
          'schedule_assessment',
          'toggle_auto_assign',
          'update_mettl_schedule',
          'normalize_factor_scores',
          'update_content_variation',
          'update_available_locales',
          'update_pearson_variation',
          'update_mhs_confidence_interval',
          'update_mhs_leadership_bar',
          'update_mhs_norm_region',
          'update_mhs_norm_option',
          'toggle_require_scheduling',
          'update_prework',
          'update_occupation_condition_set',
          'toggle_caching'
        ],
        {
          project_id: context[:project_id],
          campaign_id: context[:campaign_id]
        }
      )
    end

    def assessor_form_name
      object.assessment.linked_assessor_form&.name
    end

    def caching_enabled
      object.caching_enabled?
    end

    def allow_caching
      object.assessment.allow_caching?
    end

    private

    def current_user
      context[:current_user]
    end

    def norm
      object.norm
    end

    def assessment
      object.assessment
    end

    def mettl_schedule_record
      return nil if object.mettl_schedule_record.blank?

      object.mettl_schedule_record&.parent_or_self
    end

    def simulation_settings
      Settings.providers.simulation.assessments.find do |a|
        a.id == assessment.external_settings['assessment_id']
      end
    end
  end
end
