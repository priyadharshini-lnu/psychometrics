class AssessmentsClient < ApplicationRecord
  belongs_to :assessment
  belongs_to :client, inverse_of: :assessments_clients
end
