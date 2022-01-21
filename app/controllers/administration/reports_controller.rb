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
                                          regenerate upload_data_sheet toggle_archive soft_delete restore]
    before_action :skip_authorization, only: [:sidebar]
    append_before_action :init_breadcrumbs
    append_before_action :pundit_authorize, except: [:sidebar]

    # GET /administration/resources
    def index
      # TODO: (atanych): do we really need distinct?
      @filter_term = params.dig(:q, :filterable_fields)
      scope = policy_scope(resource_class).
              includes(
                :assessments,
                :report_families,
                :hogan_report_setting
              ).
              order(:name)

      @_filter_form = scope.ransack(params[:q])
      @_resources = filter_form.result.page(params[:page])

      respond_to do |format|
        format.html
        format.js { render :index, formats: [:js] }
      end
    end

    def upload_data_sheet
      @form = ::Datasheets::DatasheetForm.from_params(params)
      render json: @form.parsed_file.second.map { |k, v| { name: k, type: v } }
    end

    def show
      render layout: 'layouts/report'
    end

    def new
      @_resource = resource_class.new
      @_resource.build_hogan_report_setting
      @_resource.build_saville_report_setting
      @_resource.set_default_color
    end

    def create
      @_resource = resource_class.new(resource_params)

      if current_user.is?(:client_admin) && resource_params[:owner_id].blank?
        resource.owner_id = current_user.client_admin_client_ids.first
      end

      # TODO: (ivan) Move creating and updating to Command and Form
      resource.reload_hogan_report_setting if resource.hogan_report_setting&.hogan_report_id.blank?
      resource.reload_saville_report_setting if resource.saville_report_setting&.saville_report_id.blank?

      respond_to do |format|
        if resource.save
          format.js
        else
          resource.build_hogan_report_setting if resource.hogan_report_setting.blank?
          resource.build_saville_report_setting if resource.saville_report_setting.blank?
          format.js { render :new }
        end
      end
    end

    def external_reports
      assessment_ids = params[:assessment_ids].to_s.split(',').compact
      reports = hogan_reports(assessment_ids)
      reports = saville_reports(assessment_ids) if reports.empty?
      reports_array = reports.map do |r|
        { id: r.id.downcase, name: "#{r.name} - #{r.id}", selected: params[:external_report_id] == r.id.downcase }
      end

      render json: reports_array
    end

    # GET /administration/resources/1/edit
    def edit
      @_resource.build_hogan_report_setting if @_resource.hogan_report_setting.blank?
      @_resource.build_saville_report_setting if @_resource.saville_report_setting.blank?
      add_breadcrumb resource.decorate.display_name, action: :edit, id: resource.id
    end

    # PATCH/PUT /administration/resources/1
    def update
      respond_to do |format|
        if resource.update(resource_params)
          format.js
        else
          @_resource.build_hogan_report_setting if @_resource.hogan_report_setting.blank?
          @_resource.build_saville_report_setting if @_resource.saville_report_setting.blank?
          format.js { render :edit }
        end
      end
    end

    # DELETE /administration/resources/1
    def destroy
      resource.destroy
      respond_to do |format|
        format.html do
          redirect_back(
            fallback_location: root_path, success: t('.successfully', name: resource.decorate.display_name)
          )
        end
        format.js
      end
    end

    def soft_delete
      resource.soft_delete!(current_user)
    end

    def restore
      resource.restore!
      render 'refresh_list'
    end

    def copy
      event = ::Reports::CopyReport.call(resource.id)

      respond_to do |format|
        if event[:ok]
          @cloned_resource = event[:ok]
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

    def pundit_authorize
      authorize(
        resource || resource_class,
        nil,
        {
          project_id: resource&.owner_id
        }
      )
    end

    def init_breadcrumbs
      add_breadcrumb I18n.t('administration.breadcrumbs.home'), %i[administration root]
      add_breadcrumb I18n.t("administration.breadcrumbs.#{resource_class.model_name.plural}"), action: :index
    end

    # Set model
    def set_resource_class
      @_resource_class ||= Report # rubocop:disable Naming/MemoizedInstanceVariableName
    end

    def resource_params
      report_params = params.require(:resource).permit(
        :name, :description, :provider, :owner_id, :mindmill, :icon, :icon_color, :props,
        :remove_icon, :default_language,
        :poster, :remove_poster,
        report_family_ids: [], assessment_ids: [],
        hogan_report_setting_attributes: %i[id hogan_report_id _destroy],
        saville_report_setting_attributes: %i[id saville_report_id _destroy]
      )
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

    def hogan_reports(assessment_ids)
      hogan_assessment_ids = HoganAssessmentSetting.where(assessment_id: assessment_ids).
                             pluck(:hogan_assessment_id).uniq
      return [] unless hogan_assessment_ids.count.positive? && hogan_assessment_ids.count == assessment_ids.count

      Settings.providers.hogan.reports.select do |report|
        report[:assessment_ids].to_set == hogan_assessment_ids.to_set
      end
    end

    def saville_reports(assessment_ids)
      return [] unless assessment_ids.count == 1

      saville_assessment_ids = SavilleAssessmentSetting.where(assessment_id: assessment_ids).
                               pluck(:saville_assessment_id).uniq
      assessment = Settings.providers.saville.assessments.find { |a| saville_assessment_ids.include?(a[:id].downcase) }

      return [] unless assessment

      Settings.providers.saville.reports.select { |r| assessment[:report_ids].include?(r[:id]) }
    end
  end
end
