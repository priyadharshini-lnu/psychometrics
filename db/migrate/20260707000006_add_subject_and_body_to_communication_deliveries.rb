# frozen_string_literal: true

class AddSubjectAndBodyToCommunicationDeliveries < ActiveRecord::Migration[7.1]
  def change
    change_table :communication_deliveries, bulk: true do |t|
      t.string :subject
      t.text :body
    end
  end
end
