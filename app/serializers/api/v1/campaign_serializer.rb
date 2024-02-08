# frozen_string_literal: true

module Api
  module V1
    class CampaignSerializer < Panko::Serializer
      attributes :id, :name, :status, :start_date, :end_date, :fixed_time, :duration, :enable_instructions,
                 :instructions, :created_at, :updated_at, :description

      delegate :fixed_time, :instructions, :description,  to: :campaign_options

      def duration
        object.campaign_options.fixed_time_duration
      end

      def enable_instructions
        object.campaign_options.instructions_enabled
      end

      private

      def campaign_options
        object.campaign_options
      end
    end
  end
end
