# frozen_string_literal: true

module Dummy
  class Post < ApplicationRecord
    belongs_to :author
    has_many :comments
  end
end
