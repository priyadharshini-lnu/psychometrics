# frozen_string_literal: true

class AddSkillGapReportAnalysisAIAssistantIdToIdpTemplates < ActiveRecord::Migration[7.1]
  def change
    add_reference :idp_templates, :skill_gap_report_analysis_ai_assistant, foreign_key: { to_table: :ai_assistants },
                  index: true
  end
end
