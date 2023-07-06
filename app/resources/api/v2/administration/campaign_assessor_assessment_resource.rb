# frozen_string_literal: true

class Api::V2::Administration::CampaignAssessorAssessmentResource < Api::V2::Administration::BaseResource
  attributes :assessment_name, :assessment_id, :campaign_id

  has_one :assessment

  delegate :name, :id, to: :assessment, prefix: true, allow_nil: true

  ransack_filters %i[name_cont]

  before_create -> { @model.campaign_id = context[:params]['campaign_id'] }

  def assessment_id
    assessment.id.to_s
  end

  def self.records(opts = {})
    ::Pundit.policy_scope!(opts[:context][:user], [:api, :administration, CampaignAssessorAssessment]).where(
      campaign_id: opts[:context][:params]['campaign_id']
    )
  end
end
