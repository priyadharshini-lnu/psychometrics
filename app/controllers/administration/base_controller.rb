# frozen_string_literal: true

module Administration
  class BaseController < ::BaseController
    include Administration::Policies
    include Administration::Helpers
    layout 'administration'

    before_action :set_locale

    append_after_action :verify_authorized, except: :index
    append_after_action :verify_policy_scoped, only: :index

    rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized

    before_action :init_state

    private

    def user_not_authorized
      audit! :user_not_authorized, current_user, payload: params, outcome: :failed,
      failure_reason: :user_not_authorized
      render plain: I18n.t('errors.forbidden'), status: 403
    end

    def authenticate_user!
      if user_signed_in? && !current_user.is?(
        :superadmin, :client_admin, :project_admin, :campaign_admin, :assessor
      )
        sign_out current_user
      end
      super
    end

    def pundit_authorize
      authorize resource || resource_class
    end

    def set_resource
      @_resource = policy_scope(resource_class).find(params[:id])
    end

    def resource=(resource)
      @_resource = resource
    end

    def set_locale
      I18n.locale = cookies[:locale] || I18n.default_locale
    end

    def init_state
      return unless request.format.html?

      @init_state = {
        currentUser: ::Administration::Campaigns::CurrentUserSerializer.new(
          context: {
            project_id: params[:client_id]
          }
        ).serialize(current_user),
        ui: {
          menu: ::Administration::NavigationLinksSerializer.new(
            context: {
              project_id: params[:client_id]
            }
          ).serialize(current_user)
        },
        config: {
          availableLocales: I18n.available_locales,
          features: feature_flags
        }
      }
    end

    class << self
      def render_entrypoint(actions, element:, entry:)
        actions = Array.wrap(actions)

        @_entrypoints ||= {}.with_indifferent_access
        actions.each do |action|
          @_entrypoints[action] = [element, entry]
        end

        before_action :handle_render_entrypoint, only: actions
      end
    end

    def handle_render_entrypoint
      entrypoints = self.class.instance_variable_get(:@_entrypoints)
      element, entry = entrypoints[action_name]

      if request.format.html?
        @do_not_render_rails_menu = true
        render('shared/frontend_entry', locals: { element: element, entry: entry }) && return
      end
    end
  end
end
