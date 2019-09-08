# frozen_string_literal: true

class FactorsAlias < ApplicationRecord
  belongs_to :factor
  belongs_to :report
  validates :name, presence: true

  before_validation :set_default_name, on: :create

  private

  def set_default_name
    self.name ||= factor.name
  end
end
