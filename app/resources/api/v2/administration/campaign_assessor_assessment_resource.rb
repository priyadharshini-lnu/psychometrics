# frozen_string_literal: true

class Api::V2::Administration::CampaignAssessorAssessmentResource < Api::V2::Administration::BaseResource
  attributes :assessment_name, :assessment_id, :campaign_id, :linked_assessment_name, :allow_multiple_responses,
             :campaign_assessment_group_name, :campaign_assessment_group_id, :created_at, :owner,
             :dimension_id, :tenant_id

  has_one :assessment
  has_many :factors
  has_one :tenant

  delegate :name, :id, to: :assessment, prefix: true, allow_nil: true
  delegate :name, :id, to: :linked_assessment, prefix: true, allow_nil: true
  delegate :linked_assessment, to: :assessment

  ransack_filters %i[name_cont]

  before_create -> { @model.campaign_id = context[:params]['campaign_id'] }

  def self.updatable_fields(_)
    %i[allow_multiple_responses campaign_assessment_group_id]
  end

  def owner
    return unless @model.assessment&.owner

    { id: @model.assessment.owner.id, name: @model.assessment.owner.name }
  end

  def dimension_id
    assessment&.dimension_id
  end

  def tenant_id
    assessment&.tenant_id
  end

  def campaign_assessment_group_name
    @model.campaign_assessment_group&.name
  end

  def assessment_id # rubocop:disable Lint/DuplicateMethods
    assessment.id.to_s
  end

  def self.records(opts = {})
    ::Pundit.policy_scope!(opts[:context][:user], [:api, :administration, CampaignAssessorAssessment]).where(
      campaign_id: opts[:context][:params]['campaign_id']
    ).includes(assessment: :owner)
  end
end
