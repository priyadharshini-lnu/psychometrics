# frozen_string_literal: true

class CreateUserAssessmentVerificationImages < ActiveRecord::Migration[7.1]
  def change
    create_table :user_assessment_verification_images do |t|
      t.string :file
      t.references :user_assessment, foreign_key: { on_delete: :cascade }, null: false

      t.timestamps
    end
  end
end
