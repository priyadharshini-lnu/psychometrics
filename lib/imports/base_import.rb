module Imports
  class BaseImport
    def initialize(file, importer)
      @file = file
      @importer = importer
      process
    end

    def process
      raise 'Should be implemented'
    end
  end
end
