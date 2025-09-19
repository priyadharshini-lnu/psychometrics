# frozen_string_literal: true

class AddDocumentAnalysisAssistantIdToIdpTemplates < ActiveRecord::Migration[7.1]
  def change
    add_reference :idp_templates, :document_analysis_ai_assistant, foreign_key: { to_table: :ai_assistants },
                  index: true
  end
end
