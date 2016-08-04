I18n.translations || (I18n.translations = {});
I18n.translations["en"] = I18n.extend((I18n.translations["en"] || {}), {
  "activerecord": {
    "attributes": {
      "assessment": {
        "active": "Active",
        "category": "Category",
        "created_at": "Created",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified"
      },
      "client": {
        "category": "Category",
        "created_at": "Created",
        "id": "ID",
        "licenses": "License number",
        "licenses_expire": "License expire",
        "licenses_used": "Used license number",
        "logo": "Client logo",
        "name": "Name",
        "subdomain": "Subdomain",
        "updated_at": "Modified"
      },
      "dimension": {
        "active": "Active",
        "created_at": "Created",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified"
      },
      "factor": {
        "active": "Active",
        "created_at": "Created",
        "id": "ID",
        "name": "Name",
        "parent_id": "Parent",
        "questions_count": "No. Questions",
        "subfactors_count": "No. Sub-Factors",
        "updated_at": "Modified"
      },
      "norm": {
        "active": "Active",
        "created_at": "Created",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified",
        "updated_by": "Edited by"
      },
      "user": {
        "active": "Active",
        "created_at": "Created",
        "current_password": "Current password",
        "disabled": "Disable",
        "email": "E-mail",
        "first_name": "First Name",
        "id": "ID",
        "last_name": "Last Name",
        "memberships": "Memberships",
        "password": "Password",
        "password_confirmation": "Password confirmation",
        "remember_me": "Remember me",
        "reset_password_token": "Reset password token",
        "role": "Role",
        "roles": {
          "admin": "Client Admin",
          "manager": "Manager",
          "superadmin": "Super Admin",
          "user": "User"
        },
        "unlock_token": "Unlock token",
        "updated_at": "Modified"
      }
    },
    "errors": {
      "messages": {
        "record_invalid": "Validation failed: %{errors}",
        "restrict_dependent_destroy": {
          "has_many": "Cannot delete record because dependent %{record} exist",
          "has_one": "Cannot delete record because a dependent %{record} exists"
        }
      },
      "models": {
        "factors_norm": {
          "score_to_less_than_score_from": "is less than Score from"
        }
      }
    },
    "models": {
      "assessment": "Assessments",
      "client": "Clients",
      "dimension": "Dimensions",
      "factor": "Factors",
      "factors_norm": "factors_norms",
      "norm": "Norms",
      "user": "Users"
    }
  },
  "administration": {
    "actions": "Actions",
    "active": "Active",
    "any": " - Any - ",
    "assessments": {
      "copy": {
        "error": "Assessment #%{name} was not copied.",
        "successfully": "Assessment %{name} was successfully copied."
      },
      "create": {
        "successfully": "Assessment %{name} was successfully created."
      },
      "destroy": {
        "successfully": "Assessment %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit assessment"
      },
      "form": {
        "categories": {
          "360": "360 Assess",
          "organisational": "Organisational Assess",
          "psychometric": "Psychometric Assess"
        }
      },
      "index": {
        "filterrific": {
          "with_category": {
            "360": "360 Assess",
            "organisational": "Organisational Assess",
            "psychometric": "Psychometric Assess"
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
            "body": "<p>Are you sure you want to delete this assessment?</p>\n",
            "title": "Delete <strong>Assessment</strong> ?"
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
        "title": "Assessment's options (#%{id})"
      },
      "toggle_status": {
        "successfully": "Assessment %{name} was successfully updated."
      },
      "update": {
        "successfully": "Assessment %{name} was successfully updated."
      }
    },
    "base": {
      "top_sidebar": {
        "search": "Search...",
        "sign_out_message": {
          "body": "<p>Are you sure you want to log out?</p> <p>Press No if youwant to continue work. Press Yes to logout current user.</p>",
          "title": "Log <strong>Out</strong> ?"
        }
      }
    },
    "breadcrumbs": {
      "assessments": "Assessments",
      "client": "Client Tenancy",
      "clients": "Clients",
      "create": "Create",
      "design": "Design",
      "dimension": "Dimension",
      "dimensions": "Dimensions",
      "factors": "Factors",
      "home": "Dashboard",
      "norm": "Norm",
      "norms": "Norms",
      "norms_editor": "Norm Editor",
      "reporting": "Reporting",
      "sub_factors": "Sub-Factors",
      "survey": "Survey",
      "surveys": "Surveys",
      "users": "Users",
      "users_add": "Add New",
      "users_import": "Import"
    },
    "cable": {
      "notification": {
        "block_clone": "Block is copied",
        "block_create": "Block %{name} is created",
        "block_destroy": "Block is destroyed",
        "block_move_down": "Block is moved down",
        "block_move_up": "Block is moved up",
        "block_permanent_destroy": "Block is permanent destroyed",
        "block_rename": "Block is renamed",
        "block_restore": "Block is restored",
        "block_update": "Block is updated",
        "comment_create": "Comment is created",
        "comment_destroy": "Comment is destroyed",
        "question_clone": "Question is copied",
        "question_create": "Question %{name} is created",
        "question_destroy": "Question is destroyed",
        "question_insert_after": "Question is inserted after",
        "question_insert_before": "Question is inserted before",
        "question_move_down": "Question is moved down",
        "question_move_up": "Question is moved up",
        "question_permanent_destroy": "Question is permanent destroyed",
        "question_rename": "Question is renamed",
        "question_restore": "Question is restored",
        "question_update": "Question is updated",
        "trash_empty": "Trash is empty"
      }
    },
    "choose": " - Choose - ",
    "clear": "Clear",
    "clients": {
      "copy": {
        "error": "Client #%{name} was not copied.",
        "successfully": "Client %{name} was successfully copied."
      },
      "create": {
        "successfully": "Client %{name} was successfully created."
      },
      "destroy": {
        "successfully": "Client %{name} was successfully destroyed."
      },
      "edit": {
        "header": "Edit client"
      },
      "index": {
        "title": "Clients",
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
      "toggle_status": {
        "successfully": "Client %{name} was successfully updated."
      },
      "update": {
        "successfully": "Client %{name} was successfully updated."
      },
      "users": {
        "create": {
          "successfully": "User %{name} was successfully created."
        },
        "destroy": {
          "successfully": "User %{name} was successfully destroyed."
        },
        "edit": {
          "title": "Edit user"
        },
        "form": {
          "choose": " - Choose - "
        },
        "index": {
          "filterrific": {
            "with_role": {
              "administrators": "Administrators",
              "all": "All",
              "users": "Users"
            }
          },
          "title": "Users",
          "tooltips": {
            "create": "Create",
            "export": "Export",
            "import": "Import"
          }
        },
        "list": null,
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
              "body": "<p>Are you sure you want to delete this user?</p>\n",
              "title": "Delete <strong>%{name}</strong> ?"
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
          "destroy": "Delete user",
          "disable": "Disable",
          "edit_user": "Edit user",
          "email": "Send mail",
          "enable": "Enable",
          "export_users": "Export users",
          "import_users": "Import users",
          "login_as_user": "Login as user",
          "new_user": "New user",
          "reset_password": "Change password",
          "title": "User's options (#%{id})",
          "view_report": "View user report"
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
        "header": "Edit dimension"
      },
      "index": {
        "title": "Dimensions",
        "tooltips": {
          "create": "Create"
        }
      },
      "new": {
        "header": "New dimension"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Dimension?</p>\n",
            "title": "Delete <strong>Dimension</strong> ?"
          }
        },
        "tooltips": {
          "copy": "Copy Dimension",
          "delete": "Delete Dimension",
          "edit": "Edit Dimension"
        }
      },
      "sidebar": {
        "assign": "Assign Dimension",
        "copy": "Copy Dimension",
        "destroy": "Delete Dimension",
        "disable": "Disable Dimension",
        "edit": "Edit Dimension",
        "enable": "Enable Dimension",
        "new": "New Dimension",
        "title": "Dimension's options (#%{id})"
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
        "header": "Edit factor"
      },
      "index": {
        "title": "Factors",
        "tooltips": {
          "create": "Create"
        }
      },
      "new": {
        "header": "New factor"
      },
      "resource": {
        "confirmations": {
          "delete": {
            "body": "<p>Are you sure you want to delete this Factor?</p>",
            "title": "Delete <strong>Factor</strong> ?"
          }
        },
        "tooltips": {
          "copy": "Copy Factor",
          "delete": "Delete Factor",
          "edit": "Edit Factor"
        }
      },
      "sidebar": {
        "copy": "Copy Factor",
        "destroy": "Delete Factor",
        "edit": "Edit Factor",
        "title": "Factor's options (#%{id})"
      },
      "toggle_status": {
        "successfully": "Factor was successfully updated."
      }
    },
    "home": {
      "index": {
        "notifications": "Notifications"
      }
    },
    "imports": {
      "csv": {
        "not_valid": "[Row %{row}] %{error}"
      },
      "errors": {
        "norm": {
          "factor_is_not_described": "[#%{coords}] factor %{factor} is not described above"
        }
      },
      "form": {
        "import": "Import"
      },
      "new": {
        "header": "Import"
      }
    },
    "meta_title": "Administration panel",
    "navigation": {
      "assessments": "Assessments",
      "client": "Client Tenancy",
      "clients": "Clients",
      "create": "Create",
      "design": "Design",
      "dimension": "Dimension",
      "dimensions": "Dimensions",
      "factors": "Factors",
      "home": "Dashboard",
      "norm": "Norm",
      "norms": "Norms",
      "norms_editor": "Norm Editor",
      "reporting": "Reporting",
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
        "header": "Edit norm"
      },
      "editor": {
        "factors": "Factors",
        "inplace_title": "Enter value",
        "sub_factors": "Sub Factors",
        "title": "Norm Editor"
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
            "body": "<p>Are you sure you want to delete this norm?</p>\n",
            "title": "Delete <strong>Norm</strong> ?"
          }
        },
        "tooltips": {
          "copy": "Copy Norm",
          "delete": "Delete Norm",
          "edit": "Edit Norm"
        }
      },
      "sidebar": {
        "assign": "Assign Norm",
        "copy": "Copy Norm",
        "destroy": "Delete Norm",
        "disable": "Disable",
        "edit": "Edit Norm",
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
    "profiles": {
      "edit": {
        "success": "Profile was successfully updated.",
        "title": "Profile Editor"
      }
    },
    "psychometrics": "Psychometrics",
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
        "header": "Edit Sub-Factor"
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
          "edit": "Edit Sub-Factor"
        }
      },
      "sidebar": {
        "destroy": "Delete Sub-Factor",
        "edit": "Edit Sub-Factor",
        "title": "Sub-Factor's options (#%{id})"
      },
      "toggle_status": {
        "successfully": "Sub-Factor was successfully updated."
      }
    },
    "update": "Update",
    "users": {
      "create": {
        "successfully": "User %{name} was successfully created."
      },
      "destroy": {
        "successfully": "User %{name} was successfully destroyed."
      },
      "edit": {
        "title": "Edit user"
      },
      "form": {
        "choose": " - Choose - "
      },
      "index": {
        "filterrific": {
          "with_role": {
            "administrators": "Administrators",
            "all": "All",
            "users": "Users"
          }
        },
        "title": "Users",
        "tooltips": {
          "create": "Create",
          "export": "Export",
          "import": "Import"
        }
      },
      "list": null,
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
            "body": "<p>Are you sure you want to delete this user?</p>\n",
            "title": "Delete <strong>%{name}</strong> ?"
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
        "destroy": "Delete user",
        "disable": "Disable",
        "edit_user": "Edit user",
        "email": "Send mail",
        "enable": "Enable",
        "export_users": "Export users",
        "import_users": "Import users",
        "login_as_user": "Login as user",
        "new_user": "New user",
        "reset_password": "Change password",
        "title": "User's options (#%{id})",
        "view_report": "View user report"
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
      "confirmation": "doesn't match %{attribute}",
      "confirmation_period_expired": "needs to be confirmed within %{period}, please request a new one",
      "empty": "can't be empty",
      "equal_to": "must be equal to %{count}",
      "even": "must be even",
      "excluded_file_content_types": "file cannot be %{types}",
      "exclusion": "is reserved",
      "expired": "has expired, please request a new one",
      "file_size_is_greater_than": "file size must be greater than %{count}",
      "file_size_is_greater_than_or_equal_to": "file size must be greater than or equal to %{count}",
      "file_size_is_in": "file size must be between %{min} and %{max}",
      "file_size_is_less_than": "file size must be less than %{count}",
      "file_size_is_less_than_or_equal_to": "file size must be less than or equal to %{count}",
      "greater_than": "must be greater than %{count}",
      "greater_than_or_equal_to": "must be greater than or equal to %{count}",
      "in_between": "must be in between %{min} and %{max}",
      "inclusion": "is not included in the list",
      "invalid": "is invalid",
      "less_than": "must be less than %{count}",
      "less_than_or_equal_to": "must be less than or equal to %{count}",
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
      "spoofed_media_type": "has contents that are not what they are reported to be",
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
  "simple_form": {
    "error_notification": {
      "default_message": "Please review the problems below:"
    },
    "no": "No",
    "placeholders": {
      "administrator": {
        "active": "Active",
        "created_at": "Created",
        "current_password": "Current password",
        "disabled": "Disable",
        "email": "E-mail",
        "first_name": "First Name",
        "id": "ID",
        "last_name": "Last Name",
        "memberships": "Memberships",
        "password": "Password",
        "password_confirmation": "Password confirmation",
        "role": "Role",
        "roles": {
          "admin": "Client Admin",
          "manager": "Manager",
          "superadmin": "Super Admin",
          "user": "User"
        },
        "updated_at": "Modified"
      },
      "assessment": {
        "active": "Active",
        "category": "Category",
        "created_at": "Created",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified"
      },
      "client": {
        "category": "Category",
        "created_at": "Created",
        "id": "ID",
        "licenses": "License number",
        "licenses_expire": "License expire",
        "licenses_used": "Used license number",
        "logo": "Client logo",
        "name": "Name",
        "subdomain": "Subdomain",
        "updated_at": "Modified"
      },
      "dimension": {
        "active": "Active",
        "created_at": "Created",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified"
      },
      "factor": {
        "active": "Active",
        "created_at": "Created",
        "id": "ID",
        "name": "Name",
        "parent_id": "Parent",
        "questions_count": "No. Questions",
        "subfactors_count": "No. Sub-Factors",
        "updated_at": "Modified"
      },
      "norm": {
        "active": "Active",
        "created_at": "Created",
        "id": "ID",
        "name": "Name",
        "updated_at": "Modified",
        "updated_by": "Edited by"
      },
      "user": {
        "active": "Active",
        "created_at": "Created",
        "current_password": "Current password",
        "disabled": "Disable",
        "email": "E-mail",
        "first_name": "First Name",
        "id": "ID",
        "last_name": "Last Name",
        "memberships": "Memberships",
        "password": "Password",
        "password_confirmation": "Password confirmation",
        "role": "Role",
        "roles": {
          "admin": "Client Admin",
          "manager": "Manager",
          "superadmin": "Super Admin",
          "user": "User"
        },
        "updated_at": "Modified"
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
      "default": "%a, %d %b %Y %H:%M:%S %z",
      "devise": {
        "mailer": {
          "invitation_instructions": {
            "accept_until_format": "%B %d, %Y %I:%M %p"
          }
        }
      },
      "long": "%B %d, %Y %H:%M",
      "short": "%d %b %H:%M"
    },
    "pm": "pm"
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
