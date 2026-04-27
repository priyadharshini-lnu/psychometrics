# frozen_string_literal: true

module AdminJobs
  class ExportDimensionAsJson < ExportAsJson
    def export_class
      PortableData::Exports::Resources::DimensionExportDefinition
    end

    def generate_title_link
      {
        href: dimension_factors_url(dimension.id),
        label: dimension.name
      }
    end

    def dimension
      @dimension ||= Dimension.find_by(id: record.data['dimension_id'])
    end

    alias resource dimension

    def file_name
      "Dimension-#{dimension.id}.json"
    end
  end
end
