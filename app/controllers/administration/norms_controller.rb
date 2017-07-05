class Administration::NormsController < Administration::BaseController
  prepend_before_action :set_resource_class
  before_action :set_resource, only: [:edit, :update, :destroy, :copy, :toggle_status, :sidebar, :export, :editor]
  before_action :skip_authorization, only: [:sidebar]
  append_before_action :init_breadcrumbs
  append_before_action :pundit_authorize, except: [:sidebar]

  def index
    @_filter_form = policy_scope(resource_class).includes(:updater, :dimension).search(params[:q])
    @_resources = filter_form.result.page(params[:page])

    respond_to do |format|
      format.html
      format.js { render :index, formats: [:js] }
    end
  end

  def new
    @_resource = resource_class.new
  end

  def create
    @_resource         = resource_class.new(resource_params)
    resource.creator = current_user
    resource.updater = current_user
    respond_to do |format|
      if resource.save
        format.js
      else
        format.js { render :new }
      end
    end
  end

  def update
    resource.updater = current_user
    respond_to do |format|
      if resource.update(resource_params)
        format.js
      else
        format.js { render :edit }
      end
    end
  end

  # DELETE /administration/resources/1
  def destroy
    resource.destroy
    respond_to do |format|
      format.html { redirect_to(:back, success: t('.successfully', name: resource.decorate.display_name)) }
      format.js
    end
  end

  def copy
    @cloned_resource         = resource.clone
    @cloned_resource.updater = current_user
    @cloned_resource.creator = current_user
    respond_to do |format|
      if @cloned_resource.save
        format.js
      else
        format.js { render :error, locals: { message: t('administration.norms.copy.error', { id: resource.id }) } }
      end
    end
  end

  def toggle_status
    resource.toggle(:disabled).save
    respond_to do |format|
      format.js
    end
  end

  def export
    @factors_norms = FactorsNorm.export_structured_hash(resource)
    respond_to do |format|
      format.xlsx do
        headers['Content-Disposition'] = "attachment; filename=\"#{resource.name}-#{Date.today}.xlsx\""
        headers['Content-Type']        = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      end
    end
  end

  def editor
    add_breadcrumb resource.name
    add_breadcrumb I18n.t('administration.breadcrumbs.norms_editor')
    @filter_data = NormEditorForm.new(editor_params)
    scope = Factor.where(dimension_id: resource.dimension_id).
            with_factor_type(@filter_data.factor_type).
            with_norm_type(@filter_data.norm_type, resource.id)
    @_resources = FactorsNorm.structured_hash(scope)
    respond_to do |format|
      format.js
      format.html
    end
  end

  private

  def set_resource_class
    @_resource_class ||= Norm
  end

  def init_breadcrumbs
    add_breadcrumb I18n.t('administration.breadcrumbs.home'), [:administration, :root]
    add_breadcrumb I18n.t("administration.breadcrumbs.#{resource_class.model_name.plural}"), { action: :index }
  end

  def resource_params
    params.require(:resource).permit(:name, :dimension_id, :owner_id)
  end

  def editor_params
    params.permit(:norm_type, :factor_type)
  end
end
