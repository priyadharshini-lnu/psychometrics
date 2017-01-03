# == Schema Information
#
# Table name: translations
#
#  id                 :integer          not null, primary key
#  translateable_type :string
#  translateable_id   :integer
#  props              :json             default({})
#  locale             :string(4)
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#  resource_type      :string
#  resource_id        :integer
#

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

  def self.to_hash_for_assessment(assessment_id, locale)
    results = {}
    for_assessment(assessment_id).where(locale: locale).find_each do |t|
      results[t.translateable_type.underscore] ||= {}
      results[t.translateable_type.underscore][t.translateable_id] ||= t.props
    end
    results
  end

  def self.to_hash_for_report(report_id, assessment_id, locale)
    results = {}
    for_report(report_id).or(for_assessment(assessment_id)).where(locale: locale).find_each do |t|
      results[t.translateable_type.underscore] ||= {}
      results[t.translateable_type.underscore][t.translateable_id] ||= t.props
    end
    results
  end
end
