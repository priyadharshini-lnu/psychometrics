class CreateJoinTableCommunicationsCopyUsers < ActiveRecord::Migration[5.0]
  def change
    create_join_table :communications, :memberships, table_name: :communications_copy_memberships do |t|
      t.index [:communication_id, :membership_id], name: :index_communications_copy_memberships
    end
  end
end
