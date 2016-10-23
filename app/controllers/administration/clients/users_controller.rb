class Administration::Clients::UsersController < Administration::UsersController
  before_action :set_client

  def index
    @filterrific = initialize_filterrific(
      policy_scope(@resource_class),
      params[:filterrific],
      select_options: {
        with_role: @resource_class.options_for_with_role
      },
      available_filters: [:with_role, :sorted_by, :search_query]
    ) || return
    @resources = @filterrific.find.preload(:clients).with_client(@client.id).page(params[:page])

    respond_to do |format|
      format.html
      format.js { render :index, formats: [:js] }
    end
  end

  def new
    super
    @resource.client_ids = [@client.id]
  end

  def export
    @resources = policy_scope(@resource_class).with_client(@client.id).includes(:clients).all

    respond_to do |format|
      format.csv do
        headers['Content-Disposition'] = "attachment; filename=\"#{@resource_class.model_name.plural}-#{Date.today}.csv\""
        headers['Content-Type'] ||= 'text/csv'
      end
    end
  end

  # Spoof as user
  def spoof
    bypass_sign_in(@resource)
    redirect_to (@resource.is?(:superadmin, :admin) ? administration_root_path : root_url(domain: Settings.domain, subdomain: @client.try(:subdomain))),
                success: t('.successfully', name: @resource.decorate.display_name)
  end

  private

  def init_breadcrumbs
    add_breadcrumb I18n.t('administration.breadcrumbs.home'), [:administration, :root]
    add_breadcrumb I18n.t('administration.breadcrumbs.clients'), [:administration, :clients]
    add_breadcrumb @client.decorate.display_name, '#'
    add_breadcrumb I18n.t('administration.breadcrumbs.users'), { action: :index }
  end

  # Set model
  def set_resource_class
    @resource_class ||= User
  end

  def set_client
    @client = policy_scope(Client).find(params[:client_id])
  end

  def set_resource
    @resource = policy_scope(@resource_class).find(params[:id])
  end

  def resource_params
    params.require(:resource).permit(:first_name, :last_name, :email, :disabled, :role, manage_client_ids: [])
  end

  # Authorisation user
  def pundit_authorize
    authorize @resource || @resource_class
  end
end
