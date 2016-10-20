class BasePolicy
  def initialize(context, record)
    @user   = context.user
    @client = context.client
    @record = record
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
