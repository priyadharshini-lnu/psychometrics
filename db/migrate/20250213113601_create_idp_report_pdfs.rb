# frozen_string_literal: true

class CreateIdpReportPdfs < ActiveRecord::Migration[7.1]
  def change
    create_table :idp_report_pdfs do |t|
      t.references :user_idp_plan, foreign_key: true
      t.string :locale, null: false
      t.datetime :first_generated_at
      t.datetime :last_generated_at

      t.timestamps
    end
  end
end
