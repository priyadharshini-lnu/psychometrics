# frozen_string_literal: true

module AdminJobs
  class ImportNorm < AdminJobs::Base
    def call
      form = Administration::Norms::ImportForm.new(file: record.file, owner_id: record.data['owner_id'])

      return broadcast :ok, { error_messages: form.errors.full_messages } unless form.valid?

      Norms::ImportNorm.call(
        form.rows, record.data['owner_id'], owner
      )

      broadcast :ok
    rescue Errors::ImportError => e
      broadcast :ok, { error_messages: [e.message] }
    end

    def generate_title_link
      {
        href: '/admin/norms',
        lable: 'Norms'
      }
    end

    def generate_details
      []
    end
  end
end
