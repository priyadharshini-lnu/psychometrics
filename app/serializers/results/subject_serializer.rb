module Results
  class SubjectSerializer < ActiveModel::Serializer
    attributes :id, :data_sheet

    has_one :user, serializer: UserSerializer

    def data_sheet
      row = DatasheetRow.joins(:datasheet).
            find_by(datasheets: { project_id: object.campaign.project_id }, email: object.user.email)
      row&.data || {}
    end
  end
end
