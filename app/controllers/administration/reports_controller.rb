module Administration
  class ReportsController < Administration::BaseController
    # Turn off normally auth
    skip_before_action :authenticate_user!
    # Turn off browser auth
    skip_before_action :authenticate, only: [:preview]
    # Turn on auth by token
    prepend_before_action :authenticate_user_from_token!
    before_action :authenticate, except: [:preview]

    prepend_before_action :set_resource_class
    before_action :set_resource, only: [:show, :edit, :update, :destroy, :copy, :toggle_status, :sidebar, :preview]
    before_action :skip_authorization, only: [:sidebar]
    append_before_action :init_breadcrumbs
    append_before_action :pundit_authorize, except: [:sidebar]

    # GET /administration/resources
    def index
      scope = policy_scope(resource_class).includes(:assessments, :report_families).order(:name).distinct
      scope = scope.with_owner(current_user.project_admin_clients_tte_ids) if current_user.is?(:project_admin)
      scope = scope.with_owner(current_user.project_admin_client_ids) if current_user.is?(:client_admin)
      @_filter_form = scope.search(params[:q])
      @_resources = filter_form.result.page(params[:page])

      respond_to do |format|
        format.html
        format.js { render :index, formats: [:js] }
      end
    end

    def show
      render layout: 'layouts/report'
    end

    def new
      @_resource = resource_class.new
      @_resource.build_hogan_report_setting
    end

    def create
      @_resource = resource_class.new(resource_params)
      resource.owner_id = current_user.project_admin_client_ids.first if current_user.is?(:client_admin)

      respond_to do |format|
        if resource.save
          format.js
        else
          format.js { render :new }
        end
      end
    end

    def hogan_reports
      assessment_id = params[:assessment_id].split(',').first
      hogan_assessment_id = Assessment.hogan.find_by(id: assessment_id)&.hogan_assessment_setting&.hogan_assessment_id
      @reports = hogan_assessment_id ? Settings.hogan.find { |s| s.assessment_id == hogan_assessment_id }.reports : []

      respond_to do |format|
        format.json
      end
    end

    # GET /administration/resources/1/edit
    def edit
      @_resource.build_hogan_report_setting if @_resource.hogan_report_setting.blank?
      add_breadcrumb resource.decorate.display_name, { action: :edit, id: resource.id }
    end

    # PATCH/PUT /administration/resources/1
    def update
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
          format.js { render :error, locals: { message: t('.error', { name: resource.decorate.display_name }) } }
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
      add_breadcrumb resource.decorate.display_name, { action: :show, id: resource }
      respond_to do |format|
        format.html
      end
    end

    private

    def init_breadcrumbs
      add_breadcrumb I18n.t('administration.breadcrumbs.home'), [:administration, :root]
      add_breadcrumb I18n.t("administration.breadcrumbs.#{resource_class.model_name.plural}"), { action: :index }
    end

    # Set model
    def set_resource_class
      @_resource_class ||= Report
    end

    def resource_params
      params.require(:resource).permit(:name, :type, :owner_id, :mindmill, report_family_ids: [], assessment_ids: [],
                                       hogan_report_setting_attributes: [:id, :hogan_report_id, :load_report])
    end

    def authenticate_user_from_token!
      user_token = params[:user_token].presence
      user       = user_token && User.find_by(authentication_token: user_token.to_s)
      sign_in(user, store: false) if user
      authenticate_user!
    end
  end
end
