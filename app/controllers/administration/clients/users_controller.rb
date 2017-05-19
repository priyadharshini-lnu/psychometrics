module Administration
  module Clients
    class UsersController < Administration::BaseController
      prepend_before_action :set_resource_class
      before_action :set_resource, only: [:show, :edit, :update, :destroy, :toggle_status, :sidebar, :spoof, :reset_password]
      before_action :skip_authorization, only: [:sidebar]
      append_before_action :init_breadcrumbs, except: [:new, :create, :assign_multiple]
      append_before_action :pundit_authorize, except: [:sidebar]

      def index
        @filter_form = policy_scope(@resource_class).includes(user: [:clients, :memberships]).join_user.search(params[:q])
        @filter_form.client_id_in = client.id
        @resources = @filter_form.result.page(params[:page])

        respond_to do |format|
          format.html
          format.js { render :index, formats: [:js] }
        end
      end

      def new
        @resource = @resource_class.new
        render 'new', locals: { is_new: false }
      end

      def create
        @resource = @resource_class.new(create_resource_params)
        @resource.client = client
        if client.tenancy?
          @resource.client = project
          @resource.role = Membership::ADMIN_ROLE
        end
        respond_to do |format|
          if @resource.user
            @resource.user.create_by_invite = true
            @resource.user.email = @resource.email
            @resource.user.first_name = @resource.first_name
            @resource.user.last_name = @resource.last_name
          end
          if @resource.save
            @resource.user.invite!(current_user, client.id)
            format.js
          else
            format.js { render :new, locals: { is_new: true } }
          end
        end
      end

      def assign_multiple
        if client.tenancy?
          begin
            project.admin_ids = client.projects_admins.where(id: params[:admin_ids]).ids
          rescue => e
            @resource = @resource_class.new
            render :new, locals: { is_new: false } and return
          end
        end
        render :create
      end

      # GET /administration/resources/1/edit
      def edit
        add_breadcrumb @resource.decorate.display_name, { action: :edit, id: @resource.id }
      end

      # PATCH/PUT /administration/resources/1
      def update
        respond_to do |format|
          if @resource.update(update_resource_params)
            format.html do
              redirect_to({ action: :edit, id: @resource }, success: t('administration.memberships.update.successfully', name: @resource.user.decorate.display_name))
            end
          else
            format.html { render :edit }
          end
        end
      end

      def destroy
        @resource.destroy
        respond_to do |format|
          format.html { redirect_to(:back, success: t('.successfully', name: @resource.decorate.display_name)) }
          format.js
        end
      end

      def export
        @resources = policy_scope(::Membership).join_user.where(client_id: client.id)

        respond_to do |format|
          format.csv do
            headers['Content-Disposition'] = "attachment; filename=\"#{@resource_class.model_name.plural}-#{Date.today}.csv\""
            headers['Content-Type'] ||= 'text/csv'
          end
        end
      end

      # Spoof as user
      def spoof
        bypass_sign_in(@resource.user)
        redirect_url = if @resource.user.is?(:superadmin, :admin)
                         administration_root_path
                       else
                         root_url(domain: Settings.domain, subdomain: project.try(:subdomain))
                       end
        redirect_to(redirect_url, success: t('.successfully', name: @resource.decorate.display_name))
      end

      # Change resources's status to active/disabled
      #
      def toggle_status
        @resource.toggle!(:disabled)
        # Reload with join_user
        @resource = policy_scope(@resource_class).join_user.find(params[:id])
        respond_to do |format|
          format.html { redirect_to(:back, success: t('.successfully', name: @resource.decorate.display_name)) }
          format.js
        end
      end

      # Send user instruction with reset password
      #
      def reset_password
        @resource.user.send_reset_password_instructions
        redirect_to :back, success: t('.successfully', name: @resource.decorate.display_name)
      end

      def i18n
        'memberships.admin' if client.tenancy?
      end

      protected

      def init_breadcrumbs
        add_breadcrumb I18n.t('administration.breadcrumbs.home'), [:administration, :root]
        add_breadcrumb I18n.t('administration.breadcrumbs.clients'), [:administration, :clients]
        unless client.retail?
          add_breadcrumb client.client.decorate.display_name, [:administration, client.client, :projects]
          add_breadcrumb client.project.decorate.display_name, administration_client_project_campaigns_path(client.client, client.project) unless client.project_level?
        end
        add_breadcrumb client.decorate.display_name, { action: :index }
      end

      def create_resource_params
        params.require(:resource).permit(policy(@resource_class).permitted_attributes_for_create)
      end

      def update_resource_params
        params.require(:resource).permit(policy(@resource).permitted_attributes_for_update)
      end

      # Set model
      def set_resource_class
        @resource_class ||= ::Membership
      end

      def set_resource
        @resource = policy_scope(@resource_class).join_user.find(params[:id])
      end

      # Authorisation user
      def pundit_authorize
        authorize @resource || @resource_class
      end
    end
  end
end
