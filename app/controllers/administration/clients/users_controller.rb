module Administration
  module Clients
    class UsersController < Administration::BaseController
      prepend_before_action :set_resource_class
      before_action :set_resource, only: [:show, :edit, :update, :destroy, :toggle_status, :sidebar, :spoof, :reset_password]
      before_action :skip_authorization, only: [:sidebar]
      append_before_action :init_breadcrumbs, :client
      append_before_action :pundit_authorize, except: [:sidebar]

      def index
        @filter_form = policy_scope(@resource_class).join_user.search(params[:q])
        @filter_form.client_id_in = @client.id
        @resources = @filter_form.result.page(params[:page])

        respond_to do |format|
          format.html
          format.js { render :index, formats: [:js] }
        end
      end

      def new
        @resource = @resource_class.new
        @resource.build_user
      end

      def create
        @resource = @resource_class.new(resource_params)
        @resource.client_id = @client.id
        @resource.user.operator = current_user
        respond_to do |format|
          if @resource.save
            @resource.user.invite!(current_user)
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
        @resource.user.operator = current_user
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
        @resource.destroy
        respond_to do |format|
          format.html { redirect_to(:back, success: t('.successfully', name: @resource.decorate.display_name)) }
          format.js
        end
      end

      def export
        @resources = policy_scope(::Membership).join_user.where(client_id: @client.id)

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
                         root_url(domain: Settings.domain, subdomain: @client.try(:subdomain))
                       end
        redirect_to(redirect_url, success: t('.successfully', name: @resource.decorate.display_name))
      end

      # Change resources's status to active/disabled
      #
      def toggle_status
        @resource.memberships.find_by(client_id: @client.id).toggle!(:disabled)
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
        params.require(:resource).permit(
          :parent_id, user_attributes: [
            :id, :first_name, :last_name,
            :email, :disabled, :role
          ], hris_data: [:key, :value]
        )
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
