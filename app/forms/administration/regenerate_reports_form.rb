module Administration
  class RegenerateReportsForm < Rectify::Form

    attribute :report_ids, Array[Integer]

    validates :report_ids, presence: true

    # Rejects empty elements from array
    #
    def report_ids=(ids)
      super(ids.reject(&:blank?))
    end

  end
end
