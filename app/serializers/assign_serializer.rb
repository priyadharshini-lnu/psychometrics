class AssignSerializer < ActiveModel::Serializer
  attributes :id, :status, :step, :results, :embedded_data, :scoring, :user_id, :relationship

  def relationship
    object.membership.decorate(context: {current_membership: @instance_options[:membership]}).relationship if @instance_options[:membership]
  end
end
