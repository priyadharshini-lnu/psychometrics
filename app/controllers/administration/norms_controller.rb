class Administration::NormsController < Administration::BaseController
  prepend_before_action :set_resource_class
  before_action :set_resource, only: [:edit, :update, :destroy, :copy, :toggle_status, :sidebar, :export, :editor]
  before_action :skip_authorization, only: [:sidebar]
  append_before_action :init_breadcrumbs
  append_before_action :pundit_authorize, except: [:sidebar]

  def index
    @filterrific = initialize_filterrific(
      policy_scope(@resource_class).includes(:updater),
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
    @resource         = @resource_class.new(resource_params)
    @resource.creator = current_administrator
    @resource.updater = current_administrator
    respond_to do |format|
      if @resource.save
        format.js
      else
        format.js { render :new }
      end
    end
  end

  def update
    @resource.updater = current_administrator
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
          [:administration, @resource_class.model_name.plural],
          notice: t("administration.#{@resource_class.model_name.plural}.destroy.successfully", id: @resource.id)
        )
      end
    end
  end

  def copy
    @cloned_resource         = @resource.clone
    @cloned_resource.updater = current_administrator
    @cloned_resource.creator = current_administrator
    respond_to do |format|
      if @cloned_resource.save
        format.js
      else
        format.js { render :error, locals: { message: t('administration.norms.copy.error', { id: @resource.id }) } }
      end
    end
  end

  def toggle_status
    @resource.toggle(:disabled).save
    respond_to do |format|
      format.js
    end
  end

  def export
    @factors_norms = FactorsNorm.export_structured_hash(@resource.id)
    respond_to do |format|
      format.xlsx do
        headers['Content-Disposition'] = "attachment; filename=\"#{@resource.name}-#{Date.today}.xlsx\""
        headers['Content-Type']        = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      end
    end
  end

  def editor
    @filterrific = initialize_filterrific(
    FactorsNorm,
    params[:filterrific],
    select_options: {
      by_norm_type: FactorsNorm::NORM_TYPES,
      by_factor_type: FactorsNorm::FACTOR_TYPES
    }) || return
    @resources = FactorsNorm.structured_hash(
      @filterrific.find.where(norm_id: @resource.id),
      @filterrific.by_factor_type == 'sub_factors'
    )
    add_breadcrumb @resource.name
    add_breadcrumb I18n.t('administration.breadcrumbs.norms_editor')
    respond_to do |format|
      format.js
      format.html
    end
  end

  private

  def set_resource_class
    @resource_class ||= Norm
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

  def editor_params
    params.permit(:norm_type, :factor_type)
  end

  def pundit_authorize
    authorize @resource || @resource_class
  end
end
