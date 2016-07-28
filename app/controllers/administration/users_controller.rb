class Administration::UsersController < Administration::BaseController
  prepend_before_action :set_resource_class
  before_action :set_resource, only: [:show, :edit, :update, :destroy, :toggle_status, :sidebar, :spoof]
  before_action :skip_authorization, only: [:sidebar]
  before_action :init_breadcrumbs
  append_before_action :pundit_authorize, except: [:sidebar]

  # GET /administration/resources
  def index
    @filter = initialize_filterrific(
      policy_scope(@resource_class),
      params[:filter],
      select_options: {
        with_role: @resource_class.options_for_with_role
      }) || return
    @resources = @filter.find.page(params[:page])

    respond_to do |format|
      format.html
      format.js { render :index, formats: [:js] }
    end
  end

  def new
    @resource = @resource_class.new
  end

  def create
    @resource = @resource_class.new(resource_params)
    @resource.operator = current_administrator
    respond_to do |format|
      if @resource.save
        @resource.invite!(current_administrator)
        format.js
      else
        format.js { render :new }
      end
    end
  end

  # GET /administration/resources/1
  def show
  end

  # GET /administration/resources/1/edit
  def edit
    add_breadcrumb @resource.decorate.display_name, { action: :edit, id: @resource.id }
  end

  # PATCH/PUT /administration/resources/1
  def update
    @resource.operator = current_administrator
    respond_to do |format|
      if @resource.update(resource_params)
        format.html { redirect_to([:administration, @resource_class.model_name.plural], success: t('.successfully')) }
      else
        format.html { render :edit }
      end
    end
  end

  # DELETE /administration/resources/1
  def destroy
    @resource.destroy
    respond_to do |format|
      format.html { redirect_to(:back, success: t('.successfully')) }
    end
  end

  # Change resources's status to active/disabled
  #
  def toggle_status
    @resource.toggle!(:disabled)
    respond_to do |format|
      format.html { redirect_to(:back, success: t('.successfully')) }
      format.js
    end
  end

  # Send user instruction with reset password
  #
  def reset_password
    @user = policy_scope(User).find(params[:id])
    @user.send_reset_password_instructions
    flash[:success] = t('.successfully')
    redirect_to :back
  end

  def export
    @resources = policy_scope(@resource_class).all
    respond_to do |format|
      format.csv do
        headers['Content-Disposition'] = "attachment; filename=\"#{@resource_class.model_name.plural}-#{Date.today}.csv\""
        headers['Content-Type'] ||= 'text/csv'
      end
    end
  end

  # Spoof as user
  def spoof
    sign_in(@resource.role_scope, @resource, { bypass: true })
    redirect_to (@resource.is?(:superadmin, :admin) ? administration_root_path : root_path),
                success: t('.successfully', display_name: @resource.decorate.display_name)
  end

  private

  def init_breadcrumbs
    add_breadcrumb I18n.t('administration.breadcrumbs.home'), [:administration, :root]
    add_breadcrumb I18n.t("administration.breadcrumbs.#{@resource_class.model_name.plural}"), { action: :index }
  end

  # Set model
  def set_resource_class
    @resource_class ||= User
  end

  def set_resource
    @resource = @resource_class.find(params[:id])
  end

  def resource_params
    params.require(:resource).permit(:first_name, :last_name, :email, :disabled, :client_id, :role)
  end

  # Authorisation user
  def pundit_authorize
    authorize @resource || @resource_class
  end
end
