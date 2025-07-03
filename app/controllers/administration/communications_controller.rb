# frozen_string_literal: true

module Administration
  class CommunicationsController < Administration::BaseController
    prepend_before_action :set_resource_class
    before_action :set_resource,
                  only: %i[destroy copy download_history toggle_status sidebar
                           show update_translation edit_translation]
    before_action :skip_authorization, only: [:sidebar]
    append_before_action :pundit_authorize, except: [:sidebar]

    def index
      @_filter_form = policy_scope(resource_class).
                      includes(
                        :client,
                        :project,
                        :campaign,
                        :sub_campaign,
                        :campaign_assessment_group,
                        :created_by,
                        :project_campaign,
                        :translations
                      ).
                      ransack(params[:q])

      @_resources = filter_form.result.page(params[:page])

      respond_to do |format|
        format.html
        format.js { render :index, formats: [:js] }
      end
    end

    def show
      @communication = policy_scope(resource_class).find(params[:id])
      @selected_locale = params[:lang] || I18n.default_locale.to_s
      @available_locales = @communication.translations.map(&:locale).uniq
      @available_locales << I18n.default_locale.to_s unless @available_locales.include?(I18n.default_locale.to_s)
      @available_locales.sort!

      Mobility.with_locale(@selected_locale) do
        @translated_subject = @communication.subject
        @translated_body = @communication.body
      end

      respond_to do |format|
        format.html
        format.json do
          render json: {
            translated_subject: @translated_subject,
            translated_body_html: Utility::SanitizeHtml.process(@translated_body.to_s)
          }
        end
      end
    end

    def new
      @_resource = resource_class.new
      @communication_facade = ::Facades::Administration::Communication.new(current_user, resource)
      # rubocop:disable Naming/MemoizedInstanceVariableName
      @copying_communication ||= false
      # rubocop:enable Naming/MemoizedInstanceVariableName
    end

    def edit
      @communication = policy_scope(resource_class).find(params[:id])
    end

    def create
      locale = resource_params[:locale] || I18n.default_locale

      filtered_params = resource_params.except(:locale)

      @_resource = resource_class.new(filtered_params)
      @_resource.created_by = current_user
      @communication_facade = ::Facades::Administration::Communication.new(current_user, resource)
      set_copying_communication_flag

      respond_to do |format|
        if validated_and_saved_resource_with_locale?(locale)
          audit! :create, resource, payload: resource_params
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

    def destroy
      resource.destroy
      audit! :delete, resource, payload: resource.log_attribute_for_delete
      respond_to do |format|
        format.html do
          redirect_back(fallback_location: root_path, success: t('.successfully', name: resource.decorate.display_name))
        end
        format.js
      end
    end

    def copy
      clone_resource(resource)
      @communication_facade = ::Facades::Administration::Communication.new(current_user, resource)

      @copying_communication = true
      render :new
    end

    def download_history
      csv = ::Services::ExportCsv::CommunicationEmailsHistory.call(communication: resource).result
      audit! :download_history, resource
      send_data csv, filename: "#{resource.subject}-#{Time.current}.csv"
    end

    def new_form
      resource_params[:locale] || I18n.default_locale

      filtered_params = resource_params.except(:locale)

      @_resource = resource_class.preload(:assessment, :client).new(filtered_params)
      @communication_facade = ::Facades::Administration::Communication.new(current_user, resource)
      set_copying_communication_flag

      respond_to do |format|
        format.js { render :new }
      end
    end

    def update_translation
      locale = params[:locale] || I18n.default_locale

      form = Communications::TranslationForm.new(translation_params.merge(locale: locale)).
             with_context(communication: resource)

      if form.valid? && form.persist!
        audit! :update_translation, resource,
               payload: { locale: locale, subject: params.dig(:communication, :subject),
                          body: params.dig(:communication, :body) }
        render json: { success: true, message: t('.successfully_updated') }
      else
        render json: { errors: form.errors.messages }, status: 400
      end
    end

    def edit_translation
      @communication = resource
      @selected_locale = params[:locale] || params[:lang]

      @available_locales = I18n.available_locales.map(&:to_s)

      @reference_subject = @communication.subject
      @reference_body = @communication.body

      Mobility.with_locale(@selected_locale) do
        @translated_subject = @communication.subject
        @translated_body = @communication.body
      end

      respond_to do |format|
        if params[:locale].present?
          format.json do
            render json: {
              translated_subject: @translated_subject,
              translated_body: @translated_body,
              reference_subject: @reference_subject,
              reference_body: @reference_body,
              selected_locale: @selected_locale
            }
          end
        else
          format.js { render :edit_translation }
        end
      end
    end

    private

    def validated_and_saved_resource_with_locale?(locale)
      Mobility.with_locale(locale) do
        @communication_facade.form.validate(resource_params) && @communication_facade.form.save && resource.valid?
      end
    end

    def pundit_authorize
      authorize(
        resource || resource_class,
        nil,
        project_id: resource&.project_id,
        campaign_id: resource&.campaign_id
      )
    end

    def clone_resource(resource)
      clone_resource = resource.clone
      clone_resource.user_ids = resource.user_ids
      @_resource = clone_resource
    end

    def set_resource_class
      @_resource_class ||= Communication # rubocop:disable Naming/MemoizedInstanceVariableName
    end

    def resource_params
      params.fetch(:resource, {}).permit(
        :subject, :body, :assessment_id, :assessment_completion_status_code, :delivery_delay_hours,
        :client_id, :recipients, :owner_id,
        :delivery_rule, :reminder_type, :delivery_interval,
        :delivery_interval_number, :delivery_interval_period,
        :project_id, :campaign_id, :sub_campaign_id,
        :kind, :delivery_at, :stop_reminder, :stop_reminder_datetime,
        :locale, :campaign_assessment_group_id,
        user_ids: []
      )
    end

    def set_copying_communication_flag
      @copying_communication = params.dig(:resource, :copying_communication) == 'true'
    end

    def translation_params
      params.require(:communication).permit(:subject, :body)
    end

    def current_locale
      cookies[:locale] || I18n.default_locale
    end
  end
end
