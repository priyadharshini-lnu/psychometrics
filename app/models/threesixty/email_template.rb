# frozen_string_literal: true

class Threesixty::EmailTemplate < ApplicationRecord
  enum category: { invitations: 0 }
end
