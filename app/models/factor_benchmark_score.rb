# frozen_string_literal: true

class FactorBenchmarkScore < ApplicationRecord
  belongs_to :factor
  belongs_to :assesmsent
  belongs_to :campaign
end
