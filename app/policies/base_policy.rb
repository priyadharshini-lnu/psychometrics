class BasePolicy
  def initialize(context, record)
    @current_user   = context[:current_user]
    @current_client = context[:current_client]
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
