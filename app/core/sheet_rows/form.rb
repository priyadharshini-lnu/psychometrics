# frozen_string_literal: true

module SheetRows
  class Form < Rectify::Form
    mimic :sheet_row_form

    attribute :email, String
    attribute :data, Hash

    validates :email, presence: true
    validate :check_email_uniqueness, if: -> { sheet.datasheet? }

    def check_email_uniqueness
      if sheet.rows.exists?(email: email)
        errors.add(:email, :not_uniq_email)
      end
    end

    def sheet
      context.sheet
    end
  end
end
