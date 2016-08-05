module Imports
  class BaseImport
    include ActiveModel::Validations
    include ActiveModel::Conversion
    include ActiveModel::Model
    extend ActiveModel::Naming

    attr_accessor :file, :importer

    validates :importer, presence: true
    validates :file, presence: true, file_size: { less_than_or_equal_to: 4.megabytes }
  end
end
