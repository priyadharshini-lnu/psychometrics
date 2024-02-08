class AddMainReportToCampaignReports < ActiveRecord::Migration[7.1]
  def change
    add_column :campaign_reports, :main_report, :boolean, default: false
  end
end
