class Administration::UsersController < Administration::BaseController
  prepend_before_action :set_resource_class
  before_action :set_resource, only: [:show, :edit, :update, :destroy, :toggle_status, :sidebar, :spoof, :reset_password]
  before_action :skip_authorization, only: [:sidebar]
  append_before_action :init_breadcrumbs
  append_before_action :pundit_authorize, except: [:sidebar]
  # GET /administration/resources
  def index
    @filter_form = policy_scope(resource_class).search(params[:q])
    @resources = @filter_form.result.preload(:clients, :ttes).page(params[:page])

    respond_to do |format|
      format.html
      format.js {render :index, formats: [:js]}
    end
  end

  # GET /administration/resources/1
  def show
  end

  def new
    render 'new'
  end

  def create
    @_resource = resource_class.new(create_resource_params)
    resource.role = User::SUPER_ADMIN_ROLE
    resource.created_by_id = current_user.id
    resource.modified_by_id = current_user.id
    resource.create_by_invite = true
    respond_to do |format|
      if resource.save
        resource.invite!(current_user)
        format.js
      else
        format.js {render :new}
      end
    end
  end

  # DELETE /administration/resources/1
  def destroy
    resource.destroy
    respond_to do |format|
      format.html {redirect_to(:back, success: t('.successfully', name: resource.decorate.display_name))}
      format.js
    end
  end

  # Change resources's status to active/disabled
  #
  def toggle_status
    resource.toggle!(:disabled)
    resource.update!(modified_by_id: current_user.id)
    resource.memberships.update_all(disabled: resource.disabled)
    respond_to do |format|
      format.html {redirect_to(:back, success: t('.successfully', name: resource.decorate.display_name))}
      format.js
    end
  end

  # Send user instruction with reset password
  #
  def reset_password
    resource.send_reset_password_instructions
    redirect_to :back, success: t('.successfully', name: resource.decorate.display_name)
  end

  protected

  def init_breadcrumbs
    add_breadcrumb I18n.t('administration.breadcrumbs.home'), [:administration, :root]
    add_breadcrumb I18n.t("administration.breadcrumbs.#{resource_class.model_name.plural}"), {action: :index}
  end

  # Set model
  def set_resource_class
    @_resource_class ||= User
  end

  def create_resource_params
    params.require(:resource).permit(:first_name, :last_name, :email)
  end
end
