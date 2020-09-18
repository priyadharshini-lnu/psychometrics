# frozen_string_literal: true

module Administration
  module Campaigns
    class CampaignOptionsSerializer < ActiveModel::Serializer
      attributes :fixed_time, :time_zone, :fixed_time_duration, :instructions
    end
  end
end
