class Administration::SubFactorsController < Administration::BaseController
  prepend_before_action :set_resource_class
  before_action :set_resource, only: [:edit, :update, :destroy, :sidebar]
  before_action :set_dimension
  before_action :set_factor
  before_action :skip_policy_scope
  append_before_action :pundit_authorize
  before_filter :init_breadcrumbs

  def index
    @filterrific = initialize_filterrific(
      policy_scope(@resource_class).find(@factor.id).children,
      params[:filterrific]) || return
    @resources   = @filterrific.find.page(params[:page])
  end

  def new
    @resource = @resource_class.new
  end

  def create
    @resource = @resource_class.new(resource_params)
    @resource.dimension_id = @dimension.id
    @resource.parent_id = @factor.id
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
      format.html do
        redirect_to(
          administration_dimension_factor_sub_factors_path(dimension_id: @dimension.id, factor_id: @factor.id),
          notice: t("administration.#{@resource_class.model_name.plural}.destroy.successfully_destroyed", id: @resource.id)
        )
      end
      format.json { head :no_content }
    end
  end

  private

  def set_resource_class
    @resource_class ||= Factor
  end

  def init_breadcrumbs
    add_breadcrumb I18n.t('administration.breadcrumbs.home'), [:administration, :root]
    add_breadcrumb I18n.t('administration.breadcrumbs.dimensions'), administration_dimensions_path
    add_breadcrumb @dimension.name
    add_breadcrumb I18n.t('administration.breadcrumbs.factors'), administration_dimension_factors_path
    add_breadcrumb @factor.name
    add_breadcrumb I18n.t('administration.breadcrumbs.sub_factors'), { action: :index }
  end

  def set_resource
    @resource = @resource_class.find(params[:id])
  end

  def set_dimension
    @dimension = Dimension.find(params[:dimension_id])
  end

  def set_factor
    @factor = Factor.find(params[:factor_id])
  end

  def resource_params
    params.require(:resource).permit(:name, :dimension_id, :parent_id)
  end

  def pundit_authorize
    authorize @resource || @resource_class
  end
end
