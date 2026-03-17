# frozen_string_literal: true

class AddChatInstructionsToIdpTemplates < ActiveRecord::Migration[8.0]
  def change
    change_table :idp_templates do |t|
      t.jsonb :chat_instructions, default: { content: '' }
      t.boolean :show_chat_instructions, default: false
    end
    add_column :idp_template_translations, :chat_instructions, :jsonb, default: { content: '' }
  end
end
