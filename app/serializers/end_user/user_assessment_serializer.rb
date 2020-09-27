# frozen_string_literal: true

module EndUser
  class UserAssessmentSerializer < ActiveModel::Serializer
    include Rails.application.routes.url_helpers
    attributes :id, :type, :url, :assessment_name, :questions_count, :timing, :mindmill, :hogan, :assessment_category,
               :assessment_extra, :assessment_id, :status, :user_reports, :completion_percent
    attribute :mindmill_url, if: -> { object.assessment.mindmill? }
    attribute :hogan_url, if: -> { object.assessment.hogan? }

    def status
      object.users_result&.status
    end

    def url
      object.assessment.agile? ? agile_user_assessment_path(object) : pass_user_assessment_path(object)
    end

    def type
      return 'hogan' if object.assessment.hogan?

      'user_assessment'
    end

    def user_id
      object.evaluator_id
    end

    def hash_id
      object.encode_id
    end

    def assessment_id
      object.assessment.id
    end

    def assessment_name
      object.assessment.name
    end

    def normalize_hogan_type(type)
      return 'Raw' if type == 'RAW'
      return 'Percentile' if type == 'percentile'

      raise "Not supported hogan type #{type}"
    end

    def mindmill
      object.assessment.mindmill?
    end

    def mindmill_url
      pass_mindmill_user_assessment_path(object)
    end

    def hogan
      object.assessment.hogan?
    end

    def hogan_url
      pass_hogan_assign_path(object.id)
    end

    def completion_percent
      result = object.users_result
      return 100 if result.completed?

      answered = result.answers&.size || 0
      total = object.assessment.questions&.size
      return 0 if total.nil? || total.zero?

      progress = (100 * answered) / total
      99 if progress > 99
      progress
    end

    def questions_count
      object.assessment.questions.count
    end

    def assessment_extra
      object.assessment.extra
    end

    def timing
      object.assessment.timing
    end

    def assessment_category
      object.assessment.category
    end

    def user_reports
      []
    end
  end
end
