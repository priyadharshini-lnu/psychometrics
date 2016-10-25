class MembershipDecorator < BaseDecorator
  def relationship
    current_membership = context[:current_membership]
    return 'Direct Report' if object.parent_id == current_membership.id
    return 'Peer' if object.parent_id == current_membership.parent_id
    return 'Self' if object.id == current_membership.id
    return 'Manager' if object.id == current_membership.parent_id
  end
end
