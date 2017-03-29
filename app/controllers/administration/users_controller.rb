class Administration::UsersController < Administration::BaseController
  prepend_before_action :set_resource_class
  before_action :set_resource, only: [:show, :edit, :update, :destroy, :toggle_status, :sidebar, :spoof, :reset_password]
  before_action :skip_authorization, only: [:sidebar]
  append_before_action :init_breadcrumbs
  append_before_action :pundit_authorize, except: [:sidebar]
  # GET /administration/resources
  def index
    @filter_form = policy_scope(@resource_class).search(params[:q])
    @resources = @filter_form.result.preload(:clients).page(params[:page])

    respond_to do |format|
      format.html
      format.js { render :index, formats: [:js] }
    end
  end

  # GET /administration/resources/1
  def show
  end

  # DELETE /administration/resources/1
  def destroy
    @resource.destroy
    respond_to do |format|
      format.html { redirect_to(:back, success: t('.successfully', name: @resource.decorate.display_name)) }
      format.js
    end
  end

  # Change resources's status to active/disabled
  #
  def toggle_status
    @resource.toggle!(:disabled)
    @resource.memberships.update_all(disabled: @resource.disabled)
    respond_to do |format|
      format.html { redirect_to(:back, success: t('.successfully', name: @resource.decorate.display_name)) }
      format.js
    end
  end

  # Send user instruction with reset password
  #
  def reset_password
    @resource.send_reset_password_instructions
    redirect_to :back, success: t('.successfully', name: @resource.decorate.display_name)
  end

  protected

  def init_breadcrumbs
    add_breadcrumb I18n.t('administration.breadcrumbs.home'), [:administration, :root]
    add_breadcrumb I18n.t("administration.breadcrumbs.#{@resource_class.model_name.plural}"), { action: :index }
  end

  # Set model
  def set_resource_class
    @resource_class ||= User
  end

  def resource_params
    params.require(:resource).permit(
      :first_name, :last_name, :email, :disabled, :role,
      { manage_client_ids: [] }, { hris_data: [:key, :value] }
    )
  end

  # Authorisation user
  def pundit_authorize
    authorize @resource || @resource_class
  end
end
