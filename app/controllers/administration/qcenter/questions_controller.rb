class Administration::Qcenter::QuestionsController < Administration::BaseController
  prepend_before_action :set_resource_class
  before_action :set_resource, only: [:show, :edit, :update, :destroy, :copy, :toggle_status, :sidebar]
  before_action :skip_authorization, only: [:sidebar]
  before_action :init_breadcrumbs
  append_before_action :pundit_authorize, except: [:sidebar]

  # GET /administration/resources
  def index
    @filterrific = initialize_filterrific(
      policy_scope(@resource_class),
      params[:filterrific]) || return
    @resources = @filterrific.find.where(view: :qcenter).page(params[:page])

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
    @resource.assign_attributes({view: :qcenter, type: 'MultipleChoice'})

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
        format.html do
          redirect_to({ action: :edit, id: @resource }, success: t('.successfully', name: @resource.decorate.display_name))
        end
      else
        format.html { render :edit }
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
    @assessments = policy_scope(Assessment).all
  end

  def assign

  end

  private

  def init_breadcrumbs
    add_breadcrumb I18n.t('administration.breadcrumbs.home'), [:administration, :root]
    add_breadcrumb I18n.t("administration.breadcrumbs.qcenter"), { action: :index }
  end

  # Set model
  def set_resource_class
    @resource_class ||= Question
  end

  def set_resource
    @resource = policy_scope(@resource_class).where(view: :qcenter).find(params[:id])
  end

  def resource_params
    params.require(:resource).permit(:name)
  end

  # Authorisation user
  def pundit_authorize
    authorize @resource || @resource_class
  end
end
