module Administration
  class ClientsController < Administration::BaseController
    prepend_before_action :set_resource_class
    before_action :set_resource, only: [:show, :edit, :update, :destroy, :sidebar, :toggle_status, :copy, :archive]
    before_action :skip_authorization, only: [:sidebar]
    append_before_action :init_breadcrumbs
    append_before_action :pundit_authorize, except: [:sidebar]

    def index
      @_filter_form = policy_scope(resource_class).tenancies.includes(:projects_admins).order(:name).search(params[:q])
      filter_form.archived_true ||= false
      @_resources = filter_form.result.page(params[:page])

      respond_to do |format|
        format.html
        format.js { render :index, formats: [:js] }
      end
    end

    def new
      @_resource = resource_class.new
    end

    def show
      redirect_to administration_client_users_path(resource.id)
    end

    def create
      @_resource ||= resource_class.new(resource_params)
      resource.creator = current_user
      resource.modifier = current_user
      resource.operator = current_user
      respond_to do |format|
        if resource.save
          if resource.project? && current_user.is?(:admin)
            current_user.memberships.create!(client: resource, role: Membership::ADMIN_ROLE)
          end
          format.js
        else
          format.js { render :new }
        end
      end
    end

    def update
      resource.modifier = current_user
      resource.assign_attributes(resource_params)
      resource.operator = current_user
      respond_to do |format|
        if resource.save
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
        format.html { redirect_to(:back, success: t('.successfully', name: resource.decorate.display_name)) }
        format.js
      end
    end

    def archive
      resource.update_attribute(:archived, true)
      respond_to do |format|
        format.html { redirect_to(:back, success: t('.successfully', name: resource.decorate.display_name)) }
        format.js
      end
    end

    # Change resources's status to active/disabled
    #
    def toggle_status
      resource.toggle!(:disabled)
      respond_to do |format|
        format.html { redirect_to(:back, success: t('.successfully', name: resource.decorate.display_name)) }
        format.js
      end
    end

    def copy
      @cloned_resource = resource.clone
      respond_to do |format|
        if @cloned_resource.save
          format.js
        else
          format.js do
            render(:error, locals: { message: t('.error', name: resource.decorate.display_name) })
          end
        end
      end
    end

    def export
      @_resources = policy_scope(resource_class).tenancies.enabled.includes(projects: :admins)

      respond_to do |format|
        format.csv do
          headers['Content-Disposition'] = "attachment; filename=\"#{resource_class.model_name.plural}-#{Date.today}.csv\""
          headers['Content-Type'] ||= 'text/csv'
        end
      end
    end

    private

    def set_resource_class
      @_resource_class ||= Client
    end

    def init_breadcrumbs
      label = t("administration.breadcrumbs.#{resource_class.model_name.plural}") if current_user.is?(:superadmin)
      label ||= t('administration.breadcrumbs.home')
      add_breadcrumb label, [:administration, :root]
    end

    def resource_params
      params.require(:resource).permit(:name, :subdomain, :year, :number, :country, :type,
                                       :account_manager_id, :project_manager_id, report_family_ids: [])
    end
  end
end
