class CreateJoinTableCommunicationsUsers < ActiveRecord::Migration[5.0]
  def change
    create_join_table :communications, :memberships do |t|
      t.index [:communication_id, :membership_id], name: :index_communications_memberships
    end
  end
end
