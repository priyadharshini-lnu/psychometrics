# frozen_string_literal: true

class FactorBenchmarkScore < ApplicationRecord
  belongs_to :factor
  belongs_to :assessment
  belongs_to :campaign
  include Tenantable
end
