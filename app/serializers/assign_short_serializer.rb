# frozen_string_literal: true

class AssignShortSerializer < ActiveModel::Serializer
  attributes :id, :status, :user_id, :relationship

  def relationship
    object.membership.decorate(context: { current_membership: @instance_options[:membership] }).relationship if @instance_options[:membership]
  end

  def user_id
    object.membership.user_id
  end
end
