class Administration::ImportsController < Administration::BaseController
  before_action :init_import
  append_before_action :pundit_authorize

  def init_import
    @import = ::Imports::Dsl.new(params.require(:resource), params.require(:type))
  end

  def new
    @form = @import.form.new
  end

  def create
    @form = @import.form.new(import_params)
    respond_to do |format|
      if @form.valid?
        begin
          @import.engine.new(@form.file.path, current_administrator).process
        rescue ::Errors::ImportError => message
          format.js { render :error, locals: { message: message } }
        end
        format.js
      else
        format.js { render :new }
      end
    end
  end

  private

  def import_params
    params.require(:import).permit(:file)
  end

  def pundit_authorize
    authorize @import.resource, :import?
  end
end
