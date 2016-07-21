module Imports
  class BaseImport

    def initialize(file)
      @file = file
    end

    def process
      raise 'should be implemented'
    end
  end
end