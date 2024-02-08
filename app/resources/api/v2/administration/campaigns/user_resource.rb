# frozen_string_literal: true

class Api::V2::Administration::Campaigns::UserResource < Api::V2::Administration::BaseResource
  attributes :id, :name, :email

  has_one :user_profile, foreign_key_on: :related

  ransack_filters %i[search_query]

  def name
    @model.decorate.display_name
  end

  def self.records(opts = {})
    User.with_campaign_user(opts[:context][:params][:campaign_id])
  end
end
