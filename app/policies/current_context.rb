class CurrentContext
  attr_reader :user, :client

  def initialize(user, client)
    @user = user
    @client = client
  end
end