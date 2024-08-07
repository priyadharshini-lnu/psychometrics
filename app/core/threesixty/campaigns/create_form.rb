# frozen_string_literal: true

module Threesixty
  module Campaigns
    class CreateForm < Rectify::Form
      attribute :name, String
      attribute :threesixty_type, String
      attribute :campaign_template_id, Integer
      attribute :assessment_id, Integer
      attribute :factors, Array
      attribute :questions, Array
      attribute :status, String, default: 'active'

      validates :name, :threesixty_type, presence: true
      validates :campaign_template_id, presence: true, if: -> { threesixty_type == Threesixty::Campaign::STANDARD_360 }
      validates :assessment_id, presence: true, if: -> { threesixty_type == Threesixty::Campaign::PREVIOUS_360 }
    end
  end
end
