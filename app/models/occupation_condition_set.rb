# frozen_string_literal: true

class OccupationConditionSet < ApplicationRecord
  audited
  include RansackSearchableFields

  belongs_to :dimension
  tenant_config has_global_records: true, optional: true
  include Tenantable

  tenant_source :dimension

  has_many :occupations_factors, dependent: :destroy
  has_many :campaign_assessments, dependent: :restrict_with_error
  has_many :users_results, dependent: :restrict_with_error

  enum :score_type, { raw: 0, normed: 1 }

  validates :name, presence: true, uniqueness: { scope: :dimension_id }

  before_destroy :check_not_default

  private

  def check_not_default
    return unless Dimension.exists?(id: dimension_id, default_occupation_condition_set_id: id)

    errors.add(:base, 'Cannot delete the default occupation condition set')
    throw :abort
  end
end
