# frozen_string_literal: true

module Administration
  module Assessments
    class AssignForm < BaseForm
      attr_accessor :client_ids, :report_ids, :manager_ids, :user_ids

      def access_reports
        @access_reports || (access_reports_at.nil? ? 'immediately' : 'specific_datetime')
      end

      def access_reports_at
        return @access_reports_at if @access_reports_at

        if access_reports_at_date && access_reports_at_time
          DateTime.parse("#{access_reports_at_date} #{access_reports_at_time}")
        end
      end

      def access_reports_at_date
        return @access_reports_at_date if @access_reports_at_date
        return @access_reports_at.strftime('%Y-%m-%d') if @access_reports_at

        Time.zone.today
      end

      def access_reports_at_time
        return @access_reports_at_time if @access_reports_at_time
        return @access_reports_at.strftime('%l:%M %p') if @access_reports_at
      end

      def membership_ids
        (user_ids + manager_ids).compact_blank
      end
    end
  end
end
