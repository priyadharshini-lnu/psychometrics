class MembershipSerializer < ActiveModel::Serializer
  attributes :id, :first_name, :last_name, :name, :role_name, :client_name

  def client_name
    object.client.decorate.display_name
  end

  def role_name
    object.decorate.role_name
  end

  def name
    [object.first_name, object.last_name].reject(&:blank?).join(' ')
  end
end
