class Administration::Templates::BlocksController < Administration::BaseController
  prepend_before_action :set_resource_class
  before_action :set_resource, only: [:show, :edit, :update, :destroy, :copy, :toggle_status, :sidebar, :new_assign, :preview]
  before_action :skip_authorization, only: [:sidebar]
  before_action :init_breadcrumbs
  append_before_action :pundit_authorize, except: [:sidebar]

  # GET /administration/resources
  def index
    @filterrific = initialize_filterrific(
      policy_scope(@resource_class),
      params[:filterrific]) || return
    @resources = @filterrific.find.templates.includes(blocks: [:assessment]).page(params[:page])

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
    @resource.assign_attributes({view: :templates})

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

  def new_assign
  end

  def preview
    add_breadcrumb @resource.decorate.display_name, { action: :edit, id: @resource.id }
    @data = {
      restricted: true, # hide header and footer in preview
      flow: { elements: [] }, # hack
      blocks: [BlockSerializer.new(@resource).to_hash(include: '**')]
    }.to_json
  end

  private

  def init_breadcrumbs
    add_breadcrumb I18n.t('administration.breadcrumbs.home'), [:administration, :root]
    add_breadcrumb I18n.t("administration.breadcrumbs.question_center"), { action: :index }
  end

  # Set model
  def set_resource_class
    @resource_class ||= Block
  end

  def set_resource
    @resource = policy_scope(@resource_class).templates.find(params[:id])
  end

  def resource_params
    params.require(:resource).permit(:name, assign_to_assessment_ids: [])
  end

  # Authorisation user
  def pundit_authorize
    authorize @resource || @resource_class
  end
end
