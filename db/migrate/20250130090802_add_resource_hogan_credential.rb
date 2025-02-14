# frozen_string_literal: true

class AddResourceHoganCredential < ActiveRecord::Migration[7.1]
  def change
    create_table :resource_hogan_credentials do |t|
      t.integer :resource_id, null: false
      t.string :resource_type, null: false
      t.references :hogan_credential, null: false, foreign_key: true

      t.timestamps
    end

    add_index :resource_hogan_credentials, %i[resource_id resource_type]

    prefill_existing_data
  end

  def prefill_existing_data
    ActiveRecord::Base.connection.execute <<-SQL.squish
      INSERT INTO resource_hogan_credentials (resource_id, resource_type, hogan_credential_id, created_at, updated_at)
      SELECT ua.id, 'UserAssessment', hc.id, NOW(), NOW()
      FROM hogan_credentials hc
      JOIN users u ON u.id = hc.user_id
      JOIN user_assessments ua ON ua.subject_id = u.id
      JOIN assessments a ON a.id = ua.assessment_id
      WHERE a.type = 'Assessments::Hogan'
    SQL

    ActiveRecord::Base.connection.execute <<-SQL.squish
      INSERT INTO resource_hogan_credentials (resource_id, resource_type, hogan_credential_id, created_at, updated_at)
      SELECT ur.id, 'UserReport', hc.id, NOW(), NOW()
      FROM hogan_credentials hc
      JOIN users u ON u.id = hc.user_id
      JOIN user_reports ur ON ur.user_id = u.id
      JOIN reports r ON r.id = ur.report_id
      WHERE r.provider = 2
    SQL
  end
end
