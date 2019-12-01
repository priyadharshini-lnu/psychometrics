# frozen_string_literal: true

module Threesixty
  module Campaigns
    class CreateForm < Rectify::Form
      attribute :name, String
      attribute :type, String
      attribute :campaign_template_id, Integer
      attribute :assessment_id, Integer
      attribute :factors, Array

      validates :name, :type, presence: true

      validate :check_presence_of_campaign_template_id
      validate :check_presence_of_assessment_id

      def check_presence_of_campaign_template_id
        return unless type == Threesixty::Campaign::STANDARD_360

        errors.add(:campaign_template_id, :blank)
      end

      def check_presence_of_assessment_id
        return unless type == Threesixty::Campaign::PREVIOUS_360

        errors.add(:assessment_id, :blank)
      end
    end
  end
end
