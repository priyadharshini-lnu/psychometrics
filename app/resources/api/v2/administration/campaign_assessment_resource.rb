# frozen_string_literal: true

class Api::V2::Administration::CampaignAssessmentResource < Api::V2::Administration::BaseResource
  attributes :campaign_id

  has_one :assessment

  ransack_filters %i[workshop_activity_eq campaign_id_eq]
end
