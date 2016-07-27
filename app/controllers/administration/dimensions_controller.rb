class Administration::DimensionsController < Administration::BaseController
  prepend_before_action :set_resource_class
  before_action :set_resource, only: [:edit, :update, :destroy, :copy, :toggle_status, :sidebar]
  before_action :skip_authorization, only: [:sidebar]
  append_before_action :init_breadcrumbs
  append_before_action :pundit_authorize, except: [:sidebar]


  def index
    @filterrific = initialize_filterrific(
      policy_scope(@resource_class),
      params[:filterrific]) || return
    @resources   = @filterrific.find.page(params[:page])

    respond_to do |format|
      format.html
      format.js { render :index, formats: [:js] }
    end
  end

  def new
    @resource = @resource_class.new
  end

  def create
    @resource = @resource_class.new(resource_params)

    respond_to do |format|
      if @resource.save
        format.js
      else
        format.js { render :new }
      end
    end
  end

  def toggle_status
    @resource.toggle(:disabled).save
    respond_to do |format|
      format.js
    end
  end

  def update
    respond_to do |format|
      if @resource.update(resource_params)
        format.js
      else
        format.js { render :edit }
      end
    end
  end

  def destroy
    @resource.destroy
    respond_to do |format|
      format.html do
        redirect_to(
          :back,
          notice: t("administration.#{@resource_class.model_name.plural}.destroy.successfully", id: @resource.id)
        )
      end
    end
  end

  def copy
    @cloned_resource = @resource.clone
    respond_to do |format|
      if @cloned_resource.save
        format.js
      else
        format.js { render :error, locals: { message: t('administration.dimensions.copy.error', { id: @resource.id }) } }
      end
    end
  end

  private

  def set_resource_class
    @resource_class ||= Dimension
  end

  def init_breadcrumbs
    add_breadcrumb I18n.t('administration.breadcrumbs.home'), [:administration, :root]
    add_breadcrumb I18n.t("administration.breadcrumbs.#{@resource_class.model_name.plural}"), { action: :index }
  end

  def set_resource
    @resource = @resource_class.find(params[:id])
  end

  def resource_params
    params.require(:resource).permit(:name, :favourite)
  end

  def pundit_authorize
    authorize @resource || @resource_class
  end
end
