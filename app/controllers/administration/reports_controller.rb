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
                                          upload_data_sheet toggle_archive soft_delete restore]
    before_action :skip_authorization, only: [:sidebar]
    append_before_action :init_breadcrumbs
    append_before_action :pundit_authorize, except: [:sidebar]

    # GET /administration/resources
    def index
      # TODO: (atanych): do we really need distinct?
      @filter_term = params.dig(:q, :filterable_fields)
      scope = policy_scope(resource_class).
              includes(:assessments, :report_families).
              order(:name)

      @_filter_form = scope.ransack(params[:q])
      @_resources = filter_form.result.page(params[:page])

      respond_to do |format|
        format.html
        format.js { render :index, formats: [:js] }
      end
    end

    def upload_data_sheet
      @form = ::Sheets::SheetForm.from_params(params).with_context(sheet_type: 'Datasheet')
      render json: @form.parsed_file.second.map { |k, v| { name: k, type: v } }
    end

    def show
      render layout: 'layouts/report'
    end

    def new
      @_resource = resource_class.new
      @external_settings = Administration::Reports::ExternalSettings::BaseForm.new
      @_resource.set_default_color
    end

    def create
      @_resource = resource_class.new(resource_params)

      resource.created_by = current_user
      resource.updated_by = current_user

      if resource.should_have_external_settings?
        @external_settings = Administration::Reports::GetExternalSettingsForm.
                             call(resource, resource_params[:external_settings])[:ok]

        resource.external_settings = @external_settings.attributes.compact_blank
      end

      if current_user.is?(:client_admin) && resource_params[:owner_id].blank?
        resource.owner_id = current_user.client_admin_client_ids.first
      end

      respond_to do |format|
        if (!resource.external_settings? || @external_settings.valid?) && resource.save
          audit! :create, resource, payload: params
          format.js
        else
          format.js { render :new }
        end
      end
    end

    def external_reports
      assessment_ids = params[:assessment_ids].to_s.split(',').compact
      reports = hogan_reports(assessment_ids)
      reports = saville_reports(assessment_ids) if reports.empty?
      reports_array = reports.map do |r|
        { id: r.id, name: "#{r.name} - #{r.id}", selected: params[:external_report_id] == r.id }
      end

      render json: reports_array
    end

    # GET /administration/resources/1/edit
    def edit
      @external_settings = Administration::Reports::ExternalSettings::BaseForm.new(@_resource.external_settings)
      add_breadcrumb resource.decorate.display_name, action: :edit, id: resource.id
    end

    # PATCH/PUT /administration/resources/1
    def update
      resource.updated_by = current_user

      if resource.should_have_external_settings?
        @external_settings = Administration::Reports::GetExternalSettingsForm.
                             call(resource, resource_params[:external_settings])[:ok]

        resource.external_settings = @external_settings.attributes.compact_blank if @external_settings.valid?
      end

      respond_to do |format|
        if (!resource.external_settings? || @external_settings.valid?) &&
           resource.update(resource_params.except(:external_settings))
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
        audit! :delete, resource, payload: resource.log_attribute_for_delete
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
      audit! :soft_delete, resource
    end

    def restore
      audit! :restore, resource, payload: { source_id: resource.id }
      resource.restore!
      render 'refresh_list'
    end

    def copy
      event = ::Reports::CopyReport.call(resource.id, current_user)
      audit! :copy, resource, payload: { source_id: resource.id }

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
      audit! :toggle_status, resource, payload: { disabled: resource.disabled }
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
        :remove_icon, :default_language, :poster, :remove_poster, :data_only,
        report_family_ids: [], assessment_ids: [],
        external_settings: %i[report_id norm_id language_id suitability_id report_type]
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
      hogan_assessment_ids = Assessment.where(id: assessment_ids, type: Assessment::TYPES[:hogan]).map do |assessment|
        assessment.external_settings['assessment_id']
      end.uniq
      return [] unless hogan_assessment_ids.count.positive? && hogan_assessment_ids.count == assessment_ids.count

      Settings.providers.hogan.reports.select do |report|
        report[:assessment_ids].to_set == hogan_assessment_ids.to_set
      end
    end

    def saville_reports(assessment_ids)
      return [] unless assessment_ids.count == 1

      saville_assessment_ids = Assessment.where(id: assessment_ids, type: Assessment::TYPES[:saville]).map do |a|
        a.external_settings['assessment_id']
      end.uniq
      assessment = Settings.providers.saville.assessments.find { |a| saville_assessment_ids.include?(a[:id].downcase) }

      return [] unless assessment

      Settings.providers.saville.reports.select { |r| assessment[:report_ids].include?(r[:id]) }.map do |report|
        cloned_report = report.dup
        cloned_report.id.downcase!
        cloned_report
      end
    end
  end
end
