# frozen_string_literal: true

class Administration::AssessmentsController < Administration::BaseController
  include Archivable
  prepend_before_action :set_resource_class
  before_action :set_resource, only: %i[show edit update destroy toggle_status sidebar copy
                                        preview export toggle_archive questions factors soft_delete restore]
  before_action :skip_authorization, only: [:sidebar]
  before_action :init_breadcrumbs
  append_before_action :pundit_authorize, except: [:sidebar]

  # GET /administration/resources
  def index
    @filter_term = params.dig(:q, :filterable_fields)
    @_filter_form = policy_scope(resource_class).
                    includes(:dimension, :owner).
                    ransack(params[:q])
    @_resources = filter_form.result.page(params[:page])

    respond_to do |format|
      format.html
      format.js { render :index, formats: [:js] }
    end
  end

  def new
    @_resource = resource_class.new
    @_resource.build_hogan_assessment_setting
    @_resource.build_saville_assessment_setting
    @_resource.build_pearson_assessment_setting
    @_resource.build_iiht_assessment_setting
    @_resource.set_default_color
  end

  def create
    @_resource = resource_class.new(resource_params)
    resource.created_by = current_user
    resource.updated_by = current_user
    @_resource.build_iiht_assessment_setting if @_resource.iiht? && @_resource.iiht_assessment_setting.blank?

    if current_user.is?(:client_admin) && resource_params[:owner_id].blank?
      resource.owner_id = current_user.client_admin_client_ids.first
    end

    respond_to do |format|
      if resource.save
        audit! :create, resource, payload: params.permit!
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

  def assessments
    render json: Assessment.where(archived: false).pluck(:id, :name).map { |id, name| { id: id, name: name } }
  end

  def questions
    render json: resource.questions.where(type: 'StaticContent').pluck(:id, :name, :props).map { |id, name, props|
      { id: id, name: name, props: props }
    }
  end

  def show
    add_breadcrumb resource.decorate.display_name
  end

  def edit
    @_resource.build_hogan_assessment_setting if @_resource.hogan_assessment_setting.blank?
    @_resource.build_saville_assessment_setting if @_resource.saville_assessment_setting.blank?
    @_resource.build_pearson_assessment_setting if @_resource.pearson_assessment_setting.blank?
    @_resource.build_iiht_assessment_setting if @_resource.iiht_assessment_setting.blank?
    add_breadcrumb resource.decorate.display_name, action: :edit, id: resource.id
  end

  def update
    resource.updated_by = current_user
    respond_to do |format|
      if resource.update(resource_params)
        audit! :update, resource, payload: params.permit!
        format.js
        format.json { render json: :ok }
      else
        resource.build_iiht_assessment_setting if resource.iiht? && resource.iiht_assessment_setting.blank?
        format.js { render :edit }
        format.json { render json: :fail }
      end
    end
  end

  def destroy
    resource.destroy
    respond_to do |format|
      audit! :delete, resource, payload: resource.log_attribute_for_delete
      format.html do
        redirect_back(fallback_location: root_path, success: t('.successfully', name: resource.decorate.display_name))
      end
      format.js
    end
  end

  def soft_delete
    resource.soft_delete!(current_user)
    audit! :soft_delete, resource
  end

  def restore
    resource.restore!
    render 'refresh_list'
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
    event = ::Assessments::CopyAssessment.call(resource.id, current_user)

    respond_to do |format|
      if event[:ok]
        @cloned_resource = event[:ok][:assessment]
        audit! :copy, @cloned_resource, payload: { source_id: resource.id }

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
        headers['Content-Disposition'] = "attachment; filename=\"#{resource.name}-#{Time.zone.today}.xlsx\""
        headers['Content-Type'] = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      end
    end
  end

  def factors
    render json: resource.dimension.all_factors.as_json(only: %i[id name])
  end

  def upload_data_sheet
    @form = ::Sheets::SheetForm.from_params(params).with_context(sheet_type: 'Datasheet')
    render json: @form.parsed_file.second.map { |k, v| { name: k, type: v } }
  end

  def pearson_norms
    norms = PearsonAssessmentSetting.pearson_norms(params[:pearson_assessment_id], params[:pearson_norm_id])

    render json: norms
  end

  def projects
    projects = policy_scope(Client).roots.find(params[:owner_id]).projects
    projects = projects.joins(:integrations).merge(Integration.iiht.active) if params[:type] == Assessment::TYPES[:iiht]
    projects = projects.map do |project|
      { id: project.id, name: project.name, selected: params[:project_id] == project.id.to_s }
    end

    render json: projects
  end

  def external_assessments
    assessments = []
    if params[:type] == Assessment::TYPES[:iiht] && params[:project_id]
      assessments = Iiht::GetAssessments.call!(Client.find(params[:project_id])).map do |a|
        id = a['assessmentIdNumber']
        { id: id, name: a['name'], selected: params[:external_assessment_id] == id }
      end
    elsif params[:type] == Assessment::TYPES[:pearson] && Rails.application.secrets.pearson[:base_api_url]
      assessments = Pearson::GetAssessments.call!.sort_by { |a| a['title'] }.map do |a|
        { id: a['productId'], name: a['title'], selected: params[:external_assessment_id] == a['productId'] }
      end
    end

    render json: assessments
  end

  private

  def pundit_authorize
    authorize(
      resource || resource_class,
      nil,
      project_id: resource&.owner_id
    )
  end

  def init_breadcrumbs
    add_breadcrumb I18n.t('administration.breadcrumbs.home'), %i[administration root]
    add_breadcrumb I18n.t("administration.breadcrumbs.#{resource_class.model_name.plural}"), action: :index
  end

  # Set model
  def set_resource_class
    @_resource_class ||= Assessment # rubocop:disable Naming/MemoizedInstanceVariableName
  end

  def resource_params
    params.require(:resource).permit(
      :type, :mindmill_id, :name, :category, :description, :dimension_id, :timing,
      :status, :icon, :icon_color, :remove_icon, :poster, :remove_poster,
      :enable_video_check, :enable_audio_check, :enable_network_check,
      :owner_id, :project_id, hogan_assessment_setting_attributes: %i[id hogan_assessment_id],
      saville_assessment_setting_attributes:
      %i[id saville_assessment_id saville_norm_id],
      pearson_assessment_setting_attributes: %i[id pearson_assessment_id pearson_norm_id],
      iiht_assessment_setting_attributes: %i[id iiht_assessment_id_number iiht_schedule_config],
      resources: %i[assessmentId questionId], options: {}
    )
  end
end
