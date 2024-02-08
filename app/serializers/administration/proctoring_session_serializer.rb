# frozen_string_literal: true

module Administration
  class ProctoringSessionSerializer < Panko::Serializer
    attributes :id, :session_id, :started_at, :completed_at, :score, :comment, :archive_url, :report_url, :conclusion

    def started_at
      I18n.l object.started_at, format: :short if object.started_at
    end

    def completed_at
      I18n.l object.completed_at, format: :short if object.completed_at
    end

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
  end
end
