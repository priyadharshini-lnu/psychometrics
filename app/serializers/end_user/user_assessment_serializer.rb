# frozen_string_literal: true

module EndUser
  class UserAssessmentSerializer < ActiveModel::Serializer
    include Rails.application.routes.url_helpers
    attributes :id, :type, :url, :assessment_name, :questions_count, :timing, :mindmill, :hogan, :assessment_category,
               :assessment_extra, :assessment_id
    attribute :mindmill_url, if: -> { object.assessment.mindmill? }
    attribute :hogan_url, if: -> { object.assessment.hogan? }

    def url
      object.assessment.agile? ? agile_assign_path(object) : pass_user_assessment_path(object)
    end

    def type
      return 'hogan' if object.assessment.hogan?

      'single_assign'
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
      pass_mindmill_assign_path(object)
    end

    def hogan
      object.assessment.hogan?
    end

    def hogan_url
      pass_hogan_assign_path(object.id)
    end

    def completion_percent
      object.assessment.decorate.completion_percent
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
  end
end
