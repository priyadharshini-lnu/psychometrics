# frozen_string_literal: true

module Administration
  class DetailsDatasheetRowSerializer < ActiveModel::Serializer
    attributes :record, :type, :columns

    def record
      DatasheetRows::GetData.call!(object, datasheet: datasheet)
    end

    def type
      datasheet.campaign_id? ? 'new_campaign' : 'project'
    end

    def columns
      Datasheets::GetColumnDefinition.call!(datasheet)
    end

    private

    def datasheet
      object.datasheet
    end
  end
end
