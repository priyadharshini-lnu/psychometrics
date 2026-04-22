# frozen_string_literal: true

module Administration
  class ProctoringSessionSerializer < Panko::Serializer
    attributes :id, :session_id, :started_at, :completed_at, :score, :comment, :archive_url, :report_url, :conclusion,
               :assessment_name

    def score
      object.results['score']
    end

    def comment
      object.results['comment']
    end

    def conclusion
      object.results['conclusion']
    end

    def archive_url
      object.results['archive']
    end

    def report_url
      object.results['reportUrl']
    end

    def assessment_name
      object.user_assessment&.assessment&.name
    end
  end
end
