module Api
  module V1
    module Campaigns
      class DuplicateForm < Rectify::Form
        attribute :name, String
        validates :name, presence: true
      end
    end
  end
end
