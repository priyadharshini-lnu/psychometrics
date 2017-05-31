class Administration::HomePolicy < Struct.new(:administrator, :home)
  def initialize(user, record)
    @user = user
    @record = record
  end

  def index?
    @user.is?(:superadmin, :admin)
  end
end
