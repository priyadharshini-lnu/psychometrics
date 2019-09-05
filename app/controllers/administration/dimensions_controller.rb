class Administration::DimensionsController < Administration::BaseController
  prepend_before_action :set_resource_class
  before_action :set_resource, only: [:edit, :update, :destroy, :copy, :toggle_status, :sidebar]
  before_action :skip_authorization, only: [:sidebar]
  append_before_action :init_breadcrumbs
  append_before_action :pundit_authorize, except: [:sidebar]


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
  end

  def create
    @_resource = resource_class.new(resource_params)
    resource.owner_id = current_user.client_admin_clients.take.id if current_user.is?(:client_admin)

    respond_to do |format|
      if resource.save
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
    resource.destroy
    respond_to do |format|
      format.html do
        redirect_back(fallback_location: root_path, success: t('.successfully', name: resource.decorate.display_name))
      end
      format.js
    end
  end

  def copy
    respond_to do |format|
      @cloned_resource = resource.clone_and_save
      if @cloned_resource
        format.js
      else
        format.js { render :error, locals: { message: t('administration.dimensions.copy.error', { id: resource.id }) } }
      end
    end
  end

  private

  def set_resource_class
    @_resource_class ||= Dimension
  end

  def init_breadcrumbs
    add_breadcrumb I18n.t('administration.breadcrumbs.home'), [:administration, :root]
    add_breadcrumb I18n.t("administration.breadcrumbs.#{resource_class.model_name.plural}"), { action: :index }
  end

  def resource_params
    params.require(:resource).permit(:name, :owner_id, :occupations_enabled, :innovation_styles_enabled)
  end
end
