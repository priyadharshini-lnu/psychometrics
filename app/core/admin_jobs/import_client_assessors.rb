# frozen_string_literal: true

module AdminJobs
  class ImportClientAssessors < AdminJobs::Base
    include ActionView::Helpers::TagHelper
    include ActionView::Context

    def call
      import_data = CsvFileParser.call!(record.file, headers: :first_row).map { |row| row.to_h.symbolize_keys }
      emails = import_data.pluck(:email)
      result = Memberships::ImportClientAssessors.call!(emails: emails, client_id: client.id, creator: record.owner)

      content = content_tag(
        :div,
        I18n.t('user.modals.import.imported_users', number: result[:imported_count] || 0)
      )

      broadcast :ok, { content: content }
    end

    def valid?
      client.present?
    end

    def generate_title_link
      {
        href: "/admin/clients/#{client.id}/assessors",
        label: client.name
      }
    end
  end
end
