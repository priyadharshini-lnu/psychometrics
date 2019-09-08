# frozen_string_literal: true

class AddUserAccessToClientsReports < ActiveRecord::Migration[5.1]
  def self.up
    add_column :clients_reports, :user_access, :boolean, default: false
    add_reference :clients_reports, :report_family, foreign_key: true, index: false

    # Iterate all ClientsReport to set user_access and report_family attribute
    # Sets true if there is at least one assigned report with user_access
    #
    ClientsReport.includes(:client, report: :assessments).all.find_each do |client_report|
      client = client_report.client
      # try to find at least one assigned report with user access
      client_report.user_access = false
      # try to get first ReportFamily of report
      report_family = client.
                      root.
                      report_families.
                      joins(:reports).
                      where(reports: { id: client_report.report_id }).
                      first
      # If there is no Report Bundle, creates new
      # And assign License
      unless report_family
        report_family = ReportFamily.find_or_initialize_by(name: "#{client.root.name} Bundle")
        report_family.report_ids += [client_report.report_id]
        report_family.save
      end
      client_report.report_family = report_family

      # Assign assessments to client
      client_report.report.assessments.each do |assessment|
        client.assessments_clients.find_or_create_by(assessment_id: assessment.id)
      end
      client_report.save
    end
  end

  def self.down
    remove_column :clients_reports, :user_access
    remove_reference :clients_reports, :report_family
    AssessmentsClient.delete_all
  end
end
