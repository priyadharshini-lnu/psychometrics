# frozen_string_literal: true

class Api::V2::Administration::CampaignAssessmentResource < Api::V2::Administration::BaseResource
  attributes :campaign_id, :caching_enabled, :allow_caching

  has_one :assessment

  ransack_filters %i[workshop_activity_eq campaign_id_eq campaign_assessment_group_id_eq
                     assessment_name_cont assessment_archived_eq assessment_category_not_in]

  def self.records(opts = {})
    ::Api::Administration::CampaignAssessmentPolicy::Scope.new(
      opts[:context][:user], ::CampaignAssessment,
      campaign_id: opts[:context][:campaign].id
    ).resolve.distinct
  end

  def allow_caching
    @model.assessment&.allow_caching? || false
  end
end
