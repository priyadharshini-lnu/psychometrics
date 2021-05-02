# frozen_string_literal: true

module Api
  module V1
    class CampaignSerializer < ActiveModel::Serializer
      attributes :id, :name, :status, :start_date, :end_date, :fixed_time, :duration, :enable_instructions,
                 :instructions, :created_at, :updated_at

      def duration
        object.campaign_options.fixed_time_duration
      end

      def fixed_time
        object.campaign_options.fixed_time
      end

      def enable_instructions
        object.campaign_options.instructions_enabled
      end

      def instructions
        object.campaign_options.instructions
      end
    end
  end
end
