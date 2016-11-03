class AssignSerializer < ActiveModel::Serializer
  attributes :id, :status, :step, :results, :embedded_data, :scoring, :user_id, :relationship, :hris

  def relationship
    object.membership.decorate(context: {current_membership: @instance_options[:membership]}).relationship if @instance_options[:membership]
  end

  def hris
    object.membership.hris
  end

  def user_id
    object.membership.user_id
  end
end
