# frozen_string_literal: true

module AdminJobs
  class ImportAssessors < AdminJobs::Base
    include ActionView::Helpers::TagHelper
    include ActionView::Context

    def call
      assessors = ::Assessors::ParseImportData.call!(record.file)
      new_assessors, existing_assessors_whose_password_not_changed = ::Assessors::CreateAll.call!(
        assessors, campaign, record.owner
      )

      content = content_tag(:div, I18n.t('user.modals.import.imported_users', number: new_assessors.size))

      if existing_assessors_whose_password_not_changed.present?
        content =
          [
            content,
            content_tag(:div, I18n.t('user.modals.import.user_with_unchanged_passwords')),
            content_tag(:ul) do
              existing_assessors_whose_password_not_changed.map do |u|
                content_tag(:li, "#{u[:first_name]} #{u[:last_name]} (#{u[:email]})")
              end.join.html_safe
            end
          ].join.html_safe
      end
      broadcast :ok, { content: content }
    end

    def valid?
      campaign.present?
    end

    def generate_title_link
      {
        href: "/admin/projects/#{campaign.project_id}/new_campaigns/#{campaign.id}/assessors",
        label: campaign.name
      }
    end
  end
end
