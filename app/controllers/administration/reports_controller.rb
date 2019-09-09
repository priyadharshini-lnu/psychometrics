# frozen_string_literal: true

module Administration
  class ReportsController < Administration::BaseController
    include Archivable
    # Turn off normally auth
    skip_before_action :authenticate_user!
    # Turn on auth by token
    prepend_before_action :authenticate_user_from_token!

    prepend_before_action :set_resource_class
    before_action :set_resource, only: %i[show edit update destroy copy toggle_status sidebar preview
                                          regenerate upload_data_sheet toggle_archive]
    before_action :skip_authorization, only: [:sidebar]
    append_before_action :init_breadcrumbs
    append_before_action :pundit_authorize, except: [:sidebar]

    # GET /administration/resources
    def index
      # TODO: (atanych): do we really need distinct?
      scope = policy_scope(resource_class).includes(:assessments, :report_families).order(:name).distinct
      scope = scope.with_owner(current_user.project_admin_clients_tte_ids) if current_user.is?(:project_admin)
      scope = scope.with_owner(current_user.project_admin_client_ids) if current_user.is?(:client_admin)
      @_filter_form = scope.search(params[:q])
      filter_form.archived_true ||= false
      @_resources = filter_form.result.page(params[:page])

      respond_to do |format|
        format.html
        format.js { render :index, formats: [:js] }
      end
    end

    def upload_data_sheet
      @form = ::Datasheets::DatasheetForm.from_params(params)
      render json: @form.parsed_file.first.map { |k, v| { name: k, type: v } }
    end

    def show
      render layout: 'layouts/report'
    end

    def new
      @_resource = resource_class.new
      @_resource.build_hogan_report_setting
      @_resource.set_default_color
    end

    def create
      @_resource = resource_class.new(resource_params)
      resource.owner_id = current_user.project_admin_client_ids.first if current_user.is?(:client_admin)
      # TODO: (ivan) Move creating and updating to Command and Form
      resource.hogan_report_setting&.delete if resource.hogan_report_setting&.hogan_report_id.blank?

      respond_to do |format|
        if resource.save
          format.js
        else
          resource.build_hogan_report_setting if resource.hogan_report_setting.blank?
          format.js { render :new }
        end
      end
    end

    def hogan_reports
      assessment_ids = params[:assessment_ids].to_s.split(',').compact
      hogan_assessment_ids = HoganAssessmentSetting.
                             where(assessment_id: assessment_ids).
                             pluck(:hogan_assessment_id).
                             uniq
      @reports = hogan_assessment_ids ?
                   Settings.providers.hogan.reports.select do |report|
                     report[:assessment_ids].to_set == hogan_assessment_ids.to_set
                   end :
                   []
      respond_to do |format|
        format.json
      end
    end

    # GET /administration/resources/1/edit
    def edit
      @_resource.build_hogan_report_setting if @_resource.hogan_report_setting.blank?
      add_breadcrumb resource.decorate.display_name, action: :edit, id: resource.id
    end

    # PATCH/PUT /administration/resources/1
    def update
      respond_to do |format|
        if resource.update(resource_params)
          format.js
        else
          @_resource.build_hogan_report_setting if @_resource.hogan_report_setting.blank?
          format.js { render :edit }
        end
      end
    end

    # DELETE /administration/resources/1
    def destroy
      begin
        resource.destroy
      rescue ActiveRecord::InvalidForeignKey
        resource.errors.add(:base, :has_dependent_relation)
      end
      respond_to do |format|
        if resource.errors.any?
          format.js { render :error, locals: { message: resource.errors.full_messages.join('<br>') } }
        else
          format.html do
            redirect_back(
              fallback_location: root_path, success: t('.successfully', name: resource.decorate.display_name)
            )
          end
          format.js
        end
      end
    end

    def copy
      @cloned_resource = resource.clone
      respond_to do |format|
        if @cloned_resource.save
          format.js
        else
          format.js { render :error, locals: { message: t('.error', name: resource.decorate.display_name) } }
        end
      end
    end

    # Change resources's status to active/disabled
    #
    def toggle_status
      resource.toggle!(:disabled)
      respond_to do |format|
        format.html do
          redirect_back(fallback_location: root_path, success: t('.successfully', name: resource.decorate.display_name))
        end
        format.js
      end
    end

    def preview
      add_breadcrumb resource.decorate.display_name, action: :show, id: resource
      respond_to do |format|
        format.html
      end
    end

    # Sends to re-generate Reports for all passed Assessments
    #
    def regenerate
      ::Reports::BulkExportJob.perform_later([resource.id], current_user)
    end

    private

    def init_breadcrumbs
      add_breadcrumb I18n.t('administration.breadcrumbs.home'), %i[administration root]
      add_breadcrumb I18n.t("administration.breadcrumbs.#{resource_class.model_name.plural}"), action: :index
    end

    # Set model
    def set_resource_class
      @_resource_class ||= Report # rubocop:disable Naming/MemoizedInstanceVariableName
    end

    def resource_params
      report_params = params.require(:resource).permit(:name, :type, :owner_id, :mindmill, :icon, :icon_color, :props,
                                                       :remove_icon, :default_language, report_family_ids: [],
                                                       assessment_ids: [],
                                       hogan_report_setting_attributes: %i[id hogan_report_id _destroy])
      # FIXME: When the assessments dropdown is disabled on the form due to assignment conditions, assessment_ids
      # are empty and causes errors
      # Does this need a better fix?
      if report_params.key?(:assessment_ids) && report_params[:assessment_ids].reject(&:empty?).empty?
        report_params = report_params.except(:assessment_ids)
      end
      report_params
    end

    def authenticate_user_from_token!
      user_token = params[:user_token].presence
      user       = user_token && User.find_by(authentication_token: user_token.to_s)
      sign_in(user, store: false) if user
      authenticate_user!
    end
  end
end
