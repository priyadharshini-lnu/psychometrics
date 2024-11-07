# frozen_string_literal: true

module Api
  module V1
    class CampaignUserSerializer < Panko::Serializer
      attributes :id, :schedule_start_date, :schedule_end_date, :created_at, :updated_at
    end
  end
end
