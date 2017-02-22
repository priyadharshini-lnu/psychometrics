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
      @filter_form = policy_scope(@resource_class).includes(:assessment, :report_family).search(params[:q])
      @resources = @filter_form.result.page(params[:page])

      respond_to do |format|
        format.html
        format.js { render :index, formats: [:js] }
      end
    end

    def show
      render layout: 'layouts/report'
    end

    def new
      @resource = @resource_class.new
    end

    def create
      @resource = @resource_class.new(resource_params)

      respond_to do |format|
        if @resource.save
          format.js
        else
          format.js { render :new }
        end
      end
    end

    # GET /administration/resources/1/edit
    def edit
      add_breadcrumb @resource.decorate.display_name, { action: :edit, id: @resource.id }
    end

    # PATCH/PUT /administration/resources/1
    def update
      respond_to do |format|
        if @resource.update(resource_params)
          format.js
        else
          format.js { render :edit }
        end
      end
    end

    # DELETE /administration/resources/1
    def destroy
      @resource.destroy
      respond_to do |format|
        format.html { redirect_to(:back, success: t('.successfully', name: @resource.decorate.display_name)) }
        format.js
      end
    end

    def copy
      @cloned_resource = @resource.clone
      respond_to do |format|
        if @cloned_resource.save
          format.js
        else
          format.js { render :error, locals: { message: t('.error', { name: @resource.decorate.display_name }) } }
        end
      end
    end

    # Change resources's status to active/disabled
    #
    def toggle_status
      @resource.toggle!(:disabled)
      respond_to do |format|
        format.html { redirect_to(:back, success: t('.successfully', name: @resource.decorate.display_name)) }
        format.js
      end
    end

    def preview
      add_breadcrumb @resource.decorate.display_name, { action: :show, id: @resource }
      respond_to do |format|
        format.html
      end
    end

    private

    def init_breadcrumbs
      add_breadcrumb I18n.t('administration.breadcrumbs.home'), [:administration, :root]
      add_breadcrumb I18n.t("administration.breadcrumbs.#{@resource_class.model_name.plural}"), { action: :index }
    end

    # Set model
    def set_resource_class
      @resource_class ||= Report
    end

    def resource_params
      params.require(:resource).permit(:name, :assessment_id, :type, :owner_id, :report_family_id)
    end

    # Authorisation user
    def pundit_authorize
      authorize @resource || @resource_class
    end

    def authenticate_user_from_token!
      user_token = params[:user_token].presence
      user       = user_token && User.find_by(authentication_token: user_token.to_s)
      sign_in(user, store: false) if user
      authenticate_user!
    end
  end
end
