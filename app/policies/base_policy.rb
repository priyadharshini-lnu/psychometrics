class BasePolicy
  def initialize(context, record, extra = {})
    @current_user   = context[:current_user]
    @current_client = context[:current_client]
    @current_project = context[:current_project]
    @current_membership = context[:current_membership]
    @record = [record].flatten.last
  end

  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user = user
      @scope = [scope].flatten.last
    end

    # scope - could be array
    # [:administration, Model]
    #
    def resolve
      [scope].flatten.last
    end
  end
end
