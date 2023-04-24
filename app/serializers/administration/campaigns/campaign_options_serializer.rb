# frozen_string_literal: true

module Administration
  module Campaigns
    class CampaignOptionsSerializer < ActiveModel::Serializer
      attributes :fixed_time, :time_zone, :fixed_time_duration, :instructions_enabled, :instructions,
                 :proctoring_enabled, :rules, :identification, :description, :integration_type
    end
  end
end
