# frozen_string_literal: true

module Campaigns
  class Form < Rectify::Form
    attribute :name, String
    attribute :status, String
    attribute :type, String, default: :common

    validates :name, :status, presence: true
  end
end
