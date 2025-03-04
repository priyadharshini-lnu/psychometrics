# frozen_string_literal: true

module Imports
  class NormImport < Imports::Base
    def process
      data = process_csv_data(file)

      headers = data.shift

      dimension_name = headers[1]

      @dimension ||= Dimension.find_by(name: dimension_name, owner: owner) unless @dimension

      if !@dimension && !dimension_name
        errors.add(:base, I18n.t('administration.imports.errors.norm.not_set_dimension'))
      end

      unless @dimension
        errors.add(
          :base,
          I18n.t(
            'administration.imports.errors.norm.dimension_not_found',
            dimension_name: dimension_name,
            client_name: owner&.name || 'TTE'
          )
        )
      end

      @norm = Norm.find_or_create_by(
        name: headers[0], dimension_id: @dimension.id,
        created_by: importer, updated_by: importer, owner: owner
      )
    end

    def process_csv_data(file)
      if file.is_a?(ActionDispatch::Http::UploadedFile) || file.is_a?(Rack::Test::UploadedFile)
        CSV.read(file.path, encoding: 'bom|utf-8')
      else
        CSV.new(URI(file.url).open).read
      end
    end
  end
end
