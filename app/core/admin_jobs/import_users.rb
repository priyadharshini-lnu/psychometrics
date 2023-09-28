# frozen_string_literal: true

module AdminJobs
  class ImportUsers < AdminJobs::Base
    include ActionView::Helpers::TagHelper
    include ActionView::Context

    def call
      import_data = CSV.parse(URI(record.file.url).open)
      import_data = ::Campaigns::Users::ParseImportData.call!(import_data, campaign)
      users_those_pwd_not_changed, imported_users = ::Campaigns::Users::ProcessImport.call!(
        campaign, record.owner, import_data[1..], record.data['operation'], record
      )

      content = content_tag(:div, I18n.t('user.modals.import.imported_users', number: imported_users.size))

      content =
        if users_those_pwd_not_changed.present?
          [
            content,
            content_tag(:div, I18n.t('user.modals.import.user_with_unchanged_passwords')),
            content_tag(:ul) do
              users_those_pwd_not_changed.map do |u|
                content_tag(:li, "#{u[:first_name]} #{u[:last_name]} (#{u[:email]})")
              end.join.html_safe
            end
          ].join.html_safe
        else
          content
        end
      broadcast :ok, { content: content }
    end

    def generate_title_link
      return {} unless campaign

      {
        href: "/administration/projects/#{campaign.project_id}/new_campaigns/#{campaign.id}/users",
        label: campaign.name
      }
    end

    def valid?
      campaign.present?
    end
  end
end
