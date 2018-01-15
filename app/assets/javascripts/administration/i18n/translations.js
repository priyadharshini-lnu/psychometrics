I18n.translations || (I18n.translations = {});
I18n.translations["en"] = I18n.extend((I18n.translations["en"] || {}), {
  "activerecord": {
    "attributes": {
      "assessment": {
        "active": "Active",
        "categories": {
          "360": "360 Feedback",
          "organisational": "Org Surveys",
          "psychometric": "Psychometrics"
        },
        "category": "Category",
        "created_at": "Created Date",
        "description": "Description",
        "id": "ID",
        "name": "Name",
        "timing": "Timing",
        "updated_at": "Modified Date"
      },
      "assign": {
        "completed_at": "Completion Date",
        "statuses": {
          "completed": "Completed",
          "in_progress": "In Progress",
          "not_started": "New"
        }
      },
      "block": {
        "active": "Active",
        "assign_to_assessment_ids": "Assessments",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "client": {
        "category": "Category",
        "created_at": "Created Date",
        "id": "ID",
        "licenses": "License number",
        "licenses_expire": "License expire",
        "licenses_used": "Used license number",
        "logo": "Client logo",
        "name": "Name",
        "subdomain": "Subdomain",
        "updated_at": "Modified Date"
      },
      "dimension": {
        "active": "Active",
        "created_at": "Created Date",
        "factors_count": "No. of Factors",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "factor": {
        "active": "Active",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "parent_id": "Parent",
        "questions_count": "No. Questions",
        "subfactors_count": "No. Sub-Factors",
        "updated_at": "Modified Date"
      },
      "membership": {
        "parent_id": "Direct Manager"
      },
      "memebrship": {
        "id": "ID",
        "parent": "Direct Manager"
      },
      "norm": {
        "active": "Active",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date",
        "updated_by": "Edited by"
      },
      "occupation": {
        "active": "Active",
        "bachelors_or_masters_qualification": "Bachelors or Masters Qualification",
        "created_at": "Created Date",
        "description": "Description",
        "diploma_qualification": "Diploma Qualification",
        "full_description": "Full Description",
        "high_school_entry_roles": "High School Entry Roles",
        "id": "ID",
        "key_career_tracks": "Key Career Tracks",
        "name": "Name",
        "potential_areas_of_study": "Potential Areas of Study",
        "updated_at": "Modified Date"
      },
      "occupations_factor": {
        "active": "Active",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "question": {
        "active": "Active",
        "assign_to_assessment_ids": "Assessments",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "user": {
        "active": "Active",
        "created_at": "Created Date",
        "current_password": "Current password",
        "disabled": "Disable",
        "email": "Email Address",
        "first_name": "First Name",
        "id": "ID",
        "last_name": "Last Name",
        "manage_client_ids": "Memberships",
        "memberships": "Memberships",
        "password": "Password",
        "password_confirmation": "Password confirmation",
        "remember_me": "Remember me",
        "reset_password_token": "Reset password token",
        "role": "Role",
        "roles": {
          "admin": "Client Admin",
          "manager": "Manager",
          "member": "User",
          "super_admin": "Super Admin",
          "superadmin": "Super Admin"
        },
        "types": {
          "anonymous": "Anonymous Users",
          "identified": "Identified Users"
        },
        "unlock_token": "Unlock token",
        "updated_at": "Modified Date"
      }
    },
    "errors": {
      "messages": {
        "not_uniqueness": "Assign has already been taken",
        "record_invalid": "Validation failed: %{errors}",
        "restrict_dependent_destroy": {
          "has_many": "Cannot delete record because dependent %{record} exist",
          "has_one": "Cannot delete record because a dependent %{record} exists"
        }
      },
      "models": {
        "factors_norm": {
          "score_from_must_be_number": "Score from must be number",
          "score_to_less_than_score_from": "Score to is less than Score from",
          "score_to_must_be_number": "Score to must be number"
        }
      }
    },
    "models": {
      "assessment": "Assessments",
      "assign": "Assigns",
      "block": "Block",
      "client": "Clients",
      "dimension": "Dimensions",
      "factor": "Factors",
      "factors_norm": "factors_norms",
      "membership": "Memebrship",
      "memebrship": "Memebrship",
      "norm": "Norms",
      "occupation": "Occupations",
      "occupations_factor": "Occupations",
      "question": "Question",
      "user": "Users"
    }
  },
  "administration": {
    "actions": "Actions",
    "active": "Active",
    "administrator": {
      "passwords": {
        "edit": {
          "submit": "Set new password",
          "title": "Change your password"
        },
        "new": {
          "back": "Return back",
          "submit": "Send me instructions",
          "title": "Forgot your password?"
        }
      },
      "sessions": {
        "new": {
          "forgot_password": "Forgot your password?",
          "submit": "Login",
          "title": "<strong>Welcome</strong>, Please login"
        }
      },
      "shared": {
        "links": {
          "about": "About",
          "app_name": "© 2016 AppName",
          "contact_us": "Contact Us",
          "privacy": "Privacy"
        }
      }
    },
    "any": " - Any - ",
    "assessments": {
      "assigns": {
        "default": {
          "filter": "Filter",
          "filter_form": "Filter form",
          "next": "Next",
          "previous": "Previous",
          "title": "Assign %{name} Assessment"
        },
        "finish": {
          "show": {
            "filter": "Filter",
            "filter_form": "Filter form",
            "next": "Next",
            "previous": "Previous",
            "title": "Assign %{name} Assessment"
          }
        },
        "step1": {
          "show": {
            "filter": "Filter",
            "filter_form": "Filter form",
            "next": "Next",
            "previous": "Previous",
            "title": "Assign %{name} Assessment"
          }
        },
        "step2": {
          "show": {
            "filter": "Filter",
            "filter_form": "Filter form",
            "next": "Next",
            "not_selected_users": "Not Selected Users",
            "previous": "Previous",
            "selected_users": "Selected Users",
            "title": "Assign %{name} Assessment"
          },
          "users": {
            "filter": "Filter",
            "filter_form": "Filter form",
            "next": "Next",
            "previous": "Previous",
            "title": "Assign %{name} Assessment"
          }
        }
      },
      "copy": {
        "error": "Assessment #%{name} was not copied.",
        "successfully": "Assessment %{name} was successfully copied."
      },
      "create": {
        "successfully": "Assessment %{name} was successfully created."
      },
      "dashboard": "Assessment Dashboard",
      "destroy": {
        "successfully": "Assessment %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit assessment"
      },
      "form": {
        "categories": {
          "360": "360 Feedback",
          "all": "All Categories",
          "organisational": "Org Surveys",
          "psychometric": "Psychometrics"
        },
        "timing": {
          "hint": "For Example: 30 minutes to complete"
        }
      },
      "index": {
        "filterrific": {
          "with_category": {
            "360": "360 Feedback",
            "all": "All Categories",
            "organisational": "Org Surveys",
            "psychometric": "Psychometrics"
          }
        },
        "title": "Assessments",
        "tooltips": {
          "create": "Create"
        }
      },
      "new": {
        "header": "New assessment"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Assessment?</p>\n",
            "title": "Delete <strong>Assessment</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Assessment?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Assessment",
          "delete": "Delete Assessment",
          "edit": "Edit Assessment"
        }
      },
      "sidebar": {
        "assign": "Assign Assessment",
        "copy": "Copy Assessment",
        "destroy": "Delete Assessment",
        "disable": "Disable",
        "edit": "Edit Assessment",
        "enable": "Enable",
        "new": "New Assessment",
        "preview": "Preview Assessment",
        "title": "Assessment's options (#%{id})"
      },
      "toggle_status": {
        "successfully": "Assessment %{name} was successfully updated."
      },
      "update": {
        "successfully": "Assessment %{name} was successfully updated."
      }
    },
    "assigns": {
      "create": {
        "successfully": "New assign to assessment was successfully created"
      },
      "destroy": {
        "successfully": "Assign to assessment was successfully destroy"
      },
      "index": {
        "title": "Reports"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this assign?</p>",
            "title": "Delete <strong>%{name}</strong> ?"
          }
        }
      }
    },
    "back": "Back",
    "base": {
      "top_sidebar": {
        "search": "Search...",
        "sign_out_message": {
          "body": "<p>Are you sure you want to log out?</p> <p>Press No if you want to continue work. Press Yes to logout current user.</p>",
          "title": "Log <strong>Out</strong> ?"
        }
      }
    },
    "blocks": {
      "destroy": {
        "successfully": "Block %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit Block"
      },
      "new": {
        "header": "New Block"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Block?</p>\n",
            "title": "Delete <strong>Block</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Block?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        }
      }
    },
    "breadcrumbs": {
      "assessments": "Assessments",
      "client": "Client Tenancy",
      "clients": "Client Tenancies",
      "communication_center": "Communication Center",
      "create": "Create",
      "design": "Design",
      "dimension": "Dimension",
      "dimensions": "Dimensions",
      "factors": "Factors",
      "home": "Dashboard",
      "libraries": "Media Library",
      "norm": "Norm",
      "norms": "Norms",
      "norms_editor": "Norm Editor",
      "occupations": "Occupations",
      "occupations_factors": "Factors",
      "psychometrics": "Psychometrics",
      "question_center": "Question Center",
      "reports": "Reports",
      "statistics": "Statistics",
      "sub_factors": "Sub-Factors",
      "survey": "Survey",
      "surveys": "Surveys",
      "users": "Users",
      "users_add": "Add New",
      "users_import": "Import"
    },
    "cable": {
      "notification": {
        "assessment_factors": "Factors are fetched",
        "assessment_update": "Assessment is updated",
        "block_clone": "Block is copied",
        "block_create": "Block %{name} is created",
        "block_create_by_template": "Block was loaded from template",
        "block_destroy": "Block has been deleted",
        "block_move_down": "Block %{name} is moved down",
        "block_move_up": "Block %{name} is moved up",
        "block_permanent_destroy": "Block is permanent destroyed",
        "block_rename": "Block is renamed",
        "block_restore": "Block is restored",
        "block_save_as_template": "Block saved as template",
        "block_unlink_template": "Block was unlinked",
        "block_update": "Block is updated",
        "comment_create": "Comment is created",
        "comment_destroy": "Comment has been deleted",
        "geo_filter": "Data filtered",
        "module_create": "Module %{name} is created",
        "module_destroy": "Module has been deleted",
        "module_insert_after": "Module is inserted after",
        "module_insert_before": "Module is inserted before",
        "module_move_down": "Module is moved down",
        "module_move_up": "Module is moved up",
        "module_rename": "Module is renamed",
        "module_update": "Module is updated",
        "page_create": "Page %{name} is created",
        "page_destroy": "Page has been deleted",
        "page_move_down": "Page %{name} is moved down",
        "page_move_up": "Page %{name} is moved up",
        "page_rename": "Page is renamed",
        "page_update": "Page is updated",
        "question_clone": "Question is copied",
        "question_create": "Question %{name} is created",
        "question_create_by_template": "Question was loaded from template",
        "question_create_from_template": "Question is created from template",
        "question_destroy": "Question has been deleted",
        "question_insert_after": "Question is inserted after",
        "question_insert_before": "Question is inserted before",
        "question_move_down": "Question is moved down",
        "question_move_up": "Question is moved up",
        "question_permanent_destroy": "Question is permanent destroyed",
        "question_rename": "Question is renamed",
        "question_restore": "Question is restored",
        "question_save_as_template": "Question saved as template",
        "question_unlink_template": "Question was unlinked",
        "question_update": "Question is updated",
        "report_change_filters": "Filters are updated",
        "report_update": "Report is updated",
        "scoring_update": "Scoring is updated",
        "trash_empty": "Trash Comment empty"
      }
    },
    "choose": " - Choose - ",
    "clear": "Clear",
    "clients": {
      "assessments": {
        "assigns": {
          "default": {
            "filter": "Filter",
            "filter_form": "Filter form",
            "next": "Next",
            "previous": "Previous",
            "title": "Assign %{name} Assessment"
          },
          "finish": {
            "show": {
              "filter": "Filter",
              "filter_form": "Filter form",
              "next": "Next",
              "previous": "Previous",
              "title": "Assign %{name} Assessment"
            }
          },
          "step1": {
            "show": {
              "filter": "Filter",
              "filter_form": "Filter form",
              "next": "Next",
              "previous": "Previous",
              "title": "Assign %{name} Assessment"
            }
          },
          "step2": {
            "show": {
              "filter": "Filter",
              "filter_form": "Filter form",
              "next": "Next",
              "not_selected_users": "Not Selected Users",
              "previous": "Previous",
              "selected_users": "Selected Users",
              "title": "Assign %{name} Assessment"
            },
            "users": {
              "filter": "Filter",
              "filter_form": "Filter form",
              "next": "Next",
              "previous": "Previous",
              "title": "Assign %{name} Assessment"
            }
          }
        },
        "copy": {
          "error": "Assessment #%{name} was not copied.",
          "successfully": "Assessment %{name} was successfully copied."
        },
        "create": {
          "successfully": "Assessment %{name} was successfully created."
        },
        "dashboard": "Assessment Dashboard",
        "destroy": {
          "successfully": "Assessment %{name} was successfully destroyed."
        },
        "edit": {
          "header": "Edit assessment"
        },
        "form": {
          "categories": {
            "360": "360 Feedback",
            "all": "All Categories",
            "organisational": "Org Surveys",
            "psychometric": "Psychometrics"
          },
          "timing": {
            "hint": "For Example: 30 minutes to complete"
          }
        },
        "index": {
          "filterrific": {
            "with_category": {
              "360": "360 Feedback",
              "all": "All Categories",
              "organisational": "Org Surveys",
              "psychometric": "Psychometrics"
            }
          },
          "title": "Assessments",
          "tooltips": {
            "create": "Create"
          }
        },
        "new": {
          "header": "New assessment"
        },
        "resource": {
          "confirmations": {
            "delete": {
              "body": "<p>Are you sure you want to delete this Assessment?</p>\n",
              "title": "Delete <strong>Assessment</strong> ?"
            },
            "toggle_status": {
              "body": "<p>Are you sure you want to %{status} this Assessment?</p>\n",
              "title": "<strong>%{status}</strong> %{name}?"
            }
          },
          "tooltips": {
            "copy": "Copy Assessment",
            "delete": "Delete Assessment",
            "edit": "Edit Assessment"
          }
        },
        "sidebar": {
          "assign": "Assign Assessment",
          "copy": "Copy Assessment",
          "destroy": "Delete Assessment",
          "disable": "Disable",
          "edit": "Edit Assessment",
          "enable": "Enable",
          "new": "New Assessment",
          "preview": "Preview Assessment",
          "title": "Assessment's options (#%{id})"
        },
        "toggle_status": {
          "successfully": "Assessment %{name} was successfully updated."
        },
        "update": {
          "successfully": "Assessment %{name} was successfully updated."
        }
      },
      "copy": {
        "error": "Client #%{name} was not copied.",
        "successfully": "Client %{name} was successfully copied."
      },
      "create": {
        "successfully": "Client %{name} was successfully created."
      },
      "designs": {
        "form": {
          "no_background": "No Background yet",
          "no_logo": "No Logo yet"
        }
      },
      "destroy": {
        "successfully": "Client %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit client"
      },
      "index": {
        "title": "Client Tenancies",
        "tooltips": {
          "create": "Create"
        }
      },
      "license": {
        "header": "%{name} - Edit license"
      },
      "new": {
        "header": "New client"
      },
      "reports": {
        "copy": {
          "error": "Report #%{id} was not copied."
        },
        "destroy": {
          "successfully": "Report %{name} was successfully destroyed."
        },
        "edit": {
          "header": "Edit Report Name"
        },
        "index": {
          "filterrific": {
            "with_assessment_category": {
              "360": "360 Feedback",
              "all": "All",
              "organisational": "Org Surveys",
              "psychometric": "Psychometrics"
            }
          },
          "title": "Reports",
          "tooltips": {
            "create": "Create"
          }
        },
        "new": {
          "header": "New Report"
        },
        "preview": {
          "export_pdf": "Export to PDF",
          "title": "Preview"
        },
        "resource": {
          "confirmations": {
            "delete": {
              "body": "<p>Are you sure you want to delete this Report?</p>\n",
              "title": "Delete <strong>Report</strong> ?"
            },
            "toggle_status": {
              "body": "<p>Are you sure you want to %{status} this Report?</p>\n",
              "title": "<strong>%{status}</strong> %{name}?"
            }
          },
          "tooltips": {
            "copy": "Copy Report",
            "delete": "Delete Report",
            "edit": "Edit Report",
            "preview": "Preview Report"
          }
        },
        "sidebar": {
          "copy": "Copy Report",
          "destroy": "Delete Report",
          "edit": "Edit Report",
          "title": "Report's options (#%{id})",
          "view": "View Report"
        },
        "toggle_status": {
          "successfully": "Report was successfully updated."
        }
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this client?</p>",
            "title": "Delete <strong>%{name}</strong> ?"
          },
          "disable": {
            "body": "<p>Are you sure you want to disable this client?</p>",
            "title": "Disable <strong>%{name}</strong> ?"
          },
          "enable": {
            "body": "<p>Are you sure you want to enable this client?</p>",
            "title": "Enable <strong>%{name}</strong> ?"
          }
        },
        "tooltips": {
          "copy": "Copy Client",
          "delete": "Delete Client",
          "edit": "Edit Client"
        }
      },
      "sidebar": {
        "copy": "Copy Client",
        "design": "Edit Design",
        "destroy": "Destroy Client",
        "disable": "Disable",
        "edit": "Edit Client",
        "enable": "Enable",
        "licenses": "Edit Licenses",
        "new": "New Client",
        "title": "Client's options (#%{id})"
      },
      "statistics": {
        "index": {
          "all_assessments": "All assessments",
          "assessment_type": "Assessment type",
          "title": "Statistics"
        }
      },
      "toggle_status": {
        "successfully": "Client %{name} was successfully updated."
      },
      "update": {
        "successfully": "Client %{name} was successfully updated."
      },
      "users": {
        "assigns": {
          "index": {
            "add": "Assign New Assessment",
            "title": "Assessments and Reporting"
          },
          "list": {
            "actions": "Actions",
            "assessment_name": "Assessment Name",
            "assessment_type": "Assessment Type",
            "reports": "Reports",
            "status": "Completion Status",
            "uniq_id": "Uniq ID"
          },
          "resource": {
            "no_access_to_reports": "No access to reports",
            "no_completed": "Not completed",
            "no_reports": "No relative reports",
            "tooltips": {
              "delete": "Delete Assign"
            }
          }
        },
        "create": {
          "successfully": "User %{name} was successfully created."
        },
        "destroy": {
          "successfully": "User %{name} was successfully destroyed."
        },
        "edit": {
          "add": "Add",
          "hris_data": "HRIS Data",
          "key": "Key",
          "personal_data": "Personal Data",
          "remove": "Remove",
          "title": "Edit user",
          "value": "Value"
        },
        "form": {
          "choose": " - Choose - "
        },
        "index": {
          "add": "Add new user",
          "export": "Export",
          "filterrific": {
            "with_role": {
              "administration": "Administrators",
              "all": "All",
              "users": "Users"
            }
          },
          "import": "Import",
          "import_hris": "HRIS Data",
          "import_users": "Users",
          "title": "Users",
          "tooltips": {
            "create": "Create",
            "export": "Export",
            "import": "Import"
          }
        },
        "new": {
          "header": "New user"
        },
        "reports": {
          "copy": {
            "error": "Report #%{id} was not copied."
          },
          "destroy": {
            "successfully": "Report %{name} was successfully destroyed."
          },
          "edit": {
            "header": "Edit Report Name"
          },
          "index": {
            "filterrific": {
              "with_assessment_category": {
                "360": "360 Feedback",
                "all": "All",
                "organisational": "Org Surveys",
                "psychometric": "Psychometrics"
              }
            },
            "title": "Reports",
            "tooltips": {
              "create": "Create"
            }
          },
          "new": {
            "header": "New Report"
          },
          "preview": {
            "export_pdf": "Export to PDF",
            "title": "Preview"
          },
          "resource": {
            "confirmations": {
              "delete": {
                "body": "<p>Are you sure you want to delete this Report?</p>\n",
                "title": "Delete <strong>Report</strong> ?"
              },
              "toggle_status": {
                "body": "<p>Are you sure you want to %{status} this Report?</p>\n",
                "title": "<strong>%{status}</strong> %{name}?"
              }
            },
            "tooltips": {
              "copy": "Copy Report",
              "delete": "Delete Report",
              "edit": "Edit Report",
              "preview": "Preview Report"
            }
          },
          "sidebar": {
            "copy": "Copy Report",
            "destroy": "Delete Report",
            "edit": "Edit Report",
            "title": "Report's options (#%{id})",
            "view": "View Report"
          },
          "toggle_status": {
            "successfully": "Report was successfully updated."
          }
        },
        "reset_password": {
          "successfully": "User  %{name} will receive an email with instructions on how to reset his (her) password in a few minutes."
        },
        "resource": {
          "confirmations": {
            "change_password": {
              "body": "<p>Are you sure you want to send instructions with link to change password?</p>\n",
              "title": "Change password <strong>%{name}</strong> ?"
            },
            "delete": {
              "body": "<p>Are you sure you want to delete this User?</p>\n",
              "title": "Delete <strong>%{name}</strong> ?"
            },
            "membership": {
              "delete": {
                "body": "<p>Are you sure you want to delete?</p>\n",
                "title": "Delete <strong>%{name}</strong> from %{client_name} Client Tenancy?"
              }
            },
            "toggle_status": {
              "body": "<p>Are you sure you want to %{status} this User?</p>\n",
              "title": "<strong>%{status}</strong> %{name}?"
            }
          },
          "tooltips": {
            "change_password": "Change password",
            "chart": "View user report",
            "delete": "Delete user",
            "edit": "Edit user",
            "mail": "Send mail",
            "sign_in": "Login as user"
          }
        },
        "sidebar": {
          "assessments_and_reports": "Assessments and Reporting",
          "destroy": "Delete User",
          "disable": "Disable",
          "edit_user": "Edit User",
          "email": "Send mail",
          "enable": "Enable",
          "export_users": "Export users",
          "import_users": "Import users",
          "login_as_user": "Login as User",
          "new_user": "New User",
          "reset_password": "Change Password",
          "title": "User's options (#%{id})"
        },
        "spoof": {
          "successfully": "You was successfully login as %{name}"
        },
        "toggle_status": {
          "successfully": "User %{name} was successfully updated."
        },
        "update": {
          "successfully": "User %{name} was successfully updated."
        }
      }
    },
    "close": "Close",
    "communications": {
      "copy": {
        "error": "Communication #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Communication %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit Communication"
      },
      "form": {
        "body_mustache": "{{first_name}} - Recipient First Name\n{{last_name}} - Recipient Last Name\n{{email}} - Recipient Email\n",
        "delivery_rules": {
          "after_complete": "Right after completion",
          "if_not_finished": "If assessment was not finished",
          "if_not_started": "If assessment is not started",
          "on_specific_datetime": "Specific date and time"
        },
        "selected_cc_recipients": "Selected CC Recipients",
        "selected_recipients": "Selected Recipients"
      },
      "index": {
        "add_new": "Add new",
        "title": "Communication Center",
        "tooltips": {
          "create": "Create"
        }
      },
      "new": {
        "header": "New Communication"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Communication?</p>\n",
            "title": "Delete <strong>Communication</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Communication?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Communication",
          "delete": "Delete Communication",
          "edit": "Edit Communication"
        }
      },
      "sidebar": {
        "copy": "Copy Communication",
        "destroy": "Delete Communication",
        "disable": "Disable Communication",
        "edit": "Edit Communication",
        "enable": "Enable Communication",
        "new": "New Communication",
        "title": "Communication's options (#%{id})",
        "view": "View Communication"
      },
      "toggle_status": {
        "successfully": "Communication was successfully updated."
      }
    },
    "copy": "Copy",
    "create": "Create",
    "dimensions": {
      "copy": {
        "error": "Dimension #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Dimension %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit Dimension Name"
      },
      "index": {
        "title": "Dimensions",
        "tooltips": {
          "create": "Create"
        }
      },
      "new": {
        "header": "New Dimension"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Dimension?</p>\n",
            "title": "Delete <strong>Dimension</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Dimension?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Dimension",
          "delete": "Delete Dimension",
          "edit": "Edit Dimension Name"
        }
      },
      "sidebar": {
        "assign": "Assign Dimension",
        "copy": "Copy Dimension",
        "destroy": "Delete Dimension",
        "disable": "Disable Dimension",
        "edit": "Edit Dimension Name",
        "enable": "Enable Dimension",
        "new": "New Dimension",
        "title": "Dimension's options (#%{id})",
        "view": "View Dimension"
      },
      "toggle_status": {
        "successfully": "Dimension was successfully updated."
      }
    },
    "disable": "Disable",
    "edit": "Edit",
    "enable": "Enable",
    "factors": {
      "copy": {
        "error": "Factor #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Factor %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit Factor Name"
      },
      "form": {
        "no_icon": "No Logo yet"
      },
      "index": {
        "icon": "Icon",
        "title": "Factors",
        "tooltips": {
          "create": "Create"
        }
      },
      "new": {
        "header": "New Factor"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Factor?</p>\n",
            "title": "Delete <strong>Factor</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Factor?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Factor",
          "delete": "Delete Factor",
          "edit": "Edit Factor Name"
        }
      },
      "sidebar": {
        "copy": "Copy Factor",
        "destroy": "Delete Factor",
        "edit": "Edit Factor Name",
        "title": "Factor's options (#%{id})",
        "view": "View Factor"
      },
      "toggle_status": {
        "successfully": "Factor was successfully updated."
      }
    },
    "genders": {
      "female": "Female",
      "male": "Male",
      "not_set": "Not set"
    },
    "home": {
      "index": {
        "notifications": "Notifications"
      }
    },
    "import": "Import",
    "imports": {
      "assessments": {
        "results": {
          "form": {
            "import": "Import"
          }
        }
      },
      "base": {
        "form": {
          "import": "Import"
        }
      },
      "errors": {
        "error": "[Row %{row}] %{error}",
        "invalid_assign": "Can't to find record for specified Result ID. If you want to create new result, please, leave Result ID column empty",
        "invalid_format": "There is no Email column",
        "norm": {
          "factor_is_not_described": "[#%{coords}] factor %{factor} is not described above",
          "factors_mismatch": "[#%{coords}] dimension %{dimension} does not have factor %{factor}",
          "not_set_dimension": "The name of the Dimension should be written in A-1",
          "sub_factors_mismatch": "[#%{coords}] dimension %{dimension} does not have sub factor %{factor}"
        },
        "result": {
          "error": "[Row %{row}] %{error}",
          "invalid_assign": "[Row %{row}] Can't to find record for specified Result ID. If you want to create new result, please, leave Result ID column empty",
          "invalid_format": "Invalid File format"
        },
        "translation": {
          "error": "[Translation %{id}] %{error}",
          "invalid_format": "Invalid File format"
        },
        "unknown_type": "Unknown file type: %{filename}",
        "user": {
          "not_found": "[Row %{row}] Couldn't find User with Email Address %{email}"
        }
      },
      "form": {
        "import": "Import"
      },
      "hris": {
        "form": {
          "import": "Import"
        }
      },
      "new": {
        "header": "Import"
      },
      "users": {
        "form": {
          "import": "Import"
        }
      }
    },
    "imports_assessments_result_imports": {
      "create": {
        "successfully": "Raw Results data was successfully imported"
      },
      "new": {
        "header": "Import Raw Results data"
      }
    },
    "imports_hris_imports": {
      "create": {
        "successfully": "HRIS data was successfully imported"
      },
      "new": {
        "header": "Import HRIS data"
      }
    },
    "imports_user_imports": {
      "create": {
        "successfully": "Users was successfully imported"
      },
      "new": {
        "header": "Import Users"
      }
    },
    "libraries": {
      "create": {
        "successfully": "Item %{name} was successfully created."
      },
      "destroy": {
        "successfully": "Item %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit"
      },
      "index": {
        "title": "Media Library"
      },
      "list": {
        "new_folder": "New folder",
        "root": "Media Library",
        "upload": "Upload new file"
      },
      "new": {
        "header": "New Report"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete %{name}?</p>\n",
            "title": "Delete <strong>%{name}</strong> ?"
          }
        },
        "tooltips": {
          "delete": "Delete",
          "edit": "Edit"
        }
      },
      "update": {
        "successfully": "Item %{name} was successfully updated."
      }
    },
    "memberships": {
      "create": {
        "successfully": "User %{name} was successfully created."
      },
      "destroy": {
        "successfully": "User %{name} was successfully destroyed."
      },
      "edit": {
        "add": "Add",
        "hris_data": "HRIS Data",
        "key": "Key",
        "personal_data": "Personal Data",
        "remove": "Remove",
        "title": "Edit user",
        "value": "Value"
      },
      "index": {
        "add": "Add new user",
        "export": "Export",
        "filterrific": {
          "with_role": {
            "administration": "Administrators",
            "all": "All",
            "users": "Users"
          }
        },
        "import": "Import",
        "import_hris": "HRIS Data",
        "import_users": "Users",
        "title": "Users",
        "tooltips": {
          "create": "Create",
          "export": "Export",
          "import": "Import"
        }
      },
      "new": {
        "header": "New user"
      },
      "reset_password": {
        "successfully": "User  %{name} will receive an email with instructions on how to reset his (her) password in a few minutes."
      },
      "spoof": {
        "successfully": "You was successfully login as %{name}"
      },
      "toggle_status": {
        "successfully": "User %{name} was successfully updated."
      },
      "update": {
        "successfully": "User %{name} was successfully updated."
      }
    },
    "meta_title": "Administration panel",
    "navigation": {
      "assessments": "Assessments",
      "client": "Client Tenancy",
      "clients": "Client Tenancies",
      "communication_center": "Communication Center",
      "create": "Create",
      "design": "Design",
      "dimension": "Dimension",
      "dimensions": "Dimensions",
      "factors": "Factors",
      "home": "Dashboard",
      "libraries": "Media Library",
      "norm": "Norm",
      "norms": "Norms",
      "norms_editor": "Norm Editor",
      "occupations": "Occupations",
      "occupations_factors": "Factors",
      "psychometrics": "Psychometrics",
      "question_center": "Question Center",
      "reports": "Reports",
      "statistics": "Statistics",
      "sub_factors": "Sub-Factors",
      "survey": "Survey",
      "surveys": "Surveys",
      "users": "Users",
      "users_add": "Add New",
      "users_import": "Import"
    },
    "new": "New",
    "no_data_found": "No data found",
    "norms": {
      "copy": {
        "error": "Norm #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Norm %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Rename Norm"
      },
      "editor": {
        "factors": "Factors",
        "inplace_title": "Enter value",
        "sub_factors": "Sub Factors",
        "title": "Norm Editor",
        "tooltips": {
          "edit": "Edit Title"
        }
      },
      "index": {
        "title": "Norms",
        "tooltips": {
          "create": "Create",
          "import": "Import"
        }
      },
      "new": {
        "header": "New norm"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Norm?</p>\n",
            "title": "Delete <strong>Norm</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Norm?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Norm",
          "delete": "Delete Norm",
          "edit": "Rename Norm"
        }
      },
      "sidebar": {
        "assign": "Assign Norm",
        "copy": "Copy Norm",
        "destroy": "Delete Norm",
        "disable": "Disable",
        "edit": "Rename Norm",
        "editor": "Norm Editor",
        "enable": "Enable",
        "export": "Export Norm",
        "import": "Import Norm",
        "new": "New Norm",
        "surveys": "Linked Surveys",
        "title": "Norm's options (#%{id})",
        "view": "View Norm"
      },
      "toggle_status": {
        "successfully": "Norm was successfully updated."
      }
    },
    "noty": {
      "error_500": "Something went wrong. Contact your administrator.",
      "error_408": "This action takes too long. Please try to reload the page."
    },
    "occupations": {
      "copy": {
        "error": "Occupation #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Occupation #%{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit occupation"
      },
      "form": {
        "hint": {
          "key_career_tracks": "\"+\" - list, \"*\" - bold. Example: + *Biology* - some description..."
        }
      },
      "index": {
        "title": "Occupations",
        "tooltips": {
          "create": "Create"
        }
      },
      "new": {
        "header": "New occupation"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this occupation?</p>",
            "title": "Delete <strong>Occupation</strong> ?"
          }
        },
        "tooltips": {
          "copy": "Copy Occupation",
          "delete": "Delete Occupation",
          "edit": "Edit Occupation"
        }
      },
      "sidebar": {
        "copy": "Copy Occupation",
        "disable": "Disable",
        "edit": "Edit",
        "enable": "Enable",
        "new": "New Occupation",
        "title": "Occupation's options"
      },
      "toggle_status": {
        "successfully": "Occupation was successfully updated."
      }
    },
    "occupations_factors": {
      "copy": {
        "error": "Factor #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Factor #%{name} was successfully detached."
      },
      "edit": {
        "header": "Edit Factor"
      },
      "index": {
        "title": "Factors",
        "tooltips": {
          "create": "Create"
        }
      },
      "new": {
        "header": "Attach Factors"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this factor?</p>",
            "title": "Delete <strong>Factor</strong> ?"
          }
        },
        "tooltips": {
          "delete": "Delete Factor",
          "edit": "Edit Factor"
        }
      },
      "sidebar": {
        "disable": "Disable",
        "edit": "Edit",
        "enable": "Enable",
        "new": "Attach Factor",
        "title": "Factor's options"
      },
      "toggle_status": {
        "successfully": "Factor was successfully updated."
      }
    },
    "profiles": {
      "edit": {
        "success": "Profile was successfully updated.",
        "title": "Profile Editor"
      }
    },
    "psychometrics": "Psychometrics",
    "questions": {
      "destroy": {
        "successfully": "Question %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit Question"
      },
      "new": {
        "header": "New Question"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Question?</p>\n",
            "title": "Delete <strong>Question</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Question?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        }
      }
    },
    "reports": {
      "copy": {
        "error": "Report #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Report %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit Report Name"
      },
      "index": {
        "filterrific": {
          "with_assessment_category": {
            "360": "360 Feedback",
            "all": "All",
            "organisational": "Org Surveys",
            "psychometric": "Psychometrics"
          }
        },
        "title": "Reports",
        "tooltips": {
          "create": "Create"
        }
      },
      "new": {
        "header": "New Report"
      },
      "preview": {
        "export_pdf": "Export to PDF",
        "title": "Preview"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Report?</p>\n",
            "title": "Delete <strong>Report</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Report?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Report",
          "delete": "Delete Report",
          "edit": "Edit Report",
          "preview": "Preview Report"
        }
      },
      "sidebar": {
        "copy": "Copy Report",
        "destroy": "Delete Report",
        "edit": "Edit Report",
        "title": "Report's options (#%{id})",
        "view": "View Report"
      },
      "toggle_status": {
        "successfully": "Report was successfully updated."
      }
    },
    "search": "Search",
    "show": "Show",
    "sub_factors": {
      "copy": {
        "error": "Sub-Factor #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Sub-Factor %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit Sub-Factor Name"
      },
      "index": {
        "title": "Sub-Factors",
        "tooltips": {
          "create": "Create"
        }
      },
      "new": {
        "header": "New Sub-Factor"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Sub-Factor?</p>",
            "title": "Delete <strong>Sub-Factor</strong> ?"
          }
        },
        "tooltips": {
          "copy": "Copy Sub-Factor",
          "delete": "Delete Sub-Factor",
          "edit": "Edit Sub-Factor Name"
        }
      },
      "sidebar": {
        "destroy": "Delete Sub-Factor",
        "edit": "Edit Sub-Factor Name",
        "title": "Sub-Factor's options (#%{id})"
      },
      "toggle_status": {
        "successfully": "Sub-Factor was successfully updated."
      }
    },
    "templates": {
      "blocks": {
        "copy": {
          "error": "Block #%{name} was not copied."
        },
        "destroy": {
          "successfully": "Block %{name} was successfully destroyed."
        },
        "edit": {
          "header": "Edit Block"
        },
        "index": {
          "add": "Add New Block",
          "templates": {
          },
          "title": "Blocks",
          "tooltips": {
            "create": "Create"
          }
        },
        "new": {
          "header": "New Block"
        },
        "new_assign": {
          "header": "Assign Block to Assessments"
        },
        "resource": {
          "tooltips": {
            "copy": "Copy Block",
            "delete": "Delete Block",
            "edit": "Edit Block"
          }
        },
        "sidebar": {
          "destroy": "Delete Block",
          "disable": "Disable",
          "edit": "Edit Block",
          "enable": "Enable",
          "new": "New Block",
          "title": "Block's options (#%{id})"
        }
      },
      "questions": {
        "copy": {
          "error": "Question #%{name} was not copied."
        },
        "destroy": {
          "successfully": "Question %{name} was successfully destroyed."
        },
        "edit": {
          "header": "Edit Question"
        },
        "index": {
          "add": "Add New Question",
          "templates": {
            "blocks": "Blocks",
            "questions": "Questions"
          },
          "title": "Questions",
          "tooltips": {
            "create": "Create"
          }
        },
        "new": {
          "header": "New Question"
        },
        "new_assign": {
          "header": "Assign Question to Assessments"
        },
        "resource": {
          "tooltips": {
            "copy": "Copy Question",
            "delete": "Delete Question",
            "edit": "Edit Question"
          }
        },
        "sidebar": {
          "destroy": "Delete Question",
          "disable": "Disable",
          "edit": "Edit Question",
          "enable": "Enable",
          "new": "New Question",
          "title": "Question's options (#%{id})"
        }
      }
    },
    "translations": {
      "assessments": {
        "new": {
          "header": "Import Translations"
        }
      },
      "import": {
        "successfully": "Translations was successfully imported"
      }
    },
    "uniq_id": "Uniq ID",
    "update": "Update",
    "users": {
      "create": {
        "successfully": "User %{name} was successfully created."
      },
      "destroy": {
        "successfully": "User %{name} was successfully destroyed."
      },
      "edit": {
        "add": "Add",
        "hris_data": "HRIS Data",
        "key": "Key",
        "personal_data": "Personal Data",
        "remove": "Remove",
        "title": "Edit user",
        "value": "Value"
      },
      "form": {
        "choose": " - Choose - "
      },
      "index": {
        "add": "Add new user",
        "export": "Export",
        "filterrific": {
          "with_role": {
            "administration": "Administrators",
            "all": "All",
            "users": "Users"
          }
        },
        "import": "Import",
        "import_hris": "HRIS Data",
        "import_users": "Users",
        "title": "Users",
        "tooltips": {
          "create": "Create",
          "export": "Export",
          "import": "Import"
        }
      },
      "new": {
        "header": "New user"
      },
      "reset_password": {
        "successfully": "User  %{name} will receive an email with instructions on how to reset his (her) password in a few minutes."
      },
      "resource": {
        "confirmations": {
          "change_password": {
            "body": "<p>Are you sure you want to send instructions with link to change password?</p>\n",
            "title": "Change password <strong>%{name}</strong> ?"
          },
          "delete": {
            "body": "<p>Are you sure you want to delete this User?</p>\n",
            "title": "Delete <strong>%{name}</strong> ?"
          },
          "membership": {
            "delete": {
              "body": "<p>Are you sure you want to delete?</p>\n",
              "title": "Delete <strong>%{name}</strong> from %{client_name} Client Tenancy?"
            }
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this User?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "change_password": "Change password",
          "chart": "View user report",
          "delete": "Delete user",
          "edit": "Edit user",
          "mail": "Send mail",
          "sign_in": "Login as user"
        }
      },
      "sidebar": {
        "assessments_and_reports": "Assessments and Reporting",
        "destroy": "Delete User",
        "disable": "Disable",
        "edit_user": "Edit User",
        "email": "Send mail",
        "enable": "Enable",
        "export_users": "Export users",
        "import_users": "Import users",
        "login_as_user": "Login as User",
        "new_user": "New User",
        "reset_password": "Change Password",
        "title": "User's options (#%{id})"
      },
      "spoof": {
        "successfully": "You was successfully login as %{name}"
      },
      "toggle_status": {
        "successfully": "User %{name} was successfully updated."
      },
      "update": {
        "successfully": "User %{name} was successfully updated."
      }
    }
  },
  "assessments": {
    "decorator": {
      "no_description": "Description is empty"
    },
    "index": {
      "managers_dashboard_button": "Managers Dashboard",
      "user_dashboard_button": "User Dashboard"
    },
    "resource": {
      "assigned": "Assigned %{date}",
      "questions": {
        "one": "1 Question",
        "other": "%{count} Questions",
        "zero": "No Questions"
      },
      "results": "Results",
      "status": {
        "completed": "Completed",
        "in_progress": "Resume",
        "not_started": "Start"
      }
    }
  },
  "assigns": {
    "decorator": {
      "completed": "Completed %{date}",
      "not_completed": "Not Completed"
    },
    "notifications": {
      "completed": "%{user_name} finished assessment \"%{assessment_name}\"",
      "in_progress": "%{user_name} started to take assessment \"%{assessment_name}\""
    }
  },
  "ckeditor": {
    "buttons": {
      "cancel": "Cancel",
      "delete": "Delete",
      "next": "Next",
      "upload": "Upload"
    },
    "confirm_delete": "Delete file?",
    "page_title": "CKEditor Files Manager"
  },
  "clear_filter": "Clear Filter",
  "confirmation": {
    "default_body": "Are you sure?",
    "default_title": "Confirmation"
  },
  "date": {
    "abbr_day_names": [
      "Sun",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ],
    "abbr_month_names": [
      null,
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ],
    "day_names": [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ],
    "formats": {
      "default": "%Y-%m-%d",
      "long": "%B %d, %Y",
      "short": "%b %d"
    },
    "month_names": [
      null,
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ],
    "order": [
      "year",
      "month",
      "day"
    ]
  },
  "datetime": {
    "distance_in_words": {
      "about_x_hours": {
        "one": "about 1 hour",
        "other": "about %{count} hours"
      },
      "about_x_months": {
        "one": "about 1 month",
        "other": "about %{count} months"
      },
      "about_x_years": {
        "one": "about 1 year",
        "other": "about %{count} years"
      },
      "almost_x_years": {
        "one": "almost 1 year",
        "other": "almost %{count} years"
      },
      "half_a_minute": "half a minute",
      "less_than_x_minutes": {
        "one": "less than a minute",
        "other": "less than %{count} minutes"
      },
      "less_than_x_seconds": {
        "one": "less than 1 second",
        "other": "less than %{count} seconds"
      },
      "over_x_years": {
        "one": "over 1 year",
        "other": "over %{count} years"
      },
      "x_days": {
        "one": "1 day",
        "other": "%{count} days"
      },
      "x_minutes": {
        "one": "1 minute",
        "other": "%{count} minutes"
      },
      "x_months": {
        "one": "1 month",
        "other": "%{count} months"
      },
      "x_seconds": {
        "one": "1 second",
        "other": "%{count} seconds"
      }
    },
    "prompts": {
      "day": "Day",
      "hour": "Hour",
      "minute": "Minute",
      "month": "Month",
      "second": "Seconds",
      "year": "Year"
    }
  },
  "devise": {
    "administrators": {
      "meta_title": "Login to administration panel",
      "passwords": {
        "edit": {
          "submit": "Set new password",
          "title": "Change your password"
        },
        "new": {
          "back": "Return back",
          "submit": "Send me instructions",
          "title": "Forgot your password?"
        }
      },
      "sessions": {
        "new": {
          "forgot_password": "Forgot your password?",
          "submit": "Login",
          "title": "<strong>Welcome</strong>, Please login"
        }
      },
      "shared": {
        "links": {
          "about": "About",
          "app_name": "© 2016 AppName",
          "contact_us": "Contact Us",
          "privacy": "Privacy"
        }
      }
    },
    "confirmations": {
      "confirmed": "Your email address has been successfully confirmed.",
      "new": {
        "resend_confirmation_instructions": "Resend confirmation instructions"
      },
      "send_instructions": "You will receive an email with instructions for how to confirm your email address in a few minutes.",
      "send_paranoid_instructions": "If your email address exists in our database, you will receive an email with instructions for how to confirm your email address in a few minutes."
    },
    "failure": {
      "already_authenticated": "You are already signed in.",
      "inactive": "Your account is not activated yet.",
      "invalid": "Invalid %{authentication_keys} or password.",
      "invited": "You have a pending invitation, accept it to finish creating your account.",
      "last_attempt": "You have one more attempt before your account is locked.",
      "locked": "Your account is locked.",
      "not_found_in_database": "Invalid %{authentication_keys} or password.",
      "timeout": "Your session expired. Please login again to continue.",
      "unauthenticated": "You need to login or register before continuing.",
      "unconfirmed": "You have to confirm your email address before continuing."
    },
    "invitations": {
      "edit": {
        "header": "Set your password",
        "submit_button": "Set my password"
      },
      "invitation_removed": "Your invitation was removed.",
      "invitation_token_invalid": "The invitation token provided is not valid!",
      "new": {
        "header": "Send invitation",
        "submit_button": "Send an invitation"
      },
      "no_invitations_remaining": "No invitations remaining",
      "send_instructions": "An invitation email has been sent to %{email}.",
      "updated": "Your password was set successfully. You are now signed in.",
      "updated_not_active": "Your password was set successfully."
    },
    "mailer": {
      "confirmation_instructions": {
        "action": "Confirm my account",
        "greeting": "Welcome %{recipient}!",
        "instruction": "You can confirm your account email through the link below:",
        "subject": "Confirmation instructions"
      },
      "invitation_instructions": {
        "accept": "Accept invitation",
        "accept_until": "This invitation will be due in %{due_date}.",
        "hello": "Hello %{email}",
        "ignore": "If you don't want to accept the invitation, please ignore this email.<br />\nYour account won't be created until you access the link above and set your password.",
        "someone_invited_you": "Someone has invited you to %{url}, you can accept it through the link below.",
        "subject": "Invitation instructions"
      },
      "password_change": {
        "greeting": "Hello %{recipient}!",
        "message": "We're contacting you to notify you that your password has been changed.",
        "subject": "Password Changed"
      },
      "reset_password_instructions": {
        "action": "Change my password",
        "greeting": "Hello %{recipient}!",
        "instruction": "Someone has requested a link to change your password, and you can do this through the link below.",
        "instruction_2": "If you didn't request this, please ignore this email.",
        "instruction_3": "Your password won't change until you access the link above and create a new one.",
        "subject": "Reset password instructions"
      },
      "unlock_instructions": {
        "action": "Unlock my account",
        "greeting": "Hello %{recipient}!",
        "instruction": "Click the link below to unlock your account:",
        "message": "Your account has been locked due to an excessive amount of unsuccessful sign in attempts.",
        "subject": "Unlock instructions"
      }
    },
    "omniauth_callbacks": {
      "failure": "Could not authenticate you from %{kind} because \"%{reason}\".",
      "success": "Successfully authenticated from %{kind} account."
    },
    "passwords": {
      "edit": {
        "change_my_password": "Change my password",
        "change_your_password": "Change your password",
        "confirm_new_password": "Confirm new password",
        "new_password": "New password"
      },
      "new": {
        "forgot_your_password": "Forgot your password?",
        "send_me_reset_password_instructions": "Send me reset password instructions"
      },
      "no_token": "You can't access this page without coming from a password reset email. If you do come from a password reset email, please make sure you used the full URL provided.",
      "send_instructions": "You will receive an email with instructions on how to reset your password in a few minutes.",
      "send_paranoid_instructions": "If your email address exists in our database, you will receive a password recovery link at your email address in a few minutes.",
      "updated": "Your password has been changed successfully. You are now signed in.",
      "updated_not_active": "Your password has been changed successfully."
    },
    "registrations": {
      "destroyed": "Bye! Your account has been successfully cancelled. We hope to see you again soon.",
      "edit": {
        "are_you_sure": "Are you sure?",
        "cancel_my_account": "Cancel my account",
        "currently_waiting_confirmation_for_email": "Currently waiting confirmation for: %{email}",
        "leave_blank_if_you_don_t_want_to_change_it": "leave blank if you don't want to change it",
        "title": "Edit %{resource}",
        "unhappy": "Unhappy",
        "update": "Update",
        "we_need_your_current_password_to_confirm_your_changes": "we need your current password to confirm your changes"
      },
      "new": {
        "sign_up": "Sign up"
      },
      "signed_up": "Welcome! You have signed up successfully.",
      "signed_up_but_inactive": "You have signed up successfully. However, we could not sign you in because your account is not yet activated.",
      "signed_up_but_locked": "You have signed up successfully. However, we could not sign you in because your account is locked.",
      "signed_up_but_unconfirmed": "A message with a confirmation link has been sent to your email address. Please follow the link to activate your account.",
      "update_needs_confirmation": "You updated your account successfully, but we need to verify your new email address. Please check your email and follow the confirm link to confirm your new email address.",
      "updated": "Your account has been updated successfully."
    },
    "sessions": {
      "already_signed_out": "Signed out successfully.",
      "new": {
        "sign_in": "Sign in"
      },
      "signed_in": "Signed in successfully.",
      "signed_out": "Signed out successfully."
    },
    "shared": {
      "links": {
        "back": "Back",
        "didn_t_receive_confirmation_instructions": "Didn't receive confirmation instructions?",
        "didn_t_receive_unlock_instructions": "Didn't receive unlock instructions?",
        "forgot_your_password": "Forgot your password?",
        "sign_in": "Sign in",
        "sign_in_with_provider": "Sign in with %{provider}",
        "sign_up": "Sign up"
      }
    },
    "unlocks": {
      "new": {
        "resend_unlock_instructions": "Resend unlock instructions"
      },
      "send_instructions": "You will receive an email with instructions for how to unlock your account in a few minutes.",
      "send_paranoid_instructions": "If your account exists, you will receive an email with instructions for how to unlock it in a few minutes.",
      "unlocked": "Your account has been unlocked successfully. Please login to continue."
    },
    "users": {
      "passwords": {
        "new": {
          "submit": "Send me instructions",
          "tabs": {
            "register": "Register",
            "sign_in": "Sign In"
          }
        }
      },
      "registrations": {
        "new": {
          "submit": "Register",
          "tabs": {
            "register": "Register",
            "sign_in": "Sign In"
          }
        }
      },
      "sessions": {
        "new": {
          "forgot_password": "Forgot password?",
          "keep_sign_in": "Yes, Keep me signed in",
          "submit": "Sign In",
          "tabs": {
            "register": "Register",
            "sign_in": "Sign In"
          }
        }
      }
    }
  },
  "errors": {
    "connection_refused": "Oops! Failed to connect to the Web Console middleware.\nPlease make sure a rails development server is running.\n",
    "format": "%{attribute} %{message}",
    "messages": {
      "accepted": "must be accepted",
      "allowed_file_content_types": "file should be one of %{types}",
      "already_confirmed": "was already confirmed, please try signing in",
      "blank": "can't be blank",
      "carrierwave_download_error": "could not be downloaded",
      "carrierwave_integrity_error": "is not of an allowed file type",
      "carrierwave_processing_error": "failed to be processed",
      "confirmation": "doesn't match %{attribute}",
      "confirmation_period_expired": "needs to be confirmed within %{period}, please request a new one",
      "empty": "can't be empty",
      "equal_to": "must be equal to %{count}",
      "even": "must be even",
      "excluded_file_content_types": "file cannot be %{types}",
      "exclusion": "is reserved",
      "expired": "has expired, please request a new one",
      "extension_black_list_error": "You are not allowed to upload %{extension} files, prohibited types: %{prohibited_types}",
      "extension_white_list_error": "You are not allowed to upload %{extension} files, allowed types: %{allowed_types}",
      "file_size_is_greater_than": "file size must be greater than %{count}",
      "file_size_is_greater_than_or_equal_to": "file size must be greater than or equal to %{count}",
      "file_size_is_in": "file size must be between %{min} and %{max}",
      "file_size_is_less_than": "file size must be less than %{count}",
      "file_size_is_less_than_or_equal_to": "file size must be less than or equal to %{count}",
      "greater_than": "must be greater than %{count}",
      "greater_than_or_equal_to": "must be greater than or equal to %{count}",
      "inclusion": "is not included in the list",
      "invalid": "is invalid",
      "less_than": "must be less than %{count}",
      "less_than_or_equal_to": "must be less than or equal to %{count}",
      "mime_types_processing_error": "Failed to process file with MIME::Types, maybe not valid content-type? Original Error: %{e}",
      "mini_magick_processing_error": "Failed to manipulate with MiniMagick, maybe it is not an image? Original Error: %{e}",
      "model_invalid": "Validation failed: %{errors}",
      "not_a_number": "is not a number",
      "not_an_integer": "must be an integer",
      "not_found": "not found",
      "not_locked": "was not locked",
      "not_saved": {
        "one": "1 error prohibited this %{resource} from being saved:",
        "other": "%{count} errors prohibited this %{resource} from being saved:"
      },
      "odd": "must be odd",
      "other_than": "must be other than %{count}",
      "present": "must be blank",
      "required": "must exist",
      "rmagick_processing_error": "Failed to manipulate with rmagick, maybe it is not an image? Original Error: %{e}",
      "taken": "has already been taken",
      "too_long": {
        "one": "is too long (maximum is 1 character)",
        "other": "is too long (maximum is %{count} characters)"
      },
      "too_short": {
        "one": "is too short (minimum is 1 character)",
        "other": "is too short (minimum is %{count} characters)"
      },
      "wrong_length": {
        "one": "is the wrong length (should be 1 character)",
        "other": "is the wrong length (should be %{count} characters)"
      }
    },
    "unacceptable_request": "A supported version is expected in the Accept header.\n",
    "unavailable_session": "Session %{id} is is no longer available in memory.\n\nIf you happen to run on a multi-process server (like Unicorn or Puma) the process\nthis request hit doesn't store %{id} in memory. Consider turning the number of\nprocesses/workers to one (1) or using a different server in development.\n"
  },
  "flash": {
    "actions": {
      "create": {
        "notice": "%{resource_name} was successfully created."
      },
      "destroy": {
        "alert": "%{resource_name} could not be destroyed.",
        "notice": "%{resource_name} was successfully destroyed."
      },
      "update": {
        "notice": "%{resource_name} was successfully updated."
      }
    }
  },
  "helpers": {
    "page_entries_info": {
      "more_pages": {
        "display_entries": "Displaying %{entry_name} <b>%{first}&nbsp;-&nbsp;%{last}</b> of <b>%{total}</b> in total"
      },
      "one_page": {
        "display_entries": {
          "one": "Displaying <b>1</b> %{entry_name}",
          "other": "Displaying <b>all %{count}</b> %{entry_name}",
          "zero": "No %{entry_name} found"
        }
      }
    },
    "select": {
      "prompt": "Please select"
    },
    "submit": {
      "create": "Create %{model}",
      "submit": "Save %{model}",
      "update": "Update %{model}"
    }
  },
  "home": {
    "survey_instructions": {
      "title": "Instructions"
    }
  },
  "i18n_tasks": {
    "add_missing": {
      "added": {
        "one": "Added %{count} key",
        "other": "Added %{count} keys"
      }
    },
    "cmd": {
      "args": {
        "default_text": "Default: %{value}",
        "desc": {
          "confirm": "Confirm automatically",
          "data_format": "Data format: %{valid_text}.",
          "key_pattern": "Filter by key pattern (e.g. 'common.*')",
          "key_pattern_to_rename": "Full key (pattern) to rename. Required",
          "locale": "i18n_tasks.common.locale",
          "locale_to_translate_from": "Locale to translate from",
          "locales_filter": "Locale(s) to process. Special: base",
          "missing_types": "Filter by types: %{valid}",
          "new_key_name": "New name, interpolates original name as %{key}. Required",
          "nostdin": "Do not read from stdin",
          "out_format": "Output format: %{valid_text}",
          "pattern_router": "Use pattern router: keys moved per config data.write",
          "strict": "Avoid inferring dynamic key usages such as t(\"cats.#{cat}.name\"). Takes precedence over the config setting if set.",
          "value": "Value. Interpolates: %{value}, %{human_key}, %{key}, %{default}, %{value_or_human_key}, %{value_or_default_or_human_key}"
        }
      },
      "desc": {
        "add_missing": "add missing keys to locale data",
        "config": "display i18n-tasks configuration",
        "data": "show locale data",
        "data_merge": "merge locale data with trees",
        "data_remove": "remove keys present in tree from data",
        "data_write": "replace locale data with tree",
        "eq_base": "show translations equal to base value",
        "find": "show where keys are used in the code",
        "gem_path": "show path to the gem",
        "health": "is everything OK?",
        "irb": "start REPL session within i18n-tasks context",
        "missing": "show missing translations",
        "normalize": "normalize translation data: sort and move to the right files",
        "remove_unused": "remove unused keys",
        "translate_missing": "translate missing keys with Google Translate",
        "tree_convert": "convert tree between formats",
        "tree_filter": "filter tree by key pattern",
        "tree_merge": "merge trees",
        "tree_rename_key": "rename tree node",
        "tree_set_value": "set values of keys, optionally match a pattern",
        "tree_subtract": "tree A minus the keys in tree B",
        "tree_translate": "Google Translate a tree to root locales",
        "unused": "show unused translations",
        "xlsx_report": "save missing and unused translations to an Excel file"
      },
      "encourage": [
        "Good job!",
        "Well done!",
        "Perfect!"
      ],
      "enum_list_opt": {
        "invalid": "%{invalid} is not in: %{valid}."
      },
      "enum_opt": {
        "invalid": "%{invalid} is not one of: %{valid}."
      },
      "errors": {
        "invalid_format": "invalid format: %{invalid}. valid: %{valid}.",
        "invalid_locale": "invalid locale: %{invalid}",
        "invalid_missing_type": {
          "one": "invalid type: %{invalid}. valid: %{valid}.",
          "other": "unknown types: %{invalid}. valid: %{valid}."
        },
        "pass_forest": "pass locale forest"
      }
    },
    "common": {
      "base_value": "Base Value",
      "continue_q": "Continue?",
      "key": "Key",
      "locale": "Locale",
      "n_more": "%{count} more",
      "type": "Type",
      "value": "Value"
    },
    "data_stats": {
      "text": "has %{key_count} keys across %{locale_count} locales. On average, values are %{value_chars_avg} characters long, keys have %{key_segments_avg} segments, a locale has %{per_locale_avg} keys.",
      "text_single_locale": "has %{key_count} keys in total. On average, values are %{value_chars_avg} characters long, keys have %{key_segments_avg} segments.",
      "title": "Forest (%{locales})"
    },
    "google_translate": {
      "errors": {
        "no_api_key": "Set Google API key via GOOGLE_TRANSLATE_API_KEY environment variable or translation.api_key in config/i18n-tasks.yml. Get the key at https://code.google.com/apis/console.",
        "no_results": "Google Translate returned no results. Make sure billing information is set at https://code.google.com/apis/console."
      }
    },
    "health": {
      "no_keys_detected": "No keys detected. Check data.read in config/i18n-tasks.yml."
    },
    "missing": {
      "details_title": "Value in other locales or source",
      "none": "No translations are missing."
    },
    "remove_unused": {
      "confirm": {
        "one": "%{count} translation will be removed from %{locales}.",
        "other": "%{count} translation will be removed from %{locales}."
      },
      "noop": "No unused keys to remove",
      "removed": "Removed %{count} keys"
    },
    "translate_missing": {
      "translated": "Translated %{count} keys"
    },
    "unused": {
      "none": "Every translation is in use."
    },
    "usages": {
      "none": "No key usages found."
    }
  },
  "languages": {
    "ar": "Arabic",
    "cn": "Chinese",
    "de": "German",
    "en": "English",
    "es": "Spanish",
    "fr": "French"
  },
  "layouts": {
    "users": {
      "dashboard": "Dashboard",
      "help": "Help",
      "logout": "Log Out",
      "menu": "Menu",
      "notifications": "Notifications",
      "profile": "Profile"
    }
  },
  "managers": {
    "assigns": {
      "index": {
        "title": "Assessments and Reporting Centre"
      },
      "list": {
        "action": "Action",
        "assessment_name": "Assessment Name",
        "assessment_type": "Assessment Type",
        "completion_date": "Completion Date",
        "name": "Name",
        "status": "Completion Status"
      },
      "resource": {
        "email": "Email",
        "save": "Save in PDF",
        "view": "View"
      }
    },
    "dashboard": {
      "index": {
        "assessment_center": "Assessment / Report Centre",
        "notification_center": "Notification Centre",
        "notifications": "Notifications",
        "relationships": "Company Relationships",
        "reporting": "Reporting",
        "statistics": "Statistics"
      }
    },
    "notifications": {
      "index": {
        "subtitle": "Notifications",
        "title": "Notification Centre"
      }
    },
    "reports": {
      "show": {
        "export_pdf": "Export to PDF",
        "header": "Report"
      }
    },
    "statistics": {
      "index": {
        "title": "Statistics"
      }
    },
    "users": {
      "index": {
        "title": "Company Relationships"
      }
    }
  },
  "no": "No",
  "number": {
    "currency": {
      "format": {
        "delimiter": ",",
        "format": "%u%n",
        "precision": 2,
        "separator": ".",
        "significant": false,
        "strip_insignificant_zeros": false,
        "unit": "$"
      }
    },
    "format": {
      "delimiter": ",",
      "precision": 3,
      "separator": ".",
      "significant": false,
      "strip_insignificant_zeros": false
    },
    "human": {
      "decimal_units": {
        "format": "%n %u",
        "units": {
          "billion": "Billion",
          "million": "Million",
          "quadrillion": "Quadrillion",
          "thousand": "Thousand",
          "trillion": "Trillion",
          "unit": ""
        }
      },
      "format": {
        "delimiter": "",
        "precision": 3,
        "significant": true,
        "strip_insignificant_zeros": true
      },
      "storage_units": {
        "format": "%n %u",
        "units": {
          "byte": {
            "one": "Byte",
            "other": "Bytes"
          },
          "eb": "EB",
          "gb": "GB",
          "kb": "KB",
          "mb": "MB",
          "pb": "PB",
          "tb": "TB"
        }
      }
    },
    "percentage": {
      "format": {
        "delimiter": "",
        "format": "%n%"
      }
    },
    "precision": {
      "format": {
        "delimiter": ""
      }
    }
  },
  "profiles": {
    "edit": {
      "header": "Profile Settings"
    },
    "update": {
      "successfully": "Profile updated"
    }
  },
  "ransack": {
    "all": "all",
    "and": "and",
    "any": "any",
    "asc": "ascending",
    "attribute": "attribute",
    "combinator": "combinator",
    "condition": "condition",
    "desc": "descending",
    "or": "or",
    "predicate": "predicate",
    "predicates": {
      "blank": "is blank",
      "cont": "contains",
      "cont_all": "contains all",
      "cont_any": "contains any",
      "does_not_match": "doesn't match",
      "does_not_match_all": "doesn't match all",
      "does_not_match_any": "doesn't match any",
      "end": "ends with",
      "end_all": "ends with all",
      "end_any": "ends with any",
      "eq": "equals",
      "eq_all": "equals all",
      "eq_any": "equals any",
      "false": "is false",
      "gt": "greater than",
      "gt_all": "greater than all",
      "gt_any": "greater than any",
      "gteq": "greater than or equal to",
      "gteq_all": "greater than or equal to all",
      "gteq_any": "greater than or equal to any",
      "in": "in",
      "in_all": "in all",
      "in_any": "in any",
      "lt": "less than",
      "lt_all": "less than all",
      "lt_any": "less than any",
      "lteq": "less than or equal to",
      "lteq_all": "less than or equal to all",
      "lteq_any": "less than or equal to any",
      "matches": "matches",
      "matches_all": "matches all",
      "matches_any": "matches any",
      "not_cont": "doesn't contain",
      "not_cont_all": "doesn't contain all",
      "not_cont_any": "doesn't contain any",
      "not_end": "doesn't end with",
      "not_end_all": "doesn't end with all",
      "not_end_any": "doesn't end with any",
      "not_eq": "not equal to",
      "not_eq_all": "not equal to all",
      "not_eq_any": "not equal to any",
      "not_in": "not in",
      "not_in_all": "not in all",
      "not_in_any": "not in any",
      "not_null": "is not null",
      "not_start": "doesn't start with",
      "not_start_all": "doesn't start with all",
      "not_start_any": "doesn't start with any",
      "null": "is null",
      "present": "is present",
      "start": "starts with",
      "start_all": "starts with all",
      "start_any": "starts with any",
      "true": "is true"
    },
    "search": "search",
    "sort": "sort",
    "value": "value"
  },
  "reports": {
    "modules": {
      "common": {
        "almost_always": "Almost Always",
        "less_typical": "Less Typical",
        "moderate": "Moderate",
        "more_typical": "More Typical",
        "rare": "Rare"
      },
      "cpi_occupations": {
        "occupations": "Occupations",
        "your_potential_suitability": "Your Potential Suitability"
      },
      "gap_assessment": {
        "gap": "Gap",
        "item": "Item",
        "negative_gap": "Negative Gap",
        "positive_gap": "Positive Gap",
        "rank": "Rank",
        "scoring_category": "Scoring Category"
      },
      "highest_lowest": {
        "bottom_5": "BOTTOM 5",
        "email": "Email",
        "first_name": "First Name",
        "highest_scores": "Highest Scores",
        "item": "Item",
        "last_name": "Last Name",
        "lowest_scores": "Lowest Scores",
        "mean_score": "Mean Score",
        "rank": "Rank",
        "score": "Score",
        "sub_competenties": "Sub-Competencies",
        "top_5": "TOP 5"
      },
      "potential_career_full": {
        "bachelors_or_masters_qualification": "Bachelors or Masters Qualification",
        "detailed_career_guide": "Detailed Career Guide",
        "diploma_qualification": "Diploma Qualification",
        "education_level": "Education Level",
        "high_school_entry_roles": "High School Entry Roles",
        "key_career_tracks_within": "Key Career Tracks Within",
        "potential_areas_of_study": "Potential Areas of Study",
        "potential_roles": "Potential Roles"
      },
      "potential_career_short": {
        "career": "career",
        "for_this": "for this",
        "key": "key",
        "strengths": "strengths",
        "your_scores": "Your Scores"
      }
    },
    "show": {
      "export_pdf": "Export to PDF",
      "header": "Report"
    }
  },
  "simple_form": {
    "error_notification": {
      "default_message": "Please review the problems below:"
    },
    "no": "No",
    "placeholders": {
      "administrator": {
        "active": "Active",
        "created_at": "Created Date",
        "current_password": "Current password",
        "disabled": "Disable",
        "email": "Email Address",
        "first_name": "First Name",
        "id": "ID",
        "last_name": "Last Name",
        "manage_client_ids": "Memberships",
        "memberships": "Memberships",
        "password": "Password",
        "password_confirmation": "Password confirmation",
        "role": "Role",
        "roles": {
          "admin": "Client Admin",
          "manager": "Manager",
          "member": "User",
          "super_admin": "Super Admin",
          "superadmin": "Super Admin"
        },
        "types": {
          "anonymous": "Anonymous Users",
          "identified": "Identified Users"
        },
        "updated_at": "Modified Date"
      },
      "assessment": {
        "active": "Active",
        "categories": {
          "360": "360 Feedback",
          "organisational": "Org Surveys",
          "psychometric": "Psychometrics"
        },
        "category": "Category",
        "completed_at": "Completion Date",
        "created_at": "Created Date",
        "description": "Description",
        "id": "ID",
        "name": "Name",
        "statuses": {
          "completed": "Completed",
          "in_progress": "In Progress",
          "not_started": "New"
        },
        "timing": "Timing",
        "updated_at": "Modified Date"
      },
      "block": {
        "active": "Active",
        "assign_to_assessment_ids": "Assessments",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "client": {
        "category": "Category",
        "created_at": "Created Date",
        "id": "ID",
        "licenses": "License number",
        "licenses_expire": "License expire",
        "licenses_used": "Used license number",
        "logo": "Client logo",
        "name": "Name",
        "subdomain": "Subdomain",
        "updated_at": "Modified Date"
      },
      "dimension": {
        "active": "Active",
        "created_at": "Created Date",
        "factors_count": "No. of Factors",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "factor": {
        "active": "Active",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "parent_id": "Parent",
        "questions_count": "No. Questions",
        "subfactors_count": "No. Sub-Factors",
        "updated_at": "Modified Date"
      },
      "memebrship": {
        "id": "ID",
        "parent": "Direct Manager"
      },
      "norm": {
        "active": "Active",
        "bachelors_or_masters_qualification": "Bachelors or Masters Qualification",
        "created_at": "Created Date",
        "description": "Description",
        "diploma_qualification": "Diploma Qualification",
        "full_description": "Full Description",
        "high_school_entry_roles": "High School Entry Roles",
        "id": "ID",
        "key_career_tracks": "Key Career Tracks",
        "name": "Name",
        "potential_areas_of_study": "Potential Areas of Study",
        "updated_at": "Modified Date",
        "updated_by": "Edited by"
      },
      "question": {
        "active": "Active",
        "assign_to_assessment_ids": "Assessments",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "user": {
        "active": "Active",
        "created_at": "Created Date",
        "current_password": "Current password",
        "disabled": "Disable",
        "email": "Email Address",
        "first_name": "First Name",
        "id": "ID",
        "last_name": "Last Name",
        "manage_client_ids": "Memberships",
        "memberships": "Memberships",
        "password": "Password",
        "password_confirmation": "Password confirmation",
        "role": "Role",
        "roles": {
          "admin": "Client Admin",
          "manager": "Manager",
          "member": "User",
          "super_admin": "Super Admin",
          "superadmin": "Super Admin"
        },
        "types": {
          "anonymous": "Anonymous Users",
          "identified": "Identified Users"
        },
        "updated_at": "Modified Date"
      }
    },
    "required": {
      "mark": "*",
      "text": "required"
    },
    "yes": "Yes"
  },
  "support": {
    "array": {
      "last_word_connector": ", and ",
      "two_words_connector": " and ",
      "words_connector": ", "
    }
  },
  "time": {
    "am": "am",
    "formats": {
      "date": "%d/%m/%y",
      "default": "%a, %d %b %Y %H:%M:%S %z",
      "devise": {
        "mailer": {
          "invitation_instructions": {
            "accept_until_format": "%B %d, %Y %I:%M %p"
          }
        }
      },
      "long": "%B %d, %Y %H:%M",
      "short": "%d %b %Y / %H:%M"
    },
    "pm": "pm"
  },
  "validations": {
    "character_range": "Your response must be at least %{min} and no more than %{max} characters.",
    "date": "Your response must be a valid date (dd/mm/yyyy)",
    "each_group_contains": "Each group needs to contain not less than %{min} and not more than %{max} items",
    "email": "Your response must be a valid email",
    "issue": "Issue",
    "least": "Please answer at least %{min} choice(s).",
    "least_hotspot": "Please answer at least %{min} choice(s).",
    "max_length": "Your response must be no more than %{max} characters.",
    "min_length": "Your response must be at least %{min} characters.",
    "must_rank_between": "Please assign a value from %{min} to %{max} for each item. Values may not be repeated.",
    "must_select": "Please select from %{min} to %{max} choices",
    "number": "Your response must be a number",
    "range": "Please answer at least %{min} and no more than %{max} choice(s).",
    "text": "Your response must not contain a numbers",
    "title": "Sorry, you cannot continue until you correct the following:"
  },
  "views": {
    "pagination": {
      "first": "&laquo; First",
      "last": "Last &raquo;",
      "next": "Next &rsaquo;",
      "previous": "&lsaquo; Prev",
      "truncate": "&hellip;"
    }
  },
  "yes": "Yes"
});
I18n.translations["es"] = I18n.extend((I18n.translations["es"] || {}), {
  "activerecord": {
    "attributes": {
      "assessment": {
        "active": "Active",
        "categories": {
          "360": "360 Feedback",
          "organisational": "Org Surveys",
          "psychometric": "Psychometrics"
        },
        "category": "Category",
        "created_at": "Created Date",
        "description": "Description",
        "id": "ID",
        "name": "Name",
        "timing": "Timing",
        "updated_at": "Modified Date"
      },
      "assign": {
        "completed_at": "Completion Date",
        "statuses": {
          "completed": "Completed",
          "in_progress": "In Progress",
          "not_started": "New"
        }
      },
      "block": {
        "active": "Active",
        "assign_to_assessment_ids": "Assessments",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "client": {
        "category": "Category",
        "created_at": "Created Date",
        "id": "ID",
        "licenses": "License number",
        "licenses_expire": "License expire",
        "licenses_used": "Used license number",
        "logo": "Client logo",
        "name": "Name",
        "subdomain": "Subdomain",
        "updated_at": "Modified Date"
      },
      "dimension": {
        "active": "Active",
        "created_at": "Created Date",
        "factors_count": "No. of Factors",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "factor": {
        "active": "Active",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "parent_id": "Parent",
        "questions_count": "No. Questions",
        "subfactors_count": "No. Sub-Factors",
        "updated_at": "Modified Date"
      },
      "membership": {
        "parent_id": "Direct Manager"
      },
      "memebrship": {
        "id": "ID",
        "parent": "Direct Manager"
      },
      "norm": {
        "active": "Active",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date",
        "updated_by": "Edited by"
      },
      "occupation": {
        "active": "Active",
        "bachelors_or_masters_qualification": "Bachelors or Masters Qualification",
        "created_at": "Created Date",
        "description": "Description",
        "diploma_qualification": "Diploma Qualification",
        "full_description": "Full Description",
        "high_school_entry_roles": "High School Entry Roles",
        "id": "ID",
        "key_career_tracks": "Key Career Tracks",
        "name": "Name",
        "potential_areas_of_study": "Potential Areas of Study",
        "updated_at": "Modified Date"
      },
      "occupations_factor": {
        "active": "Active",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "question": {
        "active": "Active",
        "assign_to_assessment_ids": "Assessments",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "user": {
        "active": "Active",
        "created_at": "Created Date",
        "current_password": "Contraseña actual",
        "disabled": "Disable",
        "email": "Correo electrónico",
        "first_name": "First Name",
        "id": "ID",
        "last_name": "Last Name",
        "manage_client_ids": "Memberships",
        "memberships": "Memberships",
        "password": "Contraseña",
        "password_confirmation": "Confirmación de la contraseña",
        "remember_me": "Recordarme",
        "reset_password_token": "Restablecer token contraseña",
        "role": "Role",
        "roles": {
          "admin": "Client Admin",
          "manager": "Manager",
          "member": "User",
          "super_admin": "Super Admin",
          "superadmin": "Super Admin"
        },
        "types": {
          "anonymous": "Anonymous Users",
          "identified": "Identified Users"
        },
        "unlock_token": "Desbloquear token",
        "updated_at": "Modified Date"
      }
    },
    "errors": {
      "messages": {
        "not_uniqueness": "Assign has already been taken",
        "record_invalid": "Validation failed: %{errors}",
        "restrict_dependent_destroy": {
          "has_many": "Cannot delete record because dependent %{record} exist",
          "has_one": "Cannot delete record because a dependent %{record} exists"
        }
      },
      "models": {
        "factors_norm": {
          "score_from_must_be_number": "Score from must be number",
          "score_to_less_than_score_from": "Score to is less than Score from",
          "score_to_must_be_number": "Score to must be number"
        }
      }
    },
    "models": {
      "assessment": "Assessments",
      "assign": "Assigns",
      "block": "Block",
      "client": "Clients",
      "dimension": "Dimensions",
      "factor": "Factors",
      "factors_norm": "factors_norms",
      "membership": "Memebrship",
      "memebrship": "Memebrship",
      "norm": "Norms",
      "occupation": "Occupations",
      "occupations_factor": "Occupations",
      "question": "Question",
      "user": "Usuario"
    }
  },
  "administration": {
    "actions": "Actions",
    "active": "Active",
    "administrator": {
      "passwords": {
        "edit": {
          "submit": "Set new password",
          "title": "Change your password"
        },
        "new": {
          "back": "Return back",
          "submit": "Send me instructions",
          "title": "Forgot your password?"
        }
      },
      "sessions": {
        "new": {
          "forgot_password": "Forgot your password?",
          "submit": "Login",
          "title": "<strong>Welcome</strong>, Please login"
        }
      },
      "shared": {
        "links": {
          "about": "About",
          "app_name": "© 2016 AppName",
          "contact_us": "Contact Us",
          "privacy": "Privacy"
        }
      }
    },
    "any": " - Any - ",
    "assessments": {
      "assigns": {
        "default": {
          "filter": "Filter",
          "filter_form": "Filter form",
          "next": "Next",
          "previous": "Previous",
          "title": "Assign %{name} Assessment"
        },
        "finish": {
          "show": {
            "filter": "Filter",
            "filter_form": "Filter form",
            "next": "Next",
            "previous": "Previous",
            "title": "Assign %{name} Assessment"
          }
        },
        "step1": {
          "show": {
            "filter": "Filter",
            "filter_form": "Filter form",
            "next": "Next",
            "previous": "Previous",
            "title": "Assign %{name} Assessment"
          }
        },
        "step2": {
          "show": {
            "filter": "Filter",
            "filter_form": "Filter form",
            "next": "Next",
            "not_selected_users": "Not Selected Users",
            "previous": "Previous",
            "selected_users": "Selected Users",
            "title": "Assign %{name} Assessment"
          },
          "users": {
            "filter": "Filter",
            "filter_form": "Filter form",
            "next": "Next",
            "previous": "Previous",
            "title": "Assign %{name} Assessment"
          }
        }
      },
      "copy": {
        "error": "Assessment #%{name} was not copied.",
        "successfully": "Assessment %{name} was successfully copied."
      },
      "create": {
        "successfully": "Assessment %{name} was successfully created."
      },
      "dashboard": "Assessment Dashboard",
      "destroy": {
        "successfully": "Assessment %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit assessment"
      },
      "form": {
        "categories": {
          "360": "360 Feedback",
          "all": "All Categories",
          "organisational": "Org Surveys",
          "psychometric": "Psychometrics"
        },
        "timing": {
          "hint": "For Example: 30 minutes to complete"
        }
      },
      "index": {
        "filterrific": {
          "with_category": {
            "360": "360 Feedback",
            "all": "All Categories",
            "organisational": "Org Surveys",
            "psychometric": "Psychometrics"
          }
        },
        "title": "Assessments",
        "tooltips": {
          "create": "Create"
        }
      },
      "new": {
        "header": "New assessment"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Assessment?</p>\n",
            "title": "Delete <strong>Assessment</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Assessment?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Assessment",
          "delete": "Delete Assessment",
          "edit": "Edit Assessment"
        }
      },
      "sidebar": {
        "assign": "Assign Assessment",
        "copy": "Copy Assessment",
        "destroy": "Delete Assessment",
        "disable": "Disable",
        "edit": "Edit Assessment",
        "enable": "Enable",
        "new": "New Assessment",
        "preview": "Preview Assessment",
        "title": "Assessment's options (#%{id})"
      },
      "toggle_status": {
        "successfully": "Assessment %{name} was successfully updated."
      },
      "update": {
        "successfully": "Assessment %{name} was successfully updated."
      }
    },
    "assigns": {
      "create": {
        "successfully": "New assign to assessment was successfully created"
      },
      "destroy": {
        "successfully": "Assign to assessment was successfully destroy"
      },
      "index": {
        "title": "Reports"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this assign?</p>",
            "title": "Delete <strong>%{name}</strong> ?"
          }
        }
      }
    },
    "back": "Back",
    "base": {
      "top_sidebar": {
        "search": "Search...",
        "sign_out_message": {
          "body": "<p>Are you sure you want to log out?</p> <p>Press No if you want to continue work. Press Yes to logout current user.</p>",
          "title": "Log <strong>Out</strong> ?"
        }
      }
    },
    "blocks": {
      "destroy": {
        "successfully": "Block %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit Block"
      },
      "new": {
        "header": "New Block"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Block?</p>\n",
            "title": "Delete <strong>Block</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Block?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        }
      }
    },
    "breadcrumbs": {
      "assessments": "Assessments",
      "client": "Client Tenancy",
      "clients": "Client Tenancies",
      "communication_center": "Communication Center",
      "create": "Create",
      "design": "Design",
      "dimension": "Dimension",
      "dimensions": "Dimensions",
      "factors": "Factors",
      "home": "Dashboard",
      "libraries": "Media Library",
      "norm": "Norm",
      "norms": "Norms",
      "norms_editor": "Norm Editor",
      "occupations": "Occupations",
      "occupations_factors": "Factors",
      "psychometrics": "Psychometrics",
      "question_center": "Question Center",
      "reports": "Reports",
      "statistics": "Statistics",
      "sub_factors": "Sub-Factors",
      "survey": "Survey",
      "surveys": "Surveys",
      "users": "Users",
      "users_add": "Add New",
      "users_import": "Import"
    },
    "cable": {
      "notification": {
        "assessment_factors": "Factors are fetched",
        "assessment_update": "Assessment is updated",
        "block_clone": "Block is copied",
        "block_create": "Block %{name} is created",
        "block_create_by_template": "Block was loaded from template",
        "block_destroy": "Block has been deleted",
        "block_move_down": "Block %{name} is moved down",
        "block_move_up": "Block %{name} is moved up",
        "block_permanent_destroy": "Block is permanent destroyed",
        "block_rename": "Block is renamed",
        "block_restore": "Block is restored",
        "block_save_as_template": "Block saved as template",
        "block_unlink_template": "Block was unlinked",
        "block_update": "Block is updated",
        "comment_create": "Comment is created",
        "comment_destroy": "Comment has been deleted",
        "geo_filter": "Data filtered",
        "module_create": "Module %{name} is created",
        "module_destroy": "Module has been deleted",
        "module_insert_after": "Module is inserted after",
        "module_insert_before": "Module is inserted before",
        "module_move_down": "Module is moved down",
        "module_move_up": "Module is moved up",
        "module_rename": "Module is renamed",
        "module_update": "Module is updated",
        "page_create": "Page %{name} is created",
        "page_destroy": "Page has been deleted",
        "page_move_down": "Page %{name} is moved down",
        "page_move_up": "Page %{name} is moved up",
        "page_rename": "Page is renamed",
        "page_update": "Page is updated",
        "question_clone": "Question is copied",
        "question_create": "Question %{name} is created",
        "question_create_by_template": "Question was loaded from template",
        "question_create_from_template": "Question is created from template",
        "question_destroy": "Question has been deleted",
        "question_insert_after": "Question is inserted after",
        "question_insert_before": "Question is inserted before",
        "question_move_down": "Question is moved down",
        "question_move_up": "Question is moved up",
        "question_permanent_destroy": "Question is permanent destroyed",
        "question_rename": "Question is renamed",
        "question_restore": "Question is restored",
        "question_save_as_template": "Question saved as template",
        "question_unlink_template": "Question was unlinked",
        "question_update": "Question is updated",
        "report_change_filters": "Filters are updated",
        "report_update": "Report is updated",
        "scoring_update": "Scoring is updated",
        "trash_empty": "Trash Comment empty"
      }
    },
    "choose": " - Choose - ",
    "clear": "Clear",
    "clients": {
      "assessments": {
        "assigns": {
          "default": {
            "filter": "Filter",
            "filter_form": "Filter form",
            "next": "Next",
            "previous": "Previous",
            "title": "Assign %{name} Assessment"
          },
          "finish": {
            "show": {
              "filter": "Filter",
              "filter_form": "Filter form",
              "next": "Next",
              "previous": "Previous",
              "title": "Assign %{name} Assessment"
            }
          },
          "step1": {
            "show": {
              "filter": "Filter",
              "filter_form": "Filter form",
              "next": "Next",
              "previous": "Previous",
              "title": "Assign %{name} Assessment"
            }
          },
          "step2": {
            "show": {
              "filter": "Filter",
              "filter_form": "Filter form",
              "next": "Next",
              "not_selected_users": "Not Selected Users",
              "previous": "Previous",
              "selected_users": "Selected Users",
              "title": "Assign %{name} Assessment"
            },
            "users": {
              "filter": "Filter",
              "filter_form": "Filter form",
              "next": "Next",
              "previous": "Previous",
              "title": "Assign %{name} Assessment"
            }
          }
        },
        "copy": {
          "error": "Assessment #%{name} was not copied.",
          "successfully": "Assessment %{name} was successfully copied."
        },
        "create": {
          "successfully": "Assessment %{name} was successfully created."
        },
        "dashboard": "Assessment Dashboard",
        "destroy": {
          "successfully": "Assessment %{name} was successfully destroyed."
        },
        "edit": {
          "header": "Edit assessment"
        },
        "form": {
          "categories": {
            "360": "360 Feedback",
            "all": "All Categories",
            "organisational": "Org Surveys",
            "psychometric": "Psychometrics"
          },
          "timing": {
            "hint": "For Example: 30 minutes to complete"
          }
        },
        "index": {
          "filterrific": {
            "with_category": {
              "360": "360 Feedback",
              "all": "All Categories",
              "organisational": "Org Surveys",
              "psychometric": "Psychometrics"
            }
          },
          "title": "Assessments",
          "tooltips": {
            "create": "Create"
          }
        },
        "new": {
          "header": "New assessment"
        },
        "resource": {
          "confirmations": {
            "delete": {
              "body": "<p>Are you sure you want to delete this Assessment?</p>\n",
              "title": "Delete <strong>Assessment</strong> ?"
            },
            "toggle_status": {
              "body": "<p>Are you sure you want to %{status} this Assessment?</p>\n",
              "title": "<strong>%{status}</strong> %{name}?"
            }
          },
          "tooltips": {
            "copy": "Copy Assessment",
            "delete": "Delete Assessment",
            "edit": "Edit Assessment"
          }
        },
        "sidebar": {
          "assign": "Assign Assessment",
          "copy": "Copy Assessment",
          "destroy": "Delete Assessment",
          "disable": "Disable",
          "edit": "Edit Assessment",
          "enable": "Enable",
          "new": "New Assessment",
          "preview": "Preview Assessment",
          "title": "Assessment's options (#%{id})"
        },
        "toggle_status": {
          "successfully": "Assessment %{name} was successfully updated."
        },
        "update": {
          "successfully": "Assessment %{name} was successfully updated."
        }
      },
      "copy": {
        "error": "Client #%{name} was not copied.",
        "successfully": "Client %{name} was successfully copied."
      },
      "create": {
        "successfully": "Client %{name} was successfully created."
      },
      "designs": {
        "form": {
          "no_background": "No Background yet",
          "no_logo": "No Logo yet"
        }
      },
      "destroy": {
        "successfully": "Client %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit client"
      },
      "index": {
        "title": "Client Tenancies",
        "tooltips": {
          "create": "Create"
        }
      },
      "license": {
        "header": "%{name} - Edit license"
      },
      "new": {
        "header": "New client"
      },
      "reports": {
        "copy": {
          "error": "Report #%{id} was not copied."
        },
        "destroy": {
          "successfully": "Report %{name} was successfully destroyed."
        },
        "edit": {
          "header": "Edit Report Name"
        },
        "index": {
          "filterrific": {
            "with_assessment_category": {
              "360": "360 Feedback",
              "all": "All",
              "organisational": "Org Surveys",
              "psychometric": "Psychometrics"
            }
          },
          "title": "Reports",
          "tooltips": {
            "create": "Create"
          }
        },
        "new": {
          "header": "New Report"
        },
        "preview": {
          "export_pdf": "Export to PDF",
          "title": "Preview"
        },
        "resource": {
          "confirmations": {
            "delete": {
              "body": "<p>Are you sure you want to delete this Report?</p>\n",
              "title": "Delete <strong>Report</strong> ?"
            },
            "toggle_status": {
              "body": "<p>Are you sure you want to %{status} this Report?</p>\n",
              "title": "<strong>%{status}</strong> %{name}?"
            }
          },
          "tooltips": {
            "copy": "Copy Report",
            "delete": "Delete Report",
            "edit": "Edit Report",
            "preview": "Preview Report"
          }
        },
        "sidebar": {
          "copy": "Copy Report",
          "destroy": "Delete Report",
          "edit": "Edit Report",
          "title": "Report's options (#%{id})",
          "view": "View Report"
        },
        "toggle_status": {
          "successfully": "Report was successfully updated."
        }
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this client?</p>",
            "title": "Delete <strong>%{name}</strong> ?"
          },
          "disable": {
            "body": "<p>Are you sure you want to disable this client?</p>",
            "title": "Disable <strong>%{name}</strong> ?"
          },
          "enable": {
            "body": "<p>Are you sure you want to enable this client?</p>",
            "title": "Enable <strong>%{name}</strong> ?"
          }
        },
        "tooltips": {
          "copy": "Copy Client",
          "delete": "Delete Client",
          "edit": "Edit Client"
        }
      },
      "sidebar": {
        "copy": "Copy Client",
        "design": "Edit Design",
        "destroy": "Destroy Client",
        "disable": "Disable",
        "edit": "Edit Client",
        "enable": "Enable",
        "licenses": "Edit Licenses",
        "new": "New Client",
        "title": "Client's options (#%{id})"
      },
      "statistics": {
        "index": {
          "all_assessments": "All assessments",
          "assessment_type": "Assessment type",
          "title": "Statistics"
        }
      },
      "toggle_status": {
        "successfully": "Client %{name} was successfully updated."
      },
      "update": {
        "successfully": "Client %{name} was successfully updated."
      },
      "users": {
        "assigns": {
          "index": {
            "add": "Assign New Assessment",
            "title": "Assessments and Reporting"
          },
          "list": {
            "actions": "Actions",
            "assessment_name": "Assessment Name",
            "assessment_type": "Assessment Type",
            "reports": "Reports",
            "status": "Completion Status",
            "uniq_id": "Uniq ID"
          },
          "resource": {
            "no_access_to_reports": "No access to reports",
            "no_completed": "Not completed",
            "no_reports": "No relative reports",
            "tooltips": {
              "delete": "Delete Assign"
            }
          }
        },
        "create": {
          "successfully": "User %{name} was successfully created."
        },
        "destroy": {
          "successfully": "User %{name} was successfully destroyed."
        },
        "edit": {
          "add": "Add",
          "hris_data": "HRIS Data",
          "key": "Key",
          "personal_data": "Personal Data",
          "remove": "Remove",
          "title": "Edit user",
          "value": "Value"
        },
        "form": {
          "choose": " - Choose - "
        },
        "index": {
          "add": "Add new user",
          "export": "Export",
          "filterrific": {
            "with_role": {
              "administration": "Administrators",
              "all": "All",
              "users": "Users"
            }
          },
          "import": "Import",
          "import_hris": "HRIS Data",
          "import_users": "Users",
          "title": "Users",
          "tooltips": {
            "create": "Create",
            "export": "Export",
            "import": "Import"
          }
        },
        "new": {
          "header": "New user"
        },
        "reports": {
          "copy": {
            "error": "Report #%{id} was not copied."
          },
          "destroy": {
            "successfully": "Report %{name} was successfully destroyed."
          },
          "edit": {
            "header": "Edit Report Name"
          },
          "index": {
            "filterrific": {
              "with_assessment_category": {
                "360": "360 Feedback",
                "all": "All",
                "organisational": "Org Surveys",
                "psychometric": "Psychometrics"
              }
            },
            "title": "Reports",
            "tooltips": {
              "create": "Create"
            }
          },
          "new": {
            "header": "New Report"
          },
          "preview": {
            "export_pdf": "Export to PDF",
            "title": "Preview"
          },
          "resource": {
            "confirmations": {
              "delete": {
                "body": "<p>Are you sure you want to delete this Report?</p>\n",
                "title": "Delete <strong>Report</strong> ?"
              },
              "toggle_status": {
                "body": "<p>Are you sure you want to %{status} this Report?</p>\n",
                "title": "<strong>%{status}</strong> %{name}?"
              }
            },
            "tooltips": {
              "copy": "Copy Report",
              "delete": "Delete Report",
              "edit": "Edit Report",
              "preview": "Preview Report"
            }
          },
          "sidebar": {
            "copy": "Copy Report",
            "destroy": "Delete Report",
            "edit": "Edit Report",
            "title": "Report's options (#%{id})",
            "view": "View Report"
          },
          "toggle_status": {
            "successfully": "Report was successfully updated."
          }
        },
        "reset_password": {
          "successfully": "User  %{name} will receive an email with instructions on how to reset his (her) password in a few minutes."
        },
        "resource": {
          "confirmations": {
            "change_password": {
              "body": "<p>Are you sure you want to send instructions with link to change password?</p>\n",
              "title": "Change password <strong>%{name}</strong> ?"
            },
            "delete": {
              "body": "<p>Are you sure you want to delete this User?</p>\n",
              "title": "Delete <strong>%{name}</strong> ?"
            },
            "membership": {
              "delete": {
                "body": "<p>Are you sure you want to delete?</p>\n",
                "title": "Delete <strong>%{name}</strong> from %{client_name} Client Tenancy?"
              }
            },
            "toggle_status": {
              "body": "<p>Are you sure you want to %{status} this User?</p>\n",
              "title": "<strong>%{status}</strong> %{name}?"
            }
          },
          "tooltips": {
            "change_password": "Change password",
            "chart": "View user report",
            "delete": "Delete user",
            "edit": "Edit user",
            "mail": "Send mail",
            "sign_in": "Login as user"
          }
        },
        "sidebar": {
          "assessments_and_reports": "Assessments and Reporting",
          "destroy": "Delete User",
          "disable": "Disable",
          "edit_user": "Edit User",
          "email": "Send mail",
          "enable": "Enable",
          "export_users": "Export users",
          "import_users": "Import users",
          "login_as_user": "Login as User",
          "new_user": "New User",
          "reset_password": "Change Password",
          "title": "User's options (#%{id})"
        },
        "spoof": {
          "successfully": "You was successfully login as %{name}"
        },
        "toggle_status": {
          "successfully": "User %{name} was successfully updated."
        },
        "update": {
          "successfully": "User %{name} was successfully updated."
        }
      }
    },
    "close": "Close",
    "communications": {
      "copy": {
        "error": "Communication #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Communication %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit Communication"
      },
      "form": {
        "body_mustache": "{{first_name}} - Recipient First Name\n{{last_name}} - Recipient Last Name\n{{email}} - Recipient Email\n",
        "delivery_rules": {
          "after_complete": "Right after completion",
          "if_not_finished": "If assessment was not finished",
          "if_not_started": "If assessment is not started",
          "on_specific_datetime": "Specific date and time"
        },
        "selected_cc_recipients": "Selected CC Recipients",
        "selected_recipients": "Selected Recipients"
      },
      "index": {
        "add_new": "Add new",
        "title": "Communication Center",
        "tooltips": {
          "create": "Create"
        }
      },
      "new": {
        "header": "New Communication"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Communication?</p>\n",
            "title": "Delete <strong>Communication</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Communication?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Communication",
          "delete": "Delete Communication",
          "edit": "Edit Communication"
        }
      },
      "sidebar": {
        "copy": "Copy Communication",
        "destroy": "Delete Communication",
        "disable": "Disable Communication",
        "edit": "Edit Communication",
        "enable": "Enable Communication",
        "new": "New Communication",
        "title": "Communication's options (#%{id})",
        "view": "View Communication"
      },
      "toggle_status": {
        "successfully": "Communication was successfully updated."
      }
    },
    "copy": "Copy",
    "create": "Create",
    "dimensions": {
      "copy": {
        "error": "Dimension #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Dimension %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit Dimension Name"
      },
      "index": {
        "title": "Dimensions",
        "tooltips": {
          "create": "Create"
        }
      },
      "new": {
        "header": "New Dimension"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Dimension?</p>\n",
            "title": "Delete <strong>Dimension</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Dimension?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Dimension",
          "delete": "Delete Dimension",
          "edit": "Edit Dimension Name"
        }
      },
      "sidebar": {
        "assign": "Assign Dimension",
        "copy": "Copy Dimension",
        "destroy": "Delete Dimension",
        "disable": "Disable Dimension",
        "edit": "Edit Dimension Name",
        "enable": "Enable Dimension",
        "new": "New Dimension",
        "title": "Dimension's options (#%{id})",
        "view": "View Dimension"
      },
      "toggle_status": {
        "successfully": "Dimension was successfully updated."
      }
    },
    "disable": "Disable",
    "edit": "Edit",
    "enable": "Enable",
    "factors": {
      "copy": {
        "error": "Factor #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Factor %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit Factor Name"
      },
      "form": {
        "no_icon": "No Logo yet"
      },
      "index": {
        "icon": "Icon",
        "title": "Factors",
        "tooltips": {
          "create": "Create"
        }
      },
      "new": {
        "header": "New Factor"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Factor?</p>\n",
            "title": "Delete <strong>Factor</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Factor?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Factor",
          "delete": "Delete Factor",
          "edit": "Edit Factor Name"
        }
      },
      "sidebar": {
        "copy": "Copy Factor",
        "destroy": "Delete Factor",
        "edit": "Edit Factor Name",
        "title": "Factor's options (#%{id})",
        "view": "View Factor"
      },
      "toggle_status": {
        "successfully": "Factor was successfully updated."
      }
    },
    "genders": {
      "female": "Female",
      "male": "Male",
      "not_set": "Not set"
    },
    "home": {
      "index": {
        "notifications": "Notifications"
      }
    },
    "import": "Import",
    "imports": {
      "assessments": {
        "results": {
          "form": {
            "import": "Import"
          }
        }
      },
      "base": {
        "form": {
          "import": "Import"
        }
      },
      "errors": {
        "error": "[Row %{row}] %{error}",
        "invalid_assign": "Can't to find record for specified Result ID. If you want to create new result, please, leave Result ID column empty",
        "invalid_format": "There is no Email column",
        "norm": {
          "factor_is_not_described": "[#%{coords}] factor %{factor} is not described above",
          "factors_mismatch": "[#%{coords}] dimension %{dimension} does not have factor %{factor}",
          "not_set_dimension": "The name of the Dimension should be written in A-1",
          "sub_factors_mismatch": "[#%{coords}] dimension %{dimension} does not have sub factor %{factor}"
        },
        "result": {
          "error": "[Row %{row}] %{error}",
          "invalid_assign": "[Row %{row}] Can't to find record for specified Result ID. If you want to create new result, please, leave Result ID column empty",
          "invalid_format": "Invalid File format"
        },
        "translation": {
          "error": "[Translation %{id}] %{error}",
          "invalid_format": "Invalid File format"
        },
        "unknown_type": "Unknown file type: %{filename}",
        "user": {
          "not_found": "[Row %{row}] Couldn't find User with Email Address %{email}"
        }
      },
      "form": {
        "import": "Import"
      },
      "hris": {
        "form": {
          "import": "Import"
        }
      },
      "new": {
        "header": "Import"
      },
      "users": {
        "form": {
          "import": "Import"
        }
      }
    },
    "imports_assessments_result_imports": {
      "create": {
        "successfully": "Raw Results data was successfully imported"
      },
      "new": {
        "header": "Import Raw Results data"
      }
    },
    "imports_hris_imports": {
      "create": {
        "successfully": "HRIS data was successfully imported"
      },
      "new": {
        "header": "Import HRIS data"
      }
    },
    "imports_user_imports": {
      "create": {
        "successfully": "Users was successfully imported"
      },
      "new": {
        "header": "Import Users"
      }
    },
    "libraries": {
      "create": {
        "successfully": "Item %{name} was successfully created."
      },
      "destroy": {
        "successfully": "Item %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit"
      },
      "index": {
        "title": "Media Library"
      },
      "list": {
        "new_folder": "New folder",
        "root": "Media Library",
        "upload": "Upload new file"
      },
      "new": {
        "header": "New Report"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete %{name}?</p>\n",
            "title": "Delete <strong>%{name}</strong> ?"
          }
        },
        "tooltips": {
          "delete": "Delete",
          "edit": "Edit"
        }
      },
      "update": {
        "successfully": "Item %{name} was successfully updated."
      }
    },
    "memberships": {
      "create": {
        "successfully": "User %{name} was successfully created."
      },
      "destroy": {
        "successfully": "User %{name} was successfully destroyed."
      },
      "edit": {
        "add": "Add",
        "hris_data": "HRIS Data",
        "key": "Key",
        "personal_data": "Personal Data",
        "remove": "Remove",
        "title": "Edit user",
        "value": "Value"
      },
      "index": {
        "add": "Add new user",
        "export": "Export",
        "filterrific": {
          "with_role": {
            "administration": "Administrators",
            "all": "All",
            "users": "Users"
          }
        },
        "import": "Import",
        "import_hris": "HRIS Data",
        "import_users": "Users",
        "title": "Users",
        "tooltips": {
          "create": "Create",
          "export": "Export",
          "import": "Import"
        }
      },
      "new": {
        "header": "New user"
      },
      "reset_password": {
        "successfully": "User  %{name} will receive an email with instructions on how to reset his (her) password in a few minutes."
      },
      "spoof": {
        "successfully": "You was successfully login as %{name}"
      },
      "toggle_status": {
        "successfully": "User %{name} was successfully updated."
      },
      "update": {
        "successfully": "User %{name} was successfully updated."
      }
    },
    "meta_title": "Administration panel",
    "navigation": {
      "assessments": "Assessments",
      "client": "Client Tenancy",
      "clients": "Client Tenancies",
      "communication_center": "Communication Center",
      "create": "Create",
      "design": "Design",
      "dimension": "Dimension",
      "dimensions": "Dimensions",
      "factors": "Factors",
      "home": "Dashboard",
      "libraries": "Media Library",
      "norm": "Norm",
      "norms": "Norms",
      "norms_editor": "Norm Editor",
      "occupations": "Occupations",
      "occupations_factors": "Factors",
      "psychometrics": "Psychometrics",
      "question_center": "Question Center",
      "reports": "Reports",
      "statistics": "Statistics",
      "sub_factors": "Sub-Factors",
      "survey": "Survey",
      "surveys": "Surveys",
      "users": "Users",
      "users_add": "Add New",
      "users_import": "Import"
    },
    "new": "New",
    "no_data_found": "No data found",
    "norms": {
      "copy": {
        "error": "Norm #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Norm %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Rename Norm"
      },
      "editor": {
        "factors": "Factors",
        "inplace_title": "Enter value",
        "sub_factors": "Sub Factors",
        "title": "Norm Editor",
        "tooltips": {
          "edit": "Edit Title"
        }
      },
      "index": {
        "title": "Norms",
        "tooltips": {
          "create": "Create",
          "import": "Import"
        }
      },
      "new": {
        "header": "New norm"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Norm?</p>\n",
            "title": "Delete <strong>Norm</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Norm?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Norm",
          "delete": "Delete Norm",
          "edit": "Rename Norm"
        }
      },
      "sidebar": {
        "assign": "Assign Norm",
        "copy": "Copy Norm",
        "destroy": "Delete Norm",
        "disable": "Disable",
        "edit": "Rename Norm",
        "editor": "Norm Editor",
        "enable": "Enable",
        "export": "Export Norm",
        "import": "Import Norm",
        "new": "New Norm",
        "surveys": "Linked Surveys",
        "title": "Norm's options (#%{id})",
        "view": "View Norm"
      },
      "toggle_status": {
        "successfully": "Norm was successfully updated."
      }
    },
    "noty": {
      "error_500": "Something went wrong. Contact your administrator."
    },
    "occupations": {
      "copy": {
        "error": "Occupation #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Occupation #%{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit occupation"
      },
      "form": {
        "hint": {
          "key_career_tracks": "\"+\" - list, \"*\" - bold. Example: + *Biology* - some description..."
        }
      },
      "index": {
        "title": "Occupations",
        "tooltips": {
          "create": "Create"
        }
      },
      "new": {
        "header": "New occupation"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this occupation?</p>",
            "title": "Delete <strong>Occupation</strong> ?"
          }
        },
        "tooltips": {
          "copy": "Copy Occupation",
          "delete": "Delete Occupation",
          "edit": "Edit Occupation"
        }
      },
      "sidebar": {
        "copy": "Copy Occupation",
        "disable": "Disable",
        "edit": "Edit",
        "enable": "Enable",
        "new": "New Occupation",
        "title": "Occupation's options"
      },
      "toggle_status": {
        "successfully": "Occupation was successfully updated."
      }
    },
    "occupations_factors": {
      "copy": {
        "error": "Factor #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Factor #%{name} was successfully detached."
      },
      "edit": {
        "header": "Edit Factor"
      },
      "index": {
        "title": "Factors",
        "tooltips": {
          "create": "Create"
        }
      },
      "new": {
        "header": "Attach Factors"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this factor?</p>",
            "title": "Delete <strong>Factor</strong> ?"
          }
        },
        "tooltips": {
          "delete": "Delete Factor",
          "edit": "Edit Factor"
        }
      },
      "sidebar": {
        "disable": "Disable",
        "edit": "Edit",
        "enable": "Enable",
        "new": "Attach Factor",
        "title": "Factor's options"
      },
      "toggle_status": {
        "successfully": "Factor was successfully updated."
      }
    },
    "profiles": {
      "edit": {
        "success": "Profile was successfully updated.",
        "title": "Profile Editor"
      }
    },
    "psychometrics": "Psychometrics",
    "questions": {
      "destroy": {
        "successfully": "Question %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit Question"
      },
      "new": {
        "header": "New Question"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Question?</p>\n",
            "title": "Delete <strong>Question</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Question?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        }
      }
    },
    "reports": {
      "copy": {
        "error": "Report #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Report %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit Report Name"
      },
      "index": {
        "filterrific": {
          "with_assessment_category": {
            "360": "360 Feedback",
            "all": "All",
            "organisational": "Org Surveys",
            "psychometric": "Psychometrics"
          }
        },
        "title": "Reports",
        "tooltips": {
          "create": "Create"
        }
      },
      "new": {
        "header": "New Report"
      },
      "preview": {
        "export_pdf": "Export to PDF",
        "title": "Preview"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Report?</p>\n",
            "title": "Delete <strong>Report</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Report?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Report",
          "delete": "Delete Report",
          "edit": "Edit Report",
          "preview": "Preview Report"
        }
      },
      "sidebar": {
        "copy": "Copy Report",
        "destroy": "Delete Report",
        "edit": "Edit Report",
        "title": "Report's options (#%{id})",
        "view": "View Report"
      },
      "toggle_status": {
        "successfully": "Report was successfully updated."
      }
    },
    "search": "Search",
    "show": "Show",
    "sub_factors": {
      "copy": {
        "error": "Sub-Factor #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Sub-Factor %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit Sub-Factor Name"
      },
      "index": {
        "title": "Sub-Factors",
        "tooltips": {
          "create": "Create"
        }
      },
      "new": {
        "header": "New Sub-Factor"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Sub-Factor?</p>",
            "title": "Delete <strong>Sub-Factor</strong> ?"
          }
        },
        "tooltips": {
          "copy": "Copy Sub-Factor",
          "delete": "Delete Sub-Factor",
          "edit": "Edit Sub-Factor Name"
        }
      },
      "sidebar": {
        "destroy": "Delete Sub-Factor",
        "edit": "Edit Sub-Factor Name",
        "title": "Sub-Factor's options (#%{id})"
      },
      "toggle_status": {
        "successfully": "Sub-Factor was successfully updated."
      }
    },
    "templates": {
      "blocks": {
        "copy": {
          "error": "Block #%{name} was not copied."
        },
        "destroy": {
          "successfully": "Block %{name} was successfully destroyed."
        },
        "edit": {
          "header": "Edit Block"
        },
        "index": {
          "add": "Add New Block",
          "templates": {
          },
          "title": "Blocks",
          "tooltips": {
            "create": "Create"
          }
        },
        "new": {
          "header": "New Block"
        },
        "new_assign": {
          "header": "Assign Block to Assessments"
        },
        "resource": {
          "tooltips": {
            "copy": "Copy Block",
            "delete": "Delete Block",
            "edit": "Edit Block"
          }
        },
        "sidebar": {
          "destroy": "Delete Block",
          "disable": "Disable",
          "edit": "Edit Block",
          "enable": "Enable",
          "new": "New Block",
          "title": "Block's options (#%{id})"
        }
      },
      "questions": {
        "copy": {
          "error": "Question #%{name} was not copied."
        },
        "destroy": {
          "successfully": "Question %{name} was successfully destroyed."
        },
        "edit": {
          "header": "Edit Question"
        },
        "index": {
          "add": "Add New Question",
          "templates": {
            "blocks": "Blocks",
            "questions": "Questions"
          },
          "title": "Questions",
          "tooltips": {
            "create": "Create"
          }
        },
        "new": {
          "header": "New Question"
        },
        "new_assign": {
          "header": "Assign Question to Assessments"
        },
        "resource": {
          "tooltips": {
            "copy": "Copy Question",
            "delete": "Delete Question",
            "edit": "Edit Question"
          }
        },
        "sidebar": {
          "destroy": "Delete Question",
          "disable": "Disable",
          "edit": "Edit Question",
          "enable": "Enable",
          "new": "New Question",
          "title": "Question's options (#%{id})"
        }
      }
    },
    "translations": {
      "assessments": {
        "new": {
          "header": "Import Translations"
        }
      },
      "import": {
        "successfully": "Translations was successfully imported"
      }
    },
    "uniq_id": "Uniq ID",
    "update": "Update",
    "users": {
      "create": {
        "successfully": "User %{name} was successfully created."
      },
      "destroy": {
        "successfully": "User %{name} was successfully destroyed."
      },
      "edit": {
        "add": "Add",
        "hris_data": "HRIS Data",
        "key": "Key",
        "personal_data": "Personal Data",
        "remove": "Remove",
        "title": "Edit user",
        "value": "Value"
      },
      "form": {
        "choose": " - Choose - "
      },
      "index": {
        "add": "Add new user",
        "export": "Export",
        "filterrific": {
          "with_role": {
            "administration": "Administrators",
            "all": "All",
            "users": "Users"
          }
        },
        "import": "Import",
        "import_hris": "HRIS Data",
        "import_users": "Users",
        "title": "Users",
        "tooltips": {
          "create": "Create",
          "export": "Export",
          "import": "Import"
        }
      },
      "new": {
        "header": "New user"
      },
      "reset_password": {
        "successfully": "User  %{name} will receive an email with instructions on how to reset his (her) password in a few minutes."
      },
      "resource": {
        "confirmations": {
          "change_password": {
            "body": "<p>Are you sure you want to send instructions with link to change password?</p>\n",
            "title": "Change password <strong>%{name}</strong> ?"
          },
          "delete": {
            "body": "<p>Are you sure you want to delete this User?</p>\n",
            "title": "Delete <strong>%{name}</strong> ?"
          },
          "membership": {
            "delete": {
              "body": "<p>Are you sure you want to delete?</p>\n",
              "title": "Delete <strong>%{name}</strong> from %{client_name} Client Tenancy?"
            }
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this User?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "change_password": "Change password",
          "chart": "View user report",
          "delete": "Delete user",
          "edit": "Edit user",
          "mail": "Send mail",
          "sign_in": "Login as user"
        }
      },
      "sidebar": {
        "assessments_and_reports": "Assessments and Reporting",
        "destroy": "Delete User",
        "disable": "Disable",
        "edit_user": "Edit User",
        "email": "Send mail",
        "enable": "Enable",
        "export_users": "Export users",
        "import_users": "Import users",
        "login_as_user": "Login as User",
        "new_user": "New User",
        "reset_password": "Change Password",
        "title": "User's options (#%{id})"
      },
      "spoof": {
        "successfully": "You was successfully login as %{name}"
      },
      "toggle_status": {
        "successfully": "User %{name} was successfully updated."
      },
      "update": {
        "successfully": "User %{name} was successfully updated."
      }
    }
  },
  "assessments": {
    "decorator": {
      "no_description": "Description is empty"
    },
    "index": {
      "managers_dashboard_button": "Managers Dashboard",
      "user_dashboard_button": "User Dashboard"
    },
    "resource": {
      "assigned": "Assigned %{date}",
      "questions": {
        "one": "1 Question",
        "other": "%{count} Questions",
        "zero": "No Questions"
      },
      "results": "Results",
      "status": {
        "completed": "Completed",
        "in_progress": "Resume",
        "not_started": "Start"
      }
    }
  },
  "assigns": {
    "decorator": {
      "completed": "Completed %{date}",
      "not_completed": "Not Completed"
    },
    "notifications": {
      "completed": "%{user_name} finished assessment \"%{assessment_name}\"",
      "in_progress": "%{user_name} started to take assessment \"%{assessment_name}\""
    }
  },
  "ckeditor": {
    "buttons": {
      "cancel": "Cancelar",
      "delete": "Borrar",
      "next": "Next",
      "upload": "Subir"
    },
    "confirm_delete": "¿Borrar archivo?",
    "page_title": "Administrador de Archivos CKEditor"
  },
  "clear_filter": "Clear Filter",
  "confirmation": {
    "default_body": "Are you sure?",
    "default_title": "Confirmation"
  },
  "date": {
    "abbr_day_names": [
      "Sun",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ],
    "abbr_month_names": [
      null,
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ],
    "day_names": [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ],
    "formats": {
      "default": "%Y-%m-%d",
      "long": "%B %d, %Y",
      "short": "%b %d"
    },
    "month_names": [
      null,
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ],
    "order": [
      "year",
      "month",
      "day"
    ]
  },
  "datetime": {
    "distance_in_words": {
      "about_x_hours": {
        "one": "about 1 hour",
        "other": "about %{count} hours"
      },
      "about_x_months": {
        "one": "about 1 month",
        "other": "about %{count} months"
      },
      "about_x_years": {
        "one": "about 1 year",
        "other": "about %{count} years"
      },
      "almost_x_years": {
        "one": "almost 1 year",
        "other": "almost %{count} years"
      },
      "half_a_minute": "half a minute",
      "less_than_x_minutes": {
        "one": "less than a minute",
        "other": "less than %{count} minutes"
      },
      "less_than_x_seconds": {
        "one": "less than 1 second",
        "other": "less than %{count} seconds"
      },
      "over_x_years": {
        "one": "over 1 year",
        "other": "over %{count} years"
      },
      "x_days": {
        "one": "1 day",
        "other": "%{count} days"
      },
      "x_minutes": {
        "one": "1 minute",
        "other": "%{count} minutes"
      },
      "x_months": {
        "one": "1 month",
        "other": "%{count} months"
      },
      "x_seconds": {
        "one": "1 second",
        "other": "%{count} seconds"
      }
    },
    "prompts": {
      "day": "Day",
      "hour": "Hour",
      "minute": "Minute",
      "month": "Month",
      "second": "Seconds",
      "year": "Year"
    }
  },
  "devise": {
    "administrators": {
      "meta_title": "Login to administration panel",
      "passwords": {
        "edit": {
          "submit": "Set new password",
          "title": "Change your password"
        },
        "new": {
          "back": "Return back",
          "submit": "Send me instructions",
          "title": "Forgot your password?"
        }
      },
      "sessions": {
        "new": {
          "forgot_password": "Forgot your password?",
          "submit": "Login",
          "title": "<strong>Welcome</strong>, Please login"
        }
      },
      "shared": {
        "links": {
          "about": "About",
          "app_name": "© 2016 AppName",
          "contact_us": "Contact Us",
          "privacy": "Privacy"
        }
      }
    },
    "confirmations": {
      "confirmed": "Tu cuenta ha sido confirmada satisfactoriamente.",
      "new": {
        "resend_confirmation_instructions": "Reenviar instrucciones de confirmación"
      },
      "send_instructions": "Vas a recibir un correo con instrucciones sobre cómo confirmar tu cuenta en unos minutos.",
      "send_paranoid_instructions": "Si tu correo existe en nuestra base de datos, en unos minutos recibirás un correo con instrucciones sobre cómo confirmar tu cuenta."
    },
    "failure": {
      "already_authenticated": "Ya has iniciado sesión.",
      "inactive": "Tu cuenta aún no ha sido activada.",
      "invalid": "Email o contraseña no válidos.",
      "invited": "You have a pending invitation, accept it to finish creating your account.",
      "last_attempt": "Tienes un intento más antes de que tu cuenta sea bloqueada.",
      "locked": "Tu cuenta está bloqueada.",
      "not_found_in_database": "Email o contraseña no válidos.",
      "timeout": "Tu sesión expiró. Por favor, inicia sesión nuevamente para continuar.",
      "unauthenticated": "Tienes que iniciar sesión o registrarte para poder continuar.",
      "unconfirmed": "Tienes que confirmar tu cuenta para poder continuar."
    },
    "invitations": {
      "edit": {
        "header": "Set your password",
        "submit_button": "Set my password"
      },
      "invitation_removed": "Your invitation was removed.",
      "invitation_token_invalid": "The invitation token provided is not valid!",
      "new": {
        "header": "Send invitation",
        "submit_button": "Send an invitation"
      },
      "no_invitations_remaining": "No invitations remaining",
      "send_instructions": "An invitation email has been sent to %{email}.",
      "updated": "Your password was set successfully. You are now signed in.",
      "updated_not_active": "Your password was set successfully."
    },
    "mailer": {
      "confirmation_instructions": {
        "action": "Confirmar mi cuenta",
        "greeting": "¡Bienvenido %{recipient}!",
        "instruction": "Usted puede confirmar el correo electrónico de su cuenta a través de este enlace:",
        "subject": "Instrucciones de confirmación"
      },
      "invitation_instructions": {
        "accept": "Accept invitation",
        "accept_until": "This invitation will be due in %{due_date}.",
        "hello": "Hello %{email}",
        "ignore": "If you don't want to accept the invitation, please ignore this email.<br />\nYour account won't be created until you access the link above and set your password.",
        "someone_invited_you": "Someone has invited you to %{url}, you can accept it through the link below.",
        "subject": "Invitation instructions"
      },
      "password_change": {
        "greeting": "Hola %{recipient}!",
        "message": "Le estamos contactando para notificarle que su contraseña ha sido cambiada.",
        "subject": "Contraseña cambiada"
      },
      "reset_password_instructions": {
        "action": "Cambiar mi contraseña",
        "greeting": "¡Hola %{recipient}!",
        "instruction": "Alguien ha solicitado un enlace para cambiar su contraseña, lo que se puede realizar a través del siguiente enlace.",
        "instruction_2": "Si usted no lo ha solicitado, por favor ignore este correo electrónico.",
        "instruction_3": "Su contraseña no será cambiada hasta que usted acceda el enlace y cree uno nuevo.",
        "subject": "Instrucciones de recuperación de contraseña"
      },
      "unlock_instructions": {
        "action": "Desbloquear mi cuenta",
        "greeting": "¡Hola %{recipient}!",
        "instruction": "Haga click en el siguiente enlace para desbloquear su cuenta:",
        "message": "Su cuenta ha sido bloqueada debido a una cantidad excesiva de intentos infructuosos para ingresar.",
        "subject": "Instrucciones para desbloquear"
      }
    },
    "omniauth_callbacks": {
      "failure": "No has sido autorizado en la cuenta %{kind} porque \"%{reason}\".",
      "success": "Has sido autorizado satisfactoriamente en la cuenta %{kind}."
    },
    "passwords": {
      "edit": {
        "change_my_password": "Cambiar mi contraseña",
        "change_your_password": "Cambie su contraseña",
        "confirm_new_password": "Confirme la nueva contraseña",
        "new_password": "Nueva contraseña"
      },
      "new": {
        "forgot_your_password": "¿Ha olvidado su contraseña?",
        "send_me_reset_password_instructions": "Envíeme las instrucciones para resetear mi contraseña"
      },
      "no_token": "No puedes acceder a esta página si no es a través de un enlace para resetear tu contraseña. Si has llegado hasta aquí desde el email para resetear tu contraseña, por favor asegúrate de que la URL introducida está completa.",
      "send_instructions": "Recibirás un correo con instrucciones sobre cómo resetear tu contraseña en unos pocos minutos.",
      "send_paranoid_instructions": "Si tu correo existe en nuestra base de datos, recibirás un correo con instrucciones sobre cómo resetear tu contraseña en tu bandeja de entrada.",
      "updated": "Se ha cambiado tu contraseña. Ya iniciaste sesión.",
      "updated_not_active": "Tu contraseña fue cambiada."
    },
    "registrations": {
      "destroyed": "¡Adiós! Tu cuenta ha sido cancelada correctamente. Esperamos verte pronto.",
      "edit": {
        "are_you_sure": "¿Está usted seguro?",
        "cancel_my_account": "Anular mi cuenta",
        "currently_waiting_confirmation_for_email": "Actualmente esperando la confirmacion de: %{email} ",
        "leave_blank_if_you_don_t_want_to_change_it": "dejar en blanco si no desea cambiarlo",
        "title": "Editar %{resource}",
        "unhappy": "Infeliz",
        "update": "Actualizar",
        "we_need_your_current_password_to_confirm_your_changes": "necesitamos su contraseña actual para confirmar los cambios"
      },
      "new": {
        "sign_up": "Registrarse"
      },
      "signed_up": "Bienvenido. Tu cuenta fue creada.",
      "signed_up_but_inactive": "Tu cuenta ha sido creada correctamente. Sin embargo, no hemos podido iniciar la sesión porque tu cuenta aún no está activada.",
      "signed_up_but_locked": "Tu cuenta ha sido creada correctamente. Sin embargo, no hemos podido iniciar la sesión porque que tu cuenta está bloqueada.",
      "signed_up_but_unconfirmed": "Se ha enviado un mensaje con un enlace de confirmación a tu correo electrónico. Abre el enlace para activar tu cuenta.",
      "update_needs_confirmation": "Has actualizado tu cuenta correctamente, pero es necesario confirmar tu nuevo correo electrónico. Por favor, comprueba tu correo y sigue el enlace de confirmación para finalizar la comprobación del nuevo correo eletrónico.",
      "updated": "Tu cuenta se ha actualizada."
    },
    "sessions": {
      "already_signed_out": "Sesión finalizada.",
      "new": {
        "sign_in": "Iniciar sesión"
      },
      "signed_in": "Sesión iniciada.",
      "signed_out": "Sesión finalizada."
    },
    "shared": {
      "links": {
        "back": "Atrás",
        "didn_t_receive_confirmation_instructions": "¿No ha recibido las instrucciones de confirmación?",
        "didn_t_receive_unlock_instructions": "¿No ha recibido instrucciones para desbloquear?",
        "forgot_your_password": "¿Ha olvidado su contraseña?",
        "sign_in": "Iniciar sesión",
        "sign_in_with_provider": "Iniciar sesión con %{provider}",
        "sign_up": "Registrarse"
      }
    },
    "unlocks": {
      "new": {
        "resend_unlock_instructions": "Reenviar instrucciones para desbloquear"
      },
      "send_instructions": "Vas a recibir instrucciones para desbloquear tu cuenta en unos pocos minutos.",
      "send_paranoid_instructions": "Si tu cuenta existe, vas a recibir instrucciones para desbloquear tu cuenta en unos pocos minutos.",
      "unlocked": "Tu cuenta ha sido desbloqueada. Ya puedes iniciar sesión."
    },
    "users": {
      "passwords": {
        "new": {
          "submit": "Send me instructions",
          "tabs": {
            "register": "Register",
            "sign_in": "Sign In"
          }
        }
      },
      "registrations": {
        "new": {
          "submit": "Register",
          "tabs": {
            "register": "Register",
            "sign_in": "Sign In"
          }
        }
      },
      "sessions": {
        "new": {
          "forgot_password": "Forgot password?",
          "keep_sign_in": "Yes, Keep me signed in",
          "submit": "Sign In",
          "tabs": {
            "register": "Register",
            "sign_in": "Sign In"
          }
        }
      }
    }
  },
  "errors": {
    "connection_refused": "Oops! Failed to connect to the Web Console middleware.\nPlease make sure a rails development server is running.\n",
    "format": "%{attribute} %{message}",
    "messages": {
      "accepted": "must be accepted",
      "allowed_file_content_types": "file should be one of %{types}",
      "already_confirmed": "ya ha sido confirmada, por favor intenta iniciar sesión",
      "blank": "can't be blank",
      "carrierwave_download_error": "could not be downloaded",
      "carrierwave_integrity_error": "is not of an allowed file type",
      "carrierwave_processing_error": "failed to be processed",
      "confirmation": "doesn't match %{attribute}",
      "confirmation_period_expired": "necesita confirmarse dentro de %{period}, por favor solicita una nueva",
      "empty": "can't be empty",
      "equal_to": "must be equal to %{count}",
      "even": "must be even",
      "excluded_file_content_types": "file cannot be %{types}",
      "exclusion": "is reserved",
      "expired": "ha expirado, por favor solicita una nueva",
      "extension_black_list_error": "You are not allowed to upload %{extension} files, prohibited types: %{prohibited_types}",
      "extension_white_list_error": "You are not allowed to upload %{extension} files, allowed types: %{allowed_types}",
      "file_size_is_greater_than": "file size must be greater than %{count}",
      "file_size_is_greater_than_or_equal_to": "file size must be greater than or equal to %{count}",
      "file_size_is_in": "file size must be between %{min} and %{max}",
      "file_size_is_less_than": "file size must be less than %{count}",
      "file_size_is_less_than_or_equal_to": "file size must be less than or equal to %{count}",
      "greater_than": "must be greater than %{count}",
      "greater_than_or_equal_to": "must be greater than or equal to %{count}",
      "inclusion": "is not included in the list",
      "invalid": "is invalid",
      "less_than": "must be less than %{count}",
      "less_than_or_equal_to": "must be less than or equal to %{count}",
      "mime_types_processing_error": "Failed to process file with MIME::Types, maybe not valid content-type? Original Error: %{e}",
      "mini_magick_processing_error": "Failed to manipulate with MiniMagick, maybe it is not an image? Original Error: %{e}",
      "model_invalid": "Validation failed: %{errors}",
      "not_a_number": "is not a number",
      "not_an_integer": "must be an integer",
      "not_found": "no se ha encontrado",
      "not_locked": "no estaba bloqueada",
      "not_saved": {
        "one": "Ocurrió un error al tratar de guardar %{resource}:",
        "other": "Ocurrieron %{count} errores al tratar de guardar %{resource}:"
      },
      "odd": "must be odd",
      "other_than": "must be other than %{count}",
      "present": "must be blank",
      "required": "must exist",
      "rmagick_processing_error": "Failed to manipulate with rmagick, maybe it is not an image? Original Error: %{e}",
      "taken": "has already been taken",
      "too_long": {
        "one": "is too long (maximum is 1 character)",
        "other": "is too long (maximum is %{count} characters)"
      },
      "too_short": {
        "one": "is too short (minimum is 1 character)",
        "other": "is too short (minimum is %{count} characters)"
      },
      "wrong_length": {
        "one": "is the wrong length (should be 1 character)",
        "other": "is the wrong length (should be %{count} characters)"
      }
    },
    "unacceptable_request": "A supported version is expected in the Accept header.\n",
    "unavailable_session": "Session %{id} is is no longer available in memory.\n\nIf you happen to run on a multi-process server (like Unicorn or Puma) the process\nthis request hit doesn't store %{id} in memory. Consider turning the number of\nprocesses/workers to one (1) or using a different server in development.\n"
  },
  "flash": {
    "actions": {
      "create": {
        "notice": "%{resource_name} was successfully created."
      },
      "destroy": {
        "alert": "%{resource_name} could not be destroyed.",
        "notice": "%{resource_name} was successfully destroyed."
      },
      "update": {
        "notice": "%{resource_name} was successfully updated."
      }
    }
  },
  "helpers": {
    "page_entries_info": {
      "more_pages": {
        "display_entries": "Displaying %{entry_name} <b>%{first}&nbsp;-&nbsp;%{last}</b> of <b>%{total}</b> in total"
      },
      "one_page": {
        "display_entries": {
          "one": "Displaying <b>1</b> %{entry_name}",
          "other": "Displaying <b>all %{count}</b> %{entry_name}",
          "zero": "No %{entry_name} found"
        }
      }
    },
    "select": {
      "prompt": "Please select"
    },
    "submit": {
      "create": "Create %{model}",
      "submit": "Save %{model}",
      "update": "Update %{model}"
    }
  },
  "home": {
    "survey_instructions": {
      "title": "Instructions"
    }
  },
  "i18n_tasks": {
    "add_missing": {
      "added": {
        "one": "Added %{count} key",
        "other": "Added %{count} keys"
      }
    },
    "cmd": {
      "args": {
        "default_text": "Default: %{value}",
        "desc": {
          "confirm": "Confirm automatically",
          "data_format": "Data format: %{valid_text}.",
          "key_pattern": "Filter by key pattern (e.g. 'common.*')",
          "key_pattern_to_rename": "Full key (pattern) to rename. Required",
          "locale": "i18n_tasks.common.locale",
          "locale_to_translate_from": "Locale to translate from",
          "locales_filter": "Locale(s) to process. Special: base",
          "missing_types": "Filter by types: %{valid}",
          "new_key_name": "New name, interpolates original name as %{key}. Required",
          "nostdin": "Do not read from stdin",
          "out_format": "Output format: %{valid_text}",
          "pattern_router": "Use pattern router: keys moved per config data.write",
          "strict": "Avoid inferring dynamic key usages such as t(\"cats.#{cat}.name\"). Takes precedence over the config setting if set.",
          "value": "Value. Interpolates: %{value}, %{human_key}, %{key}, %{default}, %{value_or_human_key}, %{value_or_default_or_human_key}"
        }
      },
      "desc": {
        "add_missing": "add missing keys to locale data",
        "config": "display i18n-tasks configuration",
        "data": "show locale data",
        "data_merge": "merge locale data with trees",
        "data_remove": "remove keys present in tree from data",
        "data_write": "replace locale data with tree",
        "eq_base": "show translations equal to base value",
        "find": "show where keys are used in the code",
        "gem_path": "show path to the gem",
        "health": "is everything OK?",
        "irb": "start REPL session within i18n-tasks context",
        "missing": "show missing translations",
        "normalize": "normalize translation data: sort and move to the right files",
        "remove_unused": "remove unused keys",
        "translate_missing": "translate missing keys with Google Translate",
        "tree_convert": "convert tree between formats",
        "tree_filter": "filter tree by key pattern",
        "tree_merge": "merge trees",
        "tree_rename_key": "rename tree node",
        "tree_set_value": "set values of keys, optionally match a pattern",
        "tree_subtract": "tree A minus the keys in tree B",
        "tree_translate": "Google Translate a tree to root locales",
        "unused": "show unused translations",
        "xlsx_report": "save missing and unused translations to an Excel file"
      },
      "encourage": [
        "Good job!",
        "Well done!",
        "Perfect!"
      ],
      "enum_list_opt": {
        "invalid": "%{invalid} is not in: %{valid}."
      },
      "enum_opt": {
        "invalid": "%{invalid} is not one of: %{valid}."
      },
      "errors": {
        "invalid_format": "invalid format: %{invalid}. valid: %{valid}.",
        "invalid_locale": "invalid locale: %{invalid}",
        "invalid_missing_type": {
          "one": "invalid type: %{invalid}. valid: %{valid}.",
          "other": "unknown types: %{invalid}. valid: %{valid}."
        },
        "pass_forest": "pass locale forest"
      }
    },
    "common": {
      "base_value": "Base Value",
      "continue_q": "Continue?",
      "key": "Key",
      "locale": "Locale",
      "n_more": "%{count} more",
      "type": "Type",
      "value": "Value"
    },
    "data_stats": {
      "text": "has %{key_count} keys across %{locale_count} locales. On average, values are %{value_chars_avg} characters long, keys have %{key_segments_avg} segments, a locale has %{per_locale_avg} keys.",
      "text_single_locale": "has %{key_count} keys in total. On average, values are %{value_chars_avg} characters long, keys have %{key_segments_avg} segments.",
      "title": "Forest (%{locales})"
    },
    "google_translate": {
      "errors": {
        "no_api_key": "Set Google API key via GOOGLE_TRANSLATE_API_KEY environment variable or translation.api_key in config/i18n-tasks.yml. Get the key at https://code.google.com/apis/console.",
        "no_results": "Google Translate returned no results. Make sure billing information is set at https://code.google.com/apis/console."
      }
    },
    "health": {
      "no_keys_detected": "No keys detected. Check data.read in config/i18n-tasks.yml."
    },
    "missing": {
      "details_title": "Value in other locales or source",
      "none": "No translations are missing."
    },
    "remove_unused": {
      "confirm": {
        "one": "%{count} translation will be removed from %{locales}.",
        "other": "%{count} translation will be removed from %{locales}."
      },
      "noop": "No unused keys to remove",
      "removed": "Removed %{count} keys"
    },
    "translate_missing": {
      "translated": "Translated %{count} keys"
    },
    "unused": {
      "none": "Every translation is in use."
    },
    "usages": {
      "none": "No key usages found."
    }
  },
  "languages": {
    "ar": "Arabic",
    "cn": "Chinese",
    "de": "German",
    "en": "English",
    "es": "Spanish",
    "fr": "French"
  },
  "layouts": {
    "users": {
      "dashboard": "Dashboard",
      "help": "Help",
      "logout": "Log Out",
      "menu": "Menu",
      "notifications": "Notifications",
      "profile": "Profile"
    }
  },
  "managers": {
    "assigns": {
      "index": {
        "title": "Assessments and Reporting Centre"
      },
      "list": {
        "action": "Action",
        "assessment_name": "Assessment Name",
        "assessment_type": "Assessment Type",
        "completion_date": "Completion Date",
        "name": "Name",
        "status": "Completion Status"
      },
      "resource": {
        "email": "Email",
        "save": "Save in PDF",
        "view": "View"
      }
    },
    "dashboard": {
      "index": {
        "assessment_center": "Assessment / Report Centre",
        "notification_center": "Notification Centre",
        "notifications": "Notifications",
        "relationships": "Company Relationships",
        "reporting": "Reporting",
        "statistics": "Statistics"
      }
    },
    "notifications": {
      "index": {
        "subtitle": "Notifications",
        "title": "Notification Centre"
      }
    },
    "reports": {
      "show": {
        "export_pdf": "Export to PDF",
        "header": "Report"
      }
    },
    "statistics": {
      "index": {
        "title": "Statistics"
      }
    },
    "users": {
      "index": {
        "title": "Company Relationships"
      }
    }
  },
  "no": "No",
  "number": {
    "currency": {
      "format": {
        "delimiter": ",",
        "format": "%u%n",
        "precision": 2,
        "separator": ".",
        "significant": false,
        "strip_insignificant_zeros": false,
        "unit": "$"
      }
    },
    "format": {
      "delimiter": ",",
      "precision": 3,
      "separator": ".",
      "significant": false,
      "strip_insignificant_zeros": false
    },
    "human": {
      "decimal_units": {
        "format": "%n %u",
        "units": {
          "billion": "Billion",
          "million": "Million",
          "quadrillion": "Quadrillion",
          "thousand": "Thousand",
          "trillion": "Trillion",
          "unit": ""
        }
      },
      "format": {
        "delimiter": "",
        "precision": 3,
        "significant": true,
        "strip_insignificant_zeros": true
      },
      "storage_units": {
        "format": "%n %u",
        "units": {
          "byte": {
            "one": "Byte",
            "other": "Bytes"
          },
          "eb": "EB",
          "gb": "GB",
          "kb": "KB",
          "mb": "MB",
          "pb": "PB",
          "tb": "TB"
        }
      }
    },
    "percentage": {
      "format": {
        "delimiter": "",
        "format": "%n%"
      }
    },
    "precision": {
      "format": {
        "delimiter": ""
      }
    }
  },
  "profiles": {
    "edit": {
      "header": "Profile Settings"
    },
    "update": {
      "successfully": "Profile updated"
    }
  },
  "ransack": {
    "all": "todos",
    "and": "y",
    "any": "cualquier",
    "asc": "ascendente",
    "attribute": "atributo",
    "combinator": "combinado",
    "condition": "condición",
    "desc": "descendente",
    "or": "o",
    "predicate": "predicado",
    "predicates": {
      "blank": "está en blanco",
      "cont": "contiene",
      "cont_all": "contiene todos",
      "cont_any": "contiene cualquier",
      "does_not_match": "no coincide",
      "does_not_match_all": "no coincide con todos",
      "does_not_match_any": "no coincide con ninguna",
      "end": "termina con",
      "end_all": "termina con todo",
      "end_any": "termina con cualquier",
      "eq": "es igual a",
      "eq_all": "es igual a todos",
      "eq_any": "es igual a cualquier",
      "false": "es falso",
      "gt": "mayor que",
      "gt_all": "mayor que todos",
      "gt_any": "mayor que cualquier",
      "gteq": "mayor que o igual a",
      "gteq_all": "mayor que o igual a todos",
      "gteq_any": "mayor que o igual a cualquier",
      "in": "en",
      "in_all": "en todos",
      "in_any": "en cualquier",
      "lt": "menor que",
      "lt_all": "menor o igual a",
      "lt_any": "menor que cualquier",
      "lteq": "menor que o igual a",
      "lteq_all": "menor o igual a todos",
      "lteq_any": "menor o igual a cualquier",
      "matches": "coincidir",
      "matches_all": "coincidir a todos",
      "matches_any": "coincidir a cualquier",
      "not_cont": "no contiene",
      "not_cont_all": "no contiene toda",
      "not_cont_any": "no contiene ninguna",
      "not_end": "no termina con",
      "not_end_all": "no termina con todo",
      "not_end_any": "no termina con cualquier",
      "not_eq": "no es igual a",
      "not_eq_all": "no es iguala todos",
      "not_eq_any": "no es igual a cualquier",
      "not_in": "no en",
      "not_in_all": "no en todos",
      "not_in_any": "no en cualquier",
      "not_null": "no es nula",
      "not_start": "no inicia con",
      "not_start_all": "no inicia con toda",
      "not_start_any": "no comienza con cualquier",
      "null": "es nula",
      "present": "es presente",
      "start": "comienza con",
      "start_all": "comienza con toda",
      "start_any": "comienza con cualquier",
      "true": "es verdadero"
    },
    "search": "buscar",
    "sort": "ordernar",
    "value": "valor"
  },
  "reports": {
    "modules": {
      "common": {
        "almost_always": "(es) Almost Always",
        "less_typical": "(es) Less Typical",
        "moderate": "(es) Moderate",
        "more_typical": "(es) More Typical",
        "rare": "(es) Rare"
      },
      "cpi_occupations": {
        "occupations": "(es) Occupations",
        "your_potential_suitability": "(es) Your Potential Suitability"
      },
      "gap_assessment": {
        "gap": "(es) Gap",
        "item": "(es) Item",
        "negative_gap": "(es) Negative Gap",
        "positive_gap": "(es) Positive Gap",
        "rank": "(es) Rank",
        "scoring_category": "(es) Scoring Category"
      },
      "highest_lowest": {
        "bottom_5": "BOTTOM 5",
        "email": "(es) Email",
        "first_name": "(es) First Name",
        "highest_scores": "(es) Highest Scores",
        "item": "(es) Item",
        "last_name": "(es) Last Name",
        "lowest_scores": "(es) Lowest Scores",
        "mean_score": "(es) Mean Score",
        "rank": "(es) Rank",
        "score": "(es) Score",
        "sub_competenties": "(es) Sub-Competencies",
        "top_5": "TOP 5"
      },
      "potential_career_full": {
        "bachelors_or_masters_qualification": "(es) Bachelors or Masters Qualification",
        "detailed_career_guide": "(es) Detailed Career Guide",
        "diploma_qualification": "(es) Diploma Qualification",
        "education_level": "(es) Education Level",
        "high_school_entry_roles": "(es) High School Entry Roles",
        "key_career_tracks_within": "(es) Key Career Tracks Within",
        "potential_areas_of_study": "(es) Potential Areas of Study",
        "potential_roles": "(es) Potential Roles"
      },
      "potential_career_short": {
        "career": "(es) career",
        "for_this": "(es) for this",
        "key": "(es) key",
        "strengths": "(es) strengths",
        "your_scores": "(es) Your Scores"
      }
    },
    "show": {
      "export_pdf": "Export to PDF",
      "header": "Report"
    }
  },
  "simple_form": {
    "error_notification": {
      "default_message": "Please review the problems below:"
    },
    "no": "No",
    "placeholders": {
      "administrator": {
        "active": "Active",
        "created_at": "Created Date",
        "current_password": "Current password",
        "disabled": "Disable",
        "email": "Email Address",
        "first_name": "First Name",
        "id": "ID",
        "last_name": "Last Name",
        "manage_client_ids": "Memberships",
        "memberships": "Memberships",
        "password": "Password",
        "password_confirmation": "Password confirmation",
        "role": "Role",
        "roles": {
          "admin": "Client Admin",
          "manager": "Manager",
          "member": "User",
          "super_admin": "Super Admin",
          "superadmin": "Super Admin"
        },
        "types": {
          "anonymous": "Anonymous Users",
          "identified": "Identified Users"
        },
        "updated_at": "Modified Date"
      },
      "assessment": {
        "active": "Active",
        "categories": {
          "360": "360 Feedback",
          "organisational": "Org Surveys",
          "psychometric": "Psychometrics"
        },
        "category": "Category",
        "completed_at": "Completion Date",
        "created_at": "Created Date",
        "description": "Description",
        "id": "ID",
        "name": "Name",
        "statuses": {
          "completed": "Completed",
          "in_progress": "In Progress",
          "not_started": "New"
        },
        "timing": "Timing",
        "updated_at": "Modified Date"
      },
      "block": {
        "active": "Active",
        "assign_to_assessment_ids": "Assessments",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "client": {
        "category": "Category",
        "created_at": "Created Date",
        "id": "ID",
        "licenses": "License number",
        "licenses_expire": "License expire",
        "licenses_used": "Used license number",
        "logo": "Client logo",
        "name": "Name",
        "subdomain": "Subdomain",
        "updated_at": "Modified Date"
      },
      "dimension": {
        "active": "Active",
        "created_at": "Created Date",
        "factors_count": "No. of Factors",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "factor": {
        "active": "Active",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "parent_id": "Parent",
        "questions_count": "No. Questions",
        "subfactors_count": "No. Sub-Factors",
        "updated_at": "Modified Date"
      },
      "memebrship": {
        "id": "ID",
        "parent": "Direct Manager"
      },
      "norm": {
        "active": "Active",
        "bachelors_or_masters_qualification": "Bachelors or Masters Qualification",
        "created_at": "Created Date",
        "description": "Description",
        "diploma_qualification": "Diploma Qualification",
        "full_description": "Full Description",
        "high_school_entry_roles": "High School Entry Roles",
        "id": "ID",
        "key_career_tracks": "Key Career Tracks",
        "name": "Name",
        "potential_areas_of_study": "Potential Areas of Study",
        "updated_at": "Modified Date",
        "updated_by": "Edited by"
      },
      "question": {
        "active": "Active",
        "assign_to_assessment_ids": "Assessments",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "user": {
        "active": "Active",
        "created_at": "Created Date",
        "current_password": "Current password",
        "disabled": "Disable",
        "email": "Email Address",
        "first_name": "First Name",
        "id": "ID",
        "last_name": "Last Name",
        "manage_client_ids": "Memberships",
        "memberships": "Memberships",
        "password": "Password",
        "password_confirmation": "Password confirmation",
        "role": "Role",
        "roles": {
          "admin": "Client Admin",
          "manager": "Manager",
          "member": "User",
          "super_admin": "Super Admin",
          "superadmin": "Super Admin"
        },
        "types": {
          "anonymous": "Anonymous Users",
          "identified": "Identified Users"
        },
        "updated_at": "Modified Date"
      }
    },
    "required": {
      "mark": "*",
      "text": "required"
    },
    "yes": "Yes"
  },
  "support": {
    "array": {
      "last_word_connector": ", and ",
      "two_words_connector": " and ",
      "words_connector": ", "
    }
  },
  "time": {
    "am": "am",
    "formats": {
      "date": "%d/%m/%y",
      "default": "%a, %d %b %Y %H:%M:%S %z",
      "devise": {
        "mailer": {
          "invitation_instructions": {
            "accept_until_format": "%B %d, %Y %I:%M %p"
          }
        }
      },
      "long": "%B %d, %Y %H:%M",
      "short": "%d %b %Y / %H:%M"
    },
    "pm": "pm"
  },
  "validations": {
    "character_range": "(es) Your response must be at least %{min} and no more than %{max} characters.",
    "date": "Your response must be a valid date (dd/mm/yyyy)",
    "each_group_contains": "Each group needs to contain not less than %{min} and not more than %{max} items",
    "email": "Your response must be a valid email",
    "issue": "(es) Issue",
    "least": "Please answer at least %{min} choice(s).",
    "least_hotspot": "Please answer at least %{min} choice(s).",
    "max_length": "Your response must be no more than %{max} characters.",
    "min_length": "(es) Your response must be at least %{min} characters.",
    "must_rank_between": "Please assign a value from %{min} to %{max} for each item. Values may not be repeated.",
    "must_select": "Please select from %{min} to %{max} choices",
    "number": "Your response must be a number",
    "range": "Please answer at least %{min} and no more than %{max} choice(s).",
    "text": "Your response must not contain a numbers",
    "title": "(es) Sorry, you cannot continue until you correct the following:"
  },
  "views": {
    "pagination": {
      "first": "&laquo; First",
      "last": "Last &raquo;",
      "next": "Next &rsaquo;",
      "previous": "&lsaquo; Prev",
      "truncate": "&hellip;"
    }
  },
  "yes": "Yes"
});
I18n.translations["fr"] = I18n.extend((I18n.translations["fr"] || {}), {
  "activerecord": {
    "attributes": {
      "assessment": {
        "active": "Active",
        "categories": {
          "360": "360 Feedback",
          "organisational": "Org Surveys",
          "psychometric": "Psychometrics"
        },
        "category": "Category",
        "created_at": "Created Date",
        "description": "Description",
        "id": "ID",
        "name": "Name",
        "timing": "Timing",
        "updated_at": "Modified Date"
      },
      "assign": {
        "completed_at": "Completion Date",
        "statuses": {
          "completed": "Completed",
          "in_progress": "In Progress",
          "not_started": "New"
        }
      },
      "block": {
        "active": "Active",
        "assign_to_assessment_ids": "Assessments",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "client": {
        "category": "Category",
        "created_at": "Created Date",
        "id": "ID",
        "licenses": "License number",
        "licenses_expire": "License expire",
        "licenses_used": "Used license number",
        "logo": "Client logo",
        "name": "Name",
        "subdomain": "Subdomain",
        "updated_at": "Modified Date"
      },
      "dimension": {
        "active": "Active",
        "created_at": "Created Date",
        "factors_count": "No. of Factors",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "factor": {
        "active": "Active",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "parent_id": "Parent",
        "questions_count": "No. Questions",
        "subfactors_count": "No. Sub-Factors",
        "updated_at": "Modified Date"
      },
      "membership": {
        "parent_id": "Direct Manager"
      },
      "memebrship": {
        "id": "ID",
        "parent": "Direct Manager"
      },
      "norm": {
        "active": "Active",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date",
        "updated_by": "Edited by"
      },
      "occupation": {
        "active": "Active",
        "bachelors_or_masters_qualification": "Bachelors or Masters Qualification",
        "created_at": "Created Date",
        "description": "Description",
        "diploma_qualification": "Diploma Qualification",
        "full_description": "Full Description",
        "high_school_entry_roles": "High School Entry Roles",
        "id": "ID",
        "key_career_tracks": "Key Career Tracks",
        "name": "Name",
        "potential_areas_of_study": "Potential Areas of Study",
        "updated_at": "Modified Date"
      },
      "occupations_factor": {
        "active": "Active",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "question": {
        "active": "Active",
        "assign_to_assessment_ids": "Assessments",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "user": {
        "active": "Active",
        "created_at": "Created Date",
        "current_password": "Mot de passe actuel",
        "disabled": "Disable",
        "email": "Courriel",
        "first_name": "First Name",
        "id": "ID",
        "last_name": "Last Name",
        "manage_client_ids": "Memberships",
        "memberships": "Memberships",
        "password": "Mot de passe",
        "password_confirmation": "Confirmation du mot de passe",
        "remember_me": "Se souvenir de moi",
        "reset_password_token": "Reset password token",
        "role": "Role",
        "roles": {
          "admin": "Client Admin",
          "manager": "Manager",
          "member": "User",
          "super_admin": "Super Admin",
          "superadmin": "Super Admin"
        },
        "types": {
          "anonymous": "Anonymous Users",
          "identified": "Identified Users"
        },
        "unlock_token": "Unlock token",
        "updated_at": "Modified Date"
      }
    },
    "errors": {
      "messages": {
        "not_uniqueness": "Assign has already been taken",
        "record_invalid": "Validation failed: %{errors}",
        "restrict_dependent_destroy": {
          "has_many": "Cannot delete record because dependent %{record} exist",
          "has_one": "Cannot delete record because a dependent %{record} exists"
        }
      },
      "models": {
        "factors_norm": {
          "score_from_must_be_number": "Score from must be number",
          "score_to_less_than_score_from": "Score to is less than Score from",
          "score_to_must_be_number": "Score to must be number"
        }
      }
    },
    "models": {
      "assessment": "Assessments",
      "assign": "Assigns",
      "block": "Block",
      "client": "Clients",
      "dimension": "Dimensions",
      "factor": "Factors",
      "factors_norm": "factors_norms",
      "membership": "Memebrship",
      "memebrship": "Memebrship",
      "norm": "Norms",
      "occupation": "Occupations",
      "occupations_factor": "Occupations",
      "question": "Question",
      "user": "Utilisateur"
    }
  },
  "administration": {
    "actions": "Actions",
    "active": "Active",
    "administrator": {
      "passwords": {
        "edit": {
          "submit": "Set new password",
          "title": "Change your password"
        },
        "new": {
          "back": "Return back",
          "submit": "Send me instructions",
          "title": "Forgot your password?"
        }
      },
      "sessions": {
        "new": {
          "forgot_password": "Forgot your password?",
          "submit": "Login",
          "title": "<strong>Welcome</strong>, Please login"
        }
      },
      "shared": {
        "links": {
          "about": "About",
          "app_name": "© 2016 AppName",
          "contact_us": "Contact Us",
          "privacy": "Privacy"
        }
      }
    },
    "any": " - Any - ",
    "assessments": {
      "assigns": {
        "default": {
          "filter": "Filter",
          "filter_form": "Filter form",
          "next": "Next",
          "previous": "Previous",
          "title": "Assign %{name} Assessment"
        },
        "finish": {
          "show": {
            "filter": "Filter",
            "filter_form": "Filter form",
            "next": "Next",
            "previous": "Previous",
            "title": "Assign %{name} Assessment"
          }
        },
        "step1": {
          "show": {
            "filter": "Filter",
            "filter_form": "Filter form",
            "next": "Next",
            "previous": "Previous",
            "title": "Assign %{name} Assessment"
          }
        },
        "step2": {
          "show": {
            "filter": "Filter",
            "filter_form": "Filter form",
            "next": "Next",
            "not_selected_users": "Not Selected Users",
            "previous": "Previous",
            "selected_users": "Selected Users",
            "title": "Assign %{name} Assessment"
          },
          "users": {
            "filter": "Filter",
            "filter_form": "Filter form",
            "next": "Next",
            "previous": "Previous",
            "title": "Assign %{name} Assessment"
          }
        }
      },
      "copy": {
        "error": "Assessment #%{name} was not copied.",
        "successfully": "Assessment %{name} was successfully copied."
      },
      "create": {
        "successfully": "Assessment %{name} was successfully created."
      },
      "dashboard": "Assessment Dashboard",
      "destroy": {
        "successfully": "Assessment %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit assessment"
      },
      "form": {
        "categories": {
          "360": "360 Feedback",
          "all": "All Categories",
          "organisational": "Org Surveys",
          "psychometric": "Psychometrics"
        },
        "timing": {
          "hint": "For Example: 30 minutes to complete"
        }
      },
      "index": {
        "filterrific": {
          "with_category": {
            "360": "360 Feedback",
            "all": "All Categories",
            "organisational": "Org Surveys",
            "psychometric": "Psychometrics"
          }
        },
        "title": "Assessments",
        "tooltips": {
          "create": "Create"
        }
      },
      "new": {
        "header": "New assessment"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Assessment?</p>\n",
            "title": "Delete <strong>Assessment</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Assessment?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Assessment",
          "delete": "Delete Assessment",
          "edit": "Edit Assessment"
        }
      },
      "sidebar": {
        "assign": "Assign Assessment",
        "copy": "Copy Assessment",
        "destroy": "Delete Assessment",
        "disable": "Disable",
        "edit": "Edit Assessment",
        "enable": "Enable",
        "new": "New Assessment",
        "preview": "Preview Assessment",
        "title": "Assessment's options (#%{id})"
      },
      "toggle_status": {
        "successfully": "Assessment %{name} was successfully updated."
      },
      "update": {
        "successfully": "Assessment %{name} was successfully updated."
      }
    },
    "assigns": {
      "create": {
        "successfully": "New assign to assessment was successfully created"
      },
      "destroy": {
        "successfully": "Assign to assessment was successfully destroy"
      },
      "index": {
        "title": "Reports"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this assign?</p>",
            "title": "Delete <strong>%{name}</strong> ?"
          }
        }
      }
    },
    "back": "Back",
    "base": {
      "top_sidebar": {
        "search": "Search...",
        "sign_out_message": {
          "body": "<p>Are you sure you want to log out?</p> <p>Press No if you want to continue work. Press Yes to logout current user.</p>",
          "title": "Log <strong>Out</strong> ?"
        }
      }
    },
    "blocks": {
      "destroy": {
        "successfully": "Block %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit Block"
      },
      "new": {
        "header": "New Block"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Block?</p>\n",
            "title": "Delete <strong>Block</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Block?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        }
      }
    },
    "breadcrumbs": {
      "assessments": "Assessments",
      "client": "Client Tenancy",
      "clients": "Client Tenancies",
      "communication_center": "Communication Center",
      "create": "Create",
      "design": "Design",
      "dimension": "Dimension",
      "dimensions": "Dimensions",
      "factors": "Factors",
      "home": "Dashboard",
      "libraries": "Media Library",
      "norm": "Norm",
      "norms": "Norms",
      "norms_editor": "Norm Editor",
      "occupations": "Occupations",
      "occupations_factors": "Factors",
      "psychometrics": "Psychometrics",
      "question_center": "Question Center",
      "reports": "Reports",
      "statistics": "Statistics",
      "sub_factors": "Sub-Factors",
      "survey": "Survey",
      "surveys": "Surveys",
      "users": "Users",
      "users_add": "Add New",
      "users_import": "Import"
    },
    "cable": {
      "notification": {
        "assessment_factors": "Factors are fetched",
        "assessment_update": "Assessment is updated",
        "block_clone": "Block is copied",
        "block_create": "Block %{name} is created",
        "block_create_by_template": "Block was loaded from template",
        "block_destroy": "Block has been deleted",
        "block_move_down": "Block %{name} is moved down",
        "block_move_up": "Block %{name} is moved up",
        "block_permanent_destroy": "Block is permanent destroyed",
        "block_rename": "Block is renamed",
        "block_restore": "Block is restored",
        "block_save_as_template": "Block saved as template",
        "block_unlink_template": "Block was unlinked",
        "block_update": "Block is updated",
        "comment_create": "Comment is created",
        "comment_destroy": "Comment has been deleted",
        "geo_filter": "Data filtered",
        "module_create": "Module %{name} is created",
        "module_destroy": "Module has been deleted",
        "module_insert_after": "Module is inserted after",
        "module_insert_before": "Module is inserted before",
        "module_move_down": "Module is moved down",
        "module_move_up": "Module is moved up",
        "module_rename": "Module is renamed",
        "module_update": "Module is updated",
        "page_create": "Page %{name} is created",
        "page_destroy": "Page has been deleted",
        "page_move_down": "Page %{name} is moved down",
        "page_move_up": "Page %{name} is moved up",
        "page_rename": "Page is renamed",
        "page_update": "Page is updated",
        "question_clone": "Question is copied",
        "question_create": "Question %{name} is created",
        "question_create_by_template": "Question was loaded from template",
        "question_create_from_template": "Question is created from template",
        "question_destroy": "Question has been deleted",
        "question_insert_after": "Question is inserted after",
        "question_insert_before": "Question is inserted before",
        "question_move_down": "Question is moved down",
        "question_move_up": "Question is moved up",
        "question_permanent_destroy": "Question is permanent destroyed",
        "question_rename": "Question is renamed",
        "question_restore": "Question is restored",
        "question_save_as_template": "Question saved as template",
        "question_unlink_template": "Question was unlinked",
        "question_update": "Question is updated",
        "report_change_filters": "Filters are updated",
        "report_update": "Report is updated",
        "scoring_update": "Scoring is updated",
        "trash_empty": "Trash Comment empty"
      }
    },
    "choose": " - Choose - ",
    "clear": "Clear",
    "clients": {
      "assessments": {
        "assigns": {
          "default": {
            "filter": "Filter",
            "filter_form": "Filter form",
            "next": "Next",
            "previous": "Previous",
            "title": "Assign %{name} Assessment"
          },
          "finish": {
            "show": {
              "filter": "Filter",
              "filter_form": "Filter form",
              "next": "Next",
              "previous": "Previous",
              "title": "Assign %{name} Assessment"
            }
          },
          "step1": {
            "show": {
              "filter": "Filter",
              "filter_form": "Filter form",
              "next": "Next",
              "previous": "Previous",
              "title": "Assign %{name} Assessment"
            }
          },
          "step2": {
            "show": {
              "filter": "Filter",
              "filter_form": "Filter form",
              "next": "Next",
              "not_selected_users": "Not Selected Users",
              "previous": "Previous",
              "selected_users": "Selected Users",
              "title": "Assign %{name} Assessment"
            },
            "users": {
              "filter": "Filter",
              "filter_form": "Filter form",
              "next": "Next",
              "previous": "Previous",
              "title": "Assign %{name} Assessment"
            }
          }
        },
        "copy": {
          "error": "Assessment #%{name} was not copied.",
          "successfully": "Assessment %{name} was successfully copied."
        },
        "create": {
          "successfully": "Assessment %{name} was successfully created."
        },
        "dashboard": "Assessment Dashboard",
        "destroy": {
          "successfully": "Assessment %{name} was successfully destroyed."
        },
        "edit": {
          "header": "Edit assessment"
        },
        "form": {
          "categories": {
            "360": "360 Feedback",
            "all": "All Categories",
            "organisational": "Org Surveys",
            "psychometric": "Psychometrics"
          },
          "timing": {
            "hint": "For Example: 30 minutes to complete"
          }
        },
        "index": {
          "filterrific": {
            "with_category": {
              "360": "360 Feedback",
              "all": "All Categories",
              "organisational": "Org Surveys",
              "psychometric": "Psychometrics"
            }
          },
          "title": "Assessments",
          "tooltips": {
            "create": "Create"
          }
        },
        "new": {
          "header": "New assessment"
        },
        "resource": {
          "confirmations": {
            "delete": {
              "body": "<p>Are you sure you want to delete this Assessment?</p>\n",
              "title": "Delete <strong>Assessment</strong> ?"
            },
            "toggle_status": {
              "body": "<p>Are you sure you want to %{status} this Assessment?</p>\n",
              "title": "<strong>%{status}</strong> %{name}?"
            }
          },
          "tooltips": {
            "copy": "Copy Assessment",
            "delete": "Delete Assessment",
            "edit": "Edit Assessment"
          }
        },
        "sidebar": {
          "assign": "Assign Assessment",
          "copy": "Copy Assessment",
          "destroy": "Delete Assessment",
          "disable": "Disable",
          "edit": "Edit Assessment",
          "enable": "Enable",
          "new": "New Assessment",
          "preview": "Preview Assessment",
          "title": "Assessment's options (#%{id})"
        },
        "toggle_status": {
          "successfully": "Assessment %{name} was successfully updated."
        },
        "update": {
          "successfully": "Assessment %{name} was successfully updated."
        }
      },
      "copy": {
        "error": "Client #%{name} was not copied.",
        "successfully": "Client %{name} was successfully copied."
      },
      "create": {
        "successfully": "Client %{name} was successfully created."
      },
      "designs": {
        "form": {
          "no_background": "No Background yet",
          "no_logo": "No Logo yet"
        }
      },
      "destroy": {
        "successfully": "Client %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit client"
      },
      "index": {
        "title": "Client Tenancies",
        "tooltips": {
          "create": "Create"
        }
      },
      "license": {
        "header": "%{name} - Edit license"
      },
      "new": {
        "header": "New client"
      },
      "reports": {
        "copy": {
          "error": "Report #%{id} was not copied."
        },
        "destroy": {
          "successfully": "Report %{name} was successfully destroyed."
        },
        "edit": {
          "header": "Edit Report Name"
        },
        "index": {
          "filterrific": {
            "with_assessment_category": {
              "360": "360 Feedback",
              "all": "All",
              "organisational": "Org Surveys",
              "psychometric": "Psychometrics"
            }
          },
          "title": "Reports",
          "tooltips": {
            "create": "Create"
          }
        },
        "new": {
          "header": "New Report"
        },
        "preview": {
          "export_pdf": "Export to PDF",
          "title": "Preview"
        },
        "resource": {
          "confirmations": {
            "delete": {
              "body": "<p>Are you sure you want to delete this Report?</p>\n",
              "title": "Delete <strong>Report</strong> ?"
            },
            "toggle_status": {
              "body": "<p>Are you sure you want to %{status} this Report?</p>\n",
              "title": "<strong>%{status}</strong> %{name}?"
            }
          },
          "tooltips": {
            "copy": "Copy Report",
            "delete": "Delete Report",
            "edit": "Edit Report",
            "preview": "Preview Report"
          }
        },
        "sidebar": {
          "copy": "Copy Report",
          "destroy": "Delete Report",
          "edit": "Edit Report",
          "title": "Report's options (#%{id})",
          "view": "View Report"
        },
        "toggle_status": {
          "successfully": "Report was successfully updated."
        }
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this client?</p>",
            "title": "Delete <strong>%{name}</strong> ?"
          },
          "disable": {
            "body": "<p>Are you sure you want to disable this client?</p>",
            "title": "Disable <strong>%{name}</strong> ?"
          },
          "enable": {
            "body": "<p>Are you sure you want to enable this client?</p>",
            "title": "Enable <strong>%{name}</strong> ?"
          }
        },
        "tooltips": {
          "copy": "Copy Client",
          "delete": "Delete Client",
          "edit": "Edit Client"
        }
      },
      "sidebar": {
        "copy": "Copy Client",
        "design": "Edit Design",
        "destroy": "Destroy Client",
        "disable": "Disable",
        "edit": "Edit Client",
        "enable": "Enable",
        "licenses": "Edit Licenses",
        "new": "New Client",
        "title": "Client's options (#%{id})"
      },
      "statistics": {
        "index": {
          "all_assessments": "All assessments",
          "assessment_type": "Assessment type",
          "title": "Statistics"
        }
      },
      "toggle_status": {
        "successfully": "Client %{name} was successfully updated."
      },
      "update": {
        "successfully": "Client %{name} was successfully updated."
      },
      "users": {
        "assigns": {
          "index": {
            "add": "Assign New Assessment",
            "title": "Assessments and Reporting"
          },
          "list": {
            "actions": "Actions",
            "assessment_name": "Assessment Name",
            "assessment_type": "Assessment Type",
            "reports": "Reports",
            "status": "Completion Status",
            "uniq_id": "Uniq ID"
          },
          "resource": {
            "no_access_to_reports": "No access to reports",
            "no_completed": "Not completed",
            "no_reports": "No relative reports",
            "tooltips": {
              "delete": "Delete Assign"
            }
          }
        },
        "create": {
          "successfully": "User %{name} was successfully created."
        },
        "destroy": {
          "successfully": "User %{name} was successfully destroyed."
        },
        "edit": {
          "add": "Add",
          "hris_data": "HRIS Data",
          "key": "Key",
          "personal_data": "Personal Data",
          "remove": "Remove",
          "title": "Edit user",
          "value": "Value"
        },
        "form": {
          "choose": " - Choose - "
        },
        "index": {
          "add": "Add new user",
          "export": "Export",
          "filterrific": {
            "with_role": {
              "administration": "Administrators",
              "all": "All",
              "users": "Users"
            }
          },
          "import": "Import",
          "import_hris": "HRIS Data",
          "import_users": "Users",
          "title": "Users",
          "tooltips": {
            "create": "Create",
            "export": "Export",
            "import": "Import"
          }
        },
        "new": {
          "header": "New user"
        },
        "reports": {
          "copy": {
            "error": "Report #%{id} was not copied."
          },
          "destroy": {
            "successfully": "Report %{name} was successfully destroyed."
          },
          "edit": {
            "header": "Edit Report Name"
          },
          "index": {
            "filterrific": {
              "with_assessment_category": {
                "360": "360 Feedback",
                "all": "All",
                "organisational": "Org Surveys",
                "psychometric": "Psychometrics"
              }
            },
            "title": "Reports",
            "tooltips": {
              "create": "Create"
            }
          },
          "new": {
            "header": "New Report"
          },
          "preview": {
            "export_pdf": "Export to PDF",
            "title": "Preview"
          },
          "resource": {
            "confirmations": {
              "delete": {
                "body": "<p>Are you sure you want to delete this Report?</p>\n",
                "title": "Delete <strong>Report</strong> ?"
              },
              "toggle_status": {
                "body": "<p>Are you sure you want to %{status} this Report?</p>\n",
                "title": "<strong>%{status}</strong> %{name}?"
              }
            },
            "tooltips": {
              "copy": "Copy Report",
              "delete": "Delete Report",
              "edit": "Edit Report",
              "preview": "Preview Report"
            }
          },
          "sidebar": {
            "copy": "Copy Report",
            "destroy": "Delete Report",
            "edit": "Edit Report",
            "title": "Report's options (#%{id})",
            "view": "View Report"
          },
          "toggle_status": {
            "successfully": "Report was successfully updated."
          }
        },
        "reset_password": {
          "successfully": "User  %{name} will receive an email with instructions on how to reset his (her) password in a few minutes."
        },
        "resource": {
          "confirmations": {
            "change_password": {
              "body": "<p>Are you sure you want to send instructions with link to change password?</p>\n",
              "title": "Change password <strong>%{name}</strong> ?"
            },
            "delete": {
              "body": "<p>Are you sure you want to delete this User?</p>\n",
              "title": "Delete <strong>%{name}</strong> ?"
            },
            "membership": {
              "delete": {
                "body": "<p>Are you sure you want to delete?</p>\n",
                "title": "Delete <strong>%{name}</strong> from %{client_name} Client Tenancy?"
              }
            },
            "toggle_status": {
              "body": "<p>Are you sure you want to %{status} this User?</p>\n",
              "title": "<strong>%{status}</strong> %{name}?"
            }
          },
          "tooltips": {
            "change_password": "Change password",
            "chart": "View user report",
            "delete": "Delete user",
            "edit": "Edit user",
            "mail": "Send mail",
            "sign_in": "Login as user"
          }
        },
        "sidebar": {
          "assessments_and_reports": "Assessments and Reporting",
          "destroy": "Delete User",
          "disable": "Disable",
          "edit_user": "Edit User",
          "email": "Send mail",
          "enable": "Enable",
          "export_users": "Export users",
          "import_users": "Import users",
          "login_as_user": "Login as User",
          "new_user": "New User",
          "reset_password": "Change Password",
          "title": "User's options (#%{id})"
        },
        "spoof": {
          "successfully": "You was successfully login as %{name}"
        },
        "toggle_status": {
          "successfully": "User %{name} was successfully updated."
        },
        "update": {
          "successfully": "User %{name} was successfully updated."
        }
      }
    },
    "close": "Close",
    "communications": {
      "copy": {
        "error": "Communication #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Communication %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit Communication"
      },
      "form": {
        "body_mustache": "{{first_name}} - Recipient First Name\n{{last_name}} - Recipient Last Name\n{{email}} - Recipient Email\n",
        "delivery_rules": {
          "after_complete": "Right after completion",
          "if_not_finished": "If assessment was not finished",
          "if_not_started": "If assessment is not started",
          "on_specific_datetime": "Specific date and time"
        },
        "selected_cc_recipients": "Selected CC Recipients",
        "selected_recipients": "Selected Recipients"
      },
      "index": {
        "add_new": "Add new",
        "title": "Communication Center",
        "tooltips": {
          "create": "Create"
        }
      },
      "new": {
        "header": "New Communication"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Communication?</p>\n",
            "title": "Delete <strong>Communication</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Communication?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Communication",
          "delete": "Delete Communication",
          "edit": "Edit Communication"
        }
      },
      "sidebar": {
        "copy": "Copy Communication",
        "destroy": "Delete Communication",
        "disable": "Disable Communication",
        "edit": "Edit Communication",
        "enable": "Enable Communication",
        "new": "New Communication",
        "title": "Communication's options (#%{id})",
        "view": "View Communication"
      },
      "toggle_status": {
        "successfully": "Communication was successfully updated."
      }
    },
    "copy": "Copy",
    "create": "Create",
    "dimensions": {
      "copy": {
        "error": "Dimension #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Dimension %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit Dimension Name"
      },
      "index": {
        "title": "Dimensions",
        "tooltips": {
          "create": "Create"
        }
      },
      "new": {
        "header": "New Dimension"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Dimension?</p>\n",
            "title": "Delete <strong>Dimension</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Dimension?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Dimension",
          "delete": "Delete Dimension",
          "edit": "Edit Dimension Name"
        }
      },
      "sidebar": {
        "assign": "Assign Dimension",
        "copy": "Copy Dimension",
        "destroy": "Delete Dimension",
        "disable": "Disable Dimension",
        "edit": "Edit Dimension Name",
        "enable": "Enable Dimension",
        "new": "New Dimension",
        "title": "Dimension's options (#%{id})",
        "view": "View Dimension"
      },
      "toggle_status": {
        "successfully": "Dimension was successfully updated."
      }
    },
    "disable": "Disable",
    "edit": "Edit",
    "enable": "Enable",
    "factors": {
      "copy": {
        "error": "Factor #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Factor %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit Factor Name"
      },
      "form": {
        "no_icon": "No Logo yet"
      },
      "index": {
        "icon": "Icon",
        "title": "Factors",
        "tooltips": {
          "create": "Create"
        }
      },
      "new": {
        "header": "New Factor"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Factor?</p>\n",
            "title": "Delete <strong>Factor</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Factor?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Factor",
          "delete": "Delete Factor",
          "edit": "Edit Factor Name"
        }
      },
      "sidebar": {
        "copy": "Copy Factor",
        "destroy": "Delete Factor",
        "edit": "Edit Factor Name",
        "title": "Factor's options (#%{id})",
        "view": "View Factor"
      },
      "toggle_status": {
        "successfully": "Factor was successfully updated."
      }
    },
    "genders": {
      "female": "Female",
      "male": "Male",
      "not_set": "Not set"
    },
    "home": {
      "index": {
        "notifications": "Notifications"
      }
    },
    "import": "Import",
    "imports": {
      "assessments": {
        "results": {
          "form": {
            "import": "Import"
          }
        }
      },
      "base": {
        "form": {
          "import": "Import"
        }
      },
      "errors": {
        "error": "[Row %{row}] %{error}",
        "invalid_assign": "Can't to find record for specified Result ID. If you want to create new result, please, leave Result ID column empty",
        "invalid_format": "There is no Email column",
        "norm": {
          "factor_is_not_described": "[#%{coords}] factor %{factor} is not described above",
          "factors_mismatch": "[#%{coords}] dimension %{dimension} does not have factor %{factor}",
          "not_set_dimension": "The name of the Dimension should be written in A-1",
          "sub_factors_mismatch": "[#%{coords}] dimension %{dimension} does not have sub factor %{factor}"
        },
        "result": {
          "error": "[Row %{row}] %{error}",
          "invalid_assign": "[Row %{row}] Can't to find record for specified Result ID. If you want to create new result, please, leave Result ID column empty",
          "invalid_format": "Invalid File format"
        },
        "translation": {
          "error": "[Translation %{id}] %{error}",
          "invalid_format": "Invalid File format"
        },
        "unknown_type": "Unknown file type: %{filename}",
        "user": {
          "not_found": "[Row %{row}] Couldn't find User with Email Address %{email}"
        }
      },
      "form": {
        "import": "Import"
      },
      "hris": {
        "form": {
          "import": "Import"
        }
      },
      "new": {
        "header": "Import"
      },
      "users": {
        "form": {
          "import": "Import"
        }
      }
    },
    "imports_assessments_result_imports": {
      "create": {
        "successfully": "Raw Results data was successfully imported"
      },
      "new": {
        "header": "Import Raw Results data"
      }
    },
    "imports_hris_imports": {
      "create": {
        "successfully": "HRIS data was successfully imported"
      },
      "new": {
        "header": "Import HRIS data"
      }
    },
    "imports_user_imports": {
      "create": {
        "successfully": "Users was successfully imported"
      },
      "new": {
        "header": "Import Users"
      }
    },
    "libraries": {
      "create": {
        "successfully": "Item %{name} was successfully created."
      },
      "destroy": {
        "successfully": "Item %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit"
      },
      "index": {
        "title": "Media Library"
      },
      "list": {
        "new_folder": "New folder",
        "root": "Media Library",
        "upload": "Upload new file"
      },
      "new": {
        "header": "New Report"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete %{name}?</p>\n",
            "title": "Delete <strong>%{name}</strong> ?"
          }
        },
        "tooltips": {
          "delete": "Delete",
          "edit": "Edit"
        }
      },
      "update": {
        "successfully": "Item %{name} was successfully updated."
      }
    },
    "memberships": {
      "create": {
        "successfully": "User %{name} was successfully created."
      },
      "destroy": {
        "successfully": "User %{name} was successfully destroyed."
      },
      "edit": {
        "add": "Add",
        "hris_data": "HRIS Data",
        "key": "Key",
        "personal_data": "Personal Data",
        "remove": "Remove",
        "title": "Edit user",
        "value": "Value"
      },
      "index": {
        "add": "Add new user",
        "export": "Export",
        "filterrific": {
          "with_role": {
            "administration": "Administrators",
            "all": "All",
            "users": "Users"
          }
        },
        "import": "Import",
        "import_hris": "HRIS Data",
        "import_users": "Users",
        "title": "Users",
        "tooltips": {
          "create": "Create",
          "export": "Export",
          "import": "Import"
        }
      },
      "new": {
        "header": "New user"
      },
      "reset_password": {
        "successfully": "User  %{name} will receive an email with instructions on how to reset his (her) password in a few minutes."
      },
      "spoof": {
        "successfully": "You was successfully login as %{name}"
      },
      "toggle_status": {
        "successfully": "User %{name} was successfully updated."
      },
      "update": {
        "successfully": "User %{name} was successfully updated."
      }
    },
    "meta_title": "Administration panel",
    "navigation": {
      "assessments": "Assessments",
      "client": "Client Tenancy",
      "clients": "Client Tenancies",
      "communication_center": "Communication Center",
      "create": "Create",
      "design": "Design",
      "dimension": "Dimension",
      "dimensions": "Dimensions",
      "factors": "Factors",
      "home": "Dashboard",
      "libraries": "Media Library",
      "norm": "Norm",
      "norms": "Norms",
      "norms_editor": "Norm Editor",
      "occupations": "Occupations",
      "occupations_factors": "Factors",
      "psychometrics": "Psychometrics",
      "question_center": "Question Center",
      "reports": "Reports",
      "statistics": "Statistics",
      "sub_factors": "Sub-Factors",
      "survey": "Survey",
      "surveys": "Surveys",
      "users": "Users",
      "users_add": "Add New",
      "users_import": "Import"
    },
    "new": "New",
    "no_data_found": "No data found",
    "norms": {
      "copy": {
        "error": "Norm #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Norm %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Rename Norm"
      },
      "editor": {
        "factors": "Factors",
        "inplace_title": "Enter value",
        "sub_factors": "Sub Factors",
        "title": "Norm Editor",
        "tooltips": {
          "edit": "Edit Title"
        }
      },
      "index": {
        "title": "Norms",
        "tooltips": {
          "create": "Create",
          "import": "Import"
        }
      },
      "new": {
        "header": "New norm"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Norm?</p>\n",
            "title": "Delete <strong>Norm</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Norm?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Norm",
          "delete": "Delete Norm",
          "edit": "Rename Norm"
        }
      },
      "sidebar": {
        "assign": "Assign Norm",
        "copy": "Copy Norm",
        "destroy": "Delete Norm",
        "disable": "Disable",
        "edit": "Rename Norm",
        "editor": "Norm Editor",
        "enable": "Enable",
        "export": "Export Norm",
        "import": "Import Norm",
        "new": "New Norm",
        "surveys": "Linked Surveys",
        "title": "Norm's options (#%{id})",
        "view": "View Norm"
      },
      "toggle_status": {
        "successfully": "Norm was successfully updated."
      }
    },
    "noty": {
      "error_500": "Something went wrong. Contact your administrator."
    },
    "occupations": {
      "copy": {
        "error": "Occupation #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Occupation #%{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit occupation"
      },
      "form": {
        "hint": {
          "key_career_tracks": "\"+\" - list, \"*\" - bold. Example: + *Biology* - some description..."
        }
      },
      "index": {
        "title": "Occupations",
        "tooltips": {
          "create": "Create"
        }
      },
      "new": {
        "header": "New occupation"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this occupation?</p>",
            "title": "Delete <strong>Occupation</strong> ?"
          }
        },
        "tooltips": {
          "copy": "Copy Occupation",
          "delete": "Delete Occupation",
          "edit": "Edit Occupation"
        }
      },
      "sidebar": {
        "copy": "Copy Occupation",
        "disable": "Disable",
        "edit": "Edit",
        "enable": "Enable",
        "new": "New Occupation",
        "title": "Occupation's options"
      },
      "toggle_status": {
        "successfully": "Occupation was successfully updated."
      }
    },
    "occupations_factors": {
      "copy": {
        "error": "Factor #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Factor #%{name} was successfully detached."
      },
      "edit": {
        "header": "Edit Factor"
      },
      "index": {
        "title": "Factors",
        "tooltips": {
          "create": "Create"
        }
      },
      "new": {
        "header": "Attach Factors"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this factor?</p>",
            "title": "Delete <strong>Factor</strong> ?"
          }
        },
        "tooltips": {
          "delete": "Delete Factor",
          "edit": "Edit Factor"
        }
      },
      "sidebar": {
        "disable": "Disable",
        "edit": "Edit",
        "enable": "Enable",
        "new": "Attach Factor",
        "title": "Factor's options"
      },
      "toggle_status": {
        "successfully": "Factor was successfully updated."
      }
    },
    "profiles": {
      "edit": {
        "success": "Profile was successfully updated.",
        "title": "Profile Editor"
      }
    },
    "psychometrics": "Psychometrics",
    "questions": {
      "destroy": {
        "successfully": "Question %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit Question"
      },
      "new": {
        "header": "New Question"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Question?</p>\n",
            "title": "Delete <strong>Question</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Question?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        }
      }
    },
    "reports": {
      "copy": {
        "error": "Report #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Report %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit Report Name"
      },
      "index": {
        "filterrific": {
          "with_assessment_category": {
            "360": "360 Feedback",
            "all": "All",
            "organisational": "Org Surveys",
            "psychometric": "Psychometrics"
          }
        },
        "title": "Reports",
        "tooltips": {
          "create": "Create"
        }
      },
      "new": {
        "header": "New Report"
      },
      "preview": {
        "export_pdf": "Export to PDF",
        "title": "Preview"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Report?</p>\n",
            "title": "Delete <strong>Report</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Report?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Report",
          "delete": "Delete Report",
          "edit": "Edit Report",
          "preview": "Preview Report"
        }
      },
      "sidebar": {
        "copy": "Copy Report",
        "destroy": "Delete Report",
        "edit": "Edit Report",
        "title": "Report's options (#%{id})",
        "view": "View Report"
      },
      "toggle_status": {
        "successfully": "Report was successfully updated."
      }
    },
    "search": "Search",
    "show": "Show",
    "sub_factors": {
      "copy": {
        "error": "Sub-Factor #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Sub-Factor %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit Sub-Factor Name"
      },
      "index": {
        "title": "Sub-Factors",
        "tooltips": {
          "create": "Create"
        }
      },
      "new": {
        "header": "New Sub-Factor"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Sub-Factor?</p>",
            "title": "Delete <strong>Sub-Factor</strong> ?"
          }
        },
        "tooltips": {
          "copy": "Copy Sub-Factor",
          "delete": "Delete Sub-Factor",
          "edit": "Edit Sub-Factor Name"
        }
      },
      "sidebar": {
        "destroy": "Delete Sub-Factor",
        "edit": "Edit Sub-Factor Name",
        "title": "Sub-Factor's options (#%{id})"
      },
      "toggle_status": {
        "successfully": "Sub-Factor was successfully updated."
      }
    },
    "templates": {
      "blocks": {
        "copy": {
          "error": "Block #%{name} was not copied."
        },
        "destroy": {
          "successfully": "Block %{name} was successfully destroyed."
        },
        "edit": {
          "header": "Edit Block"
        },
        "index": {
          "add": "Add New Block",
          "templates": {
          },
          "title": "Blocks",
          "tooltips": {
            "create": "Create"
          }
        },
        "new": {
          "header": "New Block"
        },
        "new_assign": {
          "header": "Assign Block to Assessments"
        },
        "resource": {
          "tooltips": {
            "copy": "Copy Block",
            "delete": "Delete Block",
            "edit": "Edit Block"
          }
        },
        "sidebar": {
          "destroy": "Delete Block",
          "disable": "Disable",
          "edit": "Edit Block",
          "enable": "Enable",
          "new": "New Block",
          "title": "Block's options (#%{id})"
        }
      },
      "questions": {
        "copy": {
          "error": "Question #%{name} was not copied."
        },
        "destroy": {
          "successfully": "Question %{name} was successfully destroyed."
        },
        "edit": {
          "header": "Edit Question"
        },
        "index": {
          "add": "Add New Question",
          "templates": {
            "blocks": "Blocks",
            "questions": "Questions"
          },
          "title": "Questions",
          "tooltips": {
            "create": "Create"
          }
        },
        "new": {
          "header": "New Question"
        },
        "new_assign": {
          "header": "Assign Question to Assessments"
        },
        "resource": {
          "tooltips": {
            "copy": "Copy Question",
            "delete": "Delete Question",
            "edit": "Edit Question"
          }
        },
        "sidebar": {
          "destroy": "Delete Question",
          "disable": "Disable",
          "edit": "Edit Question",
          "enable": "Enable",
          "new": "New Question",
          "title": "Question's options (#%{id})"
        }
      }
    },
    "translations": {
      "assessments": {
        "new": {
          "header": "Import Translations"
        }
      },
      "import": {
        "successfully": "Translations was successfully imported"
      }
    },
    "uniq_id": "Uniq ID",
    "update": "Update",
    "users": {
      "create": {
        "successfully": "User %{name} was successfully created."
      },
      "destroy": {
        "successfully": "User %{name} was successfully destroyed."
      },
      "edit": {
        "add": "Add",
        "hris_data": "HRIS Data",
        "key": "Key",
        "personal_data": "Personal Data",
        "remove": "Remove",
        "title": "Edit user",
        "value": "Value"
      },
      "form": {
        "choose": " - Choose - "
      },
      "index": {
        "add": "Add new user",
        "export": "Export",
        "filterrific": {
          "with_role": {
            "administration": "Administrators",
            "all": "All",
            "users": "Users"
          }
        },
        "import": "Import",
        "import_hris": "HRIS Data",
        "import_users": "Users",
        "title": "Users",
        "tooltips": {
          "create": "Create",
          "export": "Export",
          "import": "Import"
        }
      },
      "new": {
        "header": "New user"
      },
      "reset_password": {
        "successfully": "User  %{name} will receive an email with instructions on how to reset his (her) password in a few minutes."
      },
      "resource": {
        "confirmations": {
          "change_password": {
            "body": "<p>Are you sure you want to send instructions with link to change password?</p>\n",
            "title": "Change password <strong>%{name}</strong> ?"
          },
          "delete": {
            "body": "<p>Are you sure you want to delete this User?</p>\n",
            "title": "Delete <strong>%{name}</strong> ?"
          },
          "membership": {
            "delete": {
              "body": "<p>Are you sure you want to delete?</p>\n",
              "title": "Delete <strong>%{name}</strong> from %{client_name} Client Tenancy?"
            }
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this User?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "change_password": "Change password",
          "chart": "View user report",
          "delete": "Delete user",
          "edit": "Edit user",
          "mail": "Send mail",
          "sign_in": "Login as user"
        }
      },
      "sidebar": {
        "assessments_and_reports": "Assessments and Reporting",
        "destroy": "Delete User",
        "disable": "Disable",
        "edit_user": "Edit User",
        "email": "Send mail",
        "enable": "Enable",
        "export_users": "Export users",
        "import_users": "Import users",
        "login_as_user": "Login as User",
        "new_user": "New User",
        "reset_password": "Change Password",
        "title": "User's options (#%{id})"
      },
      "spoof": {
        "successfully": "You was successfully login as %{name}"
      },
      "toggle_status": {
        "successfully": "User %{name} was successfully updated."
      },
      "update": {
        "successfully": "User %{name} was successfully updated."
      }
    }
  },
  "assessments": {
    "decorator": {
      "no_description": "Description is empty"
    },
    "index": {
      "managers_dashboard_button": "Managers Dashboard",
      "user_dashboard_button": "User Dashboard"
    },
    "resource": {
      "assigned": "Assigned %{date}",
      "questions": {
        "one": "1 Question",
        "other": "%{count} Questions",
        "zero": "No Questions"
      },
      "results": "Results",
      "status": {
        "completed": "Completed",
        "in_progress": "Resume",
        "not_started": "Start"
      }
    }
  },
  "assigns": {
    "decorator": {
      "completed": "Completed %{date}",
      "not_completed": "Not Completed"
    },
    "notifications": {
      "completed": "%{user_name} finished assessment \"%{assessment_name}\"",
      "in_progress": "%{user_name} started to take assessment \"%{assessment_name}\""
    }
  },
  "ckeditor": {
    "buttons": {
      "cancel": "Annuler",
      "delete": "Supprimer",
      "next": "Next",
      "upload": "Ajouter"
    },
    "confirm_delete": "Supprimer le fichier ?",
    "page_title": "CKEditor - Gestionnaire de fichiers"
  },
  "clear_filter": "Clear Filter",
  "confirmation": {
    "default_body": "Are you sure?",
    "default_title": "Confirmation"
  },
  "date": {
    "abbr_day_names": [
      "Sun",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ],
    "abbr_month_names": [
      null,
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ],
    "day_names": [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ],
    "formats": {
      "default": "%Y-%m-%d",
      "long": "%B %d, %Y",
      "short": "%b %d"
    },
    "month_names": [
      null,
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ],
    "order": [
      "year",
      "month",
      "day"
    ]
  },
  "datetime": {
    "distance_in_words": {
      "about_x_hours": {
        "one": "about 1 hour",
        "other": "about %{count} hours"
      },
      "about_x_months": {
        "one": "about 1 month",
        "other": "about %{count} months"
      },
      "about_x_years": {
        "one": "about 1 year",
        "other": "about %{count} years"
      },
      "almost_x_years": {
        "one": "almost 1 year",
        "other": "almost %{count} years"
      },
      "half_a_minute": "half a minute",
      "less_than_x_minutes": {
        "one": "less than a minute",
        "other": "less than %{count} minutes"
      },
      "less_than_x_seconds": {
        "one": "less than 1 second",
        "other": "less than %{count} seconds"
      },
      "over_x_years": {
        "one": "over 1 year",
        "other": "over %{count} years"
      },
      "x_days": {
        "one": "1 day",
        "other": "%{count} days"
      },
      "x_minutes": {
        "one": "1 minute",
        "other": "%{count} minutes"
      },
      "x_months": {
        "one": "1 month",
        "other": "%{count} months"
      },
      "x_seconds": {
        "one": "1 second",
        "other": "%{count} seconds"
      }
    },
    "prompts": {
      "day": "Day",
      "hour": "Hour",
      "minute": "Minute",
      "month": "Month",
      "second": "Seconds",
      "year": "Year"
    }
  },
  "devise": {
    "administrators": {
      "meta_title": "Login to administration panel",
      "passwords": {
        "edit": {
          "submit": "Set new password",
          "title": "Change your password"
        },
        "new": {
          "back": "Return back",
          "submit": "Send me instructions",
          "title": "Forgot your password?"
        }
      },
      "sessions": {
        "new": {
          "forgot_password": "Forgot your password?",
          "submit": "Login",
          "title": "<strong>Welcome</strong>, Please login"
        }
      },
      "shared": {
        "links": {
          "about": "About",
          "app_name": "© 2016 AppName",
          "contact_us": "Contact Us",
          "privacy": "Privacy"
        }
      }
    },
    "confirmations": {
      "confirmed": "Votre compte a été confirmé avec succès.",
      "new": {
        "resend_confirmation_instructions": "Renvoyer les instructions de confirmation"
      },
      "send_instructions": "Vous allez recevoir sous quelques minutes un courriel comportant des instructions pour confirmer votre compte.",
      "send_paranoid_instructions": "Si votre courriel existe sur notre base de données, vous recevrez sous quelques minutes un message avec des instructions pour confirmer votre compte."
    },
    "failure": {
      "already_authenticated": "Vous êtes déjà connecté(e).",
      "inactive": "Votre compte n’est pas encore activé.",
      "invalid": "Courriel ou mot de passe incorrect.",
      "invited": "You have a pending invitation, accept it to finish creating your account.",
      "last_attempt": "Il vous reste une chance avant que votre compte soit bloqué.",
      "locked": "Votre compte est verrouillé.",
      "not_found_in_database": "Courriel ou mot de passe incorrect.",
      "timeout": "Votre session est expirée, veuillez vous reconnecter pour continuer.",
      "unauthenticated": "Vous devez vous connecter ou vous enregistrer pour continuer.",
      "unconfirmed": "Vous devez confirmer votre compte par courriel."
    },
    "invitations": {
      "edit": {
        "header": "Set your password",
        "submit_button": "Set my password"
      },
      "invitation_removed": "Your invitation was removed.",
      "invitation_token_invalid": "The invitation token provided is not valid!",
      "new": {
        "header": "Send invitation",
        "submit_button": "Send an invitation"
      },
      "no_invitations_remaining": "No invitations remaining",
      "send_instructions": "An invitation email has been sent to %{email}.",
      "updated": "Your password was set successfully. You are now signed in.",
      "updated_not_active": "Your password was set successfully."
    },
    "mailer": {
      "confirmation_instructions": {
        "action": "Confirmer mon courriel",
        "greeting": "Bienvenue %{recipient}!",
        "instruction": "Vous pouvez confirmer votre courriel grâce au lien ci-dessous:",
        "subject": "Instructions de confirmation"
      },
      "invitation_instructions": {
        "accept": "Accept invitation",
        "accept_until": "This invitation will be due in %{due_date}.",
        "hello": "Hello %{email}",
        "ignore": "If you don't want to accept the invitation, please ignore this email.<br />\nYour account won't be created until you access the link above and set your password.",
        "someone_invited_you": "Someone has invited you to %{url}, you can accept it through the link below.",
        "subject": "Invitation instructions"
      },
      "password_change": {
        "greeting": "Bonjour %{recipient}!",
        "message": "Nous vous contactons pour vous notifier que votre mot de passe a été modifié.",
        "subject": "Mot de passe modifié."
      },
      "reset_password_instructions": {
        "action": "Changer mon mot de passe",
        "greeting": "Bonjour %{recipient}!",
        "instruction": "Quelqu'un a demandé un lien pour changer votre mot de passe, le voici :",
        "instruction_2": "Si vous n'avez pas émis cette demande, merci d'ignorer ce courriel.",
        "instruction_3": "Votre mot de passe ne changera pas tant que vous n'aurez pas cliqué sur ce lien et renseigné un nouveau mot de passe.",
        "subject": "Instructions pour changer le mot de passe"
      },
      "unlock_instructions": {
        "action": "Débloquer mon compte",
        "greeting": "Bonjour %{recipient}!",
        "instruction": "Suivez ce lien pour débloquer votre compte:",
        "message": "Votre compte a été bloqué suite à un nombre d'essais de connexions manquées trop important",
        "subject": "Instructions pour déverrouiller le compte"
      }
    },
    "omniauth_callbacks": {
      "failure": "Nous ne pouvons pas vous authentifier depuis %{kind} pour la raison suivante : '%{reason}'.",
      "success": "Autorisé avec succès par votre compte %{kind}."
    },
    "passwords": {
      "edit": {
        "change_my_password": "Changer mon mot de passe",
        "change_your_password": "Changer votre mot de passe",
        "confirm_new_password": "Confirmez votre nouveau mot de passe",
        "new_password": "Nouveau mot de passe"
      },
      "new": {
        "forgot_your_password": "Mot de passe oublié ?",
        "send_me_reset_password_instructions": "Envoyez-moi des instructions pour réinitialiser mon mot de passe"
      },
      "no_token": "Vous ne pouvez pas accéder à cette page si vous n’y accédez pas depuis un courriel de réinitialisation de mot de passe. Si vous venez en effet d’un tel courriel, vérifiez que vous avez copié l’adresse URL en entier.",
      "send_instructions": "Vous allez recevoir sous quelques minutes un courriel vous indiquant comment réinitialiser votre mot de passe.",
      "send_paranoid_instructions": "Si votre courriel existe dans notre base de données, vous recevrez un lien vous permettant de récupérer votre mot de passe.",
      "updated": "Votre mot de passe a été modifié avec succès. Vous êtes maintenant connecté(e).",
      "updated_not_active": "Votre mot de passe a été modifié avec succès."
    },
    "registrations": {
      "destroyed": "Au revoir ! Votre compte a été annulé avec succès. Nous espérons vous revoir bientôt.",
      "edit": {
        "are_you_sure": "Êtes-vous sûr ?",
        "cancel_my_account": "Supprimer mon compte",
        "currently_waiting_confirmation_for_email": "Confirmation en attente pour: %{email}",
        "leave_blank_if_you_don_t_want_to_change_it": "laissez ce champ vide pour le laisser inchangé",
        "title": "Éditer %{resource}",
        "unhappy": "Pas content ",
        "update": "Modifier",
        "we_need_your_current_password_to_confirm_your_changes": "nous avons besoin de votre mot de passe actuel pour valider ces modifications"
      },
      "new": {
        "sign_up": "Inscription"
      },
      "signed_up": "Bienvenue ! Vous vous êtes enregistré(e) avec succès.",
      "signed_up_but_inactive": "Vous vous êtes enregistré(e) avec succès. Cependant, nous n’avons pas pu vous connecter car votre compte n’a pas encore été activé.",
      "signed_up_but_locked": "Vous vous êtes enregistré(e) avec succès. Cependant, nous n’avons pas pu vous connecter car votre compte est verrouillé.",
      "signed_up_but_unconfirmed": "Un message avec un lien de confirmation vous a été envoyé par mail. Veuillez suivre ce lien pour activer votre compte.",
      "update_needs_confirmation": "Vous avez modifié votre compte avec succès, mais nous devons vérifier votre nouvelle adresse de courriel. Veuillez consulter vos courriels et cliquer sur le lien de confirmation pour confirmer votre nouvelle adresse.",
      "updated": "Votre compte a été modifié avec succès."
    },
    "sessions": {
      "already_signed_out": "Déconnecté(e).",
      "new": {
        "sign_in": "Connexion"
      },
      "signed_in": "Connecté(e) avec succès.",
      "signed_out": "Déconnecté(e) avec succès."
    },
    "shared": {
      "links": {
        "back": "Retour",
        "didn_t_receive_confirmation_instructions": "Vous n'avez pas reçu le courriel de confirmation ?",
        "didn_t_receive_unlock_instructions": "Vous n'avez pas reçu le courriel de déblocage ?",
        "forgot_your_password": "Mot de passe oublié ?",
        "sign_in": "Connexion",
        "sign_in_with_provider": "Connexion avec %{provider}",
        "sign_up": "Inscription"
      }
    },
    "unlocks": {
      "new": {
        "resend_unlock_instructions": "Renvoyer les instructions de déblocage"
      },
      "send_instructions": "Vous allez recevoir sous quelques minutes un courriel comportant des instructions pour déverrouiller votre compte.",
      "send_paranoid_instructions": "Si votre courriel existe sur notre base de données, vous recevrez sous quelques minutes un message avec des instructions pour déverrouiller votre compte.",
      "unlocked": "Votre compte a été déverrouillé avec succès. Veuillez vous connecter."
    },
    "users": {
      "passwords": {
        "new": {
          "submit": "Send me instructions",
          "tabs": {
            "register": "Register",
            "sign_in": "Sign In"
          }
        }
      },
      "registrations": {
        "new": {
          "submit": "Register",
          "tabs": {
            "register": "Register",
            "sign_in": "Sign In"
          }
        }
      },
      "sessions": {
        "new": {
          "forgot_password": "Forgot password?",
          "keep_sign_in": "Yes, Keep me signed in",
          "submit": "Sign In",
          "tabs": {
            "register": "Register",
            "sign_in": "Sign In"
          }
        }
      }
    }
  },
  "errors": {
    "connection_refused": "Oops! Failed to connect to the Web Console middleware.\nPlease make sure a rails development server is running.\n",
    "format": "%{attribute} %{message}",
    "messages": {
      "accepted": "must be accepted",
      "allowed_file_content_types": "file should be one of %{types}",
      "already_confirmed": "a déjà été confirmé(e)",
      "blank": "can't be blank",
      "carrierwave_download_error": "could not be downloaded",
      "carrierwave_integrity_error": "is not of an allowed file type",
      "carrierwave_processing_error": "failed to be processed",
      "confirmation": "doesn't match %{attribute}",
      "confirmation_period_expired": "doit être confirmé(e) en %{period}, veuillez en demander un(e) autre",
      "empty": "can't be empty",
      "equal_to": "must be equal to %{count}",
      "even": "must be even",
      "excluded_file_content_types": "file cannot be %{types}",
      "exclusion": "is reserved",
      "expired": "est expiré, veuillez en demander un autre",
      "extension_black_list_error": "You are not allowed to upload %{extension} files, prohibited types: %{prohibited_types}",
      "extension_white_list_error": "You are not allowed to upload %{extension} files, allowed types: %{allowed_types}",
      "file_size_is_greater_than": "file size must be greater than %{count}",
      "file_size_is_greater_than_or_equal_to": "file size must be greater than or equal to %{count}",
      "file_size_is_in": "file size must be between %{min} and %{max}",
      "file_size_is_less_than": "file size must be less than %{count}",
      "file_size_is_less_than_or_equal_to": "file size must be less than or equal to %{count}",
      "greater_than": "must be greater than %{count}",
      "greater_than_or_equal_to": "must be greater than or equal to %{count}",
      "inclusion": "is not included in the list",
      "invalid": "is invalid",
      "less_than": "must be less than %{count}",
      "less_than_or_equal_to": "must be less than or equal to %{count}",
      "mime_types_processing_error": "Failed to process file with MIME::Types, maybe not valid content-type? Original Error: %{e}",
      "mini_magick_processing_error": "Failed to manipulate with MiniMagick, maybe it is not an image? Original Error: %{e}",
      "model_invalid": "Validation failed: %{errors}",
      "not_a_number": "is not a number",
      "not_an_integer": "must be an integer",
      "not_found": "n’a pas été trouvé(e)",
      "not_locked": "n’était pas verrouillé(e)",
      "not_saved": {
        "one": "une erreur a empêché ce (cet ou cette) %{resource} d’être enregistré(e) :",
        "other": "%{count} erreurs ont empêché ce (cet ou cette) %{resource} d’être enregistré(e) :"
      },
      "odd": "must be odd",
      "other_than": "must be other than %{count}",
      "present": "must be blank",
      "required": "must exist",
      "rmagick_processing_error": "Failed to manipulate with rmagick, maybe it is not an image? Original Error: %{e}",
      "taken": "has already been taken",
      "too_long": {
        "one": "is too long (maximum is 1 character)",
        "other": "is too long (maximum is %{count} characters)"
      },
      "too_short": {
        "one": "is too short (minimum is 1 character)",
        "other": "is too short (minimum is %{count} characters)"
      },
      "wrong_length": {
        "one": "is the wrong length (should be 1 character)",
        "other": "is the wrong length (should be %{count} characters)"
      }
    },
    "unacceptable_request": "A supported version is expected in the Accept header.\n",
    "unavailable_session": "Session %{id} is is no longer available in memory.\n\nIf you happen to run on a multi-process server (like Unicorn or Puma) the process\nthis request hit doesn't store %{id} in memory. Consider turning the number of\nprocesses/workers to one (1) or using a different server in development.\n"
  },
  "flash": {
    "actions": {
      "create": {
        "notice": "%{resource_name} was successfully created."
      },
      "destroy": {
        "alert": "%{resource_name} could not be destroyed.",
        "notice": "%{resource_name} was successfully destroyed."
      },
      "update": {
        "notice": "%{resource_name} was successfully updated."
      }
    }
  },
  "helpers": {
    "page_entries_info": {
      "more_pages": {
        "display_entries": "Displaying %{entry_name} <b>%{first}&nbsp;-&nbsp;%{last}</b> of <b>%{total}</b> in total"
      },
      "one_page": {
        "display_entries": {
          "one": "Displaying <b>1</b> %{entry_name}",
          "other": "Displaying <b>all %{count}</b> %{entry_name}",
          "zero": "No %{entry_name} found"
        }
      }
    },
    "select": {
      "prompt": "Please select"
    },
    "submit": {
      "create": "Create %{model}",
      "submit": "Save %{model}",
      "update": "Update %{model}"
    }
  },
  "home": {
    "survey_instructions": {
      "title": "Instructions"
    }
  },
  "i18n_tasks": {
    "add_missing": {
      "added": {
        "one": "Added %{count} key",
        "other": "Added %{count} keys"
      }
    },
    "cmd": {
      "args": {
        "default_text": "Default: %{value}",
        "desc": {
          "confirm": "Confirm automatically",
          "data_format": "Data format: %{valid_text}.",
          "key_pattern": "Filter by key pattern (e.g. 'common.*')",
          "key_pattern_to_rename": "Full key (pattern) to rename. Required",
          "locale": "i18n_tasks.common.locale",
          "locale_to_translate_from": "Locale to translate from",
          "locales_filter": "Locale(s) to process. Special: base",
          "missing_types": "Filter by types: %{valid}",
          "new_key_name": "New name, interpolates original name as %{key}. Required",
          "nostdin": "Do not read from stdin",
          "out_format": "Output format: %{valid_text}",
          "pattern_router": "Use pattern router: keys moved per config data.write",
          "strict": "Avoid inferring dynamic key usages such as t(\"cats.#{cat}.name\"). Takes precedence over the config setting if set.",
          "value": "Value. Interpolates: %{value}, %{human_key}, %{key}, %{default}, %{value_or_human_key}, %{value_or_default_or_human_key}"
        }
      },
      "desc": {
        "add_missing": "add missing keys to locale data",
        "config": "display i18n-tasks configuration",
        "data": "show locale data",
        "data_merge": "merge locale data with trees",
        "data_remove": "remove keys present in tree from data",
        "data_write": "replace locale data with tree",
        "eq_base": "show translations equal to base value",
        "find": "show where keys are used in the code",
        "gem_path": "show path to the gem",
        "health": "is everything OK?",
        "irb": "start REPL session within i18n-tasks context",
        "missing": "show missing translations",
        "normalize": "normalize translation data: sort and move to the right files",
        "remove_unused": "remove unused keys",
        "translate_missing": "translate missing keys with Google Translate",
        "tree_convert": "convert tree between formats",
        "tree_filter": "filter tree by key pattern",
        "tree_merge": "merge trees",
        "tree_rename_key": "rename tree node",
        "tree_set_value": "set values of keys, optionally match a pattern",
        "tree_subtract": "tree A minus the keys in tree B",
        "tree_translate": "Google Translate a tree to root locales",
        "unused": "show unused translations",
        "xlsx_report": "save missing and unused translations to an Excel file"
      },
      "encourage": [
        "Good job!",
        "Well done!",
        "Perfect!"
      ],
      "enum_list_opt": {
        "invalid": "%{invalid} is not in: %{valid}."
      },
      "enum_opt": {
        "invalid": "%{invalid} is not one of: %{valid}."
      },
      "errors": {
        "invalid_format": "invalid format: %{invalid}. valid: %{valid}.",
        "invalid_locale": "invalid locale: %{invalid}",
        "invalid_missing_type": {
          "one": "invalid type: %{invalid}. valid: %{valid}.",
          "other": "unknown types: %{invalid}. valid: %{valid}."
        },
        "pass_forest": "pass locale forest"
      }
    },
    "common": {
      "base_value": "Base Value",
      "continue_q": "Continue?",
      "key": "Key",
      "locale": "Locale",
      "n_more": "%{count} more",
      "type": "Type",
      "value": "Value"
    },
    "data_stats": {
      "text": "has %{key_count} keys across %{locale_count} locales. On average, values are %{value_chars_avg} characters long, keys have %{key_segments_avg} segments, a locale has %{per_locale_avg} keys.",
      "text_single_locale": "has %{key_count} keys in total. On average, values are %{value_chars_avg} characters long, keys have %{key_segments_avg} segments.",
      "title": "Forest (%{locales})"
    },
    "google_translate": {
      "errors": {
        "no_api_key": "Set Google API key via GOOGLE_TRANSLATE_API_KEY environment variable or translation.api_key in config/i18n-tasks.yml. Get the key at https://code.google.com/apis/console.",
        "no_results": "Google Translate returned no results. Make sure billing information is set at https://code.google.com/apis/console."
      }
    },
    "health": {
      "no_keys_detected": "No keys detected. Check data.read in config/i18n-tasks.yml."
    },
    "missing": {
      "details_title": "Value in other locales or source",
      "none": "No translations are missing."
    },
    "remove_unused": {
      "confirm": {
        "one": "%{count} translation will be removed from %{locales}.",
        "other": "%{count} translation will be removed from %{locales}."
      },
      "noop": "No unused keys to remove",
      "removed": "Removed %{count} keys"
    },
    "translate_missing": {
      "translated": "Translated %{count} keys"
    },
    "unused": {
      "none": "Every translation is in use."
    },
    "usages": {
      "none": "No key usages found."
    }
  },
  "languages": {
    "ar": "Arabic",
    "cn": "Chinese",
    "de": "German",
    "en": "English",
    "es": "Spanish",
    "fr": "French"
  },
  "layouts": {
    "users": {
      "dashboard": "Dashboard",
      "help": "Help",
      "logout": "Log Out",
      "menu": "Menu",
      "notifications": "Notifications",
      "profile": "Profile"
    }
  },
  "managers": {
    "assigns": {
      "index": {
        "title": "Assessments and Reporting Centre"
      },
      "list": {
        "action": "Action",
        "assessment_name": "Assessment Name",
        "assessment_type": "Assessment Type",
        "completion_date": "Completion Date",
        "name": "Name",
        "status": "Completion Status"
      },
      "resource": {
        "email": "Email",
        "save": "Save in PDF",
        "view": "View"
      }
    },
    "dashboard": {
      "index": {
        "assessment_center": "Assessment / Report Centre",
        "notification_center": "Notification Centre",
        "notifications": "Notifications",
        "relationships": "Company Relationships",
        "reporting": "Reporting",
        "statistics": "Statistics"
      }
    },
    "notifications": {
      "index": {
        "subtitle": "Notifications",
        "title": "Notification Centre"
      }
    },
    "reports": {
      "show": {
        "export_pdf": "Export to PDF",
        "header": "Report"
      }
    },
    "statistics": {
      "index": {
        "title": "Statistics"
      }
    },
    "users": {
      "index": {
        "title": "Company Relationships"
      }
    }
  },
  "no": "No",
  "number": {
    "currency": {
      "format": {
        "delimiter": ",",
        "format": "%u%n",
        "precision": 2,
        "separator": ".",
        "significant": false,
        "strip_insignificant_zeros": false,
        "unit": "$"
      }
    },
    "format": {
      "delimiter": ",",
      "precision": 3,
      "separator": ".",
      "significant": false,
      "strip_insignificant_zeros": false
    },
    "human": {
      "decimal_units": {
        "format": "%n %u",
        "units": {
          "billion": "Billion",
          "million": "Million",
          "quadrillion": "Quadrillion",
          "thousand": "Thousand",
          "trillion": "Trillion",
          "unit": ""
        }
      },
      "format": {
        "delimiter": "",
        "precision": 3,
        "significant": true,
        "strip_insignificant_zeros": true
      },
      "storage_units": {
        "format": "%n %u",
        "units": {
          "byte": {
            "one": "Byte",
            "other": "Bytes"
          },
          "eb": "EB",
          "gb": "GB",
          "kb": "KB",
          "mb": "MB",
          "pb": "PB",
          "tb": "TB"
        }
      }
    },
    "percentage": {
      "format": {
        "delimiter": "",
        "format": "%n%"
      }
    },
    "precision": {
      "format": {
        "delimiter": ""
      }
    }
  },
  "profiles": {
    "edit": {
      "header": "Profile Settings"
    },
    "update": {
      "successfully": "Profile updated"
    }
  },
  "ransack": {
    "all": "tous",
    "and": "et",
    "any": "au moins un",
    "asc": "ascendant",
    "attribute": "attribut",
    "combinator": "combinateur",
    "condition": "condition",
    "desc": "descendant",
    "or": "ou",
    "predicate": "prédicat",
    "predicates": {
      "blank": "est blanc",
      "cont": "contient",
      "cont_all": "contient tous",
      "cont_any": "contient au moins un",
      "does_not_match": "ne correspond pas à",
      "does_not_match_all": "ne correspond à aucun",
      "does_not_match_any": "ne correspond pas à au moins un",
      "end": "finit par",
      "end_all": "finit par tous",
      "end_any": "finit par au moins un",
      "eq": "égal à",
      "eq_all": "égal à tous",
      "eq_any": "égal à au moins un",
      "false": "est faux",
      "gt": "supérieur à",
      "gt_all": "supérieur à tous",
      "gt_any": "supérieur à au moins un",
      "gteq": "supérieur ou égal à",
      "gteq_all": "supérieur ou égal à tous",
      "gteq_any": "supérieur ou égal à au moins un",
      "in": "inclus dans",
      "in_all": "inclus dans tous",
      "in_any": "inclus dans au moins un",
      "lt": "inférieur à",
      "lt_all": "inférieur à tous",
      "lt_any": "inférieur à au moins un",
      "lteq": "inférieur ou égal à",
      "lteq_all": "inférieur ou égal à tous",
      "lteq_any": "inférieur ou égal à au moins un",
      "matches": "correspond à",
      "matches_all": "correspond à tous",
      "matches_any": "correspond à au moins un",
      "not_cont": "ne contient pas",
      "not_cont_all": "ne contient pas tous",
      "not_cont_any": "ne contient pas au moins un",
      "not_end": "ne finit pas par",
      "not_end_all": "ne finit pas par tous",
      "not_end_any": "ne finit pas par au moins un",
      "not_eq": "différent de",
      "not_eq_all": "différent de tous",
      "not_eq_any": "différent d'au moins un",
      "not_in": "non inclus dans",
      "not_in_all": "non inclus dans tous",
      "not_in_any": "non inclus dans au moins un",
      "not_null": "n'est pas null",
      "not_start": "ne commence pas par",
      "not_start_all": "ne commence pas par tous",
      "not_start_any": "ne commence pas par au moins un",
      "null": "est null",
      "present": "est présent",
      "start": "commence par",
      "start_all": "commence par tous",
      "start_any": "commence par au moins un",
      "true": "est vrai"
    },
    "search": "recherche",
    "sort": "tri",
    "value": "valeur"
  },
  "reports": {
    "modules": {
      "common": {
        "almost_always": "Almost Always",
        "less_typical": "Less Typical",
        "moderate": "Moderate",
        "more_typical": "More Typical",
        "rare": "Rare"
      },
      "cpi_occupations": {
        "occupations": "Occupations",
        "your_potential_suitability": "Your Potential Suitability"
      },
      "gap_assessment": {
        "gap": "Gap",
        "item": "Item",
        "negative_gap": "Negative Gap",
        "positive_gap": "Positive Gap",
        "rank": "Rank",
        "scoring_category": "Scoring Category"
      },
      "highest_lowest": {
        "bottom_5": "BOTTOM 5",
        "email": "Email",
        "first_name": "First Name",
        "highest_scores": "Highest Scores",
        "item": "Item",
        "last_name": "Last Name",
        "lowest_scores": "Lowest Scores",
        "mean_score": "Mean Score",
        "rank": "Rank",
        "score": "Score",
        "sub_competenties": "Sub-Competencies",
        "top_5": "TOP 5"
      },
      "potential_career_full": {
        "bachelors_or_masters_qualification": "Bachelors or Masters Qualification",
        "detailed_career_guide": "Detailed Career Guide",
        "diploma_qualification": "Diploma Qualification",
        "education_level": "Education Level",
        "high_school_entry_roles": "High School Entry Roles",
        "key_career_tracks_within": "Key Career Tracks Within",
        "potential_areas_of_study": "Potential Areas of Study",
        "potential_roles": "Potential Roles"
      },
      "potential_career_short": {
        "career": "career",
        "for_this": "for this",
        "key": "key",
        "strengths": "strengths",
        "your_scores": "Your Scores"
      }
    },
    "show": {
      "export_pdf": "Export to PDF",
      "header": "Report"
    }
  },
  "simple_form": {
    "error_notification": {
      "default_message": "Please review the problems below:"
    },
    "no": "No",
    "placeholders": {
      "administrator": {
        "active": "Active",
        "created_at": "Created Date",
        "current_password": "Current password",
        "disabled": "Disable",
        "email": "Email Address",
        "first_name": "First Name",
        "id": "ID",
        "last_name": "Last Name",
        "manage_client_ids": "Memberships",
        "memberships": "Memberships",
        "password": "Password",
        "password_confirmation": "Password confirmation",
        "role": "Role",
        "roles": {
          "admin": "Client Admin",
          "manager": "Manager",
          "member": "User",
          "super_admin": "Super Admin",
          "superadmin": "Super Admin"
        },
        "types": {
          "anonymous": "Anonymous Users",
          "identified": "Identified Users"
        },
        "updated_at": "Modified Date"
      },
      "assessment": {
        "active": "Active",
        "categories": {
          "360": "360 Feedback",
          "organisational": "Org Surveys",
          "psychometric": "Psychometrics"
        },
        "category": "Category",
        "completed_at": "Completion Date",
        "created_at": "Created Date",
        "description": "Description",
        "id": "ID",
        "name": "Name",
        "statuses": {
          "completed": "Completed",
          "in_progress": "In Progress",
          "not_started": "New"
        },
        "timing": "Timing",
        "updated_at": "Modified Date"
      },
      "block": {
        "active": "Active",
        "assign_to_assessment_ids": "Assessments",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "client": {
        "category": "Category",
        "created_at": "Created Date",
        "id": "ID",
        "licenses": "License number",
        "licenses_expire": "License expire",
        "licenses_used": "Used license number",
        "logo": "Client logo",
        "name": "Name",
        "subdomain": "Subdomain",
        "updated_at": "Modified Date"
      },
      "dimension": {
        "active": "Active",
        "created_at": "Created Date",
        "factors_count": "No. of Factors",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "factor": {
        "active": "Active",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "parent_id": "Parent",
        "questions_count": "No. Questions",
        "subfactors_count": "No. Sub-Factors",
        "updated_at": "Modified Date"
      },
      "memebrship": {
        "id": "ID",
        "parent": "Direct Manager"
      },
      "norm": {
        "active": "Active",
        "bachelors_or_masters_qualification": "Bachelors or Masters Qualification",
        "created_at": "Created Date",
        "description": "Description",
        "diploma_qualification": "Diploma Qualification",
        "full_description": "Full Description",
        "high_school_entry_roles": "High School Entry Roles",
        "id": "ID",
        "key_career_tracks": "Key Career Tracks",
        "name": "Name",
        "potential_areas_of_study": "Potential Areas of Study",
        "updated_at": "Modified Date",
        "updated_by": "Edited by"
      },
      "question": {
        "active": "Active",
        "assign_to_assessment_ids": "Assessments",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "user": {
        "active": "Active",
        "created_at": "Created Date",
        "current_password": "Current password",
        "disabled": "Disable",
        "email": "Email Address",
        "first_name": "First Name",
        "id": "ID",
        "last_name": "Last Name",
        "manage_client_ids": "Memberships",
        "memberships": "Memberships",
        "password": "Password",
        "password_confirmation": "Password confirmation",
        "role": "Role",
        "roles": {
          "admin": "Client Admin",
          "manager": "Manager",
          "member": "User",
          "super_admin": "Super Admin",
          "superadmin": "Super Admin"
        },
        "types": {
          "anonymous": "Anonymous Users",
          "identified": "Identified Users"
        },
        "updated_at": "Modified Date"
      }
    },
    "required": {
      "mark": "*",
      "text": "required"
    },
    "yes": "Yes"
  },
  "support": {
    "array": {
      "last_word_connector": ", and ",
      "two_words_connector": " and ",
      "words_connector": ", "
    }
  },
  "time": {
    "am": "am",
    "formats": {
      "date": "%d/%m/%y",
      "default": "%a, %d %b %Y %H:%M:%S %z",
      "devise": {
        "mailer": {
          "invitation_instructions": {
            "accept_until_format": "%B %d, %Y %I:%M %p"
          }
        }
      },
      "long": "%B %d, %Y %H:%M",
      "short": "%d %b %Y / %H:%M"
    },
    "pm": "pm"
  },
  "validations": {
    "character_range": "Your response must be at least %{min} and no more than %{max} characters.",
    "date": "Your response must be a valid date (dd/mm/yyyy)",
    "each_group_contains": "Each group needs to contain not less than %{min} and not more than %{max} items",
    "email": "Your response must be a valid email",
    "issue": "Issue",
    "least": "Please answer at least %{min} choice(s).",
    "least_hotspot": "Please answer at least %{min} choice(s).",
    "max_length": "Your response must be no more than %{max} characters.",
    "min_length": "Your response must be at least %{min} characters.",
    "must_rank_between": "Please assign a value from %{min} to %{max} for each item. Values may not be repeated.",
    "must_select": "Please select from %{min} to %{max} choices",
    "number": "Your response must be a number",
    "range": "Please answer at least %{min} and no more than %{max} choice(s).",
    "text": "Your response must not contain a numbers",
    "title": "Sorry, you cannot continue until you correct the following:"
  },
  "views": {
    "pagination": {
      "first": "&laquo; First",
      "last": "Last &raquo;",
      "next": "Next &rsaquo;",
      "previous": "&lsaquo; Prev",
      "truncate": "&hellip;"
    }
  },
  "yes": "Yes"
});
I18n.translations["ar"] = I18n.extend((I18n.translations["ar"] || {}), {
  "activerecord": {
    "attributes": {
      "assessment": {
        "active": "Active",
        "categories": {
          "360": "360 Feedback",
          "organisational": "Org Surveys",
          "psychometric": "Psychometrics"
        },
        "category": "Category",
        "created_at": "Created Date",
        "description": "Description",
        "id": "ID",
        "name": "Name",
        "timing": "Timing",
        "updated_at": "Modified Date"
      },
      "assign": {
        "completed_at": "Completion Date",
        "statuses": {
          "completed": "Completed",
          "in_progress": "In Progress",
          "not_started": "New"
        }
      },
      "block": {
        "active": "Active",
        "assign_to_assessment_ids": "Assessments",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "client": {
        "category": "Category",
        "created_at": "Created Date",
        "id": "ID",
        "licenses": "License number",
        "licenses_expire": "License expire",
        "licenses_used": "Used license number",
        "logo": "Client logo",
        "name": "Name",
        "subdomain": "Subdomain",
        "updated_at": "Modified Date"
      },
      "dimension": {
        "active": "Active",
        "created_at": "Created Date",
        "factors_count": "No. of Factors",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "factor": {
        "active": "Active",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "parent_id": "Parent",
        "questions_count": "No. Questions",
        "subfactors_count": "No. Sub-Factors",
        "updated_at": "Modified Date"
      },
      "membership": {
        "parent_id": "Direct Manager"
      },
      "memebrship": {
        "id": "ID",
        "parent": "Direct Manager"
      },
      "norm": {
        "active": "Active",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date",
        "updated_by": "Edited by"
      },
      "occupation": {
        "active": "Active",
        "bachelors_or_masters_qualification": "Bachelors or Masters Qualification",
        "created_at": "Created Date",
        "description": "Description",
        "diploma_qualification": "Diploma Qualification",
        "full_description": "Full Description",
        "high_school_entry_roles": "High School Entry Roles",
        "id": "ID",
        "key_career_tracks": "Key Career Tracks",
        "name": "Name",
        "potential_areas_of_study": "Potential Areas of Study",
        "updated_at": "Modified Date"
      },
      "occupations_factor": {
        "active": "Active",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "question": {
        "active": "Active",
        "assign_to_assessment_ids": "Assessments",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "user": {
        "active": "Active",
        "created_at": "Created Date",
        "current_password": "كلمة المرور الحالية",
        "disabled": "Disable",
        "email": "البريد الإلكتروني",
        "first_name": "First Name",
        "id": "ID",
        "last_name": "Last Name",
        "manage_client_ids": "Memberships",
        "memberships": "Memberships",
        "password": "كلمة المرود",
        "password_confirmation": "تأكيد كلمة المرور",
        "remember_me": "تذكرني",
        "reset_password_token": "Reset password token",
        "role": "Role",
        "roles": {
          "admin": "Client Admin",
          "manager": "Manager",
          "member": "User",
          "super_admin": "Super Admin",
          "superadmin": "Super Admin"
        },
        "types": {
          "anonymous": "Anonymous Users",
          "identified": "Identified Users"
        },
        "unlock_token": "Unlock token",
        "updated_at": "Modified Date"
      }
    },
    "errors": {
      "messages": {
        "not_uniqueness": "Assign has already been taken",
        "record_invalid": "Validation failed: %{errors}",
        "restrict_dependent_destroy": {
          "has_many": "Cannot delete record because dependent %{record} exist",
          "has_one": "Cannot delete record because a dependent %{record} exists"
        }
      },
      "models": {
        "factors_norm": {
          "score_from_must_be_number": "Score from must be number",
          "score_to_less_than_score_from": "Score to is less than Score from",
          "score_to_must_be_number": "Score to must be number"
        }
      }
    },
    "models": {
      "assessment": "Assessments",
      "assign": "Assigns",
      "block": "Block",
      "client": "Clients",
      "dimension": "Dimensions",
      "factor": "Factors",
      "factors_norm": "factors_norms",
      "membership": "Memebrship",
      "memebrship": "Memebrship",
      "norm": "Norms",
      "occupation": "Occupations",
      "occupations_factor": "Occupations",
      "question": "Question",
      "user": "المستخدم"
    }
  },
  "administration": {
    "actions": "Actions",
    "active": "Active",
    "administrator": {
      "passwords": {
        "edit": {
          "submit": "Set new password",
          "title": "Change your password"
        },
        "new": {
          "back": "Return back",
          "submit": "Send me instructions",
          "title": "Forgot your password?"
        }
      },
      "sessions": {
        "new": {
          "forgot_password": "Forgot your password?",
          "submit": "Login",
          "title": "<strong>Welcome</strong>, Please login"
        }
      },
      "shared": {
        "links": {
          "about": "About",
          "app_name": "© 2016 AppName",
          "contact_us": "Contact Us",
          "privacy": "Privacy"
        }
      }
    },
    "any": " - Any - ",
    "assessments": {
      "assigns": {
        "default": {
          "filter": "Filter",
          "filter_form": "Filter form",
          "next": "Next",
          "previous": "Previous",
          "title": "Assign %{name} Assessment"
        },
        "finish": {
          "show": {
            "filter": "Filter",
            "filter_form": "Filter form",
            "next": "Next",
            "previous": "Previous",
            "title": "Assign %{name} Assessment"
          }
        },
        "step1": {
          "show": {
            "filter": "Filter",
            "filter_form": "Filter form",
            "next": "Next",
            "previous": "Previous",
            "title": "Assign %{name} Assessment"
          }
        },
        "step2": {
          "show": {
            "filter": "Filter",
            "filter_form": "Filter form",
            "next": "Next",
            "not_selected_users": "Not Selected Users",
            "previous": "Previous",
            "selected_users": "Selected Users",
            "title": "Assign %{name} Assessment"
          },
          "users": {
            "filter": "Filter",
            "filter_form": "Filter form",
            "next": "Next",
            "previous": "Previous",
            "title": "Assign %{name} Assessment"
          }
        }
      },
      "copy": {
        "error": "Assessment #%{name} was not copied.",
        "successfully": "Assessment %{name} was successfully copied."
      },
      "create": {
        "successfully": "Assessment %{name} was successfully created."
      },
      "dashboard": "Assessment Dashboard",
      "destroy": {
        "successfully": "Assessment %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit assessment"
      },
      "form": {
        "categories": {
          "360": "360 Feedback",
          "all": "All Categories",
          "organisational": "Org Surveys",
          "psychometric": "Psychometrics"
        },
        "timing": {
          "hint": "For Example: 30 minutes to complete"
        }
      },
      "index": {
        "filterrific": {
          "with_category": {
            "360": "360 Feedback",
            "all": "All Categories",
            "organisational": "Org Surveys",
            "psychometric": "Psychometrics"
          }
        },
        "title": "Assessments",
        "tooltips": {
          "create": "Create"
        }
      },
      "new": {
        "header": "New assessment"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Assessment?</p>\n",
            "title": "Delete <strong>Assessment</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Assessment?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Assessment",
          "delete": "Delete Assessment",
          "edit": "Edit Assessment"
        }
      },
      "sidebar": {
        "assign": "Assign Assessment",
        "copy": "Copy Assessment",
        "destroy": "Delete Assessment",
        "disable": "Disable",
        "edit": "Edit Assessment",
        "enable": "Enable",
        "new": "New Assessment",
        "preview": "Preview Assessment",
        "title": "Assessment's options (#%{id})"
      },
      "toggle_status": {
        "successfully": "Assessment %{name} was successfully updated."
      },
      "update": {
        "successfully": "Assessment %{name} was successfully updated."
      }
    },
    "assigns": {
      "create": {
        "successfully": "New assign to assessment was successfully created"
      },
      "destroy": {
        "successfully": "Assign to assessment was successfully destroy"
      },
      "index": {
        "title": "Reports"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this assign?</p>",
            "title": "Delete <strong>%{name}</strong> ?"
          }
        }
      }
    },
    "back": "Back",
    "base": {
      "top_sidebar": {
        "search": "Search...",
        "sign_out_message": {
          "body": "<p>Are you sure you want to log out?</p> <p>Press No if you want to continue work. Press Yes to logout current user.</p>",
          "title": "Log <strong>Out</strong> ?"
        }
      }
    },
    "blocks": {
      "destroy": {
        "successfully": "Block %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit Block"
      },
      "new": {
        "header": "New Block"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Block?</p>\n",
            "title": "Delete <strong>Block</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Block?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        }
      }
    },
    "breadcrumbs": {
      "assessments": "Assessments",
      "client": "Client Tenancy",
      "clients": "Client Tenancies",
      "communication_center": "Communication Center",
      "create": "Create",
      "design": "Design",
      "dimension": "Dimension",
      "dimensions": "Dimensions",
      "factors": "Factors",
      "home": "Dashboard",
      "libraries": "Media Library",
      "norm": "Norm",
      "norms": "Norms",
      "norms_editor": "Norm Editor",
      "occupations": "Occupations",
      "occupations_factors": "Factors",
      "psychometrics": "Psychometrics",
      "question_center": "Question Center",
      "reports": "Reports",
      "statistics": "Statistics",
      "sub_factors": "Sub-Factors",
      "survey": "Survey",
      "surveys": "Surveys",
      "users": "Users",
      "users_add": "Add New",
      "users_import": "Import"
    },
    "cable": {
      "notification": {
        "assessment_factors": "Factors are fetched",
        "assessment_update": "Assessment is updated",
        "block_clone": "Block is copied",
        "block_create": "Block %{name} is created",
        "block_create_by_template": "Block was loaded from template",
        "block_destroy": "Block has been deleted",
        "block_move_down": "Block %{name} is moved down",
        "block_move_up": "Block %{name} is moved up",
        "block_permanent_destroy": "Block is permanent destroyed",
        "block_rename": "Block is renamed",
        "block_restore": "Block is restored",
        "block_save_as_template": "Block saved as template",
        "block_unlink_template": "Block was unlinked",
        "block_update": "Block is updated",
        "comment_create": "Comment is created",
        "comment_destroy": "Comment has been deleted",
        "geo_filter": "Data filtered",
        "module_create": "Module %{name} is created",
        "module_destroy": "Module has been deleted",
        "module_insert_after": "Module is inserted after",
        "module_insert_before": "Module is inserted before",
        "module_move_down": "Module is moved down",
        "module_move_up": "Module is moved up",
        "module_rename": "Module is renamed",
        "module_update": "Module is updated",
        "page_create": "Page %{name} is created",
        "page_destroy": "Page has been deleted",
        "page_move_down": "Page %{name} is moved down",
        "page_move_up": "Page %{name} is moved up",
        "page_rename": "Page is renamed",
        "page_update": "Page is updated",
        "question_clone": "Question is copied",
        "question_create": "Question %{name} is created",
        "question_create_by_template": "Question was loaded from template",
        "question_create_from_template": "Question is created from template",
        "question_destroy": "Question has been deleted",
        "question_insert_after": "Question is inserted after",
        "question_insert_before": "Question is inserted before",
        "question_move_down": "Question is moved down",
        "question_move_up": "Question is moved up",
        "question_permanent_destroy": "Question is permanent destroyed",
        "question_rename": "Question is renamed",
        "question_restore": "Question is restored",
        "question_save_as_template": "Question saved as template",
        "question_unlink_template": "Question was unlinked",
        "question_update": "Question is updated",
        "report_change_filters": "Filters are updated",
        "report_update": "Report is updated",
        "scoring_update": "Scoring is updated",
        "trash_empty": "Trash Comment empty"
      }
    },
    "choose": " - Choose - ",
    "clear": "Clear",
    "clients": {
      "assessments": {
        "assigns": {
          "default": {
            "filter": "Filter",
            "filter_form": "Filter form",
            "next": "Next",
            "previous": "Previous",
            "title": "Assign %{name} Assessment"
          },
          "finish": {
            "show": {
              "filter": "Filter",
              "filter_form": "Filter form",
              "next": "Next",
              "previous": "Previous",
              "title": "Assign %{name} Assessment"
            }
          },
          "step1": {
            "show": {
              "filter": "Filter",
              "filter_form": "Filter form",
              "next": "Next",
              "previous": "Previous",
              "title": "Assign %{name} Assessment"
            }
          },
          "step2": {
            "show": {
              "filter": "Filter",
              "filter_form": "Filter form",
              "next": "Next",
              "not_selected_users": "Not Selected Users",
              "previous": "Previous",
              "selected_users": "Selected Users",
              "title": "Assign %{name} Assessment"
            },
            "users": {
              "filter": "Filter",
              "filter_form": "Filter form",
              "next": "Next",
              "previous": "Previous",
              "title": "Assign %{name} Assessment"
            }
          }
        },
        "copy": {
          "error": "Assessment #%{name} was not copied.",
          "successfully": "Assessment %{name} was successfully copied."
        },
        "create": {
          "successfully": "Assessment %{name} was successfully created."
        },
        "dashboard": "Assessment Dashboard",
        "destroy": {
          "successfully": "Assessment %{name} was successfully destroyed."
        },
        "edit": {
          "header": "Edit assessment"
        },
        "form": {
          "categories": {
            "360": "360 Feedback",
            "all": "All Categories",
            "organisational": "Org Surveys",
            "psychometric": "Psychometrics"
          },
          "timing": {
            "hint": "For Example: 30 minutes to complete"
          }
        },
        "index": {
          "filterrific": {
            "with_category": {
              "360": "360 Feedback",
              "all": "All Categories",
              "organisational": "Org Surveys",
              "psychometric": "Psychometrics"
            }
          },
          "title": "Assessments",
          "tooltips": {
            "create": "Create"
          }
        },
        "new": {
          "header": "New assessment"
        },
        "resource": {
          "confirmations": {
            "delete": {
              "body": "<p>Are you sure you want to delete this Assessment?</p>\n",
              "title": "Delete <strong>Assessment</strong> ?"
            },
            "toggle_status": {
              "body": "<p>Are you sure you want to %{status} this Assessment?</p>\n",
              "title": "<strong>%{status}</strong> %{name}?"
            }
          },
          "tooltips": {
            "copy": "Copy Assessment",
            "delete": "Delete Assessment",
            "edit": "Edit Assessment"
          }
        },
        "sidebar": {
          "assign": "Assign Assessment",
          "copy": "Copy Assessment",
          "destroy": "Delete Assessment",
          "disable": "Disable",
          "edit": "Edit Assessment",
          "enable": "Enable",
          "new": "New Assessment",
          "preview": "Preview Assessment",
          "title": "Assessment's options (#%{id})"
        },
        "toggle_status": {
          "successfully": "Assessment %{name} was successfully updated."
        },
        "update": {
          "successfully": "Assessment %{name} was successfully updated."
        }
      },
      "copy": {
        "error": "Client #%{name} was not copied.",
        "successfully": "Client %{name} was successfully copied."
      },
      "create": {
        "successfully": "Client %{name} was successfully created."
      },
      "designs": {
        "form": {
          "no_background": "No Background yet",
          "no_logo": "No Logo yet"
        }
      },
      "destroy": {
        "successfully": "Client %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit client"
      },
      "index": {
        "title": "Client Tenancies",
        "tooltips": {
          "create": "Create"
        }
      },
      "license": {
        "header": "%{name} - Edit license"
      },
      "new": {
        "header": "New client"
      },
      "reports": {
        "copy": {
          "error": "Report #%{id} was not copied."
        },
        "destroy": {
          "successfully": "Report %{name} was successfully destroyed."
        },
        "edit": {
          "header": "Edit Report Name"
        },
        "index": {
          "filterrific": {
            "with_assessment_category": {
              "360": "360 Feedback",
              "all": "All",
              "organisational": "Org Surveys",
              "psychometric": "Psychometrics"
            }
          },
          "title": "Reports",
          "tooltips": {
            "create": "Create"
          }
        },
        "new": {
          "header": "New Report"
        },
        "preview": {
          "export_pdf": "Export to PDF",
          "title": "Preview"
        },
        "resource": {
          "confirmations": {
            "delete": {
              "body": "<p>Are you sure you want to delete this Report?</p>\n",
              "title": "Delete <strong>Report</strong> ?"
            },
            "toggle_status": {
              "body": "<p>Are you sure you want to %{status} this Report?</p>\n",
              "title": "<strong>%{status}</strong> %{name}?"
            }
          },
          "tooltips": {
            "copy": "Copy Report",
            "delete": "Delete Report",
            "edit": "Edit Report",
            "preview": "Preview Report"
          }
        },
        "sidebar": {
          "copy": "Copy Report",
          "destroy": "Delete Report",
          "edit": "Edit Report",
          "title": "Report's options (#%{id})",
          "view": "View Report"
        },
        "toggle_status": {
          "successfully": "Report was successfully updated."
        }
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this client?</p>",
            "title": "Delete <strong>%{name}</strong> ?"
          },
          "disable": {
            "body": "<p>Are you sure you want to disable this client?</p>",
            "title": "Disable <strong>%{name}</strong> ?"
          },
          "enable": {
            "body": "<p>Are you sure you want to enable this client?</p>",
            "title": "Enable <strong>%{name}</strong> ?"
          }
        },
        "tooltips": {
          "copy": "Copy Client",
          "delete": "Delete Client",
          "edit": "Edit Client"
        }
      },
      "sidebar": {
        "copy": "Copy Client",
        "design": "Edit Design",
        "destroy": "Destroy Client",
        "disable": "Disable",
        "edit": "Edit Client",
        "enable": "Enable",
        "licenses": "Edit Licenses",
        "new": "New Client",
        "title": "Client's options (#%{id})"
      },
      "statistics": {
        "index": {
          "all_assessments": "All assessments",
          "assessment_type": "Assessment type",
          "title": "Statistics"
        }
      },
      "toggle_status": {
        "successfully": "Client %{name} was successfully updated."
      },
      "update": {
        "successfully": "Client %{name} was successfully updated."
      },
      "users": {
        "assigns": {
          "index": {
            "add": "Assign New Assessment",
            "title": "Assessments and Reporting"
          },
          "list": {
            "actions": "Actions",
            "assessment_name": "Assessment Name",
            "assessment_type": "Assessment Type",
            "reports": "Reports",
            "status": "Completion Status",
            "uniq_id": "Uniq ID"
          },
          "resource": {
            "no_access_to_reports": "No access to reports",
            "no_completed": "Not completed",
            "no_reports": "No relative reports",
            "tooltips": {
              "delete": "Delete Assign"
            }
          }
        },
        "create": {
          "successfully": "User %{name} was successfully created."
        },
        "destroy": {
          "successfully": "User %{name} was successfully destroyed."
        },
        "edit": {
          "add": "Add",
          "hris_data": "HRIS Data",
          "key": "Key",
          "personal_data": "Personal Data",
          "remove": "Remove",
          "title": "Edit user",
          "value": "Value"
        },
        "form": {
          "choose": " - Choose - "
        },
        "index": {
          "add": "Add new user",
          "export": "Export",
          "filterrific": {
            "with_role": {
              "administration": "Administrators",
              "all": "All",
              "users": "Users"
            }
          },
          "import": "Import",
          "import_hris": "HRIS Data",
          "import_users": "Users",
          "title": "Users",
          "tooltips": {
            "create": "Create",
            "export": "Export",
            "import": "Import"
          }
        },
        "new": {
          "header": "New user"
        },
        "reports": {
          "copy": {
            "error": "Report #%{id} was not copied."
          },
          "destroy": {
            "successfully": "Report %{name} was successfully destroyed."
          },
          "edit": {
            "header": "Edit Report Name"
          },
          "index": {
            "filterrific": {
              "with_assessment_category": {
                "360": "360 Feedback",
                "all": "All",
                "organisational": "Org Surveys",
                "psychometric": "Psychometrics"
              }
            },
            "title": "Reports",
            "tooltips": {
              "create": "Create"
            }
          },
          "new": {
            "header": "New Report"
          },
          "preview": {
            "export_pdf": "Export to PDF",
            "title": "Preview"
          },
          "resource": {
            "confirmations": {
              "delete": {
                "body": "<p>Are you sure you want to delete this Report?</p>\n",
                "title": "Delete <strong>Report</strong> ?"
              },
              "toggle_status": {
                "body": "<p>Are you sure you want to %{status} this Report?</p>\n",
                "title": "<strong>%{status}</strong> %{name}?"
              }
            },
            "tooltips": {
              "copy": "Copy Report",
              "delete": "Delete Report",
              "edit": "Edit Report",
              "preview": "Preview Report"
            }
          },
          "sidebar": {
            "copy": "Copy Report",
            "destroy": "Delete Report",
            "edit": "Edit Report",
            "title": "Report's options (#%{id})",
            "view": "View Report"
          },
          "toggle_status": {
            "successfully": "Report was successfully updated."
          }
        },
        "reset_password": {
          "successfully": "User  %{name} will receive an email with instructions on how to reset his (her) password in a few minutes."
        },
        "resource": {
          "confirmations": {
            "change_password": {
              "body": "<p>Are you sure you want to send instructions with link to change password?</p>\n",
              "title": "Change password <strong>%{name}</strong> ?"
            },
            "delete": {
              "body": "<p>Are you sure you want to delete this User?</p>\n",
              "title": "Delete <strong>%{name}</strong> ?"
            },
            "membership": {
              "delete": {
                "body": "<p>Are you sure you want to delete?</p>\n",
                "title": "Delete <strong>%{name}</strong> from %{client_name} Client Tenancy?"
              }
            },
            "toggle_status": {
              "body": "<p>Are you sure you want to %{status} this User?</p>\n",
              "title": "<strong>%{status}</strong> %{name}?"
            }
          },
          "tooltips": {
            "change_password": "Change password",
            "chart": "View user report",
            "delete": "Delete user",
            "edit": "Edit user",
            "mail": "Send mail",
            "sign_in": "Login as user"
          }
        },
        "sidebar": {
          "assessments_and_reports": "Assessments and Reporting",
          "destroy": "Delete User",
          "disable": "Disable",
          "edit_user": "Edit User",
          "email": "Send mail",
          "enable": "Enable",
          "export_users": "Export users",
          "import_users": "Import users",
          "login_as_user": "Login as User",
          "new_user": "New User",
          "reset_password": "Change Password",
          "title": "User's options (#%{id})"
        },
        "spoof": {
          "successfully": "You was successfully login as %{name}"
        },
        "toggle_status": {
          "successfully": "User %{name} was successfully updated."
        },
        "update": {
          "successfully": "User %{name} was successfully updated."
        }
      }
    },
    "close": "Close",
    "communications": {
      "copy": {
        "error": "Communication #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Communication %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit Communication"
      },
      "form": {
        "body_mustache": "{{first_name}} - Recipient First Name\n{{last_name}} - Recipient Last Name\n{{email}} - Recipient Email\n",
        "delivery_rules": {
          "after_complete": "Right after completion",
          "if_not_finished": "If assessment was not finished",
          "if_not_started": "If assessment is not started",
          "on_specific_datetime": "Specific date and time"
        },
        "selected_cc_recipients": "Selected CC Recipients",
        "selected_recipients": "Selected Recipients"
      },
      "index": {
        "add_new": "Add new",
        "title": "Communication Center",
        "tooltips": {
          "create": "Create"
        }
      },
      "new": {
        "header": "New Communication"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Communication?</p>\n",
            "title": "Delete <strong>Communication</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Communication?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Communication",
          "delete": "Delete Communication",
          "edit": "Edit Communication"
        }
      },
      "sidebar": {
        "copy": "Copy Communication",
        "destroy": "Delete Communication",
        "disable": "Disable Communication",
        "edit": "Edit Communication",
        "enable": "Enable Communication",
        "new": "New Communication",
        "title": "Communication's options (#%{id})",
        "view": "View Communication"
      },
      "toggle_status": {
        "successfully": "Communication was successfully updated."
      }
    },
    "copy": "Copy",
    "create": "Create",
    "dimensions": {
      "copy": {
        "error": "Dimension #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Dimension %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit Dimension Name"
      },
      "index": {
        "title": "Dimensions",
        "tooltips": {
          "create": "Create"
        }
      },
      "new": {
        "header": "New Dimension"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Dimension?</p>\n",
            "title": "Delete <strong>Dimension</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Dimension?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Dimension",
          "delete": "Delete Dimension",
          "edit": "Edit Dimension Name"
        }
      },
      "sidebar": {
        "assign": "Assign Dimension",
        "copy": "Copy Dimension",
        "destroy": "Delete Dimension",
        "disable": "Disable Dimension",
        "edit": "Edit Dimension Name",
        "enable": "Enable Dimension",
        "new": "New Dimension",
        "title": "Dimension's options (#%{id})",
        "view": "View Dimension"
      },
      "toggle_status": {
        "successfully": "Dimension was successfully updated."
      }
    },
    "disable": "Disable",
    "edit": "Edit",
    "enable": "Enable",
    "factors": {
      "copy": {
        "error": "Factor #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Factor %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit Factor Name"
      },
      "form": {
        "no_icon": "No Logo yet"
      },
      "index": {
        "icon": "Icon",
        "title": "Factors",
        "tooltips": {
          "create": "Create"
        }
      },
      "new": {
        "header": "New Factor"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Factor?</p>\n",
            "title": "Delete <strong>Factor</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Factor?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Factor",
          "delete": "Delete Factor",
          "edit": "Edit Factor Name"
        }
      },
      "sidebar": {
        "copy": "Copy Factor",
        "destroy": "Delete Factor",
        "edit": "Edit Factor Name",
        "title": "Factor's options (#%{id})",
        "view": "View Factor"
      },
      "toggle_status": {
        "successfully": "Factor was successfully updated."
      }
    },
    "genders": {
      "female": "Female",
      "male": "Male",
      "not_set": "Not set"
    },
    "home": {
      "index": {
        "notifications": "Notifications"
      }
    },
    "import": "Import",
    "imports": {
      "assessments": {
        "results": {
          "form": {
            "import": "Import"
          }
        }
      },
      "base": {
        "form": {
          "import": "Import"
        }
      },
      "errors": {
        "error": "[Row %{row}] %{error}",
        "invalid_assign": "Can't to find record for specified Result ID. If you want to create new result, please, leave Result ID column empty",
        "invalid_format": "There is no Email column",
        "norm": {
          "factor_is_not_described": "[#%{coords}] factor %{factor} is not described above",
          "factors_mismatch": "[#%{coords}] dimension %{dimension} does not have factor %{factor}",
          "not_set_dimension": "The name of the Dimension should be written in A-1",
          "sub_factors_mismatch": "[#%{coords}] dimension %{dimension} does not have sub factor %{factor}"
        },
        "result": {
          "error": "[Row %{row}] %{error}",
          "invalid_assign": "[Row %{row}] Can't to find record for specified Result ID. If you want to create new result, please, leave Result ID column empty",
          "invalid_format": "Invalid File format"
        },
        "translation": {
          "error": "[Translation %{id}] %{error}",
          "invalid_format": "Invalid File format"
        },
        "unknown_type": "Unknown file type: %{filename}",
        "user": {
          "not_found": "[Row %{row}] Couldn't find User with Email Address %{email}"
        }
      },
      "form": {
        "import": "Import"
      },
      "hris": {
        "form": {
          "import": "Import"
        }
      },
      "new": {
        "header": "Import"
      },
      "users": {
        "form": {
          "import": "Import"
        }
      }
    },
    "imports_assessments_result_imports": {
      "create": {
        "successfully": "Raw Results data was successfully imported"
      },
      "new": {
        "header": "Import Raw Results data"
      }
    },
    "imports_hris_imports": {
      "create": {
        "successfully": "HRIS data was successfully imported"
      },
      "new": {
        "header": "Import HRIS data"
      }
    },
    "imports_user_imports": {
      "create": {
        "successfully": "Users was successfully imported"
      },
      "new": {
        "header": "Import Users"
      }
    },
    "libraries": {
      "create": {
        "successfully": "Item %{name} was successfully created."
      },
      "destroy": {
        "successfully": "Item %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit"
      },
      "index": {
        "title": "Media Library"
      },
      "list": {
        "new_folder": "New folder",
        "root": "Media Library",
        "upload": "Upload new file"
      },
      "new": {
        "header": "New Report"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete %{name}?</p>\n",
            "title": "Delete <strong>%{name}</strong> ?"
          }
        },
        "tooltips": {
          "delete": "Delete",
          "edit": "Edit"
        }
      },
      "update": {
        "successfully": "Item %{name} was successfully updated."
      }
    },
    "memberships": {
      "create": {
        "successfully": "User %{name} was successfully created."
      },
      "destroy": {
        "successfully": "User %{name} was successfully destroyed."
      },
      "edit": {
        "add": "Add",
        "hris_data": "HRIS Data",
        "key": "Key",
        "personal_data": "Personal Data",
        "remove": "Remove",
        "title": "Edit user",
        "value": "Value"
      },
      "index": {
        "add": "Add new user",
        "export": "Export",
        "filterrific": {
          "with_role": {
            "administration": "Administrators",
            "all": "All",
            "users": "Users"
          }
        },
        "import": "Import",
        "import_hris": "HRIS Data",
        "import_users": "Users",
        "title": "Users",
        "tooltips": {
          "create": "Create",
          "export": "Export",
          "import": "Import"
        }
      },
      "new": {
        "header": "New user"
      },
      "reset_password": {
        "successfully": "User  %{name} will receive an email with instructions on how to reset his (her) password in a few minutes."
      },
      "spoof": {
        "successfully": "You was successfully login as %{name}"
      },
      "toggle_status": {
        "successfully": "User %{name} was successfully updated."
      },
      "update": {
        "successfully": "User %{name} was successfully updated."
      }
    },
    "meta_title": "Administration panel",
    "navigation": {
      "assessments": "Assessments",
      "client": "Client Tenancy",
      "clients": "Client Tenancies",
      "communication_center": "Communication Center",
      "create": "Create",
      "design": "Design",
      "dimension": "Dimension",
      "dimensions": "Dimensions",
      "factors": "Factors",
      "home": "Dashboard",
      "libraries": "Media Library",
      "norm": "Norm",
      "norms": "Norms",
      "norms_editor": "Norm Editor",
      "occupations": "Occupations",
      "occupations_factors": "Factors",
      "psychometrics": "Psychometrics",
      "question_center": "Question Center",
      "reports": "Reports",
      "statistics": "Statistics",
      "sub_factors": "Sub-Factors",
      "survey": "Survey",
      "surveys": "Surveys",
      "users": "Users",
      "users_add": "Add New",
      "users_import": "Import"
    },
    "new": "New",
    "no_data_found": "No data found",
    "norms": {
      "copy": {
        "error": "Norm #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Norm %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Rename Norm"
      },
      "editor": {
        "factors": "Factors",
        "inplace_title": "Enter value",
        "sub_factors": "Sub Factors",
        "title": "Norm Editor",
        "tooltips": {
          "edit": "Edit Title"
        }
      },
      "index": {
        "title": "Norms",
        "tooltips": {
          "create": "Create",
          "import": "Import"
        }
      },
      "new": {
        "header": "New norm"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Norm?</p>\n",
            "title": "Delete <strong>Norm</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Norm?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Norm",
          "delete": "Delete Norm",
          "edit": "Rename Norm"
        }
      },
      "sidebar": {
        "assign": "Assign Norm",
        "copy": "Copy Norm",
        "destroy": "Delete Norm",
        "disable": "Disable",
        "edit": "Rename Norm",
        "editor": "Norm Editor",
        "enable": "Enable",
        "export": "Export Norm",
        "import": "Import Norm",
        "new": "New Norm",
        "surveys": "Linked Surveys",
        "title": "Norm's options (#%{id})",
        "view": "View Norm"
      },
      "toggle_status": {
        "successfully": "Norm was successfully updated."
      }
    },
    "noty": {
      "error_500": "Something went wrong. Contact your administrator."
    },
    "occupations": {
      "copy": {
        "error": "Occupation #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Occupation #%{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit occupation"
      },
      "form": {
        "hint": {
          "key_career_tracks": "\"+\" - list, \"*\" - bold. Example: + *Biology* - some description..."
        }
      },
      "index": {
        "title": "Occupations",
        "tooltips": {
          "create": "Create"
        }
      },
      "new": {
        "header": "New occupation"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this occupation?</p>",
            "title": "Delete <strong>Occupation</strong> ?"
          }
        },
        "tooltips": {
          "copy": "Copy Occupation",
          "delete": "Delete Occupation",
          "edit": "Edit Occupation"
        }
      },
      "sidebar": {
        "copy": "Copy Occupation",
        "disable": "Disable",
        "edit": "Edit",
        "enable": "Enable",
        "new": "New Occupation",
        "title": "Occupation's options"
      },
      "toggle_status": {
        "successfully": "Occupation was successfully updated."
      }
    },
    "occupations_factors": {
      "copy": {
        "error": "Factor #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Factor #%{name} was successfully detached."
      },
      "edit": {
        "header": "Edit Factor"
      },
      "index": {
        "title": "Factors",
        "tooltips": {
          "create": "Create"
        }
      },
      "new": {
        "header": "Attach Factors"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this factor?</p>",
            "title": "Delete <strong>Factor</strong> ?"
          }
        },
        "tooltips": {
          "delete": "Delete Factor",
          "edit": "Edit Factor"
        }
      },
      "sidebar": {
        "disable": "Disable",
        "edit": "Edit",
        "enable": "Enable",
        "new": "Attach Factor",
        "title": "Factor's options"
      },
      "toggle_status": {
        "successfully": "Factor was successfully updated."
      }
    },
    "profiles": {
      "edit": {
        "success": "Profile was successfully updated.",
        "title": "Profile Editor"
      }
    },
    "psychometrics": "Psychometrics",
    "questions": {
      "destroy": {
        "successfully": "Question %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit Question"
      },
      "new": {
        "header": "New Question"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Question?</p>\n",
            "title": "Delete <strong>Question</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Question?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        }
      }
    },
    "reports": {
      "copy": {
        "error": "Report #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Report %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit Report Name"
      },
      "index": {
        "filterrific": {
          "with_assessment_category": {
            "360": "360 Feedback",
            "all": "All",
            "organisational": "Org Surveys",
            "psychometric": "Psychometrics"
          }
        },
        "title": "Reports",
        "tooltips": {
          "create": "Create"
        }
      },
      "new": {
        "header": "New Report"
      },
      "preview": {
        "export_pdf": "Export to PDF",
        "title": "Preview"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Report?</p>\n",
            "title": "Delete <strong>Report</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Report?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Report",
          "delete": "Delete Report",
          "edit": "Edit Report",
          "preview": "Preview Report"
        }
      },
      "sidebar": {
        "copy": "Copy Report",
        "destroy": "Delete Report",
        "edit": "Edit Report",
        "title": "Report's options (#%{id})",
        "view": "View Report"
      },
      "toggle_status": {
        "successfully": "Report was successfully updated."
      }
    },
    "search": "Search",
    "show": "Show",
    "sub_factors": {
      "copy": {
        "error": "Sub-Factor #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Sub-Factor %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit Sub-Factor Name"
      },
      "index": {
        "title": "Sub-Factors",
        "tooltips": {
          "create": "Create"
        }
      },
      "new": {
        "header": "New Sub-Factor"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Sub-Factor?</p>",
            "title": "Delete <strong>Sub-Factor</strong> ?"
          }
        },
        "tooltips": {
          "copy": "Copy Sub-Factor",
          "delete": "Delete Sub-Factor",
          "edit": "Edit Sub-Factor Name"
        }
      },
      "sidebar": {
        "destroy": "Delete Sub-Factor",
        "edit": "Edit Sub-Factor Name",
        "title": "Sub-Factor's options (#%{id})"
      },
      "toggle_status": {
        "successfully": "Sub-Factor was successfully updated."
      }
    },
    "templates": {
      "blocks": {
        "copy": {
          "error": "Block #%{name} was not copied."
        },
        "destroy": {
          "successfully": "Block %{name} was successfully destroyed."
        },
        "edit": {
          "header": "Edit Block"
        },
        "index": {
          "add": "Add New Block",
          "templates": {
          },
          "title": "Blocks",
          "tooltips": {
            "create": "Create"
          }
        },
        "new": {
          "header": "New Block"
        },
        "new_assign": {
          "header": "Assign Block to Assessments"
        },
        "resource": {
          "tooltips": {
            "copy": "Copy Block",
            "delete": "Delete Block",
            "edit": "Edit Block"
          }
        },
        "sidebar": {
          "destroy": "Delete Block",
          "disable": "Disable",
          "edit": "Edit Block",
          "enable": "Enable",
          "new": "New Block",
          "title": "Block's options (#%{id})"
        }
      },
      "questions": {
        "copy": {
          "error": "Question #%{name} was not copied."
        },
        "destroy": {
          "successfully": "Question %{name} was successfully destroyed."
        },
        "edit": {
          "header": "Edit Question"
        },
        "index": {
          "add": "Add New Question",
          "templates": {
            "blocks": "Blocks",
            "questions": "Questions"
          },
          "title": "Questions",
          "tooltips": {
            "create": "Create"
          }
        },
        "new": {
          "header": "New Question"
        },
        "new_assign": {
          "header": "Assign Question to Assessments"
        },
        "resource": {
          "tooltips": {
            "copy": "Copy Question",
            "delete": "Delete Question",
            "edit": "Edit Question"
          }
        },
        "sidebar": {
          "destroy": "Delete Question",
          "disable": "Disable",
          "edit": "Edit Question",
          "enable": "Enable",
          "new": "New Question",
          "title": "Question's options (#%{id})"
        }
      }
    },
    "translations": {
      "assessments": {
        "new": {
          "header": "Import Translations"
        }
      },
      "import": {
        "successfully": "Translations was successfully imported"
      }
    },
    "uniq_id": "Uniq ID",
    "update": "Update",
    "users": {
      "create": {
        "successfully": "User %{name} was successfully created."
      },
      "destroy": {
        "successfully": "User %{name} was successfully destroyed."
      },
      "edit": {
        "add": "Add",
        "hris_data": "HRIS Data",
        "key": "Key",
        "personal_data": "Personal Data",
        "remove": "Remove",
        "title": "Edit user",
        "value": "Value"
      },
      "form": {
        "choose": " - Choose - "
      },
      "index": {
        "add": "Add new user",
        "export": "Export",
        "filterrific": {
          "with_role": {
            "administration": "Administrators",
            "all": "All",
            "users": "Users"
          }
        },
        "import": "Import",
        "import_hris": "HRIS Data",
        "import_users": "Users",
        "title": "Users",
        "tooltips": {
          "create": "Create",
          "export": "Export",
          "import": "Import"
        }
      },
      "new": {
        "header": "New user"
      },
      "reset_password": {
        "successfully": "User  %{name} will receive an email with instructions on how to reset his (her) password in a few minutes."
      },
      "resource": {
        "confirmations": {
          "change_password": {
            "body": "<p>Are you sure you want to send instructions with link to change password?</p>\n",
            "title": "Change password <strong>%{name}</strong> ?"
          },
          "delete": {
            "body": "<p>Are you sure you want to delete this User?</p>\n",
            "title": "Delete <strong>%{name}</strong> ?"
          },
          "membership": {
            "delete": {
              "body": "<p>Are you sure you want to delete?</p>\n",
              "title": "Delete <strong>%{name}</strong> from %{client_name} Client Tenancy?"
            }
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this User?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "change_password": "Change password",
          "chart": "View user report",
          "delete": "Delete user",
          "edit": "Edit user",
          "mail": "Send mail",
          "sign_in": "Login as user"
        }
      },
      "sidebar": {
        "assessments_and_reports": "Assessments and Reporting",
        "destroy": "Delete User",
        "disable": "Disable",
        "edit_user": "Edit User",
        "email": "Send mail",
        "enable": "Enable",
        "export_users": "Export users",
        "import_users": "Import users",
        "login_as_user": "Login as User",
        "new_user": "New User",
        "reset_password": "Change Password",
        "title": "User's options (#%{id})"
      },
      "spoof": {
        "successfully": "You was successfully login as %{name}"
      },
      "toggle_status": {
        "successfully": "User %{name} was successfully updated."
      },
      "update": {
        "successfully": "User %{name} was successfully updated."
      }
    }
  },
  "assessments": {
    "decorator": {
      "no_description": "Description is empty"
    },
    "index": {
      "managers_dashboard_button": "Managers Dashboard",
      "user_dashboard_button": "User Dashboard"
    },
    "resource": {
      "assigned": "Assigned %{date}",
      "questions": {
        "one": "1 Question",
        "other": "%{count} Questions",
        "zero": "No Questions"
      },
      "results": "Results",
      "status": {
        "completed": "Completed",
        "in_progress": "Resume",
        "not_started": "Start"
      }
    }
  },
  "assigns": {
    "decorator": {
      "completed": "Completed %{date}",
      "not_completed": "Not Completed"
    },
    "notifications": {
      "completed": "%{user_name} finished assessment \"%{assessment_name}\"",
      "in_progress": "%{user_name} started to take assessment \"%{assessment_name}\""
    }
  },
  "ckeditor": {
    "buttons": {
      "cancel": "Cancel",
      "delete": "Delete",
      "next": "Next",
      "upload": "Upload"
    },
    "confirm_delete": "Delete file?",
    "page_title": "CKEditor Files Manager"
  },
  "clear_filter": "Clear Filter",
  "confirmation": {
    "default_body": "Are you sure?",
    "default_title": "Confirmation"
  },
  "date": {
    "abbr_day_names": [
      "Sun",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ],
    "abbr_month_names": [
      null,
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ],
    "day_names": [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ],
    "formats": {
      "default": "%Y-%m-%d",
      "long": "%B %d, %Y",
      "short": "%b %d"
    },
    "month_names": [
      null,
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ],
    "order": [
      "year",
      "month",
      "day"
    ]
  },
  "datetime": {
    "distance_in_words": {
      "about_x_hours": {
        "one": "about 1 hour",
        "other": "about %{count} hours"
      },
      "about_x_months": {
        "one": "about 1 month",
        "other": "about %{count} months"
      },
      "about_x_years": {
        "one": "about 1 year",
        "other": "about %{count} years"
      },
      "almost_x_years": {
        "one": "almost 1 year",
        "other": "almost %{count} years"
      },
      "half_a_minute": "half a minute",
      "less_than_x_minutes": {
        "one": "less than a minute",
        "other": "less than %{count} minutes"
      },
      "less_than_x_seconds": {
        "one": "less than 1 second",
        "other": "less than %{count} seconds"
      },
      "over_x_years": {
        "one": "over 1 year",
        "other": "over %{count} years"
      },
      "x_days": {
        "one": "1 day",
        "other": "%{count} days"
      },
      "x_minutes": {
        "one": "1 minute",
        "other": "%{count} minutes"
      },
      "x_months": {
        "one": "1 month",
        "other": "%{count} months"
      },
      "x_seconds": {
        "one": "1 second",
        "other": "%{count} seconds"
      }
    },
    "prompts": {
      "day": "Day",
      "hour": "Hour",
      "minute": "Minute",
      "month": "Month",
      "second": "Seconds",
      "year": "Year"
    }
  },
  "devise": {
    "administrators": {
      "meta_title": "Login to administration panel",
      "passwords": {
        "edit": {
          "submit": "Set new password",
          "title": "Change your password"
        },
        "new": {
          "back": "Return back",
          "submit": "Send me instructions",
          "title": "Forgot your password?"
        }
      },
      "sessions": {
        "new": {
          "forgot_password": "Forgot your password?",
          "submit": "Login",
          "title": "<strong>Welcome</strong>, Please login"
        }
      },
      "shared": {
        "links": {
          "about": "About",
          "app_name": "© 2016 AppName",
          "contact_us": "Contact Us",
          "privacy": "Privacy"
        }
      }
    },
    "confirmations": {
      "confirmed": "تمّ تأكيد الحساب بنجاح، وتمّ تسجيل الدّخول.",
      "new": {
        "resend_confirmation_instructions": "أعدْ إرسال تعليمات التأكيد"
      },
      "send_instructions": "ستصل خلال دقائق رسالة على البريد الإلكتروني تتضمّن الخطوات اللازمة لتأكيد الحساب.",
      "send_paranoid_instructions": "إذا كان البريد الإلكتروني مسجّلاً، فستصل خلال دقائق رسالة تتضمّن الخطوات اللازمة لتأكيد الحساب."
    },
    "failure": {
      "already_authenticated": "تم تسجيل الدخول من قَبل.",
      "inactive": "لم يتمّ تنشيط الحساب بعد.",
      "invalid": "البريد الإلكتروني أو كلمة السر غير صحيحة.",
      "invited": "You have a pending invitation, accept it to finish creating your account.",
      "last_attempt": "بقيت محاولة أخيرة قبل غلق الحساب.",
      "locked": "الحساب مُعلّق.",
      "not_found_in_database": "خطأ فى البريد الإلكتروني أو كلمة السر",
      "timeout": "لقد انتهت صلاحيّة الجلسة، الرجاء تسجيل الدّخول مجدداً.",
      "unauthenticated": "يجب إنشاء حساب أو تسجيل الدخول قبل المتابعة.",
      "unconfirmed": "يجب تأكيد الحساب حتّى تتمكّن من المُتابعة."
    },
    "invitations": {
      "edit": {
        "header": "Set your password",
        "submit_button": "Set my password"
      },
      "invitation_removed": "Your invitation was removed.",
      "invitation_token_invalid": "The invitation token provided is not valid!",
      "new": {
        "header": "Send invitation",
        "submit_button": "Send an invitation"
      },
      "no_invitations_remaining": "No invitations remaining",
      "send_instructions": "An invitation email has been sent to %{email}.",
      "updated": "Your password was set successfully. You are now signed in.",
      "updated_not_active": "Your password was set successfully."
    },
    "mailer": {
      "confirmation_instructions": {
        "action": "أكّد حسابي",
        "greeting": "مرحبا %{recipient}",
        "instruction": "يمكن تأكيد حساب بريدك الإلكتروني من خلال الرابط التّالي:",
        "subject": "تعليمات تأكيد الحساب"
      },
      "invitation_instructions": {
        "accept": "Accept invitation",
        "accept_until": "This invitation will be due in %{due_date}.",
        "hello": "Hello %{email}",
        "ignore": "If you don't want to accept the invitation, please ignore this email.<br />\nYour account won't be created until you access the link above and set your password.",
        "someone_invited_you": "Someone has invited you to %{url}, you can accept it through the link below.",
        "subject": "Invitation instructions"
      },
      "password_change": {
        "greeting": "Hello %{recipient}!",
        "message": "We're contacting you to notify you that your password has been changed.",
        "subject": "Password Changed"
      },
      "reset_password_instructions": {
        "action": "غيّر كلمة السر",
        "greeting": "مرحبا %{recipient}",
        "instruction": "طلب أحدهم رابطًا لتغيير كلمة السر الخاصة بك، ويُمكن عمل ذلك من خلال الرابط التالي.",
        "instruction_2": "إن لم تكن أنت من طلب هذا، من فضلك تجاهل هذه الرسالة.",
        "instruction_3": "لن تتغيّر كلمة السر الخاصة بك حتى تتبع الرابط السابق وتُنشئ كلمة سر جديدة.",
        "subject": "تعليمات إعادة تعيين كلمة المرور"
      },
      "unlock_instructions": {
        "action": "أزلْ الحظر عن حسابي",
        "greeting": "مرحبًا %{recipient}",
        "instruction": "انقرْ الرابط على الرابط التالي لفك الحظر عن حسابك:",
        "message": "قُفل حسابك بسبب المحاولات الفاشلة في تسجيل الدخول.",
        "subject": "تعليمات إعادة تفعيل الحساب"
      }
    },
    "omniauth_callbacks": {
      "failure": "فشلت عمليّة التحقق عبر %{kind} للسبب التّالي: %{reason}",
      "success": "تمّ التحقّق من الحساب بنجاح بإستخدام %{kind}"
    },
    "passwords": {
      "edit": {
        "change_my_password": "غيّر كلمة المرور خاصتي",
        "change_your_password": "غيّر كلمة المرور الخاصة بك",
        "confirm_new_password": "أكّد كلمة السر الجديدة",
        "new_password": "كلمة سر جديدة"
      },
      "new": {
        "forgot_your_password": "هل نسيت كلمة المرور؟",
        "send_me_reset_password_instructions": "أرسلْ لي تعليمات تصفير كلمة المرور"
      },
      "no_token": "لا يُمكن الدّخول إلى هذه الصفحة إلّا بإستخدام رسالة إعادة ضبط كلمة المرور. إن كان الوصول لهذه الصفحة عبر تلك الرسالة فالرجاء التأكد من فتح كامل الرابط بشكل صحيح.",
      "send_instructions": "ستصل خلال دقائق رسالة بريد إلكتروني تحوي التعليمات اللازمة لإعادة ضبط كلمة السر.",
      "send_paranoid_instructions": "إذا كان بريدك الإلكتروني مسجلاً عندنا فستصل إليه خلال دقائق رسالة تتضمّن رابطاً لاستعادة كلمة المرور.",
      "updated": "لقد تمّ تغيير كلمة المرور بنجاح، وتم تسجيل الدخول.",
      "updated_not_active": "تمّ تعديل كلمة المرور بنجاح."
    },
    "registrations": {
      "destroyed": "لقد تمّت إزالة الحساب، نأمل في نتقابل مجدداً في وقت قريب، إلى اللقاء! ",
      "edit": {
        "are_you_sure": "هل أنت متأكّد؟",
        "cancel_my_account": "ألغِ حسابي",
        "currently_waiting_confirmation_for_email": "في انتظار تفعيل البريد الإلكتروني %{email}",
        "leave_blank_if_you_don_t_want_to_change_it": "أبقه فارغًا إن كنت لا ترغب في تغييره",
        "title": "تعديل %{resource}",
        "unhappy": "غير راضٍ؟",
        "update": "تحديث",
        "we_need_your_current_password_to_confirm_your_changes": "نحتاج كلمة المرور الحالية خاصتك لتأكيد تغيراتك"
      },
      "new": {
        "sign_up": "سجّلْ"
      },
      "signed_up": "تمّ التسجيل في الموقع بنجاح، أهلاً وسهلاً!",
      "signed_up_but_inactive": "تمّ التسجيل في الموقع بنجاح، ولكن لا يُمكن تسجيل الدخول قبل تفعيل الحساب.",
      "signed_up_but_locked": "تمّ التسجيل في الموقع بنجاح، ولكن لا يمكن تسجيل الدخول ﻷن الحساب مُعلّق.",
      "signed_up_but_unconfirmed": "تمّ إرسال رسالة تحوي على رابط تأكيد الحساب باستخدام البريد الإلكتروني، يُرجى فتح الرابط لتفعيل الحساب.",
      "update_needs_confirmation": "تُم تعديل الحساب بنجاح، يرجى تأكيد البريد الإلكتروني. الرجاء الذهاب الى البريد الإلكتروني والضغط على الرابط الموجود للانتهاء من عمليّة التاكيد.",
      "updated": "تمّ تعديل الحساب بنجاح."
    },
    "sessions": {
      "already_signed_out": "Signed out successfully.",
      "new": {
        "sign_in": "سجّلْ الدخول"
      },
      "signed_in": "تمّ تسجيل الدخول.",
      "signed_out": "تمّ تسجيل الخروج."
    },
    "shared": {
      "links": {
        "back": "عودة",
        "didn_t_receive_confirmation_instructions": "ألم تستلم تعليمات التأكيد؟",
        "didn_t_receive_unlock_instructions": "ألم تستلم تعليمات فك الحظر؟",
        "forgot_your_password": "هل نسيت كلمة المرور؟",
        "sign_in": "سجّلْ الدخول",
        "sign_in_with_provider": "سجّلْ الدخول عن طريق %{provider}",
        "sign_up": "سجّلْ"
      }
    },
    "unlocks": {
      "new": {
        "resend_unlock_instructions": "أعدْ إرسال تعليمات فك الحظر"
      },
      "send_instructions": "خلال بضعة دقائق، سوف تصل رسالة بالتعليمات اللازمة لإعادة تفعيل الحساب.",
      "send_paranoid_instructions": "إذا كان الحساب موجوداً، ستصل رسالة خلال دقائق تتضمّن الارشادات عن كيفيّة التفعيل.  ",
      "unlocked": "لقد تمّ فتح الحساب بنجاح. الرجاء الدخول للاستمرار."
    },
    "users": {
      "passwords": {
        "new": {
          "submit": "Send me instructions",
          "tabs": {
            "register": "Register",
            "sign_in": "Sign In"
          }
        }
      },
      "registrations": {
        "new": {
          "submit": "Register",
          "tabs": {
            "register": "Register",
            "sign_in": "Sign In"
          }
        }
      },
      "sessions": {
        "new": {
          "forgot_password": "Forgot password?",
          "keep_sign_in": "Yes, Keep me signed in",
          "submit": "Sign In",
          "tabs": {
            "register": "Register",
            "sign_in": "Sign In"
          }
        }
      }
    }
  },
  "errors": {
    "connection_refused": "Oops! Failed to connect to the Web Console middleware.\nPlease make sure a rails development server is running.\n",
    "format": "%{attribute} %{message}",
    "messages": {
      "accepted": "must be accepted",
      "allowed_file_content_types": "file should be one of %{types}",
      "already_confirmed": "الحساب مُفعّل، الرجاء محاولة تسجيل الدخول",
      "blank": "can't be blank",
      "carrierwave_download_error": "could not be downloaded",
      "carrierwave_integrity_error": "is not of an allowed file type",
      "carrierwave_processing_error": "failed to be processed",
      "confirmation": "doesn't match %{attribute}",
      "confirmation_period_expired": "بحاجة الى تفعيل خلال %{period}، الرجاء طلب تفعيل ",
      "empty": "can't be empty",
      "equal_to": "must be equal to %{count}",
      "even": "must be even",
      "excluded_file_content_types": "file cannot be %{types}",
      "exclusion": "is reserved",
      "expired": "انتهت الصلاحيّة، الرجاء عمل طلب جديد",
      "extension_black_list_error": "You are not allowed to upload %{extension} files, prohibited types: %{prohibited_types}",
      "extension_white_list_error": "You are not allowed to upload %{extension} files, allowed types: %{allowed_types}",
      "file_size_is_greater_than": "file size must be greater than %{count}",
      "file_size_is_greater_than_or_equal_to": "file size must be greater than or equal to %{count}",
      "file_size_is_in": "file size must be between %{min} and %{max}",
      "file_size_is_less_than": "file size must be less than %{count}",
      "file_size_is_less_than_or_equal_to": "file size must be less than or equal to %{count}",
      "greater_than": "must be greater than %{count}",
      "greater_than_or_equal_to": "must be greater than or equal to %{count}",
      "inclusion": "is not included in the list",
      "invalid": "is invalid",
      "less_than": "must be less than %{count}",
      "less_than_or_equal_to": "must be less than or equal to %{count}",
      "mime_types_processing_error": "Failed to process file with MIME::Types, maybe not valid content-type? Original Error: %{e}",
      "mini_magick_processing_error": "Failed to manipulate with MiniMagick, maybe it is not an image? Original Error: %{e}",
      "model_invalid": "Validation failed: %{errors}",
      "not_a_number": "is not a number",
      "not_an_integer": "must be an integer",
      "not_found": "غير موجود",
      "not_locked": "غير مقفل",
      "not_saved": {
        "few": "%{count} مشكلة منعت %{resource} من التخزين بنجاح.",
        "many": "%{count} مشاكل منعت %{resource} من التخزين بنجاح.",
        "one": "مشكلة واحدة منعت %{resource} من التخزين بنجاح.",
        "other": "%{count} مشكلة منعت %{resource} من التخزين بنجاح.",
        "two": "مشكلتين منعتا %{resource} من التخزين بنجاح.",
        "zero": null
      },
      "odd": "must be odd",
      "other_than": "must be other than %{count}",
      "present": "must be blank",
      "required": "must exist",
      "rmagick_processing_error": "Failed to manipulate with rmagick, maybe it is not an image? Original Error: %{e}",
      "taken": "has already been taken",
      "too_long": {
        "one": "is too long (maximum is 1 character)",
        "other": "is too long (maximum is %{count} characters)"
      },
      "too_short": {
        "one": "is too short (minimum is 1 character)",
        "other": "is too short (minimum is %{count} characters)"
      },
      "wrong_length": {
        "one": "is the wrong length (should be 1 character)",
        "other": "is the wrong length (should be %{count} characters)"
      }
    },
    "unacceptable_request": "A supported version is expected in the Accept header.\n",
    "unavailable_session": "Session %{id} is is no longer available in memory.\n\nIf you happen to run on a multi-process server (like Unicorn or Puma) the process\nthis request hit doesn't store %{id} in memory. Consider turning the number of\nprocesses/workers to one (1) or using a different server in development.\n"
  },
  "flash": {
    "actions": {
      "create": {
        "notice": "%{resource_name} was successfully created."
      },
      "destroy": {
        "alert": "%{resource_name} could not be destroyed.",
        "notice": "%{resource_name} was successfully destroyed."
      },
      "update": {
        "notice": "%{resource_name} was successfully updated."
      }
    }
  },
  "helpers": {
    "page_entries_info": {
      "more_pages": {
        "display_entries": "Displaying %{entry_name} <b>%{first}&nbsp;-&nbsp;%{last}</b> of <b>%{total}</b> in total"
      },
      "one_page": {
        "display_entries": {
          "one": "Displaying <b>1</b> %{entry_name}",
          "other": "Displaying <b>all %{count}</b> %{entry_name}",
          "zero": "No %{entry_name} found"
        }
      }
    },
    "select": {
      "prompt": "Please select"
    },
    "submit": {
      "create": "Create %{model}",
      "submit": "Save %{model}",
      "update": "Update %{model}"
    }
  },
  "home": {
    "survey_instructions": {
      "title": "Instructions"
    }
  },
  "i18n_tasks": {
    "add_missing": {
      "added": {
        "one": "Added %{count} key",
        "other": "Added %{count} keys"
      }
    },
    "cmd": {
      "args": {
        "default_text": "Default: %{value}",
        "desc": {
          "confirm": "Confirm automatically",
          "data_format": "Data format: %{valid_text}.",
          "key_pattern": "Filter by key pattern (e.g. 'common.*')",
          "key_pattern_to_rename": "Full key (pattern) to rename. Required",
          "locale": "i18n_tasks.common.locale",
          "locale_to_translate_from": "Locale to translate from",
          "locales_filter": "Locale(s) to process. Special: base",
          "missing_types": "Filter by types: %{valid}",
          "new_key_name": "New name, interpolates original name as %{key}. Required",
          "nostdin": "Do not read from stdin",
          "out_format": "Output format: %{valid_text}",
          "pattern_router": "Use pattern router: keys moved per config data.write",
          "strict": "Avoid inferring dynamic key usages such as t(\"cats.#{cat}.name\"). Takes precedence over the config setting if set.",
          "value": "Value. Interpolates: %{value}, %{human_key}, %{key}, %{default}, %{value_or_human_key}, %{value_or_default_or_human_key}"
        }
      },
      "desc": {
        "add_missing": "add missing keys to locale data",
        "config": "display i18n-tasks configuration",
        "data": "show locale data",
        "data_merge": "merge locale data with trees",
        "data_remove": "remove keys present in tree from data",
        "data_write": "replace locale data with tree",
        "eq_base": "show translations equal to base value",
        "find": "show where keys are used in the code",
        "gem_path": "show path to the gem",
        "health": "is everything OK?",
        "irb": "start REPL session within i18n-tasks context",
        "missing": "show missing translations",
        "normalize": "normalize translation data: sort and move to the right files",
        "remove_unused": "remove unused keys",
        "translate_missing": "translate missing keys with Google Translate",
        "tree_convert": "convert tree between formats",
        "tree_filter": "filter tree by key pattern",
        "tree_merge": "merge trees",
        "tree_rename_key": "rename tree node",
        "tree_set_value": "set values of keys, optionally match a pattern",
        "tree_subtract": "tree A minus the keys in tree B",
        "tree_translate": "Google Translate a tree to root locales",
        "unused": "show unused translations",
        "xlsx_report": "save missing and unused translations to an Excel file"
      },
      "encourage": [
        "Good job!",
        "Well done!",
        "Perfect!"
      ],
      "enum_list_opt": {
        "invalid": "%{invalid} is not in: %{valid}."
      },
      "enum_opt": {
        "invalid": "%{invalid} is not one of: %{valid}."
      },
      "errors": {
        "invalid_format": "invalid format: %{invalid}. valid: %{valid}.",
        "invalid_locale": "invalid locale: %{invalid}",
        "invalid_missing_type": {
          "one": "invalid type: %{invalid}. valid: %{valid}.",
          "other": "unknown types: %{invalid}. valid: %{valid}."
        },
        "pass_forest": "pass locale forest"
      }
    },
    "common": {
      "base_value": "Base Value",
      "continue_q": "Continue?",
      "key": "Key",
      "locale": "Locale",
      "n_more": "%{count} more",
      "type": "Type",
      "value": "Value"
    },
    "data_stats": {
      "text": "has %{key_count} keys across %{locale_count} locales. On average, values are %{value_chars_avg} characters long, keys have %{key_segments_avg} segments, a locale has %{per_locale_avg} keys.",
      "text_single_locale": "has %{key_count} keys in total. On average, values are %{value_chars_avg} characters long, keys have %{key_segments_avg} segments.",
      "title": "Forest (%{locales})"
    },
    "google_translate": {
      "errors": {
        "no_api_key": "Set Google API key via GOOGLE_TRANSLATE_API_KEY environment variable or translation.api_key in config/i18n-tasks.yml. Get the key at https://code.google.com/apis/console.",
        "no_results": "Google Translate returned no results. Make sure billing information is set at https://code.google.com/apis/console."
      }
    },
    "health": {
      "no_keys_detected": "No keys detected. Check data.read in config/i18n-tasks.yml."
    },
    "missing": {
      "details_title": "Value in other locales or source",
      "none": "No translations are missing."
    },
    "remove_unused": {
      "confirm": {
        "one": "%{count} translation will be removed from %{locales}.",
        "other": "%{count} translation will be removed from %{locales}."
      },
      "noop": "No unused keys to remove",
      "removed": "Removed %{count} keys"
    },
    "translate_missing": {
      "translated": "Translated %{count} keys"
    },
    "unused": {
      "none": "Every translation is in use."
    },
    "usages": {
      "none": "No key usages found."
    }
  },
  "languages": {
    "ar": "Arabic",
    "cn": "Chinese",
    "de": "German",
    "en": "English",
    "es": "Spanish",
    "fr": "French"
  },
  "layouts": {
    "users": {
      "dashboard": "Dashboard",
      "help": "Help",
      "logout": "Log Out",
      "menu": "Menu",
      "notifications": "Notifications",
      "profile": "Profile"
    }
  },
  "managers": {
    "assigns": {
      "index": {
        "title": "Assessments and Reporting Centre"
      },
      "list": {
        "action": "Action",
        "assessment_name": "Assessment Name",
        "assessment_type": "Assessment Type",
        "completion_date": "Completion Date",
        "name": "Name",
        "status": "Completion Status"
      },
      "resource": {
        "email": "Email",
        "save": "Save in PDF",
        "view": "View"
      }
    },
    "dashboard": {
      "index": {
        "assessment_center": "Assessment / Report Centre",
        "notification_center": "Notification Centre",
        "notifications": "Notifications",
        "relationships": "Company Relationships",
        "reporting": "Reporting",
        "statistics": "Statistics"
      }
    },
    "notifications": {
      "index": {
        "subtitle": "Notifications",
        "title": "Notification Centre"
      }
    },
    "reports": {
      "show": {
        "export_pdf": "Export to PDF",
        "header": "Report"
      }
    },
    "statistics": {
      "index": {
        "title": "Statistics"
      }
    },
    "users": {
      "index": {
        "title": "Company Relationships"
      }
    }
  },
  "no": "No",
  "number": {
    "currency": {
      "format": {
        "delimiter": ",",
        "format": "%u%n",
        "precision": 2,
        "separator": ".",
        "significant": false,
        "strip_insignificant_zeros": false,
        "unit": "$"
      }
    },
    "format": {
      "delimiter": ",",
      "precision": 3,
      "separator": ".",
      "significant": false,
      "strip_insignificant_zeros": false
    },
    "human": {
      "decimal_units": {
        "format": "%n %u",
        "units": {
          "billion": "Billion",
          "million": "Million",
          "quadrillion": "Quadrillion",
          "thousand": "Thousand",
          "trillion": "Trillion",
          "unit": ""
        }
      },
      "format": {
        "delimiter": "",
        "precision": 3,
        "significant": true,
        "strip_insignificant_zeros": true
      },
      "storage_units": {
        "format": "%n %u",
        "units": {
          "byte": {
            "one": "Byte",
            "other": "Bytes"
          },
          "eb": "EB",
          "gb": "GB",
          "kb": "KB",
          "mb": "MB",
          "pb": "PB",
          "tb": "TB"
        }
      }
    },
    "percentage": {
      "format": {
        "delimiter": "",
        "format": "%n%"
      }
    },
    "precision": {
      "format": {
        "delimiter": ""
      }
    }
  },
  "profiles": {
    "edit": {
      "header": "Profile Settings"
    },
    "update": {
      "successfully": "Profile updated"
    }
  },
  "ransack": {
    "all": "all",
    "and": "and",
    "any": "any",
    "asc": "ascending",
    "attribute": "attribute",
    "combinator": "combinator",
    "condition": "condition",
    "desc": "descending",
    "or": "or",
    "predicate": "predicate",
    "predicates": {
      "blank": "is blank",
      "cont": "contains",
      "cont_all": "contains all",
      "cont_any": "contains any",
      "does_not_match": "doesn't match",
      "does_not_match_all": "doesn't match all",
      "does_not_match_any": "doesn't match any",
      "end": "ends with",
      "end_all": "ends with all",
      "end_any": "ends with any",
      "eq": "equals",
      "eq_all": "equals all",
      "eq_any": "equals any",
      "false": "is false",
      "gt": "greater than",
      "gt_all": "greater than all",
      "gt_any": "greater than any",
      "gteq": "greater than or equal to",
      "gteq_all": "greater than or equal to all",
      "gteq_any": "greater than or equal to any",
      "in": "in",
      "in_all": "in all",
      "in_any": "in any",
      "lt": "less than",
      "lt_all": "less than all",
      "lt_any": "less than any",
      "lteq": "less than or equal to",
      "lteq_all": "less than or equal to all",
      "lteq_any": "less than or equal to any",
      "matches": "matches",
      "matches_all": "matches all",
      "matches_any": "matches any",
      "not_cont": "doesn't contain",
      "not_cont_all": "doesn't contain all",
      "not_cont_any": "doesn't contain any",
      "not_end": "doesn't end with",
      "not_end_all": "doesn't end with all",
      "not_end_any": "doesn't end with any",
      "not_eq": "not equal to",
      "not_eq_all": "not equal to all",
      "not_eq_any": "not equal to any",
      "not_in": "not in",
      "not_in_all": "not in all",
      "not_in_any": "not in any",
      "not_null": "is not null",
      "not_start": "doesn't start with",
      "not_start_all": "doesn't start with all",
      "not_start_any": "doesn't start with any",
      "null": "is null",
      "present": "is present",
      "start": "starts with",
      "start_all": "starts with all",
      "start_any": "starts with any",
      "true": "is true"
    },
    "search": "search",
    "sort": "sort",
    "value": "value"
  },
  "reports": {
    "modules": {
      "common": {
        "almost_always": "Almost Always",
        "less_typical": "Less Typical",
        "moderate": "Moderate",
        "more_typical": "More Typical",
        "rare": "Rare"
      },
      "cpi_occupations": {
        "occupations": "Occupations",
        "your_potential_suitability": "Your Potential Suitability"
      },
      "gap_assessment": {
        "gap": "Gap",
        "item": "Item",
        "negative_gap": "Negative Gap",
        "positive_gap": "Positive Gap",
        "rank": "Rank",
        "scoring_category": "Scoring Category"
      },
      "highest_lowest": {
        "bottom_5": "BOTTOM 5",
        "email": "Email",
        "first_name": "First Name",
        "highest_scores": "Highest Scores",
        "item": "Item",
        "last_name": "Last Name",
        "lowest_scores": "Lowest Scores",
        "mean_score": "Mean Score",
        "rank": "Rank",
        "score": "Score",
        "sub_competenties": "Sub-Competencies",
        "top_5": "TOP 5"
      },
      "potential_career_full": {
        "bachelors_or_masters_qualification": "Bachelors or Masters Qualification",
        "detailed_career_guide": "Detailed Career Guide",
        "diploma_qualification": "Diploma Qualification",
        "education_level": "Education Level",
        "high_school_entry_roles": "High School Entry Roles",
        "key_career_tracks_within": "Key Career Tracks Within",
        "potential_areas_of_study": "Potential Areas of Study",
        "potential_roles": "Potential Roles"
      },
      "potential_career_short": {
        "career": "career",
        "for_this": "for this",
        "key": "key",
        "strengths": "strengths",
        "your_scores": "Your Scores"
      }
    },
    "show": {
      "export_pdf": "Export to PDF",
      "header": "Report"
    }
  },
  "simple_form": {
    "error_notification": {
      "default_message": "Please review the problems below:"
    },
    "no": "No",
    "placeholders": {
      "administrator": {
        "active": "Active",
        "created_at": "Created Date",
        "current_password": "Current password",
        "disabled": "Disable",
        "email": "Email Address",
        "first_name": "First Name",
        "id": "ID",
        "last_name": "Last Name",
        "manage_client_ids": "Memberships",
        "memberships": "Memberships",
        "password": "Password",
        "password_confirmation": "Password confirmation",
        "role": "Role",
        "roles": {
          "admin": "Client Admin",
          "manager": "Manager",
          "member": "User",
          "super_admin": "Super Admin",
          "superadmin": "Super Admin"
        },
        "types": {
          "anonymous": "Anonymous Users",
          "identified": "Identified Users"
        },
        "updated_at": "Modified Date"
      },
      "assessment": {
        "active": "Active",
        "categories": {
          "360": "360 Feedback",
          "organisational": "Org Surveys",
          "psychometric": "Psychometrics"
        },
        "category": "Category",
        "completed_at": "Completion Date",
        "created_at": "Created Date",
        "description": "Description",
        "id": "ID",
        "name": "Name",
        "statuses": {
          "completed": "Completed",
          "in_progress": "In Progress",
          "not_started": "New"
        },
        "timing": "Timing",
        "updated_at": "Modified Date"
      },
      "block": {
        "active": "Active",
        "assign_to_assessment_ids": "Assessments",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "client": {
        "category": "Category",
        "created_at": "Created Date",
        "id": "ID",
        "licenses": "License number",
        "licenses_expire": "License expire",
        "licenses_used": "Used license number",
        "logo": "Client logo",
        "name": "Name",
        "subdomain": "Subdomain",
        "updated_at": "Modified Date"
      },
      "dimension": {
        "active": "Active",
        "created_at": "Created Date",
        "factors_count": "No. of Factors",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "factor": {
        "active": "Active",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "parent_id": "Parent",
        "questions_count": "No. Questions",
        "subfactors_count": "No. Sub-Factors",
        "updated_at": "Modified Date"
      },
      "memebrship": {
        "id": "ID",
        "parent": "Direct Manager"
      },
      "norm": {
        "active": "Active",
        "bachelors_or_masters_qualification": "Bachelors or Masters Qualification",
        "created_at": "Created Date",
        "description": "Description",
        "diploma_qualification": "Diploma Qualification",
        "full_description": "Full Description",
        "high_school_entry_roles": "High School Entry Roles",
        "id": "ID",
        "key_career_tracks": "Key Career Tracks",
        "name": "Name",
        "potential_areas_of_study": "Potential Areas of Study",
        "updated_at": "Modified Date",
        "updated_by": "Edited by"
      },
      "question": {
        "active": "Active",
        "assign_to_assessment_ids": "Assessments",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "user": {
        "active": "Active",
        "created_at": "Created Date",
        "current_password": "Current password",
        "disabled": "Disable",
        "email": "Email Address",
        "first_name": "First Name",
        "id": "ID",
        "last_name": "Last Name",
        "manage_client_ids": "Memberships",
        "memberships": "Memberships",
        "password": "Password",
        "password_confirmation": "Password confirmation",
        "role": "Role",
        "roles": {
          "admin": "Client Admin",
          "manager": "Manager",
          "member": "User",
          "super_admin": "Super Admin",
          "superadmin": "Super Admin"
        },
        "types": {
          "anonymous": "Anonymous Users",
          "identified": "Identified Users"
        },
        "updated_at": "Modified Date"
      }
    },
    "required": {
      "mark": "*",
      "text": "required"
    },
    "yes": "Yes"
  },
  "support": {
    "array": {
      "last_word_connector": ", and ",
      "two_words_connector": " and ",
      "words_connector": ", "
    }
  },
  "time": {
    "am": "am",
    "formats": {
      "date": "%d/%m/%y",
      "default": "%a, %d %b %Y %H:%M:%S %z",
      "devise": {
        "mailer": {
          "invitation_instructions": {
            "accept_until_format": "%B %d, %Y %I:%M %p"
          }
        }
      },
      "long": "%B %d, %Y %H:%M",
      "short": "%d %b %Y / %H:%M"
    },
    "pm": "pm"
  },
  "validations": {
    "character_range": "Your response must be at least %{min} and no more than %{max} characters.",
    "date": "Your response must be a valid date (dd/mm/yyyy)",
    "each_group_contains": "Each group needs to contain not less than %{min} and not more than %{max} items",
    "email": "Your response must be a valid email",
    "issue": "Issue",
    "least": "Please answer at least %{min} choice(s).",
    "least_hotspot": "Please answer at least %{min} choice(s).",
    "max_length": "Your response must be no more than %{max} characters.",
    "min_length": "Your response must be at least %{min} characters.",
    "must_rank_between": "Please assign a value from %{min} to %{max} for each item. Values may not be repeated.",
    "must_select": "Please select from %{min} to %{max} choices",
    "number": "Your response must be a number",
    "range": "Please answer at least %{min} and no more than %{max} choice(s).",
    "text": "Your response must not contain a numbers",
    "title": "Sorry, you cannot continue until you correct the following:"
  },
  "views": {
    "pagination": {
      "first": "&laquo; First",
      "last": "Last &raquo;",
      "next": "Next &rsaquo;",
      "previous": "&lsaquo; Prev",
      "truncate": "&hellip;"
    }
  },
  "yes": "Yes"
});
I18n.translations["de"] = I18n.extend((I18n.translations["de"] || {}), {
  "activerecord": {
    "attributes": {
      "assessment": {
        "active": "Active",
        "categories": {
          "360": "360 Feedback",
          "organisational": "Org Surveys",
          "psychometric": "Psychometrics"
        },
        "category": "Category",
        "created_at": "Created Date",
        "description": "Description",
        "id": "ID",
        "name": "Name",
        "timing": "Timing",
        "updated_at": "Modified Date"
      },
      "assign": {
        "completed_at": "Completion Date",
        "statuses": {
          "completed": "Completed",
          "in_progress": "In Progress",
          "not_started": "New"
        }
      },
      "block": {
        "active": "Active",
        "assign_to_assessment_ids": "Assessments",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "client": {
        "category": "Category",
        "created_at": "Created Date",
        "id": "ID",
        "licenses": "License number",
        "licenses_expire": "License expire",
        "licenses_used": "Used license number",
        "logo": "Client logo",
        "name": "Name",
        "subdomain": "Subdomain",
        "updated_at": "Modified Date"
      },
      "dimension": {
        "active": "Active",
        "created_at": "Created Date",
        "factors_count": "No. of Factors",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "factor": {
        "active": "Active",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "parent_id": "Parent",
        "questions_count": "No. Questions",
        "subfactors_count": "No. Sub-Factors",
        "updated_at": "Modified Date"
      },
      "membership": {
        "parent_id": "Direct Manager"
      },
      "memebrship": {
        "id": "ID",
        "parent": "Direct Manager"
      },
      "norm": {
        "active": "Active",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date",
        "updated_by": "Edited by"
      },
      "occupation": {
        "active": "Active",
        "bachelors_or_masters_qualification": "Bachelors or Masters Qualification",
        "created_at": "Created Date",
        "description": "Description",
        "diploma_qualification": "Diploma Qualification",
        "full_description": "Full Description",
        "high_school_entry_roles": "High School Entry Roles",
        "id": "ID",
        "key_career_tracks": "Key Career Tracks",
        "name": "Name",
        "potential_areas_of_study": "Potential Areas of Study",
        "updated_at": "Modified Date"
      },
      "occupations_factor": {
        "active": "Active",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "question": {
        "active": "Active",
        "assign_to_assessment_ids": "Assessments",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "user": {
        "active": "Active",
        "created_at": "Created Date",
        "current_password": "Bisheriges Passwort",
        "disabled": "Disable",
        "email": "E-Mail",
        "first_name": "First Name",
        "id": "ID",
        "last_name": "Last Name",
        "manage_client_ids": "Memberships",
        "memberships": "Memberships",
        "password": "Passwort",
        "password_confirmation": "Passwortbestätigung",
        "remember_me": "Angemeldet bleiben",
        "reset_password_token": "Passwort-Zurücksetzen-Token",
        "role": "Role",
        "roles": {
          "admin": "Client Admin",
          "manager": "Manager",
          "member": "User",
          "super_admin": "Super Admin",
          "superadmin": "Super Admin"
        },
        "types": {
          "anonymous": "Anonymous Users",
          "identified": "Identified Users"
        },
        "unlock_token": "Entsperrungs-Token",
        "updated_at": "Modified Date"
      }
    },
    "errors": {
      "messages": {
        "not_uniqueness": "Assign has already been taken",
        "record_invalid": "Validation failed: %{errors}",
        "restrict_dependent_destroy": {
          "has_many": "Cannot delete record because dependent %{record} exist",
          "has_one": "Cannot delete record because a dependent %{record} exists"
        }
      },
      "models": {
        "factors_norm": {
          "score_from_must_be_number": "Score from must be number",
          "score_to_less_than_score_from": "Score to is less than Score from",
          "score_to_must_be_number": "Score to must be number"
        }
      }
    },
    "models": {
      "assessment": "Assessments",
      "assign": "Assigns",
      "block": "Block",
      "client": "Clients",
      "dimension": "Dimensions",
      "factor": "Factors",
      "factors_norm": "factors_norms",
      "membership": "Memebrship",
      "memebrship": "Memebrship",
      "norm": "Norms",
      "occupation": "Occupations",
      "occupations_factor": "Occupations",
      "question": "Question",
      "user": "Benutzer"
    }
  },
  "administration": {
    "actions": "Actions",
    "active": "Active",
    "administrator": {
      "passwords": {
        "edit": {
          "submit": "Set new password",
          "title": "Change your password"
        },
        "new": {
          "back": "Return back",
          "submit": "Send me instructions",
          "title": "Forgot your password?"
        }
      },
      "sessions": {
        "new": {
          "forgot_password": "Forgot your password?",
          "submit": "Login",
          "title": "<strong>Welcome</strong>, Please login"
        }
      },
      "shared": {
        "links": {
          "about": "About",
          "app_name": "© 2016 AppName",
          "contact_us": "Contact Us",
          "privacy": "Privacy"
        }
      }
    },
    "any": " - Any - ",
    "assessments": {
      "assigns": {
        "default": {
          "filter": "Filter",
          "filter_form": "Filter form",
          "next": "Next",
          "previous": "Previous",
          "title": "Assign %{name} Assessment"
        },
        "finish": {
          "show": {
            "filter": "Filter",
            "filter_form": "Filter form",
            "next": "Next",
            "previous": "Previous",
            "title": "Assign %{name} Assessment"
          }
        },
        "step1": {
          "show": {
            "filter": "Filter",
            "filter_form": "Filter form",
            "next": "Next",
            "previous": "Previous",
            "title": "Assign %{name} Assessment"
          }
        },
        "step2": {
          "show": {
            "filter": "Filter",
            "filter_form": "Filter form",
            "next": "Next",
            "not_selected_users": "Not Selected Users",
            "previous": "Previous",
            "selected_users": "Selected Users",
            "title": "Assign %{name} Assessment"
          },
          "users": {
            "filter": "Filter",
            "filter_form": "Filter form",
            "next": "Next",
            "previous": "Previous",
            "title": "Assign %{name} Assessment"
          }
        }
      },
      "copy": {
        "error": "Assessment #%{name} was not copied.",
        "successfully": "Assessment %{name} was successfully copied."
      },
      "create": {
        "successfully": "Assessment %{name} was successfully created."
      },
      "dashboard": "Assessment Dashboard",
      "destroy": {
        "successfully": "Assessment %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit assessment"
      },
      "form": {
        "categories": {
          "360": "360 Feedback",
          "all": "All Categories",
          "organisational": "Org Surveys",
          "psychometric": "Psychometrics"
        },
        "timing": {
          "hint": "For Example: 30 minutes to complete"
        }
      },
      "index": {
        "filterrific": {
          "with_category": {
            "360": "360 Feedback",
            "all": "All Categories",
            "organisational": "Org Surveys",
            "psychometric": "Psychometrics"
          }
        },
        "title": "Assessments",
        "tooltips": {
          "create": "Create"
        }
      },
      "new": {
        "header": "New assessment"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Assessment?</p>\n",
            "title": "Delete <strong>Assessment</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Assessment?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Assessment",
          "delete": "Delete Assessment",
          "edit": "Edit Assessment"
        }
      },
      "sidebar": {
        "assign": "Assign Assessment",
        "copy": "Copy Assessment",
        "destroy": "Delete Assessment",
        "disable": "Disable",
        "edit": "Edit Assessment",
        "enable": "Enable",
        "new": "New Assessment",
        "preview": "Preview Assessment",
        "title": "Assessment's options (#%{id})"
      },
      "toggle_status": {
        "successfully": "Assessment %{name} was successfully updated."
      },
      "update": {
        "successfully": "Assessment %{name} was successfully updated."
      }
    },
    "assigns": {
      "create": {
        "successfully": "New assign to assessment was successfully created"
      },
      "destroy": {
        "successfully": "Assign to assessment was successfully destroy"
      },
      "index": {
        "title": "Reports"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this assign?</p>",
            "title": "Delete <strong>%{name}</strong> ?"
          }
        }
      }
    },
    "back": "Back",
    "base": {
      "top_sidebar": {
        "search": "Search...",
        "sign_out_message": {
          "body": "<p>Are you sure you want to log out?</p> <p>Press No if you want to continue work. Press Yes to logout current user.</p>",
          "title": "Log <strong>Out</strong> ?"
        }
      }
    },
    "blocks": {
      "destroy": {
        "successfully": "Block %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit Block"
      },
      "new": {
        "header": "New Block"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Block?</p>\n",
            "title": "Delete <strong>Block</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Block?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        }
      }
    },
    "breadcrumbs": {
      "assessments": "Assessments",
      "client": "Client Tenancy",
      "clients": "Client Tenancies",
      "communication_center": "Communication Center",
      "create": "Create",
      "design": "Design",
      "dimension": "Dimension",
      "dimensions": "Dimensions",
      "factors": "Factors",
      "home": "Dashboard",
      "libraries": "Media Library",
      "norm": "Norm",
      "norms": "Norms",
      "norms_editor": "Norm Editor",
      "occupations": "Occupations",
      "occupations_factors": "Factors",
      "psychometrics": "Psychometrics",
      "question_center": "Question Center",
      "reports": "Reports",
      "statistics": "Statistics",
      "sub_factors": "Sub-Factors",
      "survey": "Survey",
      "surveys": "Surveys",
      "users": "Users",
      "users_add": "Add New",
      "users_import": "Import"
    },
    "cable": {
      "notification": {
        "assessment_factors": "Factors are fetched",
        "assessment_update": "Assessment is updated",
        "block_clone": "Block is copied",
        "block_create": "Block %{name} is created",
        "block_create_by_template": "Block was loaded from template",
        "block_destroy": "Block has been deleted",
        "block_move_down": "Block %{name} is moved down",
        "block_move_up": "Block %{name} is moved up",
        "block_permanent_destroy": "Block is permanent destroyed",
        "block_rename": "Block is renamed",
        "block_restore": "Block is restored",
        "block_save_as_template": "Block saved as template",
        "block_unlink_template": "Block was unlinked",
        "block_update": "Block is updated",
        "comment_create": "Comment is created",
        "comment_destroy": "Comment has been deleted",
        "geo_filter": "Data filtered",
        "module_create": "Module %{name} is created",
        "module_destroy": "Module has been deleted",
        "module_insert_after": "Module is inserted after",
        "module_insert_before": "Module is inserted before",
        "module_move_down": "Module is moved down",
        "module_move_up": "Module is moved up",
        "module_rename": "Module is renamed",
        "module_update": "Module is updated",
        "page_create": "Page %{name} is created",
        "page_destroy": "Page has been deleted",
        "page_move_down": "Page %{name} is moved down",
        "page_move_up": "Page %{name} is moved up",
        "page_rename": "Page is renamed",
        "page_update": "Page is updated",
        "question_clone": "Question is copied",
        "question_create": "Question %{name} is created",
        "question_create_by_template": "Question was loaded from template",
        "question_create_from_template": "Question is created from template",
        "question_destroy": "Question has been deleted",
        "question_insert_after": "Question is inserted after",
        "question_insert_before": "Question is inserted before",
        "question_move_down": "Question is moved down",
        "question_move_up": "Question is moved up",
        "question_permanent_destroy": "Question is permanent destroyed",
        "question_rename": "Question is renamed",
        "question_restore": "Question is restored",
        "question_save_as_template": "Question saved as template",
        "question_unlink_template": "Question was unlinked",
        "question_update": "Question is updated",
        "report_change_filters": "Filters are updated",
        "report_update": "Report is updated",
        "scoring_update": "Scoring is updated",
        "trash_empty": "Trash Comment empty"
      }
    },
    "choose": " - Choose - ",
    "clear": "Clear",
    "clients": {
      "assessments": {
        "assigns": {
          "default": {
            "filter": "Filter",
            "filter_form": "Filter form",
            "next": "Next",
            "previous": "Previous",
            "title": "Assign %{name} Assessment"
          },
          "finish": {
            "show": {
              "filter": "Filter",
              "filter_form": "Filter form",
              "next": "Next",
              "previous": "Previous",
              "title": "Assign %{name} Assessment"
            }
          },
          "step1": {
            "show": {
              "filter": "Filter",
              "filter_form": "Filter form",
              "next": "Next",
              "previous": "Previous",
              "title": "Assign %{name} Assessment"
            }
          },
          "step2": {
            "show": {
              "filter": "Filter",
              "filter_form": "Filter form",
              "next": "Next",
              "not_selected_users": "Not Selected Users",
              "previous": "Previous",
              "selected_users": "Selected Users",
              "title": "Assign %{name} Assessment"
            },
            "users": {
              "filter": "Filter",
              "filter_form": "Filter form",
              "next": "Next",
              "previous": "Previous",
              "title": "Assign %{name} Assessment"
            }
          }
        },
        "copy": {
          "error": "Assessment #%{name} was not copied.",
          "successfully": "Assessment %{name} was successfully copied."
        },
        "create": {
          "successfully": "Assessment %{name} was successfully created."
        },
        "dashboard": "Assessment Dashboard",
        "destroy": {
          "successfully": "Assessment %{name} was successfully destroyed."
        },
        "edit": {
          "header": "Edit assessment"
        },
        "form": {
          "categories": {
            "360": "360 Feedback",
            "all": "All Categories",
            "organisational": "Org Surveys",
            "psychometric": "Psychometrics"
          },
          "timing": {
            "hint": "For Example: 30 minutes to complete"
          }
        },
        "index": {
          "filterrific": {
            "with_category": {
              "360": "360 Feedback",
              "all": "All Categories",
              "organisational": "Org Surveys",
              "psychometric": "Psychometrics"
            }
          },
          "title": "Assessments",
          "tooltips": {
            "create": "Create"
          }
        },
        "new": {
          "header": "New assessment"
        },
        "resource": {
          "confirmations": {
            "delete": {
              "body": "<p>Are you sure you want to delete this Assessment?</p>\n",
              "title": "Delete <strong>Assessment</strong> ?"
            },
            "toggle_status": {
              "body": "<p>Are you sure you want to %{status} this Assessment?</p>\n",
              "title": "<strong>%{status}</strong> %{name}?"
            }
          },
          "tooltips": {
            "copy": "Copy Assessment",
            "delete": "Delete Assessment",
            "edit": "Edit Assessment"
          }
        },
        "sidebar": {
          "assign": "Assign Assessment",
          "copy": "Copy Assessment",
          "destroy": "Delete Assessment",
          "disable": "Disable",
          "edit": "Edit Assessment",
          "enable": "Enable",
          "new": "New Assessment",
          "preview": "Preview Assessment",
          "title": "Assessment's options (#%{id})"
        },
        "toggle_status": {
          "successfully": "Assessment %{name} was successfully updated."
        },
        "update": {
          "successfully": "Assessment %{name} was successfully updated."
        }
      },
      "copy": {
        "error": "Client #%{name} was not copied.",
        "successfully": "Client %{name} was successfully copied."
      },
      "create": {
        "successfully": "Client %{name} was successfully created."
      },
      "designs": {
        "form": {
          "no_background": "No Background yet",
          "no_logo": "No Logo yet"
        }
      },
      "destroy": {
        "successfully": "Client %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit client"
      },
      "index": {
        "title": "Client Tenancies",
        "tooltips": {
          "create": "Create"
        }
      },
      "license": {
        "header": "%{name} - Edit license"
      },
      "new": {
        "header": "New client"
      },
      "reports": {
        "copy": {
          "error": "Report #%{id} was not copied."
        },
        "destroy": {
          "successfully": "Report %{name} was successfully destroyed."
        },
        "edit": {
          "header": "Edit Report Name"
        },
        "index": {
          "filterrific": {
            "with_assessment_category": {
              "360": "360 Feedback",
              "all": "All",
              "organisational": "Org Surveys",
              "psychometric": "Psychometrics"
            }
          },
          "title": "Reports",
          "tooltips": {
            "create": "Create"
          }
        },
        "new": {
          "header": "New Report"
        },
        "preview": {
          "export_pdf": "Export to PDF",
          "title": "Preview"
        },
        "resource": {
          "confirmations": {
            "delete": {
              "body": "<p>Are you sure you want to delete this Report?</p>\n",
              "title": "Delete <strong>Report</strong> ?"
            },
            "toggle_status": {
              "body": "<p>Are you sure you want to %{status} this Report?</p>\n",
              "title": "<strong>%{status}</strong> %{name}?"
            }
          },
          "tooltips": {
            "copy": "Copy Report",
            "delete": "Delete Report",
            "edit": "Edit Report",
            "preview": "Preview Report"
          }
        },
        "sidebar": {
          "copy": "Copy Report",
          "destroy": "Delete Report",
          "edit": "Edit Report",
          "title": "Report's options (#%{id})",
          "view": "View Report"
        },
        "toggle_status": {
          "successfully": "Report was successfully updated."
        }
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this client?</p>",
            "title": "Delete <strong>%{name}</strong> ?"
          },
          "disable": {
            "body": "<p>Are you sure you want to disable this client?</p>",
            "title": "Disable <strong>%{name}</strong> ?"
          },
          "enable": {
            "body": "<p>Are you sure you want to enable this client?</p>",
            "title": "Enable <strong>%{name}</strong> ?"
          }
        },
        "tooltips": {
          "copy": "Copy Client",
          "delete": "Delete Client",
          "edit": "Edit Client"
        }
      },
      "sidebar": {
        "copy": "Copy Client",
        "design": "Edit Design",
        "destroy": "Destroy Client",
        "disable": "Disable",
        "edit": "Edit Client",
        "enable": "Enable",
        "licenses": "Edit Licenses",
        "new": "New Client",
        "title": "Client's options (#%{id})"
      },
      "statistics": {
        "index": {
          "all_assessments": "All assessments",
          "assessment_type": "Assessment type",
          "title": "Statistics"
        }
      },
      "toggle_status": {
        "successfully": "Client %{name} was successfully updated."
      },
      "update": {
        "successfully": "Client %{name} was successfully updated."
      },
      "users": {
        "assigns": {
          "index": {
            "add": "Assign New Assessment",
            "title": "Assessments and Reporting"
          },
          "list": {
            "actions": "Actions",
            "assessment_name": "Assessment Name",
            "assessment_type": "Assessment Type",
            "reports": "Reports",
            "status": "Completion Status",
            "uniq_id": "Uniq ID"
          },
          "resource": {
            "no_access_to_reports": "No access to reports",
            "no_completed": "Not completed",
            "no_reports": "No relative reports",
            "tooltips": {
              "delete": "Delete Assign"
            }
          }
        },
        "create": {
          "successfully": "User %{name} was successfully created."
        },
        "destroy": {
          "successfully": "User %{name} was successfully destroyed."
        },
        "edit": {
          "add": "Add",
          "hris_data": "HRIS Data",
          "key": "Key",
          "personal_data": "Personal Data",
          "remove": "Remove",
          "title": "Edit user",
          "value": "Value"
        },
        "form": {
          "choose": " - Choose - "
        },
        "index": {
          "add": "Add new user",
          "export": "Export",
          "filterrific": {
            "with_role": {
              "administration": "Administrators",
              "all": "All",
              "users": "Users"
            }
          },
          "import": "Import",
          "import_hris": "HRIS Data",
          "import_users": "Users",
          "title": "Users",
          "tooltips": {
            "create": "Create",
            "export": "Export",
            "import": "Import"
          }
        },
        "new": {
          "header": "New user"
        },
        "reports": {
          "copy": {
            "error": "Report #%{id} was not copied."
          },
          "destroy": {
            "successfully": "Report %{name} was successfully destroyed."
          },
          "edit": {
            "header": "Edit Report Name"
          },
          "index": {
            "filterrific": {
              "with_assessment_category": {
                "360": "360 Feedback",
                "all": "All",
                "organisational": "Org Surveys",
                "psychometric": "Psychometrics"
              }
            },
            "title": "Reports",
            "tooltips": {
              "create": "Create"
            }
          },
          "new": {
            "header": "New Report"
          },
          "preview": {
            "export_pdf": "Export to PDF",
            "title": "Preview"
          },
          "resource": {
            "confirmations": {
              "delete": {
                "body": "<p>Are you sure you want to delete this Report?</p>\n",
                "title": "Delete <strong>Report</strong> ?"
              },
              "toggle_status": {
                "body": "<p>Are you sure you want to %{status} this Report?</p>\n",
                "title": "<strong>%{status}</strong> %{name}?"
              }
            },
            "tooltips": {
              "copy": "Copy Report",
              "delete": "Delete Report",
              "edit": "Edit Report",
              "preview": "Preview Report"
            }
          },
          "sidebar": {
            "copy": "Copy Report",
            "destroy": "Delete Report",
            "edit": "Edit Report",
            "title": "Report's options (#%{id})",
            "view": "View Report"
          },
          "toggle_status": {
            "successfully": "Report was successfully updated."
          }
        },
        "reset_password": {
          "successfully": "User  %{name} will receive an email with instructions on how to reset his (her) password in a few minutes."
        },
        "resource": {
          "confirmations": {
            "change_password": {
              "body": "<p>Are you sure you want to send instructions with link to change password?</p>\n",
              "title": "Change password <strong>%{name}</strong> ?"
            },
            "delete": {
              "body": "<p>Are you sure you want to delete this User?</p>\n",
              "title": "Delete <strong>%{name}</strong> ?"
            },
            "membership": {
              "delete": {
                "body": "<p>Are you sure you want to delete?</p>\n",
                "title": "Delete <strong>%{name}</strong> from %{client_name} Client Tenancy?"
              }
            },
            "toggle_status": {
              "body": "<p>Are you sure you want to %{status} this User?</p>\n",
              "title": "<strong>%{status}</strong> %{name}?"
            }
          },
          "tooltips": {
            "change_password": "Change password",
            "chart": "View user report",
            "delete": "Delete user",
            "edit": "Edit user",
            "mail": "Send mail",
            "sign_in": "Login as user"
          }
        },
        "sidebar": {
          "assessments_and_reports": "Assessments and Reporting",
          "destroy": "Delete User",
          "disable": "Disable",
          "edit_user": "Edit User",
          "email": "Send mail",
          "enable": "Enable",
          "export_users": "Export users",
          "import_users": "Import users",
          "login_as_user": "Login as User",
          "new_user": "New User",
          "reset_password": "Change Password",
          "title": "User's options (#%{id})"
        },
        "spoof": {
          "successfully": "You was successfully login as %{name}"
        },
        "toggle_status": {
          "successfully": "User %{name} was successfully updated."
        },
        "update": {
          "successfully": "User %{name} was successfully updated."
        }
      }
    },
    "close": "Close",
    "communications": {
      "copy": {
        "error": "Communication #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Communication %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit Communication"
      },
      "form": {
        "body_mustache": "{{first_name}} - Recipient First Name\n{{last_name}} - Recipient Last Name\n{{email}} - Recipient Email\n",
        "delivery_rules": {
          "after_complete": "Right after completion",
          "if_not_finished": "If assessment was not finished",
          "if_not_started": "If assessment is not started",
          "on_specific_datetime": "Specific date and time"
        },
        "selected_cc_recipients": "Selected CC Recipients",
        "selected_recipients": "Selected Recipients"
      },
      "index": {
        "add_new": "Add new",
        "title": "Communication Center",
        "tooltips": {
          "create": "Create"
        }
      },
      "new": {
        "header": "New Communication"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Communication?</p>\n",
            "title": "Delete <strong>Communication</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Communication?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Communication",
          "delete": "Delete Communication",
          "edit": "Edit Communication"
        }
      },
      "sidebar": {
        "copy": "Copy Communication",
        "destroy": "Delete Communication",
        "disable": "Disable Communication",
        "edit": "Edit Communication",
        "enable": "Enable Communication",
        "new": "New Communication",
        "title": "Communication's options (#%{id})",
        "view": "View Communication"
      },
      "toggle_status": {
        "successfully": "Communication was successfully updated."
      }
    },
    "copy": "Copy",
    "create": "Create",
    "dimensions": {
      "copy": {
        "error": "Dimension #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Dimension %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit Dimension Name"
      },
      "index": {
        "title": "Dimensions",
        "tooltips": {
          "create": "Create"
        }
      },
      "new": {
        "header": "New Dimension"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Dimension?</p>\n",
            "title": "Delete <strong>Dimension</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Dimension?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Dimension",
          "delete": "Delete Dimension",
          "edit": "Edit Dimension Name"
        }
      },
      "sidebar": {
        "assign": "Assign Dimension",
        "copy": "Copy Dimension",
        "destroy": "Delete Dimension",
        "disable": "Disable Dimension",
        "edit": "Edit Dimension Name",
        "enable": "Enable Dimension",
        "new": "New Dimension",
        "title": "Dimension's options (#%{id})",
        "view": "View Dimension"
      },
      "toggle_status": {
        "successfully": "Dimension was successfully updated."
      }
    },
    "disable": "Disable",
    "edit": "Edit",
    "enable": "Enable",
    "factors": {
      "copy": {
        "error": "Factor #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Factor %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit Factor Name"
      },
      "form": {
        "no_icon": "No Logo yet"
      },
      "index": {
        "icon": "Icon",
        "title": "Factors",
        "tooltips": {
          "create": "Create"
        }
      },
      "new": {
        "header": "New Factor"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Factor?</p>\n",
            "title": "Delete <strong>Factor</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Factor?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Factor",
          "delete": "Delete Factor",
          "edit": "Edit Factor Name"
        }
      },
      "sidebar": {
        "copy": "Copy Factor",
        "destroy": "Delete Factor",
        "edit": "Edit Factor Name",
        "title": "Factor's options (#%{id})",
        "view": "View Factor"
      },
      "toggle_status": {
        "successfully": "Factor was successfully updated."
      }
    },
    "genders": {
      "female": "Female",
      "male": "Male",
      "not_set": "Not set"
    },
    "home": {
      "index": {
        "notifications": "Notifications"
      }
    },
    "import": "Import",
    "imports": {
      "assessments": {
        "results": {
          "form": {
            "import": "Import"
          }
        }
      },
      "base": {
        "form": {
          "import": "Import"
        }
      },
      "errors": {
        "error": "[Row %{row}] %{error}",
        "invalid_assign": "Can't to find record for specified Result ID. If you want to create new result, please, leave Result ID column empty",
        "invalid_format": "There is no Email column",
        "norm": {
          "factor_is_not_described": "[#%{coords}] factor %{factor} is not described above",
          "factors_mismatch": "[#%{coords}] dimension %{dimension} does not have factor %{factor}",
          "not_set_dimension": "The name of the Dimension should be written in A-1",
          "sub_factors_mismatch": "[#%{coords}] dimension %{dimension} does not have sub factor %{factor}"
        },
        "result": {
          "error": "[Row %{row}] %{error}",
          "invalid_assign": "[Row %{row}] Can't to find record for specified Result ID. If you want to create new result, please, leave Result ID column empty",
          "invalid_format": "Invalid File format"
        },
        "translation": {
          "error": "[Translation %{id}] %{error}",
          "invalid_format": "Invalid File format"
        },
        "unknown_type": "Unknown file type: %{filename}",
        "user": {
          "not_found": "[Row %{row}] Couldn't find User with Email Address %{email}"
        }
      },
      "form": {
        "import": "Import"
      },
      "hris": {
        "form": {
          "import": "Import"
        }
      },
      "new": {
        "header": "Import"
      },
      "users": {
        "form": {
          "import": "Import"
        }
      }
    },
    "imports_assessments_result_imports": {
      "create": {
        "successfully": "Raw Results data was successfully imported"
      },
      "new": {
        "header": "Import Raw Results data"
      }
    },
    "imports_hris_imports": {
      "create": {
        "successfully": "HRIS data was successfully imported"
      },
      "new": {
        "header": "Import HRIS data"
      }
    },
    "imports_user_imports": {
      "create": {
        "successfully": "Users was successfully imported"
      },
      "new": {
        "header": "Import Users"
      }
    },
    "libraries": {
      "create": {
        "successfully": "Item %{name} was successfully created."
      },
      "destroy": {
        "successfully": "Item %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit"
      },
      "index": {
        "title": "Media Library"
      },
      "list": {
        "new_folder": "New folder",
        "root": "Media Library",
        "upload": "Upload new file"
      },
      "new": {
        "header": "New Report"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete %{name}?</p>\n",
            "title": "Delete <strong>%{name}</strong> ?"
          }
        },
        "tooltips": {
          "delete": "Delete",
          "edit": "Edit"
        }
      },
      "update": {
        "successfully": "Item %{name} was successfully updated."
      }
    },
    "memberships": {
      "create": {
        "successfully": "User %{name} was successfully created."
      },
      "destroy": {
        "successfully": "User %{name} was successfully destroyed."
      },
      "edit": {
        "add": "Add",
        "hris_data": "HRIS Data",
        "key": "Key",
        "personal_data": "Personal Data",
        "remove": "Remove",
        "title": "Edit user",
        "value": "Value"
      },
      "index": {
        "add": "Add new user",
        "export": "Export",
        "filterrific": {
          "with_role": {
            "administration": "Administrators",
            "all": "All",
            "users": "Users"
          }
        },
        "import": "Import",
        "import_hris": "HRIS Data",
        "import_users": "Users",
        "title": "Users",
        "tooltips": {
          "create": "Create",
          "export": "Export",
          "import": "Import"
        }
      },
      "new": {
        "header": "New user"
      },
      "reset_password": {
        "successfully": "User  %{name} will receive an email with instructions on how to reset his (her) password in a few minutes."
      },
      "spoof": {
        "successfully": "You was successfully login as %{name}"
      },
      "toggle_status": {
        "successfully": "User %{name} was successfully updated."
      },
      "update": {
        "successfully": "User %{name} was successfully updated."
      }
    },
    "meta_title": "Administration panel",
    "navigation": {
      "assessments": "Assessments",
      "client": "Client Tenancy",
      "clients": "Client Tenancies",
      "communication_center": "Communication Center",
      "create": "Create",
      "design": "Design",
      "dimension": "Dimension",
      "dimensions": "Dimensions",
      "factors": "Factors",
      "home": "Dashboard",
      "libraries": "Media Library",
      "norm": "Norm",
      "norms": "Norms",
      "norms_editor": "Norm Editor",
      "occupations": "Occupations",
      "occupations_factors": "Factors",
      "psychometrics": "Psychometrics",
      "question_center": "Question Center",
      "reports": "Reports",
      "statistics": "Statistics",
      "sub_factors": "Sub-Factors",
      "survey": "Survey",
      "surveys": "Surveys",
      "users": "Users",
      "users_add": "Add New",
      "users_import": "Import"
    },
    "new": "New",
    "no_data_found": "No data found",
    "norms": {
      "copy": {
        "error": "Norm #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Norm %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Rename Norm"
      },
      "editor": {
        "factors": "Factors",
        "inplace_title": "Enter value",
        "sub_factors": "Sub Factors",
        "title": "Norm Editor",
        "tooltips": {
          "edit": "Edit Title"
        }
      },
      "index": {
        "title": "Norms",
        "tooltips": {
          "create": "Create",
          "import": "Import"
        }
      },
      "new": {
        "header": "New norm"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Norm?</p>\n",
            "title": "Delete <strong>Norm</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Norm?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Norm",
          "delete": "Delete Norm",
          "edit": "Rename Norm"
        }
      },
      "sidebar": {
        "assign": "Assign Norm",
        "copy": "Copy Norm",
        "destroy": "Delete Norm",
        "disable": "Disable",
        "edit": "Rename Norm",
        "editor": "Norm Editor",
        "enable": "Enable",
        "export": "Export Norm",
        "import": "Import Norm",
        "new": "New Norm",
        "surveys": "Linked Surveys",
        "title": "Norm's options (#%{id})",
        "view": "View Norm"
      },
      "toggle_status": {
        "successfully": "Norm was successfully updated."
      }
    },
    "noty": {
      "error_500": "Something went wrong. Contact your administrator."
    },
    "occupations": {
      "copy": {
        "error": "Occupation #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Occupation #%{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit occupation"
      },
      "form": {
        "hint": {
          "key_career_tracks": "\"+\" - list, \"*\" - bold. Example: + *Biology* - some description..."
        }
      },
      "index": {
        "title": "Occupations",
        "tooltips": {
          "create": "Create"
        }
      },
      "new": {
        "header": "New occupation"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this occupation?</p>",
            "title": "Delete <strong>Occupation</strong> ?"
          }
        },
        "tooltips": {
          "copy": "Copy Occupation",
          "delete": "Delete Occupation",
          "edit": "Edit Occupation"
        }
      },
      "sidebar": {
        "copy": "Copy Occupation",
        "disable": "Disable",
        "edit": "Edit",
        "enable": "Enable",
        "new": "New Occupation",
        "title": "Occupation's options"
      },
      "toggle_status": {
        "successfully": "Occupation was successfully updated."
      }
    },
    "occupations_factors": {
      "copy": {
        "error": "Factor #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Factor #%{name} was successfully detached."
      },
      "edit": {
        "header": "Edit Factor"
      },
      "index": {
        "title": "Factors",
        "tooltips": {
          "create": "Create"
        }
      },
      "new": {
        "header": "Attach Factors"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this factor?</p>",
            "title": "Delete <strong>Factor</strong> ?"
          }
        },
        "tooltips": {
          "delete": "Delete Factor",
          "edit": "Edit Factor"
        }
      },
      "sidebar": {
        "disable": "Disable",
        "edit": "Edit",
        "enable": "Enable",
        "new": "Attach Factor",
        "title": "Factor's options"
      },
      "toggle_status": {
        "successfully": "Factor was successfully updated."
      }
    },
    "profiles": {
      "edit": {
        "success": "Profile was successfully updated.",
        "title": "Profile Editor"
      }
    },
    "psychometrics": "Psychometrics",
    "questions": {
      "destroy": {
        "successfully": "Question %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit Question"
      },
      "new": {
        "header": "New Question"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Question?</p>\n",
            "title": "Delete <strong>Question</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Question?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        }
      }
    },
    "reports": {
      "copy": {
        "error": "Report #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Report %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit Report Name"
      },
      "index": {
        "filterrific": {
          "with_assessment_category": {
            "360": "360 Feedback",
            "all": "All",
            "organisational": "Org Surveys",
            "psychometric": "Psychometrics"
          }
        },
        "title": "Reports",
        "tooltips": {
          "create": "Create"
        }
      },
      "new": {
        "header": "New Report"
      },
      "preview": {
        "export_pdf": "Export to PDF",
        "title": "Preview"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Report?</p>\n",
            "title": "Delete <strong>Report</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Report?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Report",
          "delete": "Delete Report",
          "edit": "Edit Report",
          "preview": "Preview Report"
        }
      },
      "sidebar": {
        "copy": "Copy Report",
        "destroy": "Delete Report",
        "edit": "Edit Report",
        "title": "Report's options (#%{id})",
        "view": "View Report"
      },
      "toggle_status": {
        "successfully": "Report was successfully updated."
      }
    },
    "search": "Search",
    "show": "Show",
    "sub_factors": {
      "copy": {
        "error": "Sub-Factor #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Sub-Factor %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit Sub-Factor Name"
      },
      "index": {
        "title": "Sub-Factors",
        "tooltips": {
          "create": "Create"
        }
      },
      "new": {
        "header": "New Sub-Factor"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Sub-Factor?</p>",
            "title": "Delete <strong>Sub-Factor</strong> ?"
          }
        },
        "tooltips": {
          "copy": "Copy Sub-Factor",
          "delete": "Delete Sub-Factor",
          "edit": "Edit Sub-Factor Name"
        }
      },
      "sidebar": {
        "destroy": "Delete Sub-Factor",
        "edit": "Edit Sub-Factor Name",
        "title": "Sub-Factor's options (#%{id})"
      },
      "toggle_status": {
        "successfully": "Sub-Factor was successfully updated."
      }
    },
    "templates": {
      "blocks": {
        "copy": {
          "error": "Block #%{name} was not copied."
        },
        "destroy": {
          "successfully": "Block %{name} was successfully destroyed."
        },
        "edit": {
          "header": "Edit Block"
        },
        "index": {
          "add": "Add New Block",
          "templates": {
          },
          "title": "Blocks",
          "tooltips": {
            "create": "Create"
          }
        },
        "new": {
          "header": "New Block"
        },
        "new_assign": {
          "header": "Assign Block to Assessments"
        },
        "resource": {
          "tooltips": {
            "copy": "Copy Block",
            "delete": "Delete Block",
            "edit": "Edit Block"
          }
        },
        "sidebar": {
          "destroy": "Delete Block",
          "disable": "Disable",
          "edit": "Edit Block",
          "enable": "Enable",
          "new": "New Block",
          "title": "Block's options (#%{id})"
        }
      },
      "questions": {
        "copy": {
          "error": "Question #%{name} was not copied."
        },
        "destroy": {
          "successfully": "Question %{name} was successfully destroyed."
        },
        "edit": {
          "header": "Edit Question"
        },
        "index": {
          "add": "Add New Question",
          "templates": {
            "blocks": "Blocks",
            "questions": "Questions"
          },
          "title": "Questions",
          "tooltips": {
            "create": "Create"
          }
        },
        "new": {
          "header": "New Question"
        },
        "new_assign": {
          "header": "Assign Question to Assessments"
        },
        "resource": {
          "tooltips": {
            "copy": "Copy Question",
            "delete": "Delete Question",
            "edit": "Edit Question"
          }
        },
        "sidebar": {
          "destroy": "Delete Question",
          "disable": "Disable",
          "edit": "Edit Question",
          "enable": "Enable",
          "new": "New Question",
          "title": "Question's options (#%{id})"
        }
      }
    },
    "translations": {
      "assessments": {
        "new": {
          "header": "Import Translations"
        }
      },
      "import": {
        "successfully": "Translations was successfully imported"
      }
    },
    "uniq_id": "Uniq ID",
    "update": "Update",
    "users": {
      "create": {
        "successfully": "User %{name} was successfully created."
      },
      "destroy": {
        "successfully": "User %{name} was successfully destroyed."
      },
      "edit": {
        "add": "Add",
        "hris_data": "HRIS Data",
        "key": "Key",
        "personal_data": "Personal Data",
        "remove": "Remove",
        "title": "Edit user",
        "value": "Value"
      },
      "form": {
        "choose": " - Choose - "
      },
      "index": {
        "add": "Add new user",
        "export": "Export",
        "filterrific": {
          "with_role": {
            "administration": "Administrators",
            "all": "All",
            "users": "Users"
          }
        },
        "import": "Import",
        "import_hris": "HRIS Data",
        "import_users": "Users",
        "title": "Users",
        "tooltips": {
          "create": "Create",
          "export": "Export",
          "import": "Import"
        }
      },
      "new": {
        "header": "New user"
      },
      "reset_password": {
        "successfully": "User  %{name} will receive an email with instructions on how to reset his (her) password in a few minutes."
      },
      "resource": {
        "confirmations": {
          "change_password": {
            "body": "<p>Are you sure you want to send instructions with link to change password?</p>\n",
            "title": "Change password <strong>%{name}</strong> ?"
          },
          "delete": {
            "body": "<p>Are you sure you want to delete this User?</p>\n",
            "title": "Delete <strong>%{name}</strong> ?"
          },
          "membership": {
            "delete": {
              "body": "<p>Are you sure you want to delete?</p>\n",
              "title": "Delete <strong>%{name}</strong> from %{client_name} Client Tenancy?"
            }
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this User?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "change_password": "Change password",
          "chart": "View user report",
          "delete": "Delete user",
          "edit": "Edit user",
          "mail": "Send mail",
          "sign_in": "Login as user"
        }
      },
      "sidebar": {
        "assessments_and_reports": "Assessments and Reporting",
        "destroy": "Delete User",
        "disable": "Disable",
        "edit_user": "Edit User",
        "email": "Send mail",
        "enable": "Enable",
        "export_users": "Export users",
        "import_users": "Import users",
        "login_as_user": "Login as User",
        "new_user": "New User",
        "reset_password": "Change Password",
        "title": "User's options (#%{id})"
      },
      "spoof": {
        "successfully": "You was successfully login as %{name}"
      },
      "toggle_status": {
        "successfully": "User %{name} was successfully updated."
      },
      "update": {
        "successfully": "User %{name} was successfully updated."
      }
    }
  },
  "assessments": {
    "decorator": {
      "no_description": "Description is empty"
    },
    "index": {
      "managers_dashboard_button": "Managers Dashboard",
      "user_dashboard_button": "User Dashboard"
    },
    "resource": {
      "assigned": "Assigned %{date}",
      "questions": {
        "one": "1 Question",
        "other": "%{count} Questions",
        "zero": "No Questions"
      },
      "results": "Results",
      "status": {
        "completed": "Completed",
        "in_progress": "Resume",
        "not_started": "Start"
      }
    }
  },
  "assigns": {
    "decorator": {
      "completed": "Completed %{date}",
      "not_completed": "Not Completed"
    },
    "notifications": {
      "completed": "%{user_name} finished assessment \"%{assessment_name}\"",
      "in_progress": "%{user_name} started to take assessment \"%{assessment_name}\""
    }
  },
  "ckeditor": {
    "buttons": {
      "cancel": "Abbrechen",
      "delete": "Löschen",
      "next": "Next",
      "upload": "Hochladen"
    },
    "confirm_delete": "Datei löschen?",
    "page_title": "CKEditor Dateimanager"
  },
  "clear_filter": "Clear Filter",
  "confirmation": {
    "default_body": "Are you sure?",
    "default_title": "Confirmation"
  },
  "date": {
    "abbr_day_names": [
      "Sun",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ],
    "abbr_month_names": [
      null,
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ],
    "day_names": [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ],
    "formats": {
      "default": "%Y-%m-%d",
      "long": "%B %d, %Y",
      "short": "%b %d"
    },
    "month_names": [
      null,
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ],
    "order": [
      "year",
      "month",
      "day"
    ]
  },
  "datetime": {
    "distance_in_words": {
      "about_x_hours": {
        "one": "about 1 hour",
        "other": "about %{count} hours"
      },
      "about_x_months": {
        "one": "about 1 month",
        "other": "about %{count} months"
      },
      "about_x_years": {
        "one": "about 1 year",
        "other": "about %{count} years"
      },
      "almost_x_years": {
        "one": "almost 1 year",
        "other": "almost %{count} years"
      },
      "half_a_minute": "half a minute",
      "less_than_x_minutes": {
        "one": "less than a minute",
        "other": "less than %{count} minutes"
      },
      "less_than_x_seconds": {
        "one": "less than 1 second",
        "other": "less than %{count} seconds"
      },
      "over_x_years": {
        "one": "over 1 year",
        "other": "over %{count} years"
      },
      "x_days": {
        "one": "1 day",
        "other": "%{count} days"
      },
      "x_minutes": {
        "one": "1 minute",
        "other": "%{count} minutes"
      },
      "x_months": {
        "one": "1 month",
        "other": "%{count} months"
      },
      "x_seconds": {
        "one": "1 second",
        "other": "%{count} seconds"
      }
    },
    "prompts": {
      "day": "Day",
      "hour": "Hour",
      "minute": "Minute",
      "month": "Month",
      "second": "Seconds",
      "year": "Year"
    }
  },
  "devise": {
    "administrators": {
      "meta_title": "Login to administration panel",
      "passwords": {
        "edit": {
          "submit": "Set new password",
          "title": "Change your password"
        },
        "new": {
          "back": "Return back",
          "submit": "Send me instructions",
          "title": "Forgot your password?"
        }
      },
      "sessions": {
        "new": {
          "forgot_password": "Forgot your password?",
          "submit": "Login",
          "title": "<strong>Welcome</strong>, Please login"
        }
      },
      "shared": {
        "links": {
          "about": "About",
          "app_name": "© 2016 AppName",
          "contact_us": "Contact Us",
          "privacy": "Privacy"
        }
      }
    },
    "confirmations": {
      "confirmed": "Vielen Dank für Ihre Registrierung. Sie sind jetzt angemeldet.",
      "new": {
        "resend_confirmation_instructions": "Anleitung zur Bestätigung noch mal schicken"
      },
      "send_instructions": "Sie erhalten in wenigen Minuten eine E-Mail, mit der Sie Ihre Registrierung bestätigen können.",
      "send_paranoid_instructions": "Falls Ihre E-Mail-Adresse in unserer Datenbank existiert, erhalten Sie in wenigen Minuten eine E-Mail, mit der Sie Ihre Registrierung bestätigen können."
    },
    "failure": {
      "already_authenticated": "Sie sind bereits angemeldet.",
      "inactive": "Ihr Account ist nicht aktiv.",
      "invalid": "Ungültige Anmeldedaten.",
      "invited": "You have a pending invitation, accept it to finish creating your account.",
      "last_attempt": "Sie haben noch einen Versuch, bis Ihr Account gesperrt wird.",
      "locked": "Ihr Account ist gesperrt.",
      "not_found_in_database": "Ungültige Anmeldedaten.",
      "timeout": "Ihre Sitzung ist abgelaufen, bitte melden Sie sich erneut an.",
      "unauthenticated": "Sie müssen sich anmelden oder registrieren, bevor Sie fortfahren können.",
      "unconfirmed": "Sie müssen Ihren Account bestätigen, bevor Sie fortfahren können."
    },
    "invitations": {
      "edit": {
        "header": "Set your password",
        "submit_button": "Set my password"
      },
      "invitation_removed": "Your invitation was removed.",
      "invitation_token_invalid": "The invitation token provided is not valid!",
      "new": {
        "header": "Send invitation",
        "submit_button": "Send an invitation"
      },
      "no_invitations_remaining": "No invitations remaining",
      "send_instructions": "An invitation email has been sent to %{email}.",
      "updated": "Your password was set successfully. You are now signed in.",
      "updated_not_active": "Your password was set successfully."
    },
    "mailer": {
      "confirmation_instructions": {
        "action": "Mein Konto bestätigen",
        "greeting": "Willkommen %{recipient}!",
        "instruction": "Folgen Sie dem untenstehenden Link, um Ihr Konto zu bestätigen:",
        "subject": "Anleitung zur Bestätigung Ihres Accounts"
      },
      "invitation_instructions": {
        "accept": "Accept invitation",
        "accept_until": "This invitation will be due in %{due_date}.",
        "hello": "Hello %{email}",
        "ignore": "If you don't want to accept the invitation, please ignore this email.<br />\nYour account won't be created until you access the link above and set your password.",
        "someone_invited_you": "Someone has invited you to %{url}, you can accept it through the link below.",
        "subject": "Invitation instructions"
      },
      "password_change": {
        "greeting": "Hallo %{recipient}!",
        "message": "Wir kontaktieren Sie, um Ihnen mitzuteilen, dass Ihr Passwort geändert wurde.",
        "subject": "Passwort geändert"
      },
      "reset_password_instructions": {
        "action": "Passwort ändern",
        "greeting": "Hallo %{recipient}!",
        "instruction": "Jemand hat einen Link angefordert, um Ihr Passwort zu ändern. Klicken Sie auf den unten aufgeführten Link um das Passwort zu ändern.",
        "instruction_2": "Bitte ignorieren Sie diese E-Mail, wenn Sie kein neues Passwort angefordert haben.",
        "instruction_3": "Das Passwort wird nicht geändert bis Sie den obenstehenden Link abrufen und ein neues Passwort bestimmen.",
        "subject": "Anleitung für das Zurücksetzen Ihres Passworts"
      },
      "unlock_instructions": {
        "action": "Mein Konto entsperren",
        "greeting": "Hallo %{recipient}!",
        "instruction": "Folgen Sie dem untenstehenden Link, um Ihr Konto zu entsperren:",
        "message": "Ihr Konto wurde aufgrund einer großen Anzahl von fehlgeschlagenen Anmeldeversuchen gesperrt.",
        "subject": "Anleitung für die Account-Freischaltung"
      }
    },
    "omniauth_callbacks": {
      "failure": "Sie konnten nicht mit Ihrem %{kind}-Account angemeldet werden, weil \"%{reason}\".",
      "success": "Sie haben sich erfolgreich mit Ihrem %{kind}-Account angemeldet."
    },
    "passwords": {
      "edit": {
        "change_my_password": "Ändere mein Passwort",
        "change_your_password": "Passwort ändern",
        "confirm_new_password": "Neues Passwort bestätigen",
        "new_password": "Neues Passwort"
      },
      "new": {
        "forgot_your_password": "Haben Sie Ihr Passwort vergessen?",
        "send_me_reset_password_instructions": "Schicken Sie mir die Anleitung, mein Passwort zurückzusetzen"
      },
      "no_token": "Sie können sich nicht auf dieser Seite anmelden, wenn Sie nicht von einer Passwort-Zurücksetzen-E-Mail kommen. Wenn Sie von solch einer E-Mail kommen, überprüfen Sie bitte, ob Sie die gesamte URL verwendeten.",
      "send_instructions": "Sie erhalten in wenigen Minuten eine E-Mail mit der Anleitung, wie Sie Ihr Passwort zurücksetzen können.",
      "send_paranoid_instructions": "Falls Ihre E-Mail-Adresse in unserer Datenbank existiert, erhalten Sie in wenigen Minuten eine E-Mail, mit der Anleitung, wie Sie Ihr Passwort zurücksetzen können.",
      "updated": "Ihr Passwort wurde geändert. Sie sind jetzt angemeldet.",
      "updated_not_active": "Ihr Passwort wurde geändert."
    },
    "registrations": {
      "destroyed": "Ihr Account wurde gelöscht.",
      "edit": {
        "are_you_sure": "Sind Sie sicher?",
        "cancel_my_account": "Konto löschen",
        "currently_waiting_confirmation_for_email": "Warte auf Bestätigung von %{email}.",
        "leave_blank_if_you_don_t_want_to_change_it": "freilassen, wenn Sie das nicht ändern wollen",
        "title": "%{resource} bearbeiten",
        "unhappy": "Unglücklich",
        "update": "Aktualisieren",
        "we_need_your_current_password_to_confirm_your_changes": "wir benötigen Ihr aktuelles Passwort, um die Änderung zu bestätigen"
      },
      "new": {
        "sign_up": "Registrieren"
      },
      "signed_up": "Sie haben sich erfolgreich registriert.",
      "signed_up_but_inactive": "Sie haben sich erfolgreich registriert. Wir konnten Sie jedoch nicht anmelden, weil Ihr Account noch nicht aktiviert ist.",
      "signed_up_but_locked": "Sie haben sich erfolgreich registriert. Wir konnten Sie jedoch nicht anmelden, weil Ihr Account gesperrt ist.",
      "signed_up_but_unconfirmed": "Sie erhalten in wenigen Minuten eine E-Mail mit einem Link für die Bestätigung der Registrierung. Klicken Sie auf den Link um Ihren Account zu aktivieren.",
      "update_needs_confirmation": "Ihre Daten wurden aktualisiert, aber Sie müssen Ihre neue E-Mail-Adresse bestätigen. Sie erhalten in wenigen Minuten eine E-Mail, mit der Sie die Änderung Ihrer E-Mail-Adresse abschließen können.",
      "updated": "Ihre Daten wurden aktualisiert."
    },
    "sessions": {
      "already_signed_out": "Erfolgreich abgemeldet.",
      "new": {
        "sign_in": "Anmelden"
      },
      "signed_in": "Erfolgreich angemeldet.",
      "signed_out": "Erfolgreich abgemeldet."
    },
    "shared": {
      "links": {
        "back": "Zurück",
        "didn_t_receive_confirmation_instructions": "Keine Anleitung zur Bestätigung erhalten?",
        "didn_t_receive_unlock_instructions": "Keine Anleitung zum Entsperren erhalten?",
        "forgot_your_password": "Passwort vergessen?",
        "sign_in": "Anmelden",
        "sign_in_with_provider": "Mit %{provider} anmelden",
        "sign_up": "Registrieren"
      }
    },
    "unlocks": {
      "new": {
        "resend_unlock_instructions": "Anleitung zum Entsperren noch mal schicken"
      },
      "send_instructions": "Sie erhalten in wenigen Minuten eine E-Mail mit der Anleitung, wie Sie Ihren Account entsperren können.",
      "send_paranoid_instructions": "Falls Ihre E-Mail-Adresse in unserer Datenbank existiert, erhalten Sie in wenigen Minuten eine E-Mail, mit der Anleitung, wie Sie Ihren Account entsperren können.",
      "unlocked": "Ihr Account wurde entsperrt. Sie sind jetzt angemeldet."
    },
    "users": {
      "passwords": {
        "new": {
          "submit": "Send me instructions",
          "tabs": {
            "register": "Register",
            "sign_in": "Sign In"
          }
        }
      },
      "registrations": {
        "new": {
          "submit": "Register",
          "tabs": {
            "register": "Register",
            "sign_in": "Sign In"
          }
        }
      },
      "sessions": {
        "new": {
          "forgot_password": "Forgot password?",
          "keep_sign_in": "Yes, Keep me signed in",
          "submit": "Sign In",
          "tabs": {
            "register": "Register",
            "sign_in": "Sign In"
          }
        }
      }
    }
  },
  "errors": {
    "connection_refused": "Oops! Failed to connect to the Web Console middleware.\nPlease make sure a rails development server is running.\n",
    "format": "%{attribute} %{message}",
    "messages": {
      "accepted": "must be accepted",
      "allowed_file_content_types": "file should be one of %{types}",
      "already_confirmed": "wurde bereits bestätigt, bitte versuchen Sie, sich anzumelden",
      "blank": "can't be blank",
      "carrierwave_download_error": "could not be downloaded",
      "carrierwave_integrity_error": "is not of an allowed file type",
      "carrierwave_processing_error": "failed to be processed",
      "confirmation": "doesn't match %{attribute}",
      "confirmation_period_expired": "musste innerhalb von %{period} bestätigt werden, bitte neu anfordern.",
      "empty": "can't be empty",
      "equal_to": "must be equal to %{count}",
      "even": "must be even",
      "excluded_file_content_types": "file cannot be %{types}",
      "exclusion": "is reserved",
      "expired": "ist abgelaufen, bitte neu anfordern",
      "extension_black_list_error": "You are not allowed to upload %{extension} files, prohibited types: %{prohibited_types}",
      "extension_white_list_error": "You are not allowed to upload %{extension} files, allowed types: %{allowed_types}",
      "file_size_is_greater_than": "file size must be greater than %{count}",
      "file_size_is_greater_than_or_equal_to": "file size must be greater than or equal to %{count}",
      "file_size_is_in": "file size must be between %{min} and %{max}",
      "file_size_is_less_than": "file size must be less than %{count}",
      "file_size_is_less_than_or_equal_to": "file size must be less than or equal to %{count}",
      "greater_than": "must be greater than %{count}",
      "greater_than_or_equal_to": "must be greater than or equal to %{count}",
      "inclusion": "is not included in the list",
      "invalid": "is invalid",
      "less_than": "must be less than %{count}",
      "less_than_or_equal_to": "must be less than or equal to %{count}",
      "mime_types_processing_error": "Failed to process file with MIME::Types, maybe not valid content-type? Original Error: %{e}",
      "mini_magick_processing_error": "Failed to manipulate with MiniMagick, maybe it is not an image? Original Error: %{e}",
      "model_invalid": "Validation failed: %{errors}",
      "not_a_number": "is not a number",
      "not_an_integer": "must be an integer",
      "not_found": "nicht gefunden",
      "not_locked": "ist nicht gesperrt",
      "not_saved": {
        "one": "%{resource} konnte aufgrund eines Fehlers nicht gespeichert werden:",
        "other": "%{count} Fehler verhinderten das Speichern von %{resource}:"
      },
      "odd": "must be odd",
      "other_than": "must be other than %{count}",
      "present": "must be blank",
      "required": "must exist",
      "rmagick_processing_error": "Failed to manipulate with rmagick, maybe it is not an image? Original Error: %{e}",
      "taken": "has already been taken",
      "too_long": {
        "one": "is too long (maximum is 1 character)",
        "other": "is too long (maximum is %{count} characters)"
      },
      "too_short": {
        "one": "is too short (minimum is 1 character)",
        "other": "is too short (minimum is %{count} characters)"
      },
      "wrong_length": {
        "one": "is the wrong length (should be 1 character)",
        "other": "is the wrong length (should be %{count} characters)"
      }
    },
    "unacceptable_request": "A supported version is expected in the Accept header.\n",
    "unavailable_session": "Session %{id} is is no longer available in memory.\n\nIf you happen to run on a multi-process server (like Unicorn or Puma) the process\nthis request hit doesn't store %{id} in memory. Consider turning the number of\nprocesses/workers to one (1) or using a different server in development.\n"
  },
  "flash": {
    "actions": {
      "create": {
        "notice": "%{resource_name} was successfully created."
      },
      "destroy": {
        "alert": "%{resource_name} could not be destroyed.",
        "notice": "%{resource_name} was successfully destroyed."
      },
      "update": {
        "notice": "%{resource_name} was successfully updated."
      }
    }
  },
  "helpers": {
    "page_entries_info": {
      "more_pages": {
        "display_entries": "Displaying %{entry_name} <b>%{first}&nbsp;-&nbsp;%{last}</b> of <b>%{total}</b> in total"
      },
      "one_page": {
        "display_entries": {
          "one": "Displaying <b>1</b> %{entry_name}",
          "other": "Displaying <b>all %{count}</b> %{entry_name}",
          "zero": "No %{entry_name} found"
        }
      }
    },
    "select": {
      "prompt": "Please select"
    },
    "submit": {
      "create": "Create %{model}",
      "submit": "Save %{model}",
      "update": "Update %{model}"
    }
  },
  "home": {
    "survey_instructions": {
      "title": "Instructions"
    }
  },
  "i18n_tasks": {
    "add_missing": {
      "added": {
        "one": "Added %{count} key",
        "other": "Added %{count} keys"
      }
    },
    "cmd": {
      "args": {
        "default_text": "Default: %{value}",
        "desc": {
          "confirm": "Confirm automatically",
          "data_format": "Data format: %{valid_text}.",
          "key_pattern": "Filter by key pattern (e.g. 'common.*')",
          "key_pattern_to_rename": "Full key (pattern) to rename. Required",
          "locale": "i18n_tasks.common.locale",
          "locale_to_translate_from": "Locale to translate from",
          "locales_filter": "Locale(s) to process. Special: base",
          "missing_types": "Filter by types: %{valid}",
          "new_key_name": "New name, interpolates original name as %{key}. Required",
          "nostdin": "Do not read from stdin",
          "out_format": "Output format: %{valid_text}",
          "pattern_router": "Use pattern router: keys moved per config data.write",
          "strict": "Avoid inferring dynamic key usages such as t(\"cats.#{cat}.name\"). Takes precedence over the config setting if set.",
          "value": "Value. Interpolates: %{value}, %{human_key}, %{key}, %{default}, %{value_or_human_key}, %{value_or_default_or_human_key}"
        }
      },
      "desc": {
        "add_missing": "add missing keys to locale data",
        "config": "display i18n-tasks configuration",
        "data": "show locale data",
        "data_merge": "merge locale data with trees",
        "data_remove": "remove keys present in tree from data",
        "data_write": "replace locale data with tree",
        "eq_base": "show translations equal to base value",
        "find": "show where keys are used in the code",
        "gem_path": "show path to the gem",
        "health": "is everything OK?",
        "irb": "start REPL session within i18n-tasks context",
        "missing": "show missing translations",
        "normalize": "normalize translation data: sort and move to the right files",
        "remove_unused": "remove unused keys",
        "translate_missing": "translate missing keys with Google Translate",
        "tree_convert": "convert tree between formats",
        "tree_filter": "filter tree by key pattern",
        "tree_merge": "merge trees",
        "tree_rename_key": "rename tree node",
        "tree_set_value": "set values of keys, optionally match a pattern",
        "tree_subtract": "tree A minus the keys in tree B",
        "tree_translate": "Google Translate a tree to root locales",
        "unused": "show unused translations",
        "xlsx_report": "save missing and unused translations to an Excel file"
      },
      "encourage": [
        "Good job!",
        "Well done!",
        "Perfect!"
      ],
      "enum_list_opt": {
        "invalid": "%{invalid} is not in: %{valid}."
      },
      "enum_opt": {
        "invalid": "%{invalid} is not one of: %{valid}."
      },
      "errors": {
        "invalid_format": "invalid format: %{invalid}. valid: %{valid}.",
        "invalid_locale": "invalid locale: %{invalid}",
        "invalid_missing_type": {
          "one": "invalid type: %{invalid}. valid: %{valid}.",
          "other": "unknown types: %{invalid}. valid: %{valid}."
        },
        "pass_forest": "pass locale forest"
      }
    },
    "common": {
      "base_value": "Base Value",
      "continue_q": "Continue?",
      "key": "Key",
      "locale": "Locale",
      "n_more": "%{count} more",
      "type": "Type",
      "value": "Value"
    },
    "data_stats": {
      "text": "has %{key_count} keys across %{locale_count} locales. On average, values are %{value_chars_avg} characters long, keys have %{key_segments_avg} segments, a locale has %{per_locale_avg} keys.",
      "text_single_locale": "has %{key_count} keys in total. On average, values are %{value_chars_avg} characters long, keys have %{key_segments_avg} segments.",
      "title": "Forest (%{locales})"
    },
    "google_translate": {
      "errors": {
        "no_api_key": "Set Google API key via GOOGLE_TRANSLATE_API_KEY environment variable or translation.api_key in config/i18n-tasks.yml. Get the key at https://code.google.com/apis/console.",
        "no_results": "Google Translate returned no results. Make sure billing information is set at https://code.google.com/apis/console."
      }
    },
    "health": {
      "no_keys_detected": "No keys detected. Check data.read in config/i18n-tasks.yml."
    },
    "missing": {
      "details_title": "Value in other locales or source",
      "none": "No translations are missing."
    },
    "remove_unused": {
      "confirm": {
        "one": "%{count} translation will be removed from %{locales}.",
        "other": "%{count} translation will be removed from %{locales}."
      },
      "noop": "No unused keys to remove",
      "removed": "Removed %{count} keys"
    },
    "translate_missing": {
      "translated": "Translated %{count} keys"
    },
    "unused": {
      "none": "Every translation is in use."
    },
    "usages": {
      "none": "No key usages found."
    }
  },
  "languages": {
    "ar": "Arabic",
    "cn": "Chinese",
    "de": "German",
    "en": "English",
    "es": "Spanish",
    "fr": "French"
  },
  "layouts": {
    "users": {
      "dashboard": "Dashboard",
      "help": "Help",
      "logout": "Log Out",
      "menu": "Menu",
      "notifications": "Notifications",
      "profile": "Profile"
    }
  },
  "managers": {
    "assigns": {
      "index": {
        "title": "Assessments and Reporting Centre"
      },
      "list": {
        "action": "Action",
        "assessment_name": "Assessment Name",
        "assessment_type": "Assessment Type",
        "completion_date": "Completion Date",
        "name": "Name",
        "status": "Completion Status"
      },
      "resource": {
        "email": "Email",
        "save": "Save in PDF",
        "view": "View"
      }
    },
    "dashboard": {
      "index": {
        "assessment_center": "Assessment / Report Centre",
        "notification_center": "Notification Centre",
        "notifications": "Notifications",
        "relationships": "Company Relationships",
        "reporting": "Reporting",
        "statistics": "Statistics"
      }
    },
    "notifications": {
      "index": {
        "subtitle": "Notifications",
        "title": "Notification Centre"
      }
    },
    "reports": {
      "show": {
        "export_pdf": "Export to PDF",
        "header": "Report"
      }
    },
    "statistics": {
      "index": {
        "title": "Statistics"
      }
    },
    "users": {
      "index": {
        "title": "Company Relationships"
      }
    }
  },
  "no": "No",
  "number": {
    "currency": {
      "format": {
        "delimiter": ",",
        "format": "%u%n",
        "precision": 2,
        "separator": ".",
        "significant": false,
        "strip_insignificant_zeros": false,
        "unit": "$"
      }
    },
    "format": {
      "delimiter": ",",
      "precision": 3,
      "separator": ".",
      "significant": false,
      "strip_insignificant_zeros": false
    },
    "human": {
      "decimal_units": {
        "format": "%n %u",
        "units": {
          "billion": "Billion",
          "million": "Million",
          "quadrillion": "Quadrillion",
          "thousand": "Thousand",
          "trillion": "Trillion",
          "unit": ""
        }
      },
      "format": {
        "delimiter": "",
        "precision": 3,
        "significant": true,
        "strip_insignificant_zeros": true
      },
      "storage_units": {
        "format": "%n %u",
        "units": {
          "byte": {
            "one": "Byte",
            "other": "Bytes"
          },
          "eb": "EB",
          "gb": "GB",
          "kb": "KB",
          "mb": "MB",
          "pb": "PB",
          "tb": "TB"
        }
      }
    },
    "percentage": {
      "format": {
        "delimiter": "",
        "format": "%n%"
      }
    },
    "precision": {
      "format": {
        "delimiter": ""
      }
    }
  },
  "profiles": {
    "edit": {
      "header": "Profile Settings"
    },
    "update": {
      "successfully": "Profile updated"
    }
  },
  "ransack": {
    "all": "alle",
    "and": "und",
    "any": "beliebige",
    "asc": "aufsteigend",
    "attribute": "Attribut",
    "combinator": "Kombinator",
    "condition": "Bedingung",
    "desc": "absteigend",
    "or": "oder",
    "predicate": "Eigenschaft",
    "predicates": {
      "blank": "ist leer",
      "cont": "enthält",
      "cont_all": "enthält alle",
      "cont_any": "enthält beliebige",
      "does_not_match": "stimmt nicht überein",
      "does_not_match_all": "stimmt nicht mit allen überein",
      "does_not_match_any": "erfüllt ein beliebiger/s nicht",
      "end": "endet mit",
      "end_all": "endet mit allen",
      "end_any": "endet mit beliebigen",
      "eq": "gleicht",
      "eq_all": "gleicht allen",
      "eq_any": "gleicht beliebigen",
      "false": "ist falsch",
      "gt": "größer als",
      "gt_all": "größer als alle",
      "gt_any": "größer als ein beliebiger/s",
      "gteq": "größer oder gleich",
      "gteq_all": "größer oder gleich alle",
      "gteq_any": "größer oder gleich als ein beliebiger/s",
      "in": "in",
      "in_all": "in allen",
      "in_any": "ist nicht in einem beliebigen",
      "lt": "kleiner als",
      "lt_all": "kleiner als alle als alle",
      "lt_any": "kleiner als ein beliebiger/s",
      "lteq": "kleiner oder gleich",
      "lteq_all": "kleiner oder gleich allen",
      "lteq_any": "kleiner oder gleich beliebige",
      "matches": "entspricht",
      "matches_all": "stimmt mit allen überein",
      "matches_any": "stimmt überein mit einem beliebigen",
      "not_cont": "enthält nicht",
      "not_cont_all": "enthält keine/s",
      "not_cont_any": "enthält ein beliebiger/s nicht",
      "not_end": "endet nicht mit",
      "not_end_all": "endet nicht mit allen",
      "not_end_any": "endet nicht mit beliebigen",
      "not_eq": "ungleich",
      "not_eq_all": "ungleich allen",
      "not_eq_any": "ungleich beliebigen",
      "not_in": "nicht in",
      "not_in_all": "nicht in allen",
      "not_in_any": "nicht in beliebige",
      "not_null": "ist nicht null",
      "not_start": "beginnt nicht mit",
      "not_start_all": "beginnt nicht mit allen",
      "not_start_any": "beginnt nicht mit beliebigen",
      "null": "ist null",
      "present": "ist vorhanden",
      "start": "beginnt mit",
      "start_all": "beginnt mit allen",
      "start_any": "beginnt mit beliebigen",
      "true": "ist wahr"
    },
    "search": "suchen",
    "sort": "sortieren",
    "value": "Wert"
  },
  "reports": {
    "modules": {
      "common": {
        "almost_always": "Almost Always",
        "less_typical": "Less Typical",
        "moderate": "Moderate",
        "more_typical": "More Typical",
        "rare": "Rare"
      },
      "cpi_occupations": {
        "occupations": "Occupations",
        "your_potential_suitability": "Your Potential Suitability"
      },
      "gap_assessment": {
        "gap": "Gap",
        "item": "Item",
        "negative_gap": "Negative Gap",
        "positive_gap": "Positive Gap",
        "rank": "Rank",
        "scoring_category": "Scoring Category"
      },
      "highest_lowest": {
        "bottom_5": "BOTTOM 5",
        "email": "Email",
        "first_name": "First Name",
        "highest_scores": "Highest Scores",
        "item": "Item",
        "last_name": "Last Name",
        "lowest_scores": "Lowest Scores",
        "mean_score": "Mean Score",
        "rank": "Rank",
        "score": "Score",
        "sub_competenties": "Sub-Competencies",
        "top_5": "TOP 5"
      },
      "potential_career_full": {
        "bachelors_or_masters_qualification": "Bachelors or Masters Qualification",
        "detailed_career_guide": "Detailed Career Guide",
        "diploma_qualification": "Diploma Qualification",
        "education_level": "Education Level",
        "high_school_entry_roles": "High School Entry Roles",
        "key_career_tracks_within": "Key Career Tracks Within",
        "potential_areas_of_study": "Potential Areas of Study",
        "potential_roles": "Potential Roles"
      },
      "potential_career_short": {
        "career": "career",
        "for_this": "for this",
        "key": "key",
        "strengths": "strengths",
        "your_scores": "Your Scores"
      }
    },
    "show": {
      "export_pdf": "Export to PDF",
      "header": "Report"
    }
  },
  "simple_form": {
    "error_notification": {
      "default_message": "Please review the problems below:"
    },
    "no": "No",
    "placeholders": {
      "administrator": {
        "active": "Active",
        "created_at": "Created Date",
        "current_password": "Current password",
        "disabled": "Disable",
        "email": "Email Address",
        "first_name": "First Name",
        "id": "ID",
        "last_name": "Last Name",
        "manage_client_ids": "Memberships",
        "memberships": "Memberships",
        "password": "Password",
        "password_confirmation": "Password confirmation",
        "role": "Role",
        "roles": {
          "admin": "Client Admin",
          "manager": "Manager",
          "member": "User",
          "super_admin": "Super Admin",
          "superadmin": "Super Admin"
        },
        "types": {
          "anonymous": "Anonymous Users",
          "identified": "Identified Users"
        },
        "updated_at": "Modified Date"
      },
      "assessment": {
        "active": "Active",
        "categories": {
          "360": "360 Feedback",
          "organisational": "Org Surveys",
          "psychometric": "Psychometrics"
        },
        "category": "Category",
        "completed_at": "Completion Date",
        "created_at": "Created Date",
        "description": "Description",
        "id": "ID",
        "name": "Name",
        "statuses": {
          "completed": "Completed",
          "in_progress": "In Progress",
          "not_started": "New"
        },
        "timing": "Timing",
        "updated_at": "Modified Date"
      },
      "block": {
        "active": "Active",
        "assign_to_assessment_ids": "Assessments",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "client": {
        "category": "Category",
        "created_at": "Created Date",
        "id": "ID",
        "licenses": "License number",
        "licenses_expire": "License expire",
        "licenses_used": "Used license number",
        "logo": "Client logo",
        "name": "Name",
        "subdomain": "Subdomain",
        "updated_at": "Modified Date"
      },
      "dimension": {
        "active": "Active",
        "created_at": "Created Date",
        "factors_count": "No. of Factors",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "factor": {
        "active": "Active",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "parent_id": "Parent",
        "questions_count": "No. Questions",
        "subfactors_count": "No. Sub-Factors",
        "updated_at": "Modified Date"
      },
      "memebrship": {
        "id": "ID",
        "parent": "Direct Manager"
      },
      "norm": {
        "active": "Active",
        "bachelors_or_masters_qualification": "Bachelors or Masters Qualification",
        "created_at": "Created Date",
        "description": "Description",
        "diploma_qualification": "Diploma Qualification",
        "full_description": "Full Description",
        "high_school_entry_roles": "High School Entry Roles",
        "id": "ID",
        "key_career_tracks": "Key Career Tracks",
        "name": "Name",
        "potential_areas_of_study": "Potential Areas of Study",
        "updated_at": "Modified Date",
        "updated_by": "Edited by"
      },
      "question": {
        "active": "Active",
        "assign_to_assessment_ids": "Assessments",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "user": {
        "active": "Active",
        "created_at": "Created Date",
        "current_password": "Current password",
        "disabled": "Disable",
        "email": "Email Address",
        "first_name": "First Name",
        "id": "ID",
        "last_name": "Last Name",
        "manage_client_ids": "Memberships",
        "memberships": "Memberships",
        "password": "Password",
        "password_confirmation": "Password confirmation",
        "role": "Role",
        "roles": {
          "admin": "Client Admin",
          "manager": "Manager",
          "member": "User",
          "super_admin": "Super Admin",
          "superadmin": "Super Admin"
        },
        "types": {
          "anonymous": "Anonymous Users",
          "identified": "Identified Users"
        },
        "updated_at": "Modified Date"
      }
    },
    "required": {
      "mark": "*",
      "text": "required"
    },
    "yes": "Yes"
  },
  "support": {
    "array": {
      "last_word_connector": ", and ",
      "two_words_connector": " and ",
      "words_connector": ", "
    }
  },
  "time": {
    "am": "am",
    "formats": {
      "date": "%d/%m/%y",
      "default": "%a, %d %b %Y %H:%M:%S %z",
      "devise": {
        "mailer": {
          "invitation_instructions": {
            "accept_until_format": "%B %d, %Y %I:%M %p"
          }
        }
      },
      "long": "%B %d, %Y %H:%M",
      "short": "%d %b %Y / %H:%M"
    },
    "pm": "pm"
  },
  "validations": {
    "character_range": "Your response must be at least %{min} and no more than %{max} characters.",
    "date": "Your response must be a valid date (dd/mm/yyyy)",
    "each_group_contains": "Each group needs to contain not less than %{min} and not more than %{max} items",
    "email": "Your response must be a valid email",
    "issue": "Issue",
    "least": "Please answer at least %{min} choice(s).",
    "least_hotspot": "Please answer at least %{min} choice(s).",
    "max_length": "Your response must be no more than %{max} characters.",
    "min_length": "Your response must be at least %{min} characters.",
    "must_rank_between": "Please assign a value from %{min} to %{max} for each item. Values may not be repeated.",
    "must_select": "Please select from %{min} to %{max} choices",
    "number": "Your response must be a number",
    "range": "Please answer at least %{min} and no more than %{max} choice(s).",
    "text": "Your response must not contain a numbers",
    "title": "Sorry, you cannot continue until you correct the following:"
  },
  "views": {
    "pagination": {
      "first": "&laquo; First",
      "last": "Last &raquo;",
      "next": "Next &rsaquo;",
      "previous": "&lsaquo; Prev",
      "truncate": "&hellip;"
    }
  },
  "yes": "Yes"
});
I18n.translations["cn"] = I18n.extend((I18n.translations["cn"] || {}), {
  "activerecord": {
    "attributes": {
      "assessment": {
        "active": "Active",
        "categories": {
          "360": "360 Feedback",
          "organisational": "Org Surveys",
          "psychometric": "Psychometrics"
        },
        "category": "Category",
        "created_at": "Created Date",
        "description": "Description",
        "id": "ID",
        "name": "Name",
        "timing": "Timing",
        "updated_at": "Modified Date"
      },
      "assign": {
        "completed_at": "Completion Date",
        "statuses": {
          "completed": "Completed",
          "in_progress": "In Progress",
          "not_started": "New"
        }
      },
      "block": {
        "active": "Active",
        "assign_to_assessment_ids": "Assessments",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "client": {
        "category": "Category",
        "created_at": "Created Date",
        "id": "ID",
        "licenses": "License number",
        "licenses_expire": "License expire",
        "licenses_used": "Used license number",
        "logo": "Client logo",
        "name": "Name",
        "subdomain": "Subdomain",
        "updated_at": "Modified Date"
      },
      "dimension": {
        "active": "Active",
        "created_at": "Created Date",
        "factors_count": "No. of Factors",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "factor": {
        "active": "Active",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "parent_id": "Parent",
        "questions_count": "No. Questions",
        "subfactors_count": "No. Sub-Factors",
        "updated_at": "Modified Date"
      },
      "membership": {
        "parent_id": "Direct Manager"
      },
      "memebrship": {
        "id": "ID",
        "parent": "Direct Manager"
      },
      "norm": {
        "active": "Active",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date",
        "updated_by": "Edited by"
      },
      "occupation": {
        "active": "Active",
        "bachelors_or_masters_qualification": "Bachelors or Masters Qualification",
        "created_at": "Created Date",
        "description": "Description",
        "diploma_qualification": "Diploma Qualification",
        "full_description": "Full Description",
        "high_school_entry_roles": "High School Entry Roles",
        "id": "ID",
        "key_career_tracks": "Key Career Tracks",
        "name": "Name",
        "potential_areas_of_study": "Potential Areas of Study",
        "updated_at": "Modified Date"
      },
      "occupations_factor": {
        "active": "Active",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "question": {
        "active": "Active",
        "assign_to_assessment_ids": "Assessments",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "user": {
        "active": "Active",
        "created_at": "Created Date",
        "current_password": "Current password",
        "disabled": "Disable",
        "email": "Email Address",
        "first_name": "First Name",
        "id": "ID",
        "last_name": "Last Name",
        "manage_client_ids": "Memberships",
        "memberships": "Memberships",
        "password": "Password",
        "password_confirmation": "Password confirmation",
        "remember_me": "Remember me",
        "reset_password_token": "Reset password token",
        "role": "Role",
        "roles": {
          "admin": "Client Admin",
          "manager": "Manager",
          "member": "User",
          "super_admin": "Super Admin",
          "superadmin": "Super Admin"
        },
        "types": {
          "anonymous": "Anonymous Users",
          "identified": "Identified Users"
        },
        "unlock_token": "Unlock token",
        "updated_at": "Modified Date"
      }
    },
    "errors": {
      "messages": {
        "not_uniqueness": "Assign has already been taken",
        "record_invalid": "Validation failed: %{errors}",
        "restrict_dependent_destroy": {
          "has_many": "Cannot delete record because dependent %{record} exist",
          "has_one": "Cannot delete record because a dependent %{record} exists"
        }
      },
      "models": {
        "factors_norm": {
          "score_from_must_be_number": "Score from must be number",
          "score_to_less_than_score_from": "Score to is less than Score from",
          "score_to_must_be_number": "Score to must be number"
        }
      }
    },
    "models": {
      "assessment": "Assessments",
      "assign": "Assigns",
      "block": "Block",
      "client": "Clients",
      "dimension": "Dimensions",
      "factor": "Factors",
      "factors_norm": "factors_norms",
      "membership": "Memebrship",
      "memebrship": "Memebrship",
      "norm": "Norms",
      "occupation": "Occupations",
      "occupations_factor": "Occupations",
      "question": "Question",
      "user": "Users"
    }
  },
  "administration": {
    "actions": "Actions",
    "active": "Active",
    "administrator": {
      "passwords": {
        "edit": {
          "submit": "Set new password",
          "title": "Change your password"
        },
        "new": {
          "back": "Return back",
          "submit": "Send me instructions",
          "title": "Forgot your password?"
        }
      },
      "sessions": {
        "new": {
          "forgot_password": "Forgot your password?",
          "submit": "Login",
          "title": "<strong>Welcome</strong>, Please login"
        }
      },
      "shared": {
        "links": {
          "about": "About",
          "app_name": "© 2016 AppName",
          "contact_us": "Contact Us",
          "privacy": "Privacy"
        }
      }
    },
    "any": " - Any - ",
    "assessments": {
      "assigns": {
        "default": {
          "filter": "Filter",
          "filter_form": "Filter form",
          "next": "Next",
          "previous": "Previous",
          "title": "Assign %{name} Assessment"
        },
        "finish": {
          "show": {
            "filter": "Filter",
            "filter_form": "Filter form",
            "next": "Next",
            "previous": "Previous",
            "title": "Assign %{name} Assessment"
          }
        },
        "step1": {
          "show": {
            "filter": "Filter",
            "filter_form": "Filter form",
            "next": "Next",
            "previous": "Previous",
            "title": "Assign %{name} Assessment"
          }
        },
        "step2": {
          "show": {
            "filter": "Filter",
            "filter_form": "Filter form",
            "next": "Next",
            "not_selected_users": "Not Selected Users",
            "previous": "Previous",
            "selected_users": "Selected Users",
            "title": "Assign %{name} Assessment"
          },
          "users": {
            "filter": "Filter",
            "filter_form": "Filter form",
            "next": "Next",
            "previous": "Previous",
            "title": "Assign %{name} Assessment"
          }
        }
      },
      "copy": {
        "error": "Assessment #%{name} was not copied.",
        "successfully": "Assessment %{name} was successfully copied."
      },
      "create": {
        "successfully": "Assessment %{name} was successfully created."
      },
      "dashboard": "Assessment Dashboard",
      "destroy": {
        "successfully": "Assessment %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit assessment"
      },
      "form": {
        "categories": {
          "360": "360 Feedback",
          "all": "All Categories",
          "organisational": "Org Surveys",
          "psychometric": "Psychometrics"
        },
        "timing": {
          "hint": "For Example: 30 minutes to complete"
        }
      },
      "index": {
        "filterrific": {
          "with_category": {
            "360": "360 Feedback",
            "all": "All Categories",
            "organisational": "Org Surveys",
            "psychometric": "Psychometrics"
          }
        },
        "title": "Assessments",
        "tooltips": {
          "create": "Create"
        }
      },
      "new": {
        "header": "New assessment"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Assessment?</p>\n",
            "title": "Delete <strong>Assessment</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Assessment?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Assessment",
          "delete": "Delete Assessment",
          "edit": "Edit Assessment"
        }
      },
      "sidebar": {
        "assign": "Assign Assessment",
        "copy": "Copy Assessment",
        "destroy": "Delete Assessment",
        "disable": "Disable",
        "edit": "Edit Assessment",
        "enable": "Enable",
        "new": "New Assessment",
        "preview": "Preview Assessment",
        "title": "Assessment's options (#%{id})"
      },
      "toggle_status": {
        "successfully": "Assessment %{name} was successfully updated."
      },
      "update": {
        "successfully": "Assessment %{name} was successfully updated."
      }
    },
    "assigns": {
      "create": {
        "successfully": "New assign to assessment was successfully created"
      },
      "destroy": {
        "successfully": "Assign to assessment was successfully destroy"
      },
      "index": {
        "title": "Reports"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this assign?</p>",
            "title": "Delete <strong>%{name}</strong> ?"
          }
        }
      }
    },
    "back": "Back",
    "base": {
      "top_sidebar": {
        "search": "Search...",
        "sign_out_message": {
          "body": "<p>Are you sure you want to log out?</p> <p>Press No if you want to continue work. Press Yes to logout current user.</p>",
          "title": "Log <strong>Out</strong> ?"
        }
      }
    },
    "blocks": {
      "destroy": {
        "successfully": "Block %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit Block"
      },
      "new": {
        "header": "New Block"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Block?</p>\n",
            "title": "Delete <strong>Block</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Block?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        }
      }
    },
    "breadcrumbs": {
      "assessments": "Assessments",
      "client": "Client Tenancy",
      "clients": "Client Tenancies",
      "communication_center": "Communication Center",
      "create": "Create",
      "design": "Design",
      "dimension": "Dimension",
      "dimensions": "Dimensions",
      "factors": "Factors",
      "home": "Dashboard",
      "libraries": "Media Library",
      "norm": "Norm",
      "norms": "Norms",
      "norms_editor": "Norm Editor",
      "occupations": "Occupations",
      "occupations_factors": "Factors",
      "psychometrics": "Psychometrics",
      "question_center": "Question Center",
      "reports": "Reports",
      "statistics": "Statistics",
      "sub_factors": "Sub-Factors",
      "survey": "Survey",
      "surveys": "Surveys",
      "users": "Users",
      "users_add": "Add New",
      "users_import": "Import"
    },
    "cable": {
      "notification": {
        "assessment_factors": "Factors are fetched",
        "assessment_update": "Assessment is updated",
        "block_clone": "Block is copied",
        "block_create": "Block %{name} is created",
        "block_create_by_template": "Block was loaded from template",
        "block_destroy": "Block has been deleted",
        "block_move_down": "Block %{name} is moved down",
        "block_move_up": "Block %{name} is moved up",
        "block_permanent_destroy": "Block is permanent destroyed",
        "block_rename": "Block is renamed",
        "block_restore": "Block is restored",
        "block_save_as_template": "Block saved as template",
        "block_unlink_template": "Block was unlinked",
        "block_update": "Block is updated",
        "comment_create": "Comment is created",
        "comment_destroy": "Comment has been deleted",
        "geo_filter": "Data filtered",
        "module_create": "Module %{name} is created",
        "module_destroy": "Module has been deleted",
        "module_insert_after": "Module is inserted after",
        "module_insert_before": "Module is inserted before",
        "module_move_down": "Module is moved down",
        "module_move_up": "Module is moved up",
        "module_rename": "Module is renamed",
        "module_update": "Module is updated",
        "page_create": "Page %{name} is created",
        "page_destroy": "Page has been deleted",
        "page_move_down": "Page %{name} is moved down",
        "page_move_up": "Page %{name} is moved up",
        "page_rename": "Page is renamed",
        "page_update": "Page is updated",
        "question_clone": "Question is copied",
        "question_create": "Question %{name} is created",
        "question_create_by_template": "Question was loaded from template",
        "question_create_from_template": "Question is created from template",
        "question_destroy": "Question has been deleted",
        "question_insert_after": "Question is inserted after",
        "question_insert_before": "Question is inserted before",
        "question_move_down": "Question is moved down",
        "question_move_up": "Question is moved up",
        "question_permanent_destroy": "Question is permanent destroyed",
        "question_rename": "Question is renamed",
        "question_restore": "Question is restored",
        "question_save_as_template": "Question saved as template",
        "question_unlink_template": "Question was unlinked",
        "question_update": "Question is updated",
        "report_change_filters": "Filters are updated",
        "report_update": "Report is updated",
        "scoring_update": "Scoring is updated",
        "trash_empty": "Trash Comment empty"
      }
    },
    "choose": " - Choose - ",
    "clear": "Clear",
    "clients": {
      "assessments": {
        "assigns": {
          "default": {
            "filter": "Filter",
            "filter_form": "Filter form",
            "next": "Next",
            "previous": "Previous",
            "title": "Assign %{name} Assessment"
          },
          "finish": {
            "show": {
              "filter": "Filter",
              "filter_form": "Filter form",
              "next": "Next",
              "previous": "Previous",
              "title": "Assign %{name} Assessment"
            }
          },
          "step1": {
            "show": {
              "filter": "Filter",
              "filter_form": "Filter form",
              "next": "Next",
              "previous": "Previous",
              "title": "Assign %{name} Assessment"
            }
          },
          "step2": {
            "show": {
              "filter": "Filter",
              "filter_form": "Filter form",
              "next": "Next",
              "not_selected_users": "Not Selected Users",
              "previous": "Previous",
              "selected_users": "Selected Users",
              "title": "Assign %{name} Assessment"
            },
            "users": {
              "filter": "Filter",
              "filter_form": "Filter form",
              "next": "Next",
              "previous": "Previous",
              "title": "Assign %{name} Assessment"
            }
          }
        },
        "copy": {
          "error": "Assessment #%{name} was not copied.",
          "successfully": "Assessment %{name} was successfully copied."
        },
        "create": {
          "successfully": "Assessment %{name} was successfully created."
        },
        "dashboard": "Assessment Dashboard",
        "destroy": {
          "successfully": "Assessment %{name} was successfully destroyed."
        },
        "edit": {
          "header": "Edit assessment"
        },
        "form": {
          "categories": {
            "360": "360 Feedback",
            "all": "All Categories",
            "organisational": "Org Surveys",
            "psychometric": "Psychometrics"
          },
          "timing": {
            "hint": "For Example: 30 minutes to complete"
          }
        },
        "index": {
          "filterrific": {
            "with_category": {
              "360": "360 Feedback",
              "all": "All Categories",
              "organisational": "Org Surveys",
              "psychometric": "Psychometrics"
            }
          },
          "title": "Assessments",
          "tooltips": {
            "create": "Create"
          }
        },
        "new": {
          "header": "New assessment"
        },
        "resource": {
          "confirmations": {
            "delete": {
              "body": "<p>Are you sure you want to delete this Assessment?</p>\n",
              "title": "Delete <strong>Assessment</strong> ?"
            },
            "toggle_status": {
              "body": "<p>Are you sure you want to %{status} this Assessment?</p>\n",
              "title": "<strong>%{status}</strong> %{name}?"
            }
          },
          "tooltips": {
            "copy": "Copy Assessment",
            "delete": "Delete Assessment",
            "edit": "Edit Assessment"
          }
        },
        "sidebar": {
          "assign": "Assign Assessment",
          "copy": "Copy Assessment",
          "destroy": "Delete Assessment",
          "disable": "Disable",
          "edit": "Edit Assessment",
          "enable": "Enable",
          "new": "New Assessment",
          "preview": "Preview Assessment",
          "title": "Assessment's options (#%{id})"
        },
        "toggle_status": {
          "successfully": "Assessment %{name} was successfully updated."
        },
        "update": {
          "successfully": "Assessment %{name} was successfully updated."
        }
      },
      "copy": {
        "error": "Client #%{name} was not copied.",
        "successfully": "Client %{name} was successfully copied."
      },
      "create": {
        "successfully": "Client %{name} was successfully created."
      },
      "designs": {
        "form": {
          "no_background": "No Background yet",
          "no_logo": "No Logo yet"
        }
      },
      "destroy": {
        "successfully": "Client %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit client"
      },
      "index": {
        "title": "Client Tenancies",
        "tooltips": {
          "create": "Create"
        }
      },
      "license": {
        "header": "%{name} - Edit license"
      },
      "new": {
        "header": "New client"
      },
      "reports": {
        "copy": {
          "error": "Report #%{id} was not copied."
        },
        "destroy": {
          "successfully": "Report %{name} was successfully destroyed."
        },
        "edit": {
          "header": "Edit Report Name"
        },
        "index": {
          "filterrific": {
            "with_assessment_category": {
              "360": "360 Feedback",
              "all": "All",
              "organisational": "Org Surveys",
              "psychometric": "Psychometrics"
            }
          },
          "title": "Reports",
          "tooltips": {
            "create": "Create"
          }
        },
        "new": {
          "header": "New Report"
        },
        "preview": {
          "export_pdf": "Export to PDF",
          "title": "Preview"
        },
        "resource": {
          "confirmations": {
            "delete": {
              "body": "<p>Are you sure you want to delete this Report?</p>\n",
              "title": "Delete <strong>Report</strong> ?"
            },
            "toggle_status": {
              "body": "<p>Are you sure you want to %{status} this Report?</p>\n",
              "title": "<strong>%{status}</strong> %{name}?"
            }
          },
          "tooltips": {
            "copy": "Copy Report",
            "delete": "Delete Report",
            "edit": "Edit Report",
            "preview": "Preview Report"
          }
        },
        "sidebar": {
          "copy": "Copy Report",
          "destroy": "Delete Report",
          "edit": "Edit Report",
          "title": "Report's options (#%{id})",
          "view": "View Report"
        },
        "toggle_status": {
          "successfully": "Report was successfully updated."
        }
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this client?</p>",
            "title": "Delete <strong>%{name}</strong> ?"
          },
          "disable": {
            "body": "<p>Are you sure you want to disable this client?</p>",
            "title": "Disable <strong>%{name}</strong> ?"
          },
          "enable": {
            "body": "<p>Are you sure you want to enable this client?</p>",
            "title": "Enable <strong>%{name}</strong> ?"
          }
        },
        "tooltips": {
          "copy": "Copy Client",
          "delete": "Delete Client",
          "edit": "Edit Client"
        }
      },
      "sidebar": {
        "copy": "Copy Client",
        "design": "Edit Design",
        "destroy": "Destroy Client",
        "disable": "Disable",
        "edit": "Edit Client",
        "enable": "Enable",
        "licenses": "Edit Licenses",
        "new": "New Client",
        "title": "Client's options (#%{id})"
      },
      "statistics": {
        "index": {
          "all_assessments": "All assessments",
          "assessment_type": "Assessment type",
          "title": "Statistics"
        }
      },
      "toggle_status": {
        "successfully": "Client %{name} was successfully updated."
      },
      "update": {
        "successfully": "Client %{name} was successfully updated."
      },
      "users": {
        "assigns": {
          "index": {
            "add": "Assign New Assessment",
            "title": "Assessments and Reporting"
          },
          "list": {
            "actions": "Actions",
            "assessment_name": "Assessment Name",
            "assessment_type": "Assessment Type",
            "reports": "Reports",
            "status": "Completion Status",
            "uniq_id": "Uniq ID"
          },
          "resource": {
            "no_access_to_reports": "No access to reports",
            "no_completed": "Not completed",
            "no_reports": "No relative reports",
            "tooltips": {
              "delete": "Delete Assign"
            }
          }
        },
        "create": {
          "successfully": "User %{name} was successfully created."
        },
        "destroy": {
          "successfully": "User %{name} was successfully destroyed."
        },
        "edit": {
          "add": "Add",
          "hris_data": "HRIS Data",
          "key": "Key",
          "personal_data": "Personal Data",
          "remove": "Remove",
          "title": "Edit user",
          "value": "Value"
        },
        "form": {
          "choose": " - Choose - "
        },
        "index": {
          "add": "Add new user",
          "export": "Export",
          "filterrific": {
            "with_role": {
              "administration": "Administrators",
              "all": "All",
              "users": "Users"
            }
          },
          "import": "Import",
          "import_hris": "HRIS Data",
          "import_users": "Users",
          "title": "Users",
          "tooltips": {
            "create": "Create",
            "export": "Export",
            "import": "Import"
          }
        },
        "new": {
          "header": "New user"
        },
        "reports": {
          "copy": {
            "error": "Report #%{id} was not copied."
          },
          "destroy": {
            "successfully": "Report %{name} was successfully destroyed."
          },
          "edit": {
            "header": "Edit Report Name"
          },
          "index": {
            "filterrific": {
              "with_assessment_category": {
                "360": "360 Feedback",
                "all": "All",
                "organisational": "Org Surveys",
                "psychometric": "Psychometrics"
              }
            },
            "title": "Reports",
            "tooltips": {
              "create": "Create"
            }
          },
          "new": {
            "header": "New Report"
          },
          "preview": {
            "export_pdf": "Export to PDF",
            "title": "Preview"
          },
          "resource": {
            "confirmations": {
              "delete": {
                "body": "<p>Are you sure you want to delete this Report?</p>\n",
                "title": "Delete <strong>Report</strong> ?"
              },
              "toggle_status": {
                "body": "<p>Are you sure you want to %{status} this Report?</p>\n",
                "title": "<strong>%{status}</strong> %{name}?"
              }
            },
            "tooltips": {
              "copy": "Copy Report",
              "delete": "Delete Report",
              "edit": "Edit Report",
              "preview": "Preview Report"
            }
          },
          "sidebar": {
            "copy": "Copy Report",
            "destroy": "Delete Report",
            "edit": "Edit Report",
            "title": "Report's options (#%{id})",
            "view": "View Report"
          },
          "toggle_status": {
            "successfully": "Report was successfully updated."
          }
        },
        "reset_password": {
          "successfully": "User  %{name} will receive an email with instructions on how to reset his (her) password in a few minutes."
        },
        "resource": {
          "confirmations": {
            "change_password": {
              "body": "<p>Are you sure you want to send instructions with link to change password?</p>\n",
              "title": "Change password <strong>%{name}</strong> ?"
            },
            "delete": {
              "body": "<p>Are you sure you want to delete this User?</p>\n",
              "title": "Delete <strong>%{name}</strong> ?"
            },
            "membership": {
              "delete": {
                "body": "<p>Are you sure you want to delete?</p>\n",
                "title": "Delete <strong>%{name}</strong> from %{client_name} Client Tenancy?"
              }
            },
            "toggle_status": {
              "body": "<p>Are you sure you want to %{status} this User?</p>\n",
              "title": "<strong>%{status}</strong> %{name}?"
            }
          },
          "tooltips": {
            "change_password": "Change password",
            "chart": "View user report",
            "delete": "Delete user",
            "edit": "Edit user",
            "mail": "Send mail",
            "sign_in": "Login as user"
          }
        },
        "sidebar": {
          "assessments_and_reports": "Assessments and Reporting",
          "destroy": "Delete User",
          "disable": "Disable",
          "edit_user": "Edit User",
          "email": "Send mail",
          "enable": "Enable",
          "export_users": "Export users",
          "import_users": "Import users",
          "login_as_user": "Login as User",
          "new_user": "New User",
          "reset_password": "Change Password",
          "title": "User's options (#%{id})"
        },
        "spoof": {
          "successfully": "You was successfully login as %{name}"
        },
        "toggle_status": {
          "successfully": "User %{name} was successfully updated."
        },
        "update": {
          "successfully": "User %{name} was successfully updated."
        }
      }
    },
    "close": "Close",
    "communications": {
      "copy": {
        "error": "Communication #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Communication %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit Communication"
      },
      "form": {
        "body_mustache": "{{first_name}} - Recipient First Name\n{{last_name}} - Recipient Last Name\n{{email}} - Recipient Email\n",
        "delivery_rules": {
          "after_complete": "Right after completion",
          "if_not_finished": "If assessment was not finished",
          "if_not_started": "If assessment is not started",
          "on_specific_datetime": "Specific date and time"
        },
        "selected_cc_recipients": "Selected CC Recipients",
        "selected_recipients": "Selected Recipients"
      },
      "index": {
        "add_new": "Add new",
        "title": "Communication Center",
        "tooltips": {
          "create": "Create"
        }
      },
      "new": {
        "header": "New Communication"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Communication?</p>\n",
            "title": "Delete <strong>Communication</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Communication?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Communication",
          "delete": "Delete Communication",
          "edit": "Edit Communication"
        }
      },
      "sidebar": {
        "copy": "Copy Communication",
        "destroy": "Delete Communication",
        "disable": "Disable Communication",
        "edit": "Edit Communication",
        "enable": "Enable Communication",
        "new": "New Communication",
        "title": "Communication's options (#%{id})",
        "view": "View Communication"
      },
      "toggle_status": {
        "successfully": "Communication was successfully updated."
      }
    },
    "copy": "Copy",
    "create": "Create",
    "dimensions": {
      "copy": {
        "error": "Dimension #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Dimension %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit Dimension Name"
      },
      "index": {
        "title": "Dimensions",
        "tooltips": {
          "create": "Create"
        }
      },
      "new": {
        "header": "New Dimension"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Dimension?</p>\n",
            "title": "Delete <strong>Dimension</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Dimension?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Dimension",
          "delete": "Delete Dimension",
          "edit": "Edit Dimension Name"
        }
      },
      "sidebar": {
        "assign": "Assign Dimension",
        "copy": "Copy Dimension",
        "destroy": "Delete Dimension",
        "disable": "Disable Dimension",
        "edit": "Edit Dimension Name",
        "enable": "Enable Dimension",
        "new": "New Dimension",
        "title": "Dimension's options (#%{id})",
        "view": "View Dimension"
      },
      "toggle_status": {
        "successfully": "Dimension was successfully updated."
      }
    },
    "disable": "Disable",
    "edit": "Edit",
    "enable": "Enable",
    "factors": {
      "copy": {
        "error": "Factor #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Factor %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit Factor Name"
      },
      "form": {
        "no_icon": "No Logo yet"
      },
      "index": {
        "icon": "Icon",
        "title": "Factors",
        "tooltips": {
          "create": "Create"
        }
      },
      "new": {
        "header": "New Factor"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Factor?</p>\n",
            "title": "Delete <strong>Factor</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Factor?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Factor",
          "delete": "Delete Factor",
          "edit": "Edit Factor Name"
        }
      },
      "sidebar": {
        "copy": "Copy Factor",
        "destroy": "Delete Factor",
        "edit": "Edit Factor Name",
        "title": "Factor's options (#%{id})",
        "view": "View Factor"
      },
      "toggle_status": {
        "successfully": "Factor was successfully updated."
      }
    },
    "genders": {
      "female": "Female",
      "male": "Male",
      "not_set": "Not set"
    },
    "home": {
      "index": {
        "notifications": "Notifications"
      }
    },
    "import": "Import",
    "imports": {
      "assessments": {
        "results": {
          "form": {
            "import": "Import"
          }
        }
      },
      "base": {
        "form": {
          "import": "Import"
        }
      },
      "errors": {
        "error": "[Row %{row}] %{error}",
        "invalid_assign": "Can't to find record for specified Result ID. If you want to create new result, please, leave Result ID column empty",
        "invalid_format": "There is no Email column",
        "norm": {
          "factor_is_not_described": "[#%{coords}] factor %{factor} is not described above",
          "factors_mismatch": "[#%{coords}] dimension %{dimension} does not have factor %{factor}",
          "not_set_dimension": "The name of the Dimension should be written in A-1",
          "sub_factors_mismatch": "[#%{coords}] dimension %{dimension} does not have sub factor %{factor}"
        },
        "result": {
          "error": "[Row %{row}] %{error}",
          "invalid_assign": "[Row %{row}] Can't to find record for specified Result ID. If you want to create new result, please, leave Result ID column empty",
          "invalid_format": "Invalid File format"
        },
        "translation": {
          "error": "[Translation %{id}] %{error}",
          "invalid_format": "Invalid File format"
        },
        "unknown_type": "Unknown file type: %{filename}",
        "user": {
          "not_found": "[Row %{row}] Couldn't find User with Email Address %{email}"
        }
      },
      "form": {
        "import": "Import"
      },
      "hris": {
        "form": {
          "import": "Import"
        }
      },
      "new": {
        "header": "Import"
      },
      "users": {
        "form": {
          "import": "Import"
        }
      }
    },
    "imports_assessments_result_imports": {
      "create": {
        "successfully": "Raw Results data was successfully imported"
      },
      "new": {
        "header": "Import Raw Results data"
      }
    },
    "imports_hris_imports": {
      "create": {
        "successfully": "HRIS data was successfully imported"
      },
      "new": {
        "header": "Import HRIS data"
      }
    },
    "imports_user_imports": {
      "create": {
        "successfully": "Users was successfully imported"
      },
      "new": {
        "header": "Import Users"
      }
    },
    "libraries": {
      "create": {
        "successfully": "Item %{name} was successfully created."
      },
      "destroy": {
        "successfully": "Item %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit"
      },
      "index": {
        "title": "Media Library"
      },
      "list": {
        "new_folder": "New folder",
        "root": "Media Library",
        "upload": "Upload new file"
      },
      "new": {
        "header": "New Report"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete %{name}?</p>\n",
            "title": "Delete <strong>%{name}</strong> ?"
          }
        },
        "tooltips": {
          "delete": "Delete",
          "edit": "Edit"
        }
      },
      "update": {
        "successfully": "Item %{name} was successfully updated."
      }
    },
    "memberships": {
      "create": {
        "successfully": "User %{name} was successfully created."
      },
      "destroy": {
        "successfully": "User %{name} was successfully destroyed."
      },
      "edit": {
        "add": "Add",
        "hris_data": "HRIS Data",
        "key": "Key",
        "personal_data": "Personal Data",
        "remove": "Remove",
        "title": "Edit user",
        "value": "Value"
      },
      "index": {
        "add": "Add new user",
        "export": "Export",
        "filterrific": {
          "with_role": {
            "administration": "Administrators",
            "all": "All",
            "users": "Users"
          }
        },
        "import": "Import",
        "import_hris": "HRIS Data",
        "import_users": "Users",
        "title": "Users",
        "tooltips": {
          "create": "Create",
          "export": "Export",
          "import": "Import"
        }
      },
      "new": {
        "header": "New user"
      },
      "reset_password": {
        "successfully": "User  %{name} will receive an email with instructions on how to reset his (her) password in a few minutes."
      },
      "spoof": {
        "successfully": "You was successfully login as %{name}"
      },
      "toggle_status": {
        "successfully": "User %{name} was successfully updated."
      },
      "update": {
        "successfully": "User %{name} was successfully updated."
      }
    },
    "meta_title": "Administration panel",
    "navigation": {
      "assessments": "Assessments",
      "client": "Client Tenancy",
      "clients": "Client Tenancies",
      "communication_center": "Communication Center",
      "create": "Create",
      "design": "Design",
      "dimension": "Dimension",
      "dimensions": "Dimensions",
      "factors": "Factors",
      "home": "Dashboard",
      "libraries": "Media Library",
      "norm": "Norm",
      "norms": "Norms",
      "norms_editor": "Norm Editor",
      "occupations": "Occupations",
      "occupations_factors": "Factors",
      "psychometrics": "Psychometrics",
      "question_center": "Question Center",
      "reports": "Reports",
      "statistics": "Statistics",
      "sub_factors": "Sub-Factors",
      "survey": "Survey",
      "surveys": "Surveys",
      "users": "Users",
      "users_add": "Add New",
      "users_import": "Import"
    },
    "new": "New",
    "no_data_found": "No data found",
    "norms": {
      "copy": {
        "error": "Norm #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Norm %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Rename Norm"
      },
      "editor": {
        "factors": "Factors",
        "inplace_title": "Enter value",
        "sub_factors": "Sub Factors",
        "title": "Norm Editor",
        "tooltips": {
          "edit": "Edit Title"
        }
      },
      "index": {
        "title": "Norms",
        "tooltips": {
          "create": "Create",
          "import": "Import"
        }
      },
      "new": {
        "header": "New norm"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Norm?</p>\n",
            "title": "Delete <strong>Norm</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Norm?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Norm",
          "delete": "Delete Norm",
          "edit": "Rename Norm"
        }
      },
      "sidebar": {
        "assign": "Assign Norm",
        "copy": "Copy Norm",
        "destroy": "Delete Norm",
        "disable": "Disable",
        "edit": "Rename Norm",
        "editor": "Norm Editor",
        "enable": "Enable",
        "export": "Export Norm",
        "import": "Import Norm",
        "new": "New Norm",
        "surveys": "Linked Surveys",
        "title": "Norm's options (#%{id})",
        "view": "View Norm"
      },
      "toggle_status": {
        "successfully": "Norm was successfully updated."
      }
    },
    "noty": {
      "error_500": "Something went wrong. Contact your administrator."
    },
    "occupations": {
      "copy": {
        "error": "Occupation #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Occupation #%{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit occupation"
      },
      "form": {
        "hint": {
          "key_career_tracks": "\"+\" - list, \"*\" - bold. Example: + *Biology* - some description..."
        }
      },
      "index": {
        "title": "Occupations",
        "tooltips": {
          "create": "Create"
        }
      },
      "new": {
        "header": "New occupation"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this occupation?</p>",
            "title": "Delete <strong>Occupation</strong> ?"
          }
        },
        "tooltips": {
          "copy": "Copy Occupation",
          "delete": "Delete Occupation",
          "edit": "Edit Occupation"
        }
      },
      "sidebar": {
        "copy": "Copy Occupation",
        "disable": "Disable",
        "edit": "Edit",
        "enable": "Enable",
        "new": "New Occupation",
        "title": "Occupation's options"
      },
      "toggle_status": {
        "successfully": "Occupation was successfully updated."
      }
    },
    "occupations_factors": {
      "copy": {
        "error": "Factor #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Factor #%{name} was successfully detached."
      },
      "edit": {
        "header": "Edit Factor"
      },
      "index": {
        "title": "Factors",
        "tooltips": {
          "create": "Create"
        }
      },
      "new": {
        "header": "Attach Factors"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this factor?</p>",
            "title": "Delete <strong>Factor</strong> ?"
          }
        },
        "tooltips": {
          "delete": "Delete Factor",
          "edit": "Edit Factor"
        }
      },
      "sidebar": {
        "disable": "Disable",
        "edit": "Edit",
        "enable": "Enable",
        "new": "Attach Factor",
        "title": "Factor's options"
      },
      "toggle_status": {
        "successfully": "Factor was successfully updated."
      }
    },
    "profiles": {
      "edit": {
        "success": "Profile was successfully updated.",
        "title": "Profile Editor"
      }
    },
    "psychometrics": "Psychometrics",
    "questions": {
      "destroy": {
        "successfully": "Question %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit Question"
      },
      "new": {
        "header": "New Question"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Question?</p>\n",
            "title": "Delete <strong>Question</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Question?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        }
      }
    },
    "reports": {
      "copy": {
        "error": "Report #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Report %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit Report Name"
      },
      "index": {
        "filterrific": {
          "with_assessment_category": {
            "360": "360 Feedback",
            "all": "All",
            "organisational": "Org Surveys",
            "psychometric": "Psychometrics"
          }
        },
        "title": "Reports",
        "tooltips": {
          "create": "Create"
        }
      },
      "new": {
        "header": "New Report"
      },
      "preview": {
        "export_pdf": "Export to PDF",
        "title": "Preview"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Report?</p>\n",
            "title": "Delete <strong>Report</strong> ?"
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this Report?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "copy": "Copy Report",
          "delete": "Delete Report",
          "edit": "Edit Report",
          "preview": "Preview Report"
        }
      },
      "sidebar": {
        "copy": "Copy Report",
        "destroy": "Delete Report",
        "edit": "Edit Report",
        "title": "Report's options (#%{id})",
        "view": "View Report"
      },
      "toggle_status": {
        "successfully": "Report was successfully updated."
      }
    },
    "search": "Search",
    "show": "Show",
    "sub_factors": {
      "copy": {
        "error": "Sub-Factor #%{id} was not copied."
      },
      "destroy": {
        "successfully": "Sub-Factor %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit Sub-Factor Name"
      },
      "index": {
        "title": "Sub-Factors",
        "tooltips": {
          "create": "Create"
        }
      },
      "new": {
        "header": "New Sub-Factor"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Sub-Factor?</p>",
            "title": "Delete <strong>Sub-Factor</strong> ?"
          }
        },
        "tooltips": {
          "copy": "Copy Sub-Factor",
          "delete": "Delete Sub-Factor",
          "edit": "Edit Sub-Factor Name"
        }
      },
      "sidebar": {
        "destroy": "Delete Sub-Factor",
        "edit": "Edit Sub-Factor Name",
        "title": "Sub-Factor's options (#%{id})"
      },
      "toggle_status": {
        "successfully": "Sub-Factor was successfully updated."
      }
    },
    "templates": {
      "blocks": {
        "copy": {
          "error": "Block #%{name} was not copied."
        },
        "destroy": {
          "successfully": "Block %{name} was successfully destroyed."
        },
        "edit": {
          "header": "Edit Block"
        },
        "index": {
          "add": "Add New Block",
          "templates": {
          },
          "title": "Blocks",
          "tooltips": {
            "create": "Create"
          }
        },
        "new": {
          "header": "New Block"
        },
        "new_assign": {
          "header": "Assign Block to Assessments"
        },
        "resource": {
          "tooltips": {
            "copy": "Copy Block",
            "delete": "Delete Block",
            "edit": "Edit Block"
          }
        },
        "sidebar": {
          "destroy": "Delete Block",
          "disable": "Disable",
          "edit": "Edit Block",
          "enable": "Enable",
          "new": "New Block",
          "title": "Block's options (#%{id})"
        }
      },
      "questions": {
        "copy": {
          "error": "Question #%{name} was not copied."
        },
        "destroy": {
          "successfully": "Question %{name} was successfully destroyed."
        },
        "edit": {
          "header": "Edit Question"
        },
        "index": {
          "add": "Add New Question",
          "templates": {
            "blocks": "Blocks",
            "questions": "Questions"
          },
          "title": "Questions",
          "tooltips": {
            "create": "Create"
          }
        },
        "new": {
          "header": "New Question"
        },
        "new_assign": {
          "header": "Assign Question to Assessments"
        },
        "resource": {
          "tooltips": {
            "copy": "Copy Question",
            "delete": "Delete Question",
            "edit": "Edit Question"
          }
        },
        "sidebar": {
          "destroy": "Delete Question",
          "disable": "Disable",
          "edit": "Edit Question",
          "enable": "Enable",
          "new": "New Question",
          "title": "Question's options (#%{id})"
        }
      }
    },
    "translations": {
      "assessments": {
        "new": {
          "header": "Import Translations"
        }
      },
      "import": {
        "successfully": "Translations was successfully imported"
      }
    },
    "uniq_id": "Uniq ID",
    "update": "Update",
    "users": {
      "create": {
        "successfully": "User %{name} was successfully created."
      },
      "destroy": {
        "successfully": "User %{name} was successfully destroyed."
      },
      "edit": {
        "add": "Add",
        "hris_data": "HRIS Data",
        "key": "Key",
        "personal_data": "Personal Data",
        "remove": "Remove",
        "title": "Edit user",
        "value": "Value"
      },
      "form": {
        "choose": " - Choose - "
      },
      "index": {
        "add": "Add new user",
        "export": "Export",
        "filterrific": {
          "with_role": {
            "administration": "Administrators",
            "all": "All",
            "users": "Users"
          }
        },
        "import": "Import",
        "import_hris": "HRIS Data",
        "import_users": "Users",
        "title": "Users",
        "tooltips": {
          "create": "Create",
          "export": "Export",
          "import": "Import"
        }
      },
      "new": {
        "header": "New user"
      },
      "reset_password": {
        "successfully": "User  %{name} will receive an email with instructions on how to reset his (her) password in a few minutes."
      },
      "resource": {
        "confirmations": {
          "change_password": {
            "body": "<p>Are you sure you want to send instructions with link to change password?</p>\n",
            "title": "Change password <strong>%{name}</strong> ?"
          },
          "delete": {
            "body": "<p>Are you sure you want to delete this User?</p>\n",
            "title": "Delete <strong>%{name}</strong> ?"
          },
          "membership": {
            "delete": {
              "body": "<p>Are you sure you want to delete?</p>\n",
              "title": "Delete <strong>%{name}</strong> from %{client_name} Client Tenancy?"
            }
          },
          "toggle_status": {
            "body": "<p>Are you sure you want to %{status} this User?</p>\n",
            "title": "<strong>%{status}</strong> %{name}?"
          }
        },
        "tooltips": {
          "change_password": "Change password",
          "chart": "View user report",
          "delete": "Delete user",
          "edit": "Edit user",
          "mail": "Send mail",
          "sign_in": "Login as user"
        }
      },
      "sidebar": {
        "assessments_and_reports": "Assessments and Reporting",
        "destroy": "Delete User",
        "disable": "Disable",
        "edit_user": "Edit User",
        "email": "Send mail",
        "enable": "Enable",
        "export_users": "Export users",
        "import_users": "Import users",
        "login_as_user": "Login as User",
        "new_user": "New User",
        "reset_password": "Change Password",
        "title": "User's options (#%{id})"
      },
      "spoof": {
        "successfully": "You was successfully login as %{name}"
      },
      "toggle_status": {
        "successfully": "User %{name} was successfully updated."
      },
      "update": {
        "successfully": "User %{name} was successfully updated."
      }
    }
  },
  "assessments": {
    "decorator": {
      "no_description": "Description is empty"
    },
    "index": {
      "managers_dashboard_button": "Managers Dashboard",
      "user_dashboard_button": "User Dashboard"
    },
    "resource": {
      "assigned": "Assigned %{date}",
      "questions": {
        "one": "1 Question",
        "other": "%{count} Questions",
        "zero": "No Questions"
      },
      "results": "Results",
      "status": {
        "completed": "Completed",
        "in_progress": "Resume",
        "not_started": "Start"
      }
    }
  },
  "assigns": {
    "decorator": {
      "completed": "Completed %{date}",
      "not_completed": "Not Completed"
    },
    "notifications": {
      "completed": "%{user_name} finished assessment \"%{assessment_name}\"",
      "in_progress": "%{user_name} started to take assessment \"%{assessment_name}\""
    }
  },
  "ckeditor": {
    "buttons": {
      "cancel": "Cancel",
      "delete": "Delete",
      "next": "Next",
      "upload": "Upload"
    },
    "confirm_delete": "Delete file?",
    "page_title": "CKEditor Files Manager"
  },
  "clear_filter": "Clear Filter",
  "confirmation": {
    "default_body": "Are you sure?",
    "default_title": "Confirmation"
  },
  "date": {
    "abbr_day_names": [
      "Sun",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ],
    "abbr_month_names": [
      null,
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ],
    "day_names": [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ],
    "formats": {
      "default": "%Y-%m-%d",
      "long": "%B %d, %Y",
      "short": "%b %d"
    },
    "month_names": [
      null,
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ],
    "order": [
      "year",
      "month",
      "day"
    ]
  },
  "datetime": {
    "distance_in_words": {
      "about_x_hours": {
        "one": "about 1 hour",
        "other": "about %{count} hours"
      },
      "about_x_months": {
        "one": "about 1 month",
        "other": "about %{count} months"
      },
      "about_x_years": {
        "one": "about 1 year",
        "other": "about %{count} years"
      },
      "almost_x_years": {
        "one": "almost 1 year",
        "other": "almost %{count} years"
      },
      "half_a_minute": "half a minute",
      "less_than_x_minutes": {
        "one": "less than a minute",
        "other": "less than %{count} minutes"
      },
      "less_than_x_seconds": {
        "one": "less than 1 second",
        "other": "less than %{count} seconds"
      },
      "over_x_years": {
        "one": "over 1 year",
        "other": "over %{count} years"
      },
      "x_days": {
        "one": "1 day",
        "other": "%{count} days"
      },
      "x_minutes": {
        "one": "1 minute",
        "other": "%{count} minutes"
      },
      "x_months": {
        "one": "1 month",
        "other": "%{count} months"
      },
      "x_seconds": {
        "one": "1 second",
        "other": "%{count} seconds"
      }
    },
    "prompts": {
      "day": "Day",
      "hour": "Hour",
      "minute": "Minute",
      "month": "Month",
      "second": "Seconds",
      "year": "Year"
    }
  },
  "devise": {
    "administrators": {
      "meta_title": "Login to administration panel",
      "passwords": {
        "edit": {
          "submit": "Set new password",
          "title": "Change your password"
        },
        "new": {
          "back": "Return back",
          "submit": "Send me instructions",
          "title": "Forgot your password?"
        }
      },
      "sessions": {
        "new": {
          "forgot_password": "Forgot your password?",
          "submit": "Login",
          "title": "<strong>Welcome</strong>, Please login"
        }
      },
      "shared": {
        "links": {
          "about": "About",
          "app_name": "© 2016 AppName",
          "contact_us": "Contact Us",
          "privacy": "Privacy"
        }
      }
    },
    "confirmations": {
      "confirmed": "Your email address has been successfully confirmed.",
      "new": {
        "resend_confirmation_instructions": "Resend confirmation instructions"
      },
      "send_instructions": "You will receive an email with instructions for how to confirm your email address in a few minutes.",
      "send_paranoid_instructions": "If your email address exists in our database, you will receive an email with instructions for how to confirm your email address in a few minutes."
    },
    "failure": {
      "already_authenticated": "You are already signed in.",
      "inactive": "Your account is not activated yet.",
      "invalid": "Invalid %{authentication_keys} or password.",
      "invited": "You have a pending invitation, accept it to finish creating your account.",
      "last_attempt": "You have one more attempt before your account is locked.",
      "locked": "Your account is locked.",
      "not_found_in_database": "Invalid %{authentication_keys} or password.",
      "timeout": "Your session expired. Please login again to continue.",
      "unauthenticated": "You need to login or register before continuing.",
      "unconfirmed": "You have to confirm your email address before continuing."
    },
    "invitations": {
      "edit": {
        "header": "Set your password",
        "submit_button": "Set my password"
      },
      "invitation_removed": "Your invitation was removed.",
      "invitation_token_invalid": "The invitation token provided is not valid!",
      "new": {
        "header": "Send invitation",
        "submit_button": "Send an invitation"
      },
      "no_invitations_remaining": "No invitations remaining",
      "send_instructions": "An invitation email has been sent to %{email}.",
      "updated": "Your password was set successfully. You are now signed in.",
      "updated_not_active": "Your password was set successfully."
    },
    "mailer": {
      "confirmation_instructions": {
        "action": "Confirm my account",
        "greeting": "Welcome %{recipient}!",
        "instruction": "You can confirm your account email through the link below:",
        "subject": "Confirmation instructions"
      },
      "invitation_instructions": {
        "accept": "Accept invitation",
        "accept_until": "This invitation will be due in %{due_date}.",
        "hello": "Hello %{email}",
        "ignore": "If you don't want to accept the invitation, please ignore this email.<br />\nYour account won't be created until you access the link above and set your password.",
        "someone_invited_you": "Someone has invited you to %{url}, you can accept it through the link below.",
        "subject": "Invitation instructions"
      },
      "password_change": {
        "greeting": "Hello %{recipient}!",
        "message": "We're contacting you to notify you that your password has been changed.",
        "subject": "Password Changed"
      },
      "reset_password_instructions": {
        "action": "Change my password",
        "greeting": "Hello %{recipient}!",
        "instruction": "Someone has requested a link to change your password, and you can do this through the link below.",
        "instruction_2": "If you didn't request this, please ignore this email.",
        "instruction_3": "Your password won't change until you access the link above and create a new one.",
        "subject": "Reset password instructions"
      },
      "unlock_instructions": {
        "action": "Unlock my account",
        "greeting": "Hello %{recipient}!",
        "instruction": "Click the link below to unlock your account:",
        "message": "Your account has been locked due to an excessive amount of unsuccessful sign in attempts.",
        "subject": "Unlock instructions"
      }
    },
    "omniauth_callbacks": {
      "failure": "Could not authenticate you from %{kind} because \"%{reason}\".",
      "success": "Successfully authenticated from %{kind} account."
    },
    "passwords": {
      "edit": {
        "change_my_password": "Change my password",
        "change_your_password": "Change your password",
        "confirm_new_password": "Confirm new password",
        "new_password": "New password"
      },
      "new": {
        "forgot_your_password": "Forgot your password?",
        "send_me_reset_password_instructions": "Send me reset password instructions"
      },
      "no_token": "You can't access this page without coming from a password reset email. If you do come from a password reset email, please make sure you used the full URL provided.",
      "send_instructions": "You will receive an email with instructions on how to reset your password in a few minutes.",
      "send_paranoid_instructions": "If your email address exists in our database, you will receive a password recovery link at your email address in a few minutes.",
      "updated": "Your password has been changed successfully. You are now signed in.",
      "updated_not_active": "Your password has been changed successfully."
    },
    "registrations": {
      "destroyed": "Bye! Your account has been successfully cancelled. We hope to see you again soon.",
      "edit": {
        "are_you_sure": "Are you sure?",
        "cancel_my_account": "Cancel my account",
        "currently_waiting_confirmation_for_email": "Currently waiting confirmation for: %{email}",
        "leave_blank_if_you_don_t_want_to_change_it": "leave blank if you don't want to change it",
        "title": "Edit %{resource}",
        "unhappy": "Unhappy",
        "update": "Update",
        "we_need_your_current_password_to_confirm_your_changes": "we need your current password to confirm your changes"
      },
      "new": {
        "sign_up": "Sign up"
      },
      "signed_up": "Welcome! You have signed up successfully.",
      "signed_up_but_inactive": "You have signed up successfully. However, we could not sign you in because your account is not yet activated.",
      "signed_up_but_locked": "You have signed up successfully. However, we could not sign you in because your account is locked.",
      "signed_up_but_unconfirmed": "A message with a confirmation link has been sent to your email address. Please follow the link to activate your account.",
      "update_needs_confirmation": "You updated your account successfully, but we need to verify your new email address. Please check your email and follow the confirm link to confirm your new email address.",
      "updated": "Your account has been updated successfully."
    },
    "sessions": {
      "already_signed_out": "Signed out successfully.",
      "new": {
        "sign_in": "Sign in"
      },
      "signed_in": "Signed in successfully.",
      "signed_out": "Signed out successfully."
    },
    "shared": {
      "links": {
        "back": "Back",
        "didn_t_receive_confirmation_instructions": "Didn't receive confirmation instructions?",
        "didn_t_receive_unlock_instructions": "Didn't receive unlock instructions?",
        "forgot_your_password": "Forgot your password?",
        "sign_in": "Sign in",
        "sign_in_with_provider": "Sign in with %{provider}",
        "sign_up": "Sign up"
      }
    },
    "unlocks": {
      "new": {
        "resend_unlock_instructions": "Resend unlock instructions"
      },
      "send_instructions": "You will receive an email with instructions for how to unlock your account in a few minutes.",
      "send_paranoid_instructions": "If your account exists, you will receive an email with instructions for how to unlock it in a few minutes.",
      "unlocked": "Your account has been unlocked successfully. Please login to continue."
    },
    "users": {
      "passwords": {
        "new": {
          "submit": "Send me instructions",
          "tabs": {
            "register": "Register",
            "sign_in": "Sign In"
          }
        }
      },
      "registrations": {
        "new": {
          "submit": "Register",
          "tabs": {
            "register": "Register",
            "sign_in": "Sign In"
          }
        }
      },
      "sessions": {
        "new": {
          "forgot_password": "Forgot password?",
          "keep_sign_in": "Yes, Keep me signed in",
          "submit": "Sign In",
          "tabs": {
            "register": "Register",
            "sign_in": "Sign In"
          }
        }
      }
    }
  },
  "errors": {
    "connection_refused": "Oops! Failed to connect to the Web Console middleware.\nPlease make sure a rails development server is running.\n",
    "format": "%{attribute} %{message}",
    "messages": {
      "accepted": "must be accepted",
      "allowed_file_content_types": "file should be one of %{types}",
      "already_confirmed": "was already confirmed, please try signing in",
      "blank": "can't be blank",
      "carrierwave_download_error": "could not be downloaded",
      "carrierwave_integrity_error": "is not of an allowed file type",
      "carrierwave_processing_error": "failed to be processed",
      "confirmation": "doesn't match %{attribute}",
      "confirmation_period_expired": "needs to be confirmed within %{period}, please request a new one",
      "empty": "can't be empty",
      "equal_to": "must be equal to %{count}",
      "even": "must be even",
      "excluded_file_content_types": "file cannot be %{types}",
      "exclusion": "is reserved",
      "expired": "has expired, please request a new one",
      "extension_black_list_error": "You are not allowed to upload %{extension} files, prohibited types: %{prohibited_types}",
      "extension_white_list_error": "You are not allowed to upload %{extension} files, allowed types: %{allowed_types}",
      "file_size_is_greater_than": "file size must be greater than %{count}",
      "file_size_is_greater_than_or_equal_to": "file size must be greater than or equal to %{count}",
      "file_size_is_in": "file size must be between %{min} and %{max}",
      "file_size_is_less_than": "file size must be less than %{count}",
      "file_size_is_less_than_or_equal_to": "file size must be less than or equal to %{count}",
      "greater_than": "must be greater than %{count}",
      "greater_than_or_equal_to": "must be greater than or equal to %{count}",
      "inclusion": "is not included in the list",
      "invalid": "is invalid",
      "less_than": "must be less than %{count}",
      "less_than_or_equal_to": "must be less than or equal to %{count}",
      "mime_types_processing_error": "Failed to process file with MIME::Types, maybe not valid content-type? Original Error: %{e}",
      "mini_magick_processing_error": "Failed to manipulate with MiniMagick, maybe it is not an image? Original Error: %{e}",
      "model_invalid": "Validation failed: %{errors}",
      "not_a_number": "is not a number",
      "not_an_integer": "must be an integer",
      "not_found": "not found",
      "not_locked": "was not locked",
      "not_saved": {
        "one": "1 error prohibited this %{resource} from being saved:",
        "other": "%{count} errors prohibited this %{resource} from being saved:"
      },
      "odd": "must be odd",
      "other_than": "must be other than %{count}",
      "present": "must be blank",
      "required": "must exist",
      "rmagick_processing_error": "Failed to manipulate with rmagick, maybe it is not an image? Original Error: %{e}",
      "taken": "has already been taken",
      "too_long": {
        "one": "is too long (maximum is 1 character)",
        "other": "is too long (maximum is %{count} characters)"
      },
      "too_short": {
        "one": "is too short (minimum is 1 character)",
        "other": "is too short (minimum is %{count} characters)"
      },
      "wrong_length": {
        "one": "is the wrong length (should be 1 character)",
        "other": "is the wrong length (should be %{count} characters)"
      }
    },
    "unacceptable_request": "A supported version is expected in the Accept header.\n",
    "unavailable_session": "Session %{id} is is no longer available in memory.\n\nIf you happen to run on a multi-process server (like Unicorn or Puma) the process\nthis request hit doesn't store %{id} in memory. Consider turning the number of\nprocesses/workers to one (1) or using a different server in development.\n"
  },
  "flash": {
    "actions": {
      "create": {
        "notice": "%{resource_name} was successfully created."
      },
      "destroy": {
        "alert": "%{resource_name} could not be destroyed.",
        "notice": "%{resource_name} was successfully destroyed."
      },
      "update": {
        "notice": "%{resource_name} was successfully updated."
      }
    }
  },
  "helpers": {
    "page_entries_info": {
      "more_pages": {
        "display_entries": "Displaying %{entry_name} <b>%{first}&nbsp;-&nbsp;%{last}</b> of <b>%{total}</b> in total"
      },
      "one_page": {
        "display_entries": {
          "one": "Displaying <b>1</b> %{entry_name}",
          "other": "Displaying <b>all %{count}</b> %{entry_name}",
          "zero": "No %{entry_name} found"
        }
      }
    },
    "select": {
      "prompt": "Please select"
    },
    "submit": {
      "create": "Create %{model}",
      "submit": "Save %{model}",
      "update": "Update %{model}"
    }
  },
  "home": {
    "survey_instructions": {
      "title": "Instructions"
    }
  },
  "i18n_tasks": {
    "add_missing": {
      "added": {
        "one": "Added %{count} key",
        "other": "Added %{count} keys"
      }
    },
    "cmd": {
      "args": {
        "default_text": "Default: %{value}",
        "desc": {
          "confirm": "Confirm automatically",
          "data_format": "Data format: %{valid_text}.",
          "key_pattern": "Filter by key pattern (e.g. 'common.*')",
          "key_pattern_to_rename": "Full key (pattern) to rename. Required",
          "locale": "i18n_tasks.common.locale",
          "locale_to_translate_from": "Locale to translate from",
          "locales_filter": "Locale(s) to process. Special: base",
          "missing_types": "Filter by types: %{valid}",
          "new_key_name": "New name, interpolates original name as %{key}. Required",
          "nostdin": "Do not read from stdin",
          "out_format": "Output format: %{valid_text}",
          "pattern_router": "Use pattern router: keys moved per config data.write",
          "strict": "Avoid inferring dynamic key usages such as t(\"cats.#{cat}.name\"). Takes precedence over the config setting if set.",
          "value": "Value. Interpolates: %{value}, %{human_key}, %{key}, %{default}, %{value_or_human_key}, %{value_or_default_or_human_key}"
        }
      },
      "desc": {
        "add_missing": "add missing keys to locale data",
        "config": "display i18n-tasks configuration",
        "data": "show locale data",
        "data_merge": "merge locale data with trees",
        "data_remove": "remove keys present in tree from data",
        "data_write": "replace locale data with tree",
        "eq_base": "show translations equal to base value",
        "find": "show where keys are used in the code",
        "gem_path": "show path to the gem",
        "health": "is everything OK?",
        "irb": "start REPL session within i18n-tasks context",
        "missing": "show missing translations",
        "normalize": "normalize translation data: sort and move to the right files",
        "remove_unused": "remove unused keys",
        "translate_missing": "translate missing keys with Google Translate",
        "tree_convert": "convert tree between formats",
        "tree_filter": "filter tree by key pattern",
        "tree_merge": "merge trees",
        "tree_rename_key": "rename tree node",
        "tree_set_value": "set values of keys, optionally match a pattern",
        "tree_subtract": "tree A minus the keys in tree B",
        "tree_translate": "Google Translate a tree to root locales",
        "unused": "show unused translations",
        "xlsx_report": "save missing and unused translations to an Excel file"
      },
      "encourage": [
        "Good job!",
        "Well done!",
        "Perfect!"
      ],
      "enum_list_opt": {
        "invalid": "%{invalid} is not in: %{valid}."
      },
      "enum_opt": {
        "invalid": "%{invalid} is not one of: %{valid}."
      },
      "errors": {
        "invalid_format": "invalid format: %{invalid}. valid: %{valid}.",
        "invalid_locale": "invalid locale: %{invalid}",
        "invalid_missing_type": {
          "one": "invalid type: %{invalid}. valid: %{valid}.",
          "other": "unknown types: %{invalid}. valid: %{valid}."
        },
        "pass_forest": "pass locale forest"
      }
    },
    "common": {
      "base_value": "Base Value",
      "continue_q": "Continue?",
      "key": "Key",
      "locale": "Locale",
      "n_more": "%{count} more",
      "type": "Type",
      "value": "Value"
    },
    "data_stats": {
      "text": "has %{key_count} keys across %{locale_count} locales. On average, values are %{value_chars_avg} characters long, keys have %{key_segments_avg} segments, a locale has %{per_locale_avg} keys.",
      "text_single_locale": "has %{key_count} keys in total. On average, values are %{value_chars_avg} characters long, keys have %{key_segments_avg} segments.",
      "title": "Forest (%{locales})"
    },
    "google_translate": {
      "errors": {
        "no_api_key": "Set Google API key via GOOGLE_TRANSLATE_API_KEY environment variable or translation.api_key in config/i18n-tasks.yml. Get the key at https://code.google.com/apis/console.",
        "no_results": "Google Translate returned no results. Make sure billing information is set at https://code.google.com/apis/console."
      }
    },
    "health": {
      "no_keys_detected": "No keys detected. Check data.read in config/i18n-tasks.yml."
    },
    "missing": {
      "details_title": "Value in other locales or source",
      "none": "No translations are missing."
    },
    "remove_unused": {
      "confirm": {
        "one": "%{count} translation will be removed from %{locales}.",
        "other": "%{count} translation will be removed from %{locales}."
      },
      "noop": "No unused keys to remove",
      "removed": "Removed %{count} keys"
    },
    "translate_missing": {
      "translated": "Translated %{count} keys"
    },
    "unused": {
      "none": "Every translation is in use."
    },
    "usages": {
      "none": "No key usages found."
    }
  },
  "languages": {
    "ar": "Arabic",
    "cn": "Chinese",
    "de": "German",
    "en": "English",
    "es": "Spanish",
    "fr": "French"
  },
  "layouts": {
    "users": {
      "dashboard": "Dashboard",
      "help": "Help",
      "logout": "Log Out",
      "menu": "Menu",
      "notifications": "Notifications",
      "profile": "Profile"
    }
  },
  "managers": {
    "assigns": {
      "index": {
        "title": "Assessments and Reporting Centre"
      },
      "list": {
        "action": "Action",
        "assessment_name": "Assessment Name",
        "assessment_type": "Assessment Type",
        "completion_date": "Completion Date",
        "name": "Name",
        "status": "Completion Status"
      },
      "resource": {
        "email": "Email",
        "save": "Save in PDF",
        "view": "View"
      }
    },
    "dashboard": {
      "index": {
        "assessment_center": "Assessment / Report Centre",
        "notification_center": "Notification Centre",
        "notifications": "Notifications",
        "relationships": "Company Relationships",
        "reporting": "Reporting",
        "statistics": "Statistics"
      }
    },
    "notifications": {
      "index": {
        "subtitle": "Notifications",
        "title": "Notification Centre"
      }
    },
    "reports": {
      "show": {
        "export_pdf": "Export to PDF",
        "header": "Report"
      }
    },
    "statistics": {
      "index": {
        "title": "Statistics"
      }
    },
    "users": {
      "index": {
        "title": "Company Relationships"
      }
    }
  },
  "no": "No",
  "number": {
    "currency": {
      "format": {
        "delimiter": ",",
        "format": "%u%n",
        "precision": 2,
        "separator": ".",
        "significant": false,
        "strip_insignificant_zeros": false,
        "unit": "$"
      }
    },
    "format": {
      "delimiter": ",",
      "precision": 3,
      "separator": ".",
      "significant": false,
      "strip_insignificant_zeros": false
    },
    "human": {
      "decimal_units": {
        "format": "%n %u",
        "units": {
          "billion": "Billion",
          "million": "Million",
          "quadrillion": "Quadrillion",
          "thousand": "Thousand",
          "trillion": "Trillion",
          "unit": ""
        }
      },
      "format": {
        "delimiter": "",
        "precision": 3,
        "significant": true,
        "strip_insignificant_zeros": true
      },
      "storage_units": {
        "format": "%n %u",
        "units": {
          "byte": {
            "one": "Byte",
            "other": "Bytes"
          },
          "eb": "EB",
          "gb": "GB",
          "kb": "KB",
          "mb": "MB",
          "pb": "PB",
          "tb": "TB"
        }
      }
    },
    "percentage": {
      "format": {
        "delimiter": "",
        "format": "%n%"
      }
    },
    "precision": {
      "format": {
        "delimiter": ""
      }
    }
  },
  "profiles": {
    "edit": {
      "header": "Profile Settings"
    },
    "update": {
      "successfully": "Profile updated"
    }
  },
  "ransack": {
    "all": "all",
    "and": "and",
    "any": "any",
    "asc": "ascending",
    "attribute": "attribute",
    "combinator": "combinator",
    "condition": "condition",
    "desc": "descending",
    "or": "or",
    "predicate": "predicate",
    "predicates": {
      "blank": "is blank",
      "cont": "contains",
      "cont_all": "contains all",
      "cont_any": "contains any",
      "does_not_match": "doesn't match",
      "does_not_match_all": "doesn't match all",
      "does_not_match_any": "doesn't match any",
      "end": "ends with",
      "end_all": "ends with all",
      "end_any": "ends with any",
      "eq": "equals",
      "eq_all": "equals all",
      "eq_any": "equals any",
      "false": "is false",
      "gt": "greater than",
      "gt_all": "greater than all",
      "gt_any": "greater than any",
      "gteq": "greater than or equal to",
      "gteq_all": "greater than or equal to all",
      "gteq_any": "greater than or equal to any",
      "in": "in",
      "in_all": "in all",
      "in_any": "in any",
      "lt": "less than",
      "lt_all": "less than all",
      "lt_any": "less than any",
      "lteq": "less than or equal to",
      "lteq_all": "less than or equal to all",
      "lteq_any": "less than or equal to any",
      "matches": "matches",
      "matches_all": "matches all",
      "matches_any": "matches any",
      "not_cont": "doesn't contain",
      "not_cont_all": "doesn't contain all",
      "not_cont_any": "doesn't contain any",
      "not_end": "doesn't end with",
      "not_end_all": "doesn't end with all",
      "not_end_any": "doesn't end with any",
      "not_eq": "not equal to",
      "not_eq_all": "not equal to all",
      "not_eq_any": "not equal to any",
      "not_in": "not in",
      "not_in_all": "not in all",
      "not_in_any": "not in any",
      "not_null": "is not null",
      "not_start": "doesn't start with",
      "not_start_all": "doesn't start with all",
      "not_start_any": "doesn't start with any",
      "null": "is null",
      "present": "is present",
      "start": "starts with",
      "start_all": "starts with all",
      "start_any": "starts with any",
      "true": "is true"
    },
    "search": "search",
    "sort": "sort",
    "value": "value"
  },
  "reports": {
    "modules": {
      "common": {
        "almost_always": "Almost Always",
        "less_typical": "Less Typical",
        "moderate": "Moderate",
        "more_typical": "More Typical",
        "rare": "Rare"
      },
      "cpi_occupations": {
        "occupations": "Occupations",
        "your_potential_suitability": "Your Potential Suitability"
      },
      "gap_assessment": {
        "gap": "Gap",
        "item": "Item",
        "negative_gap": "Negative Gap",
        "positive_gap": "Positive Gap",
        "rank": "Rank",
        "scoring_category": "Scoring Category"
      },
      "highest_lowest": {
        "bottom_5": "BOTTOM 5",
        "email": "Email",
        "first_name": "First Name",
        "highest_scores": "Highest Scores",
        "item": "Item",
        "last_name": "Last Name",
        "lowest_scores": "Lowest Scores",
        "mean_score": "Mean Score",
        "rank": "Rank",
        "score": "Score",
        "sub_competenties": "Sub-Competencies",
        "top_5": "TOP 5"
      },
      "potential_career_full": {
        "bachelors_or_masters_qualification": "Bachelors or Masters Qualification",
        "detailed_career_guide": "Detailed Career Guide",
        "diploma_qualification": "Diploma Qualification",
        "education_level": "Education Level",
        "high_school_entry_roles": "High School Entry Roles",
        "key_career_tracks_within": "Key Career Tracks Within",
        "potential_areas_of_study": "Potential Areas of Study",
        "potential_roles": "Potential Roles"
      },
      "potential_career_short": {
        "career": "career",
        "for_this": "for this",
        "key": "key",
        "strengths": "strengths",
        "your_scores": "Your Scores"
      }
    },
    "show": {
      "export_pdf": "Export to PDF",
      "header": "Report"
    }
  },
  "simple_form": {
    "error_notification": {
      "default_message": "Please review the problems below:"
    },
    "no": "No",
    "placeholders": {
      "administrator": {
        "active": "Active",
        "created_at": "Created Date",
        "current_password": "Current password",
        "disabled": "Disable",
        "email": "Email Address",
        "first_name": "First Name",
        "id": "ID",
        "last_name": "Last Name",
        "manage_client_ids": "Memberships",
        "memberships": "Memberships",
        "password": "Password",
        "password_confirmation": "Password confirmation",
        "role": "Role",
        "roles": {
          "admin": "Client Admin",
          "manager": "Manager",
          "member": "User",
          "super_admin": "Super Admin",
          "superadmin": "Super Admin"
        },
        "types": {
          "anonymous": "Anonymous Users",
          "identified": "Identified Users"
        },
        "updated_at": "Modified Date"
      },
      "assessment": {
        "active": "Active",
        "categories": {
          "360": "360 Feedback",
          "organisational": "Org Surveys",
          "psychometric": "Psychometrics"
        },
        "category": "Category",
        "completed_at": "Completion Date",
        "created_at": "Created Date",
        "description": "Description",
        "id": "ID",
        "name": "Name",
        "statuses": {
          "completed": "Completed",
          "in_progress": "In Progress",
          "not_started": "New"
        },
        "timing": "Timing",
        "updated_at": "Modified Date"
      },
      "block": {
        "active": "Active",
        "assign_to_assessment_ids": "Assessments",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "client": {
        "category": "Category",
        "created_at": "Created Date",
        "id": "ID",
        "licenses": "License number",
        "licenses_expire": "License expire",
        "licenses_used": "Used license number",
        "logo": "Client logo",
        "name": "Name",
        "subdomain": "Subdomain",
        "updated_at": "Modified Date"
      },
      "dimension": {
        "active": "Active",
        "created_at": "Created Date",
        "factors_count": "No. of Factors",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "factor": {
        "active": "Active",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "parent_id": "Parent",
        "questions_count": "No. Questions",
        "subfactors_count": "No. Sub-Factors",
        "updated_at": "Modified Date"
      },
      "memebrship": {
        "id": "ID",
        "parent": "Direct Manager"
      },
      "norm": {
        "active": "Active",
        "bachelors_or_masters_qualification": "Bachelors or Masters Qualification",
        "created_at": "Created Date",
        "description": "Description",
        "diploma_qualification": "Diploma Qualification",
        "full_description": "Full Description",
        "high_school_entry_roles": "High School Entry Roles",
        "id": "ID",
        "key_career_tracks": "Key Career Tracks",
        "name": "Name",
        "potential_areas_of_study": "Potential Areas of Study",
        "updated_at": "Modified Date",
        "updated_by": "Edited by"
      },
      "question": {
        "active": "Active",
        "assign_to_assessment_ids": "Assessments",
        "created_at": "Created Date",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified Date"
      },
      "user": {
        "active": "Active",
        "created_at": "Created Date",
        "current_password": "Current password",
        "disabled": "Disable",
        "email": "Email Address",
        "first_name": "First Name",
        "id": "ID",
        "last_name": "Last Name",
        "manage_client_ids": "Memberships",
        "memberships": "Memberships",
        "password": "Password",
        "password_confirmation": "Password confirmation",
        "role": "Role",
        "roles": {
          "admin": "Client Admin",
          "manager": "Manager",
          "member": "User",
          "super_admin": "Super Admin",
          "superadmin": "Super Admin"
        },
        "types": {
          "anonymous": "Anonymous Users",
          "identified": "Identified Users"
        },
        "updated_at": "Modified Date"
      }
    },
    "required": {
      "mark": "*",
      "text": "required"
    },
    "yes": "Yes"
  },
  "support": {
    "array": {
      "last_word_connector": ", and ",
      "two_words_connector": " and ",
      "words_connector": ", "
    }
  },
  "time": {
    "am": "am",
    "formats": {
      "date": "%d/%m/%y",
      "default": "%a, %d %b %Y %H:%M:%S %z",
      "devise": {
        "mailer": {
          "invitation_instructions": {
            "accept_until_format": "%B %d, %Y %I:%M %p"
          }
        }
      },
      "long": "%B %d, %Y %H:%M",
      "short": "%d %b %Y / %H:%M"
    },
    "pm": "pm"
  },
  "validations": {
    "character_range": "Your response must be at least %{min} and no more than %{max} characters.",
    "date": "Your response must be a valid date (dd/mm/yyyy)",
    "each_group_contains": "Each group needs to contain not less than %{min} and not more than %{max} items",
    "email": "Your response must be a valid email",
    "issue": "Issue",
    "least": "Please answer at least %{min} choice(s).",
    "least_hotspot": "Please answer at least %{min} choice(s).",
    "max_length": "Your response must be no more than %{max} characters.",
    "min_length": "Your response must be at least %{min} characters.",
    "must_rank_between": "Please assign a value from %{min} to %{max} for each item. Values may not be repeated.",
    "must_select": "Please select from %{min} to %{max} choices",
    "number": "Your response must be a number",
    "range": "Please answer at least %{min} and no more than %{max} choice(s).",
    "text": "Your response must not contain a numbers",
    "title": "Sorry, you cannot continue until you correct the following:"
  },
  "views": {
    "pagination": {
      "first": "&laquo; First",
      "last": "Last &raquo;",
      "next": "Next &rsaquo;",
      "previous": "&lsaquo; Prev",
      "truncate": "&hellip;"
    }
  },
  "yes": "Yes"
});
