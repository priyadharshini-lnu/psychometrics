# frozen_string_literal: true

class AddMissingProjectFeatureFlagsAndBackfill < ActiveRecord::Migration[7.1]
  def up
    execute <<~SQL.squish
      INSERT INTO project_features (project_id, sms_notification, ai_assistants, ai_assisted_idp, global_skills, idp, created_at, updated_at)
      SELECT c.id,
             cf.sms_notification,
             cf.ai_assistants,
             cf.ai_assisted_idp,
             cf.global_skills,
             cf.idp,
             NOW(), NOW()
      FROM clients c
      JOIN clients cr ON cr.id = c.tte_id AND cr.ancestry_depth = 0
      JOIN client_features cf ON cf.client_id = cr.id
      LEFT JOIN project_features pf ON pf.project_id = c.id
      WHERE c.ancestry_depth = 1
        AND pf.id IS NULL
    SQL
  end

  def down
    remove_column :project_features, :sms_notification if column_exists?(:project_features, :sms_notification)
    remove_column :project_features, :ai_assistants if column_exists?(:project_features, :ai_assistants)
    remove_column :project_features, :ai_assisted_idp if column_exists?(:project_features, :ai_assisted_idp)
    remove_column :project_features, :global_skills if column_exists?(:project_features, :global_skills)
    remove_column :project_features, :idp if column_exists?(:project_features, :idp)
  end
end
