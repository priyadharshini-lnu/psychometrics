# frozen_string_literal: true

module Administration
  class NavigationLinksSerializer < Panko::Serializer
    include Rails.application.routes.url_helpers
    include ApplicationHelper

    attributes :links

    # rubocop:disable Metrics/PerceivedComplexity
    # rubocop:disable Metrics/AbcSize
    # rubocop:disable Metrics/CyclomaticComplexity
    # rubocop:disable Metrics/BlockLength -- This block needs to be long due to the complex navigation structure
    # Key names are load-bearing: AdminShell's brandHomePath reads dashboards/clients/users/assessor_dashboard.
    def links
      preload_membership_associations
      {}.tap do |links|
        links['dashboards'] = "#{admin_path}/dashboards" if show_dashboard?
        links['profile_details'] = "#{admin_path}/profile/details"
        links['profile'] = "#{admin_path}/profile"
        links['change_password'] = "#{admin_path}/profile/change_password"
        links['assessor_dashboard'] = assessors_dashboard_path if assessor_dashboard?
        links['assessor_workshops'] = assessors_assessment_centers_path if assessor_workshops?
        links['clients'] = "#{admin_path}/clients" if policy(%i[administration client]).index?
        links['skills_taxonomy'] = "#{admin_path}/skills_taxonomy" if policy(%i[api administration skill]).index?
        links['development_actions'] = "#{admin_path}/development_actions" if policy(%i[api administration
                                                                                        development_action]).index?
        links['users'] = "#{admin_path}/users" if policy(%i[administration user]).index?
        links['norms'] = "#{admin_path}/norms" if policy(%i[administration norm]).index?
        if policy(%i[administration dimension]).index?
          links['dimensions'] = if Settings.features.dimensions_react_ui
                                  "#{admin_path}/dimensions"
                                else
                                  administration_dimensions_path
                                end
        end
        links['assessments'] = "#{admin_path}/assessments" if policy(%i[administration assessment]).index?
        links['user_availability'] = "#{admin_path}/user_availabilities"
        if policy(%i[administration question]).index?
          links['question_center'] = if Settings.features.question_center_react_ui
                                       "#{admin_path}/templates/questions"
                                     else
                                       administration_templates_questions_path
                                     end
        end
        if policy(%i[administration library]).index?
          links['libraries'] = if Settings.features.libraries_react_ui
                                 "#{admin_path}/libraries"
                               else
                                 administration_libraries_path
                               end
        end
        if policy(%i[administration communication]).index?
          links['communication_center'] = administration_communications_path
        end
        if object.is?(:superadmin) && Settings.features.communication_center_enabled
          links['new_communication_center'] = "#{admin_path}/communication_center"
        end
        links['reports'] = "#{admin_path}/reports" if policy(%i[administration report]).index?
        if policy(%i[administration report_approval]).index?
          links['report_approvals'] = "#{admin_path}/report_approvals/my_tasks"
        end
        if policy(%i[administration ai_scoring_approval]).index?
          links['ai_scoring_approvals'] = "#{admin_path}/ai_scoring_approvals"
        end
        if policy(%i[administration data_reports]).index?
          links['data_reports'] = "#{admin_path}/data_reports"
        end
        if policy(%i[administration campaign_template]).index?
          links['campaign_templates'] = "#{admin_path}/campaign_templates"
        end
        links['audit_logs'] = "#{admin_path}/audit_logs" if policy(%i[administration audit_log]).index?
        if policy(%i[api administration ai assistant]).index? && feature_enabled?(:ai_assistant_enabled)
          links['ai_assistants'] = "#{admin_path}/ai_assistants"
        end
        links['settings'] = "#{admin_path}/settings" if policy(%i[api administration
                                                                  maintenance_setting]).index?
      end.transform_keys! { |k| k.camelcase(:lower) }
    end
    # rubocop:enable Metrics/PerceivedComplexity
    # rubocop:enable Metrics/AbcSize
    # rubocop:enable Metrics/CyclomaticComplexity
    # rubocop:enable Metrics/BlockLength

    def assessor_footprint?
      object.is?(:client_assessor)
    end

    def assessor_dashboard?
      policy(%i[assessors campaign]).index? && assessor_footprint?
    end

    def assessor_workshops?
      policy(%i[assessors workshop]).index? && assessor_footprint?
    end

    def policy(name)
      klass = "#{Array.wrap(name).map(&:to_s).map(&:camelize).join('::')}Policy".constantize # rubocop:disable Performance/MapMethodChain
      klass.new(object, nil, project_id: context[:project_id])
    end

    def current_user
      object
    end

    def feature_enabled?(feature)
      Settings.features[feature]
    end

    def preload_membership_associations
      return if object.memberships.loaded? && object.memberships.all? do |m|
        m.association(:admin_roles).loaded? && m.association(:grants).loaded?
      end

      ActiveRecord::Associations::Preloader.new(
        records: [object],
        associations: { memberships: %i[admin_roles grants] }
      ).call
    end
  end
end
