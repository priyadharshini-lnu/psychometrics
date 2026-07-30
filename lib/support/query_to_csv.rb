# frozen_string_literal: true

module Support
  class QueryToCsv < BaseCommand
    private_attr_reader :query, :file_name

    def initialize(query, file_name: "#{SecureRandom.uuid}.csv")
      @query = query
      @file_name = file_name
    end

    def call
      csv_content = generate_csv
      presigned_url = Support::ObjectStorage.new(file_name, StringIO.new(csv_content), content_type: 'text/csv').upload
      broadcast :ok, presigned_url
    end

    private

    def generate_csv
      result = ActiveRecord::Base.connection.execute(query)

      CSV.generate do |csv|
        csv << result.fields
        # rubocop:disable Style/HashEachMethods
        result.values.each { |row| csv << row }
        # rubocop:enable Style/HashEachMethods
      end
    end
  end
end
