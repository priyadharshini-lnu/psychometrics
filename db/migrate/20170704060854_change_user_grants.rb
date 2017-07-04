class ChangeUserGrants < ActiveRecord::Migration[5.0]
  def up
    User.where.not(grants: nil).each do |u|
      u.grants.each { |k, v| u.grants[k] = v.keys }
      u.save!
    end
  end

  def down
    raise "No way back"
  end
end
