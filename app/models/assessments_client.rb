# frozen_string_literal: true

class AssessmentsClient < ApplicationRecord
  belongs_to :assessment
  belongs_to :client, inverse_of: :assessments_clients

  acts_as_list scope: :client
end
