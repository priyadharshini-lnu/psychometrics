# frozen_string_literal: true

module Dummy
  class Author < ApplicationRecord
    belongs_to :campaign
    has_many :posts

    validates :name, length: { minimum: 2 }, if: -> { name.present? }

    def self.ransackable_attributes(_auth_object = nil)
      %w[id campaign_id]
    end
  end
end
