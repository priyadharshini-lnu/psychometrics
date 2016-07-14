class Administration::HomePolicy < Struct.new(:administrator, :home)
  def initialize(user, record)
    @user = user
    @record = record
  end

  def index?
    return true if @user.superadmin?
    return true if @user.admin?
    false
  end
end
