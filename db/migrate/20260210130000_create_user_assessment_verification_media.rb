# frozen_string_literal: true

class CreateUserAssessmentVerificationMedia < ActiveRecord::Migration[7.1]
  def up
    create_table :user_assessment_verification_media do |t|
      t.string :file
      t.integer :media_type, null: false, default: 0
      t.references :user_assessment, null: false, foreign_key: { on_delete: :cascade }

      t.timestamps
    end
  end
end
