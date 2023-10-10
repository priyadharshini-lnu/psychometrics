# frozen_string_literal: true

class Agile < ApplicationRecord
  audited

  belongs_to :assessment
end
