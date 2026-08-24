# frozen_string_literal: true

class CreateCommunicationDeliveryAssessments < ActiveRecord::Migration[7.1]
  def change
    create_table :communication_delivery_assessments do |t|
      t.references :communication_delivery, null: false, foreign_key: true
      t.references :assessment, null: false, foreign_key: true
      t.bigint :tenant_id
      t.timestamps
    end
    add_index :communication_delivery_assessments, :tenant_id
    add_index :communication_delivery_assessments, %i[communication_delivery_id assessment_id], unique: true
  end
end
