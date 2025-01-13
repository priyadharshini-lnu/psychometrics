# frozen_string_literal: true

module Administration
  class NavigationLinksSerializer < Panko::Serializer
    include Rails.application.routes.url_helpers
    include ApplicationHelper

    attributes :links

    # rubocop:disable Metrics/PerceivedComplexity
    # rubocop:disable Metrics/AbcSize
    # rubocop:disable Metrics/CyclomaticComplexity
    # rubocop:disable Metrics/BlockLength:
    def links
      {}.tap do |links|
        links['dashboards'] = "#{admin_path}/dashboards" if show_dashboard?
        links['profile_details'] = "#{admin_path}/profile/details"
        links['profile'] = "#{admin_path}/profile"
        links['change_password'] = "#{admin_path}/profile/change_password"
        links['assessor_dashboard'] = assessors_dashboard_path if policy(%i[assessors campaign]).index?
        links['assessor_workshops'] = assessors_assessment_centers_path if policy(%i[assessors workshop]).index?
        links['clients'] = "#{admin_path}/clients" if policy(%i[administration client]).index?
        links['skills'] = "#{admin_path}/skills" if policy(%i[api administration skill]).index?
        links['users'] = "#{admin_path}/users" if policy(%i[administration user]).index?
        links['norms'] = administration_norms_path if policy(%i[administration norm]).index?
        links['dimensions'] = administration_dimensions_path if policy(%i[administration dimension]).index?
        links['assessments'] = "#{admin_path}/assessments" if policy(%i[administration assessment]).index?
        links['user_availability'] = "#{admin_path}/user_availabilities"
        if policy(%i[administration question]).index?
          links['question_center'] = administration_templates_questions_path
        end
        links['libraries'] = administration_libraries_path if policy(%i[administration library]).index?
        if policy(%i[administration communication]).index?
          links['communication_center'] = administration_communications_path
        end
        links['reports'] = "#{admin_path}/reports" if policy(%i[administration report]).index?
        if policy(%i[administration report_approval]).index?
          links['report_approvals'] = "#{admin_path}/report_approvals/my_tasks"
        end
        if policy(%i[administration campaign_template]).index?
          links['campaign_templates'] = "#{admin_path}/campaign_templates"
        end
        links['audit_logs'] = "#{admin_path}/audit_logs" if policy(%i[administration audit_log]).index?
      end.transform_keys! { |k| k.camelcase(:lower) }
    end
    # rubocop:enable Metrics/PerceivedComplexity
    # rubocop:enable Metrics/AbcSize
    # rubocop:enable Metrics/CyclomaticComplexity
    # rubocop:enable Metrics/BlockLength

    def policy(name)
      klass = "#{Array.wrap(name).map(&:to_s).map(&:camelize).join('::')}Policy".constantize # rubocop:disable Performance/MapMethodChain
      klass.new(object, nil, project_id: context[:project_id])
    end

    def current_user
      object
    end
  end
end
