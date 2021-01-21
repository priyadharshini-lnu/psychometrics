# frozen_string_literal: true

class MigrateToMobility < ActiveRecord::Migration[5.2]
  def change
    Threesixty::EmailTemplate.find_each do |t|
      attrs = t.attributes
      t.update(content: attrs['content'], subject: attrs['subject'])
    end
    Threesixty::InstructionTemplate.find_each do |t|
      attrs = t.attributes
      t.update(content: attrs['content'])
    end
    CampaignOptions.find_each do |t|
      attrs = t.attributes
      t.update(instructions: attrs['instructions'])
    end
  end
end
