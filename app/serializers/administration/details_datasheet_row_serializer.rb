# frozen_string_literal: true

module Administration
  class DetailsDatasheetRowSerializer < Panko::Serializer
    attributes :record, :type, :columns

    def columns
      Panko::ArraySerializer.new(object.datasheet.sheet_columns.order(:position),
                                 each_serializer: ::Administration::SheetColumnSerializer).to_a
    end

    def record
      SheetRows::GetData.call!(object, datasheet: datasheet)
    end

    def type
      datasheet.campaign_id? ? 'new_campaign' : 'project'
    end

    private

    def datasheet
      object.datasheet
    end
  end
end
