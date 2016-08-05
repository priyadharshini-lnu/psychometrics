class Administration::Imports::HrisController < Administration::Imports::BaseController
  protected

  def init_import_class
    @resource_class ||= ::Imports::HrisImport
  end

  def pundit_authorize
    authorize :user, :import?
  end
end
