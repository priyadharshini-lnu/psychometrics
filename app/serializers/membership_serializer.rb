# == Schema Information
#
# Table name: memberships
#
#  id             :integer          not null, primary key
#  client_id      :integer
#  user_id        :integer
#  parent_id      :integer
#  lft            :integer
#  rgt            :integer
#  depth          :integer
#  children_count :integer
#  hris           :jsonb
#  disabled       :boolean          default(FALSE)
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#

class MembershipSerializer < ActiveModel::Serializer
  attributes :id, :first_name, :last_name, :name, :role_name, :client_name

  def client_name
    object.client.decorate.display_name
  end

  # TODO: optimize to not use user's object
  def role_name
    object.user.decorate.role
  end

  def name
    [object.first_name, object.last_name].reject(&:blank?).join(' ')
  end
end
