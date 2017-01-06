class Administration::FactorsController < Administration::BaseController
  prepend_before_action :set_resource_class
  before_action :set_resource, only: [:edit, :update, :destroy, :copy, :toggle_status, :sidebar]
  before_action :skip_authorization, only: [:sidebar]
  before_action :set_dimension
  append_before_action :init_breadcrumbs
  append_before_action :pundit_authorize, except: [:sidebar]

  def index
    @map_assessments = Assessment.select(:id, :name).where(dimension_id: @dimension.id).all.group_by(&:id)
    @filter_form = policy_scope(@resource_class).roots.with_dimension(@dimension.id).search(params[:q])
    @resources   = @filter_form.result.page(params[:page])
    respond_to do |format|
      format.html
      format.js { render :index, formats: [:js] }
    end
  end

  def new
    @resource = @resource_class.new
  end

  def create
    @resource = @dimension.factors.new(resource_params)
    respond_to do |format|
      if @resource.save
        format.js
      else
        format.js { render :new }
      end
    end
  end

  def update
    @map_assessments = Assessment.select(:id, :name).where(dimension_id: @dimension.id).all.group_by(&:id)
    respond_to do |format|
      if @resource.update(resource_params)
        format.js
      else
        format.js { render :edit }
      end
    end
  end

  # DELETE /administration/resources/1
  def destroy
    @resource.destroy
    respond_to do |format|
      format.html { redirect_to(:back, success: t('.successfully', name: @resource.decorate.display_name)) }
      format.js
    end
  end

  def copy
    @cloned_resource = @resource.clone
    respond_to do |format|
      if @cloned_resource.save
        format.js
      else
        format.js { render :error, locals: { message: t('administration.factors.copy.error', { id: @resource.id }) } }
      end
    end
  end

  def toggle_status
    @resource.toggle(:disabled).save
    respond_to do |format|
      format.js
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
    add_breadcrumb I18n.t("administration.breadcrumbs.#{@resource_class.model_name.plural}"), { action: :index }
  end

  def set_dimension
    @dimension = Dimension.find(params[:dimension_id])
  end

  def resource_params
    params.require(:resource).permit(:name, :description, :icon, :remove_icon, :dimension_id)
  end

  def pundit_authorize
    authorize @resource || @resource_class
  end
end
