class FixUserReportsForeignKey < ActiveRecord::Migration[6.1]
  def change
    remove_reference :user_report_events, :user_report
    add_reference :user_report_events, :user_report, foreign_key: { on_delete: :cascade, to_table: :user_reports }
  end
end
