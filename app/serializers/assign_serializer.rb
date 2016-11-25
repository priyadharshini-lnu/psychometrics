class AssignSerializer < ActiveModel::Serializer
  attributes :id, :status, :step, :results, :embedded_data, :scoring, :user_id, :relationship, :hris, :hash_id, :norm_data
  attribute :agile_scoring, if: -> { object.membership_id == @instance_options[:membership].try(:id) }

  has_one :user, serializer: UserSerializer

  def relationship
    object.membership.decorate(context: { current_membership: @instance_options[:membership] }).relationship if @instance_options[:membership]
  end

  def hris
    object.membership.hris
  end

  def user_id
    object.membership.user_id
  end

  def hash_id
    object.encode_id
  end
end
