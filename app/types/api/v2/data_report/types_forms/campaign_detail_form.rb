# frozen_string_literal: true

module Api::V2::DataReport
  module TypesForms
    class CampaignDetailForm < BaseForm
      attribute :field_name

      validates :field_name, presence: true
    end
  end
end
