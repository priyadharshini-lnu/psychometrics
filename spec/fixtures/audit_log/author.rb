# frozen_string_literal: true

module Dummy
  class Author < ApplicationRecord
    belongs_to :campaign
    has_many :posts

    validates :name, length: { minimum: 2 }
  end
end
