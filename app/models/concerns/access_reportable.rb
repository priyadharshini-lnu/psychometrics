# frozen_string_literal: true

module AccessReportable
  extend ActiveSupport::Concern

  attr_accessor :access_reports, :access_reports_at_date, :access_reports_at_time

  def access_reports
    @access_reports || (access_reports_at.nil? ? 'immediately' : 'specific_datetime')
  end

  def access_reports_at_date
    return @access_reports_at_date if @access_reports_at_date

    access_reports_at&.strftime('%Y-%m-%d')
  end

  def access_reports_at_time
    return @access_reports_at_time if @access_reports_at_time

    access_reports_at&.strftime('%l:%M %p')
  end
end
