# frozen_string_literal: true

module Administration
  class ClientsController < Administration::BaseController
    include Administration::Clients
    prepend_before_action :set_resource_class
    before_action :set_resource, only: %i[show edit update destroy sidebar toggle_status copy archive]
    before_action :skip_authorization, only: [:sidebar]
    append_before_action :pundit_authorize, except: [:sidebar]
    append_before_action :init_collections, only: %i[new create edit update]
    before_action :skip_policy_scope, only: [:index]

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
          audit! :create, resource, payload: resource_params, client: resource
          if resource.project? && current_user.is?(:project_admin)
            current_user.memberships.create!(client: resource, role: Membership::PROJECT_ADMIN_ROLE)
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
          audit! :update, resource, payload: resource_params, client: resource
          format.js
        else
          format.js { render :edit }
        end
      end
    end

    # DELETE /administration/resources/1
    def destroy
      audit! :delete, resource, payload: resource.log_attribute_for_delete
      resource.destroy
      respond_to do |format|
        format.html do
          redirect_back(fallback_location: root_path, success: t('.successfully', name: resource.decorate.display_name))
        end
        format.js
      end
    end

    def archive
      resource.update_attribute(:archived, true)
      audit! :archive, resource, client: resource
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
      audit! :toggle_status, resource, client: resource, payload: { disabled: resource.disabled }
      respond_to do |format|
        format.html do
          redirect_back(fallback_location: root_path, success: t('.successfully', name: resource.decorate.display_name))
        end
        format.js
      end
    end

    def copy
      audit! :copy, resource, client: resource, payload: { source_id: resource.id }
      ::Clients::CopyClient.call(resource) do
        on(:invalid) { render(:error, locals: { message: t('.error', name: resource.decorate.display_name) }) }
        on(:ok) { |cloned_resource| render :copy, locals: { cloned_resource: cloned_resource } }
      end
    end

    def export
      @_resources = policy_scope(resource_class).tenancies.enabled.includes(projects: :project_admins)

      audit! :export, resource, client: resource
      respond_to do |format|
        filename = "#{resource_class.model_name.plural}-#{Time.zone.today}"
        format.csv do
          headers['Content-Disposition'] = "attachment; filename=\"#{filename}.csv\""
          headers['Content-Type'] ||= 'text/csv'
        end
      end
    end

    private

    def pundit_authorize
      authorize(
        resource || resource_class,
        nil,
        project_id: resource.id
      )
    end

    def set_resource_class
      @_resource_class ||= Client # rubocop:disable Naming/MemoizedInstanceVariableName
    end

    def init_breadcrumbs
      client_root_breadcrumb
    end

    def resource_params
      params.require(:resource).permit(:name, :subdomain, :year, :number, :country, :type,
                                       :project_manager_id)
    end

    def init_collections
      @super_admins = User.superadmins.order(first_name: :asc)
      @countries = ::Datas::Geo.order(:country_name).select(:country_name).distinct
    end
  end
end
