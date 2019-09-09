# frozen_string_literal: true

class Administration::AssessmentsController < Administration::BaseController
  include Archivable
  prepend_before_action :set_resource_class
  before_action :set_resource, only: %i[show edit update destroy toggle_status sidebar copy
                                        preview export toggle_archive]
  before_action :skip_authorization, only: [:sidebar]
  before_action :init_breadcrumbs
  append_before_action :pundit_authorize, except: [:sidebar]

  # GET /administration/resources
  def index
    @_filter_form = policy_scope(resource_class).includes(:dimension).search(params[:q])
    filter_form.archived_true ||= false
    @_resources = filter_form.result.page(params[:page])

    respond_to do |format|
      format.html
      format.js { render :index, formats: [:js] }
    end
  end

  def new
    @_resource = resource_class.new
    @_resource.build_hogan_assessment_setting
    @_resource.set_default_color
  end

  def create
    @_resource = resource_class.new(resource_params)
    resource.owner_id = current_user.client_admin_client_ids.first if current_user.is?(:client_admin)

    respond_to do |format|
      if resource.save
        format.js
      else
        format.js { render :new }
      end
    end
  end

  def preview
    @translations = ::Translation.to_hash_for_assessment(resource.id, user_locale)
    @available_translations = ::Translation.available_translation_for_assessment(resource.id)
    render layout: 'empty'
  end

  def reports
    render layout: 'empty'
  end

  def show
    add_breadcrumb resource.decorate.display_name
  end

  def edit
    @_resource.build_hogan_assessment_setting if @_resource.hogan_assessment_setting.blank?
    add_breadcrumb resource.decorate.display_name, action: :edit, id: resource.id
  end

  def update
    respond_to do |format|
      if resource.update(resource_params)
        format.js
      else
        format.js { render :edit }
      end
    end
  end

  def destroy
    resource.destroy
    respond_to do |format|
      format.html do
        redirect_back(fallback_location: root_path, success: t('.successfully', name: resource.decorate.display_name))
      end
      format.js
    end
  end

  # Change resources's status to active/disabled
  #
  def toggle_status
    resource.toggle!(:disabled)
    respond_to do |format|
      format.html { redirect_back(fallback_location: root_path, success: t('.successfully')) }
      format.js
    end
  end

  def copy
    @cloned_resource = CopyAssessment.process!(resource.id)
    respond_to do |format|
      if @cloned_resource.persisted?
        format.js
      else
        format.js do
          render(:error, locals: {
            message: t("administration.#{resource_class.model_name.plural}.copy.error", id: resource.id)
          })
        end
      end
    end
  end

  def export
    respond_to do |format|
      format.xlsx do
        headers['Content-Disposition'] = "attachment; filename=\"#{resource.name}-#{Date.today}.xlsx\""
        headers['Content-Type'] = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      end
    end
  end

  private

  def init_breadcrumbs
    add_breadcrumb I18n.t('administration.breadcrumbs.home'), %i[administration root]
    add_breadcrumb I18n.t("administration.breadcrumbs.#{resource_class.model_name.plural}"), action: :index
  end

  # Set model
  def set_resource_class
    @_resource_class ||= Assessment
  end

  def resource_params
    params.require(:resource).permit(:type, :mindmill_id, :name, :category, :description, :dimension_id, :timing,
                                     :status,
                                     :icon, :icon_color, :remove_icon,
                                     :owner_id, hogan_assessment_setting_attributes: %i[id hogan_assessment_id])
  end
end
