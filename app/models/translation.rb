# frozen_string_literal: true

class Translation < ApplicationRecord
  audited

  include Copyable

  belongs_to :translateable, polymorphic: true
  belongs_to :resource, polymorphic: true

  validates :locale, presence: true
  validates :translateable_type, uniqueness: { scope: %i[translateable_id locale resource_type resource_id] }

  after_commit :touch_assessment

  scope :for_assessment, lambda { |assessment_id|
    where(resource_type: Assessment::TYPES[:common], resource_id: assessment_id)
  }
  scope :for_report, lambda { |report_id|
    where(resource_type: 'Report', resource_id: report_id)
  }

  class << self
    def to_hash_for_assessment(assessment_id, locale)
      results = {}
      for_assessment(assessment_id).where(locale: locale).find_each do |t|
        results[t.translateable_type.underscore] ||= {}
        results[t.translateable_type.underscore][t.translateable_id] ||= t.props
      end
      results
    end

    def to_hash_for_questions(question_ids, locale)
      results = {}
      where(translateable_type: 'Question', translateable_id: question_ids, locale: locale).find_each do |t|
        results[t.translateable_type.underscore] ||= {}
        results[t.translateable_type.underscore][t.translateable_id] ||= t.props
      end
      results
    end

    def to_hash_for_question(id, locale)
      find_by(translateable_type: 'Question', translateable_id: id, locale: locale)&.props || {}
    end

    def available_translation_for_assessment(assessment_id)
      for_assessment(assessment_id).group(:locale).pluck(:locale)
    end

    def to_hash_for_report(report_id, assessment_id, locale)
      results = {}
      for_report(report_id).or(for_assessment(assessment_id)).where(locale: locale).find_each do |t|
        results[t.translateable_type.underscore] ||= {}
        results[t.translateable_type.underscore][t.translateable_id] ||= t.props
      end
      results
    end

    def available_translation_for_report(report_id, _assessment_id)
      for_report(report_id).group(:locale).pluck(:locale)
    end
  end

  private

  def touch_assessment
    if translateable.is_a?(Question)
      translateable.assessment&.touch
    end
  end
end
