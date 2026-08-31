# frozen_string_literal: true

module Administration
  module Norms
    class ImportForm < Rectify::Form
      attribute :file, Object
      attribute :owner_id, Integer

      validates :file, presence: true
      validates :file,
                file_size: { less_than_or_equal_to: 4.megabytes },
                file_content_type: { allow: ['text/csv', 'text/plain'] },
                if: -> { file.is_a?(ActionDispatch::Http::UploadedFile) || file.is_a?(Rack::Test::UploadedFile) }

      validate :validates_dimension_exists
      validate :dimension_name_exists

      def dimension_name_exists
        return if errors.present?

        if headers[1].blank?
          errors.add(
            :base,
            I18n.t('administration.imports.errors.norm.not_set_dimension')
          )
        end
      end

      def validates_dimension_exists
        return if errors.present?

        unless dimension
          errors.add(
            :base,
            I18n.t(
              'administration.imports.errors.norm.dimension_not_found',
              dimension_name: headers[1],
              client_name: owner&.name || I18n.t('admin.platform_owner')
            )
          )
        end
      end

      def rows
        @rows ||= process_csv_file
      end

      def owner
        Client.find_by(id: owner_id)
      end

      def headers
        @headers ||= rows.headers
      end

      def dimension
        @dimension ||= Dimension.find_by(name: headers[1])
      end

      private

      def process_csv_file
        ::CsvFileParser.call!(file, headers: :first_row)
      end
    end
  end
end
