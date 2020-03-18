# frozen_string_literal: true

class AddGlobalParticipantOption < ActiveRecord::Migration[5.1]
  def change
    Threesixty::Option.find_each do |option|
      option.participants = option.participants.merge('global' => {})
      option.save(validate: false)
    end
  end
end
