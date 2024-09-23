# frozen_string_literal: true

module AdministrationHelper
  def alert_panel(message, type = 'warning', dismissable = true)
    content_tag :div, class: "alert alert-#{type} alert-dismissible", role: 'alert' do
      if dismissable
        concat content_tag(:button, content_tag(:span, '&times;'.html_safe), class: 'close', data: { dismiss: 'alert' })
      end
      concat h(message)
    end
  end

  #
  # Generate link with confirmation
  # Inherit rails confirmation behaviour
  # Custom data:
  # data-confirm - modal title
  # data-content - modal content
  # data-icon - modal icon
  #
  # Example:
  # ```
  #  = confirmation_link destroy_administrator_session_path, method: :delete,
  # data: {confirm: t('.sign_out_message.body'), title: t('.sign_out_message.title'), icon: 'fa-sign-out' } do
  #    span.fa.fa-sign-out
  # ```
  #
  def confirmation_link(name = nil, options = nil, html_options = nil, &)
    link_to(name, options, html_options, &)
  end

  #
  # Generate th with sortable link
  # Provided by filterrific (more https://github.com/jhund/filterrific)
  #
  # Example:
  # ```
  #  = sorting User, :name, @filterrific
  # ```
  #
  def sorting(resource_class, name, filterrific)
    label = resource_class.human_attribute_name(name)
    # extract the sort direction from the param value.
    klass = 'sorting'
    if filterrific.sorted_by.match?(/#{name}/)
      klass = filterrific.sorted_by.match?(/desc$/) ? 'sorting_desc' : 'sorting_asc'
    end
    content_tag :div, class: klass do
      filterrific_sorting_link(filterrific, name, ascending_indicator: '', descending_indicator: '', label: label)
    end
  end

  def link_to_sort(_resource_class, name, filter_form, tail = nil)
    tail ||= case name
               when :created_at, :updated_at
                 Settings.timezone_tip
               else
                 ''
             end
    sort_link(filter_form, name, t(".#{name}") + tail)
  end

  def render_error_notification(resource, full_messages: true)
    return unless resource.errors.any?

    messages = full_messages ? resource.errors.full_messages : resource.errors.messages.values.flatten
    content_tag :div, class: 'alert alert-danger' do
      concat content_tag 'strong', 'There are some problems:'
      concat content_tag 'ul', messages.
        map { |msg| content_tag('li', raw(msg)) }.join.html_safe, class: 'list-unstyled'
    end
  end

  def time_for_communication_timepicker
    Time.current.strftime('%I:%M %p')
  end

  def labels_based_on(status)
    status_active = status == LicenseUsage.statuses[:active]
    {
      activated_at: status_active ? 'Activated at' : 'Deactivated at',
      activated_by: status_active ? 'Activated by' : 'Deactivated by',
      action: status_active ? 'Deactivate' : 'Activate'
    }
  end

  def roles_dropdown(user)
    available_roles = {
      super_admin: 'Users::SuperAdmin',
      client_admin: 'client_admin',
      project_admin: 'project_admin',
      campaign_admin: 'campaign_admin',
      regular: 'member'
    }

    access_level = {
      super_admin: %i[super_admin client_admin project_admin campaign_admin regular],
      client_admin: %i[project_admin campaign_admin regular],
      project_admin: %i[regular campaign_admin],
      campaign_admin: %i[regular]
    }.with_indifferent_access

    user_roles = user.memberships.pluck(:role)
    user_roles << :super_admin if user.is?(:superadmin)
    user_access = access_level.slice(*user_roles).values.flatten.uniq

    user_access.map { |role| [I18n.t("activerecord.attributes.user.roles.#{role}"), available_roles[role]] }
  end
end
