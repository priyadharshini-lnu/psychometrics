class AssignPolicy < Administration::BasePolicy
  def initialize(context, record)
    @user = context.user
    @client = context.client
    @record = record
  end

  # TODO: move to another scope
  def update?
    @record.user_id = @user.id
  end
end
