# frozen_string_literal: true

module Api
  module V1
    module Campaigns
      class ValidateForm < Rectify::Form
        attribute :existing_record, String
        attribute :id, Integer
        attribute :active, Boolean

        validates :existing_record, inclusion: { in: %w[add_with_existing_response add_and_allow_new_response] }
        validates :id, presence: true
        validates_inclusion_of :active, in: [true, false]
      end
    end
  end
end
