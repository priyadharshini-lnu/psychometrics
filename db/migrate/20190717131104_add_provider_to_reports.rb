class AddProviderToReports < ActiveRecord::Migration[5.1]
  def change
    add_column :reports, :provider, :integer

    Report.includes(:hogan_report_setting).find_each do |report|
      provider = Report::PROVIDERS[:internal]
      if report.mindmill?
        provider = Report::PROVIDERS[:mindmill]
      elsif report.hogan?
        provider = Report::PROVIDERS[:hogan]
      end
      report.update_columns(provider: provider)
    end
  end
end
