# frozen_string_literal: true

module Dummy
  class Comment < ApplicationRecord
    belongs_to :post
  end
end
