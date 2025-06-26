# frozen_string_literal: true

class AddDefaultForInstructions < ActiveRecord::Migration[7.1]
  def change
    change_column_default :idp_templates, :instructions, from: {}, to: { content: '' }
    change_column_default :idp_template_translations, :instructions, from: {}, to: { content: '' }

    reversible do |dir|
      dir.up do
        execute(<<~SQL.squish)
          UPDATE idp_templates
          SET instructions = '{"content": ""}'::jsonb
          WHERE instructions = '{}'::jsonb
        SQL

        execute(<<~SQL.squish)
          UPDATE idp_template_translations
          SET instructions = '{"content": ""}'::jsonb
          WHERE instructions = '{}'::jsonb
        SQL
      end
    end
  end
end
