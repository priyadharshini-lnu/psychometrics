module EndUser
  class AssignSerializer < ActiveModel::Serializer
    include Rails.application.routes.url_helpers
    attributes :id, :status, :step, :type, :completion_percent, :url, :assigned_reports,
               :assessment_name, :questions_count, :timing, :mindmill, :hogan
    attribute :mindmill_url, if: -> { object.assessment.mindmill? }
    attribute :hogan_url, if: -> { object.assessment.hogan? }

    def url
      pass_assign_path(object)
    end

    def type
      return 'hogan' if object.assessment.hogan?

      'single_assign'
    end

    def user_id
      object.evaluator_id || object.membership.user_id
    end

    def hash_id
      object.encode_id
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

    def timing
      object.assessment.timing
    end

    def assigned_reports
      filtered_reports = object.single_reports.select { |report| reports_ids.include?(report.id) && ReportPolicy.new(report).show? }
      reports = filter_reports_by_type(filtered_reports, object.norm_type)
      reports.map { |report| ::EndUser::ReportSerializer.new(reportn, assign: assign).to_h }
    end

    private

    def reports_ids
      instance_options[:reports_ids] || []
    end

    def filter_reports_by_type(reports, type)
      return reports unless type
      reports.select { |r| r.type == type.downcase || r.common? }
    end

  end
end
