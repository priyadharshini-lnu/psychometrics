# frozen_string_literal: true

class AddAssessmentIdsToWebhooks < ActiveRecord::Migration[8.0]
  def change
    add_column :webhook_subscriptions, :assessment_ids, :jsonb, default: [], null: false
    add_index :webhook_subscriptions, :assessment_ids, using: :gin
  end
end
