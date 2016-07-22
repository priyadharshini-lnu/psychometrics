module Imports
  class Dsl
    #
    # Template:
    # resource: {
    #   form: ClassForm,
    #   formats: {
    #     format: ClassProcessImpot
    #     ...
    #   }
    # }
    #
    CONFIG = {
      user: {
        form: UserImportForm,
        formats: {
          csv: Imports::Csv::UserImport
        }
      },
      norm: {
        form: NormImportForm,
        formats: {
          xls: Imports::Xls::NormImport
        }
      }
    }.freeze

    attr_accessor :config, :resource, :format

    def initialize(resource, format)
      Rails.logger.warn "@initialize "
      @resource = resource.to_sym
      @format   = format.to_sym
      @config   = CONFIG[@resource]
      Rails.logger.warn "@resource #{@resource}"
      Rails.logger.warn "@@format #{@format}"
      Rails.logger.warn "@@@config #{@config}"
      raise 'Imports: There is no resource'    unless @config
      raise 'Imports: Invalid config'          unless @config[:form] || !@config[:formats]
      raise 'Imports: Not supported format'    unless @config[:formats][@format]
    end

    def form
      @config[:form]
    end

    def engine
      @config[:formats][@format]
    end
  end
end
