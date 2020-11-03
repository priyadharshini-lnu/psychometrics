# frozen_string_literal: true

class DropIndexOnEndLevelIdCodeInRegistrationCodes < ActiveRecord::Migration[5.1]
  def change
    remove_index :registration_codes, %i[end_level_id code]
  end
end
