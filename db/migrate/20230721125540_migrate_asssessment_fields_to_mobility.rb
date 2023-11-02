# frozen_string_literal: true

class MigrateAsssessmentFieldsToMobility < ActiveRecord::Migration[7.0]
  def up
    assessments = execute(%(
      SELECT * FROM assessments
    ))
    execute('BEGIN')
    assessments.each do |assessment|
      exec_query(%(
        INSERT INTO assessment_translations (name, description, timing, locale, assessment_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      ), 'SQL', [
        assessment['name'], assessment['description'], assessment['timing'], 'en',
        assessment['id'], Time.zone.now, Time.zone.now
      ])
    end
    execute('COMMIT')
  end

  def down
    execute(%(
      DELETE FROM assessment_translations
    ))
  end
end
