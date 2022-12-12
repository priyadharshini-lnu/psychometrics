class FixUserReportCommentsReference < ActiveRecord::Migration[6.1]
  def change
    remove_reference :user_report_comments, :parent, foreign_key: { to_table: :comments, on_delete: :cascade }
    add_reference :user_report_comments, :parent, foreign_key: { to_table: :user_report_comments, on_delete: :cascade }
  end
end
