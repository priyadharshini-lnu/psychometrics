class AddUserAccessToClientsReports < ActiveRecord::Migration[5.1]
  def self.up
    add_column :clients_reports, :user_access, :boolean, default: false
    add_reference :clients_reports, :report_family, foreign_key: true, index: false

    # Iterate all ClientsReport to set user_access and report_family attribute
    # Sets true if there is at least one assigned report with user_access
    #
    ClientsReport.includes(:client, :report).all.find_each do |client_report|
      client_report.user_access = client_report.
                                  client.
                                  assigns.
                                  joins(:assigns_reports).
                                  exists?(assigns_reports: { report_id: client_report.report_id, user_access: true })
      # try to get first ReportFamily of report
      report_family = client_report.
                      client.root.
                      report_families.
                      joins(:reports).
                      where(reports: { id: client_report.report_id }).
                      first
      client_report.report_family = report_family
      client_report.save
    end
  end

  def self.down
    remove_column :clients_reports, :user_access
    remove_reference :clients_reports, :report_family
  end
end
