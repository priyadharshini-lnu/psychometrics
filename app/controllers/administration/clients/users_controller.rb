class Administration::Clients::UsersController < Administration::UsersController
  append_before_action :client

  def index
    @filter_form = policy_scope(@resource_class).search(params[:q])
    @filter_form.memberships_client_id_in = @client.id
    @resources = @filter_form.result.preload(:clients).page(params[:page])

    respond_to do |format|
      format.html
      format.js { render :index, formats: [:js] }
    end
  end

  def new
    @resource = @resource_class.new
    @direct_managers = @client.users
    @resource.memberships.build
  end

  def create
    @resource = @resource_class.new({ operator: current_user })
    @resource.assign_attributes(resource_params)
    @resource.memberships.first[:client_id] = @client.id
    respond_to do |format|
      if @resource.save
        @resource.invite!(current_user)
        format.js
      else
        format.js { render :new }
      end
    end
  end

  # GET /administration/resources/1/edit
  def edit
    @direct_managers = @client.users.exclude_ids([@resource.id])
    add_breadcrumb @resource.decorate.display_name, { action: :edit, id: @resource.id }
  end

  # PATCH/PUT /administration/resources/1
  def update
    @resource.operator = current_user
    respond_to do |format|
      if @resource.update(resource_params)
        format.html do
          redirect_to({ action: :edit, id: @resource }, success: t('.successfully', name: @resource.decorate.display_name))
        end
      else
        format.html { render :edit }
      end
    end
  end

  def destroy
    @resource.memberships.find_by(client_id: @client.id).destroy
    respond_to do |format|
      format.html { redirect_to(:back, success: t('.successfully', name: @resource.decorate.display_name)) }
      format.js
    end
  end

  def export
    @resources = policy_scope(@client.users).includes(:clients).all

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

  protected

  def client
    @client ||= policy_scope(Client).find(params[:client_id])
  end

  def init_breadcrumbs
    add_breadcrumb I18n.t('administration.breadcrumbs.home'), [:administration, :root]
    add_breadcrumb I18n.t('administration.breadcrumbs.clients'), [:administration, :clients]
    add_breadcrumb client.decorate.display_name, '#'
    add_breadcrumb I18n.t('administration.breadcrumbs.users'), { action: :index }
  end

  def resource_params
    params.require(:resource).permit(:first_name,
                                     :last_name,
                                     :email,
                                     :disabled,
                                     :role,
                                     memberships_attributes: [:parent_id, :id],
                                     hris_data: [:key, :value])
  end

  # Authorisation user
  def pundit_authorize
    authorize @resource || @resource_class
  end
end
