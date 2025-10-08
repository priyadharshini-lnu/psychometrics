class ProjectLicense < ApplicationRecord
  belongs_to :project
  belongs_to :license

  validates :usage_limit, numericality: { greater_than_or_equal_to: 0 }
  validates :used_number, numericality: { greater_than_or_equal_to: 0 }

  scope: enabled, -> { where(enabled: true) }
  scope: disabled, -> { where(enabled: false) }


end
