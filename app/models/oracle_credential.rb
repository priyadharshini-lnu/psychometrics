# frozen_string_literal: true

class OracleCredential < ApplicationRecord
  audited

  belongs_to :user
end
