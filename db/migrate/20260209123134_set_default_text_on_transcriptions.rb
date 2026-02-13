# frozen_string_literal: true

class SetDefaultTextOnTranscriptions < ActiveRecord::Migration[8.0]
  def up
    change_table :transcriptions, bulk: true do |t|
      t.change_default :text, ''
      t.change_null :text, false, ''
    end
  end

  def down
    change_table :transcriptions, bulk: true do |t|
      t.change_null :text, true
      t.change_default :text, nil
    end
  end
end
