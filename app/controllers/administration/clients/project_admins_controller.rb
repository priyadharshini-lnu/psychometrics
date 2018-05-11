module Administration
  module Clients
    class ProjectAdminsController < Administration::BaseController
      include Administration::Clients
      prepend_before_action :set_resource_class
      before_action :ensure_not_root
      before_action :set_resource, only: [:show, :edit, :update, :destroy, :toggle_status, :sidebar, :spoof, :reset_password]
      before_action :skip_authorization, only: [:sidebar]
      append_before_action :init_breadcrumbs, except: [:new, :create, :assign_multiple]
      append_before_action :pundit_authorize, except: [:sidebar]

      def index
        @_filter_form = policy_scope(resource_class)
                           .includes(user: [:clients, :memberships])
                           .where(role: Membership::PROJECT_ADMIN_ROLE)
                           .join_user.search(params[:q])
        filter_form.client_id_in = client.id
        @_resources = filter_form.result.page(params[:page])

        respond_to do |format|
          format.html
          format.js { render :index, formats: [:js] }
        end
        add_breadcrumb t('.breadcrumb')
      end

      def new
        @_resource = resource_class.new
        # Assign grants to new user
        @_resource.build_user
        @_resource.user.grants = current_user.is?(:client_admin) ? current_user.grants : User::DEFAULT_PROJECT_ADMIN_GRANTS
        render 'new', locals: { is_new: false }
      end

      def create
        @_resource = resource_class.new(create_resource_params)
        resource.client = policy_scope(Client).where(id: client.id).take
        resource.role = Membership::PROJECT_ADMIN_ROLE

        user = User.find_by(email: resource.user&.email)
        if user
          resource.user = user
          resource.user.assign_attributes(create_resource_params[:user_attributes])
        end

        resource.user.tap do |u|
          u.create_by_invite = true
          u.created_by_id = current_user.id
          u.modified_by_id = current_user.id
        end

        respond_to do |format|
          if resource.save
            resource.user.invite!(current_user, client.id)
            format.js
          else
            format.js { render :new, locals: { is_new: true } }
          end
        end
      end

      def assign_multiple
        return unless client.project?
        if client.update(project_admin_ids: client.root.projects_admins.where(id: params[:project_admin_ids]).distinct.ids)
          render :create
        else
          render :error, locals: { message: client.errors.full_messages.join('<br>') }
        end
      end

      # GET /administration/resources/1/edit
      def edit
        add_breadcrumb t('administration.breadcrumbs.project_admins'), { action: :index }
        add_breadcrumb resource.decorate.display_name, { action: :edit, id: resource.id }
      end

      # PATCH/PUT /administration/resources/1
      def update
        resource.user.modified_by_id = current_user.id
        respond_to do |format|
          if resource.update(update_resource_params)
            format.html do
              redirect_to({ action: :edit, id: resource }, success: t('administration.memberships.update.successfully', name: resource.user.decorate.display_name))
            end
          else
            format.html { render :edit }
          end
        end
      end

      def destroy
        if resource.user.memberships.count == 1
          resource.user.destroy
        else
          resource.destroy
        end
        respond_to do |format|
          format.html do
            redirect_back(
              fallback_location: root_path, success: t('.successfully', name: resource.decorate.display_name)
            )
          end
          format.js
        end
      end

      # Spoof as user
      def spoof
        sign_in(resource.user)
        redirect_url ||= administration_root_path
        flash.now[:success] = t('.successfully', name: resource.decorate.display_name)
        redirect_to redirect_url
      end

      # Change resources's status to active/disabled
      #
      def toggle_status
        resource.toggle!(:disabled)
        # Reload with join_user
        @_resource = policy_scope(resource_class).join_user.find(params[:id])
        respond_to do |format|
          format.html do
            redirect_back(
              fallback_location: root_path, success: t('.successfully', name: resource.decorate.display_name)
            )
          end
          format.js
        end
      end

      def reset_password
        resource.user.send_reset_password_instructions
        redirect_back(fallback_location: root_path, success: t('.successfully', name: resource.decorate.display_name))
      end

      protected

      def init_breadcrumbs
        client_root_breadcrumb
        unless client.retail?
          add_breadcrumb client.client.decorate.display_name, [:administration, client.client, :projects]
          add_breadcrumb client.project.decorate.display_name, administration_client_project_campaigns_path(client.client, client.project) if client.has_children? || client.subtenancy?
          add_breadcrumb client.parent.decorate.display_name, administration_client_project_campaign_sub_campaigns_path(client.client, client.project, client.parent) if client.sub_campaign?
        end
        add_breadcrumb client.decorate.display_name, { action: :index } if client.end_level?
      end

      def create_resource_params
        params.require(:resource).permit(policy(resource_class).permitted_attributes_for_create)
      end

      def update_resource_params
        params.require(:resource).permit(policy(resource).permitted_attributes_for_update)
      end

      def set_resource_class
        @_resource_class ||= ::Membership
      end

      def set_resource
        @_resource = policy_scope(resource_class).join_user.find(params[:id])
      end
    end
  end
end
