class CreateMembershipGrants < ActiveRecord::Migration[5.1]
  def change
    create_table :membership_grants do |t|
      t.references :membership, foreign_key: { on_delete: :cascade }
      t.jsonb :data
      t.timestamps
    end

    User.includes(:memberships).where.not(grants: nil).find_each do |user|
      user.memberships.each { |m| m.create_grants(data: user.grants) }
    end
  end
end
