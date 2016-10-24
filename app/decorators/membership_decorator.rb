class MembershipDecorator < BaseDecorator
  def position
    current_membership = context[:current_membership]
    return 'Top Manager' if object.root?
    return 'Direct Manager' if object.parent_id = current_membership.id
    return 'Direct Report' if current_membership.parent_id = object.id
    return 'Manager' if object.is_ancestor_of?(current_membership)
    return 'Ancestor' if object.is_ancestor_of?(current_membership)
    return 'Descendant' if object.is_descendant_of?(current_membership)
    'Peers'
  end
end
