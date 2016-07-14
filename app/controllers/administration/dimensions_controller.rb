class Administration::DimensionsController < Administration::BaseController
  prepend_before_action :set_resource_class
  before_action :set_resource, only: [:edit, :update, :destroy]
  before_action :skip_policy_scope
  append_before_action :pundit_authorize, only: [:index, :new, :edit, :create, :update, :destroy]
  before_filter :init_breadcrumbs

  def index
    @filterrific = initialize_filterrific(
        @resource_class,
        params[:filterrific]) || return
    @resources   = @filterrific.find.page(params[:page])
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
      format.html {
        redirect_to(
            [:administration, @resource_class.model_name.plural],
            notice: t("administration.#{@resource_class.model_name.plural}.destroy.successfully_destroyed", id: @resource.id)
        )
      }
      format.json { head :no_content }
    end
  end

  private

  def set_resource_class
    @resource_class ||= Dimension
  end

  def init_breadcrumbs
    add_breadcrumb I18n.t('administration.breadcrumbs.home'), [:administration, :root]
    add_breadcrumb I18n.t("administration.breadcrumbs.#{ @resource_class.model_name.plural }"), {action: :index}
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
