# frozen_string_literal: true

class AddIncludeReflectiveQuestionsToIdpReportPdfs < ActiveRecord::Migration[7.1]
  def change
    add_column :idp_report_pdfs, :include_reflective_questions, :boolean, default: false
  end
end
