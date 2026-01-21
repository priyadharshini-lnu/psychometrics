# frozen_string_literal: true

module Administration
  class BaseController < ::BaseController
    include SiemLogger::ControllerHelper
    include SetCurrentCountry
    include GeoRestriction
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
      I18n.locale = cookies[:locale].presence || I18n.default_locale
    end

    def project_flags
      match = params[:all]&.match(%r{projects/(\d+)})
      return {} unless match

      project_id = match[1]
      project = Project.includes(:project_feature, client: :client_feature).find_by(id: project_id)
      return {} unless project

      {
        idpEnabled: project.client.feature_enabled?(:idp) && project.project_feature_enabled?(:idp),
        enhanceWithAiEnabled: project.client.feature_enabled?(:enhance_with_ai) &&
          project.project_feature_enabled?(:enhance_with_ai),
        aiTranslationEnabled: project.client.feature_enabled?(:ai_translation) &&
          project.project_feature_enabled?(:ai_translation)
      }
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
          features: feature_flags,
          availableAiProviders: available_ai_providers_with_details,
          project: project_flags
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

    def available_ai_providers_with_details
      available_ids = Settings.available_ai_providers.to_s.delete("'[]").split(',').map(&:strip).compact_blank

      (Settings.ai_providers || []).
        select { |p| available_ids.include?(p['model_id']) }.
        map { |p| p.to_h.slice(:model_id, :description, :region, :model, :name, :provider) }
    end

    def handle_render_entrypoint
      entrypoints = self.class.instance_variable_get(:@_entrypoints)
      element, entry = entrypoints[action_name]

      if request.format.html?
        @do_not_render_rails_menu = true
        render('shared/frontend_entry', locals: { element: element, entry: entry }) && return
      end
    end

    def siem_log_impersonation_event(target_user, role)
      super(target_user, current_user, role)
    end
  end
end
