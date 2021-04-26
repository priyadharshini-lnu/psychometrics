# frozen_string_literal: true

module Administration
  class CampaignAssessmentSerializer < ActiveModel::Serializer
    attributes :id, :assessment_id, :name, :category, :norm_name, :norm_id, :enable_universal_links,
               :universal_link, :norms, :is_external, :assessor_form_name, :assessor_form_id, :permissions

    delegate :id, :name, :category, to: :assessment
    delegate :name, to: :norm, prefix: true, allow_nil: true
    delegate :name, :id, to: :assessor_form, prefix: true, allow_nil: true

    def universal_link
      assessment.decorate.anonym_link_for_campaign(object.campaign) if object.enable_universal_links
    end

    def norms
      assessment.norms.map { |n| NormSerializer.new(n).to_h }
    end

    def is_external # rubocop:disable Naming/PredicateName
      assessment.external?
    end

    def permissions
      GetPermissionsHash.call!(
        Administration::CampaignAssessmentPolicy,
        current_user,
        assessment,
        [
          'import_results',
          'export_raw_results',
          'export_scoring_results',
          'export_raw_factor_scores',
          'export_normed_results',
          'export_external_results',
          'rescore_responses',
          %w[remove destroy]
        ]
      )
    end

    private

    def current_user
      instance_options[:current_user]
    end

    def norm
      object.norm
    end

    def assessor_form
      object.assessor_form
    end

    def assessment
      object.assessment
    end
  end
end
