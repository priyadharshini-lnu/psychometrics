# frozen_string_literal: true

class Administration::HomePolicy < Struct.new(:administrator, :home) # rubocop:disable Style/StructInheritance
  def initialize(user, record)
    @user = user
    @record = record
  end

  def index?
    @user.is?(:superadmin, :client_admin, :project_admin)
  end
end
