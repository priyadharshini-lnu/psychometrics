# frozen_string_literal: true

class CreateUserReportPdfs < ActiveRecord::Migration[7.1]
  def change
    create_table :user_report_pdfs do |t|
      t.references :user_report, foreign_key: true
      t.string :locale, null: false
      t.datetime :first_generated_at
      t.datetime :last_generated_at

      t.timestamps
    end

    add_index :user_report_pdfs, %i[user_report_id locale], unique: true

    ActiveRecord::Base.connection.execute(
      <<-SQL.squish
        INSERT INTO activesupport_tables_migrations (table_name, model_name, last_processed_id)
        VALUES ('user_reports', 'UserReport', 0)
        ON CONFLICT (table_name) DO UPDATE
        SET last_processed_id = 0
      SQL
    )
  end
end
