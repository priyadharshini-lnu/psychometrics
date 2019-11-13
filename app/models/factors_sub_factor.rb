# frozen_string_literal: true

class FactorsSubFactor < ApplicationRecord
  belongs_to :sub_factor, class_name: 'Factor'
  belongs_to :factor
end
