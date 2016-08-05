class Administration::Imports::UsersController < Administration::Imports::BaseController
  protected

  def init_import_class
    @resource_class ||= ::Imports::UserImport
  end

  def pundit_authorize
    authorize :user, :import?
  end
end
