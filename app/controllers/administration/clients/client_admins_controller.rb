# frozen_string_literal: true

module Administration
  module Clients
    class ClientAdminsController < Administration::BaseController
      include Administration::Clients
      prepend_before_action :set_resource_class
      before_action :ensure_client
      before_action :set_resource, only: %i[show edit update destroy toggle_status sidebar spoof reset_password]
      before_action :skip_authorization, only: %i[sidebar index create edit update destroy]
      append_before_action :init_breadcrumbs, except: %i[new create assign_multiple]
      append_before_action :pundit_authorize, except: %i[sidebar index create edit update destroy]

      def index
        authorize resource_class, :can_manage_client_admins?
        @filter_term = params.dig(:q, :filterable_fields)
        @_filter_form = policy_scope(resource_class).
                        includes(user: %i[clients memberships]).
                        where(role: Membership::CLIENT_ADMIN_ROLE).
                        join_user.ransack(params[:q])
        filter_form.client_id_in = client.id
        @_resources = filter_form.result.page(params[:page])

        respond_to do |format|
          format.html
          format.js { render :index, formats: [:js] }
        end
        add_breadcrumb t('.breadcrumb')
      end

      def new_step_one
        @form = ::Memberships::PrepareUserForm.new
        render 'new', locals: { form: 'fetch_user_form' }
      end

      def new_step_two
        @form = ::Memberships::PrepareUserForm.from_params(params)
        ::Memberships::PrepareUserToCreateCommand.call(@form, User::DEFAULT_ADMIN_GRANTS) do
          on(:invalid) { render 'new', locals: { form: 'fetch_user_form' } }
          on(:ok) do |res|
            self.resource = res
            render 'new', locals: { is_new: false }
          end
        end
      end

      def create
        authorize resource_class, :can_manage_client_admins?
        ::Memberships::CreateAdminCommand.
          call(resource_class.new(create_resource_params), client, current_user, Membership::CLIENT_ADMIN_ROLE) do
          on(:invalid) { render :new, locals: { is_new: true } }
          on(:ok) do |res|
            audit! :create_client_admin, res, client: client, payload: create_resource_params
            self.resource = res
          end
        end
      end

      def assign_multiple
        return unless client.root?

        if client.update(client_admin_ids: User.client_admins.where(id: params[:client_admin_ids]).distinct.ids)
          render :create
        else
          render :error, locals: { message: client.errors.full_messages.join('<br>') }
        end
      end

      # GET /administration/resources/1/edit
      def edit
        authorize resource_class, :can_manage_client_admins?
        add_breadcrumb t('administration.breadcrumbs.client_admins'), action: :index
        add_breadcrumb resource.decorate.display_name, action: :edit, id: resource.id
      end

      # PATCH/PUT /administration/resources/1
      def update
        authorize resource_class, :can_manage_client_admins?
        resource.user.modified_by_id = current_user.id
        respond_to do |format|
          if resource.update(update_resource_params)
            audit! :update_client_admin, resource, client: client, payload: params
            format.html do
              redirect_to({ action: :edit, id: resource },
                          success: t('administration.memberships.update.successfully',
                                     name: resource.user.decorate.display_name))
            end
          else
            format.html { render :edit }
          end
        end
      end

      def destroy
        authorize resource_class, :can_manage_client_admins?
        resource.destroy
        audit! :delete_client_admin, resource, client: client, payload: resource.log_attribute_for_delete
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
        audit! :sign_in_as, current_user, payload: { sign_in_as: resource.email }
        sign_in(resource.user)
        redirect_url ||= administration_root_path
        flash.now[:success] = t('.successfully', name: resource.decorate.display_name)
        redirect_to redirect_url
      end

      # Change resources's status to active/disabled
      #
      def toggle_status
        authorize resource_class, :can_manage_client_admins?
        resource_class.update(@_resource.id, disabled: !@_resource.membership_disabled)
        # Reload with join_user
        @_resource = policy_scope(resource_class).join_user.find(params[:id])
        audit! :toggle_status, resource, payload: { disabled: resource.disabled }
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
        audit! :reset_password, resource
        redirect_back(fallback_location: root_path, success: t('.successfully', name: resource.decorate.display_name))
      end

      protected

      def init_breadcrumbs
        client_root_breadcrumb
        add_breadcrumb client.decorate.display_name, [:administration, client.client, :projects]
      end

      def create_resource_params
        params.require(:resource).permit(policy(resource_class).permitted_attributes_for_create)
      end

      def update_resource_params
        params.require(:resource).permit(policy(resource).permitted_attributes_for_update)
      end

      def set_resource_class
        @_resource_class ||= ::Membership # rubocop:disable Naming/MemoizedInstanceVariableName
      end

      def set_resource
        @_resource = policy_scope(resource_class).join_user.find(params[:id])
      end
    end
  end
end
