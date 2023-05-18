class SetRandomseedForExistingUsersResults < ActiveRecord::Migration[6.1]
  def up
    UsersResult.find_each do |user_result|
      next if user_result.seedrandom

      user_result.generate_randomseed
      user_result.save!
    end
  end
end
