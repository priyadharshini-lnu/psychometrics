# frozen_string_literal: true

class ProductReport < ApplicationRecord
  belongs_to :product
  belongs_to :report
end
