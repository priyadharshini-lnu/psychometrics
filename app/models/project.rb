# frozen_string_literal: true

class Project < Client
  default_scope -> { where(ancestry_depth: HIERARCHY_LEVEL[:project]) }
end
