# frozen_string_literal: true

module Campaigns
  module TextModuleOverrides
    class CreateForm < Rectify::Form
      attribute :user_report_id, Integer
      attribute :module_id, Integer
      attribute :content, String
      attribute :editor_id, Integer
      attribute :approved, Boolean, default: false

      validates :module_id, :user_report_id, presence: true
    end
  end
end
