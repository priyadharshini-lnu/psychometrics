# frozen_string_literal: true

class Api::V2::Administration::CampaignAssessmentGroupResource < Api::V2::Administration::BaseResource
  attributes :name

  ransack_filters %i[group_type_eq]

  def self.records(opts = {})
    ::Api::Administration::CampaignAssessmentGroupPolicy::Scope.new(
      opts[:context][:user],
      ::CampaignAssessmentGroup,
      campaign_id: opts[:context][:campaign].id
    ).resolve.distinct
  end
end
