# frozen_string_literal: true

class Administration::DimensionsController < Administration::BaseController
  skip_before_action :enforce_geo_restriction
  prepend_before_action :set_resource_class
  before_action :set_resource, only: %i[edit update destroy copy toggle_status sidebar
                                        export_translations import_translations import_factors export_json]

  before_action :skip_authorization, only: [:sidebar]
  append_before_action :init_breadcrumbs
  append_before_action :pundit_authorize, except: [:sidebar]

  def index
    @filter_term = params.dig(:q, :filterable_fields)
    @_filter_form = policy_scope(resource_class).
                    ransack(params[:q])
    @_resources = filter_form.result.preload(:owner).page(params[:page])

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
      resource.owner_id = current_user.client_admin_client_ids.first
    end

    respond_to do |format|
      if resource.save
        audit! :create, resource, payload: params, user: current_user
        format.js
      else
        format.js { render :new }
      end
    end
  end

  def toggle_status
    resource.toggle(:disabled).save
    audit! :toggle_status, resource, payload: { disabled: resource.disabled }
    respond_to(&:js)
  end

  def update
    resource.updated_by = current_user
    respond_to do |format|
      if resource.update(resource_params)
        audit! :update, resource, payload: resource_params.permit!
        format.js
      else
        format.js { render :edit }
      end
    end
  end

  # DELETE /administration/resources/1
  def destroy
    resource.destroy
    audit! :delete, resource, payload: resource.try(:log_attribute_for_delete)
    respond_to do |format|
      format.html do
        redirect_back(fallback_location: root_path, success: t('.successfully', name: resource.decorate.display_name))
      end
      format.js
    end
  end

  def export_translations
    audit! :export_translations, resource, payload: { source_id: resource.id }
    AdminJob.call(:export_factor_translations, { dimension_id: params[:id] }, current_user)
  end

  def import_translations
    if params.dig(:dimension, :file).present?
      audit! :import_translations, resource, payload: { source_id: resource.id }
      AdminJob.call(:import_factor_translations, { dimension_id: params[:id] },
                    current_user, params[:dimension][:file])
      redirect_back(fallback_location: root_path,
                    success: t('.successfully', name: resource.decorate.display_name))
    else
      redirect_back(fallback_location: root_path,
                    error: t('.error', name: resource.decorate.display_name))
    end
  end

  def copy
    audit! :copy, resource, payload: { source_id: resource.id }
    AdminJob.call(:copy_dimension, { dimension_id: resource.id, skip_owner_validation: true }, current_user)
  end

  def import_factors
    @error_msgs = []
    form = ::Factors::ImportForm.new(file: params.dig(:dimension, :file)).with_context(dimension: resource)

    if form.valid?
      audit! :import_factors, resource, payload: { source_id: resource.id }
      AdminJob.call(:import_factors, { dimension_id: resource.id }, current_user, params[:dimension][:file])
      respond_to do |format|
        format.js { render :import_factor_success }
      end
    else
      @error_msgs = form.errors.full_messages
      respond_to do |format|
        format.js { render :factors_modal }
      end
    end
  end

  def export_json
    AdminJob.call(
      :export_dimension_as_json,
      { dimension_id: resource.id },
      current_user
    )
  end

  def validate_import
    form = PortableData::Imports::Form.new(json_file_content: import_params[:json_file_content])

    if form.valid?
      render json: {
        change_logs: form.change_logs
      }
    else
      render json: { errors: form.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def import
    if request.get? || request.head?
      respond_to do |format|
        format.js { render 'import' }
      end
    else
      form = PortableData::Imports::Form.new(json_file_content: import_params[:json_file_content])
      if form.valid?
        AdminJob.call(
          :import_dimension_from_json,
          import_params.merge(deleted_records: form.deleted_records),
          current_user
        )
      else
        render json: { error: form.errors.full_messages.join(', ') }, status: :unprocessable_entity
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

  def set_resource_class
    @_resource_class ||= Dimension # rubocop:disable Naming/MemoizedInstanceVariableName
  end

  def init_breadcrumbs
    add_breadcrumb I18n.t('administration.breadcrumbs.home'), %i[admin root]
    add_breadcrumb I18n.t("administration.breadcrumbs.#{resource_class.model_name.plural}"), action: :index
  end

  def resource_params
    params.expect(resource: %i[name owner_id occupations_enabled innovation_styles_enabled])
  end

  def import_params
    params.permit(:json_file_content, mappable_values: {})
  end
end
