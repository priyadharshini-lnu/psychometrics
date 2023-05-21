# frozen_string_literal: true

class SetRandomseedForExistingUsersResults < ActiveRecord::Migration[6.1]
  def up
    ActiveRecord::Migration[6.1].execute(%(
      UPDATE users_results SET seedrandom = id WHERE seedrandom IS NULL
    ))
  end
end
