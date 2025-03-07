# frozen_string_literal: true

class Api::V2::Administration::UserIdpPlanResource < Api::V2::Administration::BaseResource
  attributes :user_id, :idp_template_id, :campaign_id, :active, :creator_id

  has_one :idp_template
end
