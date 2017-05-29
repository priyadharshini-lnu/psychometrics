class AddCompletedCountToMemberships < ActiveRecord::Migration[5.0]

  def change
    change_table :memberships do |t|
      t.integer :assigns_count, default: 0, allow_nil: false
      t.boolean :assigns_completed, default: false, allow_nil: false
    end

    add_index :memberships, :assigns_count
    add_index :memberships, :assigns_completed

    reversible do |dir|
      dir.up {
        assigns_data
        completed_data
      }
    end
  end

  def assigns_data
    execute <<-SQL.squish
        UPDATE memberships
           SET assigns_count = (SELECT count(1)
                                FROM assigns
                                WHERE assigns.membership_id = memberships.id)
    SQL
  end

  def completed_data
    Membership.includes(:assigns).each do |membership|
      total = membership.assigns_count
      membership.update_column(:assigns_completed, true) if total > 0 && membership.assigns.completed.size == total
    end
  end
end




