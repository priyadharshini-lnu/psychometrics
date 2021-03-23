# frozen_string_literal: true

class ReplaceUsersBlankLocaleToNil < ActiveRecord::Migration[5.2]
  def change
    User.where(locale: '').update_all(locale: nil)
  end
end
