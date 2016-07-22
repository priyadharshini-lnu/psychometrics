module Imports
  class BaseImport

    def initialize(file, importer)
      @importer = importer
      @file     = file
    end

    def process
      raise 'should be implemented'
    end
  end
end