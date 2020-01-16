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
      validates :campaign_template_id, presence: true, if: -> { type == Threesixty::Campaign::STANDARD_360 }
      validates :assessment_id, presence: true, if: -> { type == Threesixty::Campaign::PREVIOUS_360 }
    end
  end
end
