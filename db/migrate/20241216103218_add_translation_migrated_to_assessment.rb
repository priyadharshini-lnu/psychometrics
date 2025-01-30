# frozen_string_literal: true

class AddTranslationMigratedToAssessment < ActiveRecord::Migration[7.1]
  def change
    add_column :assessments, :translations_migrated, :boolean, default: true

    reversible do |dir|
      dir.up do
        execute <<-SQL.squish
          UPDATE assessments
          SET translations_migrated = false
          WHERE id IN (
            SELECT DISTINCT resource_id
            FROM translations
            WHERE resource_type = 'Assessments::Common'
          );
        SQL
      end
    end
  end
end
