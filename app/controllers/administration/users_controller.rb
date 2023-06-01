# frozen_string_literal: true

class Administration::UsersController < Administration::BaseController
  prepend_before_action :set_resource_class
  before_action :set_resource, only: %i[show edit update destroy toggle_status
                                        toggle_enable_2fa sidebar spoof reset_password]
  before_action :skip_authorization, only: [:sidebar]
  append_before_action :init_breadcrumbs
  append_before_action :pundit_authorize, except: [:sidebar]
  append_after_action :verify_policy_scoped, except: %i[index search_admins]

  render_entrypoint :index, element: 'users', entry: 'admin/users'

  def search_admins
    users = ::Users::Admin.search_query(params[:q]).map do |user|
      ::Projects::SearchUserSerializer.new(user).to_h
    end
    render json: users
  end

  def index; end
  # GET /administration/resources/1
  def show; end

  def new
    render 'new'
  end

  def create_superadmin
    @_resource = resource_class.new(create_resource_params)
    resource.role = User::SUPER_ADMIN_ROLE
    resource.created_by_id = current_user.id
    resource.modified_by_id = current_user.id
    resource.create_by_invite = true
    if resource.save
      audit! :create_superadmin, resource, payload: create_resource_params
      resource.invite!(current_user)
      render :create
    else
      render :new
    end
  end

  # DELETE /administration/resources/1
  def destroy
    resource.destroy
    audit! :delete_user, resource, payload: resource.log_attributes
    respond_to do |format|
      format.html do
        redirect_back(fallback_location: root_path, success: t('.successfully', name: resource.decorate.display_name))
      end
      format.js
    end
  end

  # Change resources's status to active/disabled
  #
  def toggle_status
    resource.toggle!(:disabled)
    resource.update!(modified_by_id: current_user.id)
    resource.memberships.update_all(disabled: resource.disabled)
    audit! (resource.disabled? ? :disabled : :enabled), resource, project: resource.project,
      payload: { email: resource.email }
    respond_to do |format|
      format.html do
        redirect_back(fallback_location: root_path, success: t('.successfully', name: resource.decorate.display_name))
      end
      format.js
    end
  end

  def toggle_enable_2fa
    resource.toggle!(:enable_2fa)
    resource.update!(modified_by_id: current_user.id)
    audit! (resource.enable_2fa? ? :enable_2fa : :disable_2fa), resource, project: resource.project,
      payload: { email: resource.email }

    respond_to do |format|
      format.html do
        redirect_back(fallback_location: root_path, success: t('.successfully', name: resource.decorate.display_name))
      end
      format.js
    end
  end

  # Send user instruction with reset password
  #
  def reset_password
    resource.send_reset_password_instructions
    audit! :reset_password_email, resource, payload: { email: resource.email }
    redirect_back(fallback_location: root_path, success: t('.successfully', name: resource.decorate.display_name))
  end

  def export
    @_resources = policy_scope(resource_class).includes(:clients).all
    audit! :export_users, resource
    respond_to do |format|
      filename = "#{resource_class.model_name.plural}-#{Time.zone.today}"
      format.csv do
        headers['Content-Disposition'] = "attachment; filename=\"#{filename}.csv\""
        headers['Content-Type'] ||= 'text/csv'
      end
    end
  end

  protected

  def init_breadcrumbs
    add_breadcrumb I18n.t('administration.breadcrumbs.home'), %i[administration root]
    add_breadcrumb I18n.t("administration.breadcrumbs.#{resource_class.model_name.plural}"), action: :index
  end

  # Set model
  def set_resource_class
    @_resource_class ||= User # rubocop:disable Naming/MemoizedInstanceVariableName
  end

  def create_resource_params
    params.require(:resource).permit(:first_name, :last_name, :email)
  end
end
