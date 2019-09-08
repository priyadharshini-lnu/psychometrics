# frozen_string_literal: true

module Administration
  module Assessments
    class AssignForm < BaseForm
      attr_accessor :client_ids, :report_ids, :access_reports, :access_reports_at, :access_reports_at_date, :access_reports_at_time
      attr_accessor :manager_ids, :user_ids

      def access_reports
        @access_reports || (access_reports_at.nil? ? 'immediately' : 'specific_datetime')
      end

      def access_reports_at
        return @access_reports_at if @access_reports_at
        return DateTime.parse("#{access_reports_at_date} #{access_reports_at_time}") if access_reports_at_date && access_reports_at_time
      end

      def access_reports_at_date
        return @access_reports_at_date if @access_reports_at_date
        return @access_reports_at.strftime('%Y-%m-%d') if @access_reports_at

        Date.today
      end

      def access_reports_at_time
        return @access_reports_at_time if @access_reports_at_time
        return @access_reports_at.strftime('%l:%M %p') if @access_reports_at
      end

      def membership_ids
        (user_ids + manager_ids).reject(&:blank?)
      end
    end
  end
end
