# frozen_string_literal: true

module Assigns
  class AdditionalTimeForm < Rectify::Form
    attribute :additional_time, Integer

    validates :additional_time, presence: true, numericality: { greater_than: 0 }
  end
end
