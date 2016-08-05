class Administration::Imports::BaseController < Administration::BaseController
  before_action :init_import_class
  append_before_action :pundit_authorize

  def new
    @resource = @resource_class.new
    respond_to do |format|
      format.js
    end
  end

  def create
    @resource = @resource_class.new(import_params)
    @resource.importer = current_administrator
    respond_to do |format|
      if @resource.process
        format.js
      else
        format.js { render :new }
      end
    end
  end

  protected

  def import_params
    params.require(:import).permit(:file)
  end

  private

  def init_import_class
    raise 'Should be implemented'
  end

  def pundit_authorize
    raise 'Should be implemented'
  end
end
