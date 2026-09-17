# frozen_string_literal: true

class AddSubjectAndBodyToCommunicationTemplates < ActiveRecord::Migration[7.1]
  def change
    change_table :communication_templates, bulk: true do |t|
      t.string :subject
      t.text :body
    end
  end
end
