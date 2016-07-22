module Imports
  class BaseImport
    def initialize(file, importer)
      @file = file
      @importer = importer
    end

    def process
      raise 'Should be implemented'
    end
  end
end
