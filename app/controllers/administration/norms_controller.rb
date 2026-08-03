# frozen_string_literal: true

class Administration::NormsController < Administration::BaseController
  skip_before_action :enforce_geo_restriction
  prepend_before_action :set_resource_class
  before_action :set_resource, only: %i[edit update destroy copy toggle_status sidebar export editor]
  before_action :skip_authorization, only: [:sidebar]
  append_before_action :init_breadcrumbs
  append_before_action :pundit_authorize, except: [:sidebar]

  def index
    @filter_term = params.dig(:q, :filterable_fields)
    @_filter_form = policy_scope(resource_class).
                    includes(:updated_by, :dimension).
                    ransack(params[:q])
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
    @_resource = resource_class.new(resource_params)
    resource.created_by = current_user
    resource.updated_by = current_user

    if current_user.is?(:client_admin) && resource_params[:owner_id].blank?
      resource.owner_id = current_user.client_admin_clients.not_archived&.first&.id
    end

    respond_to do |format|
      if resource.save
        audit! :create, resource, payload: params
        format.js
      else
        format.js { render :new }
      end
    end
  end

  def update
    resource.updated_by = current_user
    respond_to do |format|
      if resource.update(resource_params)
        audit! :update, resource, payload: params
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
      audit! :delete, resource, payload: resource.attributes
      format.html do
        redirect_back(fallback_location: root_path, success: t('.successfully', name: resource.decorate.display_name))
      end
      format.js
    end
  end

  def copy
    @cloned_resource = resource.clone
    @cloned_resource.updated_by = current_user
    @cloned_resource.created_by = current_user
    @cloned_resource.skip_owner_validation = true
    respond_to do |format|
      if @cloned_resource.save
        audit! :copy, resource, payload: { source_id: resource.id }
        format.js
      else
        format.js { render :error, locals: { message: t('.error', id: resource.id) } }
      end
    end
  end

  def toggle_status
    resource.toggle(:disabled).save
    audit! :toggle_status, resource, payload: { disabled: resource.disabled }
    respond_to(&:js)
  end

  def export
    @factors_norms = FactorsNorm.export_structured_hash(resource)
    audit! :export, resource
    respond_to do |format|
      format.xlsx do
        headers['Content-Disposition'] = "attachment; filename=\"#{resource.name}-#{Time.zone.today}.xlsx\""
        headers['Content-Type']        = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      end
    end
  end

  def editor
    add_breadcrumb resource.name
    add_breadcrumb I18n.t('administration.breadcrumbs.norms_editor')

    scope = Factor.where(dimension_id: resource.dimension_id).with_norm(resource.id)
    @_resources = FactorsNorm.structured_hash(scope)

    respond_to do |format|
      format.js { render 'five_scale_editor.js.erb' }
      format.html do
        render(resource.percentile? ? :percentile_editor : :five_scale_editor)
      end
    end
  end

  private

  def pundit_authorize
    authorize(
      resource || resource_class,
      nil,
      {
        project_id: resource&.owner_id
      }
    )
  end

  def five_scale_editor; end

  def percentile_editor; end

  def set_resource_class
    @_resource_class ||= Norm # rubocop:disable Naming/MemoizedInstanceVariableName
  end

  def init_breadcrumbs
    add_breadcrumb I18n.t('administration.breadcrumbs.home'), %i[admin root]
    add_breadcrumb I18n.t("administration.breadcrumbs.#{resource_class.model_name.plural}"), "#{admin_path}/norms"
  end

  def resource_params
    params.expect(resource: %i[name dimension_id owner_id norm_type])
  end

  def editor_params
    params.permit(:factor_type)
  end
end
