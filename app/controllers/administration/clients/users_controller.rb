# frozen_string_literal: true

module Administration
  module Clients
    class UsersController < Administration::BaseController
      include Administration::Clients
      prepend_before_action :set_resource_class
      before_action :ensure_not_root
      before_action :set_resource, only: %i[show edit update destroy toggle_status sidebar spoof reset_password]
      before_action :skip_authorization, only: [:sidebar]
      append_before_action :init_breadcrumbs, except: %i[new create assign_multiple]
      append_before_action :pundit_authorize, except: [:sidebar]

      def index
        @_filter_form ||= policy_scope(resource_class).
                          includes(user: %i[clients memberships]).
                          where.not(role: Membership::PROJECT_ADMIN_ROLE).
                          join_user.search(params[:q])
        filter_form.client_id_in = client.id
        @_resources = filter_form.result.page(params[:page])

        respond_to do |format|
          format.html { render :index }
          format.js { render :index, formats: [:js] }
        end
        add_breadcrumb t('.breadcrumb')
      end

      def admins
        @_filter_form = policy_scope(resource_class).
                        includes(user: %i[clients memberships]).
                        where(role: Membership::PROJECT_ADMIN_ROLE).
                        join_user.search(params[:q])
        index
      end

      def new
        @_resource = UserForm.new
        render :new, locals: { is_new: false }
      end

      def create
        @_resource = UserForm.
                     from_params(params[:resource]).
                     with_context(client: client)
        respond_to do |format|
          format.js do
            CreateUser.call(resource, [client], current_user) do
              on(:invalid, :license_error) { render(:new, locals: { is_new: true }) }
            end
          end
        end
      end

      def assign_multiple
        return unless client.project?

        if client.update(project_admin_ids: client.root.projects_admins.
          where(id: params[:project_admin_ids]).distinct.ids)
          render :create
        else
          render :error, locals: { message: client.errors.full_messages.join('<br>') }
        end
      end

      # GET /administration/resources/1/edit
      def edit
        if resource.scope == :administration
          add_breadcrumb t('administration.breadcrumbs.admins'), action: :admins
        else
          add_breadcrumb t('administration.breadcrumbs.users'), action: :index
        end
        add_breadcrumb resource.decorate.display_name, action: :edit, id: resource.id
      end

      # PATCH/PUT /administration/resources/1
      def update
        resource.user.modified_by_id = current_user.id
        respond_to do |format|
          if resource.update(update_resource_params)
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

      def export
        @_resources = policy_scope(::Membership).join_user.where(client_id: client.id)

        respond_to do |format|
          filename = "#{resource_class.model_name.plural}-#{Date.today}"
          format.csv do
            headers['Content-Disposition'] = "attachment; filename=\"#{filename}.csv\""
            headers['Content-Type'] ||= 'text/csv'
          end
        end
      end

      def export_completion_status
        results = Exports::Assessments::CompletionStatusExport.new(client.id)
        respond_to do |format|
          format.xlsx { send_data results.to_xlsx.to_stream.read, filename: 'completion_status_export.xlsx' }
        end
      end

      # Spoof as user
      def spoof
        if resource.user.is?(:superadmin, :project_admin)
          sign_in(resource.user)
        else
          spoof_token = SecureRandom.urlsafe_base64(64)
          resource.user.update_column(:spoof_token, spoof_token)
          redirect_url = root_url(domain: Settings.domain, subdomain: project.try(:subdomain), spoof_token: spoof_token)
        end
        redirect_url ||= administration_root_path
        flash.now[:success] = t('.successfully', name: resource.decorate.display_name)
        redirect_to redirect_url
      end

      # Change resources's status to active/disabled
      #
      def toggle_status
        resource.user.toggle!(:disabled)
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

      def i18n
        'memberships.admin' if client.tenancy?
      end

      protected

      def init_breadcrumbs
        client_root_breadcrumb
        unless client.retail?
          add_breadcrumb client.client.decorate.display_name, [:administration, client.client, :projects]
          if client.has_children? || client.subtenancy?
            add_breadcrumb(
              client.project.decorate.display_name,
              administration_client_project_campaigns_path(client.client, client.project)
            )
          end
          if client.sub_campaign?
            add_breadcrumb(
              client.parent.decorate.display_name,
              administration_client_project_campaign_sub_campaigns_path(client.client, client.project, client.parent)
            )
          end
        end
        add_breadcrumb client.decorate.display_name, action: :index if client.end_level?
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
