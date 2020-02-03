# frozen_string_literal: true

module Threesixty
  module Campaigns
    class UpdateForm < Rectify::Form
      attribute :name, String
      attribute :status, Integer

      validates :name, :status, presence: true
    end
  end
end
