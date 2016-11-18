class Translation < ApplicationRecord
  belongs_to :translateable, polymorphic: true
  belongs_to :resource, polymorphic: true

  validates :locale, presence: true
  validates :translateable_type, uniqueness: { scope: [:translateable_id, :locale] }

  scope :for_assessment, lambda { |assessment_id|
    where(resource_type: 'Assessment', resource_id: assessment_id)
  }
  scope :for_report, lambda { |report_id|
    where(resource_type: 'Report', resource_id: report_id)
  }
end
