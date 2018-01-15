module Administration
  class CommunicationsController < Administration::BaseController
    prepend_before_action :set_resource_class
    before_action :set_resource, only: [:destroy, :copy, :download_history, :toggle_status, :sidebar]
    before_action :skip_authorization, only: [:sidebar]
    append_before_action :pundit_authorize, except: [:sidebar]
    after_action :init_breadcrumbs

    def index
      @_filter_form = policy_scope(resource_class).search(params[:q])
      @_resources = filter_form.result.page(params[:page])

      respond_to do |format|
        format.html
        format.js { render :index, formats: [:js] }
      end
    end

    def new
      @_resource = resource_class.new
      @communication_facade = ::Facades::Administration::Communication.new(current_user, resource)
    end

    def create
      @_resource = resource_class.new(resource_params)
      @_resource.creator_id = current_user.id
      @communication_facade = ::Facades::Administration::Communication.new(current_user, resource)
      respond_to do |format|
        if @communication_facade.form.validate(resource_params)
          @communication_facade.form.save
          format.js
        else
          format.js { render :new }
        end
      end
    end

    def toggle_status
      resource.toggle(:disabled).save
      respond_to do |format|
        format.js
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
      clone_resource(resource)
      @communication_facade = ::Facades::Administration::Communication.new(current_user, resource)
      render :new
    end

    def download_history
      csv = ::Services::ExportCSV::CommunicationEmailsHistory.call(communication: resource).result
      send_data csv, filename: "#{resource.subject}-#{Time.current}.csv"
    end

    def new_form
      @_resource = resource_class.preload(:assessment, :client).new(resource_params)
      @communication_facade = ::Facades::Administration::Communication.new(current_user, resource)
      respond_to do |format|
        format.js { render :new }
      end
    end

    def show
      @communication = policy_scope(resource_class).find(params[:id])
    end

    private

    def clone_resource(resource)
      clone_resource = resource.clone
      clone_resource.user_ids = resource.user_ids
      @_resource = clone_resource
    end

    def set_resource_class
      @_resource_class ||= Communication
    end

    def init_breadcrumbs
      add_breadcrumb I18n.t('administration.breadcrumbs.home'), [:administration, :root]
      add_breadcrumb I18n.t("administration.breadcrumbs.#{resource_class.model_name.plural}"), { action: :index }
    end

    def resource_params
      params.fetch(:resource, {}).permit(
        :subject, :body, :assessment_id,
        :client_id, :recipients, :owner_id,
        :delivery_rule, :reminder_type, :delivery_interval,
        :delivery_interval_number, :delivery_interval_period,
        :project_id, :campaign_id, :sub_campaign_id,
        :kind, :delivery_at, :stop_reminder, :stop_reminder_datetime,
        user_ids: []
      )
    end
  end
end
